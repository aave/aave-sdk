import type { UnexpectedError } from '@aave/client';
import { migratePosition } from '@aave/client/actions';
import type {
  MigratePositionRequest,
  MigrationBorrowPreviewRequest,
  MigrationEarnPreviewRequest,
  MigrationExecutionPlan,
  MigrationOpportunitiesRequest,
  MigrationOpportunity,
  MigrationPreview,
} from '@aave/graphql';
import {
  MigrationBorrowPreviewQuery,
  MigrationEarnPreviewQuery,
  MigrationOpportunitiesQuery,
} from '@aave/graphql';
import { useAaveClient } from './context';
import type {
  ReadResult,
  Suspendable,
  SuspendableResult,
  SuspenseResult,
} from './helpers';
import {
  type UseAsyncTask,
  useAsyncTask,
  useSuspendableQuery,
} from './helpers';

export type UseMigrationOpportunitiesArgs = MigrationOpportunitiesRequest;

/**
 * Fetches the user's V3 positions that could migrate to V4, each with the spokes
 * it could move to and what moving all of it would change.
 *
 * This signature supports React Suspense:
 *
 * ```tsx
 * const { data } = useMigrationOpportunities({
 *   markets: [{ address: evmAddress('0x87870bca…'), chainId: chainId(1) }],
 *   user: evmAddress('0x742d35cc…'),
 *   suspense: true,
 * });
 * ```
 */
export function useMigrationOpportunities(
  args: UseMigrationOpportunitiesArgs & Suspendable,
): SuspenseResult<MigrationOpportunity[]>;

/**
 * Fetches the user's V3 positions that could migrate to V4, each with the spokes
 * it could move to and what moving all of it would change.
 *
 * ```tsx
 * const { data, error, loading } = useMigrationOpportunities({
 *   markets: [{ address: evmAddress('0x87870bca…'), chainId: chainId(1) }],
 *   user: evmAddress('0x742d35cc…'),
 * });
 * ```
 */
export function useMigrationOpportunities(
  args: UseMigrationOpportunitiesArgs,
): ReadResult<MigrationOpportunity[]>;

export function useMigrationOpportunities({
  suspense = false,
  ...request
}: UseMigrationOpportunitiesArgs & {
  suspense?: boolean;
}): SuspendableResult<MigrationOpportunity[]> {
  return useSuspendableQuery({
    document: MigrationOpportunitiesQuery,
    variables: { request },
    suspense,
  });
}

export type UseMigrationBorrowPreviewArgs = MigrationBorrowPreviewRequest;

/**
 * Previews moving a percentage of a V3 borrow position to a V4 spoke.
 *
 * This signature supports React Suspense:
 *
 * ```tsx
 * const { data } = useMigrationBorrowPreview({
 *   user: evmAddress('0x742d35cc…'),
 *   market: { address: evmAddress('0x87870bca…'), chainId: chainId(1) },
 *   spoke: evmAddress('0x1234…'),
 *   percentage: bigDecimal('100'),
 *   suspense: true,
 * });
 * ```
 */
export function useMigrationBorrowPreview(
  args: UseMigrationBorrowPreviewArgs & Suspendable,
): SuspenseResult<MigrationPreview>;

/**
 * Previews moving a percentage of a V3 borrow position to a V4 spoke.
 *
 * ```tsx
 * const { data, error, loading } = useMigrationBorrowPreview({
 *   user: evmAddress('0x742d35cc…'),
 *   market: { address: evmAddress('0x87870bca…'), chainId: chainId(1) },
 *   spoke: evmAddress('0x1234…'),
 *   percentage: bigDecimal('100'),
 * });
 * ```
 */
export function useMigrationBorrowPreview(
  args: UseMigrationBorrowPreviewArgs,
): ReadResult<MigrationPreview>;

export function useMigrationBorrowPreview({
  suspense = false,
  ...request
}: UseMigrationBorrowPreviewArgs & {
  suspense?: boolean;
}): SuspendableResult<MigrationPreview> {
  return useSuspendableQuery({
    document: MigrationBorrowPreviewQuery,
    variables: { request },
    suspense,
  });
}

export type UseMigrationEarnPreviewArgs = MigrationEarnPreviewRequest;

/**
 * Previews moving an amount of a V3 supply that backs no debt to a V4 spoke.
 *
 * This signature supports React Suspense:
 *
 * ```tsx
 * const { data } = useMigrationEarnPreview({
 *   user: evmAddress('0x742d35cc…'),
 *   market: { address: evmAddress('0x87870bca…'), chainId: chainId(1) },
 *   currency: evmAddress('0xa0b86a33…'),
 *   spoke: evmAddress('0x1234…'),
 *   amount: bigDecimal('1000'),
 *   useAsCollateral: true,
 *   suspense: true,
 * });
 * ```
 */
export function useMigrationEarnPreview(
  args: UseMigrationEarnPreviewArgs & Suspendable,
): SuspenseResult<MigrationPreview>;

/**
 * Previews moving an amount of a V3 supply that backs no debt to a V4 spoke.
 *
 * ```tsx
 * const { data, error, loading } = useMigrationEarnPreview({
 *   user: evmAddress('0x742d35cc…'),
 *   market: { address: evmAddress('0x87870bca…'), chainId: chainId(1) },
 *   currency: evmAddress('0xa0b86a33…'),
 *   spoke: evmAddress('0x1234…'),
 *   amount: bigDecimal('1000'),
 *   useAsCollateral: true,
 * });
 * ```
 */
export function useMigrationEarnPreview(
  args: UseMigrationEarnPreviewArgs,
): ReadResult<MigrationPreview>;

export function useMigrationEarnPreview({
  suspense = false,
  ...request
}: UseMigrationEarnPreviewArgs & {
  suspense?: boolean;
}): SuspendableResult<MigrationPreview> {
  return useSuspendableQuery({
    document: MigrationEarnPreviewQuery,
    variables: { request },
    suspense,
  });
}

/**
 * A hook that provides a way to migrate a V3 position to a V4 spoke.
 *
 * The migration takes two rounds of signatures before the transaction: call it,
 * sign what it returns, and call it again with `signed`, until it answers the
 * transaction to send.
 *
 * ```ts
 * const [migrate, migrating] = useMigratePosition();
 * const [sendTransaction, sending] = useSendTransaction(wallet);
 *
 * const request = {
 *   user: evmAddress('0x742d35cc…'),
 *   market: { address: evmAddress('0x87870bca…'), chainId: chainId(1) },
 *   spoke: evmAddress('0x1234…'),
 *   position: { borrow: { percentage: bigDecimal('100') } },
 * };
 *
 * const result = await migrate(request);
 *
 * if (result.isErr()) {
 *   console.error(result.error);
 *   return;
 * }
 *
 * switch (result.value.__typename) {
 *   case 'MigrationSignaturesRequired':
 *     // sign every `result.value.signatures[n].typedData`, then call
 *     // migrate({ ...request, signed: { plan: result.value.plan, signatures } })
 *     break;
 *
 *   case 'MigrationSafeSignatureRequired':
 *     // sign `result.value.typedData`, then call
 *     // migrate({ ...request, signed: { plan, signatures, safeSignature } })
 *     break;
 *
 *   case 'TransactionRequest':
 *     await sendTransaction(result.value);
 *     break;
 * }
 * ```
 */
export function useMigratePosition(): UseAsyncTask<
  MigratePositionRequest,
  MigrationExecutionPlan,
  UnexpectedError
> {
  const client = useAaveClient();

  return useAsyncTask((request: MigratePositionRequest) =>
    migratePosition(client, request),
  );
}
