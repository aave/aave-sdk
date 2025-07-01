import type { FragmentOf } from 'gql.tada';
import { graphql } from '../graphql';
import { ChainFragment } from './chain';
import { 
  DecimalValueFragment, 
  CurrencyFragment, 
  NativeCurrencyFragment, 
  TokenAmountFragment
} from './common';

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
    liquidationPenalty {
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
    borrowCap {
      ...DecimalValue
    }
    reserveFactor
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
export type ReserveUserAvailability = FragmentOf<typeof ReserveUserAvailabilityFragment>;

export const ReserveFragment = graphql(
  `fragment Reserve on Reserve {
    __typename
    market {
      name
      chain {
        ...Chain
      }
    }
    address
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
    supplyInfo {
      ...ReserveSupplyInfo
    }
    borrowInfo {
      ...ReserveBorrowInfo
    }
    eModeInfo {
      ...EmodeInfo
    }
  }`,
  [
    ChainFragment,
    CurrencyFragment,
    NativeCurrencyFragment,
    TokenAmountFragment,
    DecimalValueFragment,
    ReserveSupplyInfoFragment,
    ReserveBorrowInfoFragment,
    EmodeInfoFragment,
  ],
);
export type Reserve = FragmentOf<typeof ReserveFragment>;
