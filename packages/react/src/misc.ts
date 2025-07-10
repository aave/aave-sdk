import {
  type Chain,
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

/**
 * Fetch all supported Aave chains.
 *
 * This signature supports React Suspense:
 *
 * ```tsx
 * const { data } = useAaveChains({
 *   suspense: true,
 * });
 * ```
 */
export function useAaveChains(args: Suspendable): SuspenseResult<Chain[]>;

/**
 * Fetch all supported Aave chains.
 *
 * ```tsx
 * const { data, loading } = useAaveChains();
 * ```
 */
export function useAaveChains(): ReadResult<Chain[]>;

export function useAaveChains({
  suspense = false,
}: {
  suspense?: boolean;
} = {}): SuspendableResult<Chain[]> {
  return useSuspendableQuery({
    document: ChainsQuery,
    variables: {},
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
  market,
  underlyingTokens,
  chainId,
}: UseUsdExchangeRatesArgs & {
  suspense?: boolean;
}): SuspendableResult<UsdExchangeRate[]> {
  return useSuspendableQuery({
    document: UsdExchangeRatesQuery,
    variables: {
      request: { market, underlyingTokens, chainId },
    },
    suspense,
  });
}
