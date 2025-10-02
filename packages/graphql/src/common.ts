import type { graphql } from './graphql';

/**
 * Criteria for ordering by user.
 */
export type OrderByUserCriteria = ReturnType<
  typeof graphql.scalar<'OrderByUserCriteria'>
>;

/**
 * Criteria for ordering reserves.
 */
export type MarketReservesRequestOrderBy = ReturnType<
  typeof graphql.scalar<'MarketReservesRequestOrderBy'>
>;

/**
 * An object describing an amount of tokens either in native or ERC20 format.
 */
export type AmountInput = ReturnType<typeof graphql.scalar<'AmountInput'>>;
