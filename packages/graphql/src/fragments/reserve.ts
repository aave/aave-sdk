import type { FragmentOf } from 'gql.tada';
import { type FragmentDocumentFor, graphql } from '../graphql';
import { ChainFragment } from './chain';
import {
  CurrencyFragment,
  DecimalValueFragment,
  NativeCurrencyFragment,
  PercentValueFragment,
  TokenAmountFragment,
} from './common';

export const MarketInfoFragment = graphql(
  `fragment MarketInfo on MarketInfo {
    __typename
    name
    chain {
      ...Chain
    }
    address
    icon
  }`,
  [ChainFragment],
);
export type MarketInfo = FragmentOf<typeof MarketInfoFragment>;

export const MeritSupplyIncentiveFragment = graphql(
  `fragment MeritSupplyIncentive on MeritSupplyIncentive {
    __typename
    extraSupplyApr {
      ...PercentValue
    }
    claimLink
    actionKey
    rewardTokenAddress
    rewardTokenSymbol
    customMessage
    customForumLink
    selfApr {
      ...PercentValue
    }
  }`,
  [PercentValueFragment],
);
export type MeritSupplyIncentive = FragmentOf<
  typeof MeritSupplyIncentiveFragment
>;

export const MeritBorrowIncentiveFragment = graphql(
  `fragment MeritBorrowIncentive on MeritBorrowIncentive {
    __typename
    borrowAprDiscount {
      ...PercentValue
    }
    claimLink
    actionKey
    rewardTokenAddress
    rewardTokenSymbol
    customMessage
    customForumLink
    selfApr {
      ...PercentValue
    }
  }`,
  [PercentValueFragment],
);
export type MeritBorrowIncentive = FragmentOf<
  typeof MeritBorrowIncentiveFragment
>;

export const MeritBorrowAndSupplyIncentiveConditionFragment = graphql(
  `fragment MeritBorrowAndSupplyIncentiveCondition on MeritBorrowAndSupplyIncentiveCondition {
    __typename
    extraApr {
      ...PercentValue
    }
    supplyToken {
      ...Currency
    }
    borrowToken {
      ...Currency
    }
    claimLink
    actionKey
    rewardTokenAddress
    rewardTokenSymbol
    customMessage
    customForumLink
    selfApr {
      ...PercentValue
    }
  }`,
  [PercentValueFragment, CurrencyFragment],
);
export type MeritBorrowAndSupplyIncentiveCondition = FragmentOf<
  typeof MeritBorrowAndSupplyIncentiveConditionFragment
>;

export const AaveSupplyIncentiveFragment = graphql(
  `fragment AaveSupplyIncentive on AaveSupplyIncentive {
    __typename
    extraSupplyApr {
      ...PercentValue
    }
    rewardTokenAddress
    rewardTokenSymbol
  }`,
  [PercentValueFragment],
);
export type AaveSupplyIncentive = FragmentOf<
  typeof AaveSupplyIncentiveFragment
>;

export const AaveBorrowIncentiveFragment = graphql(
  `fragment AaveBorrowIncentive on AaveBorrowIncentive {
    __typename
    borrowAprDiscount {
      ...PercentValue
    }
    rewardTokenAddress
    rewardTokenSymbol
  }`,
  [PercentValueFragment],
);
export type AaveBorrowIncentive = FragmentOf<
  typeof AaveBorrowIncentiveFragment
>;

/**
 * One rule from a reward program's `criteria_rules` blob, already evaluated
 * against the user (when one was passed on the surrounding query) so the UI
 * can render eligibility state directly.
 */
export const IncentiveCriteriaFragment = graphql(
  `fragment IncentiveCriteria on IncentiveCriteria {
    __typename
    id
    text
    userPassed
  }`,
);
export type IncentiveCriteria = FragmentOf<typeof IncentiveCriteriaFragment>;

/**
 * Off-chain points program referenced by `SupplyPointsIncentive` /
 * `BorrowPointsIncentive`.
 */
export const PointsProgramFragment = graphql(
  `fragment PointsProgram on PointsProgram {
    __typename
    id
    name
    externalUrl
    iconUrl
  }`,
);
export type PointsProgram = FragmentOf<typeof PointsProgramFragment>;

