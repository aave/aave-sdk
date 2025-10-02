import {
  type APYSample,
  BorrowAPYHistoryQuery,
  type BorrowAPYHistoryRequest,
  CreditDelegateeAllowanceQuery,
  type CreditDelegateeAmountRequest,
  type Reserve,
  ReserveQuery,
  type ReserveRequest,
  SupplyAPYHistoryQuery,
  type SupplyAPYHistoryRequest,
  type TokenAmount,
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
 * const { data, error, loading } = useAaveReserve({
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
 * This signature supports React Suspense:
 *
 * ```tsx
 * const { data } = useBorrowAPYHistory({
 *   chainId: chainId(1),
 *   underlyingToken: evmAddress('0x742d35cc…'),
 *   market: evmAddress('0x24dc35d3c…'),
 *   window: TimeWindow.LastWeek
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
 * ```tsx
 * const { data } = useBorrowAPYHistory({
 *   chainId: chainId(1),
 *   underlyingToken: evmAddress('0x742d35cc…'),
 *   market: evmAddress('0x24dc35d3c…'),
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
 * This signature supports React Suspense:
 *
 * ```tsx
 * const { data } = useSupplyAPYHistory({
 *   chainId: chainId(1),
 *   underlyingToken: evmAddress('0x742d35cc…'),
 *   market: evmAddress('0x24dc35d3c…'),
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
 * ```tsx
 * const { data } = useSupplyAPYHistory({
 *   chainId: chainId(1),
 *   underlyingToken: evmAddress('0x742d35cc…'),
 *   market: evmAddress('0x24dc35d3c…'),
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

export type UseCreditDelegateeAllowanceArgs = CreditDelegateeAmountRequest;

/**
 * Get the amount delegated to the credit delegatee that can borrow on your behalf.
 *
 * This signature supports React Suspense:
 *
 * ```tsx
 * const { data } = useCreditDelegateeAllowance({
 *   market: evmAddress('0x87870bca...'),
 *   underlyingToken: evmAddress('0xa0b86a33...'),
 *   user: evmAddress('0x742d35cc...'),
 *   delegatee: evmAddress('0x5678...'),
 *   chainId: chainId(1),
 *   suspense: true,
 * });
 * ```
 */
export function useCreditDelegateeAllowance(
  args: UseCreditDelegateeAllowanceArgs & Suspendable,
): SuspenseResult<TokenAmount>;

/**
 * Get the amount delegated to the credit delegatee that can borrow on your behalf.
 *
 * ```tsx
 * const { data, error, loading } = useCreditDelegateeAllowance({
 *   market: evmAddress('0x87870bca...'),
 *   underlyingToken: evmAddress('0xa0b86a33...'),
 *   user: evmAddress('0x742d35cc...'),
 *   delegatee: evmAddress('0x5678...'),
 *   chainId: chainId(1),
 * });
 * ```
 */
export function useCreditDelegateeAllowance(
  args: UseCreditDelegateeAllowanceArgs,
): ReadResult<TokenAmount>;

export function useCreditDelegateeAllowance({
  suspense = false,
  ...request
}: UseCreditDelegateeAllowanceArgs & {
  suspense?: boolean;
}): SuspendableResult<TokenAmount> {
  return useSuspendableQuery({
    document: CreditDelegateeAllowanceQuery,
    variables: {
      request,
    },
    suspense,
  });
}
