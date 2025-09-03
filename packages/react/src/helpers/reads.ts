import { type StandardData, UnexpectedError } from '@aave/client';
import { type AnyVariables, invariant } from '@aave/types';
import { useMemo } from 'react';
import { type TypedDocumentNode, useQuery } from 'urql';
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
}: UseSuspendableQueryArgs<Value, Variables>): SuspendableResult<Value> {
  const [{ data, fetching, error }] = useQuery({
    query: document,
    variables,
    context: useMemo(() => ({ suspense }), [suspense]),
  });

  if (fetching) {
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
