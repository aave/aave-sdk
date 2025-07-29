import type {
  SigningError,
  TimeoutError,
  TransactionError,
  UnexpectedError,
} from '@aave/client';
import { permitTypedData } from '@aave/client/actions';
import { sendTransactionAndWait, signERC20PermitWith } from '@aave/client/viem';
import type {
  ERC712Signature,
  PermitTypedDataRequest,
  TransactionRequest,
} from '@aave/graphql';
import type { TxHash } from '@aave/types';
import { invariant } from '@aave/types';
import type { WalletClient } from 'viem';
import { useAaveClient } from './context';
import { type UseAsyncTask, useAsyncTask } from './helpers';

export type SendTransactionError =
  | SigningError
  | TimeoutError
  | TransactionError
  | UnexpectedError;

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
 *   if (result.isErr()) {
 *     console.error(result.error);
 *     return;
 *   }
 *
 *   console.log('Transaction sent with hash:', result.value);
 * }
 * ```
 *
 * @param walletClient - The wallet client to use for sending transactions.
 */
export function useSendTransaction(
  walletClient: WalletClient | undefined,
): UseAsyncTask<TransactionRequest, TxHash, SendTransactionError> {
  const client = useAaveClient();

  return useAsyncTask((request: TransactionRequest) => {
    invariant(
      walletClient,
      'Expected a WalletClient to handle the operation result.',
    );

    return sendTransactionAndWait(walletClient, request).andThen(
      client.waitForTransaction,
    );
  });
}

export type SignERC20PermitError = SigningError | UnexpectedError;

/**
 * A hook that provides a way to sign ERC20 permits using a viem WalletClient instance.
 *
 * ```ts
 * const { data: wallet } = useWalletClient(); // wagmi hook
 * const [signERC20Permit, { loading, error, data }] = useERC20Permit(wallet);
 *
 * const run = async () => {
 *   const result = await signERC20Permit({
 *     chainId: chainId(1), // Ethereum mainnet
 *     market: evmAddress('0x1234…'),
 *     user: evmAddress(account.address!),
 *   });
 *
 *   if (result.isErr()) {
 *     console.error(result.error);
 *     return;
 *   }
 *
 *   console.log('ERC20 permit signed:', result.value);
 * };
 * ```
 */
export function useERC20Permit(
  walletClient: WalletClient | undefined,
): UseAsyncTask<PermitTypedDataRequest, ERC712Signature, SignERC20PermitError> {
  const client = useAaveClient();

  return useAsyncTask((request: PermitTypedDataRequest) => {
    invariant(walletClient, 'Expected a WalletClient to sign ERC20 permits');

    return permitTypedData(client, request).andThen(
      signERC20PermitWith(walletClient),
    );
  });
}
