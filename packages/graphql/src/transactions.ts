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
export const UserSetEmodeQuery = graphql(
  `query UserSetEmode($request: UserSetEmodeRequest!) {
    value: userSetEmode(request: $request) {
      ...TransactionRequest
    }
  }`,
  [TransactionRequestFragment],
);
export type UserSetEmodeRequest = RequestOf<typeof UserSetEmodeQuery>;

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
export const VaultRedeemSharesQuery = graphql(
  `query VaultRedeemShares($request: VaultRedeemSharesRequest!) {
    value: vaultRedeemShares(request: $request) {
      ...TransactionRequest
    }
  }`,
  [TransactionRequestFragment],
);
export type VaultRedeemSharesRequest = RequestOf<typeof VaultRedeemSharesQuery>;

/**
 * @internal
 */
export const VaultDeployQuery = graphql(
  `query VaultDeploy($request: VaultDeployRequest!) {
    value: vaultDeploy(request: $request) {
      ...ExecutionPlan
    }
  }`,
  [ExecutionPlanFragment],
);
export type VaultDeployRequest = RequestOf<typeof VaultDeployQuery>;

/**
 * @internal
 */
export const VaultSetFeeQuery = graphql(
  `query VaultSetFee($request: VaultSetFeeRequest!) {
    value: vaultSetFee(request: $request) {
      ...TransactionRequest
    }
  }`,
  [TransactionRequestFragment],
);
export type VaultSetFeeRequest = RequestOf<typeof VaultSetFeeQuery>;

/**
 * @internal
 */
export const VaultWithdrawFeesQuery = graphql(
  `query VaultWithdrawFees($request: VaultWithdrawFeesRequest!) {
    value: vaultWithdrawFees(request: $request) {
      ...TransactionRequest
    }
  }`,
  [TransactionRequestFragment],
);
export type VaultWithdrawFeesRequest = RequestOf<typeof VaultWithdrawFeesQuery>;

/**
 * @internal
 */
export const VaultClaimRewardsQuery = graphql(
  `query VaultClaimRewards($request: VaultClaimRewardsRequest!) {
    value: vaultClaimRewards(request: $request) {
      ...TransactionRequest
    }
  }`,
  [TransactionRequestFragment],
);
export type VaultClaimRewardsRequest = RequestOf<typeof VaultClaimRewardsQuery>;

/**
 * @internal
 */
export const VaultWithdrawQuery = graphql(
  `query VaultWithdraw($request: VaultWithdrawRequest!) {
    value: vaultWithdraw(request: $request) {
      ...TransactionRequest
    }
  }`,
  [TransactionRequestFragment],
);
export type VaultWithdrawRequest = RequestOf<typeof VaultWithdrawQuery>;

/**
 * @internal
 */
export const VaultMintSharesQuery = graphql(
  `query VaultMintShares($request: VaultMintSharesRequest!) {
    value: vaultMintShares(request: $request) {
      ...ExecutionPlan
    }
  }`,
  [ExecutionPlanFragment],
);
export type VaultMintSharesRequest = RequestOf<typeof VaultMintSharesQuery>;

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
