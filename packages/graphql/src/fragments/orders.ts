import type { FragmentOf } from 'gql.tada';
import { type FragmentDocumentFor, graphql } from '../graphql';
import { PermitTypedDataResponseFragment } from '../permits';
import {
  CurrencyFragment,
  type PaginatedResultInfo,
  PaginatedResultInfoFragment,
  PercentValueFragment,
  TokenAmountFragment,
} from './common';
import { ReserveInfoFragment } from './reserve';
import {
  type AmountTooSmallError,
  AmountTooSmallErrorFragment,
  type InsufficientLiquidityError,
  InsufficientLiquidityErrorFragment,
  OrderTypedDataFragment,
  SwapCurrencyFragment,
  UnpricedTokenAmountFragment,
} from './swaps';
import {
  InsufficientBalanceErrorFragment,
  type TransactionRequest,
  TransactionRequestFragment,
} from './transactions';

export const PreparedOrderFragment = graphql(
  `fragment PreparedOrder on PreparedOrder {
    __typename
    newQuoteId
    data {
      ...OrderTypedData
    }
  }`,
  [OrderTypedDataFragment],
);
export type PreparedOrder = FragmentOf<typeof PreparedOrderFragment>;

export const PrepareOrderResultFragment = graphql(
  `fragment PrepareOrderResult on PrepareOrderResult {
    __typename
    ... on PreparedOrder {
      ...PreparedOrder
    }
    ... on InsufficientBalanceError {
      ...InsufficientBalanceError
    }
  }`,
  [PreparedOrderFragment, InsufficientBalanceErrorFragment],
);
export type PrepareOrderResult = FragmentOf<typeof PrepareOrderResultFragment>;

export const PositionAmountFragment = graphql(
  `fragment PositionAmount on PositionAmount {
    __typename
    reserve {
      ...ReserveInfo
    }
    amount {
      ...TokenAmount
    }
  }`,
  [ReserveInfoFragment, TokenAmountFragment],
);
export type PositionAmount = FragmentOf<typeof PositionAmountFragment>;

export const ReturnedAmountFragment = graphql(
  `fragment ReturnedAmount on ReturnedAmount {
    __typename
    currency {
      ...Currency
    }
    amount {
      ...UnpricedTokenAmount
    }
  }`,
  [CurrencyFragment, UnpricedTokenAmountFragment],
);
export type ReturnedAmount = FragmentOf<typeof ReturnedAmountFragment>;

export const TokenSwapFragment = graphql(
  `fragment TokenSwap on TokenSwap {
    __typename
    sell {
      ...UnpricedTokenAmount
    }
    buy {
      ...UnpricedTokenAmount
    }
    kind
    orderClass
    sellCurrency {
      ...SwapCurrency
    }
    buyCurrency {
      ...SwapCurrency
    }
  }`,
  [UnpricedTokenAmountFragment, SwapCurrencyFragment],
);
export type TokenSwap = FragmentOf<typeof TokenSwapFragment>;

export const SupplySwapFragment = graphql(
  `fragment SupplySwap on SupplySwap {
    __typename
    sell {
      ...PositionAmount
    }
    buy {
      ...PositionAmount
    }
    supplySwapKind: kind
    orderClass
  }`,
  [PositionAmountFragment],
);
export type SupplySwap = FragmentOf<typeof SupplySwapFragment>;

export const WithdrawSwapFragment = graphql(
  `fragment WithdrawSwap on WithdrawSwap {
    __typename
    withdraw {
      ...PositionAmount
    }
    buy {
      ...UnpricedTokenAmount
    }
    withdrawSwapKind: kind
    orderClass
    buyCurrency {
      ...SwapCurrency
    }
  }`,
  [PositionAmountFragment, UnpricedTokenAmountFragment, SwapCurrencyFragment],
);
export type WithdrawSwap = FragmentOf<typeof WithdrawSwapFragment>;