/**
 * Supply-side incentive funded by an Aave-owned Merkl campaign. `extraApy`
 * is the live APR from Merkl (the stored APY on the program row is BD intent,
 * not used at read time).
 */
export const MerklSupplyIncentiveFragment = graphql(
  `fragment MerklSupplyIncentive on MerklSupplyIncentive {
    __typename
    id
    startDate
    endDate
    extraApy {
      ...PercentValue
    }
    payoutToken {
      ...Currency
    }
    criteria {
      ...IncentiveCriteria
    }
    userEligible
    description
    customMessage
    customForumLink
    customClaimMessage
  }`,
  [PercentValueFragment, CurrencyFragment, IncentiveCriteriaFragment],
);
export type MerklSupplyIncentive = FragmentOf<
  typeof MerklSupplyIncentiveFragment
>;

export const MerklBorrowIncentiveFragment = graphql(
  `fragment MerklBorrowIncentive on MerklBorrowIncentive {
    __typename
    id
    startDate
    endDate
    discountApy {
      ...PercentValue
    }
    payoutToken {
      ...Currency
    }
    criteria {
      ...IncentiveCriteria
    }
    userEligible
    description
    customMessage
    customForumLink
    customClaimMessage
  }`,
  [PercentValueFragment, CurrencyFragment, IncentiveCriteriaFragment],
);
export type MerklBorrowIncentive = FragmentOf<
  typeof MerklBorrowIncentiveFragment
>;

export const SupplyPointsIncentiveFragment = graphql(
  `fragment SupplyPointsIncentive on SupplyPointsIncentive {
    __typename
    id
    program {
      ...PointsProgram
    }
    name
    startDate
    endDate
    multiplier
    criteria {
      ...IncentiveCriteria
    }
    userEligible
    dailyPoints
    pointsPerThousandUsd
    description
    customMessage
    customForumLink
  }`,
  [PointsProgramFragment, IncentiveCriteriaFragment],
);
export type SupplyPointsIncentive = FragmentOf<
  typeof SupplyPointsIncentiveFragment
>;

export const BorrowPointsIncentiveFragment = graphql(
  `fragment BorrowPointsIncentive on BorrowPointsIncentive {
    __typename
    id
    program {
      ...PointsProgram
    }
    name
    startDate
    endDate
    multiplier
    criteria {
      ...IncentiveCriteria
    }
    userEligible
    dailyPoints
    pointsPerThousandUsd
    description
    customMessage
    customForumLink
  }`,
  [PointsProgramFragment, IncentiveCriteriaFragment],
);
export type BorrowPointsIncentive = FragmentOf<
  typeof BorrowPointsIncentiveFragment
>;

/**
 * Fixed-APR partner incentive with an external claim flow (e.g. Ethena,
 * EtherFi, Sonic). Display only — no on-chain claim through the Aave backend.
 */
export const StaticSupplyIncentiveFragment = graphql(
  `fragment StaticSupplyIncentive on StaticSupplyIncentive {
    __typename
    id
    partnerName
    partnerIconUrl
    description
    externalClaimUrl
    startDate
    endDate
    extraApr {
      ...PercentValue
    }
    criteria {
      ...IncentiveCriteria
    }
    userEligible
  }`,
  [PercentValueFragment, IncentiveCriteriaFragment],
);
export type StaticSupplyIncentive = FragmentOf<
  typeof StaticSupplyIncentiveFragment
>;

export const StaticBorrowIncentiveFragment = graphql(
  `fragment StaticBorrowIncentive on StaticBorrowIncentive {
    __typename
    id
    partnerName
    partnerIconUrl
    description
    externalClaimUrl
    startDate
    endDate
    discountApr {
      ...PercentValue
    }
    criteria {
      ...IncentiveCriteria
    }
    userEligible
  }`,
  [PercentValueFragment, IncentiveCriteriaFragment],
);
export type StaticBorrowIncentive = FragmentOf<
  typeof StaticBorrowIncentiveFragment
>;

export type ReserveIncentive =
  | MeritSupplyIncentive
  | MeritBorrowIncentive
  | MeritBorrowAndSupplyIncentiveCondition
  | AaveSupplyIncentive
  | AaveBorrowIncentive
  | MerklSupplyIncentive
  | MerklBorrowIncentive
  | SupplyPointsIncentive
  | BorrowPointsIncentive
  | StaticSupplyIncentive
  | StaticBorrowIncentive;

