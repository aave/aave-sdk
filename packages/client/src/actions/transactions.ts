import {
  BorrowQuery,
  type BorrowRequest,
  ClaimVaultRewardsQuery,
  type ClaimVaultRewardsRequest,
  CollateralToggleQuery,
  type CollateralToggleRequest,
  DeployVaultQuery,
  type DeployVaultRequest,
  EModeToggleQuery,
  type EModeToggleRequest,
  type ExecutionPlan,
  LiquidateQuery,
  type LiquidateRequest,
  MintVaultSharesQuery,
  type MintVaultSharesRequest,
  RedeemVaultSharesQuery,
  type RedeemVaultSharesRequest,
  RepayQuery,
  type RepayRequest,
  SetVaultFeeQuery,
  type SetVaultFeeRequest,
  SupplyQuery,
  type SupplyRequest,
  type TransactionRequest,
  VaultDepositQuery,
  type VaultDepositRequest,
  WithdrawQuery,
  type WithdrawRequest,
  WithdrawVaultFeesQuery,
  type WithdrawVaultFeesRequest,
  WithdrawVaultQuery,
  type WithdrawVaultRequest,
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
 *   // Handle error, e.g. signing error, etc.
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
 * }).andThen(sendWith(wallet));
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
 * @param request - The eMode toggle request parameters.
 * @returns The transaction request data to toggle eMode.
 */
export function eModeToggle(
  client: AaveClient,
  request: EModeToggleRequest,
): ResultAsync<TransactionRequest, UnexpectedError> {
  return client.query(EModeToggleQuery, { request });
}

/**
 * Creates a transaction to deposit assets into a vault and mint shares.
 *
 * ```ts
 * const result = await vaultDeposit(client, {
 *   vault: evmAddress('0x1234…'),
 *   amount: {
 *     currency: evmAddress('0x5678…'),
 *     value: '1000',
 *   },
 *   depositor: evmAddress('0x9abc…'),
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
 * @param request - The vault deposit request parameters.
 * @returns The transaction data, approval requirements, or insufficient balance error.
 */
export function vaultDeposit(
  client: AaveClient,
  request: VaultDepositRequest,
): ResultAsync<ExecutionPlan, UnexpectedError> {
  return client.query(VaultDepositQuery, { request });
}

/**
 * Creates a transaction to redeem vault shares for underlying assets.
 *
 * ```ts
 * const result = await redeemVaultShares(client, {
 *   vault: evmAddress('0x1234…'),
 *   shares: {
 *     amount: '500',
 *     asAToken: false,
 *   },
 *   sharesOwner: evmAddress('0x9abc…'),
 *   chainId: chainId(1),
 * }).andThen(sendWith(wallet));
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
 * @param request - The redeem vault shares request parameters.
 * @returns The transaction request data to redeem shares.
 */
export function redeemVaultShares(
  client: AaveClient,
  request: RedeemVaultSharesRequest,
): ResultAsync<TransactionRequest, UnexpectedError> {
  return client.query(RedeemVaultSharesQuery, { request });
}

/**
 * Creates a transaction to deploy a new vault.
 *
 * ```ts
 * const result = await deployVault(client, {
 *   underlyingToken: evmAddress('0x1234…'),
 *   market: evmAddress('0x5678…'),
 *   deployer: evmAddress('0x9abc…'),
 *   initialFee: '0.1',
 *   shareName: 'Aave Vault Shares',
 *   shareSymbol: 'avs',
 *   initialLockDeposit: '1000',
 *   chainId: chainId(1),
 * }).andThen(sendWith(wallet));
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
 * @param request - The deploy vault request parameters.
 * @returns The transaction request data to deploy a vault.
 */
export function deployVault(
  client: AaveClient,
  request: DeployVaultRequest,
): ResultAsync<TransactionRequest, UnexpectedError> {
  return client.query(DeployVaultQuery, { request });
}

/**
 * Creates a transaction to set the vault fee (owner only).
 *
 * ```ts
 * const result = await setVaultFee(client, {
 *   vault: evmAddress('0x1234…'),
 *   newFee: '0.2',
 *   chainId: chainId(1),
 * }).andThen(sendWith(wallet));
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
 * @param request - The set vault fee request parameters.
 * @returns The transaction request data to set vault fee.
 */