export const BorrowSwapFragment = graphql(
  `fragment BorrowSwap on BorrowSwap {
    __typename
    sell {
      ...PositionAmount
    }
    buy {
      ...PositionAmount
    }
    borrowSwapKind: kind
    orderClass
  }`,
  [PositionAmountFragment],
);
export type BorrowSwap = FragmentOf<typeof BorrowSwapFragment>;

export const RepayWithSupplyFragment = graphql(
  `fragment RepayWithSupply on RepayWithSupply {
    __typename
    repay {
      ...PositionAmount
    }
    supply {
      ...PositionAmount
    }
    repayWithSupplyKind: kind
    orderClass
    returned {
      ...ReturnedAmount
    }
  }`,
  [PositionAmountFragment, ReturnedAmountFragment],
);
export type RepayWithSupply = FragmentOf<typeof RepayWithSupplyFragment>;

export const LeverageFragment = graphql(
  `fragment Leverage on Leverage {
    __typename
    collateral {
      ...PositionAmount
    }
    debt {
      ...PositionAmount
    }
    multiplier
    returned {
      ...TokenAmount
    }
  }`,
  [PositionAmountFragment, TokenAmountFragment],
);
export type Leverage = FragmentOf<typeof LeverageFragment>;

export type OrderOperation =
  | TokenSwap
  | SupplySwap
  | WithdrawSwap
  | BorrowSwap
  | RepayWithSupply
  | Leverage;

export const OrderOperationFragment: FragmentDocumentFor<
  OrderOperation,
  'OrderOperation'
> = graphql(
  `fragment OrderOperation on OrderOperation {
    __typename
    ... on TokenSwap {
      ...TokenSwap
    }
    ... on SupplySwap {
      ...SupplySwap
    }
    ... on WithdrawSwap {
      ...WithdrawSwap
    }
    ... on BorrowSwap {
      ...BorrowSwap
    }
    ... on RepayWithSupply {
      ...RepayWithSupply
    }
    ... on Leverage {
      ...Leverage
    }
  }`,
  [
    TokenSwapFragment,
    SupplySwapFragment,
    WithdrawSwapFragment,
    BorrowSwapFragment,
    RepayWithSupplyFragment,
    LeverageFragment,
  ],
);

export const OrderOpenFragment = graphql(
  `fragment OrderOpen on OrderOpen {
    __typename
    orderId
    createdAt
    deadline
    explorerUrl
    operation {
      ...OrderOperation
    }
  }`,
  [OrderOperationFragment],
);
export type OrderOpen = FragmentOf<typeof OrderOpenFragment>;

export const OrderPendingSignatureFragment = graphql(
  `fragment OrderPendingSignature on OrderPendingSignature {
    __typename
    orderId
    createdAt
    deadline
    explorerUrl
    operation {
      ...OrderOperation
    }
  }`,
  [OrderOperationFragment],
);
export type OrderPendingSignature = FragmentOf<
  typeof OrderPendingSignatureFragment
>;

export const OrderFulfilledFragment = graphql(
  `fragment OrderFulfilled on OrderFulfilled {
    __typename
    orderId
    createdAt
    fulfilledAt
    txHash
    explorerUrl
    operation {
      ...OrderOperation
    }
  }`,
  [OrderOperationFragment],
);
export type OrderFulfilled = FragmentOf<typeof OrderFulfilledFragment>;

export const OrderCancelledFragment = graphql(
  `fragment OrderCancelled on OrderCancelled {
    __typename
    orderId
    createdAt
    cancelledAt
    explorerUrl
    operation {
      ...OrderOperation
    }
  }`,
  [OrderOperationFragment],
);
export type OrderCancelled = FragmentOf<typeof OrderCancelledFragment>;

export const OrderExpiredFragment = graphql(
  `fragment OrderExpired on OrderExpired {
    __typename
    orderId
    createdAt
    expiredAt
    explorerUrl
    operation {
      ...OrderOperation
    }
  }`,
  [OrderOperationFragment],
);
export type OrderExpired = FragmentOf<typeof OrderExpiredFragment>;

