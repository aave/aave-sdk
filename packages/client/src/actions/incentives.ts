import {
  MeritClaimRewardsQuery,
  type MeritClaimRewardsRequest,
} from '@aave/graphql';
import type { AaveClient } from '../client';

/**
 * Fetches Merit claim rewards for a user with the transaction request to claim them.
 *
 * ```ts
 * const result = await meritClaimRewards(client, {
 *   user: evmAddress('0x742d35cc…'),
 *   chainId: chainId(1),
 * });
 * ```
 *
 * @param client - Aave client.
 * @param request - The merit claim rewards request parameters.
 * @returns The transaction to claim merit rewards.
 */
export function meritClaimRewards(
  client: AaveClient,
  request: MeritClaimRewardsRequest,
) {
  return client.query(MeritClaimRewardsQuery, { request });
}
