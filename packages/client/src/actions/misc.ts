import { type Chain, ChainsQuery, HealthQuery } from '@aave/graphql';
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
