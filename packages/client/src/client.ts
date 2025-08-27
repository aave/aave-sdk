import type {
  HasProcessedKnownTransactionRequest,
  StandardData,
} from '@aave/graphql';
import {
  errAsync,
  invariant,
  okAsync,
  ResultAsync,
  type TxHash,
} from '@aave/types';
import {
  type AnyVariables,
  createClient,
  type Exchange,
  fetchExchange,
  type OperationResult,
  type OperationResultSource,
  type TypedDocumentNode,
  type Client as UrqlClient,
} from '@urql/core';
import { hasProcessedKnownTransaction } from './actions';
import { BatchQueryBuilder } from './batch';
import type { ClientConfig } from './config';
import { type Context, configureContext } from './context';
import { TimeoutError, UnexpectedError } from './errors';
import { Logger, LogLevel } from './logger';
import {
  isHasProcessedKnownTransactionRequest,
  type TransactionExecutionResult,
} from './types';
import { delay } from './utils';

function takeValue<T>({
  data,
  error,
}: OperationResult<StandardData<T> | undefined, AnyVariables>): T {
  invariant(data, `Expected a value, got: ${error?.message}`);
  return data.value;
}

export class AaveClient {
  /**
   * @internal
   */
  public readonly urql: UrqlClient;

  private readonly logger: Logger;

  private constructor(private readonly context: Context) {
    this.logger = Logger.named(
      this.constructor.name,
      context.debug ? LogLevel.DEBUG : LogLevel.SILENT,
    );

    this.urql = createClient({
      url: context.environment.backend,
      fetchOptions: {
        credentials: 'omit',
        headers: context.headers,
      },
      exchanges: this.exchanges(),
    });
  }

  /**
   * Create a new instance of the {@link AaveClient}.
   *
   * ```ts
   * const client = AaveClient.create({
   *   environment: production,
   *   origin: 'http://example.com',
   * });
   * ```
   *
   * @param options - The options to configure the client.
   * @returns The new instance of the client.
   */
  static create(options?: ClientConfig): AaveClient {
    return new AaveClient(configureContext(options ?? {}));
  }

  /**
   * Execute a GraphQL query operation.
   *
   * @param document - The GraphQL document to execute.
   * @param variables - The variables to pass to the operation.
   * @returns The result of the operation.
   */
  public query<TValue, TVariables extends AnyVariables>(
    document: TypedDocumentNode<StandardData<TValue>, TVariables>,
    variables: TVariables,
  ): ResultAsync<TValue, UnexpectedError> {
    const query = this.context.fragments.replaceFrom(document);
    return this.resultFrom(this.urql.query(query, variables)).map(takeValue);
  }

  /**
   * Execute a GraphQL mutation operation.
   *
   * @param document - The GraphQL document to execute.
   * @param variables - The variables to pass to the operation.
   * @returns The result of the operation.
   */
  public mutation<TValue, TVariables extends AnyVariables>(
    document: TypedDocumentNode<StandardData<TValue>, TVariables>,
    variables: TVariables,
  ): ResultAsync<TValue, UnexpectedError> {
    return this.resultFrom(this.urql.mutation(document, variables)).map(
      takeValue,
    );
  }

