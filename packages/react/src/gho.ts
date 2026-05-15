import type { UnexpectedError } from '@aave/client';
import {
  savingsGhoDeposit,
  savingsGhoWithdraw,
  sghoVaultDeposit,
  sghoVaultRedeemShares,
} from '@aave/client/actions';
import type {
  DecimalValue,
  ExecutionPlan,
  SavingsGhoBalanceRequest,
  SavingsGhoDepositRequest,
  SavingsGhoWithdrawRequest,
  SghoVault,
  SghoVaultDepositRequest,
  SghoVaultPreviewDepositRequest,
  SghoVaultPreviewRedeemRequest,
  SghoVaultRedeemSharesRequest,
  SghoVaultRequest,
  TokenAmount,
} from '@aave/graphql';
import {
  SavingsGhoBalanceQuery,
  SghoVaultPreviewDepositQuery,
  SghoVaultPreviewRedeemQuery,
  SghoVaultQuery,
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

export type UseSghoVaultArgs = SghoVaultRequest;

/**
 * Fetches the current state of the sGHO ERC-4626 vault.
 *
 * This signature supports React Suspense:
 *
 * ```tsx
 * const { data } = useSghoVault({
 *   chainId: chainId(1),
 *   user: evmAddress('0x742d35cc…'),
 *   suspense: true,
 * });
 * ```
 */
export function useSghoVault(
  args: UseSghoVaultArgs & Suspendable,
): SuspenseResult<SghoVault>;

/**
 * Fetches the current state of the sGHO ERC-4626 vault.
 *
 * ```tsx
 * const { data, error, loading } = useSghoVault({
 *   chainId: chainId(1),
 *   user: evmAddress('0x742d35cc…'),
 * });
 * ```
 */
export function useSghoVault(args: UseSghoVaultArgs): ReadResult<SghoVault>;

export function useSghoVault({
  suspense = false,
  ...request
}: UseSghoVaultArgs & {
  suspense?: boolean;
}): SuspendableResult<SghoVault> {
  return useSuspendableQuery({
    document: SghoVaultQuery,
    variables: { request },
    suspense,
  });
}

export type UseSghoVaultPreviewDepositArgs = SghoVaultPreviewDepositRequest;

/**
 * Returns the number of sGHO shares that would be minted for a given GHO deposit amount.
 *
 * This signature supports React Suspense:
 *
 * ```tsx
 * const { data } = useSghoVaultPreviewDeposit({
 *   amount: '1000',
 *   chainId: chainId(1),
 *   suspense: true,
 * });
 * ```
 */
export function useSghoVaultPreviewDeposit(
  args: UseSghoVaultPreviewDepositArgs & Suspendable,
): SuspenseResult<DecimalValue>;

/**
 * Returns the number of sGHO shares that would be minted for a given GHO deposit amount.
 *
 * ```tsx
 * const { data, error, loading } = useSghoVaultPreviewDeposit({
 *   amount: '1000',
 *   chainId: chainId(1),
 * });
 * ```
 */
export function useSghoVaultPreviewDeposit(
  args: UseSghoVaultPreviewDepositArgs,
): ReadResult<DecimalValue>;

export function useSghoVaultPreviewDeposit({
  suspense = false,
  ...request
}: UseSghoVaultPreviewDepositArgs & {
  suspense?: boolean;
}): SuspendableResult<DecimalValue> {
  return useSuspendableQuery({
    document: SghoVaultPreviewDepositQuery,
    variables: { request },
    suspense,
  });
}

export type UseSghoVaultPreviewRedeemArgs = SghoVaultPreviewRedeemRequest;

/**
 * Returns the amount of GHO that would be received for redeeming a given number of sGHO shares.
 *
 * This signature supports React Suspense:
 *
 * ```tsx
 * const { data } = useSghoVaultPreviewRedeem({
 *   amount: '1000',
 *   chainId: chainId(1),
 *   suspense: true,
 * });
 * ```
 */
export function useSghoVaultPreviewRedeem(
  args: UseSghoVaultPreviewRedeemArgs & Suspendable,
): SuspenseResult<DecimalValue>;

/**
 * Returns the amount of GHO that would be received for redeeming a given number of sGHO shares.
 *
 * ```tsx
 * const { data, error, loading } = useSghoVaultPreviewRedeem({
 *   amount: '1000',
 *   chainId: chainId(1),
 * });
 * ```
 */
export function useSghoVaultPreviewRedeem(
  args: UseSghoVaultPreviewRedeemArgs,
): ReadResult<DecimalValue>;

export function useSghoVaultPreviewRedeem({
  suspense = false,
  ...request
}: UseSghoVaultPreviewRedeemArgs & {
  suspense?: boolean;
}): SuspendableResult<DecimalValue> {
  return useSuspendableQuery({
    document: SghoVaultPreviewRedeemQuery,
    variables: { request },
    suspense,
  });
}

/**
 * A hook that provides a way to deposit GHO into the sGHO ERC-4626 vault.
 *
 * ```ts
 * const [deposit, depositing] = useSghoVaultDeposit();
 * const [sendTransaction, sending] = useSendTransaction(wallet);
 *
 * const loading = depositing.loading && sending.loading;
 * const error = depositing.error || sending.error;
 *
 * // …
 *
 * const result = await deposit({
 *   amount: { value: '1000' },
 *   depositor: evmAddress('0x9abc…'),
 *   chainId: chainId(1),
 * }).andThen((plan) => {
 *   switch (plan.__typename) {
 *     case 'TransactionRequest':
 *       return sendTransaction(plan);
 *
 *     case 'ApprovalRequired':
 *       return sendTransaction(plan.approval)
 *         .andThen(() => sendTransaction(plan.originalTransaction));
 *
 *     case 'InsufficientBalanceError':
 *       return errAsync(
 *         new Error(`Insufficient balance: ${plan.required.value} required.`)
 *       );
 *   }
 * });
 *
 * if (result.isErr()) {
 *   console.error(result.error);
 *   return;
 * }
 *
 * console.log('Transaction sent with hash:', result.value);
 * ```
 */
export function useSghoVaultDeposit(): UseAsyncTask<
  SghoVaultDepositRequest,
  ExecutionPlan,
  UnexpectedError
> {
  const client = useAaveClient();

  return useAsyncTask((request: SghoVaultDepositRequest) =>
    sghoVaultDeposit(client, request),
  );
}

/**
 * A hook that provides a way to redeem sGHO shares for GHO from the ERC-4626 vault.
 *
 * ```ts
 * const [redeemShares, redeeming] = useSghoVaultRedeemShares();
 * const [sendTransaction, sending] = useSendTransaction(wallet);
 *
 * const loading = redeeming.loading && sending.loading;
 * const error = redeeming.error || sending.error;
 *
 * // …
 *
 * const result = await redeemShares({
 *   amount: { maxRedeem: true },
 *   sharesOwner: evmAddress('0x9abc…'),
 *   chainId: chainId(1),
 * }).andThen((plan) => {
 *   switch (plan.__typename) {
 *     case 'TransactionRequest':
 *       return sendTransaction(plan);
 *
 *     case 'ApprovalRequired':
 *       return sendTransaction(plan.approval)
 *         .andThen(() => sendTransaction(plan.originalTransaction));
 *
 *     case 'InsufficientBalanceError':
 *       return errAsync(
 *         new Error(`Insufficient balance to redeem: ${plan.required.value} is the maximum redemption allowed.`)
 *       );
 *   }
 * });
 *
 * if (result.isErr()) {
 *   console.error(result.error);
 *   return;
 * }
 *
 * console.log('Transaction sent with hash:', result.value);
 * ```
 */
export function useSghoVaultRedeemShares(): UseAsyncTask<
  SghoVaultRedeemSharesRequest,
  ExecutionPlan,
  UnexpectedError
> {
  const client = useAaveClient();

  return useAsyncTask((request: SghoVaultRedeemSharesRequest) =>
    sghoVaultRedeemShares(client, request),
  );
}
