import type { UnexpectedError } from '@aave/client';
import {
  approveBorrowCreditDelegation,
  borrow,
  collateralToggle,
  liquidate,
  repay,
  supply,
  userSetEmode,
  vaultDeploy,
  vaultDeposit,
  vaultMintShares,
  vaultRedeemShares,
  vaultSetFee,
  vaultWithdraw,
  vaultWithdrawFees,
  withdraw,
} from '@aave/client/actions';
import type {
  ApproveBorrowCreditDelegatorRequest,
  BorrowRequest,
  CollateralToggleRequest,
  ExecutionPlan,
  LiquidateRequest,
  RepayRequest,
  SupplyRequest,
  TransactionRequest,
  UserSetEmodeRequest,
  VaultDeployRequest,
  VaultDepositRequest,
  VaultMintSharesRequest,
  VaultRedeemSharesRequest,
  VaultSetFeeRequest,
  VaultWithdrawFeesRequest,
  VaultWithdrawRequest,
  WithdrawRequest,
} from '@aave/graphql';
import { useAaveClient } from './context';
import { type UseAsyncTask, useAsyncTask } from './helpers';

/**
 * A hook that provides a way to supply assets to an Aave market.
 *
 * ```ts
 * const [supply, supplying] = useSupply();
 * const [sendTransaction, sending] = useSendTransaction(wallet);
 *
 * const loading = supplying.loading && sending.loading;
 * const error = supplying.error || sending.error;
 *
 * // …
 *
 * const result = await supply({ ... })
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
export function useSupply(): UseAsyncTask<
  SupplyRequest,
  ExecutionPlan,
  UnexpectedError
> {
  const client = useAaveClient();

  return useAsyncTask((request: SupplyRequest) => supply(client, request));
}

/**
 * A hook that provides a way to borrow assets from an Aave market.
 *
 * ```ts
 * const [borrow, borrowing] = useBorrow();
 * const [sendTransaction, sending] = useSendTransaction(wallet);
 *
 * const loading = borrowing.loading && sending.loading;
 * const error = borrowing.error || sending.error;
 *
 * // …
 *
 * const result = await borrow({ ... })
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
export function useBorrow(): UseAsyncTask<
  BorrowRequest,
  ExecutionPlan,
  UnexpectedError
> {
  const client = useAaveClient();

  return useAsyncTask((request: BorrowRequest) => borrow(client, request));
}

/**
 * A hook that provides a way to repay borrowed assets to an Aave market.
 *
 * ```ts
 * const [repay, repaying] = useRepay();
 * const [sendTransaction, sending] = useSendTransaction(wallet);
 *
 * const loading = repaying.loading && sending.loading;
 * const error = repaying.error || sending.error;
 *
 * // …
 *
 * const result = await repay({ ... })
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
export function useRepay(): UseAsyncTask<
  RepayRequest,
  ExecutionPlan,
  UnexpectedError
> {
  const client = useAaveClient();

  return useAsyncTask((request: RepayRequest) => repay(client, request));
}

/**
 * A hook that provides a way to withdraw supplied assets from an Aave market.
 *
 * ```ts
 * const [withdraw, withdrawing] = useWithdraw();
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
export function useWithdraw(): UseAsyncTask<
  WithdrawRequest,
  ExecutionPlan,
  UnexpectedError
> {
  const client = useAaveClient();

  return useAsyncTask((request: WithdrawRequest) => withdraw(client, request));
}

/**
 * A hook that provides a way to set eMode for a user.
 *
 * ```ts
 * const [setUserEMode, setting] = useUserEMode();
 * const [sendTransaction, sending] = useSendTransaction(wallet);
 *
 * const loading = setting.loading && sending.loading;
 * const error = setting.error || sending.error;
 *
 * // …
 *
 * const result = await setUserEMode({ ... })
 *   .andThen(sendTransaction);
 *
 * if (result.isErr()) {
 *   console.error(result.error);
 *   return;
 * }
 *
 * console.log('Transaction sent with hash:', result.value);
 * ```
 */
export function useUserEMode(): UseAsyncTask<
  UserSetEmodeRequest,
  TransactionRequest,
  UnexpectedError
> {
  const client = useAaveClient();

  return useAsyncTask((request: UserSetEmodeRequest) =>
    userSetEmode(client, request),
  );
}

