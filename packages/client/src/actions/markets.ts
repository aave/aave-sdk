import {
  type Market,
  MarketQuery,
  type MarketReservesRequestOrderBy,
  MarketsQuery,
} from '@aave/graphql';
import type { ChainId, EvmAddress, ResultAsync } from '@aave/types';
import type { AaveClient } from '../client';
import type { UnexpectedError } from '../errors';

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
 *   chainIds: [chainId(1), chainId(137)]
 * });
 * ```
 *
 * @param client - Aave client.
 * @param request - The markets request parameters.
 * @returns The list of markets.
 */
export function markets(
  client: AaveClient,
  { chainIds, borrowsOrderBy, suppliesOrderBy, user }: MarketsRequest,
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
 *   chainId: chainId(1)
 * });
 * ```
 *
 * @param client - Aave client.
 * @param request - The market request parameters.
 * @returns The market data, or null if not found.
 */
export function market(
  client: AaveClient,
  { address, chainId, user, borrowsOrderBy, suppliesOrderBy }: MarketRequest,
): ResultAsync<Market | null, UnexpectedError> {
  return client.query(MarketQuery, {
    request: { address, chainId, user },
    borrowsOrderBy,
    suppliesOrderBy,
  });
}
