import type { UnexpectedError } from '@aave/core';
import {
  type PaginatedVaultsResult,
  type PaginatedVaultUserTransactionHistoryResult,
  type TokenAmount,
  type TransactionRequest,
  UserVaultsQuery,
  type UserVaultsRequest,
  type Vault,
  type VaultDeployRevenueSplitterRequest,
  VaultPreviewDepositQuery,
  type VaultPreviewDepositRequest,
  VaultPreviewMintQuery,
  type VaultPreviewMintRequest,
  VaultPreviewRedeemQuery,
  type VaultPreviewRedeemRequest,
  VaultPreviewWithdrawQuery,
  type VaultPreviewWithdrawRequest,
  VaultQuery,
  type VaultRequest,
  type VaultSetRevenueSplitterRequest,
  VaultsQuery,
  type VaultsRequest,
  type VaultTransferOwnershipRequest,
  VaultUserActivityQuery,
  type VaultUserActivityRequest,
  type VaultUserActivityResult,
  VaultUserTransactionHistoryQuery,
  type VaultUserTransactionHistoryRequest,
  vaultDeployRevenueSplitterQuery,
  vaultSetRevenueSplitterQuery,
  vaultTransferOwnershipQuery,
} from '@aave/graphql';
import type { ResultAsync } from '@aave/types';
import type { AaveClient } from '../AaveClient';

/**
 * Fetches a specific vault by address and chain ID.
 *
 * **Example: By Address**
 * ```ts
 * const result = await vault(client, {
 *   by: {
 *     address: evmAddress('0x1234…'),
 *   },
 *   chainId: chainId(1),
 *   user: evmAddress('0x5678…'),
 * });
 * ```
 *
 * **Example: Tx Hash**
 * ```ts
 * const result = await vault(client, {
 *   by: {
 *     txHash: txHash('0x1234…'),
 *   },
 *   chainId: chainId(1),
 *   user: evmAddress('0x5678…'),
 * });
 * ```
 *
 * @param client - Aave client.
 * @param request - The vault request parameters.
 * @returns The vault data, or null if not found.
 */
export function vault(
  client: AaveClient,
  request: VaultRequest,
): ResultAsync<Vault | null, UnexpectedError> {
  return client.query(VaultQuery, {
    request,
  });
}

/**
 * Fetches vaults based on filter criteria.
 *
 * ```ts
 * const result = await vaults(client, {
 *   criteria: {
 *     ownedBy: [evmAddress('0x1234…')]
 *   },
 *   pageSize: PageSize.Ten,
 *   user: evmAddress('0x5678…'),
 * });
 * ```
 *
 * @param client - Aave client.
 * @param request - The vaults request parameters.
 * @returns The paginated vaults result.
 */
export function vaults(
  client: AaveClient,
  request: VaultsRequest,
): ResultAsync<PaginatedVaultsResult, UnexpectedError> {
  return client.query(VaultsQuery, {
    request,
  });
}

/**
 * Fetches vaults that a user has shares in.
 *
 * ```ts
 * const result = await userVaults(client, {
 *   user: evmAddress('0x1234…'),
 *   filters: {
 *     markets: [evmAddress('0x5678…')]
 *   },
 *   orderBy: { shares: OrderDirection.Desc },
 *   pageSize: PageSize.Fifty,
 * });
 * ```
 *
 * @param client - Aave client.
 * @param request - The user vaults request parameters.
 * @returns The paginated user vaults result.
 */
export function userVaults(
  client: AaveClient,
  request: UserVaultsRequest,
): ResultAsync<PaginatedVaultsResult, UnexpectedError> {
  return client.query(UserVaultsQuery, {
    request,
  });
}

/**
 * Determines the amount of shares that would be received for a deposit.
 *
 * ```ts
 * const result = await vaultPreviewDeposit(client, {
 *   vault: evmAddress('0x1234567890abcdef1234567890abcdef12345678'),
 *   chainId: chainId(1),
 *   amount: bigDecimal('1000'),
 * });
 *
 * if (result.isOk()) {
 *   console.log('Shares to receive:', result.value.amount.value);
 *   console.log('USD value:', result.value.usd);
 * }
 * ```
 *
 * @param client - Aave client.
 * @param request - The vault preview deposit request parameters.
 * @returns The simulated shares amount that would be received.
 */
