import {
  DEFAULT_SWAP_STATUS_INTERVAL,
  delay,
  TimeoutError,
  UnexpectedError,
  ValidationError,
} from '@aave/core';
import {
  type AmountTooSmallError,
  BorrowSwapQuoteQuery,
  type BorrowSwapQuoteRequest,
  type CancelOrderExecutionPlan,
  CancelOrderMutation,
  type CancelOrderRequest,
  type InsufficientBalanceError,
  type InsufficientLiquidityError,
  type LeverageApprovalsRequired,
  LeverageQuoteQuery,
  type LeverageQuoteRequest,
  type OrderCancelled,
  type OrderExpired,
  type OrderFulfilled,
  type OrderReceipt,
  type OrderStatus,
  OrderStatusQuery,
  type OrderStatusRequest,
  type OrderTransactionRequest,
  type PaginatedOrdersResult,
  PendingOrdersQuery,
  type PendingOrdersRequest,
  type PositionSwapByIntentApprovalsRequired,
  type PositionSwapQuoteResult,
  PrepareCancelOrderQuery,
  type PrepareCancelOrderRequest,
  type PrepareCancelOrderResult,
  type PreparedOrder,
  PrepareOrderQuery,
  type PrepareOrderRequest,
  RepayWithSupplyQuoteQuery,
  type RepayWithSupplyQuoteRequest,
  SubmitOrderMutation,
  type SubmitOrderRequest,
  SupplySwapQuoteQuery,
  type SupplySwapQuoteRequest,
  type SwapByIntent,
  type SwapByIntentWithApprovalRequired,
  type SwapByTransaction,
  type SwapByTransactionWithApprovalRequired,
  type SwapCurrency,
  SwappableTokensQuery,
  type SwappableTokensRequest,
  TokenSwapQuoteQuery,
  type TokenSwapQuoteRequest,
  WithdrawSwapQuoteQuery,
  type WithdrawSwapQuoteRequest,
} from '@aave/graphql';
import { okAsync, ResultAsync, type TypedSelectionSet } from '@aave/types';
import type { AaveClient } from '../AaveClient';

/**
 * A token swap quote, with what the user does next to execute it.
 */
export type TokenSwapQuote =
  | SwapByIntent
  | SwapByIntentWithApprovalRequired
  | SwapByTransaction
  | SwapByTransactionWithApprovalRequired;

/**
 * Why a swap quote could not be made.
 */
export type SwapQuoteError = ValidationError<
  InsufficientLiquidityError | AmountTooSmallError
>;

function unsupported(node: TypedSelectionSet) {
  return UnexpectedError.from(
    `Unsupported result: ${node.__typename}. Upgrade the SDK.`,
  ).asResultAsync();
}

/**
 * Fetches a quote to swap one token for another from the user's wallet.
 *
 * ```ts
 * const result = await tokenSwapQuote(client, {
 *   market: {
 *     market: evmAddress('0x87870Bca…'),
 *     chainId: chainId(1),
 *     sell: { erc20: evmAddress('0xA0b86991…') },
 *     buy: { native: true },
 *     amount: bigDecimal('1000'),
 *     kind: TokenSwapKind.Sell,
 *     user: evmAddress('0x742d35cc…'),
 *   },
 * });
 * ```
 *
 * @param client - Aave client.
 * @param request - A `market`, `limit` or `fromQuote` quote request.
 * @returns The quote, and whether it executes by signature or by transaction.
 */
export function tokenSwapQuote(
  client: AaveClient,
  request: TokenSwapQuoteRequest,
): ResultAsync<TokenSwapQuote, SwapQuoteError | UnexpectedError> {
  return client.query(TokenSwapQuoteQuery, { request }).andThen((result) => {
    switch (result.__typename) {
      case 'SwapByIntent':
      case 'SwapByIntentWithApprovalRequired':
      case 'SwapByTransaction':
      case 'SwapByTransactionWithApprovalRequired':
        return okAsync(result);

      case 'InsufficientLiquidityError':
      case 'AmountTooSmallError':
        return ValidationError.fromGqlNode(result).asResultAsync();

      default:
        return unsupported(result);
    }
  });
}

function positionSwapQuote(
  result: PositionSwapQuoteResult,
): ResultAsync<
  PositionSwapByIntentApprovalsRequired,
  SwapQuoteError | UnexpectedError
