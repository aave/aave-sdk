import {
  CancelOrderExecutionPlanFragment,
  OrderExecutionPlanFragment,
  OrderStatusFragment,
  PaginatedOrdersResultFragment,
  PrepareCancelOrderResultFragment,
  PrepareOrderResultFragment,
} from './fragments';
import { graphql, type RequestOf } from './graphql';

/**
 * @internal
 */
export const PrepareOrderQuery = graphql(
  `query PrepareOrder($request: PrepareOrderRequest!) {
    value: prepareOrder(request: $request) {
      ...PrepareOrderResult
    }
  }`,
  [PrepareOrderResultFragment],
);
export type PrepareOrderRequest = RequestOf<typeof PrepareOrderQuery>;

/**
 * @internal
 */
export const OrderStatusQuery = graphql(
  `query OrderStatus($request: OrderStatusRequest!) {
    value: orderStatus(request: $request) {
      ...OrderStatus
    }
  }`,
  [OrderStatusFragment],
);
export type OrderStatusRequest = RequestOf<typeof OrderStatusQuery>;

/**
 * @internal
 */
export const PendingOrdersQuery = graphql(
  `query PendingOrders($request: PendingOrdersRequest!) {
    value: pendingOrders(request: $request) {
      ...PaginatedOrdersResult
    }
  }`,
  [PaginatedOrdersResultFragment],
);
export type PendingOrdersRequest = RequestOf<typeof PendingOrdersQuery>;

/**
 * @internal
 */
export const PrepareCancelOrderQuery = graphql(
  `query PrepareCancelOrder($request: PrepareCancelOrderRequest!) {
    value: prepareCancelOrder(request: $request) {
      ...PrepareCancelOrderResult
    }
  }`,
  [PrepareCancelOrderResultFragment],
);
export type PrepareCancelOrderRequest = RequestOf<
  typeof PrepareCancelOrderQuery
>;

/**
 * @internal
 */
export const SubmitOrderMutation = graphql(
  `mutation SubmitOrder($request: SubmitOrderRequest!) {
    value: submitOrder(request: $request) {
      ...OrderExecutionPlan
    }
  }`,
  [OrderExecutionPlanFragment],
);
export type SubmitOrderRequest = RequestOf<typeof SubmitOrderMutation>;

export type SubmitOrderBySignatureInput = ReturnType<
  typeof graphql.scalar<'SubmitOrderBySignatureInput'>
>;
export type SubmitOrderByTransactionInput = ReturnType<
  typeof graphql.scalar<'SubmitOrderByTransactionInput'>
>;

/**
 * @internal
 */
export const CancelOrderMutation = graphql(
  `mutation CancelOrder($request: CancelOrderRequest!) {
    value: cancelOrder(request: $request) {
      ...CancelOrderExecutionPlan
    }
  }`,
  [CancelOrderExecutionPlanFragment],
);
export type CancelOrderRequest = RequestOf<typeof CancelOrderMutation>;

export type CancelOrderBySignatureInput = ReturnType<
  typeof graphql.scalar<'CancelOrderBySignatureInput'>
>;
