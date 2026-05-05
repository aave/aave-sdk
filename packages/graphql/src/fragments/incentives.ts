import type { FragmentOf } from 'gql.tada';
import { graphql } from '../graphql';

export const MeritSavingsGhoIncentiveFragment = graphql(
  `fragment MeritSavingsGhoIncentive on MeritSavingsGhoIncentive {
    __typename
    apr {
      __typename
      value
      raw
      decimals
    }
    claimLink
    actionKey
    rewardTokenAddress
    rewardTokenSymbol
    customMessage
    customForumLink
  }`,
);
export type MeritSavingsGhoIncentive = FragmentOf<
  typeof MeritSavingsGhoIncentiveFragment
>;
