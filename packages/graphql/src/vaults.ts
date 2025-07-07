import {
  PaginatedVaultsResultFragment,
  VaultFragment,
} from './fragments/vaults';
import { graphql } from './graphql';

/**
 * @internal
 */
export const VaultQuery = graphql(
  `query Vault($request: VaultRequest!, $includeUserShares: Boolean!, $userAddress: EvmAddress!) {
    value: vault(request: $request) {
      ...Vault
    }
  }`,
  [VaultFragment],
);
export type VaultQueryRequest = ReturnType<
  typeof graphql.scalar<'VaultRequest'>
>;

/**
 * @internal
 */
export const VaultsQuery = graphql(
  `query Vaults($request: VaultsRequest!, $includeUserShares: Boolean!, $userAddress: EvmAddress!) {
    value: vaults(request: $request) {
      ...PaginatedVaultsResult
    }
  }`,
  [PaginatedVaultsResultFragment],
);
export type VaultsQueryRequest = ReturnType<
  typeof graphql.scalar<'VaultsRequest'>
>;

/**
 * @internal
 */
export const UserVaultsQuery = graphql(
  `query UserVaults($request: UserVaultsRequest!, $includeUserShares: Boolean!, $userAddress: EvmAddress!) {
    value: userVaults(request: $request) {
      ...PaginatedVaultsResult
    }
  }`,
  [PaginatedVaultsResultFragment],
);
export type UserVaultsRequest = ReturnType<
  typeof graphql.scalar<'UserVaultsRequest'>
>;
