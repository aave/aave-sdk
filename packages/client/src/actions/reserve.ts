import { type Reserve, ReserveQuery, type ReserveRequest } from '@aave/graphql';
import type { ResultAsync } from '@aave/types';
import type { AaveClient } from '../client';
import type { UnexpectedError } from '../errors';

/**
 * Fetches a specific reserve by market address, token address, and chain ID.
 *
 * ```ts
 * const result = await reserve(client, {
 *   market: evmAddress('0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2'),
 *   token: evmAddress('0xa0b86a33e6441c8c5f0bb9b7e5e1f8bbf5b78b5c'),
 *   chainId: chainId(1)
 * });
 * ```
 *
 * @param client - Aave client.
 * @param request - The reserve request parameters.
 * @returns The reserve data, or null if not found.
 */
export function reserve(
  client: AaveClient,
  request: ReserveRequest,
): ResultAsync<Reserve | null, UnexpectedError> {
  return client.query(ReserveQuery, { request });
}