  // TODO update example below
  /**
   * Execute a batch of GraphQL query operations.
   *
   * @alpha This is an alpha API and may be subject to breaking changes.
   *
   * ```ts
   * const result = await client.batch((c) => [
   *   fetchAccount(c, { address: evmAddress('0x1234…') }).map(nonNullable),
   *   fetchBalancesBulk(c, {
   *     includeNative: true,
   *     tokens: [
   *       evmAddress("0x5678…"),
   *       evmAddress("0x9012…"),
   *     ],
   *   }),
   * ]);
   *
   * // const result: Result<
   * //   [
   * //     Account,
   * //     AnyAccountBalance[],
   * //   ],
   * //   UnauthenticatedError | UnexpectedError
   * // >
   * ```
   *
   * @param cb - The callback with the scoped client to execute the actions with.
   * @returns The results of all queries in the same order as they were added.
   */
  batch<T1, T2, E1 extends Error, E2 extends Error>(
    cb: (client: this) => [ResultAsync<T1, E1>, ResultAsync<T2, E2>],
  ): ResultAsync<[T1, T2], E1 | E2>;
  batch<T1, T2, T3, E1 extends Error, E2 extends Error, E3 extends Error>(
    cb: (
      client: this,
    ) => [ResultAsync<T1, E1>, ResultAsync<T2, E2>, ResultAsync<T3, E3>],
  ): ResultAsync<[T1, T2, T3], E1 | E2 | E3>;
  batch<
    T1,
    T2,
    T3,
    T4,
    E1 extends Error,
    E2 extends Error,
    E3 extends Error,
    E4 extends Error,
  >(
    cb: (
      client: this,
    ) => [
      ResultAsync<T1, E1>,
      ResultAsync<T2, E2>,
      ResultAsync<T3, E3>,
      ResultAsync<T4, E4>,
    ],
  ): ResultAsync<[T1, T2, T3, T4], E1 | E2 | E3 | E4>;
  batch<
    T1,
    T2,
    T3,
    T4,
    T5,
    E1 extends Error,
    E2 extends Error,
    E3 extends Error,
    E4 extends Error,
    E5 extends Error,
  >(
    cb: (
      client: this,
    ) => [
      ResultAsync<T1, E1>,
      ResultAsync<T2, E2>,
      ResultAsync<T3, E3>,
      ResultAsync<T4, E4>,
      ResultAsync<T5, E5>,
    ],
  ): ResultAsync<[T1, T2, T3, T4, T5], E1 | E2 | E3 | E4 | E5>;
  batch<
    T1,
    T2,
    T3,
    T4,
    T5,
    T6,
    E1 extends Error,
    E2 extends Error,
    E3 extends Error,
    E4 extends Error,
    E5 extends Error,
    E6 extends Error,
  >(
    cb: (
      client: this,
    ) => [
      ResultAsync<T1, E1>,
      ResultAsync<T2, E2>,
      ResultAsync<T3, E3>,
      ResultAsync<T4, E4>,
      ResultAsync<T5, E5>,
      ResultAsync<T6, E6>,
    ],
  ): ResultAsync<[T1, T2, T3, T4, T5, T6], E1 | E2 | E3 | E4 | E5 | E6>;
  batch<
    T1,
    T2,
    T3,
    T4,
    T5,
    T6,
    T7,
    E1 extends Error,
    E2 extends Error,
    E3 extends Error,
    E4 extends Error,
    E5 extends Error,
    E6 extends Error,
    E7 extends Error,
  >(
    cb: (
      client: this,
    ) => [
      ResultAsync<T1, E1>,
      ResultAsync<T2, E2>,
      ResultAsync<T3, E3>,
      ResultAsync<T4, E4>,
      ResultAsync<T5, E5>,
      ResultAsync<T6, E6>,
      ResultAsync<T7, E7>,
    ],
  ): ResultAsync<
    [T1, T2, T3, T4, T5, T6, T7],
    E1 | E2 | E3 | E4 | E5 | E6 | E7
  >;
  batch<
    T1,
    T2,
    T3,
    T4,
    T5,
    T6,
    T7,
    T8,
    E1 extends Error,
    E2 extends Error,
    E3 extends Error,
    E4 extends Error,
    E5 extends Error,
    E6 extends Error,
    E7 extends Error,
    E8 extends Error,
  >(
    cb: (
      client: this,
    ) => [
      ResultAsync<T1, E1>,
      ResultAsync<T2, E2>,
      ResultAsync<T3, E3>,
      ResultAsync<T4, E4>,
      ResultAsync<T5, E5>,
      ResultAsync<T6, E6>,
      ResultAsync<T7, E7>,
      ResultAsync<T8, E8>,
    ],
  ): ResultAsync<
    [T1, T2, T3, T4, T5, T6, T7, T8],
    E1 | E2 | E3 | E4 | E5 | E6 | E7 | E8
  >;
  batch<
    T1,
    T2,
    T3,
    T4,
    T5,
    T6,
    T7,
    T8,
    T9,
    E1 extends Error,
    E2 extends Error,
    E3 extends Error,
    E4 extends Error,
    E5 extends Error,
    E6 extends Error,
    E7 extends Error,
    E8 extends Error,
    E9 extends Error,
  >(
    cb: (
      client: this,
    ) => [
      ResultAsync<T1, E1>,
      ResultAsync<T2, E2>,
      ResultAsync<T3, E3>,
      ResultAsync<T4, E4>,
      ResultAsync<T5, E5>,
      ResultAsync<T6, E6>,
      ResultAsync<T7, E7>,
      ResultAsync<T8, E8>,
      ResultAsync<T9, E9>,
    ],
  ): ResultAsync<
    [T1, T2, T3, T4, T5, T6, T7, T8, T9],
    E1 | E2 | E3 | E4 | E5 | E6 | E7 | E8 | E9
  >;
  batch<
    T1,
    T2,
    T3,
    T4,
    T5,
    T6,
    T7,
    T8,
    T9,
    T10,
    E1 extends Error,
    E2 extends Error,
    E3 extends Error,
    E4 extends Error,
    E5 extends Error,
    E6 extends Error,
    E7 extends Error,
    E8 extends Error,
    E9 extends Error,
    E10 extends Error,
  >(
    cb: (
      client: this,
    ) => [
      ResultAsync<T1, E1>,
      ResultAsync<T2, E2>,
      ResultAsync<T3, E3>,
      ResultAsync<T4, E4>,
      ResultAsync<T5, E5>,
      ResultAsync<T6, E6>,
      ResultAsync<T7, E7>,
      ResultAsync<T8, E8>,
      ResultAsync<T9, E9>,
      ResultAsync<T10, E10>,
    ],
  ): ResultAsync<
    [T1, T2, T3, T4, T5, T6, T7, T8, T9, T10],
    E1 | E2 | E3 | E4 | E5 | E6 | E7 | E8 | E9 | E10
  >;
  batch<T, E extends Error>(
    cb: (client: this) => ResultAsync<T, E>[],
  ): ResultAsync<T[], E>;
  batch(
    cb: (client: this) => ResultAsync<unknown[], unknown>[],
  ): ResultAsync<unknown[], unknown> {
    const builder = new BatchQueryBuilder();

    const client: this = Object.create(this, {
      query: {
        value: builder.addQuery,
      },
    });

    const combined = ResultAsync.combine(cb(client));
    const [document, variables] = builder.build();

    const query = this.context.fragments.replaceFrom(document);

    return this.resultFrom(this.urql.query(query, variables))
      .andTee(({ data, error }) => {
        invariant(data, `Expected a value, got: ${error?.message}`);
        builder.resolve(data);
      })
      .andThen(() => combined);
  }

