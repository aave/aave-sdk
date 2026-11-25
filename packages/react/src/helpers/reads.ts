import { type StandardData, UnexpectedError } from '@aave/client';
import { type AnyVariables, invariant } from '@aave/types';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  createRequest,
  type OperationContext,
  type TypedDocumentNode,
  useQuery,
} from 'urql';
import {
  ReadResult,
  type SuspendableResult,
  type SuspenseResult,
} from './results';

/**
 * @internal
 */
export type Suspendable = { suspense: true };

/**
 * @internal
 */
export type UseSuspendableQueryArgs<
  Value,
  Variables extends AnyVariables,
  Suspense extends boolean = boolean,
> = {
  document: TypedDocumentNode<StandardData<Value>, Variables>;
  variables: Variables;
  suspense: Suspense;
  /**
   * Refetch every this many ms while the tab is visible. 0 disables polling.
   */
  pollInterval?: number;
};

/**
 * @internal
 */
export function useSuspendableQuery<Value, Variables extends AnyVariables>({
  document,
  variables,
  suspense,
}: UseSuspendableQueryArgs<Value, Variables, false>): ReadResult<Value>;
/**
 * @internal
 */
export function useSuspendableQuery<Value, Variables extends AnyVariables>({
  document,
  variables,
  suspense,
}: UseSuspendableQueryArgs<Value, Variables, true>): SuspenseResult<Value>;
/**
 * @internal
 */
export function useSuspendableQuery<Value, Variables extends AnyVariables>({
  document,
  variables,
  suspense,
}: UseSuspendableQueryArgs<Value, Variables>): SuspendableResult<Value>;
export function useSuspendableQuery<Value, Variables extends AnyVariables>({
  document,
  variables,
  suspense,
  pollInterval = 0,
}: UseSuspendableQueryArgs<Value, Variables>): SuspendableResult<Value> {
  const [{ data, fetching, error, operation }, executeQuery] = useQuery({
    query: document,
    variables,
    context: useMemo(() => ({ suspense }), [suspense]),
  });
  const requestKey = useMemo(
    () => createRequest(document, variables).key,
    [document, variables],
  );

  usePolling(pollInterval, fetching, executeQuery);

  if (fetching) {
    // A poll refetches the same request: keep showing what it already has.
    if (data && operation?.key === requestKey) {
      return ReadResult.Success(data.value);
    }
    return ReadResult.Initial();
  }

  if (error) {
    const unexpected = UnexpectedError.from(error);
    if (suspense) {
      throw unexpected;
    }

    return ReadResult.Failure(unexpected);
  }

  invariant(data, 'No data returned');

  return ReadResult.Success(data.value);
}

type VisibilityDocument = {
  hidden: boolean;
  addEventListener(type: 'visibilitychange', listener: () => void): void;
  removeEventListener(type: 'visibilitychange', listener: () => void): void;
};

const tabDocument = (globalThis as { document?: VisibilityDocument }).document;

function isTabHidden(): boolean {
  return tabDocument?.hidden ?? false;
}

function usePolling(
  interval: number,
  fetching: boolean,
  execute: (opts?: Partial<OperationContext>) => void,
): void {
  const lastPolledAt = useRef(Date.now());
  const [polls, setPolls] = useState(0);
  const [hidden, setHidden] = useState(isTabHidden);

  useEffect(() => {
    if (!tabDocument) return undefined;
    const doc = tabDocument;
    const onChange = () => setHidden(isTabHidden());
    doc.addEventListener('visibilitychange', onChange);
    return () => doc.removeEventListener('visibilitychange', onChange);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `polls` re-arms the timer after each poll
  useEffect(() => {
    if (interval <= 0 || fetching || hidden) return undefined;

    // Back from a hidden tab, an overdue poll runs at once.
    const wait = Math.max(0, interval - (Date.now() - lastPolledAt.current));
    const timerId = setTimeout(() => {
      lastPolledAt.current = Date.now();
      execute({ requestPolicy: 'network-only' });
      setPolls((n) => n + 1);
    }, wait);
    return () => clearTimeout(timerId);
  }, [interval, fetching, hidden, execute, polls]);
}
