import {
  SigningError,
  type TimeoutError,
  type TransactionError,
  UnexpectedError,
} from '@aave/client';
import type { TransactionRequest } from '@aave/graphql';
import { ResultAsync, type TxHash, txHash } from '@aave/types';
import { defineChain, type ThirdwebClient } from 'thirdweb';
import {
  useSendAndConfirmTransaction,
  useSwitchActiveWalletChain,
} from 'thirdweb/react';
import { useAaveClient } from './context';
import { type UseAsyncTask, useAsyncTask } from './helpers/tasks';

export type SendTransactionError =
  | SigningError
  | TimeoutError
  | TransactionError
  | UnexpectedError;

/**
 * A hook that provides a way to send Aave transactions using a Thirdweb wallet.
 *
 * First, use the `useSendTransaction` hook from `@aave/react/thirdweb` entry point.
 *
 * ```ts
 * import { createThirdwebClient } from 'thirdweb';
 *
 * const thirdwebClient = createThirdwebClient({
 *   clientId: "<THIRDWEB_CLIENT_ID>",
 * });
 *
 * const [sendTransaction, { loading, error, data }] = useSendTransaction(thirdwebClient);
 * ```
 *
 * Then, use it to send a {@link TransactionRequest} as shown below.
 *
 * ```ts
 * const account = useActiveAccount(); // thirdweb hook
 *
 * const [toggle, { loading, error, data }] = useEModeToggle();
 *
 * const run = async () => {
 *   const result = await toggle({
 *     chainId: chainId(1), // Ethereum mainnet
 *     market: evmAddress('0x1234…'),
 *     user: evmAddress(account!.address),
 *   })
 *     .andThen(sendTransaction);
 *
 *   if (result.isErr()) {
 *     console.error(result.error);
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
 * const account = useActiveAccount(); // thirdweb hook
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
 *     supplier: evmAddress(account!.address),
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
 *   if (result.isErr()) {
 *     console.error(result.error);
 *     return;
 *   }
 *
 *   console.log('Transaction sent with hash:', result.value);
 * }
 * ```
 */
export function useSendTransaction(
  thirdwebClient: ThirdwebClient,
): UseAsyncTask<TransactionRequest, TxHash, SendTransactionError> {
  const client = useAaveClient();
  const switchChain = useSwitchActiveWalletChain();
  const { mutateAsync: sendAndConfirmTx } = useSendAndConfirmTransaction();

  return useAsyncTask((request: TransactionRequest) => {
    return ResultAsync.fromPromise(
      switchChain(defineChain({ id: request.chainId })),
      (err) => UnexpectedError.from(err),
    )
      .andThen(() =>
        ResultAsync.fromPromise(
          sendAndConfirmTx({
            to: request.to,
            data: request.data,
            value: request.value,
            chain: request.chainId,
            client: thirdwebClient,
          }),
          (err) => SigningError.from(err),
        ),
      )
      .map((tx) => ({
        operation: request.operation,
        txHash: txHash(tx.transactionHash),
      }))
      .andThen(client.waitForTransaction);
  });
}
