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
 * const [supply, supplying] = useSupply();
 * const [sendTransaction, sending] = useSendTransaction(wallet);
 *
 * const loading = supplying.loading && sending.loading;
 * const error = supplying.error || sending.error;
 * const data = supplying.data || sending.data;
 *
 * // …
 *
 * const result = await supply({ ... })
 *   .andThen((plan) => {
 *     switch (plan.__typename) {
 *       case 'TransactionRequest':
 *         return sendTransaction(plan);
 *
 *       case 'ApprovalRequired':
 *         return sendTransaction(plan.approval)
 *           .andThen(() => sendTransaction(plan.originalTransaction));
 *     }
 *   });
 *
 * if (result.isErr()) {
 *   switch (error.name) {
 *     case 'SigningError':
 *       console.error(`Failed to sign the transaction: ${error.message}`);
 *       break;
 *
 *     case 'ValidationError':
 *       console.error(`Insufficient balance: ${error.cause.required.value} required.`);
 *       break;
 *   }
 *   return;
 * }
 *
 * console.log('Transaction sent with hash:', result.value);
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
 * const [borrow, borrowing] = useBorrow();
 * const [sendTransaction, sending] = useSendTransaction(wallet);
 *
 * const loading = borrowing.loading && sending.loading;
 * const error = borrowing.error || sending.error;
 * const data = borrowing.data || sending.data;
 *
 * // …
 *
 * const result = await borrow({ ... })
 *   .andThen((plan) => {
 *     switch (plan.__typename) {
 *       case 'TransactionRequest':
 *         return sendTransaction(plan);
 *
 *       case 'ApprovalRequired':
 *         return sendTransaction(plan.approval)
 *           .andThen(() => sendTransaction(plan.originalTransaction));
 *     }
 *   });
 *
 * if (result.isErr()) {
 *   switch (error.name) {
 *     case 'SigningError':
 *       console.error(`Failed to sign the transaction: ${error.message}`);
 *       break;
 *
 *     case 'ValidationError':
 *       console.error(`Insufficient balance: ${error.cause.required.value} required.`);
 *       break;
 *   }
 *   return;
 * }
 *
 * console.log('Transaction sent with hash:', result.value);
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
 * const [repay, repaying] = useRepay();
 * const [sendTransaction, sending] = useSendTransaction(wallet);
 *
 * const loading = repaying.loading && sending.loading;
 * const error = repaying.error || sending.error;
 * const data = repaying.data || sending.data;
 *
 * // …
 *
 * const result = await repay({ ... })
 *   .andThen((plan) => {
 *     switch (plan.__typename) {
 *       case 'TransactionRequest':
 *         return sendTransaction(plan);
 *
 *       case 'ApprovalRequired':
 *         return sendTransaction(plan.approval)
 *           .andThen(() => sendTransaction(plan.originalTransaction));
 *     }
 *   });
 *
 * if (result.isErr()) {
 *   switch (error.name) {
 *     case 'SigningError':
 *       console.error(`Failed to sign the transaction: ${error.message}`);
 *       break;
 *
 *     case 'ValidationError':
 *       console.error(`Insufficient balance: ${error.cause.required.value} required.`);
 *       break;
 *   }
 *   return;
 * }
 *
 * console.log('Transaction sent with hash:', result.value);
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
 * const [withdraw, withdrawing] = useWithdraw();
 * const [sendTransaction, sending] = useSendTransaction(wallet);
 *
 * const loading = withdrawing.loading && sending.loading;
 * const error = withdrawing.error || sending.error;
 * const data = withdrawing.data || sending.data;
 *
 * // …
 *
 * const result = await withdraw({ ... })
 *   .andThen((plan) => {
 *     switch (plan.__typename) {
 *       case 'TransactionRequest':
 *         return sendTransaction(plan);
 *
 *       case 'ApprovalRequired':
 *         return sendTransaction(plan.approval)
 *           .andThen(() => sendTransaction(plan.originalTransaction));
 *     }
 *   });
 *
 * if (result.isErr()) {
 *   switch (error.name) {
 *     case 'SigningError':
 *       console.error(`Failed to sign the transaction: ${error.message}`);
 *       break;
 *
 *     case 'ValidationError':
 *       console.error(`Insufficient balance: ${error.cause.required.value} required.`);
 *       break;
 *   }
 *   return;
 * }
 *
 * console.log('Transaction sent with hash:', result.value);
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
 * const [toggleEMode, toggling] = useEModeToggle();
 * const [sendTransaction, sending] = useSendTransaction(wallet);
 *
 * const loading = toggling.loading && sending.loading;
 * const error = toggling.error || sending.error;
 * const data = toggling.data || sending.data;
 *
 * // …
 *
 * const result = await toggleEMode({ ... })
 *   .andThen(sendTransaction);
 *
 * if (result.isErr()) {
 *   console.error(`Failed to sign the transaction: ${error.message}`);
 *   return;
 * }
 *
 * console.log('Transaction sent with hash:', result.value);
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
