import type {
  SigningError,
  TimeoutError,
  TransactionError,
  UnexpectedError,
} from '@aave/client';
import { permitTypedData } from '@aave/client/actions';
import {
  sendTransactionAndWait,
  signERC20PermitWith,
} from '@aave/client/ethers';
import type {
  ERC712Signature,
  PermitTypedDataRequest,
  TransactionRequest,
} from '@aave/graphql';
import type { TxHash } from '@aave/types';
import type { Signer } from 'ethers';
import { useAaveClient } from './context';
import { type UseAsyncTask, useAsyncTask } from './helpers';

export type SendTransactionError =
  | SigningError
  | TimeoutError
  | TransactionError
  | UnexpectedError;

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
 *     user: evmAddress(await signer.getAddress()),
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
 *     supplier: evmAddress(await signer.getAddress()),
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
 * @param signer - The ethers Signer to use for sending transactions.
 */
export function useSendTransaction(
  signer: Signer,
): UseAsyncTask<TransactionRequest, TxHash, SendTransactionError> {
  const client = useAaveClient();

  return useAsyncTask((request: TransactionRequest) => {
    return sendTransactionAndWait(signer, request).andThen(
      client.waitForSupportedTransaction,
    );
  });
}

export type SignERC20PermitError = SigningError | UnexpectedError;

/**
 * A hook that provides a way to sign ERC20 permits using an ethers Signer instance.
 *
 * ```ts
 * const provider = new ethers.providers.Web3Provider(window.ethereum);
 * const signer = provider.getSigner();
 *
 * // …
 *
 * const [signERC20Permit, { loading, error, data }] = useERC20Permit(signer);
 *
 * const run = async () => {
 *   const result = await signERC20Permit({
 *     chainId: chainId(1), // Ethereum mainnet
 *     market: evmAddress('0x1234…'),
 *     underlyingToken: evmAddress('0x5678…'),
 *     amount: '42.42',
 *     spender: evmAddress('0x9abc…'),
 *     owner: evmAddress(await signer.getAddress()),
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
 *
 * @param signer - The ethers Signer to use for signing ERC20 permits.
 */
export function useERC20Permit(
  signer: Signer,
): UseAsyncTask<PermitTypedDataRequest, ERC712Signature, SignERC20PermitError> {
  const client = useAaveClient();

  return useAsyncTask((request: PermitTypedDataRequest) => {
    return permitTypedData(client, request).andThen(
      signERC20PermitWith(signer),
    );
  });
}
