import type { SigningError, UnexpectedError } from '@aave/client';
import { sendTransactionAndWait } from '@aave/client/viem';
import type { TransactionRequest } from '@aave/graphql';
import type { TxHash } from '@aave/types';
import { invariant } from '@aave/types';
import type { WalletClient } from 'viem';
import { type UseAsyncTask, useAsyncTask } from './helpers';

export type TransactionError = SigningError | UnexpectedError;

/**
 * A hook that provides a way to send Aave transactions using a viem WalletClient instance.
 *
 * First, use the `useWalletClient` wagmi hook to get the `WalletClient` instance, then pass it to this hook to create a function that can be used to send transactions.
 *
 * ```ts
 * const { data: wallet } = useWalletClient(); // wagmi hook
 *
 * const [sendTransaction, { loading, error, data }] = useSendTransaction(wallet);
 * ```
 *
 * Then, use it to send a {@link TransactionRequest} as shown below.
 *
 * ```ts
 * const account = useAccount(); // wagmi hook
 *
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
 * const account = useAccount(); // wagmi hook
 *
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
 * @param walletClient - The wallet client to use for sending transactions.
 */
export function useSendTransaction(
  walletClient: WalletClient | undefined,
): UseAsyncTask<TransactionRequest, TxHash, TransactionError> {
  return useAsyncTask((request: TransactionRequest) => {
    invariant(
      walletClient,
      'Expected a WalletClient to handle the operation result.',
    );

    return sendTransactionAndWait(walletClient, request);
  });
}
