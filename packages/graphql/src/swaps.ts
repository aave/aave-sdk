import {
  BorrowSwapQuoteResultFragment,
  RepayWithSupplyQuoteResultFragment,
  SupplySwapQuoteResultFragment,
  SwapCurrencyFragment,
  TokenSwapQuoteResultFragment,
  WithdrawSwapQuoteResultFragment,
} from './fragments';
import { graphql, type RequestOf } from './graphql';

/**
 * @internal
 */
export const TokenSwapQuoteQuery = graphql(
  `query TokenSwapQuote($request: TokenSwapQuoteRequest!) {
    value: tokenSwapQuote(request: $request) {
      ...TokenSwapQuoteResult
    }
  }`,
  [TokenSwapQuoteResultFragment],
);
export type TokenSwapQuoteRequest = RequestOf<typeof TokenSwapQuoteQuery>;

export type MarketOrderTokenSwapQuoteInput = ReturnType<
  typeof graphql.scalar<'MarketOrderTokenSwapQuoteInput'>
>;
export type LimitOrderTokenSwapQuoteInput = ReturnType<
  typeof graphql.scalar<'LimitOrderTokenSwapQuoteInput'>
>;
export type MarketOrderTokenSwapFromQuoteInput = ReturnType<
  typeof graphql.scalar<'MarketOrderTokenSwapFromQuoteInput'>
>;
export type TokenInput = ReturnType<typeof graphql.scalar<'TokenInput'>>;
export type SwapTokenInput = ReturnType<
  typeof graphql.scalar<'SwapTokenInput'>
>;

/**
 * @internal
 */
export const SupplySwapQuoteQuery = graphql(
  `query SupplySwapQuote($request: SupplySwapQuoteRequest!) {
    value: supplySwapQuote(request: $request) {
      ...SupplySwapQuoteResult
    }
  }`,
  [SupplySwapQuoteResultFragment],
);
export type SupplySwapQuoteRequest = RequestOf<typeof SupplySwapQuoteQuery>;

export type MarketSupplySwapQuoteInput = ReturnType<
  typeof graphql.scalar<'MarketSupplySwapQuoteInput'>
>;
export type LimitSupplySwapQuoteInput = ReturnType<
  typeof graphql.scalar<'LimitSupplySwapQuoteInput'>
>;

/**
 * @internal
 */
export const WithdrawSwapQuoteQuery = graphql(
  `query WithdrawSwapQuote($request: WithdrawSwapQuoteRequest!) {
    value: withdrawSwapQuote(request: $request) {
      ...WithdrawSwapQuoteResult
    }
  }`,
  [WithdrawSwapQuoteResultFragment],
);
export type WithdrawSwapQuoteRequest = RequestOf<typeof WithdrawSwapQuoteQuery>;

export type MarketWithdrawSwapQuoteInput = ReturnType<
  typeof graphql.scalar<'MarketWithdrawSwapQuoteInput'>
>;
export type LimitWithdrawSwapQuoteInput = ReturnType<
  typeof graphql.scalar<'LimitWithdrawSwapQuoteInput'>
>;

/**
 * @internal
 */
export const BorrowSwapQuoteQuery = graphql(
  `query BorrowSwapQuote($request: BorrowSwapQuoteRequest!) {
    value: borrowSwapQuote(request: $request) {
      ...BorrowSwapQuoteResult
    }
  }`,
  [BorrowSwapQuoteResultFragment],
);
export type BorrowSwapQuoteRequest = RequestOf<typeof BorrowSwapQuoteQuery>;

export type MarketDebtSwapQuoteInput = ReturnType<
  typeof graphql.scalar<'MarketDebtSwapQuoteInput'>
>;
export type LimitDebtSwapQuoteInput = ReturnType<
  typeof graphql.scalar<'LimitDebtSwapQuoteInput'>
>;

/**
 * @internal
 */
export const RepayWithSupplyQuoteQuery = graphql(
  `query RepayWithSupplyQuote($request: RepayWithSupplyQuoteRequest!) {
    value: repayWithSupplyQuote(request: $request) {
      ...RepayWithSupplyQuoteResult
    }
  }`,
  [RepayWithSupplyQuoteResultFragment],
);
export type RepayWithSupplyQuoteRequest = RequestOf<
  typeof RepayWithSupplyQuoteQuery
>;

export type MarketRepayWithSupplyQuoteInput = ReturnType<
  typeof graphql.scalar<'MarketRepayWithSupplyQuoteInput'>
>;
export type LimitRepayWithSupplyQuoteInput = ReturnType<
  typeof graphql.scalar<'LimitRepayWithSupplyQuoteInput'>
>;

/**
 * @internal
 */
export const SwappableTokensQuery = graphql(
  `query SwappableTokens($request: SwappableTokensRequest!) {
    value: swappableTokens(request: $request) {
      ...SwapCurrency
    }
  }`,
  [SwapCurrencyFragment],
);
export type SwappableTokensRequest = RequestOf<typeof SwappableTokensQuery>;

export type SwappableTokensRequestQuery = ReturnType<
  typeof graphql.scalar<'SwappableTokensRequestQuery'>
>;
