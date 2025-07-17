import type {
  BorrowAPYHistoryRequest,
  SupplyAPYHistoryRequest,
} from '@aave/client/actions';
import {
  type APYSample,
  BorrowAPYHistoryQuery,
  SupplyAPYHistoryQuery,
} from '@aave/graphql';
import type {
  ReadResult,
  Suspendable,
  SuspendableResult,
  SuspenseResult,
} from './helpers';
import { useSuspendableQuery } from './helpers';

export type UseBorrowAPYHistoryArgs = BorrowAPYHistoryRequest;

/**
 * Fetches a time sampling of borrow APY .
 *
 * This signature supports React Suspense:
 *
 * ```tsx
 * const { data } = useAaveMarkets({
 *   chainIds: [chainId(1), chainId(8453)],
 *   user: evmAddress('0x742d35cc...'),
 *   suspense: true
 * });
 * ```
 */
export function useBorrowAPYHistory(
  args: UseBorrowAPYHistoryArgs & Suspendable,
): SuspenseResult<APYSample[]>;

/**
 * Fetch all Aave Markets for the specified chains.
 *
 * ```tsx
 * const { data, loading } = useAaveMarkets({
 *   chainIds: [chainId(1), chainId(8453)],
 *   user: evmAddress('0x742d35cc...'),
 * });
 * ```
 */
export function useBorrowAPYHistory(
  args: UseBorrowAPYHistoryArgs,
): ReadResult<APYSample[]>;

export function useBorrowAPYHistory({
  suspense = false,
  chainId,
  underlyingToken,
  window,
  market,
}: UseBorrowAPYHistoryArgs & {
  suspense?: boolean;
}): SuspendableResult<APYSample[]> {
  return useSuspendableQuery({
    document: BorrowAPYHistoryQuery,
    variables: {
      request: { chainId, underlyingToken, window, market },
    },
    suspense,
  });
}

export type UseSupplyAPYHistoryArgs = SupplyAPYHistoryRequest;

/**
 * Fetch all Aave Markets for the specified chains.
 *
 * This signature supports React Suspense:
 *
 * ```tsx
 * const { data } = useAaveMarkets({
 *   chainIds: [chainId(1), chainId(8453)],
 *   user: evmAddress('0x742d35cc...'),
 *   suspense: true
 * });
 * ```
 */
export function useSupplyAPYHistory(
  args: UseSupplyAPYHistoryArgs & Suspendable,
): SuspenseResult<APYSample[]>;

/**
 * Fetch all Aave Markets for the specified chains.
 *
 * ```tsx
 * const { data, loading } = useAaveMarkets({
 *   chainIds: [chainId(1), chainId(8453)],
 *   user: evmAddress('0x742d35cc...'),
 * });
 * ```
 */
export function useSupplyAPYHistory(
  args: UseSupplyAPYHistoryArgs,
): ReadResult<APYSample[]>;

export function useSupplyAPYHistory({
  suspense = false,
  chainId,
  underlyingToken,
  window,
  market,
}: UseSupplyAPYHistoryArgs & {
  suspense?: boolean;
}): SuspendableResult<APYSample[]> {
  return useSuspendableQuery({
    document: SupplyAPYHistoryQuery,
    variables: {
      request: { chainId, underlyingToken, window, market },
    },
    suspense,
  });
}
