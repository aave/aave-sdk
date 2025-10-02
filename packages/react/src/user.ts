import type {
  MarketUserReserveBorrowPosition,
  MarketUserReserveSupplyPosition,
  MarketUserState,
  PaginatedUserTransactionHistoryResult,
  UserBorrowsRequest,
  UserMarketStateRequest,
  UserSuppliesRequest,
  UserTransactionHistoryRequest,
} from '@aave/graphql';
import {
  UserBorrowsQuery,
  UserMarketStateQuery,
  UserSuppliesQuery,
  UserTransactionHistoryQuery,
} from '@aave/graphql';
import type {
  ReadResult,
  Suspendable,
  SuspendableResult,
  SuspenseResult,
} from './helpers';
import { useSuspendableQuery } from './helpers';

export type UseUserSuppliesArgs = UserSuppliesRequest;

/**
 * Fetch all user supply positions.
 *
 * This signature supports React Suspense:
 *
 * ```tsx
 * const { data } = useUserSupplies({
 *   markets: [{ address: evmAddress('0x87870bca…'), chainId: chainId(1) }],
 *   user: evmAddress('0x742d35cc…'),
 *   orderBy: { name: OrderDirection.ASC },
 *   suspense: true,
 * });
 * ```
 */
export function useUserSupplies(
  args: UseUserSuppliesArgs & Suspendable,
): SuspenseResult<MarketUserReserveSupplyPosition[]>;

/**
 * Fetch all user supply positions.
 *
 * ```tsx
 * const { data, error, loading } = useUserSupplies({
 *   markets: [{ address: evmAddress('0x87870bca…'), chainId: chainId(1) }],
 *   user: evmAddress('0x742d35cc…'),
 *   orderBy: { name: OrderDirection.ASC },
 * });
 * ```
 */
export function useUserSupplies(
  args: UseUserSuppliesArgs,
): ReadResult<MarketUserReserveSupplyPosition[]>;

export function useUserSupplies({
  suspense = false,
  ...request
}: UseUserSuppliesArgs & {
  suspense?: boolean;
}): SuspendableResult<MarketUserReserveSupplyPosition[]> {
  return useSuspendableQuery({
    document: UserSuppliesQuery,
    variables: {
      request,
    },
    suspense,
  });
}

export type UseUserBorrowsArgs = UserBorrowsRequest;

/**
 * Fetch all user borrow positions.
 *
 * This signature supports React Suspense:
 *
 * ```tsx
 * const { data } = useUserBorrows({
 *   markets: [{ address: evmAddress('0x87870bca…'), chainId: chainId(1) }],
 *   user: evmAddress('0x742d35cc…'),
 *   orderBy: { name: OrderDirection.ASC },
 *   suspense: true
 * });
 * ```
 */
export function useUserBorrows(
  args: UseUserBorrowsArgs & Suspendable,
): SuspenseResult<MarketUserReserveBorrowPosition[]>;

/**
 * Fetch all user borrow positions.
 *
 * ```tsx
 * const { data, error, loading } = useUserBorrows({
 *   markets: [{ address: evmAddress('0x87870bca…'), chainId: chainId(1) }],
 *   user: evmAddress('0x742d35cc…'),
 *   orderBy: { name: OrderDirection.ASC },
 * });
 * ```
 */
export function useUserBorrows(
  args: UseUserBorrowsArgs,
): ReadResult<MarketUserReserveBorrowPosition[]>;

export function useUserBorrows({
  suspense = false,
  ...request
}: UseUserBorrowsArgs & {
  suspense?: boolean;
}): SuspendableResult<MarketUserReserveBorrowPosition[]> {
  return useSuspendableQuery({
    document: UserBorrowsQuery,
    variables: {
      request,
    },
    suspense,
  });
}

export type UseUserStateArgs = UserMarketStateRequest;

/**
 * Fetch user account market data across all reserves.
 *
 * This signature supports React Suspense:
 *
 * ```tsx
 * const { data } = useUserMarketState({
 *   market: evmAddress('0x1234…'),
 *   user: evmAddress('0x5678…'),
 *   chainId: chainId(1),
 *   suspense: true,
 * });
 * ```
 */
export function useUserMarketState(
  args: UseUserStateArgs & Suspendable,
): SuspenseResult<MarketUserState>;

/**
 * Fetch user account market data across all reserves.
 *
 * ```tsx
 * const { data, error, loading } = useUserMarketState({
 *   market: evmAddress('0x1234…'),
 *   user: evmAddress('0x5678…'),
 *   chainId: chainId(1),
 * });
 * ```
 */
export function useUserMarketState(
  args: UseUserStateArgs,
): ReadResult<MarketUserState>;

export function useUserMarketState({
  suspense = false,
  ...request
}: UseUserStateArgs & {
  suspense?: boolean;
}): SuspendableResult<MarketUserState> {
  return useSuspendableQuery({
    document: UserMarketStateQuery,
    variables: {
      request,
    },
    suspense,
  });
}

export type UseUserTransactionHistoryArgs = UserTransactionHistoryRequest;

/**
 * Fetch user transaction history.
 *
 * This signature supports React Suspense:
 *
 * ```tsx
 * const { data } = useUserTransactionHistory({
 *   suspense: true,
 * });
 * ```
 */
export function useUserTransactionHistory(
  args: UseUserTransactionHistoryArgs & Suspendable,
): SuspenseResult<PaginatedUserTransactionHistoryResult>;

/**
 * Fetch user transaction history.
 *
 * ```tsx
 * const { data, error, loading } = useUserTransactionHistory();
 * ```
 */
export function useUserTransactionHistory(
  args: UseUserTransactionHistoryArgs,
): ReadResult<PaginatedUserTransactionHistoryResult>;

export function useUserTransactionHistory({
  suspense = false,
  ...request
}: UseUserTransactionHistoryArgs & {
  suspense?: boolean;
}): SuspendableResult<PaginatedUserTransactionHistoryResult> {
  return useSuspendableQuery({
    document: UserTransactionHistoryQuery,
    variables: { request },
    suspense,
  });
}
