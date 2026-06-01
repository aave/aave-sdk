import type {
  UserMeritRewards,
  UserMeritRewardsRequest,
  UserRewards,
  UserRewardsRequest,
} from '@aave/graphql';
import { UserMeritRewardsQuery, UserRewardsQuery } from '@aave/graphql';
import type {
  ReadResult,
  Suspendable,
  SuspendableResult,
  SuspenseResult,
} from './helpers';
import { useSuspendableQuery } from './helpers';

export type UserMeritRewardsArgs = UserMeritRewardsRequest;

/**
 * @deprecated Use {@link useUserRewards} instead. Same shape; the canonical
 * hook additionally supports a `filter.rewardIds` scope for per-program
 * claims.
 *
 * Fetches Merit claim rewards for a user with the transaction request to claim them.
 *
 * This signature supports React Suspense:
 *
 * ```tsx
 * const { data } = useUserMeritRewards({
 *   user: evmAddress('0x742d35cc…'),
 *   chainId: chainId(1),
 *   suspense: true,
 * });
 * ```
 */
export function useUserMeritRewards(
  args: UserMeritRewardsArgs & Suspendable,
): SuspenseResult<UserMeritRewards | null>;

/**
 * @deprecated Use {@link useUserRewards} instead.
 *
 * Fetches Merit claim rewards for a user with the transaction request to claim them.
 *
 * ```tsx
 * const { data, loading } = useUserMeritRewards({
 *   user: evmAddress('0x742d35cc…'),
 *   chainId: chainId(1),
 * });
 * ```
 */
export function useUserMeritRewards(
  args: UserMeritRewardsArgs,
): ReadResult<UserMeritRewards | null>;

export function useUserMeritRewards({
  suspense = false,
  ...request
}: UserMeritRewardsArgs & {
  suspense?: boolean;
}): SuspendableResult<UserMeritRewards | null> {
  return useSuspendableQuery({
    document: UserMeritRewardsQuery,
    variables: {
      request,
    },
    suspense,
  });
}

export type UseUserRewardsArgs = UserRewardsRequest;

/**
 * Fetches the user's Merkl-claimable rewards on a chain together with the
 * claim transaction. Canonical replacement for {@link useUserMeritRewards}.
 *
 * Supports an optional `filter.rewardIds` to scope the claim to specific
 * Aave-owned programs (same semantics as V4's `claimRewards(ids)`).
 *
 * Suspense variant:
 *
 * ```tsx
 * const { data } = useUserRewards({
 *   user: evmAddress('0x742d35cc…'),
 *   chainId: chainId(1),
 *   filter: { rewardIds: ['11111111-1111-1111-1111-111111111111'] },
 *   suspense: true,
 * });
 * ```
 */
export function useUserRewards(
  args: UseUserRewardsArgs & Suspendable,
): SuspenseResult<UserRewards | null>;

/**
 * Fetches the user's Merkl-claimable rewards on a chain together with the
 * claim transaction.
 *
 * ```tsx
 * const { data, loading } = useUserRewards({
 *   user: evmAddress('0x742d35cc…'),
 *   chainId: chainId(1),
 * });
 * ```
 */
export function useUserRewards(
  args: UseUserRewardsArgs,
): ReadResult<UserRewards | null>;

export function useUserRewards({
  suspense = false,
  ...request
}: UseUserRewardsArgs & {
  suspense?: boolean;
}): SuspendableResult<UserRewards | null> {
  return useSuspendableQuery({
    document: UserRewardsQuery,
    variables: {
      request,
    },
    suspense,
  });
}
