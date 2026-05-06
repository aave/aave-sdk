import type { ChainId, UnexpectedError } from '@aave/client';
import { savingsGhoDeposit, savingsGhoWithdraw } from '@aave/client/actions';
import type {
  ExecutionPlan,
  MeritSavingsGhoIncentive,
  SavingsGhoBalanceRequest,
  SavingsGhoDepositRequest,
  SavingsGhoWithdrawRequest,
  TokenAmount,
} from '@aave/graphql';
import {
  SavingsGhoBalanceQuery,
  SavingsGhoIncentiveQuery,
} from '@aave/graphql';
import { useAaveClient } from './context';
import type {
  ReadResult,
  Suspendable,
  SuspendableResult,
  SuspenseResult,
} from './helpers';
import {
  type UseAsyncTask,
  useAsyncTask,
  useSuspendableQuery,
} from './helpers';

export type SavingsGhoBalanceArgs = SavingsGhoBalanceRequest;
export type SavingsGhoIncentiveArgs = {
  chainId?: ChainId;
};

/**
 * Fetches the current sGHO balance for a user.
 *
 * This signature supports React Suspense:
 *
 * ```tsx
 * const { data } = useSavingsGhoBalance({
 *   user: evmAddress('0x742d35cc…'),
 *   suspense: true,
 * });
 * ```
 */
export function useSavingsGhoBalance(
  args: SavingsGhoBalanceArgs & Suspendable,
): SuspenseResult<TokenAmount>;

/**
 * Fetches the current sGHO balance for a user.
 *
 * ```tsx
 * const { data, error, loading } = useSavingsGhoBalance({
 *   user: evmAddress('0x742d35cc…'),
 * });
 * ```
 */
export function useSavingsGhoBalance(
  args: SavingsGhoBalanceArgs,
): ReadResult<TokenAmount>;

export function useSavingsGhoBalance({
  suspense = false,
  ...request
}: SavingsGhoBalanceArgs & {
  suspense?: boolean;
}): SuspendableResult<TokenAmount> {
  return useSuspendableQuery({
    document: SavingsGhoBalanceQuery,
    variables: {
      request,
    },
    suspense,
  });
}

/**
 * Fetches the active Merit APR incentive for sGHO.
 *
 * This signature supports React Suspense:
 *
 * ```tsx
 * const { data } = useSavingsGhoIncentive({
 *   chainId: chainId(1),
 *   suspense: true,
 * });
 * ```
 */
export function useSavingsGhoIncentive(
  args: SavingsGhoIncentiveArgs & Suspendable,
): SuspenseResult<MeritSavingsGhoIncentive | null>;

/**
 * Fetches the active Merit APR incentive for sGHO.
 *
 * ```tsx
 * const { data, error, loading } = useSavingsGhoIncentive({
 *   chainId: chainId(1),
 * });
 * ```
 */
export function useSavingsGhoIncentive(
  args?: SavingsGhoIncentiveArgs,
): ReadResult<MeritSavingsGhoIncentive | null>;

export function useSavingsGhoIncentive({
  suspense = false,
  chainId,
}: SavingsGhoIncentiveArgs & {
  suspense?: boolean;
} = {}): SuspendableResult<MeritSavingsGhoIncentive | null> {
  return useSuspendableQuery({
    document: SavingsGhoIncentiveQuery,
    variables: {
      chainId,
    },
    suspense,
  });
}

/**
 * A hook that provides a way to withdraw sGHO.
 *
 * ```ts
 * const [withdraw, withdrawing] = useSavingsGhoWithdraw();
 * const [sendTransaction, sending] = useSendTransaction(wallet);
 *
 * const loading = withdrawing.loading && sending.loading;
 * const error = withdrawing.error || sending.error;
 *
 * // …
 *
 * const result = await withdraw({ ... })
 *   .andThen((plan) => {
 *     switch (plan.__typename) {
 *       case 'TransactionRequest':
 *         return sendTransaction(plan);
 *
 *       case 'ApprovalRequired':
 *         return sendTransaction(plan.approval)
 *           .andThen(() => sendTransaction(plan.originalTransaction));
 *
 *       case 'InsufficientBalanceError':
 *         return errAsync(
 *           new Error(`Insufficient balance to withdraw: ${plan.required.value} is the maximum withdrawal allowed.`)
 *         );
 *     }
 *   });
 *
 * if (result.isErr()) {
 *   console.error(result.error);
 *   return;
 * }
 *
 * console.log('Transaction sent with hash:', result.value);
 * ```
 */
export function useSavingsGhoWithdraw(): UseAsyncTask<
  SavingsGhoWithdrawRequest,
  ExecutionPlan,
  UnexpectedError
> {
  const client = useAaveClient();

  return useAsyncTask((request: SavingsGhoWithdrawRequest) =>
    savingsGhoWithdraw(client, request),
  );
}

/**
 * A hook that provides a way to deposit GHO into sGHO.
 *
 * ```ts
 * const [deposit, depositing] = useSavingsGhoDeposit();
 * const [sendTransaction, sending] = useSendTransaction(wallet);
 *
 * const loading = depositing.loading && sending.loading;
 * const error = depositing.error || sending.error;
 *
 * // …
 *
 * const result = await deposit({ ... })
 *   .andThen((plan) => {
 *     switch (plan.__typename) {
 *       case 'TransactionRequest':
 *         return sendTransaction(plan);
 *
 *       case 'ApprovalRequired':
 *         return sendTransaction(plan.approval)
 *           .andThen(() => sendTransaction(plan.originalTransaction));
 *
 *       case 'InsufficientBalanceError':
 *         return errAsync(
 *           new Error(`Insufficient balance: ${plan.required.value} required.`)
 *         );
 *     }
 *   });
 *
 * if (result.isErr()) {
 *   console.error(result.error);
 *   return;
 * }
 *
 * console.log('Transaction sent with hash:', result.value);
 * ```
 */
export function useSavingsGhoDeposit(): UseAsyncTask<
  SavingsGhoDepositRequest,
  ExecutionPlan,
  UnexpectedError
> {
  const client = useAaveClient();

  return useAsyncTask((request: SavingsGhoDepositRequest) =>
    savingsGhoDeposit(client, request),
  );
}