export function vaultPreviewDeposit(
  client: AaveClient,
  request: VaultPreviewDepositRequest,
): ResultAsync<TokenAmount, UnexpectedError> {
  return client.query(VaultPreviewDepositQuery, {
    request,
  });
}

/**
 * Determines the amount of assets that would be required to mint a specific amount of vault shares.
 *
 * ```ts
 * const result = await vaultPreviewMint(client, {
 *   vault: evmAddress('0x1234567890abcdef1234567890abcdef12345678'),
 *   chainId: chainId(1),
 *   amount: bigDecimal('500'),
 * });
 *
 * if (result.isOk()) {
 *   console.log('Assets required:', result.value.amount.value);
 *   console.log('USD value:', result.value.usd);
 * }
 * ```
 *
 * @param client - Aave client.
 * @param request - The vault preview mint request parameters.
 * @returns The simulated assets amount that would be required.
 */
export function vaultPreviewMint(
  client: AaveClient,
  request: VaultPreviewMintRequest,
): ResultAsync<TokenAmount, UnexpectedError> {
  return client.query(VaultPreviewMintQuery, {
    request,
  });
}

/**
 * Determines the amount of shares that would be burned for a withdrawal.
 *
 * ```ts
 * const result = await vaultPreviewWithdraw(client, {
 *   vault: evmAddress('0x1234567890abcdef1234567890abcdef12345678'),
 *   chainId: chainId(1),
 *   amount: bigDecimal('750'),
 * });
 *
 * if (result.isOk()) {
 *   console.log('Shares to burn:', result.value.amount.value);
 *   console.log('USD value:', result.value.usd);
 * }
 * ```
 *
 * @param client - Aave client.
 * @param request - The vault preview withdraw request parameters.
 * @returns The simulated shares amount that would be burned.
 */
export function vaultPreviewWithdraw(
  client: AaveClient,
  request: VaultPreviewWithdrawRequest,
): ResultAsync<TokenAmount, UnexpectedError> {
  return client.query(VaultPreviewWithdrawQuery, {
    request,
  });
}

/**
 * Determines the amount of assets that would be received for redeeming a specific amount of vault shares.
 *
 * ```ts
 * const result = await vaultPreviewRedeem(client, {
 *   vault: evmAddress('0x1234567890abcdef1234567890abcdef12345678'),
 *   chainId: chainId(1),
 *   amount: bigDecimal('200'),
 * });
 *
 * if (result.isOk()) {
 *   console.log('Assets to receive:', result.value.amount.value);
 *   console.log('USD value:', result.value.usd);
 * }
 * ```
 *
 * @param client - Aave client.
 * @param request - The vault preview redeem request parameters.
 * @returns The simulated assets amount that would be received.
 */
export function vaultPreviewRedeem(
  client: AaveClient,
  request: VaultPreviewRedeemRequest,
): ResultAsync<TokenAmount, UnexpectedError> {
  return client.query(VaultPreviewRedeemQuery, {
    request,
  });
}

/**
 * Fetches the user transaction history for a vault.
 *
 * ```ts
 * const result = await vaultUserTransactionHistory(client, {
 *   vault: evmAddress('0x1234567890abcdef1234567890abcdef12345678'),
 *   chainId: chainId(1),
 *   user: evmAddress('0x5678901234567890abcdef1234567890abcdef12'),
 * });
 *
 * if (result.isOk()) {
 *   console.log('Transaction count:', result.value.items.length);
 *   result.value.items.forEach(tx => {
 *     if (tx.__typename === 'VaultUserDepositItem') {
 *       console.log('Deposit:', tx.asset.amount.value, 'shares:', tx.shares.amount.value);
 *     } else if (tx.__typename === 'VaultUserWithdrawItem') {
 *       console.log('Withdraw:', tx.asset.amount.value, 'shares:', tx.shares.amount.value);
 *     }
 *   });
 * }
 * ```
 *
 * @param client - Aave client.
 * @param request - The vault user transaction history request parameters.
 * @returns The paginated vault user transaction history result.
 */
export function vaultUserTransactionHistory(
  client: AaveClient,
  request: VaultUserTransactionHistoryRequest,
): ResultAsync<PaginatedVaultUserTransactionHistoryResult, UnexpectedError> {
  return client.query(VaultUserTransactionHistoryQuery, {
    request,
  });
}

