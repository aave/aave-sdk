import {
  PaginatedVaultsResultFragment,
  VaultFragment,
} from './fragments/vaults';
import { graphql, type RequestOf } from './graphql';

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
export type VaultRequest = RequestOf<typeof VaultQuery>;

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
export type VaultsRequest = RequestOf<typeof VaultsQuery>;

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
export type UserVaultsRequest = RequestOf<typeof UserVaultsQuery>;