/**
 * A hook that provides a way to enable/disable a specific supplied asset as collateral.
 *
 * ```ts
 * const [toggle, toggling] = useCollateralToggle();
 * const [sendTransaction, sending] = useSendTransaction(wallet);
 *
 * const loading = toggling.loading && sending.loading;
 * const error = toggling.error || sending.error;
 *
 * // …
 *
 * const result = await toggle({ ... })
 *   .andThen(sendTransaction);
 *
 * if (result.isErr()) {
 *   console.error(result.error);
 *   return;
 * }
 *
 * console.log('Transaction sent with hash:', result.value);
 * ```
 */
export function useCollateralToggle(): UseAsyncTask<
  CollateralToggleRequest,
  TransactionRequest,
  UnexpectedError
> {
  const client = useAaveClient();

  return useAsyncTask((request: CollateralToggleRequest) =>
    collateralToggle(client, request),
  );
}

/**
 * A hook that provides a way to liquidate a non-healthy position with Health Factor below 1.
 *
 * ```ts
 * const [liquidate, liquidating] = useLiquidate();
 * const [sendTransaction, sending] = useSendTransaction(wallet);
 *
 * const loading = liquidating.loading && sending.loading;
 * const error = liquidating.error || sending.error;
 *
 * // …
 *
 * const result = await liquidate({ ... })
 *   .andThen(sendTransaction);
 *
 * if (result.isErr()) {
 *   console.error(result.error);
 *   return;
 * }
 *
 * console.log('Transaction sent with hash:', result.value);
 * ```
 */
export function useLiquidate(): UseAsyncTask<
  LiquidateRequest,
  TransactionRequest,
  UnexpectedError
> {
  const client = useAaveClient();

  return useAsyncTask((request: LiquidateRequest) =>
    liquidate(client, request),
  );
}

/**
 * A hook that provides a way to deposit assets into a vault.
 *
 * ```ts
 * const [deposit, depositing] = useVaultDeposit();
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
export function useVaultDeposit(): UseAsyncTask<
  VaultDepositRequest,
  ExecutionPlan,
  UnexpectedError
> {
  const client = useAaveClient();

  return useAsyncTask((request: VaultDepositRequest) =>
    vaultDeposit(client, request),
  );
}

/**
 * A hook that provides a way to mint vault shares.
 *
 * ```ts
 * const [mint, minting] = useVaultMintShares();
 * const [sendTransaction, sending] = useSendTransaction(wallet);
 *
 * const loading = minting.loading && sending.loading;
 * const error = minting.error || sending.error;
 *
 * // …
 *
 * const result = await mint({ ... })
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
export function useVaultMintShares(): UseAsyncTask<
  VaultMintSharesRequest,
  ExecutionPlan,
  UnexpectedError
> {
  const client = useAaveClient();

  return useAsyncTask((request: VaultMintSharesRequest) =>
    vaultMintShares(client, request),
  );
}

/**
 * A hook that provides a way to redeem vault shares.
 *
 * ```ts
 * const [redeem, redeeming] = useVaultRedeemShares();
 * const [sendTransaction, sending] = useSendTransaction(wallet);
 *
 * const loading = redeeming.loading && sending.loading;
 * const error = redeeming.error || sending.error;
 *
 * // …
 *
 * const result = await redeem({ ... })
 *   .andThen(sendTransaction);
 *
 * if (result.isErr()) {
 *   console.error(result.error);
 *   return;
 * }
 *
 * console.log('Transaction sent with hash:', result.value);
 * ```
 */
export function useVaultRedeemShares(): UseAsyncTask<
  VaultRedeemSharesRequest,
  TransactionRequest,
  UnexpectedError
> {
  const client = useAaveClient();

  return useAsyncTask((request: VaultRedeemSharesRequest) =>
    vaultRedeemShares(client, request),
  );
}

/**
 * A hook that provides a way to withdraw assets from a vault.
 *
 * ```ts
 * const [withdraw, withdrawing] = useVaultWithdraw();
 * const [sendTransaction, sending] = useSendTransaction(wallet);
 *
 * const loading = withdrawing.loading && sending.loading;
 * const error = withdrawing.error || sending.error;
 *
 * // …
 *
 * const result = await withdraw({ ... })
 *   .andThen(sendTransaction);
 *
 * if (result.isErr()) {
 *   console.error(result.error);
 *   return;
 * }
 *
 * console.log('Transaction sent with hash:', result.value);
 * ```
 */
