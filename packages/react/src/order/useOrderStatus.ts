import {
  type OrderStatus,
  OrderStatusQuery,
  type OrderStatusRequest,
  type PaginatedOrdersResult,
  PendingOrdersQuery,
  type PendingOrdersRequest,
} from '@aave/graphql';
import type {
  ReadResult,
  Suspendable,
  SuspendableResult,
  SuspenseResult,
} from '../helpers';
import { useSuspendableQuery } from '../helpers';

export type UseOrderStatusArgs = OrderStatusRequest;

/**
 * Fetch the status of an order, token swap or position swap.
 *
 * This signature supports React Suspense:
 *
 * ```tsx
 * const { data } = useOrderStatus({ id: receipt.orderId, suspense: true });
 * ```
 */
export function useOrderStatus(
  args: UseOrderStatusArgs & Suspendable,
): SuspenseResult<OrderStatus | null>;

/**
 * Fetch the status of an order, token swap or position swap.
 *
 * ```tsx
 * const { data, error, loading } = useOrderStatus({ id: receipt.orderId });
 * ```
 */
export function useOrderStatus(
  args: UseOrderStatusArgs,
): ReadResult<OrderStatus | null>;

export function useOrderStatus({
  suspense = false,
  ...request
}: UseOrderStatusArgs & {
  suspense?: boolean;
}): SuspendableResult<OrderStatus | null> {
  return useSuspendableQuery({
    document: OrderStatusQuery,
    variables: { request },
    suspense,
  });
}

export type UsePendingOrdersArgs = PendingOrdersRequest;

/**
 * Fetch a user's token swap orders, newest first. Position swap orders are
 * not listed: read those with {@link useOrderStatus}.
 *
 * This signature supports React Suspense:
 *
 * ```tsx
 * const { data } = usePendingOrders({
 *   user: evmAddress('0x742d35cc…'),
 *   chainIds: [chainId(1)],
 *   suspense: true,
 * });
 * ```
 */
export function usePendingOrders(
  args: UsePendingOrdersArgs & Suspendable,
): SuspenseResult<PaginatedOrdersResult>;

/**
 * Fetch a user's token swap orders, newest first. Position swap orders are
 * not listed: read those with {@link useOrderStatus}.
 *
 * ```tsx
 * const { data, error, loading } = usePendingOrders({
 *   user: evmAddress('0x742d35cc…'),
 *   chainIds: [chainId(1)],
 * });
 * ```
 */
export function usePendingOrders(
  args: UsePendingOrdersArgs,
): ReadResult<PaginatedOrdersResult>;

export function usePendingOrders({
  suspense = false,
  ...request
}: UsePendingOrdersArgs & {
  suspense?: boolean;
}): SuspendableResult<PaginatedOrdersResult> {
  return useSuspendableQuery({
    document: PendingOrdersQuery,
    variables: { request },
    suspense,
  });
}
