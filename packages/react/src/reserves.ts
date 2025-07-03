import { type Reserve, ReserveQuery, type ReserveRequest } from '@aave/graphql';
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
 *   underlyingToken: evmAddress('0xa0b86a33...'),
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
 *   underlyingToken: evmAddress('0xa0b86a33...'),
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
  underlyingToken,
  chainId,
  user,
}: UseAaveReserveArgs & {
  suspense?: boolean;
}): SuspendableResult<Reserve | null> {
  return useSuspendableQuery({
    document: ReserveQuery,
    variables: {
      request: { market, underlyingToken, chainId, user },
    },
    suspense,
  });
}
