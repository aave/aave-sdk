import type { UnexpectedError } from '@aave/client';
import {
  vaultPreviewDeposit,
  vaultPreviewMint,
  vaultPreviewRedeem,
  vaultPreviewWithdraw,
} from '@aave/client/actions';
import {
  type PaginatedVaultsResult,
  type TokenAmount,
  UserVaultsQuery,
  type UserVaultsRequest,
  type Vault,
  type VaultPreviewDepositRequest,
  type VaultPreviewMintRequest,
  type VaultPreviewRedeemRequest,
  type VaultPreviewWithdrawRequest,
  VaultQuery,
  type VaultRequest,
  VaultsQuery,
  type VaultsRequest,
} from '@aave/graphql';
import { useAaveClient } from './context';
import type {
  ReadResult,
  Suspendable,
  SuspendableResult,
  SuspenseResult,
  UseAsyncTask,
} from './helpers';
import { useAsyncTask, useSuspendableQuery } from './helpers';

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

/**
 * Determines the amount of shares that would be received for a deposit.
 *
 * ```ts
 * const [preview, { loading, error }] = useVaultDepositPreview();
 *
 * // …
 *
 * const result = await preview({
 *   vault: evmAddress('0x1234567890abcdef1234567890abcdef12345678'),
 *   chainId: chainId(1),
 *   amount: bigDecimal('1000'),
 * });
 *
 * if (result.isErr()) {
 *   console.error(result.error);
 * } else {
 *   console.log(result.value);
 * }
 * ```
 */
export function useVaultDepositPreview(): UseAsyncTask<
  VaultPreviewDepositRequest,
  TokenAmount,
  UnexpectedError
> {
  const client = useAaveClient();

  return useAsyncTask((request: VaultPreviewDepositRequest) =>
    vaultPreviewDeposit(client, request),
  );
}

/**
 * Determines the amount of assets that would be required to mint a specific amount of vault shares.
 *
 * ```ts
 * const [preview, { loading, error }] = useVaultMintPreview();
 *
 * // …
 *
 * const result = await preview({
 *   vault: evmAddress('0x1234567890abcdef1234567890abcdef12345678'),
 *   chainId: chainId(1),
 *   amount: bigDecimal('500'),
 * });
 *
 * if (result.isErr()) {
 *   console.error(result.error);
 * } else {
 *   console.log(result.value);
 * }
 * ```
 */
export function useVaultMintPreview(): UseAsyncTask<
  VaultPreviewMintRequest,
  TokenAmount,
  UnexpectedError
> {
  const client = useAaveClient();

  return useAsyncTask((request: VaultPreviewMintRequest) =>
    vaultPreviewMint(client, request),
  );
}

/**
 * Determines the amount of shares that would be burned for a withdrawal.
 *
 * ```ts
 * const [preview, { loading, error }] = useVaultWithdrawPreview();
 *
 * // …
 *
 * const result = await preview({
 *   vault: evmAddress('0x1234567890abcdef1234567890abcdef12345678'),
 *   chainId: chainId(1),
 *   amount: bigDecimal('750'),
 * });
 *
 * if (result.isErr()) {
 *   console.error(result.error);
 * } else {
 *   console.log(result.value);
 * }
 * ```
 */
export function useVaultWithdrawPreview(): UseAsyncTask<
  VaultPreviewWithdrawRequest,
  TokenAmount,
  UnexpectedError
> {
  const client = useAaveClient();

  return useAsyncTask((request: VaultPreviewWithdrawRequest) =>
    vaultPreviewWithdraw(client, request),
  );
}

/**
 * Determines the amount of assets that would be received for redeeming a specific amount of vault shares.
 *
 * This signature supports React Suspense:
 *
 * ```ts
 * const [preview, { loading, error }] = useVaultRedeemPreview();
 *
 * // …
 *
 * const result = await preview({
 *   vault: evmAddress('0x1234567890abcdef1234567890abcdef12345678'),
 *   chainId: chainId(1),
 *   amount: bigDecimal('200'),
 * });
 *
 * if (result.isErr()) {
 *   console.error(result.error);
 * } else {
 *   console.log(result.value);
 * }
 * ```
 */
export function useVaultRedeemPreview(): UseAsyncTask<
  VaultPreviewRedeemRequest,
  TokenAmount,
  UnexpectedError
> {
  const client = useAaveClient();

  return useAsyncTask((request: VaultPreviewRedeemRequest) =>
    vaultPreviewRedeem(client, request),
  );
}
