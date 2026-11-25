import type { FragmentOf } from 'gql.tada';
import { type FragmentDocumentFor, graphql } from '../graphql';
import {
  DomainDataFragment,
  PermitTypedDataResponseFragment,
} from '../permits';
import {
  CurrencyFragment,
  DecimalValueFragment,
  NativeCurrencyFragment,
  PercentValueFragment,
} from './common';
import { TransactionRequestFragment } from './transactions';

export const SwapCurrencyFragment = graphql(
  `fragment SwapCurrency on SwapCurrency {
    __typename
    ... on Currency {
      ...Currency
    }
    ... on NativeCurrency {
      ...NativeCurrency
    }
  }`,
  [CurrencyFragment, NativeCurrencyFragment],
);
export type SwapCurrency = FragmentOf<typeof SwapCurrencyFragment>;

/**
 * A `TokenAmount` without its USD fields: the backend prices a swap leg only
 * when the market lists its token, and fails the field otherwise.
 */
export const UnpricedTokenAmountFragment = graphql(
  `fragment UnpricedTokenAmount on TokenAmount {
    __typename
    amount {
      ...DecimalValue
    }
  }`,
  [DecimalValueFragment],
);
export type UnpricedTokenAmount = FragmentOf<
  typeof UnpricedTokenAmountFragment
>;

export const SwapQuoteCostsFragment = graphql(
  `fragment SwapQuoteCosts on SwapQuoteCosts {
    __typename
    networkCosts {
      ...UnpricedTokenAmount
    }
    partnerFee {
      ...UnpricedTokenAmount
    }
    flashloanFee {
      ...UnpricedTokenAmount
    }
    providerFee {
      ...UnpricedTokenAmount
    }
  }`,
  [UnpricedTokenAmountFragment],
);
export type SwapQuoteCosts = FragmentOf<typeof SwapQuoteCostsFragment>;

export const SwapQuoteFragment = graphql(
  `fragment SwapQuote on SwapQuote {
    __typename
    accuracy
    quoteId
    orderQuoteId
    suggestedSlippage {
      ...PercentValue
    }
    selectedSlippage {
      ...PercentValue
    }
    sell {
      ...UnpricedTokenAmount
    }
    buy {
      ...UnpricedTokenAmount
    }
    costs {
      ...SwapQuoteCosts
    }
    finalSell {
      ...UnpricedTokenAmount
    }
    finalBuy {
      ...UnpricedTokenAmount
    }
  }`,
  [PercentValueFragment, UnpricedTokenAmountFragment, SwapQuoteCostsFragment],
);
export type SwapQuote = FragmentOf<typeof SwapQuoteFragment>;

export const OrderTypedDataFragment = graphql(
  `fragment OrderTypedData on OrderTypedData {
    __typename
    types
    primaryType
    domain {
      ...DomainData
    }
    message
  }`,
  [DomainDataFragment],
);
export type OrderTypedData = FragmentOf<typeof OrderTypedDataFragment>;

/**
 * `bySignature` is aliased to `byPermit`: `PositionSwapAdapterContractApproval`
 * exposes `bySignature: OrderTypedData!`, and GraphQL cannot merge it with this
 * nullable `PermitTypedDataResponse` under one response name.
 */
export const Erc20ApprovalFragment = graphql(
  `fragment Erc20Approval on Erc20Approval {
    __typename
    byTransaction {
      ...TransactionRequest
    }
    byPermit: bySignature {
      ...PermitTypedDataResponse
    }
  }`,
  [TransactionRequestFragment, PermitTypedDataResponseFragment],
);
export type Erc20Approval = FragmentOf<typeof Erc20ApprovalFragment>;

export const PositionSwapAdapterContractApprovalFragment = graphql(
  `fragment PositionSwapAdapterContractApproval on PositionSwapAdapterContractApproval {
    __typename
    bySignature {
      ...OrderTypedData
    }
  }`,
  [OrderTypedDataFragment],
);
export type PositionSwapAdapterContractApproval = FragmentOf<
  typeof PositionSwapAdapterContractApprovalFragment
>;

