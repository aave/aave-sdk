import {
  type Chain,
  ChainsQuery,
  HasProcessedKnownTransactionQuery,
  type HasProcessedKnownTransactionRequest,
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

/**
 * Checks if the API has processed a known transaction hash.
 *
 * This is useful to know when cached data has been invalidated after
 * a transaction is complete, as the API uses caching and has an
 * invalidation task that may take 100-200ms longer.
 *
 * ```ts
 * const result = await borrow(client, request)
 *   .andThen(sendWith(wallet))
 *   .andThen(client.waitForTransaction);
 *
 * if (result.isErr()) {
 *   // Handle error
 *   return;
 * }
 *
 * // Check if the transaction has been processed by the API
 * const processed = await hasProcessedKnownTransaction(client, {
 *   txHash: result.value,
 *   operation: OperationType.Borrow
 * });
 *
 * if (processed.isErr()) {
 *   // Handle error
 *   return;
 * }
 *
 * if (processed.value) {
 *   // Transaction processed, cached data is up to date
 *   console.log('Transaction processed, data is fresh');
 * } else {
 *   // Transaction not yet processed, may need to wait
 *   console.log('Transaction not yet processed');
 * }
 * ```
 *
 * @param client - Aave client.
 * @param request - The request containing transaction hash and operation type to check.
 * @returns True if the transaction has been processed, false otherwise.
 */
export function hasProcessedKnownTransaction(
  client: AaveClient,
  request: HasProcessedKnownTransactionRequest,
): ResultAsync<boolean, UnexpectedError> {
  return client.query(HasProcessedKnownTransactionQuery, { request });
}
