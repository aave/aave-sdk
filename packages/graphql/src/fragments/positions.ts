import type { FragmentOf } from 'gql.tada';
import { graphql } from '../graphql';
import { CurrencyFragment, DecimalValueFragment } from './common';

export const UserReserveBorrowPositionFragment = graphql(
  `fragment UserReserveBorrowPosition on UserReserveBorrowPosition {
    __typename
    market
    currency {
      ...Currency
    }
    debt {
      ...DecimalValue
    }
    apy {
      ...DecimalValue
    }
  }`,
  [CurrencyFragment, DecimalValueFragment],
);
export type UserReserveBorrowPosition = FragmentOf<typeof UserReserveBorrowPositionFragment>;

export const UserReserveSupplyPositionFragment = graphql(
  `fragment UserReserveSupplyPosition on UserReserveSupplyPosition {
    __typename
    market
    currency {
      ...Currency
    }
    balance {
      ...DecimalValue
    }
    apy {
      ...DecimalValue
    }
    collateral
  }`,
  [CurrencyFragment, DecimalValueFragment],
);
export type UserReserveSupplyPosition = FragmentOf<typeof UserReserveSupplyPositionFragment>;
