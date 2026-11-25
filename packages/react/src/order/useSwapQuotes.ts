import {
  BorrowSwapQuoteQuery,
  type BorrowSwapQuoteRequest,
  type PositionSwapQuoteResult,
  RepayWithSupplyQuoteQuery,
  type RepayWithSupplyQuoteRequest,
  SupplySwapQuoteQuery,
  type SupplySwapQuoteRequest,
  type SwapCurrency,
  SwappableTokensQuery,
  type SwappableTokensRequest,
  TokenSwapQuoteQuery,
  type TokenSwapQuoteRequest,
  type TokenSwapQuoteResult,
  WithdrawSwapQuoteQuery,
  type WithdrawSwapQuoteRequest,
} from '@aave/graphql';
import type {
  ReadResult,
  Suspendable,
  SuspendableResult,
  SuspenseResult,
} from '../helpers';
import { useSuspendableQuery } from '../helpers';

type SuspenseArg = { suspense?: boolean };

/**
 * Fetch a quote to swap one token for another from the wallet.
 *
 * The result is the quote, or `InsufficientLiquidityError` / `AmountTooSmallError`.
 * A market without swaps fails with an `UnexpectedError`.
 *
 * ```tsx
 * const { data, error, loading } = useTokenSwapQuote({
 *   market: { market, chainId, sell, buy, amount, kind: TokenSwapKind.Sell, user },
 * });
 * ```
 */
export function useTokenSwapQuote(
  args: TokenSwapQuoteRequest & Suspendable,
): SuspenseResult<TokenSwapQuoteResult>;
export function useTokenSwapQuote(
  args: TokenSwapQuoteRequest,
): ReadResult<TokenSwapQuoteResult>;
export function useTokenSwapQuote({
  suspense = false,
  ...request
}: TokenSwapQuoteRequest &
  SuspenseArg): SuspendableResult<TokenSwapQuoteResult> {
  return useSuspendableQuery({
    document: TokenSwapQuoteQuery,
    variables: { request: request as TokenSwapQuoteRequest },
    suspense,
  });
}

/**
 * Fetch a quote to swap part of a supply into another reserve of the same market.
 *
 * ```tsx
 * const { data, error, loading } = useSupplySwapQuote({
 *   market: { sellPosition, buyReserve, amount, user },
 * });
 * ```
 */
export function useSupplySwapQuote(
  args: SupplySwapQuoteRequest & Suspendable,
): SuspenseResult<PositionSwapQuoteResult>;
export function useSupplySwapQuote(
  args: SupplySwapQuoteRequest,
): ReadResult<PositionSwapQuoteResult>;
export function useSupplySwapQuote({
  suspense = false,
  ...request
}: SupplySwapQuoteRequest &
  SuspenseArg): SuspendableResult<PositionSwapQuoteResult> {
  return useSuspendableQuery({
    document: SupplySwapQuoteQuery,
    variables: { request: request as SupplySwapQuoteRequest },
    suspense,
  });
}

/**
 * Fetch a quote to withdraw part of a supply and sell it for a token paid to the wallet.
 *
 * ```tsx
 * const { data, error, loading } = useWithdrawSwapQuote({
 *   market: { sellPosition, buyToken, amount, user },
 * });
 * ```
 */
export function useWithdrawSwapQuote(
  args: WithdrawSwapQuoteRequest & Suspendable,
): SuspenseResult<PositionSwapQuoteResult>;
export function useWithdrawSwapQuote(
  args: WithdrawSwapQuoteRequest,
): ReadResult<PositionSwapQuoteResult>;
export function useWithdrawSwapQuote({
  suspense = false,
  ...request
}: WithdrawSwapQuoteRequest &
  SuspenseArg): SuspendableResult<PositionSwapQuoteResult> {
  return useSuspendableQuery({
    document: WithdrawSwapQuoteQuery,
    variables: { request: request as WithdrawSwapQuoteRequest },
    suspense,
  });
}

/**
 * Fetch a quote to move a borrow to another reserve of the same market.
 *
 * ```tsx
 * const { data, error, loading } = useBorrowSwapQuote({
 *   market: { debtPosition, buyReserve, amount, user },
 * });
 * ```
 */
export function useBorrowSwapQuote(
  args: BorrowSwapQuoteRequest & Suspendable,
): SuspenseResult<PositionSwapQuoteResult>;
export function useBorrowSwapQuote(
  args: BorrowSwapQuoteRequest,
): ReadResult<PositionSwapQuoteResult>;
export function useBorrowSwapQuote({
  suspense = false,
  ...request
}: BorrowSwapQuoteRequest &
  SuspenseArg): SuspendableResult<PositionSwapQuoteResult> {
  return useSuspendableQuery({
    document: BorrowSwapQuoteQuery,
    variables: { request: request as BorrowSwapQuoteRequest },
    suspense,
  });
}

/**
 * Fetch a quote to repay a borrow with a supply of the same market.
 *
 * ```tsx
 * const { data, error, loading } = useRepayWithSupplyQuote({
 *   market: { debtPosition, repayWithReserve, amount, user },
 * });
 * ```
 */
export function useRepayWithSupplyQuote(
  args: RepayWithSupplyQuoteRequest & Suspendable,
): SuspenseResult<PositionSwapQuoteResult>;
export function useRepayWithSupplyQuote(
  args: RepayWithSupplyQuoteRequest,
): ReadResult<PositionSwapQuoteResult>;
export function useRepayWithSupplyQuote({
  suspense = false,
  ...request
}: RepayWithSupplyQuoteRequest &
  SuspenseArg): SuspendableResult<PositionSwapQuoteResult> {
  return useSuspendableQuery({
    document: RepayWithSupplyQuoteQuery,
    variables: { request: request as RepayWithSupplyQuoteRequest },
    suspense,
  });
}

/**
 * Fetch the tokens a wallet swap may list, native and ERC-20.
 *
 * ```tsx
 * const { data, error, loading } = useSwappableTokens({
 *   query: { chainIds: [chainId(1)] },
 * });
 * ```
 */
export function useSwappableTokens(
  args: SwappableTokensRequest & Suspendable,
): SuspenseResult<SwapCurrency[]>;
export function useSwappableTokens(
  args: SwappableTokensRequest,
): ReadResult<SwapCurrency[]>;
export function useSwappableTokens({
  suspense = false,
  ...request
}: SwappableTokensRequest & SuspenseArg): SuspendableResult<SwapCurrency[]> {
  return useSuspendableQuery({
    document: SwappableTokensQuery,
    variables: { request },
    suspense,
  });
}
