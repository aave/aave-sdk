import type { FragmentOf } from 'gql.tada';
import { CurrencyFragment, TokenAmountFragment } from './fragments/common';
import { TransactionRequestFragment } from './fragments/transactions';
import { graphql, type RequestOf } from './graphql';

export const MeritRewardFragment = graphql(
  `fragment MeritReward on MeritReward {
    __typename
    amount {
      ...TokenAmount
    }
    currency {
      ...Currency
    }
  }`,
  [TokenAmountFragment, CurrencyFragment],
);
export type MeritReward = FragmentOf<typeof MeritRewardFragment>;

export const MeritClaimRewardsTransactionFragment = graphql(
  `fragment MeritClaimRewardsTransaction on MeritClaimRewardsTransaction {
    __typename
    chain
    rewards {
      ...MeritReward
    }
    transaction {
      ...TransactionRequest
    }
  }`,
  [MeritRewardFragment, TransactionRequestFragment],
);
export type MeritClaimRewardsTransaction = FragmentOf<
  typeof MeritClaimRewardsTransactionFragment
>;

export const MeritClaimRewardsQuery = graphql(
  `query MeritClaimRewards($request: MeritClaimRewardsRequest!) {
    value: meritClaimRewards(request: $request) {
      ...MeritClaimRewardsTransaction
    }
  }`,
  [MeritClaimRewardsTransactionFragment],
);
export type MeritClaimRewardsRequest = RequestOf<typeof MeritClaimRewardsQuery>;
