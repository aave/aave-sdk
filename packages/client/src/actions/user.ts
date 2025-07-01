import {
  UserBorrowsQuery,
  type UserBorrowsRequest,
  type UserReserveBorrowPosition,
  type UserReserveSupplyPosition,
  UserSuppliesQuery,
  type UserSuppliesRequest,
} from '@aave/graphql';
import type { ResultAsync } from '@aave/types';
import type { AaveClient } from '../client';
import type { UnexpectedError } from '../errors';

/**
 * Fetches all user supply positions across specified markets.
 *
 * ```ts
 * const result = await userSupplies(client, {
 *   markets: [evmAddress('0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2')],
 *   user: evmAddress('0x742d35cc6e5c4ce3b69a2a8c7c8e5f7e9a0b1234'),
 *   orderBy: { name: OrderDirection.Asc }
 * });
 * ```
 *
 * @param client - Aave client.
 * @param request - The user supplies request parameters.
 * @returns The list of user supply positions.
 */
export function userSupplies(
  client: AaveClient,
  request: UserSuppliesRequest,
): ResultAsync<UserReserveSupplyPosition[], UnexpectedError> {
  return client.query(UserSuppliesQuery, { request });
}

/**
 * Fetches all user borrow positions across specified markets.
 *
 * ```ts
 * const result = await userBorrows(client, {
 *   markets: [evmAddress('0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2')],
 *   user: evmAddress('0x742d35cc6e5c4ce3b69a2a8c7c8e5f7e9a0b1234'),
 *   orderBy: { name: OrderDirection.Asc }
 * });
 * ```
 *
 * @param client - Aave client.
 * @param request - The user borrows request parameters.
 * @returns The list of user borrow positions.
 */
export function userBorrows(
  client: AaveClient,
  request: UserBorrowsRequest,
): ResultAsync<UserReserveBorrowPosition[], UnexpectedError> {
  return client.query(UserBorrowsQuery, { request });
}
