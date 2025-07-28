import {
  type SigningError,
  type TimeoutError,
  UnexpectedError,
} from '@aave/client';
import { sendTransactionAndWait, supportedChains } from '@aave/client/viem';
import type { TransactionRequest } from '@aave/graphql';
import { invariant, ResultAsync, type TxHash } from '@aave/types';
import { useWallets } from '@privy-io/react-auth';
import { createWalletClient, custom } from 'viem';
import { useAaveClient } from './context';
import { type UseAsyncTask, useAsyncTask } from './helpers';

export type TransactionError = SigningError | TimeoutError | UnexpectedError;

/**
 * A hook that provides a way to send Aave transactions using a Privy wallet.
 *
 * First, use the `useSendTransaction` hook from `@aave/react/privy` entry point.
 *
 * ```ts
 * const [sendTransaction, { loading, error, data }] = useSendTransaction();
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
export function useSendTransaction(): UseAsyncTask<
  TransactionRequest,
  TxHash,
  TransactionError
> {
  const client = useAaveClient();
  const { wallets } = useWallets();

  return useAsyncTask((request: TransactionRequest) => {
    const wallet = wallets.find((wallet) => wallet.address === request.from);

    invariant(
      wallet,
      `Expected a connected wallet with address ${request.from} to be found.`,
    );

    return ResultAsync.fromPromise(
      wallet.switchChain(request.chainId),
      (error) => UnexpectedError.from(error),
    )
      .andTee(async () => wallet.switchChain(request.chainId))
      .map(() => wallet.getEthereumProvider())
      .andThen((provider) => {
        const walletClient = createWalletClient({
          account: request.from,
          chain: supportedChains[request.chainId],
          transport: custom(provider),
        });

        return sendTransactionAndWait(walletClient, request);
      })
      .andThen(client.waitForTransaction);
  });
}
