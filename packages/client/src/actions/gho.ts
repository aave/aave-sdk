import {
  type ExecutionPlan,
  SavingsGhoBalanceQuery,
  type SavingsGhoBalanceRequest,
  SavingsGhoDepositQuery,
  type SavingsGhoDepositRequest,
  SavingsGhoWithdrawQuery,
  type SavingsGhoWithdrawRequest,
  type TokenAmount,
  type TransactionRequest,
} from '@aave/graphql';
import type { ResultAsync } from '@aave/types';
import type { AaveClient } from '../client';
import type { UnexpectedError } from '../errors';

/**
 * Fetches the current sGHO balance for a user.
 *
 * ```ts
 * const result = await savingsGhoBalance(client, {
 *   user: evmAddress('0x742d35cc…'),
 * });
 * ```
 *
 * @param client - Aave client.
 * @param request - The sGHO balance request parameters.
 * @returns The user's sGHO balance.
 */
export function savingsGhoBalance(
  client: AaveClient,
  request: SavingsGhoBalanceRequest,
): ResultAsync<TokenAmount, UnexpectedError> {
  return client.query(SavingsGhoBalanceQuery, { request });
}

/**
 * Creates a transaction to withdraw sGHO.
 *
 * ```ts
 * const result = await savingsGhoWithdraw(client, {
 *   amount: {
 *     exact: '1000',
 *   },
 *   sharesOwner: evmAddress('0x9abc…'),
 * }).andThen(sendWith(wallet))
 *
 * if (result.isErr()) {
 *   // Handle error, e.g. signing error, etc.
 *   return;
 * }
 *
 * // result.value: TxHash
 * ```
 *
 * @param client - Aave client.
 * @param request - The sGHO withdraw request parameters.
 * @returns The transaction request data to withdraw sGHO.
 */
export function savingsGhoWithdraw(
  client: AaveClient,
  request: SavingsGhoWithdrawRequest,
): ResultAsync<TransactionRequest, UnexpectedError> {
  return client.query(SavingsGhoWithdrawQuery, { request });
}

/**
 * Creates a transaction to deposit GHO into sGHO.
 *
 * ```ts
 * const result = await savingsGhoDeposit(client, {
 *   amount: {
 *     value: '1000',
 *   },
 *   depositor: evmAddress('0x9abc…'),
 * }).andThen(sendWith(wallet))
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
 * @param request - The sGHO deposit request parameters.
 * @returns The transaction data, approval requirements, or insufficient balance error.
 */
export function savingsGhoDeposit(
  client: AaveClient,
  request: SavingsGhoDepositRequest,
): ResultAsync<ExecutionPlan, UnexpectedError> {
  return client.query(SavingsGhoDepositQuery, { request });
}
