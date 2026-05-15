import type { UnexpectedError } from '@aave/core';
import {
  type DecimalValue,
  type ExecutionPlan,
  SavingsGhoBalanceQuery,
  type SavingsGhoBalanceRequest,
  SavingsGhoDepositQuery,
  type SavingsGhoDepositRequest,
  SavingsGhoWithdrawQuery,
  type SavingsGhoWithdrawRequest,
  type SghoVault,
  SghoVaultDepositQuery,
  type SghoVaultDepositRequest,
  SghoVaultPreviewDepositQuery,
  type SghoVaultPreviewDepositRequest,
  SghoVaultPreviewRedeemQuery,
  type SghoVaultPreviewRedeemRequest,
  SghoVaultQuery,
  SghoVaultRedeemSharesQuery,
  type SghoVaultRedeemSharesRequest,
  type SghoVaultRequest,
  type TokenAmount,
} from '@aave/graphql';
import type { ResultAsync } from '@aave/types';
import type { AaveClient } from '../AaveClient';

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
): ResultAsync<ExecutionPlan, UnexpectedError> {
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

/**
 * Fetches the current state of the sGHO ERC-4626 vault.
 *
 * ```ts
 * const result = await sghoVault(client, {
 *   chainId: chainId(1),
 *   user: evmAddress('0x9abc…'),
 * });
 * ```
 *
 * @param client - Aave client.
 * @param request - The sGHO vault request parameters.
 * @returns The vault state, including rates, totals, and optional user position.
 */
export function sghoVault(
  client: AaveClient,
  request: SghoVaultRequest,
): ResultAsync<SghoVault, UnexpectedError> {
  return client.query(SghoVaultQuery, { request });
}

/**
 * Creates a transaction to deposit GHO into the sGHO ERC-4626 vault.
 *
 * ```ts
 * const result = await sghoVaultDeposit(client, {
 *   amount: { value: '1000' },
 *   depositor: evmAddress('0x9abc…'),
 *   chainId: chainId(1),
 * }).andThen(sendWith(wallet))
 *
 * if (result.isErr()) {
 *   return;
 * }
 *
 * // result.value: TxHash
 * ```
 *
 * @param client - Aave client.
 * @param request - The sGHO vault deposit request parameters.
 * @returns The transaction data, approval requirements, or insufficient balance error.
 */
export function sghoVaultDeposit(
  client: AaveClient,
  request: SghoVaultDepositRequest,
): ResultAsync<ExecutionPlan, UnexpectedError> {
  return client.query(SghoVaultDepositQuery, { request });
}

/**
 * Creates a transaction to redeem sGHO shares for GHO from the ERC-4626 vault.
 *
 * ```ts
 * const result = await sghoVaultRedeemShares(client, {
 *   amount: { maxRedeem: true },
 *   sharesOwner: evmAddress('0x9abc…'),
 *   chainId: chainId(1),
 * }).andThen(sendWith(wallet))
 *
 * if (result.isErr()) {
 *   return;
 * }
 *
 * // result.value: TxHash
 * ```
 *
 * @param client - Aave client.
 * @param request - The sGHO vault redeem shares request parameters.
 * @returns The transaction data, approval requirements, or insufficient balance error.
 */
export function sghoVaultRedeemShares(
  client: AaveClient,
  request: SghoVaultRedeemSharesRequest,
): ResultAsync<ExecutionPlan, UnexpectedError> {
  return client.query(SghoVaultRedeemSharesQuery, { request });
}

/**
 * Returns the number of sGHO shares minted for a given GHO deposit amount.
 *
 * ```ts
 * const result = await sghoVaultPreviewDeposit(client, {
 *   amount: '1000',
 *   chainId: chainId(1),
 * });
 * ```
 *
 * @param client - Aave client.
 * @param request - The preview deposit request parameters.
 * @returns The number of sGHO shares that would be minted.
 */
export function sghoVaultPreviewDeposit(
  client: AaveClient,
  request: SghoVaultPreviewDepositRequest,
): ResultAsync<DecimalValue, UnexpectedError> {
  return client.query(SghoVaultPreviewDepositQuery, { request });
}

/**
 * Returns the amount of GHO received for redeeming a given number of sGHO shares.
 *
 * ```ts
 * const result = await sghoVaultPreviewRedeem(client, {
 *   amount: '1000',
 *   chainId: chainId(1),
 * });
 * ```
 *
 * @param client - Aave client.
 * @param request - The preview redeem request parameters.
 * @returns The amount of GHO that would be received.
 */
export function sghoVaultPreviewRedeem(
  client: AaveClient,
  request: SghoVaultPreviewRedeemRequest,
): ResultAsync<DecimalValue, UnexpectedError> {
  return client.query(SghoVaultPreviewRedeemQuery, { request });
}
