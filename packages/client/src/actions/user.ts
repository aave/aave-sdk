import {
  type MarketUserReserveBorrowPosition,
  type MarketUserReserveSupplyPosition,
  type PaginatedUserTransactionHistoryResult,
  UserBorrowsQuery,
  type UserBorrowsRequest,
  UserSuppliesQuery,
  type UserSuppliesRequest,
  UserTransactionHistoryQuery,
} from '@aave/graphql';
import type { ResultAsync } from '@aave/types';
import type { AaveClient } from '../client';
import type { UnexpectedError } from '../errors';

/**
 * Fetches all user supply positions across the specified markets.
 *
 * ```ts
 * const result = await userSupplies(client, {
 *   markets: [{ address: evmAddress('0x87870bca…'), chainId: chainId(1) }],
 *   user: evmAddress('0x742d35cc…'),
 * });
 * ```
 *
 * @param client - Aave client.
 * @param request - The user supplies request parameters.
 * @returns The user's supply positions.
 */
export function userSupplies(
  client: AaveClient,
  request: UserSuppliesRequest,
): ResultAsync<MarketUserReserveSupplyPosition[], UnexpectedError> {
  return client.query(UserSuppliesQuery, { request });
}

/**
 * Fetches all user borrow positions.
 *
 * ```ts
 * const result = await userBorrows(client, {
 *   markets: [{ address: evmAddress('0x87870bca…'), chainId: chainId(1) }],
 *   user: evmAddress('0x742d35cc…'),
 * });
 * ```
 *
 * @param client - Aave client.
 * @param request - The user borrows request parameters.
 * @returns The user's borrow positions.
 */
export function userBorrows(
  client: AaveClient,
  request: UserBorrowsRequest,
): ResultAsync<MarketUserReserveBorrowPosition[], UnexpectedError> {
  return client.query(UserBorrowsQuery, { request });
}

/**
 * Fetches the user's transaction history.
 *
 * ```ts
 * const result = await userTransactionHistory(client);
 * ```
 *
 * @param client - Aave client.
 * @returns The user's paginated transaction history.
 */
export function userTransactionHistory(
  client: AaveClient,
): ResultAsync<PaginatedUserTransactionHistoryResult, UnexpectedError> {
  return client.query(UserTransactionHistoryQuery, {});
}
