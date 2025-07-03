import type { UnexpectedError } from '@aave/client';
import type { ExecutionPlan, SupplyRequest } from '@aave/graphql';
import { supply } from '../../client/src/actions';
import { useAaveClient } from './context';
import { type UseAsyncTask, useAsyncTask } from './helpers';

/**
 * A hook that provides a way to supply assets to an Aave market.
 *
 * ```ts
 * const [supply, { loading, error, data }] = useSupply();
 * ```
 */
export function useSupply(): UseAsyncTask<
  SupplyRequest,
  ExecutionPlan,
  UnexpectedError
> {
  const client = useAaveClient();

  return useAsyncTask((request: SupplyRequest) => supply(client, request));
}
