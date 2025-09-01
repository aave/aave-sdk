import { invariant } from '@aave/types';
import type { AnyVariables, OperationResult } from '@urql/core';
import type { StandardData } from './types';

/**
 * @internal
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @internal
 */
export function takeValue<T>({
  data,
  error,
}: OperationResult<StandardData<T> | undefined, AnyVariables>): T {
  invariant(data, `Expected a value, got: ${error?.message}`);
  return data.value;
}