> {
  switch (result.__typename) {
    case 'PositionSwapByIntentApprovalsRequired':
      return okAsync(result);

    case 'InsufficientLiquidityError':
    case 'AmountTooSmallError':
      return ValidationError.fromGqlNode(result).asResultAsync();

    default:
      return unsupported(result);
  }
}

/**
 * Fetches a quote to swap part of a supply into another reserve of the same market.
 *
 * ```ts
 * const result = await supplySwapQuote(client, {
 *   market: {
 *     sellPosition: userSupplyItemId({ chainId, market, user, underlyingToken: usdc }),
 *     buyReserve: reserveId({ chainId, market, underlyingToken: weth }),
 *     amount: bigDecimal('1000'),
 *     user,
 *   },
 * });
 * ```
 *
 * @param client - Aave client.
 * @param request - A `market`, `limit` or `fromQuote` quote request.
 * @returns The quote and the approvals to sign or send before `prepareOrder`.
 */
export function supplySwapQuote(
  client: AaveClient,
  request: SupplySwapQuoteRequest,
): ResultAsync<
  PositionSwapByIntentApprovalsRequired,
  SwapQuoteError | UnexpectedError
> {
  return client
    .query(SupplySwapQuoteQuery, { request })
    .andThen(positionSwapQuote);
}

/**
 * Fetches a quote to withdraw part of a supply and sell it for a token paid to the wallet.
 *
 * ```ts
 * const result = await withdrawSwapQuote(client, {
 *   market: {
 *     sellPosition: userSupplyItemId({ chainId, market, user, underlyingToken: usdc }),
 *     buyToken: { erc20: weth },
 *     amount: bigDecimal('1000'),
 *     user,
 *   },
 * });
 * ```
 *
 * @param client - Aave client.
 * @param request - A `market`, `limit` or `fromQuote` quote request.
 * @returns The quote and the approvals to sign or send before `prepareOrder`.
 */
export function withdrawSwapQuote(
  client: AaveClient,
  request: WithdrawSwapQuoteRequest,
): ResultAsync<
  PositionSwapByIntentApprovalsRequired,
  SwapQuoteError | UnexpectedError
> {
  return client
    .query(WithdrawSwapQuoteQuery, { request })
    .andThen(positionSwapQuote);
}

/**
 * Fetches a quote to move a borrow to another reserve of the same market.
 *
 * ```ts
 * const result = await borrowSwapQuote(client, {
 *   market: {
 *     debtPosition: userBorrowItemId({ chainId, market, user, underlyingToken: usdc }),
 *     buyReserve: reserveId({ chainId, market, underlyingToken: usdt }),
 *     amount: bigDecimal('500'),
 *     user,
 *   },
 * });
 * ```
 *
 * @param client - Aave client.
 * @param request - A `market`, `limit` or `fromQuote` quote request.
 * @returns The quote and the approvals to sign or send before `prepareOrder`.
 */
export function borrowSwapQuote(
  client: AaveClient,
  request: BorrowSwapQuoteRequest,
): ResultAsync<
  PositionSwapByIntentApprovalsRequired,
  SwapQuoteError | UnexpectedError
> {
  return client
    .query(BorrowSwapQuoteQuery, { request })
    .andThen(positionSwapQuote);
}

/**
 * Fetches a quote to repay a borrow with a supply of the same market.
 *
 * ```ts
 * const result = await repayWithSupplyQuote(client, {
 *   market: {
 *     debtPosition: userBorrowItemId({ chainId, market, user, underlyingToken: usdc }),
 *     repayWithReserve: reserveId({ chainId, market, underlyingToken: weth }),
 *     amount: bigDecimal('500'),
 *     user,
 *   },
 * });
 * ```
 *
 * @param client - Aave client.
 * @param request - A `market`, `limit` or `fromQuote` quote request.
 * @returns The quote and the approvals to sign or send before `prepareOrder`.
 */
export function repayWithSupplyQuote(
  client: AaveClient,
  request: RepayWithSupplyQuoteRequest,
): ResultAsync<
  PositionSwapByIntentApprovalsRequired,
  SwapQuoteError | UnexpectedError
> {
  return client
    .query(RepayWithSupplyQuoteQuery, { request })
    .andThen(positionSwapQuote);
}

