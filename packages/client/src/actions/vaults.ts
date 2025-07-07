import {
  type PaginatedVaultsResult,
  UserVaultsQuery,
  type UserVaultsRequest,
  type Vault,
  VaultQuery,
  type VaultQueryRequest,
  VaultsQuery,
  type VaultsQueryRequest,
} from '@aave/graphql';
import {
  type EvmAddress,
  type Prettify,
  type ResultAsync,
  ZERO_ADDRESS,
} from '@aave/types';
import type { AaveClient } from '../client';
import type { UnexpectedError } from '../errors';

export type VaultRequest = Prettify<
  VaultQueryRequest & {
    /**
     * The user address to get user-specific data for the vault.
     * If not provided, user-specific fields will be null.
     */
    user?: EvmAddress;
  }
>;

/**
 * Fetches a specific vault by address and chain ID.
 *
 * ```ts
 * const result = await vault(client, {
 *   address: evmAddress('0x1234…'),
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
  { user, ...request }: VaultRequest,
): ResultAsync<Vault | null, UnexpectedError> {
  return client.query(VaultQuery, {
    request,
    includeUserShares: !!user,
    userAddress: user ?? ZERO_ADDRESS,
  });
}

export type VaultsRequest = Prettify<
  VaultsQueryRequest & {
    /**
     * The user address to get user-specific data for the vaults.
     * If not provided, user-specific fields will be null.
     */
    user?: EvmAddress;
  }
>;

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
  { user, ...request }: VaultsRequest,
): ResultAsync<PaginatedVaultsResult, UnexpectedError> {
  return client.query(VaultsQuery, {
    request,
    includeUserShares: !!user,
    userAddress: user ?? ZERO_ADDRESS,
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
    userddress: request.user,
  });
}

