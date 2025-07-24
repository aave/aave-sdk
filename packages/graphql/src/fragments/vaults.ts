import type { FragmentOf } from 'gql.tada';
import { graphql } from '../graphql';
import {
  PaginatedResultInfoFragment,
  PercentValueFragment,
  TokenAmountFragment,
} from './common';
import { ReserveFragment } from './reserve';

export const UserVaultSharesFragment = graphql(
  `fragment UserVaultShares on UserVaultShares {
    __typename
    shares {
      ...TokenAmount
    }
    balance {
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
    fee {
      ...PercentValue
    }
    totalFeeRevenue {
      ...TokenAmount
    }
    balance {
      ...TokenAmount
    }
    feesBalance {
      ...TokenAmount
    }
    chainId
    userShares {
      ...UserVaultShares
    }
  }`,
  [
    ReserveFragment,
    PercentValueFragment,
    TokenAmountFragment,
    UserVaultSharesFragment,
  ],
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