export function setVaultFee(
  client: AaveClient,
  request: SetVaultFeeRequest,
): ResultAsync<TransactionRequest, UnexpectedError> {
  return client.query(SetVaultFeeQuery, { request });
}

/**
 * Creates a transaction to withdraw accumulated fees from a vault (owner only).
 *
 * ```ts
 * const result = await withdrawVaultFees(client, {
 *   vault: evmAddress('0x1234…'),
 *   amount: '100',
 *   chainId: chainId(1),
 * }).andThen(sendWith(wallet));
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
 * @param request - The withdraw vault fees request parameters.
 * @returns The transaction request data to withdraw vault fees.
 */
export function withdrawVaultFees(
  client: AaveClient,
  request: WithdrawVaultFeesRequest,
): ResultAsync<TransactionRequest, UnexpectedError> {
  return client.query(WithdrawVaultFeesQuery, { request });
}

/**
 * Creates a transaction to claim rewards from a vault (owner only).
 *
 * ```ts
 * const result = await claimVaultRewards(client, {
 *   vault: evmAddress('0x1234…'),
 *   chainId: chainId(1),
 * }).andThen(sendWith(wallet));
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
 * @param request - The claim vault rewards request parameters.
 * @returns The transaction request data to claim vault rewards.
 */
export function claimVaultRewards(
  client: AaveClient,
  request: ClaimVaultRewardsRequest,
): ResultAsync<TransactionRequest, UnexpectedError> {
  return client.query(ClaimVaultRewardsQuery, { request });
}

/**
 * Creates a transaction to withdraw assets from a vault, burning shares.
 *
 * ```ts
 * const result = await withdrawVault(client, {
 *   vault: evmAddress('0x1234…'),
 *   amount: {
 *     currency: evmAddress('0x5678…'),
 *     value: '500',
 *   },
 *   sharesOwner: evmAddress('0x9abc…'),
 *   chainId: chainId(1),
 * }).andThen(sendWith(wallet));
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
 * @param request - The withdraw vault request parameters.
 * @returns The transaction request data to withdraw from vault.
 */
export function withdrawVault(
  client: AaveClient,
  request: WithdrawVaultRequest,
): ResultAsync<TransactionRequest, UnexpectedError> {
  return client.query(WithdrawVaultQuery, { request });
}

/**
 * Creates a transaction to mint exact amount of vault shares by depositing calculated assets.
 *
 * ```ts
 * const result = await mintVaultShares(client, {
 *   vault: evmAddress('0x1234…'),
 *   shares: '1000',
 *   depositor: evmAddress('0x9abc…'),
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
 * @param request - The mint vault shares request parameters.
 * @returns The transaction data, approval requirements, or insufficient balance error.
 */
export function mintVaultShares(
  client: AaveClient,
  request: MintVaultSharesRequest,
): ResultAsync<ExecutionPlan, UnexpectedError> {
  return client.query(MintVaultSharesQuery, { request });
}

/**
 * Creates a transaction to enable/disable a specific supplied asset as collateral.
 *
 * ```ts
 * const result = await collateralToggle(client, {
 *   market: evmAddress('0x1234…'),
 *   underlyingToken: evmAddress('0x5678…'),
 *   user: evmAddress('0x9abc…'),
 *   chainId: chainId(1),
 * }).andThen(sendWith(wallet));
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
 * @param request - The collateral toggle request parameters.
 * @returns The transaction request data to toggle collateral.
 */
export function collateralToggle(
  client: AaveClient,
  request: CollateralToggleRequest,
): ResultAsync<TransactionRequest, UnexpectedError> {
  return client.query(CollateralToggleQuery, { request });
}

/**
 * Creates a transaction to liquidate a non-healthy position with Health Factor below 1.
 *
 * ```ts
 * const result = await liquidate(client, {
 *   collateralToken: evmAddress('0x1234…'),
 *   debtToken: evmAddress('0x5678…'),
 *   user: evmAddress('0x9abc…'),
 *   debtToCover: { max: true },
 *   chainId: chainId(1),
 * }).andThen(sendWith(wallet));
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
 * @param request - The liquidate request parameters.
 * @returns The transaction request data to liquidate position.
 */
export function liquidate(
  client: AaveClient,
  request: LiquidateRequest,
): ResultAsync<TransactionRequest, UnexpectedError> {
  return client.query(LiquidateQuery, { request });
}
