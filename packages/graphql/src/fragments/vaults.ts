import type { FragmentOf } from 'gql.tada';
import { graphql } from '../graphql';
import {
  DecimalValueFragment,
  PaginatedResultInfoFragment,
  TokenAmountFragment,
} from './common';
import { ReserveFragment } from './reserve';

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
    feesFromYield {
      ...TokenAmount
    }
    balance {
      ...TokenAmount
    }
    chainId
    userShares {
      ...DecimalValue
    }
  }`,
  [ReserveFragment, TokenAmountFragment, DecimalValueFragment],
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
