import type { FragmentOf } from 'gql.tada';
import { graphql } from '../graphql';
import {
  CurrencyFragment,
  DecimalValueFragment,
  NativeCurrencyFragment,
  TokenAmountFragment,
} from './common';
import { MarketInfoFragment } from './market';

export const EmodeInfoFragment = graphql(
  `fragment EmodeInfo on EmodeInfo {
    __typename
    maxLTV {
      ...DecimalValue
    }
    liquidationThreshold {
      ...DecimalValue
    }
    liquidationPenalty {
      ...DecimalValue
    }
  }`,
  [DecimalValueFragment],
);
export type EmodeInfo = FragmentOf<typeof EmodeInfoFragment>;

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
  }`,
  [DecimalValueFragment],
);
export type ReserveSupplyInfo = FragmentOf<typeof ReserveSupplyInfoFragment>;

export const ReserveBorrowInfoFragment = graphql(
  `fragment ReserveBorrowInfo on ReserveBorrowInfo {
    __typename
    apy {
      ...DecimalValue
    }
    total {
      ...DecimalValue
    }
    borrowCap
    reserveFactor {
      ...DecimalValue
    }
  }`,
  [DecimalValueFragment],
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
    utilizationRate {
      ...DecimalValue
    }
    available {
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
      ...EmodeInfo
    }
    userAvailability(address: $userAddress) @include(if: $includeUserFields) {
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
    EmodeInfoFragment,
    ReserveUserAvailabilityFragment,
  ],
);
export type Reserve = FragmentOf<typeof ReserveFragment>;
