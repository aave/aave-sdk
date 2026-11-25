import type { SwapQuoteError } from '@aave/client/actions';
import { tokenSwapQuote } from '@aave/client/actions';
import type {
  Erc20Approval,
  OrderReceipt,
  OrderTransactionRequest,
  OrderTypedData,
  TokenSwapQuoteRequest,
} from '@aave/graphql';
import { useAaveClient } from '../context';
import { type UseAsyncTask, useAsyncTask } from '../helpers';
import {
  approve,
  type OrderError,
  type OrderHandler,
  signAndSubmit,
  submit,
} from './helpers';

export type TokenSwapOrderPlan =
  | Erc20Approval
  | OrderTypedData
  | OrderTransactionRequest;

/**
 * Quotes a token swap from the wallet and executes it as an order.
 *
 * Runs any approval first, then either signs the order (by intent) or sends
 * the transaction that places it, and resolves to the order receipt. Pass
 * `{ fromQuote: { market, quoteId } }` to execute a quote already shown.
 *
 * ```tsx
 * const [swap, { loading, error }] = useTokenSwapOrder((plan) => {
 *   switch (plan.__typename) {
 *     case 'Erc20Approval':
 *       return plan.byPermit
 *         ? signTypedData(plan.byPermit)
 *         : sendTransaction(plan.byTransaction);
 *     case 'OrderTypedData':
 *       return signTypedData(plan);
 *     case 'OrderTransactionRequest':
 *       return sendTransaction(plan.transaction);
 *   }
 * });
 *
 * const result = await swap({
 *   market: { market, chainId, sell, buy, amount, kind: TokenSwapKind.Sell, user },
 * });
 * ```
 */
export function useTokenSwapOrder(
  handler: OrderHandler<TokenSwapOrderPlan>,
): UseAsyncTask<
  TokenSwapQuoteRequest,
  OrderReceipt,
  OrderError | SwapQuoteError
> {
  const client = useAaveClient();

  return useAsyncTask((request: TokenSwapQuoteRequest) =>
    tokenSwapQuote(client, request).andThen((result) => {
      const approvals = 'approvals' in result ? result.approvals : [];
      const quoteId = result.quote.orderQuoteId;

      return approve(approvals, handler).andThen(({ permitSig }) => {
        switch (result.__typename) {
          case 'SwapByIntent':
          case 'SwapByIntentWithApprovalRequired':
            return signAndSubmit(client, { quoteId, permitSig }, handler);

          case 'SwapByTransaction':
          case 'SwapByTransactionWithApprovalRequired':
            return submit(
              client,
              { byTransaction: { quoteId, permitSig: permitSig?.value } },
              handler,
            );
        }
      });
    }),
  );
}
