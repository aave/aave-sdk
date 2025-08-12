import type { MeritClaimRequest, MeritClaimTransaction } from '@aave/graphql';
import { MeritClaimQuery } from '@aave/graphql';
import type {
  ReadResult,
  Suspendable,
  SuspendableResult,
  SuspenseResult,
} from './helpers';
import { useSuspendableQuery } from './helpers';

export type UseMeritClaimArgs = MeritClaimRequest;

/**
 * Fetch Merit claim transactions for a user.
 *
 * This signature supports React Suspense:
 *
 * ```tsx
 * const { data } = useMeritClaim({
 *   user: evmAddress('0x742d35cc…'),
 *   suspense: true,
 * });
 * ```
 */
export function useMeritClaim(
  args: UseMeritClaimArgs & Suspendable,
): SuspenseResult<MeritClaimTransaction[]>;

/**
 * Fetch Merit claim transactions for a user.
 *
 * ```tsx
 * const { data, loading } = useMeritClaim({
 *   user: evmAddress('0x742d35cc…'),
 * });
 * ```
 */
export function useMeritClaim(
  args: UseMeritClaimArgs,
): ReadResult<MeritClaimTransaction[]>;

export function useMeritClaim({
  suspense = false,
  ...request
}: UseMeritClaimArgs & {
  suspense?: boolean;
}): SuspendableResult<MeritClaimTransaction[]> {
  return useSuspendableQuery({
    document: MeritClaimQuery,
    variables: {
      request,
    },
    suspense,
  });
}
