import {
  type Market,
  MarketQuery,
  type MarketRequest,
  MarketsQuery,
  type MarketsRequest,
} from '@aave/graphql';
import type { ResultAsync } from '@aave/types';
import type { AaveClient } from '../client';
import type { UnexpectedError } from '../errors';

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
  request: MarketsRequest,
): ResultAsync<Market[], UnexpectedError> {
  return client.query(MarketsQuery, { request });
}

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
  request: MarketRequest,
): ResultAsync<Market | null, UnexpectedError> {
  return client.query(MarketQuery, { request });
}
