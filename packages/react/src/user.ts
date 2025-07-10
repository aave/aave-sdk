import type {
  MarketUserReserveBorrowPosition,
  MarketUserReserveSupplyPosition,
  MarketUserState,
  UserBorrowsRequest,
  UserMarketStateRequest,
  UserSuppliesRequest,
} from '@aave/graphql';
import {
  UserBorrowsQuery,
  UserMarketStateQuery,
  UserSuppliesQuery,
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
 * const { data, loading } = useUserSupplies({
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
  markets,
  user,
  collateralsOnly,
  orderBy,
}: UseUserSuppliesArgs & {
  suspense?: boolean;
}): SuspendableResult<MarketUserReserveSupplyPosition[]> {
  return useSuspendableQuery({
    document: UserSuppliesQuery,
    variables: {
      request: { markets, user, collateralsOnly, orderBy },
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
 * const { data, loading } = useUserBorrows({
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
  markets,
  user,
  orderBy,
}: UseUserBorrowsArgs & {
  suspense?: boolean;
}): SuspendableResult<MarketUserReserveBorrowPosition[]> {
  return useSuspendableQuery({
    document: UserBorrowsQuery,
    variables: {
      request: { markets, user, orderBy },
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
 * const { data, loading } = useUserMarketState({
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
  market,
  user,
  chainId,
}: UseUserStateArgs & {
  suspense?: boolean;
}): SuspendableResult<MarketUserState> {
  return useSuspendableQuery({
    document: UserMarketStateQuery,
    variables: {
      request: { market, user, chainId },
    },
    suspense,
  });
}
