import type { FragmentOf } from "gql.tada";
import { graphql } from "../graphql";
import { ChainFragment } from "./chain";
import { CurrencyFragment, PercentValueFragment } from "./common";
import { ReserveFragment } from "./reserve";

export const MarketUserStateFragment = graphql(
  `
    fragment MarketUserState on MarketUserState {
      __typename
      netWorth
      netAPY {
        ...PercentValue
      }
      userEarnedAPY {
        ...PercentValue
      }
      userDebtAPY {
        ...PercentValue
      }
      healthFactor
      eModeEnabled
      totalCollateralBase
      totalDebtBase
      availableBorrowsBase
      currentLiquidationThreshold {
        ...PercentValue
      }
      ltv {
        ...PercentValue
      }
      isInIsolationMode
    }
  `,
  [PercentValueFragment]
);
export type MarketUserState = FragmentOf<typeof MarketUserStateFragment>;

export const EmodeMarketReserveInfoFragment = graphql(
  `
    fragment EmodeMarketReserveInfo on EmodeMarketReserveInfo {
      __typename
      underlyingToken {
        ...Currency
      }
      canBeCollateral
      canBeBorrowed
    }
  `,
  [CurrencyFragment]
);
export type EmodeMarketReserveInfo = FragmentOf<typeof EmodeMarketReserveInfoFragment>;

export const EmodeMarketCategoryFragment = graphql(
  `
    fragment EmodeMarketCategory on EmodeMarketCategory {
      __typename
      id
      label
      maxLTV {
        ...PercentValue
      }
      liquidationThreshold {
        ...PercentValue
      }
      liquidationPenalty {
        ...PercentValue
      }
      reserves {
        ...EmodeMarketReserveInfo
      }
    }
  `,
  [PercentValueFragment, EmodeMarketReserveInfoFragment]
);
export type EmodeMarketCategory = FragmentOf<typeof EmodeMarketCategoryFragment>;

export const MarketFragment = graphql(
  `
    fragment Market on Market {
      __typename
      name
      chain {
        ...Chain
      }
      address
      icon
      totalMarketSize
      totalAvailableLiquidity
      eModeCategories {
        ...EmodeMarketCategory
      }
      userState {
        ...MarketUserState
      }

      borrowReserves: reserves(request: { reserveType: BORROW, orderBy: $borrowsOrderBy }) {
        ...Reserve
      }

      supplyReserves: reserves(request: { reserveType: SUPPLY, orderBy: $suppliesOrderBy }) {
        ...Reserve
      }
    }
  `,
  [ChainFragment, EmodeMarketCategoryFragment, ReserveFragment, MarketUserStateFragment]
);
export type Market = FragmentOf<typeof MarketFragment>;
