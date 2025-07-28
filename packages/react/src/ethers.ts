import type { SigningError, TimeoutError, UnexpectedError } from '@aave/client';
import { sendTransactionAndWait } from '@aave/client/ethers';
import type { TransactionRequest } from '@aave/graphql';
import { invariant, type TxHash } from '@aave/types';
import type { Signer } from 'ethers';
import { useAaveClient } from './context';
import { type UseAsyncTask, useAsyncTask } from './helpers';

export type TransactionError = SigningError | TimeoutError | UnexpectedError;

/**
 * A hook that provides a way to send Aave transactions using an ethers Signer instance.
 *
 * First, get the `Signer` instance from your ethers provider, then pass it to this hook to create a function that can be used to send transactions.
 *
 * ```ts
 * const provider = new ethers.providers.Web3Provider(window.ethereum);
 * const signer = provider.getSigner();
 *
 * // …
 *
 * const [sendTransaction, { loading, error, data }] = useSendTransaction(signer);
 * ```
 *
 * Then, use it to send a {@link TransactionRequest} as shown below.
 *
 * ```ts
 * const [toggle, { loading, error, data }] = useEModeToggle();
 *
 * const run = async () => {
 *   const result = await toggle({
 *     chainId: chainId(1), // Ethereum mainnet
 *     market: evmAddress('0x1234…'),
 *     user: evmAddress(account.address!),
 *   })
 *     .andThen(sendTransaction);
 *
 *   if (result.isErr()) {
 *     console.error(`Failed to sign the transaction: ${error.message}`);
 *     return;
 *   }
 *
 *   console.log('Transaction sent with hash:', result.value);
 * };
 * ```
 *
 * Or use it to handle an {@link ExecutionPlan} that may require multiple transactions as shown below.
 *
 * ```ts
 * const [supply, { loading, error, data }] = useSupply();
 *
 * const run = async () => {
 *   const result = await supply({
 *     chainId: chainId(1), // Ethereum mainnet
 *     market: evmAddress('0x1234…'),
 *     amount: {
 *       erc20: {
 *         currency: evmAddress('0x5678…'),
 *         value: '42.42',
 *       }
 *     },
 *     supplier: evmAddress(account.address!),
 *   })
 *     .andThen((plan) => {
 *       switch (plan.__typename) {
 *         case 'TransactionRequest':
 *           return sendTransaction(plan);
 *
 *         case 'ApprovalRequired':
 *           return sendTransaction(plan.approval).andThen(() =>
 *             sendTransaction(plan.originalTransaction),
 *           );
 *
 *         case 'InsufficientBalanceError':
 *           return errAsync(new Error(`Insufficient balance: ${error.cause.required.value} required.`));
 *        }
 *      });
 *
 *    if (result.isErr()) {
 *      switch (error.name) {
 *        case 'SigningError':
 *          console.error(`Failed to sign the transaction: ${error.message}`);
 *          break;
 *
 *        case 'UnexpectedError':
 *          console.error(`Unexpected error: ${error.message}`);
 *          break;
 *      }
 *      return;
 *    }
 *
 *    console.log('Transaction sent with hash:', result.value);
 * }
 * ```
 *
 * @param signer - The ethers Signer to use for sending transactions.
 */
export function useSendTransaction(
  signer: Signer | undefined,
): UseAsyncTask<TransactionRequest, TxHash, TransactionError> {
  const client = useAaveClient();

  return useAsyncTask((request: TransactionRequest) => {
    invariant(signer, 'Expected a Signer to handle the operation result.');

    return sendTransactionAndWait(signer, request).andThen(
      client.waitForTransaction,
    );
  });
}
