import { leverageQuote, type SwapQuoteError } from '@aave/client/actions';
import type {
  LeverageQuoteRequest,
  OrderApproval,
  OrderReceipt,
  OrderTransactionRequest,
  OrderTypedData,
} from '@aave/graphql';
import { useAaveClient } from '../context';
import { type UseAsyncTask, useAsyncTask } from '../helpers';
import {
  approve,
  type OrderError,
  type OrderHandler,
  signAndSubmit,
} from './helpers';

export type OrderPlan =
  | OrderApproval
  | OrderTypedData
  | OrderTransactionRequest;

export type UseLeverageRequest = LeverageQuoteRequest;

/**
 * Opens or increases a leveraged position as an order: borrows the debt
 * reserve, swaps it into the collateral reserve and supplies it.
 *
 * Runs the quote's approvals in order (an ERC-20 approval or permit for extra
 * collateral, the adapter's typed data to sign, or its transaction to send),
 * then signs and submits the order, resolving to its receipt.
 *
 * ```tsx
 * const [leverage, { loading, error }] = useLeverage((plan) => {
 *   switch (plan.__typename) {
 *     case 'OrderErc20Approval':
 *       return plan.byPermit
 *         ? signTypedData(plan.byPermit)
 *         : sendTransaction(plan.byTransaction);
 *     case 'OrderAdapterApproval':
 *       return signTypedData(plan.bySignature);
 *     case 'OrderAdapterTransactionApproval':
 *       return sendTransaction(plan.byTransaction);
 *     case 'OrderTypedData':
 *       return signTypedData(plan);
 *     case 'OrderTransactionRequest':
 *       return sendTransaction(plan.transaction);
 *   }
 * });
 *
 * const result = await leverage({
 *   market: { debtReserve, collateralReserve, multiplier, user },
 * });
 * ```
 */
export function useLeverage(
  handler: OrderHandler<OrderPlan>,
): UseAsyncTask<UseLeverageRequest, OrderReceipt, OrderError | SwapQuoteError> {
  const client = useAaveClient();

  return useAsyncTask((request: UseLeverageRequest) =>
    leverageQuote(client, request).andThen((result) =>
      approve(result.approvals, handler).andThen((signatures) =>
        signAndSubmit(
          client,
          { quoteId: result.quote.quoteId, ...signatures },
          handler,
        ),
      ),
    ),
  );
}
