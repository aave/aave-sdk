import type { FragmentOf } from 'gql.tada';
import { graphql } from '../graphql';
import { ChainFragment } from './chain';
import { DecimalValueFragment } from './common';

export const MarketFragment = graphql(
  `fragment Market on Market {
    __typename
    name
    chain {
      ...Chain
    }
    address
    totalMarketSize
    totalAvailableLiquidity
    totalBorrows
  }`,
  [ChainFragment],
);
export type Market = FragmentOf<typeof MarketFragment>;

export const MarketInfoFragment = graphql(
  `fragment MarketInfo on MarketInfo {
    __typename
    name
    chain {
      ...Chain
    }
  }`,
  [ChainFragment],
);
export type MarketInfo = FragmentOf<typeof MarketInfoFragment>;

export const MarketUserStatsFragment = graphql(
  `fragment MarketUserStats on MarketUserStats {
    __typename
    netWorth {
      ...DecimalValue
    }
    netAPY {
      ...DecimalValue
    }
    healthFactor {
      ...DecimalValue
    }
    eModeEnabled
  }`,
  [DecimalValueFragment],
);
export type MarketUserStats = FragmentOf<typeof MarketUserStatsFragment>;
