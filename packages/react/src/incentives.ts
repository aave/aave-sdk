import type {
  MeritClaimRewardsRequest,
  MeritClaimRewardsTransaction,
} from '@aave/graphql';
import { MeritClaimRewardsQuery } from '@aave/graphql';
import type {
  ReadResult,
  Suspendable,
  SuspendableResult,
  SuspenseResult,
} from './helpers';
import { useSuspendableQuery } from './helpers';

export type UseMeritClaimRewardsArgs = MeritClaimRewardsRequest;

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
  args: UseMeritClaimRewardsArgs & Suspendable,
): SuspenseResult<MeritClaimRewardsTransaction | null>;

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
  args: UseMeritClaimRewardsArgs,
): ReadResult<MeritClaimRewardsTransaction | null>;

export function useMeritClaimRewards({
  suspense = false,
  ...request
}: UseMeritClaimRewardsArgs & {
  suspense?: boolean;
}): SuspendableResult<MeritClaimRewardsTransaction | null> {
  return useSuspendableQuery({
    document: MeritClaimRewardsQuery,
    variables: {
      request,
    },
    suspense,
  });
}