export const PositionSwapAdapterTransactionApprovalFragment = graphql(
  `fragment PositionSwapAdapterTransactionApproval on PositionSwapAdapterTransactionApproval {
    __typename
    byTransaction {
      ...TransactionRequest
    }
  }`,
  [TransactionRequestFragment],
);
export type PositionSwapAdapterTransactionApproval = FragmentOf<
  typeof PositionSwapAdapterTransactionApprovalFragment
>;

export const PositionSwapApprovalFragment = graphql(
  `fragment PositionSwapApproval on PositionSwapApproval {
    __typename
    ... on Erc20Approval {
      ...Erc20Approval
    }
    ... on PositionSwapAdapterContractApproval {
      ...PositionSwapAdapterContractApproval
    }
    ... on PositionSwapAdapterTransactionApproval {
      ...PositionSwapAdapterTransactionApproval
    }
  }`,
  [
    Erc20ApprovalFragment,
    PositionSwapAdapterContractApprovalFragment,
    PositionSwapAdapterTransactionApprovalFragment,
  ],
);
export type PositionSwapApproval = FragmentOf<
  typeof PositionSwapApprovalFragment
>;

export const InsufficientLiquidityErrorFragment = graphql(
  `fragment InsufficientLiquidityError on InsufficientLiquidityError {
    __typename
    reason
  }`,
);
export type InsufficientLiquidityError = FragmentOf<
  typeof InsufficientLiquidityErrorFragment
>;

export const AmountTooSmallErrorFragment = graphql(
  `fragment AmountTooSmallError on AmountTooSmallError {
    __typename
    reason
  }`,
);
export type AmountTooSmallError = FragmentOf<
  typeof AmountTooSmallErrorFragment
>;

export const SwapByIntentFragment = graphql(
  `fragment SwapByIntent on SwapByIntent {
    __typename
    quote {
      ...SwapQuote
    }
  }`,
  [SwapQuoteFragment],
);
export type SwapByIntent = FragmentOf<typeof SwapByIntentFragment>;

export const SwapByIntentWithApprovalRequiredFragment = graphql(
  `fragment SwapByIntentWithApprovalRequired on SwapByIntentWithApprovalRequired {
    __typename
    quote {
      ...SwapQuote
    }
    approvals {
      ...Erc20Approval
    }
  }`,
  [SwapQuoteFragment, Erc20ApprovalFragment],
);
export type SwapByIntentWithApprovalRequired = FragmentOf<
  typeof SwapByIntentWithApprovalRequiredFragment
>;

export const SwapByTransactionFragment = graphql(
  `fragment SwapByTransaction on SwapByTransaction {
    __typename
    quote {
      ...SwapQuote
    }
  }`,
  [SwapQuoteFragment],
);
export type SwapByTransaction = FragmentOf<typeof SwapByTransactionFragment>;

export const SwapByTransactionWithApprovalRequiredFragment = graphql(
  `fragment SwapByTransactionWithApprovalRequired on SwapByTransactionWithApprovalRequired {
    __typename
    quote {
      ...SwapQuote
    }
    approvals {
      ...Erc20Approval
    }
  }`,
  [SwapQuoteFragment, Erc20ApprovalFragment],
);
export type SwapByTransactionWithApprovalRequired = FragmentOf<
  typeof SwapByTransactionWithApprovalRequiredFragment
>;

export type TokenSwapQuoteResult =
  | SwapByIntent
  | SwapByIntentWithApprovalRequired
  | SwapByTransaction
  | SwapByTransactionWithApprovalRequired
  | InsufficientLiquidityError
  | AmountTooSmallError;

export const TokenSwapQuoteResultFragment: FragmentDocumentFor<
  TokenSwapQuoteResult,
  'TokenSwapQuoteResult'
> = graphql(
  `fragment TokenSwapQuoteResult on TokenSwapQuoteResult {
    __typename
    ... on SwapByIntent {
      ...SwapByIntent
    }
    ... on SwapByIntentWithApprovalRequired {
      ...SwapByIntentWithApprovalRequired
    }
    ... on SwapByTransaction {
      ...SwapByTransaction
    }
    ... on SwapByTransactionWithApprovalRequired {
      ...SwapByTransactionWithApprovalRequired
    }
    ... on InsufficientLiquidityError {
      ...InsufficientLiquidityError
    }
    ... on AmountTooSmallError {
      ...AmountTooSmallError
    }
  }`,
  [
    SwapByIntentFragment,
    SwapByIntentWithApprovalRequiredFragment,
    SwapByTransactionFragment,
    SwapByTransactionWithApprovalRequiredFragment,
    InsufficientLiquidityErrorFragment,
    AmountTooSmallErrorFragment,
  ],
);

