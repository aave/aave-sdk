import type { FragmentOf } from 'gql.tada';
import { CurrencyFragment, TokenAmountFragment } from './fragments/common';
import { TransactionRequestFragment } from './fragments/transactions';
import { graphql, type RequestOf } from './graphql';

export const ClaimableMeritRewardFragment = graphql(
  `fragment ClaimableMeritReward on ClaimableMeritReward {
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
export type ClaimableMeritReward = FragmentOf<
  typeof ClaimableMeritRewardFragment
>;

export const UserMeritRewardsFragment = graphql(
  `fragment UserMeritRewards on UserMeritRewards {
    __typename
    chain
    claimable {
      ...ClaimableMeritReward
    }
    transaction {
      ...TransactionRequest
    }
  }`,
  [ClaimableMeritRewardFragment, TransactionRequestFragment],
);
export type UserMeritRewards = FragmentOf<typeof UserMeritRewardsFragment>;

export const UserMeritRewardsQuery = graphql(
  `query UserMeritRewards($request: UserMeritRewardsRequest!) {
    value: userMeritRewards(request: $request) {
      ...UserMeritRewards
    }
  }`,
  [UserMeritRewardsFragment],
);
export type UserMeritRewardsRequest = RequestOf<typeof UserMeritRewardsQuery>;
