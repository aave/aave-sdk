import type { UnexpectedError } from '@aave/core';
import {
  type Market,
  MarketQuery,
  type MarketReservesRequestOrderBy,
  MarketsQuery,
  type MarketUserState,
  OrderDirection,
  UserMarketStateQuery,
  type UserMarketStateRequest,
} from '@aave/graphql';
import type { ChainId, EvmAddress, ResultAsync } from '@aave/types';
import type { AaveClient } from '../AaveClient';

export const defaultMarketReservesRequestOrderBy: MarketReservesRequestOrderBy =
  {
    tokenName: OrderDirection.Asc,
  };

export type MarketsRequest = {
  /**
   * The markets you want to see based on the chain ids.
   */
  chainIds: ChainId[];
  /**
   * The user viewing the market (e.g., the connected wallet).
   *
   * If not provided, user fields will not be included.
   */
  user?: EvmAddress;
  /**
   * The order by clause for the borrow reserves in the market.
   *
   * @defaultValue { tokenName: OrderDirection.Asc }
   */
  borrowsOrderBy?: MarketReservesRequestOrderBy;
  /**
   * The order by clause for the supply reserves in the market.
   *
   * @defaultValue { tokenName: OrderDirection.Asc }
   */
  suppliesOrderBy?: MarketReservesRequestOrderBy;
};

/**
 * Fetches all markets for the specified chain IDs.
 *
 * ```ts
 * const result = await markets(client, {
 *   chainIds: [chainId(1), chainId(8453)],
 * });
 * ```
 *
 * @param client - Aave client.
 * @param request - The markets request parameters.
 * @returns The list of markets.
 */
export function markets(
  client: AaveClient,
  {
    chainIds,
    borrowsOrderBy = defaultMarketReservesRequestOrderBy,
    suppliesOrderBy = defaultMarketReservesRequestOrderBy,
    user,
  }: MarketsRequest,
): ResultAsync<Market[], UnexpectedError> {
  return client.query(MarketsQuery, {
    request: { chainIds, user },
    borrowsOrderBy,
    suppliesOrderBy,
  });
}

export type MarketRequest = {
  /**
   * The pool address for the market.
   */
  address: EvmAddress;

  /**
   * The chain id the market pool address is deployed on.
   */
  chainId: ChainId;
  /**
   * The user viewing the market (e.g., the connected wallet).
   *
   * If not provided, user fields will not be included.
   */
  user?: EvmAddress;
  /**
   * The order by clause for the borrow reserves in the market.
   *
   * @defaultValue { tokenName: OrderDirection.Asc }
   */
  borrowsOrderBy?: MarketReservesRequestOrderBy;
  /**
   * The order by clause for the supply reserves in the market.
   *
   * @defaultValue { tokenName: OrderDirection.Asc }
   */
  suppliesOrderBy?: MarketReservesRequestOrderBy;
};

/**
 * Fetches a specific market by address and chain ID.
 *
 * ```ts
 * const result = await market(client, {
 *   address: evmAddress('0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2'),
 *   chainId: chainId(1),
 * });
 * ```
 *
 * @param client - Aave client.
 * @param request - The market request parameters.
 * @returns The market data, or null if not found.
 */
export function market(
  client: AaveClient,
  {
    address,
    chainId,
    user,
    borrowsOrderBy = defaultMarketReservesRequestOrderBy,
    suppliesOrderBy = defaultMarketReservesRequestOrderBy,
  }: MarketRequest,
): ResultAsync<Market | null, UnexpectedError> {
  return client.query(MarketQuery, {
    request: { address, chainId, user },
    borrowsOrderBy,
    suppliesOrderBy,
  });
}

/**
 * Fetches user account market data across all reserves.
 *
 * ```ts
 * const result = await userMarketState(client, {
 *   market: evmAddress('0x1234…'),
 *   user: evmAddress('0x5678…'),
 *   chainId: chainId(1)
 * });
 * ```
 *
 * @param client - Aave client.
 * @param request - The user market state request parameters.
 * @returns The user's market state.
 */
export function userMarketState(
  client: AaveClient,
  request: UserMarketStateRequest,
): ResultAsync<MarketUserState, UnexpectedError> {
  return client.query(UserMarketStateQuery, { request });
}
