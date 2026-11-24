import type { UnexpectedError } from '@aave/core';
import {
  MigratePositionQuery,
  type MigratePositionRequest,
  MigrationBorrowPreviewQuery,
  type MigrationBorrowPreviewRequest,
  MigrationEarnPreviewQuery,
  type MigrationEarnPreviewRequest,
  type MigrationExecutionPlan,
  MigrationOpportunitiesQuery,
  type MigrationOpportunitiesRequest,
  type MigrationOpportunity,
  type MigrationPreview,
} from '@aave/graphql';
import type { ResultAsync } from '@aave/types';
import type { AaveClient } from '../AaveClient';

/**
 * Fetches the user's V3 positions that could migrate to V4, each with the spokes
 * it could move to and what moving all of it would change.
 *
 * ```ts
 * const result = await migrationOpportunities(client, {
 *   markets: [
 *     {
 *       address: evmAddress('0x87870bca…'),
 *       chainId: chainId(1),
 *     },
 *   ],
 *   user: evmAddress('0x742d35cc…'),
 * });
 * ```
 *
 * @param client - Aave client.
 * @param request - The migration opportunities request parameters.
 * @returns The positions that could migrate, with their target spokes.
 */
export function migrationOpportunities(
  client: AaveClient,
  request: MigrationOpportunitiesRequest,
): ResultAsync<MigrationOpportunity[], UnexpectedError> {
  return client.query(MigrationOpportunitiesQuery, { request });
}

/**
 * Previews moving a percentage of a V3 borrow position to a V4 spoke: every
 * collateral and debt at that percentage, with V3 and V4 before and after.
 *
 * ```ts
 * const result = await migrationBorrowPreview(client, {
 *   user: evmAddress('0x742d35cc…'),
 *   market: {
 *     address: evmAddress('0x87870bca…'),
 *     chainId: chainId(1),
 *   },
 *   spoke: evmAddress('0x1234…'),
 *   percentage: bigDecimal('100'),
 * });
 * ```
 *
 * @param client - Aave client.
 * @param request - The migration borrow preview request parameters.
 * @returns The preview of the move on V3 and on the V4 spoke.
 */
export function migrationBorrowPreview(
  client: AaveClient,
  request: MigrationBorrowPreviewRequest,
): ResultAsync<MigrationPreview, UnexpectedError> {
  return client.query(MigrationBorrowPreviewQuery, { request });
}

/**
 * Previews moving an amount of a V3 supply that backs no debt to a V4 spoke,
 * with V3 and V4 before and after.
 *
 * ```ts
 * const result = await migrationEarnPreview(client, {
 *   user: evmAddress('0x742d35cc…'),
 *   market: {
 *     address: evmAddress('0x87870bca…'),
 *     chainId: chainId(1),
 *   },
 *   currency: evmAddress('0xa0b86a33…'),
 *   spoke: evmAddress('0x1234…'),
 *   amount: bigDecimal('1000'),
 *   useAsCollateral: true,
 * });
 * ```
 *
 * @param client - Aave client.
 * @param request - The migration earn preview request parameters.
 * @returns The preview of the move on V3 and on the V4 spoke.
 */
export function migrationEarnPreview(
  client: AaveClient,
  request: MigrationEarnPreviewRequest,
): ResultAsync<MigrationPreview, UnexpectedError> {
  return client.query(MigrationEarnPreviewQuery, { request });
}

/**
 * Creates the transaction that migrates a V3 position to a V4 spoke.
 *
 * It takes two rounds of signatures first: call it, sign what it returns, and
 * call it again with `signed`, until it answers the transaction to send.
 *
 * ```ts
 * const request = {
 *   user: evmAddress('0x742d35cc…'),
 *   market: {
 *     address: evmAddress('0x87870bca…'),
 *     chainId: chainId(1),
 *   },
 *   spoke: evmAddress('0x1234…'),
 *   position: { borrow: { percentage: bigDecimal('100') } },
 * };
 *
 * // 1. Ask for the documents to sign
 * const first = await migratePosition(client, request);
 * // first.value.__typename === 'MigrationSignaturesRequired'
 *
 * // 2. Send the signatures back, in the order they were listed
 * const second = await migratePosition(client, {
 *   ...request,
 *   signed: { plan: first.value.plan, signatures },
 * });
 * // second.value.__typename === 'MigrationSafeSignatureRequired'
 *
 * // 3. Send the Safe signature back to get the transaction
 * const third = await migratePosition(client, {
 *   ...request,
 *   signed: { plan: first.value.plan, signatures, safeSignature },
 * });
 * // third.value.__typename === 'TransactionRequest'
 * ```
 *
 * @param client - Aave client.
 * @param request - The migrate position request parameters.
 * @returns The next step of the migration: documents to sign, or the transaction to send.
 */
export function migratePosition(
  client: AaveClient,
  request: MigratePositionRequest,
): ResultAsync<MigrationExecutionPlan, UnexpectedError> {
  return client.query(MigratePositionQuery, { request });
}