export const ReserveIncentiveFragment: FragmentDocumentFor<
  ReserveIncentive,
  'ReserveIncentive'
> = graphql(
  `fragment ReserveIncentive on ReserveIncentive {
    __typename
    ... on MeritSupplyIncentive {
      ...MeritSupplyIncentive
    }
    ... on MeritBorrowIncentive {
      ...MeritBorrowIncentive
    }
    ... on MeritBorrowAndSupplyIncentiveCondition {
      ...MeritBorrowAndSupplyIncentiveCondition
    }
    ... on AaveSupplyIncentive {
      ...AaveSupplyIncentive
    }
    ... on AaveBorrowIncentive {
      ...AaveBorrowIncentive
    }
    ... on MerklSupplyIncentive {
      ...MerklSupplyIncentive
    }
    ... on MerklBorrowIncentive {
      ...MerklBorrowIncentive
    }
    ... on SupplyPointsIncentive {
      ...SupplyPointsIncentive
    }
    ... on BorrowPointsIncentive {
      ...BorrowPointsIncentive
    }
    ... on StaticSupplyIncentive {
      ...StaticSupplyIncentive
    }
    ... on StaticBorrowIncentive {
      ...StaticBorrowIncentive
    }
  }`,
  [
    MeritSupplyIncentiveFragment,
    MeritBorrowIncentiveFragment,
    MeritBorrowAndSupplyIncentiveConditionFragment,
    AaveSupplyIncentiveFragment,
    AaveBorrowIncentiveFragment,
    MerklSupplyIncentiveFragment,
    MerklBorrowIncentiveFragment,
    SupplyPointsIncentiveFragment,
    BorrowPointsIncentiveFragment,
    StaticSupplyIncentiveFragment,
    StaticBorrowIncentiveFragment,
  ],
);

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
    permitSupported
    incentives {
      ...ReserveIncentive
    }
  }`,
  [MarketInfoFragment, CurrencyFragment, ReserveIncentiveFragment],
);
export type ReserveInfo = FragmentOf<typeof ReserveInfoFragment>;

export const EmodeReserveInfoFragment = graphql(
  `fragment EmodeReserveInfo on EmodeReserveInfo {
    __typename
    categoryId
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
    canBeCollateral
    canBeBorrowed
    hasLtvZero
  }`,
  [PercentValueFragment],
);
export type EmodeReserveInfo = FragmentOf<typeof EmodeReserveInfoFragment>;

export const ReserveSupplyInfoFragment = graphql(
  `fragment ReserveSupplyInfo on ReserveSupplyInfo {
    __typename
    apy {
      ...PercentValue
    }
    total {
      ...DecimalValue
    }
    maxLTV {
      ...PercentValue
    }
    liquidationThreshold {
      ...PercentValue
    }
    liquidationBonus {
      ...PercentValue
    }
    canBeCollateral
    supplyCap {
      ...TokenAmount
    }
    supplyCapReached
  }`,
  [PercentValueFragment, DecimalValueFragment, TokenAmountFragment],
);
export type ReserveSupplyInfo = FragmentOf<typeof ReserveSupplyInfoFragment>;

export const ReserveBorrowInfoFragment = graphql(
  `fragment ReserveBorrowInfo on ReserveBorrowInfo {
    __typename
    apy {
      ...PercentValue
    }
    total {
      ...TokenAmount
    }
    borrowCap {
      ...TokenAmount
    }
    reserveFactor {
      ...PercentValue
    }
    availableLiquidity {
      ...TokenAmount
    }
    utilizationRate {
      ...PercentValue
    }
    baseVariableBorrowRate{
      ...PercentValue
    }
    variableRateSlope1 {
      ...PercentValue
    }
    variableRateSlope2 {
      ...PercentValue
    }
    optimalUsageRate {
      ...PercentValue
    }
    borrowingState
    borrowCapReached
  }`,
  [PercentValueFragment, TokenAmountFragment],
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
    debtCeilingDecimals
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
    interestRateStrategyAddress
    permitSupported
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
    incentives {
      ...ReserveIncentive
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
    ReserveIncentiveFragment,
    ReserveUserStateFragment,
  ],
);
export type Reserve = FragmentOf<typeof ReserveFragment>;
