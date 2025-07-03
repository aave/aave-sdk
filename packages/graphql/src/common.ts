import type { graphql } from './graphql';

/**
 * A standardized data object.
 *
 * All GQL operations should alias their results to `value` to ensure interoperability
 * with this client interface.
 */
export type StandardData<T> = { value: T };

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
