import { TokenAmountFragment } from './fragments/common';
import {
  ExecutionPlanFragment,
  TransactionRequestFragment,
} from './fragments/transactions';
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
      ...TransactionRequest
    }
  }`,
  [TransactionRequestFragment],
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
