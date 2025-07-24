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
import type { ResultAsync } from '@aave/types';
import type { AaveClient } from '../client';
import type { UnexpectedError } from '../errors';

/**
 * Fetches a specific vault by address and chain ID.
 *
 * **Example: By Address**
 * ```ts
 * const result = await vault(client, {
 *   by: {
 *     address: evmAddress('0x1234…'),
 *   },
 *   chainId: chainId(1),
 *   user: evmAddress('0x5678…'),
 * });
 * ```
 *
 * **Example: Tx Hash**
 * ```ts
 * const result = await vault(client, {
 *   by: {
 *     txHash: txHash('0x1234…'),
 *   },
 *   chainId: chainId(1),
 *   user: evmAddress('0x5678…'),
 * });
 * ```
 *
 * @param client - Aave client.
 * @param request - The vault request parameters.
 * @returns The vault data, or null if not found.
 */
export function vault(
  client: AaveClient,
  request: VaultRequest,
): ResultAsync<Vault | null, UnexpectedError> {
  return client.query(VaultQuery, {
    request,
  });
}

/**
 * Fetches vaults based on filter criteria.
 *
 * ```ts
 * const result = await vaults(client, {
 *   criteria: {
 *     ownedBy: [evmAddress('0x1234…')]
 *   },
 *   pageSize: PageSize.Ten,
 *   user: evmAddress('0x5678…'),
 * });
 * ```
 *
 * @param client - Aave client.
 * @param request - The vaults request parameters.
 * @returns The paginated vaults result.
 */
export function vaults(
  client: AaveClient,
  request: VaultsRequest,
): ResultAsync<PaginatedVaultsResult, UnexpectedError> {
  return client.query(VaultsQuery, {
    request,
  });
}

/**
 * Fetches vaults that a user has shares in.
 *
 * ```ts
 * const result = await userVaults(client, {
 *   user: evmAddress('0x1234…'),
 *   filters: {
 *     markets: [evmAddress('0x5678…')]
 *   },
 *   orderBy: { shares: OrderDirection.Desc },
 *   pageSize: PageSize.Fifty,
 * });
 * ```
 *
 * @param client - Aave client.
 * @param request - The user vaults request parameters.
 * @returns The paginated user vaults result.
 */
export function userVaults(
  client: AaveClient,
  request: UserVaultsRequest,
): ResultAsync<PaginatedVaultsResult, UnexpectedError> {
  return client.query(UserVaultsQuery, {
    request,
  });
}

/**
 * Determines the amount of shares that would be received for a deposit.
 *
 * ```ts
 * const result = await vaultPreviewDeposit(client, {
 *   vault: evmAddress('0x1234567890abcdef1234567890abcdef12345678'),
 *   chainId: chainId(1),
 *   amount: bigDecimal('1000'),
 * });
 *
 * if (result.isOk()) {
 *   console.log('Shares to receive:', result.value.amount.value);
 *   console.log('USD value:', result.value.usd);
 * }
 * ```
 *
 * @param client - Aave client.
 * @param request - The vault preview deposit request parameters.
 * @returns The simulated shares amount that would be received.
 */
export function vaultPreviewDeposit(
  client: AaveClient,
  request: VaultPreviewDepositRequest,
): ResultAsync<TokenAmount, UnexpectedError> {
  return client.query(VaultPreviewDepositQuery, {
    request,
  });
}

/**
 * Determines the amount of assets that would be required to mint a specific amount of vault shares.
 *
 * ```ts
 * const result = await vaultPreviewMint(client, {
 *   vault: evmAddress('0x1234567890abcdef1234567890abcdef12345678'),
 *   chainId: chainId(1),
 *   amount: bigDecimal('500'),
 * });
 *
 * if (result.isOk()) {
 *   console.log('Assets required:', result.value.amount.value);
 *   console.log('USD value:', result.value.usd);
 * }
 * ```
 *
 * @param client - Aave client.
 * @param request - The vault preview mint request parameters.
 * @returns The simulated assets amount that would be required.
 */
export function vaultPreviewMint(
  client: AaveClient,
  request: VaultPreviewMintRequest,
): ResultAsync<TokenAmount, UnexpectedError> {
  return client.query(VaultPreviewMintQuery, {
    request,
  });
}

/**
 * Determines the amount of shares that would be burned for a withdrawal.
 *
 * ```ts
 * const result = await vaultPreviewWithdraw(client, {
 *   vault: evmAddress('0x1234567890abcdef1234567890abcdef12345678'),
 *   chainId: chainId(1),
 *   amount: bigDecimal('750'),
 * });
 *
 * if (result.isOk()) {
 *   console.log('Shares to burn:', result.value.amount.value);
 *   console.log('USD value:', result.value.usd);
 * }
 * ```
 *
 * @param client - Aave client.
 * @param request - The vault preview withdraw request parameters.
 * @returns The simulated shares amount that would be burned.
 */
export function vaultPreviewWithdraw(
  client: AaveClient,
  request: VaultPreviewWithdrawRequest,
): ResultAsync<TokenAmount, UnexpectedError> {
  return client.query(VaultPreviewWithdrawQuery, {
    request,
  });
}

/**
 * Determines the amount of assets that would be received for redeeming a specific amount of vault shares.
 *
 * ```ts
 * const result = await vaultPreviewRedeem(client, {
 *   vault: evmAddress('0x1234567890abcdef1234567890abcdef12345678'),
 *   chainId: chainId(1),
 *   amount: bigDecimal('200'),
 * });
 *
 * if (result.isOk()) {
 *   console.log('Assets to receive:', result.value.amount.value);
 *   console.log('USD value:', result.value.usd);
 * }
 * ```
 *
 * @param client - Aave client.
 * @param request - The vault preview redeem request parameters.
 * @returns The simulated assets amount that would be received.
 */
export function vaultPreviewRedeem(
  client: AaveClient,
  request: VaultPreviewRedeemRequest,
): ResultAsync<TokenAmount, UnexpectedError> {
  return client.query(VaultPreviewRedeemQuery, {
    request,
  });
}
