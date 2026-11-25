import type {
  AaveClient,
  SigningError,
  TimeoutError,
  TransactionError,
  TransactionExecutionResult,
  UnexpectedError as UnexpectedErrorType,
  ValidationError,
} from '@aave/client';
import { UnexpectedError } from '@aave/client';
import { prepareOrder, submitOrder } from '@aave/client/actions';
import type {
  Erc20Approval,
  InsufficientBalanceError,
  OrderReceipt,
  OrderTransactionRequest,
  OrderTypedData,
  PositionSwapApproval,
  PrepareOrderRequest,
  SubmitOrderRequest,
} from '@aave/graphql';
import { okAsync, type ResultAsync, type Signature } from '@aave/types';

/**
 * What an order handler resolves to: the signature over typed data or a permit,
 * or the result of a transaction once it is mined.
 */
export type OrderHandlerResult = Signature | TransactionExecutionResult;

export type OrderHandlerError =
  | SigningError
  | TimeoutError
  | TransactionError
  | UnexpectedErrorType;

/**
 * Signs or sends one step of an order.
 *
 * Resolve typed data (`OrderTypedData`, an adapter approval, a permit) with its
 * signature, and a transaction with its result once mined.
 */
export type OrderHandler<TPlan> = (
  plan: TPlan,
) => ResultAsync<OrderHandlerResult, OrderHandlerError>;

export type OrderError =
  | OrderHandlerError
  | ValidationError<InsufficientBalanceError>;

function isSignature(result: OrderHandlerResult): result is Signature {
  return typeof result === 'string';
}

function signatureFrom(
  result: OrderHandlerResult,
): ResultAsync<Signature, UnexpectedErrorType> {
  return isSignature(result)
    ? okAsync(result)
    : UnexpectedError.from(
        'Expected the handler to return a signature',
      ).asResultAsync();
}

function transactionFrom(
  result: OrderHandlerResult,
): ResultAsync<TransactionExecutionResult, UnexpectedErrorType> {
  return isSignature(result)
    ? UnexpectedError.from(
        'Expected the handler to send the transaction',
      ).asResultAsync()
    : okAsync(result);
}

type Approvals = Pick<
  PrepareOrderRequest,
  'permitSig' | 'adapterContractSignature'
>;

/**
 * Runs a quote's approvals in order, keeping the signatures `prepareOrder` takes.
 */
export function approve<TApproval extends Erc20Approval | PositionSwapApproval>(
  approvals: ReadonlyArray<TApproval>,
  handler: OrderHandler<TApproval>,
): ResultAsync<Approvals, OrderHandlerError> {
  return approvals.reduce<ResultAsync<Approvals, OrderHandlerError>>(
    (previous, approval) =>
      previous.andThen((collected) =>
        handler(approval).andThen((result) => {
          const step: Erc20Approval | PositionSwapApproval = approval;
          switch (step.__typename) {
            case 'Erc20Approval':
              if (isSignature(result) && step.byPermit) {
                const permitSig: Approvals['permitSig'] = {
                  value: result,
                  deadline: step.byPermit.message.deadline,
                };
                return okAsync({ ...collected, permitSig });
              }
              return transactionFrom(result).map(() => collected);

            case 'PositionSwapAdapterContractApproval':
              return signatureFrom(result).map((adapterContractSignature) => ({
                ...collected,
                adapterContractSignature,
              }));

            case 'PositionSwapAdapterTransactionApproval':
              return transactionFrom(result).map(() => collected);
          }
        }),
      ),
    okAsync({}),
  );
}

/**
 * Submits an order, sending its transaction when the backend returns one.
 */
export function submit(
  client: AaveClient,
  request: SubmitOrderRequest,
  handler: OrderHandler<OrderTransactionRequest>,
): ResultAsync<OrderReceipt, OrderError> {
  return submitOrder(client, request).andThen((plan) => {
    switch (plan.__typename) {
      case 'OrderTransactionRequest':
        return handler(plan)
          .andThen(transactionFrom)
          .map(() => plan.orderReceipt);

      case 'OrderReceipt':
        return okAsync(plan);
    }
  });
}

/**
 * Prepares an order, has the handler sign it, and submits the signature with
 * the rotated quote id.
 */
export function signAndSubmit(
  client: AaveClient,
  request: PrepareOrderRequest,
  handler: OrderHandler<OrderTypedData | OrderTransactionRequest>,
): ResultAsync<OrderReceipt, OrderError> {
  return prepareOrder(client, request).andThen((order) =>
    handler(order.data)
      .andThen(signatureFrom)
      .andThen((signature) =>
        submit(
          client,
          { bySignature: { quoteId: order.newQuoteId, signature } },
          handler,
        ),
      ),
  );
}