  /**
   * @internal
   */
  readonly waitForSupportedTransaction = (
    result: TransactionExecutionResult,
  ): ResultAsync<TxHash, TimeoutError | UnexpectedError> => {
    if (isHasProcessedKnownTransactionRequest(result)) {
      return this.waitForTransaction(result);
    }
    return okAsync(result.txHash);
  };

  /**
   * Given the transaction hash of an Aave protocol transaction, wait for the transaction to be
   * processed by the Aave v3 API.
   *
   * Returns a {@link TimeoutError} if the transaction is not processed within the expected timeout period.
   *
   * @param result - The transaction execution result to wait for.
   * @returns The transaction hash or a TimeoutError
   */
  readonly waitForTransaction = (
    result: TransactionExecutionResult,
  ): ResultAsync<TxHash, TimeoutError | UnexpectedError> => {
    invariant(
      isHasProcessedKnownTransactionRequest(result),
      `Received a transaction result for an untracked operation. Make sure you're following the instructions in the docs.`,
    );

    return ResultAsync.fromPromise(
      this.pollTransactionStatus(result),
      (err) => {
        if (err instanceof TimeoutError || err instanceof UnexpectedError) {
          return err;
        }
        return UnexpectedError.from(err);
      },
    );
  };

  protected async pollTransactionStatus(
    request: HasProcessedKnownTransactionRequest,
  ): Promise<TxHash> {
    const startedAt = Date.now();

    while (Date.now() - startedAt < this.context.environment.indexingTimeout) {
      const processed = await hasProcessedKnownTransaction(this, request).match(
        (ok) => ok,
        (err) => {
          throw err;
        },
      );

      if (processed) {
        return request.txHash;
      }

      await delay(this.context.environment.pollingInterval);
    }
    throw TimeoutError.from(
      `Timeout waiting for transaction ${request.txHash} to be processed.`,
    );
  }

  protected exchanges(): Exchange[] {
    return [fetchExchange];
  }

  protected resultFrom<TData, TVariables extends AnyVariables>(
    source: OperationResultSource<OperationResult<TData, TVariables>>,
  ): ResultAsync<OperationResult<TData, TVariables>, UnexpectedError> {
    return ResultAsync.fromPromise(source.toPromise(), (err: unknown) => {
      this.logger.error(err);
      console.log(err);
      return UnexpectedError.from(err);
    }).andThen((result) => {
      if (result.error?.networkError) {
        return errAsync(UnexpectedError.from(result.error.networkError));
      }
      return okAsync(result);
    });
  }
}
