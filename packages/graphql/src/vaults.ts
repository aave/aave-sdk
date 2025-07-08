import {
  PaginatedVaultsResultFragment,
  VaultFragment,
} from './fragments/vaults';
import { graphql } from './graphql';

/**
 * @internal
 */
export const VaultQuery = graphql(
  `query Vault($request: VaultRequest!) {
    value: vault(request: $request) {
      ...Vault
    }
  }`,
  [VaultFragment],
);
export type VaultRequest = ReturnType<typeof graphql.scalar<'VaultRequest'>>;

/**
 * @internal
 */
export const VaultsQuery = graphql(
  `query Vaults($request: VaultsRequest!) {
    value: vaults(request: $request) {
      ...PaginatedVaultsResult
    }
  }`,
  [PaginatedVaultsResultFragment],
);
export type VaultsRequest = ReturnType<typeof graphql.scalar<'VaultsRequest'>>;

/**
 * @internal
 */
export const UserVaultsQuery = graphql(
  `query UserVaults($request: UserVaultsRequest!) {
    value: userVaults(request: $request) {
      ...PaginatedVaultsResult
    }
  }`,
  [PaginatedVaultsResultFragment],
);
export type UserVaultsRequest = ReturnType<
  typeof graphql.scalar<'UserVaultsRequest'>
>;
