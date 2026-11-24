import type { FragmentOf } from 'gql.tada';
import { type FragmentDocumentFor, graphql } from '../graphql';
import {
  CurrencyFragment,
  DecimalValueFragment,
  PercentValueFragment,
  TokenAmountFragment,
} from './common';
import { MarketInfoFragment } from './reserve';
import {
  type TransactionRequest,
  TransactionRequestFragment,
} from './transactions';

export const MigrationSupplyFragment = graphql(
  `fragment MigrationSupply on MigrationSupply {
    __typename
    currency {
      ...Currency
    }
    amount {
      ...TokenAmount
    }
    isCollateral
  }`,
  [CurrencyFragment, TokenAmountFragment],
);
export type MigrationSupply = FragmentOf<typeof MigrationSupplyFragment>;

export const MigrationDebtFragment = graphql(
  `fragment MigrationDebt on MigrationDebt {
    __typename
    currency {
      ...Currency
    }
    amount {
      ...TokenAmount
    }
  }`,
  [CurrencyFragment, TokenAmountFragment],
);
export type MigrationDebt = FragmentOf<typeof MigrationDebtFragment>;

export const MigrationSpokeFragment = graphql(
  `fragment MigrationSpoke on MigrationSpoke {
    __typename
    address
    name
  }`,
);
export type MigrationSpoke = FragmentOf<typeof MigrationSpokeFragment>;

export const MigrationCriterionResultFragment = graphql(
  `fragment MigrationCriterionResult on MigrationCriterionResult {
    __typename
    criterion
    met
    assets
  }`,
);
export type MigrationCriterionResult = FragmentOf<
  typeof MigrationCriterionResultFragment
>;

/**
 * A V4 spoke a position could move to, and what moving all of it there would change.
 */
export const MigrationTargetFragment = graphql(
  `fragment MigrationTarget on MigrationTarget {
    __typename
    spoke {
      ...MigrationSpoke
    }
    eligible
    criteria {
      ...MigrationCriterionResult
    }
    apy {
      ...PercentValue
    }
    borrowApy {
      ...PercentValue
    }
    yearlyEarningsUsd
    healthFactor
  }`,
  [
    MigrationSpokeFragment,
    MigrationCriterionResultFragment,
    PercentValueFragment,
  ],
);
export type MigrationTarget = FragmentOf<typeof MigrationTargetFragment>;

/**
 * One V3 position that moves as a whole, with the V4 spokes it could move to.
 */
export const MigrationOpportunityFragment = graphql(
  `fragment MigrationOpportunity on MigrationOpportunity {
    __typename
    kind
    market {
      ...MarketInfo
    }
    supplies {
      ...MigrationSupply
    }
    debts {
      ...MigrationDebt
    }
    suppliedUsd
    borrowedUsd
    netBalanceUsd
    apy {
      ...PercentValue
    }
    borrowApy {
      ...PercentValue
    }
    yearlyEarningsUsd
    healthFactor
    targets {
      ...MigrationTarget
    }
    bestTarget {
      ...MigrationTarget
    }
  }`,
  [
    MarketInfoFragment,
    MigrationSupplyFragment,
    MigrationDebtFragment,
    PercentValueFragment,
    MigrationTargetFragment,
  ],
);
export type MigrationOpportunity = FragmentOf<
  typeof MigrationOpportunityFragment
>;

/**
 * The part of the position that would leave V3.
 */
export const MigrationMovingFragment = graphql(
  `fragment MigrationMoving on MigrationMoving {
    __typename
    supplies {
      ...MigrationSupply
    }
    debts {
      ...MigrationDebt
    }
    suppliedUsd
    borrowedUsd
    netBalanceUsd
  }`,
  [MigrationSupplyFragment, MigrationDebtFragment],
);
export type MigrationMoving = FragmentOf<typeof MigrationMovingFragment>;

/**
 * The position on V3 at one moment of the move.
 */
export const MigrationSourceSideFragment = graphql(
  `fragment MigrationSourceSide on MigrationSourceSide {
    __typename
    supplies {
      ...MigrationSupply
    }
    debts {
      ...MigrationDebt
    }
    suppliedUsd
    borrowedUsd
    netBalanceUsd
    apy {
      ...PercentValue
    }
    borrowApy {
      ...PercentValue
    }
    yearlyEarningsUsd
    healthFactor
    availableBorrowsBase
    netCollateralBase
  }`,
  [MigrationSupplyFragment, MigrationDebtFragment, PercentValueFragment],
);
export type MigrationSourceSide = FragmentOf<
  typeof MigrationSourceSideFragment
