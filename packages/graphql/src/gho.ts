import { DecimalValueFragment, TokenAmountFragment } from './fragments/common';
import { ExecutionPlanFragment } from './fragments/transactions';
import { SghoVaultFragment } from './fragments/vaults';
import { graphql, type RequestOf } from './graphql';

export const SavingsGhoBalanceQuery = graphql(
  `query SavingsGhoBalance($request: SavingsGhoBalanceRequest!) {
    value: savingsGhoBalance(request: $request) {
      ...TokenAmount
    }
  }`,
  [TokenAmountFragment],
);
export type SavingsGhoBalanceRequest = RequestOf<typeof SavingsGhoBalanceQuery>;

export const SavingsGhoWithdrawQuery = graphql(
  `query SavingsGhoWithdraw($request: SavingsGhoWithdrawRequest!) {
    value: savingsGhoWithdraw(request: $request) {
      ...ExecutionPlan
    }
  }`,
  [ExecutionPlanFragment],
);
export type SavingsGhoWithdrawRequest = RequestOf<
  typeof SavingsGhoWithdrawQuery
>;

export const SavingsGhoDepositQuery = graphql(
  `query SavingsGhoDeposit($request: SavingsGhoDepositRequest!) {
    value: savingsGhoDeposit(request: $request) {
      ...ExecutionPlan
    }
  }`,
  [ExecutionPlanFragment],
);
export type SavingsGhoDepositRequest = RequestOf<typeof SavingsGhoDepositQuery>;

export const SghoVaultDepositQuery = graphql(
  `query SghoVaultDeposit($request: SghoVaultDepositRequest!) {
    value: sghoVaultDeposit(request: $request) {
      ...ExecutionPlan
    }
  }`,
  [ExecutionPlanFragment],
);
export type SghoVaultDepositRequest = RequestOf<typeof SghoVaultDepositQuery>;

export const SghoVaultRedeemSharesQuery = graphql(
  `query SghoVaultRedeemShares($request: SghoVaultRedeemSharesRequest!) {
    value: sghoVaultRedeemShares(request: $request) {
      ...ExecutionPlan
    }
  }`,
  [ExecutionPlanFragment],
);
export type SghoVaultRedeemSharesRequest = RequestOf<
  typeof SghoVaultRedeemSharesQuery
>;

export const StkGhoMigrateQuery = graphql(
  `query StkGhoMigrate($request: StkGhoMigrateRequest!) {
    value: stkGhoMigrate(request: $request) {
      ...ExecutionPlan
    }
  }`,
  [ExecutionPlanFragment],
);
export type StkGhoMigrateRequest = RequestOf<typeof StkGhoMigrateQuery>;

export const SghoVaultQuery = graphql(
  `query SghoVault($request: SghoVaultRequest!) {
    value: sghoVault(request: $request) {
      ...SghoVault
    }
  }`,
  [SghoVaultFragment],
);
export type SghoVaultRequest = RequestOf<typeof SghoVaultQuery>;

export const SghoVaultPreviewDepositQuery = graphql(
  `query SghoVaultPreviewDeposit($request: SghoVaultPreviewRequest!) {
    value: sghoVaultPreviewDeposit(request: $request) {
      ...DecimalValue
    }
  }`,
  [DecimalValueFragment],
);
export type SghoVaultPreviewDepositRequest = RequestOf<
  typeof SghoVaultPreviewDepositQuery
>;

export const SghoVaultPreviewRedeemQuery = graphql(
  `query SghoVaultPreviewRedeem($request: SghoVaultPreviewRequest!) {
    value: sghoVaultPreviewRedeem(request: $request) {
      ...DecimalValue
    }
  }`,
  [DecimalValueFragment],
);
export type SghoVaultPreviewRedeemRequest = RequestOf<
  typeof SghoVaultPreviewRedeemQuery
>;
