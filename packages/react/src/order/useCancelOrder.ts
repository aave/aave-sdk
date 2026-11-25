import { UnexpectedError } from '@aave/client';
import {
  cancelOrder,
  orderStatus,
  prepareCancelOrder,
  waitForOrderOutcome,
} from '@aave/client/actions';
import type {
  OrderCancelledResult,
  OrderTypedData,
  PrepareCancelOrderRequest,
  TransactionRequest,
} from '@aave/graphql';
import { type OrderId, okAsync, ResultAwareError } from '@aave/types';
import { useAaveClient } from '../context';
import { type UseAsyncTask, useAsyncTask } from '../helpers';
import {
  type OrderHandler,
  type OrderHandlerError,
  transactionFrom,
  trySignatureFrom,
} from './helpers';

/**
 * The order was fulfilled or expired, so it cannot be cancelled.
 */
export class CannotCancelOrderError extends ResultAwareError {
  name = 'CannotCancelOrderError' as const;
}

export type CancelOrderHandler = OrderHandler<
  OrderTypedData | TransactionRequest
>;

export type CancelOrderError = OrderHandlerError | CannotCancelOrderError;

function cancelled(orderId: OrderId): OrderCancelledResult {
  return { __typename: 'OrderCancelledResult', orderId };
}

/**
 * Cancels an open order: signs the cancellation, and sends the cancel
 * transaction when the order can only be cancelled on chain.
 *
 * Resolves once the backend accepts the signed cancellation, or once the
 * order shows as cancelled after the cancel transaction. Fails with
 * `CannotCancelOrderError` if the order was fulfilled or expired first.
 *
 * ```tsx
 * const [cancel, { loading, error }] = useCancelOrder((plan) => {
 *   switch (plan.__typename) {
 *     case 'OrderTypedData':
 *       return signTypedData(plan);
 *     case 'TransactionRequest':
 *       return sendTransaction(plan);
 *   }
 * });
 *
 * const result = await cancel({ id: order.orderId });
 * ```
 */
export function useCancelOrder(
  handler: CancelOrderHandler,
): UseAsyncTask<
  PrepareCancelOrderRequest,
  OrderCancelledResult,
  CancelOrderError
> {
  const client = useAaveClient();

  return useAsyncTask((request: PrepareCancelOrderRequest) =>
    orderStatus(client, { id: request.id }).andThen((status) => {
      switch (status?.__typename) {
        case undefined:
          return UnexpectedError.from('Order not found').asResultAsync();

        case 'OrderCancelled':
          return okAsync(cancelled(request.id));

        case 'OrderFulfilled':
        case 'OrderExpired':
          return new CannotCancelOrderError(
            'Order can no longer be cancelled',
          ).asResultAsync();

        case 'OrderOpen':
        case 'OrderPendingSignature':
          return prepareCancelOrder(client, request)
            .andThen(({ data }) => handler(data))
            .andThen(trySignatureFrom)
            .andThen((signature) =>
              cancelOrder(client, {
                bySignature: { id: request.id, signature },
              }),
            )
            .andThen((plan) => {
              if (plan.__typename === 'OrderCancelledResult') {
                return okAsync(plan);
              }
              // Poll: the indexer may not have seen the mined cancellation yet.
              return handler(plan)
                .andThen(transactionFrom)
                .andThen(() =>
                  waitForOrderOutcome(client)({
                    __typename: 'OrderReceipt',
                    orderId: request.id,
                  }),
                )
                .andThen((outcome) =>
                  outcome.__typename === 'OrderCancelled'
                    ? okAsync(cancelled(request.id))
                    : new CannotCancelOrderError(
                        outcome.__typename === 'OrderFulfilled'
                          ? 'Order was fulfilled before the cancellation took effect'
                          : 'Order expired before the cancellation took effect',
                      ).asResultAsync(),
                );
            });

        default:
          return UnexpectedError.from(
            `Unsupported order status: ${(status as { __typename: string }).__typename}. Upgrade the SDK.`,
          ).asResultAsync();
      }
    }),
  );
}