>;

export const MigrationSourceVariationFragment = graphql(
  `fragment MigrationSourceVariation on MigrationSourceVariation {
    __typename
    current {
      ...MigrationSourceSide
    }
    after {
      ...MigrationSourceSide
    }
  }`,
  [MigrationSourceSideFragment],
);
export type MigrationSourceVariation = FragmentOf<
  typeof MigrationSourceVariationFragment
>;

export const MigrationAmountVariationFragment = graphql(
  `fragment MigrationAmountVariation on MigrationAmountVariation {
    __typename
    current {
      ...DecimalValue
    }
    after {
      ...DecimalValue
    }
  }`,
  [DecimalValueFragment],
);
export type MigrationAmountVariation = FragmentOf<
  typeof MigrationAmountVariationFragment
>;

export const MigrationBooleanVariationFragment = graphql(
  `fragment MigrationBooleanVariation on MigrationBooleanVariation {
    __typename
    current
    after
  }`,
);
export type MigrationBooleanVariation = FragmentOf<
  typeof MigrationBooleanVariationFragment
>;

export const MigrationUsdVariationFragment = graphql(
  `fragment MigrationUsdVariation on MigrationUsdVariation {
    __typename
    current
    after
  }`,
);
export type MigrationUsdVariation = FragmentOf<
  typeof MigrationUsdVariationFragment
>;

export const MigrationPercentVariationFragment = graphql(
  `fragment MigrationPercentVariation on MigrationPercentVariation {
    __typename
    current {
      ...PercentValue
    }
    after {
      ...PercentValue
    }
  }`,
  [PercentValueFragment],
);
export type MigrationPercentVariation = FragmentOf<
  typeof MigrationPercentVariationFragment
>;

export const MigrationHealthFactorVariationFragment = graphql(
  `fragment MigrationHealthFactorVariation on MigrationHealthFactorVariation {
    __typename
    current
    after
  }`,
);
export type MigrationHealthFactorVariation = FragmentOf<
  typeof MigrationHealthFactorVariationFragment
>;

/**
 * One asset the user holds on the spoke, before the move or after it.
 */
export const MigrationTargetLegFragment = graphql(
  `fragment MigrationTargetLeg on MigrationTargetLeg {
    __typename
    currency {
      ...Currency
    }
    hub
    supplied {
      ...MigrationAmountVariation
    }
    suppliedUsd {
      ...MigrationUsdVariation
    }
    borrowed {
      ...MigrationAmountVariation
    }
    borrowedUsd {
      ...MigrationUsdVariation
    }
    isCollateral {
      ...MigrationBooleanVariation
    }
  }`,
  [
    CurrencyFragment,
    MigrationAmountVariationFragment,
    MigrationUsdVariationFragment,
    MigrationBooleanVariationFragment,
  ],
);
export type MigrationTargetLeg = FragmentOf<typeof MigrationTargetLegFragment>;

export const MigrationExternalCuratorFragment = graphql(
  `fragment MigrationExternalCurator on MigrationExternalCurator {
    __typename
    name
    icon
  }`,
);
export type MigrationExternalCurator = FragmentOf<
  typeof MigrationExternalCuratorFragment
>;

export const MigrationHubFragment = graphql(
  `fragment MigrationHub on MigrationHub {
    __typename
    address
    name
    externalCurator {
      ...MigrationExternalCurator
    }
  }`,
  [MigrationExternalCuratorFragment],
);
export type MigrationHub = FragmentOf<typeof MigrationHubFragment>;

/**
 * The V4 spoke before the move and after it. Every figure is null unless
 * `status` is `PREVIEWED`.
 */
export const MigrationTargetPreviewFragment = graphql(
  `fragment MigrationTargetPreview on MigrationTargetPreview {
    __typename
    spoke {
      ...MigrationSpoke
    }
    status
    netBalanceUsd {
      ...MigrationUsdVariation
    }
    apy {
      ...MigrationPercentVariation
    }
    yearlyEarningsUsd {
      ...MigrationUsdVariation
    }
    collateralUsd {
      ...MigrationUsdVariation
    }
    netCollateralUsd {
      ...MigrationUsdVariation
    }
    debtUsd {
      ...MigrationUsdVariation
    }
    borrowApy {
      ...MigrationPercentVariation
    }
    borrowingPowerUsd {
      ...MigrationUsdVariation
    }
    healthFactor {
      ...MigrationHealthFactorVariation
    }
    legs {
      ...MigrationTargetLeg
    }
    hubs {
      ...MigrationHub
    }
  }`,
  [
    MigrationSpokeFragment,
    MigrationUsdVariationFragment,
    MigrationPercentVariationFragment,
    MigrationHealthFactorVariationFragment,
    MigrationTargetLegFragment,
    MigrationHubFragment,
  ],
);
export type MigrationTargetPreview = FragmentOf<
  typeof MigrationTargetPreviewFragment
