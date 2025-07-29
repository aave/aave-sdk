import {
  BorrowQuery,
  type BorrowRequest,
  CollateralToggleQuery,
  type CollateralToggleRequest,
  type ExecutionPlan,
  LiquidateQuery,
  type LiquidateRequest,
  RepayQuery,
  type RepayRequest,
  SupplyQuery,
  type SupplyRequest,
  type TransactionRequest,
  UserSetEmodeQuery,
  type UserSetEmodeRequest,
  VaultDeployQuery,
  type VaultDeployRequest,
  VaultDepositQuery,
  type VaultDepositRequest,
  VaultMintSharesQuery,
  type VaultMintSharesRequest,
  VaultRedeemSharesQuery,
  type VaultRedeemSharesRequest,
  VaultSetFeeQuery,
  type VaultSetFeeRequest,
  VaultWithdrawFeesQuery,
  type VaultWithdrawFeesRequest,
  VaultWithdrawQuery,
  type VaultWithdrawRequest,
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
 *   market: market.address,
 *   amount: {
 *     erc20: {
 *       currency: evmAddress('0x5678…'),
 *       value: '1000',
 *     },
 *   },
 *   borrower: evmAddress('0x9abc…'),
 *   chainId: market.chain.chainId,
 * }).andThen(sendWith(wallet)).andThen(client.waitForTransaction);
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
 *   market: market.address,
 *   amount: {
 *     erc20: {
 *       currency: evmAddress('0x5678…'),
 *       value: '1000',
 *     },
 *   },
 *   supplier: evmAddress('0x9abc…'),
 *   chainId: market.chain.chainId,
 * }).andThen(sendWith(wallet)).andThen(client.waitForTransaction);
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
 *   market: market.address,
 *   amount: {
 *     erc20: {
 *       currency: evmAddress('0x5678…'),
 *       value: '500',
 *     },
 *   },
 *   borrower: evmAddress('0x9abc…'),
 *   chainId: market.chain.chainId,
 * }).andThen(sendWith(wallet)).andThen(client.waitForTransaction);
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
 *   market: market.address,
 *   amount: {
 *     erc20: {
 *       currency: evmAddress('0x5678…'),
 *       value: { exact: '750' },
 *     },
 *   },
 *   supplier: evmAddress('0x9abc…'),
 *   chainId: market.chain.chainId,
 * }).andThen(sendWith(wallet)).andThen(client.waitForTransaction);
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
 * Creates a transaction to enable/disable the user's eMode for a market.
 *
 * **Example: Enable a Specific eMode**
 * ```ts
 * const result = await userSetEmode(client, {
 *   market: market.address,
 *   user: evmAddress('0x5678…'),
 *   categoryId: market.eModeCategories[0].id,
 *   chainId: market.chain.chainId,
 * }).andThen(sendWith(wallet)).andThen(client.waitForTransaction);
 *
 * if (result.isErr()) {
 *   // Handle error, e.g. signing error, etc.
 *   return;
 * }
 *
 * // result.value: TxHash
 * ```
 *
 * **Example: Disable eMode**
 * ```ts
 * const result = await userSetEmode(client, {
 *   market: market.address,
 *   user: evmAddress('0x5678…'),
 *   categoryId: null,
 *   chainId: market.chain.chainId,
 * }).andThen(sendWith(wallet)).andThen(client.waitForTransaction);
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
 * @param request - The user set eMode request parameters.
 * @returns The transaction request data to set eMode.
 */
export function userSetEmode(
  client: AaveClient,
  request: UserSetEmodeRequest,
): ResultAsync<TransactionRequest, UnexpectedError> {
  return client.query(UserSetEmodeQuery, { request });
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
 * }).andThen(sendWith(wallet)).andThen(client.waitForTransaction);
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
 * const result = await vaultRedeemShares(client, {
 *   vault: evmAddress('0x1234…'),
 *   shares: {
 *     amount: '500',
 *     asAToken: false,
 *   },
 *   sharesOwner: evmAddress('0x9abc…'),
 *   chainId: chainId(1),
 * }).andThen(sendWith(wallet)).andThen(client.waitForTransaction);
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
export function vaultRedeemShares(
  client: AaveClient,
  request: VaultRedeemSharesRequest,
): ResultAsync<TransactionRequest, UnexpectedError> {
  return client.query(VaultRedeemSharesQuery, { request });
}

/**
 * Creates an execution plan to deploy a new vault.
 *
 * ```ts
 * const result = await vaultDeploy(client, {
 *   underlyingToken: evmAddress('0x1234…'),
 *   market: evmAddress('0x5678…'),
 *   deployer: evmAddress('0x9abc…'),
 *   initialFee: '0.1',
 *   shareName: 'Aave Vault Shares',
 *   shareSymbol: 'avs',
 *   initialLockDeposit: '1000',
 *   chainId: chainId(1),
 * }).andThen(sendWith(wallet)).andThen(client.waitForTransaction);
 *
 * if (result.isErr()) {
 *   // Handle error, e.g. signing error, insufficient balance, etc.
 *   return;
 * }
 *
 * // result.value: TxHash
 * ```
 *
 * @param client - Aave client.
 * @param request - The deploy vault request parameters.
 * @returns The execution plan data to deploy a vault. May require approval transactions.
 */
export function vaultDeploy(
  client: AaveClient,
  request: VaultDeployRequest,
): ResultAsync<ExecutionPlan, UnexpectedError> {
  return client.query(VaultDeployQuery, { request });
}

/**
 * Creates a transaction to set the vault fee (owner only).
 *
 * ```ts
 * const result = await vaultSetFee(client, {
 *   vault: evmAddress('0x1234…'),
 *   newFee: '0.2',
 *   chainId: chainId(1),
 * }).andThen(sendWith(wallet)).andThen(client.waitForTransaction);
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
export function vaultSetFee(
  client: AaveClient,
  request: VaultSetFeeRequest,
): ResultAsync<TransactionRequest, UnexpectedError> {
  return client.query(VaultSetFeeQuery, { request });
}

