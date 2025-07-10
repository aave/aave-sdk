import {
  type PaginatedVaultsResult,
  UserVaultsQuery,
  type UserVaultsRequest,
  type Vault,
  VaultQuery,
  type VaultRequest,
  VaultsQuery,
  type VaultsRequest,
} from '@aave/graphql';
import type {
  ReadResult,
  Suspendable,
  SuspendableResult,
  SuspenseResult,
} from './helpers';
import { useSuspendableQuery } from './helpers';

export type UseVaultArgs = VaultRequest;

/**
 * Fetch a single vault by address and chain ID.
 *
 * This signature supports React Suspense:
 *
 * ```tsx
 * const { data } = useVault({
 *   by: {
 *     address: evmAddress('0x1234…'),
 *   },
 *   chainId: chainId(1),
 *   user: evmAddress('0x5678…'),
 *   suspense: true,
 * });
 * ```
 */
export function useVault(
  args: UseVaultArgs & Suspendable,
): SuspenseResult<Vault | null>;

/**
 * Fetch a single vault by address and chain ID.
 *
 * ```tsx
 * const { data, loading } = useVault({
 *   address: evmAddress('0x1234…'),
 *   chainId: chainId(1),
 *   user: evmAddress('0x5678…'),
 * });
 * ```
 */
export function useVault(args: UseVaultArgs): ReadResult<Vault | null>;

export function useVault({
  suspense = false,
  by,
  chainId,
  user,
}: UseVaultArgs & {
  suspense?: boolean;
}): SuspendableResult<Vault | null> {
  return useSuspendableQuery({
    document: VaultQuery,
    variables: {
      request: { by, chainId, user },
    },
    suspense,
  });
}

export type UseVaultsArgs = VaultsRequest;

/**
 * Fetch vaults based on filter criteria.
 *
 * This signature supports React Suspense:
 *
 * ```tsx
 * const { data } = useVaults({
 *   criteria: {
 *     ownedBy: [evmAddress('0x1234…')]
 *   },
 *   pageSize: PageSize.Ten,
 *   user: evmAddress('0x5678…'),
 *   suspense: true,
 * });
 * ```
 */
export function useVaults(
  args: UseVaultsArgs & Suspendable,
): SuspenseResult<PaginatedVaultsResult>;

/**
 * Fetch vaults based on filter criteria.
 *
 * ```tsx
 * const { data, loading } = useVaults({
 *   criteria: {
 *     ownedBy: [evmAddress('0x1234…')]
 *   },
 *   pageSize: PageSize.Ten,
 *   user: evmAddress('0x5678…'),
 * });
 * ```
 */
export function useVaults(
  args: UseVaultsArgs,
): ReadResult<PaginatedVaultsResult>;

export function useVaults({
  suspense = false,
  criteria,
  pageSize,
  cursor,
  user,
}: UseVaultsArgs & {
  suspense?: boolean;
}): SuspendableResult<PaginatedVaultsResult> {
  return useSuspendableQuery({
    document: VaultsQuery,
    variables: {
      request: { criteria, pageSize, cursor, user },
    },
    suspense,
  });
}

export type UseUserVaultsArgs = UserVaultsRequest;

/**
 * Fetch vaults that a user has shares in.
 *
 * This signature supports React Suspense:
 *
 * ```tsx
 * const { data } = useUserVaults({
 *   user: evmAddress('0x1234…'),
 *   filters: {
 *     markets: [evmAddress('0x5678…')]
 *   },
 *   orderBy: { shares: OrderDirection.Desc },
 *   pageSize: PageSize.Fifty,
 *   suspense: true,
 * });
 * ```
 */
export function useUserVaults(
  args: UseUserVaultsArgs & Suspendable,
): SuspenseResult<PaginatedVaultsResult>;

/**
 * Fetch vaults that a user has shares in.
 *
 * ```tsx
 * const { data, loading } = useUserVaults({
 *   user: evmAddress('0x1234…'),
 *   filters: {
 *     markets: [evmAddress('0x5678…')]
 *   },
 *   orderBy: { shares: OrderDirection.Desc },
 *   pageSize: PageSize.Fifty,
 * });
 * ```
 */
export function useUserVaults(
  args: UseUserVaultsArgs,
): ReadResult<PaginatedVaultsResult>;

export function useUserVaults({
  suspense = false,
  user,
  filters,
  orderBy,
  pageSize,
  cursor,
}: UseUserVaultsArgs & {
  suspense?: boolean;
}): SuspendableResult<PaginatedVaultsResult> {
  return useSuspendableQuery({
    document: UserVaultsQuery,
    variables: {
      request: { user, filters, orderBy, pageSize, cursor },
    },
    suspense,
  });
}
