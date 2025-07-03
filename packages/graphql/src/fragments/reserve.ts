import type { FragmentOf } from 'gql.tada';
import { graphql } from '../graphql';
import {
  CurrencyFragment,
  DecimalValueFragment,
  NativeCurrencyFragment,
  TokenAmountFragment,
} from './common';
import { MarketInfoFragment } from './market';

export const EmodeReserveInfoFragment = graphql(
  `fragment EmodeReserveInfo on EmodeReserveInfo {
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
  }`,
  [DecimalValueFragment],
);
export type EmodeReserveInfo = FragmentOf<typeof EmodeReserveInfoFragment>;

export const ReserveSupplyInfoFragment = graphql(
  `fragment ReserveSupplyInfo on ReserveSupplyInfo {
    __typename
    apy {
      ...DecimalValue
    }
    total {
      ...DecimalValue
    }
    maxLTV {
      ...DecimalValue
    }
    liquidationThreshold {
      ...DecimalValue
    }
    liquidationBonus {
      ...DecimalValue
    }
    canBeCollateral
    supplyCap {
      ...TokenAmount
    }
    supplyCapReached
  }`,
  [DecimalValueFragment, TokenAmountFragment],
);
export type ReserveSupplyInfo = FragmentOf<typeof ReserveSupplyInfoFragment>;

export const ReserveBorrowInfoFragment = graphql(
  `fragment ReserveBorrowInfo on ReserveBorrowInfo {
    __typename
    apy {
      ...DecimalValue
    }
    total {
      ...TokenAmount
    }
    borrowCap {
      ...TokenAmount
    }
    reserveFactor {
      ...DecimalValue
    }
    availableLiquidity {
      ...TokenAmount
    }
    utilizationRate {
      ...DecimalValue
    }
    borrowingState
    borrowCapReached
  }`,
  [DecimalValueFragment, TokenAmountFragment],
);
export type ReserveBorrowInfo = FragmentOf<typeof ReserveBorrowInfoFragment>;

export const ReserveUserAvailabilityFragment = graphql(
  `fragment ReserveUserAvailability on ReserveUserAvailability {
    __typename
    balance {
      ...DecimalValue
    }
    supply {
      ...DecimalValue
    }
    borrow {
      ...DecimalValue
    }
  }`,
  [DecimalValueFragment],
);
export type ReserveUserAvailability = FragmentOf<
  typeof ReserveUserAvailabilityFragment
>;

export const ReserveFragment = graphql(
  `fragment Reserve on Reserve {
    __typename
    market {
      ...MarketInfo
    }
    underlyingToken {
      ...Currency
    }
    aToken {
      ...Currency
    }
    vToken {
      ...Currency
    }
    acceptsNative {
      ...NativeCurrency
    }
    size {
      ...TokenAmount
    }
    usdExchangeRate
    usdOracleAddress
    isFrozen
    isPaused
    supplyInfo {
      ...ReserveSupplyInfo
    }
    borrowInfo {
      ...ReserveBorrowInfo
    }
    eModeInfo {
      ...EmodeReserveInfo
    }
    userAvailability {
      ...ReserveUserAvailability
    }
  }`,
  [
    MarketInfoFragment,
    CurrencyFragment,
    NativeCurrencyFragment,
    TokenAmountFragment,
    DecimalValueFragment,
    ReserveSupplyInfoFragment,
    ReserveBorrowInfoFragment,
    EmodeReserveInfoFragment,
    ReserveUserAvailabilityFragment,
  ],
);
export type Reserve = FragmentOf<typeof ReserveFragment>;
