import {
  type Chain,
  ChainsQuery,
  HealthQuery,
  type UsdExchangeRate,
  UsdExchangeRatesQuery,
  type UsdExchangeRatesRequest,
} from '@aave/graphql';
import type { ResultAsync } from '@aave/types';
import type { AaveClient } from '../client';
import type { UnexpectedError } from '../errors';

/**
 * Health check query.
 *
 * ```ts
 * const result = await health(client);
 * ```
 *
 * @param client - Aave client.
 * @returns True or false
 */
export function health(
  client: AaveClient,
): ResultAsync<boolean, UnexpectedError> {
  return client.query(HealthQuery, {});
}

/**
 * Fetches the list of supported chains.
 *
 * @param client - Aave client.
 * @returns The list of supported chains.
 */
export function chains(
  client: AaveClient,
): ResultAsync<Chain[], UnexpectedError> {
  return client.query(ChainsQuery, {});
}

/**
 * Fetches USD exchange rates for different tokens on a given market.
 *
 * ```ts
 * const result = await usdExchangeRates(client, {
 *   market: evmAddress('0x1234…'),
 *   underlyingTokens: [evmAddress('0x5678…'), evmAddress('0x90ab…')],
 *   chainId: chainId(1),
 * });
 * ```
 *
 * @param client - Aave client.
 * @param request - The USD exchange rates request parameters.
 * @returns The list of USD exchange rates.
 */
export function usdExchangeRates(
  client: AaveClient,
  request: UsdExchangeRatesRequest,
): ResultAsync<UsdExchangeRate[], UnexpectedError> {
  return client.query(UsdExchangeRatesQuery, { request });
}
