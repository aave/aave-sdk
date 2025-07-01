import { type Reserve, ReserveQuery } from '@aave/graphql';
import {
  type ChainId,
  type EvmAddress,
  type ResultAsync,
  ZERO_ADDRESS,
} from '@aave/types';
import type { AaveClient } from '../client';
import type { UnexpectedError } from '../errors';

export type ReserveRequest = {
  /**
   * The pool address for the market
   */
  market: EvmAddress;
  /**
   * The asset for the reserve
   */
  token: EvmAddress;
  /**
   * The chain id the pool is deployed on
   */
  chainId: ChainId;
  /**
   * The user address in case you want to include user fields in the response.
   *
   * If not provided, user fields will not be included.
   */
  userAddress?: EvmAddress;
};

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
  { market, token, chainId, userAddress }: ReserveRequest,
): ResultAsync<Reserve | null, UnexpectedError> {
  return client.query(ReserveQuery, {
    request: { market, token, chainId },
    includeUserFields: !!userAddress,
    userAddress: userAddress ?? ZERO_ADDRESS,
  });
}
