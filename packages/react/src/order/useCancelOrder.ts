import { UnexpectedError } from '@aave/client';
import { cancelOrder, prepareCancelOrder } from '@aave/client/actions';
import type {
  OrderCancelledResult,
  OrderTypedData,
  PrepareCancelOrderRequest,
  TransactionRequest,
} from '@aave/graphql';
import { okAsync } from '@aave/types';
import { useAaveClient } from '../context';
import { type UseAsyncTask, useAsyncTask } from '../helpers';
import {
  type OrderHandler,
  type OrderHandlerError,
  transactionFrom,
} from './helpers';

/**
 * Cancels an order: signs the cancellation, and sends the cancel transaction
 * when the order can only be cancelled on chain.
 *
 * Resolves once the backend accepts the signed cancellation, or once the
 * cancel transaction is mined.
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
  handler: OrderHandler<OrderTypedData | TransactionRequest>,
): UseAsyncTask<
  PrepareCancelOrderRequest,
  OrderCancelledResult,
  OrderHandlerError
> {
  const client = useAaveClient();

  return useAsyncTask((request: PrepareCancelOrderRequest) =>
    prepareCancelOrder(client, request)
      .andThen(({ data }) => handler(data))
      .andThen((result) => {
        if (typeof result !== 'string') {
          return UnexpectedError.from(
            'Expected the handler to sign the cancellation',
          ).asResultAsync();
        }
        return cancelOrder(client, {
          bySignature: { id: request.id, signature: result },
        }).andThen((plan) => {
          switch (plan.__typename) {
            case 'OrderCancelledResult':
              return okAsync(plan);

            case 'TransactionRequest':
              return handler(plan)
                .andThen(transactionFrom)
                .map(
                  (): OrderCancelledResult => ({
                    __typename: 'OrderCancelledResult',
                    orderId: request.id,
                  }),
                );
          }
        });
      }),
  );
}
