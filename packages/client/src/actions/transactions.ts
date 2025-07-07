import {
  BorrowQuery,
  type BorrowRequest,
  EModeToggleQuery,
  type EModeToggleRequest,
  type ExecutionPlan,
  RepayQuery,
  type RepayRequest,
  SupplyQuery,
  type SupplyRequest,
  type TransactionRequest,
  WithdrawQuery,
  type WithdrawRequest,
} from '@aave/graphql';
import type { ResultAsync } from '@aave/types';
import type { AaveClient } from '../client';
import type { UnexpectedError } from '../errors';

/**
 * Creates a transaction to borrow from a market.
 *
 * ```ts
 * const result = await borrow(client, {
 *   market: evmAddress('0x1234…'),
 *   amount: {
 *     erc20: {
 *       currency: evmAddress('0x5678…'),
 *       value: '1000',
 *     },
 *   },
 *   borrower: evmAddress('0x9abc…'),
 *   chainId: chainId(1),
 * }).andThen(sendWith(wallet));
 *
 * if (result.isErr()) {
 *   // Handle error, e.g. insufficient balance, signing error, etc.
 *   return;
 * }
 *
 * // result.value: TxHash
 * ```
 *
 * @param client - Aave client.
 * @param request - The borrow request parameters.
 * @returns The transaction data, approval requirements, or insufficient balance error.
 */
export function borrow(
  client: AaveClient,
  request: BorrowRequest,
): ResultAsync<ExecutionPlan, UnexpectedError> {
  return client.query(BorrowQuery, { request });
}

/**
 * Creates a transaction to supply to a market.
 *
 * ```ts
 * const result = await supply(client, {
 *   market: evmAddress('0x1234…'),
 *   amount: {
 *     erc20: {
 *       currency: evmAddress('0x5678…'),
 *       value: '1000',
 *     },
 *   },
 *   supplier: evmAddress('0x9abc…'),
 *   chainId: chainId(1),
 * });
 * ```
 *
 * @param client - Aave client.
 * @param request - The supply request parameters.
 * @returns The transaction data, approval requirements, or insufficient balance error.
 */
export function supply(
  client: AaveClient,
  request: SupplyRequest,
): ResultAsync<ExecutionPlan, UnexpectedError> {
  return client.query(SupplyQuery, { request });
}

/**
 * Creates a transaction to repay to a market.
 *
 * ```ts
 * const result = await repay(client, {
 *   market: evmAddress('0x1234…'),
 *   amount: {
 *     erc20: {
 *       currency: evmAddress('0x5678…'),
 *       value: '500',
 *     },
 *   },
 *   borrower: evmAddress('0x9abc…'),
 *   chainId: chainId(1),
 * });
 * ```
 *
 * @param client - Aave client.
 * @param request - The repay request parameters.
 * @returns The transaction data, approval requirements, or insufficient balance error.
 */
export function repay(
  client: AaveClient,
  request: RepayRequest,
): ResultAsync<ExecutionPlan, UnexpectedError> {
  return client.query(RepayQuery, { request });
}

/**
 * Creates a transaction to withdraw from a market.
 *
 * ```ts
 * const result = await withdraw(client, {
 *   market: evmAddress('0x1234…'),
 *   amount: {
 *     erc20: {
 *       currency: evmAddress('0x5678…'),
 *       value: '750',
 *     },
 *   },
 *   supplier: evmAddress('0x9abc…'),
 *   chainId: chainId(1),
 * });
 * ```
 *
 * @param client - Aave client.
 * @param request - The withdraw request parameters.
 * @returns The transaction data, approval requirements, or insufficient balance error.
 */
export function withdraw(
  client: AaveClient,
  request: WithdrawRequest,
): ResultAsync<ExecutionPlan, UnexpectedError> {
  return client.query(WithdrawQuery, { request });
}

/**
 * Creates a transaction to toggle eMode for a user in a market.
 *
 * ```ts
 * const result = await eModeToggle(client, {
 *   market: evmAddress('0x1234…'),
 *   user: evmAddress('0x9abc…'),
 *   chainId: chainId(1),
 * });
 * ```
 *
 * @param client - Aave client.
 * @param request - The eMode toggle request parameters.
 * @returns The transaction request data to toggle eMode.
 */
export function eModeToggle(
  client: AaveClient,
  request: EModeToggleRequest,
): ResultAsync<TransactionRequest, UnexpectedError> {
  return client.query(EModeToggleQuery, { request });
}
