import type { FragmentOf } from 'gql.tada';
import { graphql } from '../graphql';
import { ChainFragment } from './chain';
import { CurrencyFragment, DecimalValueFragment } from './common';
import { ReserveFragment } from './reserve';

export const MarketInfoFragment = graphql(
  `fragment MarketInfo on MarketInfo {
    __typename
    name
    chain {
      ...Chain
    }
    icon
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
    totalCollateralBase {
      ...DecimalValue
    }
    totalDebtBase {
      ...DecimalValue
    }
    availableBorrowsBase {
      ...DecimalValue
    }
    currentLiquidationThreshold {
      ...DecimalValue
    }
    ltv {
      ...DecimalValue
    }
  }`,
  [DecimalValueFragment],
);
export type MarketUserStats = FragmentOf<typeof MarketUserStatsFragment>;

export const EmodeMarketReserveInfoFragment = graphql(
  `fragment EmodeMarketReserveInfo on EmodeMarketReserveInfo {
    __typename
    underlyingToken {
      ...Currency
    }
    canBeCollateral
    canBeBorrowable
  }`,
  [CurrencyFragment],
);
export type EmodeMarketReserveInfo = FragmentOf<
  typeof EmodeMarketReserveInfoFragment
>;

export const EmodeMarketCategoryFragment = graphql(
  `fragment EmodeMarketCategory on EmodeMarketCategory {
    __typename
    label
    maxLTV {
      ...DecimalValue
    }
    liquidationThreshold {
      ...DecimalValue
    }
    liquidationPenalty {
      ...DecimalValue
    }
    userEnabled
    reserves {
      ...EmodeMarketReserveInfo
    }
  }`,
  [DecimalValueFragment, EmodeMarketReserveInfoFragment],
);
export type EmodeMarketCategory = FragmentOf<
  typeof EmodeMarketCategoryFragment
>;

export const MarketFragment = graphql(
  `fragment Market on Market {
    __typename
    name
    chain {
      ...Chain
    }
    address
    icon
    totalMarketSize
    totalAvailableLiquidity
    totalBorrows
    eModeCategories {
      ...EmodeMarketCategory
    }

    borrowReserves: reserves(request: { reserveType: BORROW, orderBy: $borrowsOrderBy }) {
      ...Reserve
    }

    supplyReserves: reserves(request: { reserveType: SUPPLY, orderBy: $suppliesOrderBy }) {
      ...Reserve
    }

    userStats {
      ...MarketUserStats
    }
  }`,
  [
    ChainFragment,
    EmodeMarketCategoryFragment,
    ReserveFragment,
    MarketUserStatsFragment,
  ],
);
export type Market = FragmentOf<typeof MarketFragment>;