// Explicit document types from here on: inferring them exceeds what the
// compiler will serialize in declaration emit (TS7056).
export type OrderStatus =
  | OrderOpen
  | OrderPendingSignature
  | OrderFulfilled
  | OrderCancelled
  | OrderExpired;

export const OrderStatusFragment: FragmentDocumentFor<
  OrderStatus,
  'OrderStatus'
> = graphql(
  `fragment OrderStatus on OrderStatus {
    __typename
    ... on OrderOpen {
      ...OrderOpen
    }
    ... on OrderPendingSignature {
      ...OrderPendingSignature
    }
    ... on OrderFulfilled {
      ...OrderFulfilled
    }
    ... on OrderCancelled {
      ...OrderCancelled
    }
    ... on OrderExpired {
      ...OrderExpired
    }
  }`,
  [
    OrderOpenFragment,
    OrderPendingSignatureFragment,
    OrderFulfilledFragment,
    OrderCancelledFragment,
    OrderExpiredFragment,
  ],
);

export type PaginatedOrdersResult = {
  __typename: 'PaginatedOrdersResult';
  items: OrderStatus[];
  pageInfo: PaginatedResultInfo;
};

export const PaginatedOrdersResultFragment: FragmentDocumentFor<
  PaginatedOrdersResult,
  'PaginatedOrdersResult'
> = graphql(
  `fragment PaginatedOrdersResult on PaginatedOrdersResult {
    __typename
    items {
      ...OrderStatus
    }
    pageInfo {
      ...PaginatedResultInfo
    }
  }`,
  [OrderStatusFragment, PaginatedResultInfoFragment],
);

export const OrderReceiptFragment = graphql(
  `fragment OrderReceipt on OrderReceipt {
    __typename
    orderId
  }`,
);
export type OrderReceipt = FragmentOf<typeof OrderReceiptFragment>;

export const OrderTransactionRequestFragment = graphql(
  `fragment OrderTransactionRequest on OrderTransactionRequest {
    __typename
    transaction {
      ...TransactionRequest
    }
    orderReceipt {
      ...OrderReceipt
    }
  }`,
  [TransactionRequestFragment, OrderReceiptFragment],
);
export type OrderTransactionRequest = FragmentOf<
  typeof OrderTransactionRequestFragment
>;

export const OrderExecutionPlanFragment = graphql(
  `fragment OrderExecutionPlan on OrderExecutionPlan {
    __typename
    ... on OrderTransactionRequest {
      ...OrderTransactionRequest
    }
    ... on OrderReceipt {
      ...OrderReceipt
    }
    ... on InsufficientBalanceError {
      ...InsufficientBalanceError
    }
  }`,
  [
    OrderTransactionRequestFragment,
    OrderReceiptFragment,
    InsufficientBalanceErrorFragment,
  ],
);
export type OrderExecutionPlan = FragmentOf<typeof OrderExecutionPlanFragment>;

export const PrepareCancelOrderResultFragment = graphql(
  `fragment PrepareCancelOrderResult on PrepareCancelOrderResult {
    __typename
    data {
      ...OrderTypedData
    }
  }`,
  [OrderTypedDataFragment],
);
export type PrepareCancelOrderResult = FragmentOf<
  typeof PrepareCancelOrderResultFragment
>;

export const OrderCancelledResultFragment = graphql(
  `fragment OrderCancelledResult on OrderCancelledResult {
    __typename
    orderId
  }`,
);
export type OrderCancelledResult = FragmentOf<
  typeof OrderCancelledResultFragment
>;

export type CancelOrderExecutionPlan =
  | TransactionRequest
  | OrderCancelledResult;

export const CancelOrderExecutionPlanFragment: FragmentDocumentFor<
  CancelOrderExecutionPlan,
  'CancelOrderExecutionPlan'
