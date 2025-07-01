import {
  UserBorrowsQuery,
  type UserBorrowsRequest,
  type UserReserveBorrowPosition,
  type UserReserveSupplyPosition,
  UserSuppliesQuery,
  type UserSuppliesRequest,
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
 *   markets: [evmAddress('0x87870bca...')],
 *   user: evmAddress('0x742d35cc...'),
 *   orderBy: { name: OrderDirection.ASC },
 *   suspense: true,
 * });
 * ```
 */
export function useUserSupplies(
  args: UseUserSuppliesArgs & Suspendable,
): SuspenseResult<UserReserveSupplyPosition[]>;

/**
 * Fetch all user supply positions.
 *
 * ```tsx
 * const { data, loading } = useUserSupplies({
 *   markets: [evmAddress('0x87870bca...')],
 *   user: evmAddress('0x742d35cc...'),
 *   orderBy: { name: OrderDirection.ASC },
 * });
 * ```
 */
export function useUserSupplies(
  args: UseUserSuppliesArgs,
): ReadResult<UserReserveSupplyPosition[]>;

export function useUserSupplies({
  suspense = false,
  markets,
  user,
  orderBy,
}: UseUserSuppliesArgs & {
  suspense?: boolean;
}): SuspendableResult<UserReserveSupplyPosition[]> {
  return useSuspendableQuery({
    document: UserSuppliesQuery,
    variables: {
      request: { markets, user, orderBy },
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
 *   markets: [evmAddress('0x87870bca...')],
 *   user: evmAddress('0x742d35cc...'),
 *   orderBy: { name: OrderDirection.ASC },
 *   suspense: true
 * });
 * ```
 */
export function useUserBorrows(
  args: UseUserBorrowsArgs & Suspendable,
): SuspenseResult<UserReserveBorrowPosition[]>;

/**
 * Fetch all user borrow positions.
 *
 * ```tsx
 * const { data, loading } = useUserBorrows({
 *   markets: [evmAddress('0x87870bca...')],
 *   user: evmAddress('0x742d35cc...'),
 *   orderBy: { name: OrderDirection.ASC },
 * });
 * ```
 */
export function useUserBorrows(
  args: UseUserBorrowsArgs,
): ReadResult<UserReserveBorrowPosition[]>;

export function useUserBorrows({
  suspense = false,
  markets,
  user,
  orderBy,
}: UseUserBorrowsArgs & {
  suspense?: boolean;
}): SuspendableResult<UserReserveBorrowPosition[]> {
  return useSuspendableQuery({
    document: UserBorrowsQuery,
    variables: {
      request: { markets, user, orderBy },
    },
    suspense,
  });
}
