import { DEFAULT_SWAP_STATUS_INTERVAL } from '@aave/client';
import {
  type OrderStatus,
  OrderStatusQuery,
  type OrderStatusRequest,
  type PaginatedOrdersResult,
  PendingOrdersQuery,
  type PendingOrdersRequest,
} from '@aave/graphql';
import { useEffect, useState } from 'react';
import { useAaveClient } from '../context';
import type {
  ReadResult,
  Suspendable,
  SuspendableResult,
  SuspenseResult,
} from '../helpers';
import { useSuspendableQuery } from '../helpers';

/**
 * Whether an order reached a state it will not leave.
 */
export function isTerminalOrderStatus(status: OrderStatus): boolean {
  return (
    status.__typename === 'OrderFulfilled' ||
    status.__typename === 'OrderCancelled' ||
    status.__typename === 'OrderExpired'
  );
}

function useSwapStatusInterval(): number {
  const client = useAaveClient();
  return (
    client.context.environment.swapStatusInterval ??
    DEFAULT_SWAP_STATUS_INTERVAL
  );
}

export type UseOrderStatusArgs = OrderStatusRequest;

/**
 * Fetch the status of an order, token swap or position swap, polling until
 * it is fulfilled, cancelled or expired.
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
 * Fetch the status of an order, token swap or position swap, polling until
 * it is fulfilled, cancelled or expired.
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
  const interval = useSwapStatusInterval();
  // Polling stops for the order seen final, and resumes for a different id.
  const [finalOrderId, setFinalOrderId] = useState<string | null>(null);

  const result = useSuspendableQuery({
    document: OrderStatusQuery,
    variables: { request },
    suspense,
    pollInterval: finalOrderId === request.id ? 0 : interval,
  });

  const status = result.data;
  useEffect(() => {
    if (status && isTerminalOrderStatus(status)) {
      setFinalOrderId(status.orderId);
    }
  }, [status]);

  return result;
}

export type UsePendingOrdersArgs = PendingOrdersRequest;

/**
 * Fetch a user's token swap orders, newest first, polling while any is open.
 * Position swap orders are not listed: read those with {@link useOrderStatus}.
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
 * Fetch a user's token swap orders, newest first, polling while any is open.
 * Position swap orders are not listed: read those with {@link useOrderStatus}.
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
  const interval = useSwapStatusInterval();
  const [hasOpenOrders, setHasOpenOrders] = useState(false);

  const result = useSuspendableQuery({
    document: PendingOrdersQuery,
    variables: { request },
    suspense,
    pollInterval: hasOpenOrders ? interval : 0,
  });

  const page = result.data;
  useEffect(() => {
    setHasOpenOrders(
      page?.items.some((order) => !isTerminalOrderStatus(order)) ?? false,
    );
  }, [page]);

  return result;
}
