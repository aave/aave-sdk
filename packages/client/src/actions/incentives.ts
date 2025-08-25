import {
  UserMeritRewardsQuery,
  type UserMeritRewardsRequest,
} from '@aave/graphql';
import type { AaveClient } from '../client';

/**
 * Fetches Merit rewards for a user with the transaction request to claim them.
 *
 * ```ts
 * const result = await userMeritRewards(client, {
 *   user: evmAddress('0x742d35cc…'),
 *   chainId: chainId(1),
 * });
 * ```
 *
 * @param client - Aave client.
 * @param request - The merit claim rewards request parameters.
 * @returns The rewards with the transaction request.
 */
export function userMeritRewards(
  client: AaveClient,
  request: UserMeritRewardsRequest,
) {
  return client.query(UserMeritRewardsQuery, { request });
}
