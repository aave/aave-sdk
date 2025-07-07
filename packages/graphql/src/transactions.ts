import { ExecutionPlanFragment, TransactionRequestFragment } from './fragments';
import { graphql, type RequestOf } from './graphql';

/**
 * @internal
 */
export const BorrowQuery = graphql(
  `query Borrow($request: BorrowRequest!) {
    value: borrow(request: $request) {
      ...ExecutionPlan
    }
  }`,
  [ExecutionPlanFragment],
);
export type BorrowRequest = RequestOf<typeof BorrowQuery>;

/**
 * @internal
 */
export const SupplyQuery = graphql(
  `query Supply($request: SupplyRequest!) {
    value: supply(request: $request) {
      ...ExecutionPlan
    }
  }`,
  [ExecutionPlanFragment],
);
export type SupplyRequest = RequestOf<typeof SupplyQuery>;

/**
 * @internal
 */
export const RepayQuery = graphql(
  `query Repay($request: RepayRequest!) {
    value: repay(request: $request) {
      ...ExecutionPlan
    }
  }`,
  [ExecutionPlanFragment],
);
export type RepayRequest = RequestOf<typeof RepayQuery>;

/**
 * @internal
 */
export const WithdrawQuery = graphql(
  `query Withdraw($request: WithdrawRequest!) {
    value: withdraw(request: $request) {
      ...ExecutionPlan
    }
  }`,
  [ExecutionPlanFragment],
);
export type WithdrawRequest = RequestOf<typeof WithdrawQuery>;

/**
 * @internal
 */
export const EModeToggleQuery = graphql(
  `query EModeToggle($request: EmodeToggleRequest!) {
    value: eModeToggle(request: $request) {
      ...TransactionRequest
    }
  }`,
  [TransactionRequestFragment],
);
export type EModeToggleRequest = RequestOf<typeof EModeToggleQuery>;

/**
 * @internal
 */
export const VaultDepositQuery = graphql(
  `query VaultDeposit($request: VaultDepositRequest!) {
    value: vaultDeposit(request: $request) {
      ...ExecutionPlan
    }
  }`,
  [ExecutionPlanFragment],
);
export type VaultDepositRequest = RequestOf<typeof VaultDepositQuery>;

/**
 * @internal
 */
export const RedeemVaultSharesQuery = graphql(
  `query RedeemVaultShares($request: VaultRedeemSharesRequest!) {
    value: redeemVaultShares(request: $request) {
      ...TransactionRequest
    }
  }`,
  [TransactionRequestFragment],
);
export type RedeemVaultSharesRequest = RequestOf<typeof RedeemVaultSharesQuery>;

/**
 * @internal
 */
export const DeployVaultQuery = graphql(
  `query DeployVault($request: DeployVaultRequest!) {
    value: deployVault(request: $request) {
      ...TransactionRequest
    }
  }`,
  [TransactionRequestFragment],
);
export type DeployVaultRequest = RequestOf<typeof DeployVaultQuery>;

/**
 * @internal
 */
export const SetVaultFeeQuery = graphql(
  `query SetVaultFee($request: SetVaultFeeRequest!) {
    value: setVaultFee(request: $request) {
      ...TransactionRequest
    }
  }`,
  [TransactionRequestFragment],
);
export type SetVaultFeeRequest = RequestOf<typeof SetVaultFeeQuery>;

/**
 * @internal
 */
export const WithdrawVaultFeesQuery = graphql(
  `query WithdrawVaultFees($request: WithdrawVaultFeesRequest!) {
    value: withdrawVaultFees(request: $request) {
      ...TransactionRequest
    }
  }`,
  [TransactionRequestFragment],
);
export type WithdrawVaultFeesRequest = RequestOf<typeof WithdrawVaultFeesQuery>;

/**
 * @internal
 */
export const ClaimVaultRewardsQuery = graphql(
  `query ClaimVaultRewards($request: ClaimVaultRewardsRequest!) {
    value: claimVaultRewards(request: $request) {
      ...TransactionRequest
    }
  }`,
  [TransactionRequestFragment],
);
export type ClaimVaultRewardsRequest = RequestOf<typeof ClaimVaultRewardsQuery>;

/**
 * @internal
 */
export const WithdrawVaultQuery = graphql(
  `query WithdrawVault($request: WithdrawVaultRequest!) {
    value: withdrawVault(request: $request) {
      ...TransactionRequest
    }
  }`,
  [TransactionRequestFragment],
);
export type WithdrawVaultRequest = RequestOf<typeof WithdrawVaultQuery>;

/**
 * @internal
 */
export const MintVaultSharesQuery = graphql(
  `query MintVaultShares($request: MintVaultSharesRequest!) {
    value: mintVaultShares(request: $request) {
      ...ExecutionPlan
    }
  }`,
  [ExecutionPlanFragment],
);
export type MintVaultSharesRequest = RequestOf<typeof MintVaultSharesQuery>;

/**
 * @internal
 */
export const CollateralToggleQuery = graphql(
  `query CollateralToggle($request: CollateralToggleRequest!) {
    value: collateralToggle(request: $request) {
      ...TransactionRequest
    }
  }`,
  [TransactionRequestFragment],
);
export type CollateralToggleRequest = RequestOf<typeof CollateralToggleQuery>;

/**
 * @internal
 */
export const LiquidateQuery = graphql(
  `query Liquidate($request: LiquidateRequest!) {
    value: liquidate(request: $request) {
      ...TransactionRequest
    }
  }`,
  [TransactionRequestFragment],
);
export type LiquidateRequest = RequestOf<typeof LiquidateQuery>;