>;

/**
 * One position moved, in whole or in part, to one V4 spoke.
 */
export const MigrationPreviewFragment = graphql(
  `fragment MigrationPreview on MigrationPreview {
    __typename
    moving {
      ...MigrationMoving
    }
    source {
      ...MigrationSourceVariation
    }
    target {
      ...MigrationTargetPreview
    }
  }`,
  [
    MigrationMovingFragment,
    MigrationSourceVariationFragment,
    MigrationTargetPreviewFragment,
  ],
);
export type MigrationPreview = FragmentOf<typeof MigrationPreviewFragment>;

/**
 * The EIP-712 domain a document is signed under. A Safe's carries neither name nor version.
 */
export const MigrationTypedDataDomainFragment = graphql(
  `fragment MigrationTypedDataDomain on MigrationTypedDataDomain {
    __typename
    name
    version
    chainId
    verifyingContract
  }`,
);
export type MigrationTypedDataDomain = FragmentOf<
  typeof MigrationTypedDataDomainFragment
>;

/**
 * An EIP-712 document for the wallet to sign as it is.
 */
export const MigrationTypedDataFragment = graphql(
  `fragment MigrationTypedData on MigrationTypedData {
    __typename
    types
    primaryType
    domain {
      ...MigrationTypedDataDomain
    }
    message
  }`,
  [MigrationTypedDataDomainFragment],
);
export type MigrationTypedData = FragmentOf<typeof MigrationTypedDataFragment>;

export const MigrationSignatureRequestFragment = graphql(
  `fragment MigrationSignatureRequest on MigrationSignatureRequest {
    __typename
    purpose
    token
    typedData {
      ...MigrationTypedData
    }
  }`,
  [MigrationTypedDataFragment],
);
export type MigrationSignatureRequest = FragmentOf<
  typeof MigrationSignatureRequestFragment
>;

/**
 * The first step of a migration: documents for the user to sign.
 */
export const MigrationSignaturesRequiredFragment = graphql(
  `fragment MigrationSignaturesRequired on MigrationSignaturesRequired {
    __typename
    plan
    signatures {
      ...MigrationSignatureRequest
    }
  }`,
  [MigrationSignatureRequestFragment],
);
export type MigrationSignaturesRequired = FragmentOf<
  typeof MigrationSignaturesRequiredFragment
>;

/**
 * The second step of a migration: the transaction of the Safe the migration
 * runs in, for the user to sign.
 */
export const MigrationSafeSignatureRequiredFragment = graphql(
  `fragment MigrationSafeSignatureRequired on MigrationSafeSignatureRequired {
    __typename
    typedData {
      ...MigrationTypedData
    }
  }`,
  [MigrationTypedDataFragment],
);
export type MigrationSafeSignatureRequired = FragmentOf<
  typeof MigrationSafeSignatureRequiredFragment
>;

/**
 * What the user does next to migrate. Call `migratePosition` again after each
 * signing step, until it answers the transaction to send.
 */
export type MigrationExecutionPlan =
  | MigrationSignaturesRequired
  | MigrationSafeSignatureRequired
  | TransactionRequest;

export const MigrationExecutionPlanFragment: FragmentDocumentFor<
  MigrationExecutionPlan,
  'MigrationExecutionPlan'
> = graphql(
  `fragment MigrationExecutionPlan on MigrationExecutionPlan {
    __typename
    ... on MigrationSignaturesRequired {
      ...MigrationSignaturesRequired
    }
    ... on MigrationSafeSignatureRequired {
      ...MigrationSafeSignatureRequired
    }
    ... on TransactionRequest {
      ...TransactionRequest
    }
  }`,
  [
    MigrationSignaturesRequiredFragment,
    MigrationSafeSignatureRequiredFragment,
    TransactionRequestFragment,
  ],
);
