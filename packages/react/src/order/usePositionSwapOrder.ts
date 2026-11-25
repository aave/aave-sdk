import type { AaveClient, UnexpectedError } from '@aave/client';
import {
  borrowSwapQuote,
  repayWithSupplyQuote,
  type SwapQuoteError,
  supplySwapQuote,
  withdrawSwapQuote,
} from '@aave/client/actions';
import type {
  BorrowSwapQuoteRequest,
  Erc20Approval,
  OrderReceipt,
  OrderTransactionRequest,
  OrderTypedData,
  PositionSwapAdapterContractApproval,
  PositionSwapAdapterTransactionApproval,
  PositionSwapByIntentApprovalsRequired,
  RepayWithSupplyQuoteRequest,
  SupplySwapQuoteRequest,
  WithdrawSwapQuoteRequest,
} from '@aave/graphql';
import type { ResultAsync } from '@aave/types';
import { useAaveClient } from '../context';
import { type UseAsyncTask, useAsyncTask } from '../helpers';
import {
  approve,
  type OrderError,
  type OrderHandler,
  signAndSubmit,
} from './helpers';

export type PositionSwapOrderPlan =
  | Erc20Approval
  | PositionSwapAdapterContractApproval
  | PositionSwapAdapterTransactionApproval
  | OrderTypedData
  | OrderTransactionRequest;

export type PositionSwapOrderError = OrderError | SwapQuoteError;

export type PositionOrderHandler = OrderHandler<PositionSwapOrderPlan>;

export type UseSupplySwapOrderRequest = SupplySwapQuoteRequest;
export type UseWithdrawSwapOrderRequest = WithdrawSwapQuoteRequest;
export type UseBorrowSwapOrderRequest = BorrowSwapQuoteRequest;
export type UseRepayWithSupplyOrderRequest = RepayWithSupplyQuoteRequest;

function usePositionSwapOrder<TRequest>(
  quote: (
    client: AaveClient,
    request: TRequest,
  ) => ResultAsync<
    PositionSwapByIntentApprovalsRequired,
    SwapQuoteError | UnexpectedError
  >,
  handler: OrderHandler<PositionSwapOrderPlan>,
): UseAsyncTask<TRequest, OrderReceipt, PositionSwapOrderError> {
  const client = useAaveClient();

  return useAsyncTask((request: TRequest) =>
    quote(client, request).andThen((result) =>
      approve(result.approvals, handler).andThen((signatures) =>
        signAndSubmit(
          client,
          { quoteId: result.quote.orderQuoteId, ...signatures },
          handler,
        ),
      ),
    ),
  );
}

/**
 * Swaps part of a supply into another reserve of the same market, as an order.
 *
 * Runs the quote's approvals in order (an ERC-20 approval or permit, the
 * adapter's typed data to sign, or the adapter's credit delegation to send),
 * then signs and submits the order, resolving to its receipt.
 *
 * ```tsx
 * const [swap, { loading, error }] = useSupplySwapOrder((plan) => {
 *   switch (plan.__typename) {
 *     case 'Erc20Approval':
 *       return plan.byPermit
 *         ? signTypedData(plan.byPermit)
 *         : sendTransaction(plan.byTransaction);
 *     case 'PositionSwapAdapterContractApproval':
 *       return signTypedData(plan.bySignature);
 *     case 'PositionSwapAdapterTransactionApproval':
 *       return sendTransaction(plan.byTransaction);
 *     case 'OrderTypedData':
 *       return signTypedData(plan);
 *     case 'OrderTransactionRequest':
 *       return sendTransaction(plan.transaction);
 *   }
 * });
 *
 * const result = await swap({
 *   market: { sellPosition, buyReserve, amount, user },
 * });
 * ```
 */
export function useSupplySwapOrder(
  handler: OrderHandler<PositionSwapOrderPlan>,
): UseAsyncTask<SupplySwapQuoteRequest, OrderReceipt, PositionSwapOrderError> {
  return usePositionSwapOrder(supplySwapQuote, handler);
}

/**
 * Withdraws part of a supply and sells it for a token paid to the wallet, as an order.
 *
 * Same handler as {@link useSupplySwapOrder}.
 */
export function useWithdrawSwapOrder(
  handler: OrderHandler<PositionSwapOrderPlan>,
): UseAsyncTask<
  WithdrawSwapQuoteRequest,
  OrderReceipt,
  PositionSwapOrderError
> {
  return usePositionSwapOrder(withdrawSwapQuote, handler);
}

/**
 * Moves a borrow to another reserve of the same market, as an order.
 *
 * Same handler as {@link useSupplySwapOrder}.
 */
export function useBorrowSwapOrder(
  handler: OrderHandler<PositionSwapOrderPlan>,
): UseAsyncTask<BorrowSwapQuoteRequest, OrderReceipt, PositionSwapOrderError> {
  return usePositionSwapOrder(borrowSwapQuote, handler);
}

/**
 * Repays a borrow with a supply of the same market, as an order.
 *
 * Same handler as {@link useSupplySwapOrder}.
 */
export function useRepayWithSupplyOrder(
  handler: OrderHandler<PositionSwapOrderPlan>,
): UseAsyncTask<
  RepayWithSupplyQuoteRequest,
  OrderReceipt,
  PositionSwapOrderError
> {
  return usePositionSwapOrder(repayWithSupplyQuote, handler);
}