/**
 * Fetches the user activity data for a vault, including earnings breakdown over time.
 *
 * ```ts
 * const result = await vaultUserActivity(client, {
 *   vault: evmAddress('0x1234567890abcdef1234567890abcdef12345678'),
 *   chainId: chainId(1),
 *   user: evmAddress('0x5678901234567890abcdef1234567890abcdef12'),
 * });
 *
 * if (result.isOk()) {
 *   console.log('Total earned:', result.value.earned.amount.value);
 *   console.log('Activity breakdown count:', result.value.breakdown.length);
 *   result.value.breakdown.forEach(activity => {
 *     console.log('Date:', activity.date);
 *     console.log('Balance:', activity.balance.amount.value);
 *     console.log('Earned:', activity.earned.amount.value);
 *   });
 * }
 * ```
 *
 * @param client - Aave client.
 * @param request - The vault user activity request parameters.
 * @returns The vault user activity result.
 */
export function vaultUserActivity(
  client: AaveClient,
  request: VaultUserActivityRequest,
): ResultAsync<VaultUserActivityResult, UnexpectedError> {
  return client.query(VaultUserActivityQuery, {
    request,
  });
}

/**
 * Creates a transaction to transfer ownership of a vault.
 *
 * ```ts
 * const result = await vaultTransferOwnership(client, {
 *   vault: evmAddress('0x1234567890abcdef1234567890abcdef12345678'),
 *   chainId: chainId(1),
 *   newOwner: evmAddress('0x5678901234567890abcdef1234567890abcdef12'),
 * }).andThen(sendWith(wallet)).andThen(client.waitForTransaction);
 * ```
 *
 * @param client - Aave client.
 * @param request - The vault transfer ownership request parameters.
 * @returns The transaction data for transferring vault ownership.
 */
export function vaultTransferOwnership(
  client: AaveClient,
  request: VaultTransferOwnershipRequest,
): ResultAsync<TransactionRequest, UnexpectedError> {
  return client.query(vaultTransferOwnershipQuery, {
    request,
  });
}

/**
 * Creates a transaction to deploy a revenue splitter for a vault.
 *
 * ```ts
 * const result = await vaultDeployRevenueSplitter(client, {
 *   vault: evmAddress('0x1234567890abcdef1234567890abcdef12345678'),
 *   chainId: chainId(1),
 *   recipients: [
 *     {
 *       account: evmAddress('0x5678901234567890abcdef1234567890abcdef12'),
 *       shares: 5000, // 50%
 *     },
 *     {
 *       account: evmAddress('0x9abc123456789012345678901234567890abcdef'),
 *       shares: 5000, // 50%
 *     },
 *   ],
 * }).andThen(sendWith(wallet)).andThen(client.waitForTransaction);
 * ```
 *
 * @param client - Aave client.
 * @param request - The vault deploy revenue splitter request parameters.
 * @returns The transaction data for deploying a revenue splitter.
 */
export function vaultDeployRevenueSplitter(
  client: AaveClient,
  request: VaultDeployRevenueSplitterRequest,
): ResultAsync<TransactionRequest, UnexpectedError> {
  return client.query(vaultDeployRevenueSplitterQuery, {
    request,
  });
}

/**
 * Creates a transaction to set the revenue splitter for a vault.
 *
 * ```ts
 * const result = await vaultSetRevenueSplitter(client, {
 *   vault: evmAddress('0x1234567890abcdef1234567890abcdef12345678'),
 *   chainId: chainId(1),
 *   revenueSplitter: evmAddress('0x5678901234567890abcdef1234567890abcdef12'),
 * }).andThen(sendWith(wallet)).andThen(client.waitForTransaction);
 * ```
 *
 * @param client - Aave client.
 * @param request - The vault set revenue splitter request parameters.
 * @returns The transaction data for setting a revenue splitter.
 */
export function vaultSetRevenueSplitter(
  client: AaveClient,
  request: VaultSetRevenueSplitterRequest,
): ResultAsync<TransactionRequest, UnexpectedError> {
  return client.query(vaultSetRevenueSplitterQuery, {
    request,
  });
}
