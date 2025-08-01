import {
  type Chain,
  ChainsFilter,
  ChainsQuery,
  HealthQuery,
  type UsdExchangeRate,
  UsdExchangeRatesQuery,
  type UsdExchangeRatesRequest,
} from '@aave/graphql';
import type {
  ReadResult,
  Suspendable,
  SuspendableResult,
  SuspenseResult,
} from './helpers';
import { useSuspendableQuery } from './helpers';

export type UseAaveChainsArgs = {
  filter?: ChainsFilter;
};

/**
 * Fetch all supported Aave chains.
 *
 * This signature supports React Suspense:
 *
 * ```tsx
 * const { data } = useAaveChains({
 *   filter: ChainsFilter.MAINNET_ONLY,
 *   suspense: true,
 * });
 * ```
 */
export function useAaveChains(
  args: UseAaveChainsArgs & Suspendable,
): SuspenseResult<Chain[]>;

/**
 * Fetch all supported Aave chains.
 *
 * ```tsx
 * const { data, loading } = useAaveChains({
 *   filter: ChainsFilter.MAINNET_ONLY,
 * });
 * ```
 */
export function useAaveChains(args: UseAaveChainsArgs): ReadResult<Chain[]>;

export function useAaveChains({
  suspense = false,
  filter = ChainsFilter.ALL,
}: UseAaveChainsArgs & {
  suspense?: boolean;
}): SuspendableResult<Chain[]> {
  return useSuspendableQuery({
    document: ChainsQuery,
    variables: {
      filter,
    },
    suspense,
  });
}

/**
 * Health check query.
 *
 * This signature supports React Suspense:
 *
 * ```tsx
 * const { data } = useAaveHealth({
 *   suspense: true,
 * });
 * ```
 */
export function useAaveHealth(args: Suspendable): SuspenseResult<boolean>;

/**
 * Health check query.
 *
 * ```tsx
 * const { data, loading } = useAaveHealth();
 * ```
 */
export function useAaveHealth(): ReadResult<boolean>;

export function useAaveHealth({
  suspense = false,
}: {
  suspense?: boolean;
} = {}): SuspendableResult<boolean> {
  return useSuspendableQuery({
    document: HealthQuery,
    variables: {},
    suspense,
  });
}

export type UseUsdExchangeRatesArgs = UsdExchangeRatesRequest;

/**
 * Fetch USD exchange rates for different tokens on a given market.
 *
 * This signature supports React Suspense:
 *
 * ```tsx
 * const { data } = useUsdExchangeRates({
 *   market: evmAddress('0x1234…'),
 *   underlyingTokens: [evmAddress('0x5678…'), evmAddress('0x90ab…')],
 *   chainId: chainId(1),
 *   suspense: true,
 * });
 * ```
 */
export function useUsdExchangeRates(
  args: UseUsdExchangeRatesArgs & Suspendable,
): SuspenseResult<UsdExchangeRate[]>;

/**
 * Fetch USD exchange rates for different tokens on a given market.
 *
 * ```tsx
 * const { data, loading } = useUsdExchangeRates({
 *   market: evmAddress('0x1234…'),
 *   underlyingTokens: [evmAddress('0x5678…'), evmAddress('0x90ab…')],
 *   chainId: chainId(1),
 * });
 * ```
 */
export function useUsdExchangeRates(
  args: UseUsdExchangeRatesArgs,
): ReadResult<UsdExchangeRate[]>;

export function useUsdExchangeRates({
  suspense = false,
  ...request
}: UseUsdExchangeRatesArgs & {
  suspense?: boolean;
}): SuspendableResult<UsdExchangeRate[]> {
  return useSuspendableQuery({
    document: UsdExchangeRatesQuery,
    variables: {
      request,
    },
    suspense,
  });
}