/**
 * Fetches a leverage quote for opening or increasing a leveraged position.
 *
 * ```ts
 * const result = await leverageQuote(client, {
 *   market: {
 *     debtReserve: reserveId({ chainId, market, underlyingToken: usdc }),
 *     collateralReserve: reserveId({ chainId, market, underlyingToken: weth }),
 *     multiplier: bigDecimal('2.5'),
 *     user: evmAddress('0x742d35cc…'),
 *   },
 * });
 * ```
 *
 * @param client - Aave client.
 * @param request - A `market`, `limit` or `fromQuote` quote request.
 * @returns The leverage quote with approvals and the multiplier range it allows.
 */
export function leverageQuote(
  client: AaveClient,
  request: LeverageQuoteRequest,
): ResultAsync<LeverageApprovalsRequired, SwapQuoteError | UnexpectedError> {
  return client.query(LeverageQuoteQuery, { request }).andThen((result) => {
    switch (result.__typename) {
      case 'LeverageApprovalsRequired':
        return okAsync(result);

      case 'InsufficientLiquidityError':
      case 'AmountTooSmallError':
        return ValidationError.fromGqlNode(result).asResultAsync();

      default:
        return unsupported(result);
    }
  });
}

/**
 * Fetches the tokens a wallet swap may list, native and ERC-20.
 *
 * ```ts
 * const result = await swappableTokens(client, {
 *   query: { chainIds: [chainId(1)] },
 * });
 * ```
 *
 * @param client - Aave client.
 * @param request - The chains or the token whose chain to list; every chain when empty.
 * @returns The swappable tokens.
 */
export function swappableTokens(
  client: AaveClient,
  request: SwappableTokensRequest,
): ResultAsync<SwapCurrency[], UnexpectedError> {
  return client.query(SwappableTokensQuery, { request });
}

/**
 * Prepares the typed data to sign for a quoted order.
 *
 * Submit the signature with the returned `newQuoteId`, not the quote's id:
 * preparing rotates it.
 *
 * ```ts
 * const result = await prepareOrder(client, {
 *   quoteId: quote.orderQuoteId,
 * }).andThen((order) =>
 *   signTypedData(order.data).andThen((signature) =>
 *     submitOrder(client, {
 *       bySignature: { quoteId: order.newQuoteId, signature },
 *     }),
 *   ),
 * );
 * ```
 *
 * @param client - Aave client.
 * @param request - The quote id, and the permit or adapter signature when the quote asked for one.
 * @returns The order typed data and the quote id to submit it with.
 */
export function prepareOrder(
  client: AaveClient,
  request: PrepareOrderRequest,
): ResultAsync<
  PreparedOrder,
  ValidationError<InsufficientBalanceError> | UnexpectedError
> {
  return client.query(PrepareOrderQuery, { request }).andThen((result) => {
    switch (result.__typename) {
      case 'PreparedOrder':
        return okAsync(result);

      case 'InsufficientBalanceError':
        return ValidationError.fromGqlNode(result).asResultAsync();

      default:
        return unsupported(result);
    }
  });
}

/**
 * Submits a signed order, or gets the transaction that places it.
 *
 * ```ts
 * const result = await submitOrder(client, {
 *   bySignature: { quoteId: order.newQuoteId, signature },
 * }).andThen((plan) => {
 *   switch (plan.__typename) {
 *     case 'OrderTransactionRequest':
 *       return sendTransaction(plan.transaction).map(() => plan.orderReceipt);
 *     case 'OrderReceipt':
 *       return okAsync(plan);
 *   }
 * });
 * ```
 *
 * @param client - Aave client.
 * @param request - A `bySignature` or `byTransaction` submission.
 * @returns The order receipt, or the transaction to send before it counts.
 */
export function submitOrder(
  client: AaveClient,
  request: SubmitOrderRequest,
): ResultAsync<
  OrderTransactionRequest | OrderReceipt,
  ValidationError<InsufficientBalanceError> | UnexpectedError
> {
  return client.mutation(SubmitOrderMutation, { request }).andThen((plan) => {
    switch (plan.__typename) {
      case 'OrderTransactionRequest':
      case 'OrderReceipt':
        return okAsync(plan);

      case 'InsufficientBalanceError':
        return ValidationError.fromGqlNode(plan).asResultAsync();

      default:
        return unsupported(plan);
    }
  });
}