> = graphql(
  `fragment CancelOrderExecutionPlan on CancelOrderExecutionPlan {
    __typename
    ... on TransactionRequest {
      ...TransactionRequest
    }
    ... on OrderCancelledResult {
      ...OrderCancelledResult
    }
  }`,
  [TransactionRequestFragment, OrderCancelledResultFragment],
);

export const OrderQuoteCostsFragment = graphql(
  `fragment OrderQuoteCosts on OrderQuoteCosts {
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
export type OrderQuoteCosts = FragmentOf<typeof OrderQuoteCostsFragment>;

export const OrderQuoteFragment = graphql(
  `fragment OrderQuote on OrderQuote {
    __typename
    accuracy
    quoteId
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
      ...OrderQuoteCosts
    }
    finalSell {
      ...UnpricedTokenAmount
    }
    finalBuy {
      ...UnpricedTokenAmount
    }
    kind
    class
  }`,
  [PercentValueFragment, UnpricedTokenAmountFragment, OrderQuoteCostsFragment],
);
export type OrderQuote = FragmentOf<typeof OrderQuoteFragment>;

export const OrderAdapterApprovalFragment = graphql(
  `fragment OrderAdapterApproval on OrderAdapterApproval {
    __typename
    bySignature {
      ...OrderTypedData
    }
  }`,
  [OrderTypedDataFragment],
);
export type OrderAdapterApproval = FragmentOf<
  typeof OrderAdapterApprovalFragment
>;

export const OrderAdapterTransactionApprovalFragment = graphql(
  `fragment OrderAdapterTransactionApproval on OrderAdapterTransactionApproval {
    __typename
    byTransaction {
      ...TransactionRequest
    }
  }`,
  [TransactionRequestFragment],
);
export type OrderAdapterTransactionApproval = FragmentOf<
  typeof OrderAdapterTransactionApprovalFragment
>;

/**
 * `bySignature` is aliased to `byPermit`, as in `Erc20Approval`.
 */
export const OrderErc20ApprovalFragment = graphql(
  `fragment OrderErc20Approval on OrderErc20Approval {
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
export type OrderErc20Approval = FragmentOf<typeof OrderErc20ApprovalFragment>;

export const OrderApprovalFragment = graphql(
  `fragment OrderApproval on OrderApproval {
    __typename
    ... on OrderAdapterApproval {
      ...OrderAdapterApproval
    }
    ... on OrderAdapterTransactionApproval {
      ...OrderAdapterTransactionApproval
    }
    ... on OrderErc20Approval {
      ...OrderErc20Approval
    }
  }`,
  [
    OrderAdapterApprovalFragment,
    OrderAdapterTransactionApprovalFragment,
    OrderErc20ApprovalFragment,
  ],
);
export type OrderApproval = FragmentOf<typeof OrderApprovalFragment>;

export const LeverageApprovalsRequiredFragment = graphql(
  `fragment LeverageApprovalsRequired on LeverageApprovalsRequired {
    __typename
    quote {
      ...OrderQuote
    }
    approvals {
      ...OrderApproval
    }
    minMultiplier
    maxSafeMultiplier
  }`,
  [OrderQuoteFragment, OrderApprovalFragment],
);
export type LeverageApprovalsRequired = FragmentOf<
  typeof LeverageApprovalsRequiredFragment
>;

export type LeverageQuoteResult =
  | LeverageApprovalsRequired
  | InsufficientLiquidityError
  | AmountTooSmallError;

export const LeverageQuoteResultFragment: FragmentDocumentFor<
  LeverageQuoteResult,
  'LeverageQuoteResult'
> = graphql(
  `fragment LeverageQuoteResult on LeverageQuoteResult {
    __typename
    ... on LeverageApprovalsRequired {
      ...LeverageApprovalsRequired
    }
    ... on InsufficientLiquidityError {
      ...InsufficientLiquidityError
    }
    ... on AmountTooSmallError {
      ...AmountTooSmallError
    }
  }`,
  [
    LeverageApprovalsRequiredFragment,
    InsufficientLiquidityErrorFragment,
    AmountTooSmallErrorFragment,
  ],
);