export function useVaultWithdraw(): UseAsyncTask<
  VaultWithdrawRequest,
  TransactionRequest,
  UnexpectedError
> {
  const client = useAaveClient();

  return useAsyncTask((request: VaultWithdrawRequest) =>
    vaultWithdraw(client, request),
  );
}

/**
 * A hook that provides a way to deploy a vault.
 *
 * ```ts
 * const [deploy, deploying] = useVaultDeploy();
 * const [sendTransaction, sending] = useSendTransaction(wallet);
 *
 * const loading = deploying.loading && sending.loading;
 * const error = deploying.error || sending.error;
 *
 * // …
 *
 * const result = await deploy({ ... })
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
export function useVaultDeploy(): UseAsyncTask<
  VaultDeployRequest,
  ExecutionPlan,
  UnexpectedError
> {
  const client = useAaveClient();

  return useAsyncTask((request: VaultDeployRequest) =>
    vaultDeploy(client, request),
  );
}

/**
 * A hook that provides a way to set vault fee.
 *
 * ```ts
 * const [setFee, setting] = useVaultSetFee();
 * const [sendTransaction, sending] = useSendTransaction(wallet);
 *
 * const loading = setting.loading && sending.loading;
 * const error = setting.error || sending.error;
 *
 * // …
 *
 * const result = await setFee({ ... })
 *   .andThen(sendTransaction);
 *
 * if (result.isErr()) {
 *   console.error(result.error);
 *   return;
 * }
 *
 * console.log('Transaction sent with hash:', result.value);
 * ```
 */
export function useVaultSetFee(): UseAsyncTask<
  VaultSetFeeRequest,
  TransactionRequest,
  UnexpectedError
> {
  const client = useAaveClient();

  return useAsyncTask((request: VaultSetFeeRequest) =>
    vaultSetFee(client, request),
  );
}

/**
 * A hook that provides a way to withdraw vault fees.
 *
 * ```ts
 * const [withdraw, withdrawing] = useVaultWithdrawFees();
 * const [sendTransaction, sending] = useSendTransaction(wallet);
 *
 * const loading = withdrawing.loading && sending.loading;
 * const error = withdrawing.error || sending.error;
 *
 * // …
 *
 * const result = await withdraw({ ... })
 *   .andThen(sendTransaction);
 *
 * if (result.isErr()) {
 *   console.error(result.error);
 *   return;
 * }
 *
 * console.log('Transaction sent with hash:', result.value);
 * ```
 */
export function useVaultWithdrawFees(): UseAsyncTask<
  VaultWithdrawFeesRequest,
  TransactionRequest,
  UnexpectedError
> {
  const client = useAaveClient();

  return useAsyncTask((request: VaultWithdrawFeesRequest) =>
    vaultWithdrawFees(client, request),
  );
}

/**
 * A hook that provides a way to approve a credit borrow delegator to be able to borrow on your behalf.
 *
 * ```ts
 * const [approve, approving] = useApproveBorrowCreditDelegation();
 * const [sendTransaction, sending] = useSendTransaction(wallet);
 *
 * const loading = approving.loading && sending.loading;
 * const error = approving.error || sending.error;
 *
 * // …
 *
 * const result = await approve({
 *   market: evmAddress('0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2'),
 *   underlyingToken: evmAddress('0xa0b86a33e6441c8c5f0bb9b7e5e1f8bbf5b78b5c'),
 *   amount: '1000',
 *   user: evmAddress('0x742d35cc6e5c4ce3b69a2a8c7c8e5f7e9a0b1234'),
 *   delegatee: evmAddress('0x5678…'),
 *   chainId: chainId(1),
 * }).andThen(sendTransaction);
 *
 * if (result.isErr()) {
 *   console.error(result.error);
 *   return;
 * }
 *
 * console.log('Transaction sent with hash:', result.value);
 * ```
 */
export function useApproveBorrowCreditDelegation(): UseAsyncTask<
  ApproveBorrowCreditDelegatorRequest,
  TransactionRequest,
  UnexpectedError
> {
  const client = useAaveClient();

  return useAsyncTask((request: ApproveBorrowCreditDelegatorRequest) =>
    approveBorrowCreditDelegation(client, request),
  );
}
