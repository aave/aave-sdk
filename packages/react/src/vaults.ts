import {
  type PaginatedVaultsResult,
  type TokenAmount,
  UserVaultsQuery,
  type UserVaultsRequest,
  type Vault,
  VaultPreviewDepositQuery,
  type VaultPreviewDepositRequest,
  VaultPreviewMintQuery,
  type VaultPreviewMintRequest,
  VaultPreviewRedeemQuery,
  type VaultPreviewRedeemRequest,
  VaultPreviewWithdrawQuery,
  type VaultPreviewWithdrawRequest,
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
  ...request
}: UseVaultArgs & {
  suspense?: boolean;
}): SuspendableResult<Vault | null> {
  return useSuspendableQuery({
    document: VaultQuery,
    variables: {
      request,
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
  ...request
}: UseVaultsArgs & {
  suspense?: boolean;
}): SuspendableResult<PaginatedVaultsResult> {
  return useSuspendableQuery({
    document: VaultsQuery,
    variables: {
      request,
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
  ...request
}: UseUserVaultsArgs & {
  suspense?: boolean;
}): SuspendableResult<PaginatedVaultsResult> {
  return useSuspendableQuery({
    document: UserVaultsQuery,
    variables: {
      request,
    },
    suspense,
  });
}

export type UseVaultPreviewDepositArgs = VaultPreviewDepositRequest;

/**
 * Determines the amount of shares that would be received for a deposit.
 *
 * This signature supports React Suspense:
 *
 * ```tsx
 * const { data } = useVaultPreviewDeposit({
 *   vault: evmAddress('0x1234567890abcdef1234567890abcdef12345678'),
 *   chainId: chainId(1),
 *   amount: bigDecimal('1000'),
 *   suspense: true,
 * });
 * ```
 */
export function useVaultPreviewDeposit(
  args: UseVaultPreviewDepositArgs & Suspendable,
): SuspenseResult<TokenAmount>;

/**
 * Simulate a deposit into a vault at the current block with current on-chain conditions.
 *
 * ```tsx
 * const { data, loading } = useVaultPreviewDeposit({
 *   vault: evmAddress('0x1234567890abcdef1234567890abcdef12345678'),
 *   chainId: chainId(1),
 *   amount: bigDecimal('1000'),
 * });
 * ```
 */
export function useVaultPreviewDeposit(
  args: UseVaultPreviewDepositArgs,
): ReadResult<TokenAmount>;

export function useVaultPreviewDeposit({
  suspense = false,
  ...request
}: UseVaultPreviewDepositArgs & {
  suspense?: boolean;
}): SuspendableResult<TokenAmount> {
  return useSuspendableQuery({
    document: VaultPreviewDepositQuery,
    variables: {
      request,
    },
    suspense,
  });
}

export type UseVaultPreviewMintArgs = VaultPreviewMintRequest;

/**
 * Determines the amount of assets that would be required to mint a specific amount of vault shares.
 *
 * This signature supports React Suspense:
 *
 * ```tsx
 * const { data } = useVaultPreviewMint({
 *   vault: evmAddress('0x1234567890abcdef1234567890abcdef12345678'),
 *   chainId: chainId(1),
 *   amount: bigDecimal('500'),
 *   suspense: true,
 * });
 * ```
 */
export function useVaultPreviewMint(
  args: UseVaultPreviewMintArgs & Suspendable,
): SuspenseResult<TokenAmount>;

/**
 * Simulate minting exact vault shares at the current block with current on-chain conditions.
 *
 * ```tsx
 * const { data, loading } = useVaultPreviewMint({
 *   vault: evmAddress('0x1234567890abcdef1234567890abcdef12345678'),
 *   chainId: chainId(1),
 *   amount: bigDecimal('500'),
 * });
 * ```
 */
export function useVaultPreviewMint(
  args: UseVaultPreviewMintArgs,
): ReadResult<TokenAmount>;

export function useVaultPreviewMint({
  suspense = false,
  ...request
}: UseVaultPreviewMintArgs & {
  suspense?: boolean;
}): SuspendableResult<TokenAmount> {
  return useSuspendableQuery({
    document: VaultPreviewMintQuery,
    variables: {
      request,
    },
    suspense,
  });
}

export type UseVaultPreviewWithdrawArgs = VaultPreviewWithdrawRequest;

/**
 * Determines the amount of shares that would be burned for a withdrawal.
 *
 * This signature supports React Suspense:
 *
 * ```tsx
 * const { data } = useVaultPreviewWithdraw({
 *   vault: evmAddress('0x1234567890abcdef1234567890abcdef12345678'),
 *   chainId: chainId(1),
 *   amount: bigDecimal('750'),
 *   suspense: true,
 * });
 * ```
 */
export function useVaultPreviewWithdraw(
  args: UseVaultPreviewWithdrawArgs & Suspendable,
): SuspenseResult<TokenAmount>;

/**
 * Simulate withdrawing assets from a vault at the current block with current on-chain conditions.
 *
 * ```tsx
 * const { data, loading } = useVaultPreviewWithdraw({
 *   vault: evmAddress('0x1234567890abcdef1234567890abcdef12345678'),
 *   chainId: chainId(1),
 *   amount: bigDecimal('750'),
 * });
 * ```
 */
export function useVaultPreviewWithdraw(
  args: UseVaultPreviewWithdrawArgs,
): ReadResult<TokenAmount>;

export function useVaultPreviewWithdraw({
  suspense = false,
  ...request
}: UseVaultPreviewWithdrawArgs & {
  suspense?: boolean;
}): SuspendableResult<TokenAmount> {
  return useSuspendableQuery({
    document: VaultPreviewWithdrawQuery,
    variables: {
      request,
    },
    suspense,
  });
}

export type UseVaultPreviewRedeemArgs = VaultPreviewRedeemRequest;

/**
 * Determines the amount of assets that would be received for redeeming a specific amount of vault shares.
 *
 * This signature supports React Suspense:
 *
 * ```tsx
 * const { data } = useVaultPreviewRedeem({
 *   vault: evmAddress('0x1234567890abcdef1234567890abcdef12345678'),
 *   chainId: chainId(1),
 *   amount: bigDecimal('200'),
 *   suspense: true,
 * });
 * ```
 */
export function useVaultPreviewRedeem(
  args: UseVaultPreviewRedeemArgs & Suspendable,
): SuspenseResult<TokenAmount>;

/**
 * Simulate redeeming vault shares at the current block with current on-chain conditions.
 *
 * ```tsx
 * const { data, loading } = useVaultPreviewRedeem({
 *   vault: evmAddress('0x1234567890abcdef1234567890abcdef12345678'),
 *   chainId: chainId(1),
 *   amount: bigDecimal('200'),
 * });
 * ```
 */
export function useVaultPreviewRedeem(
  args: UseVaultPreviewRedeemArgs,
): ReadResult<TokenAmount>;

export function useVaultPreviewRedeem({
  suspense = false,
  ...request
}: UseVaultPreviewRedeemArgs & {
  suspense?: boolean;
}): SuspendableResult<TokenAmount> {
  return useSuspendableQuery({
    document: VaultPreviewRedeemQuery,
    variables: {
      request,
    },
    suspense,
  });
}
