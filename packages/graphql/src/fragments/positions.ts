import type { FragmentOf } from 'gql.tada';
import { graphql } from '../graphql';
import {
  CurrencyFragment,
  DecimalValueFragment,
  TokenAmountFragment,
} from './common';
import { MarketInfoFragment } from './reserve';

export const MarketUserReserveBorrowPositionFragment = graphql(
  `fragment MarketUserReserveBorrowPosition on MarketUserReserveBorrowPosition {
    __typename
    market {
      ...MarketInfo
    }
    currency {
      ...Currency
    }
    debt {
      ...TokenAmount
    }
    apy {
      ...DecimalValue
    }
  }`,
  [
    MarketInfoFragment,
    CurrencyFragment,
    TokenAmountFragment,
    DecimalValueFragment,
  ],
);
export type MarketUserReserveBorrowPosition = FragmentOf<
  typeof MarketUserReserveBorrowPositionFragment
>;

export const MarketUserReserveSupplyPositionFragment = graphql(
  `fragment MarketUserReserveSupplyPosition on MarketUserReserveSupplyPosition {
    __typename
    market {
      ...MarketInfo
    }
    currency {
      ...Currency
    }
    balance {
      ...TokenAmount
    }
    apy {
      ...DecimalValue
    }
    isCollateral
    canBeCollateral
  }`,
  [
    MarketInfoFragment,
    CurrencyFragment,
    TokenAmountFragment,
    DecimalValueFragment,
  ],
);
export type MarketUserReserveSupplyPosition = FragmentOf<
  typeof MarketUserReserveSupplyPositionFragment
>;
