import {
  UserMeritRewardsQuery,
  type UserMeritRewardsRequest,
  UserRewardsQuery,
  type UserRewardsRequest,
} from '@aave/graphql';
import type { AaveClient } from '../AaveClient';

/**
 * @deprecated Use {@link userRewards} instead. The `userMeritRewards` query is
 * kept as a backwards-compatible alias and will be removed in a future release.
 *
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

/**
 * Fetches the user's Merkl-claimable rewards on a chain together with the
 * claim transaction. Canonical replacement for {@link userMeritRewards} —
 * same data source (the Merkl distributor), with an added `rewardIds` filter
 * that scopes the claim to specific Aave-owned programs.
 *
 * ```ts
 * const result = await userRewards(client, {
 *   user: evmAddress('0x742d35cc…'),
 *   chainId: chainId(1),
 *   filter: { rewardIds: ['11111111-1111-1111-1111-111111111111'] },
 * });
 * ```
 *
 * @param client - Aave client.
 * @param request - The rewards request parameters.
 * @returns The claimable rewards with the transaction request, or `null`
 * when the user has nothing to claim on that chain.
 */
export function userRewards(client: AaveClient, request: UserRewardsRequest) {
  return client.query(UserRewardsQuery, { request });
}
