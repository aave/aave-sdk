import type { UnexpectedError } from '@aave/client';
import {
  borrow,
  collateralToggle,
  liquidate,
  repay,
  supply,
  userSetEmode,
  vaultClaimRewards,
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
  BorrowRequest,
  CollateralToggleRequest,
  ExecutionPlan,
  LiquidateRequest,
  RepayRequest,
  SupplyRequest,
  TransactionRequest,
  UserSetEmodeRequest,
  VaultClaimRewardsRequest,
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
 * A hook that provides a way to set eMode for a user.
 *
 * ```ts
 * const [setUserEMode, setting] = useUserEMode();
 * const [sendTransaction, sending] = useSendTransaction(wallet);
 *
 * const loading = setting.loading && sending.loading;
 * const error = setting.error || sending.error;
 * const data = setting.data || sending.data;
 *
 * // …
 *
 * const result = await setUserEMode({ ... })
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
 * const data = toggling.data || sending.data;
 *
 * // …
 *
 * const result = await toggle({ ... })
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
 * A hook that provides a way to deposit assets into a vault.
 *
 * ```ts
 * const [deposit, depositing] = useVaultDeposit();
 * const [sendTransaction, sending] = useSendTransaction(wallet);
 *
 * const loading = depositing.loading && sending.loading;
 * const error = depositing.error || sending.error;
 * const data = depositing.data || sending.data;
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
 * A hook that provides a way to mint vault shares.
 *
 * ```ts
 * const [mint, minting] = useVaultMintShares();
 * const [sendTransaction, sending] = useSendTransaction(wallet);
 *
 * const loading = minting.loading && sending.loading;
 * const error = minting.error || sending.error;
 * const data = minting.data || sending.data;
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
 * const data = redeeming.data || sending.data;
 *
 * // …
 *
 * const result = await redeem({ ... })
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
 * const data = deploying.data || sending.data;
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
export function useVaultDeploy(): UseAsyncTask<
  VaultDeployRequest,
  TransactionRequest,
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
 * const data = setting.data || sending.data;
 *
 * // …
 *
 * const result = await setFee({ ... })
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
 * A hook that provides a way to claim vault rewards.
 *
 * ```ts
 * const [claim, claiming] = useVaultClaimRewards();
 * const [sendTransaction, sending] = useSendTransaction(wallet);
 *
 * const loading = claiming.loading && sending.loading;
 * const error = claiming.error || sending.error;
 * const data = claiming.data || sending.data;
 *
 * // …
 *
 * const result = await claim({ ... })
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
export function useVaultClaimRewards(): UseAsyncTask<
  VaultClaimRewardsRequest,
  TransactionRequest,
  UnexpectedError
> {
  const client = useAaveClient();

  return useAsyncTask((request: VaultClaimRewardsRequest) =>
    vaultClaimRewards(client, request),
  );
}
