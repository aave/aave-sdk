import type { MarketRequest, MarketsRequest } from '@aave/client/actions';
import { defaultMarketReservesRequestOrderBy } from '@aave/client/actions';
import { type Market, MarketQuery, MarketsQuery } from '@aave/graphql';
import type {
  ReadResult,
  Suspendable,
  SuspendableResult,
  SuspenseResult,
} from './helpers';
import { useSuspendableQuery } from './helpers';

export type UseAaveMarketArgs = MarketRequest;

/**
 * Fetch a single Aave Market.
 *
 * This signature supports React Suspense:
 *
 * ```tsx
 * const { data } = useAaveMarket({
 *   address: evmAddress('0x8787…'),
 *   chainId: chainId(1),
 *   suspense: true,
 * });
 * ```
 */
export function useAaveMarket(
  args: UseAaveMarketArgs & Suspendable,
): SuspenseResult<Market | null>;

/**
 * Fetch a single Aave Market.
 *
 * ```tsx
 * const { data, loading } = useAaveMarket({
 *   address: evmAddress('0x8787…'),
 *   chainId: chainId(1),
 * });
 * ```
 */
export function useAaveMarket(
  args: UseAaveMarketArgs,
): ReadResult<Market | null>;

export function useAaveMarket({
  suspense = false,
  address,
  chainId,
  user,
  borrowsOrderBy = defaultMarketReservesRequestOrderBy,
  suppliesOrderBy = defaultMarketReservesRequestOrderBy,
}: UseAaveMarketArgs & {
  suspense?: boolean;
}): SuspendableResult<Market | null> {
  return useSuspendableQuery({
    document: MarketQuery,
    variables: {
      request: { address, chainId, user },
      borrowsOrderBy,
      suppliesOrderBy,
    },
    suspense,
  });
}

export type UseAaveMarketsArgs = MarketsRequest;

/**
 * Fetch all Aave Markets for the specified chains.
 *
 * This signature supports React Suspense:
 *
 * ```tsx
 * const { data } = useAaveMarkets({
 *   chainIds: [chainId(1), chainId(137)],
 *   user: evmAddress('0x742d35cc...'),
 *   suspense: true
 * });
 * ```
 */
export function useAaveMarkets(
  args: UseAaveMarketsArgs & Suspendable,
): SuspenseResult<Market[]>;

/**
 * Fetch all Aave Markets for the specified chains.
 *
 * ```tsx
 * const { data, loading } = useAaveMarkets({
 *   chainIds: [chainId(1), chainId(137)],
 *   user: evmAddress('0x742d35cc...'),
 * });
 * ```
 */
export function useAaveMarkets(args: UseAaveMarketsArgs): ReadResult<Market[]>;

export function useAaveMarkets({
  suspense = false,
  chainIds,
  user,
  borrowsOrderBy = defaultMarketReservesRequestOrderBy,
  suppliesOrderBy = defaultMarketReservesRequestOrderBy,
}: UseAaveMarketsArgs & {
  suspense?: boolean;
}): SuspendableResult<Market[]> {
  return useSuspendableQuery({
    document: MarketsQuery,
    variables: {
      request: { chainIds, user },
      borrowsOrderBy,
      suppliesOrderBy,
    },
    suspense,
  });
}
