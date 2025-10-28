import type { FragmentOf } from 'gql.tada';
import { type FragmentDocumentFor, graphql } from '../graphql';
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

export const VaultFeesRecipientSplitFragment = graphql(
  `fragment VaultFeesRecipientSplit on VaultFeesRecipientSplit {
    __typename
    address
    split {
      ...PercentValue
    }
    isAaveLabs
  }`,
  [PercentValueFragment],
);
export type VaultFeesRecipientSplit = FragmentOf<
  typeof VaultFeesRecipientSplitFragment
>;

export const VaultFeesRecipientsConfigurationFragment = graphql(
  `fragment VaultFeesRecipientsConfiguration on VaultFeesRecipientsConfiguration {
    __typename
    address
    entries {
      ...VaultFeesRecipientSplit
    }
  }`,
  [VaultFeesRecipientSplitFragment],
);
export type VaultFeesRecipientsConfiguration = FragmentOf<
  typeof VaultFeesRecipientsConfigurationFragment
>;

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
    recipients {
      ...VaultFeesRecipientsConfiguration
    }
    balance {
      ...TokenAmount
    }
    feesBalance {
      ...TokenAmount
    }
    chainId
    vaultApr {
      ...PercentValue
    }
    userShares {
      ...UserVaultShares
    }
  }`,
  [
    ReserveFragment,
    PercentValueFragment,
    TokenAmountFragment,
    UserVaultSharesFragment,
    VaultFeesRecipientsConfigurationFragment,
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

export const VaultUserDepositItemFragment = graphql(
  `fragment VaultUserDepositItem on VaultUserDepositItem {
    __typename
    asset {
      ...TokenAmount
    }
    shares {
      ...TokenAmount
    }
    blockExplorerUrl
    txHash
    timestamp
  }`,
  [TokenAmountFragment],
);
export type VaultUserDepositItem = FragmentOf<
  typeof VaultUserDepositItemFragment
>;

export const VaultUserWithdrawItemFragment = graphql(
  `fragment VaultUserWithdrawItem on VaultUserWithdrawItem {
    __typename
    asset {
      ...TokenAmount
    }
    shares {
      ...TokenAmount
    }
    blockExplorerUrl
    txHash
    timestamp
  }`,
  [TokenAmountFragment],
);
export type VaultUserWithdrawItem = FragmentOf<
  typeof VaultUserWithdrawItemFragment
>;

export type VaultUserTransactionItem =
  | VaultUserDepositItem
  | VaultUserWithdrawItem;

export const VaultUserTransactionItemFragment: FragmentDocumentFor<
  VaultUserTransactionItem,
  'VaultUserTransactionItem'
> = graphql(
  `fragment VaultUserTransactionItem on VaultUserTransactionItem {
    __typename
    ... on VaultUserDepositItem {
      ...VaultUserDepositItem
    }
    ... on VaultUserWithdrawItem {
      ...VaultUserWithdrawItem
    }
  }`,
  [VaultUserDepositItemFragment, VaultUserWithdrawItemFragment],
);

/**
 * @internal
 */
export const PaginatedVaultUserTransactionHistoryResultFragment = graphql(
  `fragment PaginatedVaultUserTransactionHistoryResult on PaginatedVaultUserTransactionHistoryResult {
    __typename
    items {
      ...VaultUserTransactionItem
    }
    pageInfo {
      ...PaginatedResultInfo
    }
  }`,
  [PaginatedResultInfoFragment, VaultUserTransactionItemFragment],
);
export type PaginatedVaultUserTransactionHistoryResult = FragmentOf<
  typeof PaginatedVaultUserTransactionHistoryResultFragment
>;

export const VaultUserActivityItemFragment = graphql(
  `fragment VaultUserActivityItem on VaultUserActivityItem {
    __typename
    balance {
      ...TokenAmount
    }
    earned {
      ...TokenAmount
    }
    withdrew {
      ...TokenAmount
    }
    deposited {
      ...TokenAmount
    }
    date 
  }`,
  [TokenAmountFragment],
);

export type VaultUserActivityItem = FragmentOf<
  typeof VaultUserActivityItemFragment
>;

export const VaultUserActivityResultFragment = graphql(
  `fragment VaultUserActivityResult on VaultUserActivityResult {
    __typename
    earned {
      ...TokenAmount
    }
    breakdown {
      ...VaultUserActivityItem
    }
  }`,
  [TokenAmountFragment, VaultUserActivityItemFragment],
);
export type VaultUserActivityResult = FragmentOf<
  typeof VaultUserActivityResultFragment
>;
