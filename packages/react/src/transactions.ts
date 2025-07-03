import type { UnexpectedError } from '@aave/client';
import {
  borrow,
  eModeToggle,
  repay,
  supply,
  withdraw,
} from '@aave/client/actions';
import type {
  BorrowRequest,
  EModeToggleRequest,
  ExecutionPlan,
  RepayRequest,
  SupplyRequest,
  TransactionRequest,
  WithdrawRequest,
} from '@aave/graphql';
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

/**
 * A hook that provides a way to borrow assets from an Aave market.
 *
 * ```ts
 * const [borrow, { loading, error, data }] = useBorrow();
 * ```
 */
export function useBorrow(): UseAsyncTask<
  BorrowRequest,
  ExecutionPlan,
  UnexpectedError
> {
  const client = useAaveClient();

  return useAsyncTask((request: BorrowRequest) => borrow(client, request));
}

/**
 * A hook that provides a way to repay borrowed assets to an Aave market.
 *
 * ```ts
 * const [repay, { loading, error, data }] = useRepay();
 * ```
 */
export function useRepay(): UseAsyncTask<
  RepayRequest,
  ExecutionPlan,
  UnexpectedError
> {
  const client = useAaveClient();

  return useAsyncTask((request: RepayRequest) => repay(client, request));
}

/**
 * A hook that provides a way to withdraw supplied assets from an Aave market.
 *
 * ```ts
 * const [withdraw, { loading, error, data }] = useWithdraw();
 * ```
 */
export function useWithdraw(): UseAsyncTask<
  WithdrawRequest,
  ExecutionPlan,
  UnexpectedError
> {
  const client = useAaveClient();

  return useAsyncTask((request: WithdrawRequest) => withdraw(client, request));
}

/**
 * A hook that provides a way to toggle eMode for a user in an Aave market.
 *
 * ```ts
 * const [toggleEMode, { loading, error, data }] = useEModeToggle();
 * ```
 */
export function useEModeToggle(): UseAsyncTask<
  EModeToggleRequest,
  TransactionRequest,
  UnexpectedError
> {
  const client = useAaveClient();

  return useAsyncTask((request: EModeToggleRequest) =>
    eModeToggle(client, request),
  );
}
