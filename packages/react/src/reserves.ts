import {
  type APYSample,
  BorrowAPYHistoryQuery,
  type BorrowAPYHistoryRequest,
  type Reserve,
  ReserveQuery,
  type ReserveRequest,
  SupplyAPYHistoryQuery,
  type SupplyAPYHistoryRequest,
} from '@aave/graphql';
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
  ...request
}: UseAaveReserveArgs & {
  suspense?: boolean;
}): SuspendableResult<Reserve | null> {
  return useSuspendableQuery({
    document: ReserveQuery,
    variables: {
      request,
    },
    suspense,
  });
}

export type UseBorrowAPYHistoryArgs = BorrowAPYHistoryRequest;

/**
 * Fetches historical borrow APY data for a given underlying asset on a specific market
 * within a defined time window.
 *
 * The returned data contains APY samples with average rates and timestamps, allowing you
 * to visualize borrow rate trends over the specified time period.
 *
 * This signature supports React Suspense:
 *
 * ```tsx
 * const { data } = useBorrowAPYHistory({
 *   chainId: chainId(1),
 *   underlyingToken: evmAddress('0x742d35cc…'),
 *   market: evmAddress('0x87870bca…'),
 *   window: TimeWindow.LastWeek,
 *   suspense: true
 * });
 * ```
 */
export function useBorrowAPYHistory(
  args: UseBorrowAPYHistoryArgs & Suspendable,
): SuspenseResult<APYSample[]>;

/**
 * Fetches historical borrow APY data for a given underlying asset on a specific market
 * within a defined time window.
 *
 * The returned data contains APY samples with average rates and timestamps, allowing you
 * to visualize borrow rate trends over the specified time period.
 *
 * ```tsx
 * const { data, loading } = useBorrowAPYHistory({
 *   chainId: chainId(1),
 *   underlyingToken: evmAddress('0x742d35cc…'),
 *   market: evmAddress('0x87870bca…'),
 *   window: TimeWindow.LastWeek
 * });
 * ```
 */
export function useBorrowAPYHistory(
  args: UseBorrowAPYHistoryArgs,
): ReadResult<APYSample[]>;

export function useBorrowAPYHistory({
  suspense = false,
  ...request
}: UseBorrowAPYHistoryArgs & {
  suspense?: boolean;
}): SuspendableResult<APYSample[]> {
  return useSuspendableQuery({
    document: BorrowAPYHistoryQuery,
    variables: {
      request,
    },
    suspense,
  });
}

export type UseSupplyAPYHistoryArgs = SupplyAPYHistoryRequest;

/**
 * Fetches historical supply APY data for a given underlying asset on a specific market
 * within a defined time window.
 *
 * The returned data contains APY samples with average rates and timestamps, allowing you
 * to visualize supply rate trends over the specified time period.
 *
 * This signature supports React Suspense:
 *
 * ```tsx
 * const { data } = useSupplyAPYHistory({
 *   chainId: chainId(1),
 *   underlyingToken: evmAddress('0x742d35cc…'),
 *   market: evmAddress('0x87870bca…'),
 *   window: TimeWindow.LastWeek,
 *   suspense: true
 * });
 * ```
 */
export function useSupplyAPYHistory(
  args: UseSupplyAPYHistoryArgs & Suspendable,
): SuspenseResult<APYSample[]>;

/**
 * Fetches historical supply APY data for a given underlying asset on a specific market
 * within a defined time window.
 *
 * The returned data contains APY samples with average rates and timestamps, allowing you
 * to visualize supply rate trends over the specified time period.
 *
 * ```tsx
 * const { data, loading } = useSupplyAPYHistory({
 *   chainId: chainId(1),
 *   underlyingToken: evmAddress('0x742d35cc…'),
 *   market: evmAddress('0x87870bca…'),
 *   window: TimeWindow.LastWeek
 * });
 * ```
 */
export function useSupplyAPYHistory(
  args: UseSupplyAPYHistoryArgs,
): ReadResult<APYSample[]>;

export function useSupplyAPYHistory({
  suspense = false,
  ...request
}: UseSupplyAPYHistoryArgs & {
  suspense?: boolean;
}): SuspendableResult<APYSample[]> {
  return useSuspendableQuery({
    document: SupplyAPYHistoryQuery,
    variables: {
      request,
    },
    suspense,
  });
}
