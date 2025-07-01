import type { FragmentOf } from 'gql.tada';
import { graphql } from '../graphql';
import { ChainFragment } from './chain';
import { DecimalValueFragment } from './common';
import { ReserveFragment } from './reserve';

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

    borrowReserves: reserves(request: { reserveType: BORROW, orderBy: $borrowsOrderBy }) {
      ...Reserve
    }

    supplyReserves: reserves(request: { reserveType: SUPPLY, orderBy: $suppliesOrderBy }) {
      ...Reserve
    }

    userStats(address: $userAddress) @include(if: $includeUserFields) {
      ...MarketUserStats
    }
  }`,
  [ChainFragment, ReserveFragment, MarketUserStatsFragment],
);
export type Market = FragmentOf<typeof MarketFragment>;
