import { TokenAmountFragment } from './fragments/common';
import {
  PaginatedVaultsResultFragment,
  type PaginatedVaultUserTransactionHistoryResult,
  PaginatedVaultUserTransactionHistoryResultFragment,
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

/**
 * @internal
 */
export const VaultPreviewDepositQuery = graphql(
  `query VaultPreviewDeposit($request: VaultOperationPreviewRequest!) {
    value: vaultPreviewDeposit(request: $request) {
      ...TokenAmount
    }
  }`,
  [TokenAmountFragment],
);
export type VaultPreviewDepositRequest = RequestOf<
  typeof VaultPreviewDepositQuery
>;

/**
 * @internal
 */
export const VaultPreviewMintQuery = graphql(
  `query VaultPreviewMint($request: VaultOperationPreviewRequest!) {
    value: vaultPreviewMint(request: $request) {
      ...TokenAmount
    }
  }`,
  [TokenAmountFragment],
);
export type VaultPreviewMintRequest = RequestOf<typeof VaultPreviewMintQuery>;

/**
 * @internal
 */
export const VaultPreviewWithdrawQuery = graphql(
  `query VaultPreviewWithdraw($request: VaultOperationPreviewRequest!) {
    value: vaultPreviewWithdraw(request: $request) {
      ...TokenAmount
    }
  }`,
  [TokenAmountFragment],
);
export type VaultPreviewWithdrawRequest = RequestOf<
  typeof VaultPreviewWithdrawQuery
>;

/**
 * @internal
 */
export const VaultPreviewRedeemQuery = graphql(
  `query VaultPreviewRedeem($request: VaultOperationPreviewRequest!) {
    value: vaultPreviewRedeem(request: $request) {
      ...TokenAmount
    }
  }`,
  [TokenAmountFragment],
);
export type VaultPreviewRedeemRequest = RequestOf<
  typeof VaultPreviewRedeemQuery
>;

/**
 * @internal
 */
export const VaultUserTransactionHistoryQuery = graphql(
  `query VaultUserTransactionHistory($request: VaultUserTransactionHistoryRequest!) {
    value: vaultUserTransactionHistory(request: $request) {
      ...PaginatedVaultUserTransactionHistoryResult
    }
  }`,
  [PaginatedVaultUserTransactionHistoryResultFragment],
);
export type VaultUserTransactionHistoryRequest = RequestOf<
  typeof VaultUserTransactionHistoryQuery
>;
export type VaultUserTransactionHistoryResult = {
  value: PaginatedVaultUserTransactionHistoryResult;
};