/**
 * Creates a transaction to withdraw accumulated fees from a vault (owner only).
 *
 * ```ts
 * const result = await vaultWithdrawFees(client, {
 *   vault: evmAddress('0x1234…'),
 *   amount: '100',
 *   chainId: chainId(1),
 * }).andThen(sendWith(wallet)).andThen(client.waitForTransaction);
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
export function vaultWithdrawFees(
  client: AaveClient,
  request: VaultWithdrawFeesRequest,
): ResultAsync<TransactionRequest, UnexpectedError> {
  return client.query(VaultWithdrawFeesQuery, { request });
}

/**
 * Creates a transaction to withdraw assets from a vault, burning shares.
 *
 * ```ts
 * const result = await vaultWithdraw(client, {
 *   vault: evmAddress('0x1234…'),
 *   shares: {
 *     amount: '500',
 *     asAToken: false,
 *   },
 *   sharesOwner: evmAddress('0x9abc…'),
 *   chainId: chainId(1),
 * }).andThen(sendWith(wallet)).andThen(client.waitForTransaction);
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
export function vaultWithdraw(
  client: AaveClient,
  request: VaultWithdrawRequest,
): ResultAsync<TransactionRequest, UnexpectedError> {
  return client.query(VaultWithdrawQuery, { request });
}

/**
 * Creates a transaction to mint exact amount of vault shares by depositing calculated assets.
 *
 * ```ts
 * const result = await vaultMintShares(client, {
 *   vault: evmAddress('0x1234…'),
 *   shares: {
 *     amount: '1000',
 *     asAToken: false,
 *   },
 *   minter: evmAddress('0x9abc…'),
 *   chainId: chainId(1),
 * }).andThen(sendWith(wallet)).andThen(client.waitForTransaction);
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
export function vaultMintShares(
  client: AaveClient,
  request: VaultMintSharesRequest,
): ResultAsync<ExecutionPlan, UnexpectedError> {
  return client.query(VaultMintSharesQuery, { request });
}

/**
 * Creates a transaction to enable/disable a specific supplied asset as collateral.
 *
 * ```ts
 * const result = await collateralToggle(client, {
 *   market: market.address,
 *   underlyingToken: market.supplyReserves[n].underlyingToken.address,
 *   user: evmAddress('0x9abc…'),
 *   chainId: market.chain.chainId,
 * }).andThen(sendWith(wallet)).andThen(client.waitForTransaction);
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
 * }).andThen(sendWith(wallet)).andThen(client.waitForTransaction);
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
