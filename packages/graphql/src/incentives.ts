import type { FragmentOf } from 'gql.tada';
import { CurrencyFragment, TokenAmountFragment } from './fragments/common';
import { MeritSavingsGhoIncentiveFragment } from './fragments/incentives';
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

// -------------------------------------------------------------------------
// Canonical user rewards (replaces `userMeritRewards` — same shape, adds the
// `rewardIds` filter for scoping the claim tx to specific Aave-owned programs).
// -------------------------------------------------------------------------

export const ClaimableRewardFragment = graphql(
  `fragment ClaimableReward on ClaimableReward {
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
export type ClaimableReward = FragmentOf<typeof ClaimableRewardFragment>;

export const UserRewardsFragment = graphql(
  `fragment UserRewards on UserRewards {
    __typename
    chain
    claimable {
      ...ClaimableReward
    }
    transaction {
      ...TransactionRequest
    }
  }`,
  [ClaimableRewardFragment, TransactionRequestFragment],
);
export type UserRewards = FragmentOf<typeof UserRewardsFragment>;

export const UserRewardsQuery = graphql(
  `query UserRewards($request: UserRewardsRequest!) {
    value: userRewards(request: $request) {
      ...UserRewards
    }
  }`,
  [UserRewardsFragment],
);
export type UserRewardsRequest = RequestOf<typeof UserRewardsQuery>;

/**
 * @internal
 */
export const SavingsGhoIncentiveQuery = graphql(
  `query SavingsGhoIncentive($chainId: ChainId) {
    value: savingsGhoIncentive(chainId: $chainId) {
      ...MeritSavingsGhoIncentive
    }
  }`,
  [MeritSavingsGhoIncentiveFragment],
);