/**
 * Fetches the status of an order, token swap or position swap.
 *
 * ```ts
 * const result = await orderStatus(client, { id: receipt.orderId });
 * ```
 *
 * @param client - Aave client.
 * @param request - The order id from `submitOrder`.
 * @returns The order status, or `null` if the order is unknown.
 */
export function orderStatus(
  client: AaveClient,
  request: OrderStatusRequest,
): ResultAsync<OrderStatus | null, UnexpectedError> {
  return client.query(OrderStatusQuery, { request });
}

/**
 * An order in a final state.
 */
export type OrderOutcome = OrderFulfilled | OrderCancelled | OrderExpired;

/**
 * Polls an order's status until it is fulfilled, cancelled or expired.
 *
 * ```ts
 * const result = await submitOrder(client, request).andThen(
 *   waitForOrderOutcome(client),
 * );
 * ```
 *
 * @param client - Aave client.
 * @returns A function from the order receipt to the order's final status.
 */
export function waitForOrderOutcome(
  client: AaveClient,
): (
  receipt: OrderReceipt,
) => ResultAsync<OrderOutcome, TimeoutError | UnexpectedError> {
  const { indexingTimeout, swapStatusInterval } = client.context.environment;

  return (receipt: OrderReceipt) => {
    const poll = async (): Promise<OrderOutcome> => {
      const startedAt = Date.now();

      while (Date.now() - startedAt < indexingTimeout) {
        const status = await orderStatus(client, {
          id: receipt.orderId,
        }).match(
          (ok) => ok,
          (err) => {
            throw err;
          },
        );

        switch (status?.__typename) {
          case 'OrderFulfilled':
          case 'OrderCancelled':
          case 'OrderExpired':
            return status;

          default:
            await delay(swapStatusInterval ?? DEFAULT_SWAP_STATUS_INTERVAL);
        }
      }

      throw TimeoutError.from(
        `Timeout waiting for order ${receipt.orderId} to reach a final state.`,
      );
    };

    return ResultAsync.fromPromise(poll(), (error) =>
      error instanceof TimeoutError || error instanceof UnexpectedError
        ? error
        : UnexpectedError.from(error),
    );
  };
}

/**
 * Fetches a user's token swap orders, newest first.
 *
 * ```ts
 * const result = await pendingOrders(client, {
 *   user: evmAddress('0x742d35cc…'),
 *   chainIds: [chainId(1)],
 *   filterBy: [OrderStatusFilter.Open],
 * });
 * ```
 *
 * @param client - Aave client.
 * @param request - The user, and optionally the chains and statuses to keep.
 * @returns A page of orders.
 */
export function pendingOrders(
  client: AaveClient,
  request: PendingOrdersRequest,
): ResultAsync<PaginatedOrdersResult, UnexpectedError> {
  return client.query(PendingOrdersQuery, { request });
}

/**
 * Prepares the typed data to sign to cancel an order off chain.
 *
 * ```ts
 * const result = await prepareCancelOrder(client, { id: orderId });
 * ```
 *
 * @param client - Aave client.
 * @param request - The order id.
 * @returns The typed data to sign and pass to `cancelOrder`.
 */
export function prepareCancelOrder(
  client: AaveClient,
  request: PrepareCancelOrderRequest,
): ResultAsync<PrepareCancelOrderResult, UnexpectedError> {
  return client.query(PrepareCancelOrderQuery, { request });
}

/**
 * Cancels an order with a signature, or gets the transaction that cancels it on chain.
 *
 * ```ts
 * const result = await cancelOrder(client, {
 *   bySignature: { id: orderId, signature },
 * });
 * ```
 *
 * @param client - Aave client.
 * @param request - A `bySignature` cancel, or `byTransaction` with the order id.
 * @returns The cancelled order, or the transaction to send.
 */
export function cancelOrder(
  client: AaveClient,
  request: CancelOrderRequest,
): ResultAsync<CancelOrderExecutionPlan, UnexpectedError> {
  return client.mutation(CancelOrderMutation, { request }).andThen((plan) => {
    switch (plan.__typename) {
      case 'OrderCancelledResult':
      case 'TransactionRequest':
        return okAsync(plan);

      default:
        return unsupported(plan);
    }
  });
}
