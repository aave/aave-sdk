import type { FragmentOf } from 'gql.tada';
import { graphql } from '../graphql';
import { ChainFragment } from './chain';
import {
  CurrencyFragment,
  DecimalValueFragment,
  NativeCurrencyFragment,
  TokenAmountFragment,
} from './common';

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

export const ReserveInfoFragment = graphql(
  `fragment ReserveInfo on ReserveInfo {
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
    usdExchangeRate
  }`,
  [MarketInfoFragment, CurrencyFragment],
);
export type ReserveInfo = FragmentOf<typeof ReserveInfoFragment>;

export const EmodeReserveInfoFragment = graphql(
  `fragment EmodeReserveInfo on EmodeReserveInfo {
    __typename
    categoryId
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
    canBeCollateral
    canBeBorrowed
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
    variableRateSlope1 {
      ...DecimalValue
    }
    variableRateSlope2 {
      ...DecimalValue
    }
    optimalUsageRate {
      ...DecimalValue
    }
    borrowingState
    borrowCapReached
  }`,
  [DecimalValueFragment, TokenAmountFragment],
);
export type ReserveBorrowInfo = FragmentOf<typeof ReserveBorrowInfoFragment>;

export const ReserveIsolationModeConfigFragment = graphql(
  `fragment ReserveIsolationModeConfig on ReserveIsolationModeConfig {
    __typename
    canBeCollateral
    canBeBorrowed
    debtCeiling {
      ...TokenAmount
    }
    totalBorrows {
      ...TokenAmount
    }
  }`,
  [TokenAmountFragment],
);
export type ReserveIsolationModeConfig = FragmentOf<
  typeof ReserveIsolationModeConfigFragment
>;

export const ReserveUserStateFragment = graphql(
  `fragment ReserveUserState on ReserveUserState {
    __typename
    balance {
      ...TokenAmount
    }
    suppliable {
      ...TokenAmount
    }
    borrowable {
      ...TokenAmount
    }
    emode {
      ...EmodeReserveInfo
    }
    canBeCollateral
    canBeBorrowed
    isInIsolationMode
  }`,
  [TokenAmountFragment, EmodeReserveInfoFragment],
);
export type ReserveUserState = FragmentOf<typeof ReserveUserStateFragment>;

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
    flashLoanEnabled
    supplyInfo {
      ...ReserveSupplyInfo
    }
    borrowInfo {
      ...ReserveBorrowInfo
    }
    isolationModeConfig {
      ...ReserveIsolationModeConfig
    }
    eModeInfo {
      ...EmodeReserveInfo
    }
    userState {
      ...ReserveUserState
    }
  }`,
  [
    MarketInfoFragment,
    CurrencyFragment,
    NativeCurrencyFragment,
    TokenAmountFragment,
    ReserveSupplyInfoFragment,
    ReserveBorrowInfoFragment,
    ReserveIsolationModeConfigFragment,
    EmodeReserveInfoFragment,
    ReserveUserStateFragment,
  ],
);
export type Reserve = FragmentOf<typeof ReserveFragment>;
