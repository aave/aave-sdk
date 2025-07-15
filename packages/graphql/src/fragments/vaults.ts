import type { FragmentOf } from 'gql.tada';
import { graphql } from '../graphql';
import { PaginatedResultInfoFragment, TokenAmountFragment } from './common';
import { ReserveFragment } from './reserve';

export const UserVaultSharesFragment = graphql(
  `fragment UserVaultShares on UserVaultShares {
    __typename
    shares {
      ...TokenAmount
    }
    amountDeposited {
      ...TokenAmount
    }
    amountWithdrawn {
      ...TokenAmount
    }
  }`,
  [TokenAmountFragment],
);
export type UserVaultShares = FragmentOf<typeof UserVaultSharesFragment>;

export const VaultFragment = graphql(
  `fragment Vault on Vault {
    __typename
    address
    owner
    shareName
    shareSymbol
    usedReserve {
      ...Reserve
    }
    fee
    totalFeeRevenue {
      ...TokenAmount
    }
    balance {
      ...TokenAmount
    }
    chainId
    userShares {
      ...UserVaultShares
    }
  }`,
  [ReserveFragment, TokenAmountFragment, UserVaultSharesFragment],
);
export type Vault = FragmentOf<typeof VaultFragment>;

/**
 * @internal
 */
export const PaginatedVaultsResultFragment = graphql(
  `fragment PaginatedVaultsResult on PaginatedVaultsResult {
    __typename
    items {
      ...Vault
    }
    pageInfo {
      ...PaginatedResultInfo
    }
  }`,
  [VaultFragment, PaginatedResultInfoFragment],
);
export type PaginatedVaultsResult = FragmentOf<
  typeof PaginatedVaultsResultFragment
>;
