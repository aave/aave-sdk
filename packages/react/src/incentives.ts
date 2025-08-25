import type { UserMeritRewards, UserMeritRewardsRequest } from '@aave/graphql';
import { UserMeritRewardsQuery } from '@aave/graphql';
import type {
  ReadResult,
  Suspendable,
  SuspendableResult,
  SuspenseResult,
} from './helpers';
import { useSuspendableQuery } from './helpers';

export type UserMeritRewardsArgs = UserMeritRewardsRequest;

/**
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
