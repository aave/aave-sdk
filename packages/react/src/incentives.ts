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
 * const { data } = useMeritClaimRewards({
 *   user: evmAddress('0x742d35cc…'),
 *   chainId: chainId(1),
 *   suspense: true,
 * });
 * ```
 */
export function useMeritClaimRewards(
  args: UserMeritRewardsArgs & Suspendable,
): SuspenseResult<UserMeritRewards | null>;

/**
 * Fetches Merit claim rewards for a user with the transaction request to claim them.
 *
 * ```tsx
 * const { data, loading } = useMeritClaimRewards({
 *   user: evmAddress('0x742d35cc…'),
 *   chainId: chainId(1),
 * });
 * ```
 */
export function useMeritClaimRewards(
  args: UserMeritRewardsArgs,
): ReadResult<UserMeritRewards | null>;

export function useMeritClaimRewards({
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
