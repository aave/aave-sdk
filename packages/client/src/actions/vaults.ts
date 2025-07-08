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
import type { ResultAsync } from '@aave/types';
import type { AaveClient } from '../client';
import type { UnexpectedError } from '../errors';

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