export const PositionSwapByIntentApprovalsRequiredFragment = graphql(
  `fragment PositionSwapByIntentApprovalsRequired on PositionSwapByIntentApprovalsRequired {
    __typename
    quote {
      ...SwapQuote
    }
    approvals {
      ...PositionSwapApproval
    }
  }`,
  [SwapQuoteFragment, PositionSwapApprovalFragment],
);
export type PositionSwapByIntentApprovalsRequired = FragmentOf<
  typeof PositionSwapByIntentApprovalsRequiredFragment
>;

/**
 * The result of a supply swap, withdraw swap, borrow swap or repay-with-supply quote.
 */
export type PositionSwapQuoteResult =
  | PositionSwapByIntentApprovalsRequired
  | InsufficientLiquidityError
  | AmountTooSmallError;

export const SupplySwapQuoteResultFragment: FragmentDocumentFor<
  PositionSwapQuoteResult,
  'SupplySwapQuoteResult'
> = graphql(
  `fragment SupplySwapQuoteResult on SupplySwapQuoteResult {
    __typename
    ... on PositionSwapByIntentApprovalsRequired {
      ...PositionSwapByIntentApprovalsRequired
    }
    ... on InsufficientLiquidityError {
      ...InsufficientLiquidityError
    }
    ... on AmountTooSmallError {
      ...AmountTooSmallError
    }
  }`,
  [
    PositionSwapByIntentApprovalsRequiredFragment,
    InsufficientLiquidityErrorFragment,
    AmountTooSmallErrorFragment,
  ],
);

export const WithdrawSwapQuoteResultFragment: FragmentDocumentFor<
  PositionSwapQuoteResult,
  'WithdrawSwapQuoteResult'
> = graphql(
  `fragment WithdrawSwapQuoteResult on WithdrawSwapQuoteResult {
    __typename
    ... on PositionSwapByIntentApprovalsRequired {
      ...PositionSwapByIntentApprovalsRequired
    }
    ... on InsufficientLiquidityError {
      ...InsufficientLiquidityError
    }
    ... on AmountTooSmallError {
      ...AmountTooSmallError
    }
  }`,
  [
    PositionSwapByIntentApprovalsRequiredFragment,
    InsufficientLiquidityErrorFragment,
    AmountTooSmallErrorFragment,
  ],
);

export const BorrowSwapQuoteResultFragment: FragmentDocumentFor<
  PositionSwapQuoteResult,
  'BorrowSwapQuoteResult'
> = graphql(
  `fragment BorrowSwapQuoteResult on BorrowSwapQuoteResult {
    __typename
    ... on PositionSwapByIntentApprovalsRequired {
      ...PositionSwapByIntentApprovalsRequired
    }
    ... on InsufficientLiquidityError {
      ...InsufficientLiquidityError
    }
    ... on AmountTooSmallError {
      ...AmountTooSmallError
    }
  }`,
  [
    PositionSwapByIntentApprovalsRequiredFragment,
    InsufficientLiquidityErrorFragment,
    AmountTooSmallErrorFragment,
  ],
);

export const RepayWithSupplyQuoteResultFragment: FragmentDocumentFor<
  PositionSwapQuoteResult,
  'RepayWithSupplyQuoteResult'
> = graphql(
  `fragment RepayWithSupplyQuoteResult on RepayWithSupplyQuoteResult {
    __typename
    ... on PositionSwapByIntentApprovalsRequired {
      ...PositionSwapByIntentApprovalsRequired
    }
    ... on InsufficientLiquidityError {
      ...InsufficientLiquidityError
    }
    ... on AmountTooSmallError {
      ...AmountTooSmallError
    }
  }`,
  [
    PositionSwapByIntentApprovalsRequiredFragment,
    InsufficientLiquidityErrorFragment,
    AmountTooSmallErrorFragment,
  ],
);
