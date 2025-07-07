import type { UnexpectedError } from '@aave/client';
import {
  borrow,
  claimVaultRewards,
  collateralToggle,
  deployVault,
  eModeToggle,
  liquidate,
  mintVaultShares,
  redeemVaultShares,
  repay,
  setVaultFee,
  supply,
  vaultDeposit,
  withdraw,
  withdrawVault,
  withdrawVaultFees,
} from '@aave/client/actions';
import type {
  BorrowRequest,
  ClaimVaultRewardsRequest,
  CollateralToggleRequest,
  DeployVaultRequest,
  EModeToggleRequest,
  ExecutionPlan,
  LiquidateRequest,
  MintVaultSharesRequest,
  RedeemVaultSharesRequest,
  RepayRequest,
  SetVaultFeeRequest,
  SupplyRequest,
  TransactionRequest,
  VaultDepositRequest,
  WithdrawRequest,
  WithdrawVaultFeesRequest,
  WithdrawVaultRequest,
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
 * const data = supplying.data || sending.data;
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
 *     }
 *   });
 *
 * if (result.isErr()) {
 *   switch (error.name) {
 *     case 'SigningError':
 *       console.error(`Failed to sign the transaction: ${error.message}`);
 *       break;
 *
 *     case 'ValidationError':
 *       console.error(`Insufficient balance: ${error.cause.required.value} required.`);
 *       break;
 *   }
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
 * const data = borrowing.data || sending.data;
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
 *     }
 *   });
 *
 * if (result.isErr()) {
 *   switch (error.name) {
 *     case 'SigningError':
 *       console.error(`Failed to sign the transaction: ${error.message}`);
 *       break;
 *
 *     case 'ValidationError':
 *       console.error(`Insufficient balance: ${error.cause.required.value} required.`);
 *       break;
 *   }
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
 * const data = repaying.data || sending.data;
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
 *     }
 *   });
 *
 * if (result.isErr()) {
 *   switch (error.name) {
 *     case 'SigningError':
 *       console.error(`Failed to sign the transaction: ${error.message}`);
 *       break;
 *
 *     case 'ValidationError':
 *       console.error(`Insufficient balance: ${error.cause.required.value} required.`);
 *       break;
 *   }
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
 * const data = withdrawing.data || sending.data;
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
 *     }
 *   });
 *
 * if (result.isErr()) {
 *   switch (error.name) {
 *     case 'SigningError':
 *       console.error(`Failed to sign the transaction: ${error.message}`);
 *       break;
 *
 *     case 'ValidationError':
 *       console.error(`Insufficient balance: ${error.cause.required.value} required.`);
 *       break;
 *   }
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
 * A hook that provides a way to toggle eMode for a user in an Aave market.
 *
 * ```ts
 * const [toggleEMode, toggling] = useEModeToggle();
 * const [sendTransaction, sending] = useSendTransaction(wallet);
 *
 * const loading = toggling.loading && sending.loading;
 * const error = toggling.error || sending.error;
 * const data = toggling.data || sending.data;
 *
 * // …
 *
 * const result = await toggleEMode({ ... })
 *   .andThen(sendTransaction);
 *
 * if (result.isErr()) {
 *   console.error(`Failed to sign the transaction: ${error.message}`);
 *   return;
 * }
 *
 * console.log('Transaction sent with hash:', result.value);
 * ```
 */
export function useEModeToggle(): UseAsyncTask<
  EModeToggleRequest,
  TransactionRequest,
  UnexpectedError
> {
  const client = useAaveClient();

  return useAsyncTask((request: EModeToggleRequest) =>
    eModeToggle(client, request),
  );
}

/**
 * A hook that provides a way to enable/disable a specific supplied asset as collateral.
 *
 * ```ts
 * const [toggleCollateral, toggling] = useCollateralToggle();
 * const [sendTransaction, sending] = useSendTransaction(wallet);
 *
 * const loading = toggling.loading && sending.loading;
 * const error = toggling.error || sending.error;
 * const data = toggling.data || sending.data;
 *
 * // …
 *
 * const result = await toggleCollateral({ ... })
 *   .andThen(sendTransaction);
 *
 * if (result.isErr()) {
 *   console.error(`Failed to sign the transaction: ${error.message}`);
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
 * const data = liquidating.data || sending.data;
 *
 * // …
 *
 * const result = await liquidate({ ... })
 *   .andThen(sendTransaction);
 *
 * if (result.isErr()) {
 *   console.error(`Failed to sign the transaction: ${error.message}`);
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
 * A hook that provides a way to deposit assets into a vault and mint shares.
 *
 * ```ts
 * const [depositVault, depositing] = useVaultDeposit();
 * const [sendTransaction, sending] = useSendTransaction(wallet);
 *
 * const loading = depositing.loading && sending.loading;
 * const error = depositing.error || sending.error;
 * const data = depositing.data || sending.data;
 *
 * // …
 *
 * const result = await depositVault({ ... })
 *   .andThen((plan) => {
 *     switch (plan.__typename) {
 *       case 'TransactionRequest':
 *         return sendTransaction(plan);
 *
 *       case 'ApprovalRequired':
 *         return sendTransaction(plan.approval)
 *           .andThen(() => sendTransaction(plan.originalTransaction));
 *     }
 *   });
 *
 * if (result.isErr()) {
 *   switch (error.name) {
 *     case 'SigningError':
 *       console.error(`Failed to sign the transaction: ${error.message}`);
 *       break;
 *
 *     case 'ValidationError':
 *       console.error(`Insufficient balance: ${error.cause.required.value} required.`);
 *       break;
 *   }
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
 * A hook that provides a way to mint exact amount of vault shares by depositing calculated assets.
 *
 * ```ts
 * const [mintShares, minting] = useMintVaultShares();
 * const [sendTransaction, sending] = useSendTransaction(wallet);
 *
 * const loading = minting.loading && sending.loading;
 * const error = minting.error || sending.error;
 * const data = minting.data || sending.data;
 *
 * // …
 *
 * const result = await mintShares({ ... })
 *   .andThen((plan) => {
 *     switch (plan.__typename) {
 *       case 'TransactionRequest':
 *         return sendTransaction(plan);
 *
 *       case 'ApprovalRequired':
 *         return sendTransaction(plan.approval)
 *           .andThen(() => sendTransaction(plan.originalTransaction));
 *     }
 *   });
 *
 * if (result.isErr()) {
 *   switch (error.name) {
 *     case 'SigningError':
 *       console.error(`Failed to sign the transaction: ${error.message}`);
 *       break;
 *
 *     case 'ValidationError':
 *       console.error(`Insufficient balance: ${error.cause.required.value} required.`);
 *       break;
 *   }
 *   return;
 * }
 *
 * console.log('Transaction sent with hash:', result.value);
 * ```
 */
export function useMintVaultShares(): UseAsyncTask<
  MintVaultSharesRequest,
  ExecutionPlan,
  UnexpectedError
> {
  const client = useAaveClient();

  return useAsyncTask((request: MintVaultSharesRequest) =>
    mintVaultShares(client, request),
  );
}

/**
 * A hook that provides a way to redeem vault shares for underlying assets.
 *
 * ```ts
 * const [redeemShares, redeeming] = useRedeemVaultShares();
 * const [sendTransaction, sending] = useSendTransaction(wallet);
 *
 * const loading = redeeming.loading && sending.loading;
 * const error = redeeming.error || sending.error;
 * const data = redeeming.data || sending.data;
 *
 * // …
 *
 * const result = await redeemShares({ ... })
 *   .andThen(sendTransaction);
 *
 * if (result.isErr()) {
 *   console.error(`Failed to sign the transaction: ${error.message}`);
 *   return;
 * }
 *
 * console.log('Transaction sent with hash:', result.value);
 * ```
 */
export function useRedeemVaultShares(): UseAsyncTask<
  RedeemVaultSharesRequest,
  TransactionRequest,
  UnexpectedError
> {
  const client = useAaveClient();

  return useAsyncTask((request: RedeemVaultSharesRequest) =>
    redeemVaultShares(client, request),
  );
}

/**
 * A hook that provides a way to withdraw assets from a vault, burning shares.
 *
 * ```ts
 * const [withdrawFromVault, withdrawing] = useWithdrawVault();
 * const [sendTransaction, sending] = useSendTransaction(wallet);
 *
 * const loading = withdrawing.loading && sending.loading;
 * const error = withdrawing.error || sending.error;
 * const data = withdrawing.data || sending.data;
 *
 * // …
 *
 * const result = await withdrawFromVault({ ... })
 *   .andThen(sendTransaction);
 *
 * if (result.isErr()) {
 *   console.error(`Failed to sign the transaction: ${error.message}`);
 *   return;
 * }
 *
 * console.log('Transaction sent with hash:', result.value);
 * ```
 */
export function useWithdrawVault(): UseAsyncTask<
  WithdrawVaultRequest,
  TransactionRequest,
  UnexpectedError
> {
  const client = useAaveClient();

  return useAsyncTask((request: WithdrawVaultRequest) =>
    withdrawVault(client, request),
  );
}

/**
 * A hook that provides a way to deploy a new vault.
 *
 * ```ts
 * const [deploy, deploying] = useDeployVault();
 * const [sendTransaction, sending] = useSendTransaction(wallet);
 *
 * const loading = deploying.loading && sending.loading;
 * const error = deploying.error || sending.error;
 * const data = deploying.data || sending.data;
 *
 * // …
 *
 * const result = await deploy({ ... })
 *   .andThen(sendTransaction);
 *
 * if (result.isErr()) {
 *   console.error(`Failed to sign the transaction: ${error.message}`);
 *   return;
 * }
 *
 * console.log('Transaction sent with hash:', result.value);
 * ```
 */
export function useDeployVault(): UseAsyncTask<
  DeployVaultRequest,
  TransactionRequest,
  UnexpectedError
> {
  const client = useAaveClient();

  return useAsyncTask((request: DeployVaultRequest) =>
    deployVault(client, request),
  );
}

/**
 * A hook that provides a way to set the vault fee (owner only).
 *
 * ```ts
 * const [setFee, setting] = useSetVaultFee();
 * const [sendTransaction, sending] = useSendTransaction(wallet);
 *
 * const loading = setting.loading && sending.loading;
 * const error = setting.error || sending.error;
 * const data = setting.data || sending.data;
 *
 * // …
 *
 * const result = await setFee({ ... })
 *   .andThen(sendTransaction);
 *
 * if (result.isErr()) {
 *   console.error(`Failed to sign the transaction: ${error.message}`);
 *   return;
 * }
 *
 * console.log('Transaction sent with hash:', result.value);
 * ```
 */
export function useSetVaultFee(): UseAsyncTask<
  SetVaultFeeRequest,
  TransactionRequest,
  UnexpectedError
> {
  const client = useAaveClient();

  return useAsyncTask((request: SetVaultFeeRequest) =>
    setVaultFee(client, request),
  );
}

/**
 * A hook that provides a way to withdraw accumulated fees from a vault (owner only).
 *
 * ```ts
 * const [withdrawFees, withdrawing] = useWithdrawVaultFees();
 * const [sendTransaction, sending] = useSendTransaction(wallet);
 *
 * const loading = withdrawing.loading && sending.loading;
 * const error = withdrawing.error || sending.error;
 * const data = withdrawing.data || sending.data;
 *
 * // …
 *
 * const result = await withdrawFees({ ... })
 *   .andThen(sendTransaction);
 *
 * if (result.isErr()) {
 *   console.error(`Failed to sign the transaction: ${error.message}`);
 *   return;
 * }
 *
 * console.log('Transaction sent with hash:', result.value);
 * ```
 */
export function useWithdrawVaultFees(): UseAsyncTask<
  WithdrawVaultFeesRequest,
  TransactionRequest,
  UnexpectedError
> {
  const client = useAaveClient();

  return useAsyncTask((request: WithdrawVaultFeesRequest) =>
    withdrawVaultFees(client, request),
  );
}

/**
 * A hook that provides a way to claim rewards from a vault (owner only).
 *
 * ```ts
 * const [claimRewards, claiming] = useClaimVaultRewards();
 * const [sendTransaction, sending] = useSendTransaction(wallet);
 *
 * const loading = claiming.loading && sending.loading;
 * const error = claiming.error || sending.error;
 * const data = claiming.data || sending.data;
 *
 * // …
 *
 * const result = await claimRewards({ ... })
 *   .andThen(sendTransaction);
 *
 * if (result.isErr()) {
 *   console.error(`Failed to sign the transaction: ${error.message}`);
 *   return;
 * }
 *
 * console.log('Transaction sent with hash:', result.value);
 * ```
 */
export function useClaimVaultRewards(): UseAsyncTask<
  ClaimVaultRewardsRequest,
  TransactionRequest,
  UnexpectedError
> {
  const client = useAaveClient();

  return useAsyncTask((request: ClaimVaultRewardsRequest) =>
    claimVaultRewards(client, request),
  );
}
