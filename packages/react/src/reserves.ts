import type { ReserveRequest } from '@aave/client/actions';
import { type Reserve, ReserveQuery } from '@aave/graphql';
import { ZERO_ADDRESS } from '@aave/types';
import type {
  ReadResult,
  Suspendable,
  SuspendableResult,
  SuspenseResult,
} from './helpers';
import { useSuspendableQuery } from './helpers';

export type UseAaveReserveArgs = ReserveRequest;

/**
 * Fetch a single Aave Reserve.
 *
 * This signature supports React Suspense:
 *
 * ```tsx
 * const { data } = useAaveReserve({
 *   market: evmAddress('0x87870bca...'),
 *   token: evmAddress('0xa0b86a33...'),
 *   chainId: chainId(1),
 *   suspense: true,
 * });
 * ```
 */
export function useAaveReserve(
  args: UseAaveReserveArgs & Suspendable,
): SuspenseResult<Reserve | null>;

/**
 * Fetch a single Aave Reserve.
 *
 * ```tsx
 * const { data, loading } = useAaveReserve({
 *   market: evmAddress('0x87870bca...'),
 *   token: evmAddress('0xa0b86a33...'),
 *   chainId: chainId(1),
 * });
 * ```
 */
export function useAaveReserve(
  args: UseAaveReserveArgs,
): ReadResult<Reserve | null>;

export function useAaveReserve({
  suspense = false,
  market,
  token,
  chainId,
  userAddress,
}: UseAaveReserveArgs & {
  suspense?: boolean;
}): SuspendableResult<Reserve | null> {
  return useSuspendableQuery({
    document: ReserveQuery,
    variables: {
      request: { market, token, chainId },
      includeUserFields: !!userAddress,
      userAddress: userAddress ?? ZERO_ADDRESS,
    },
    suspense,
  });
}
