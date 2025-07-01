import { type Chain, ChainsQuery } from '@aave/graphql';
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
