import { delay, GqlClient, TimeoutError, UnexpectedError } from '@aave/core';
import type { HasProcessedKnownTransactionRequest } from '@aave/graphql';
import { invariant, okAsync, ResultAsync, type TxHash } from '@aave/types';
import { hasProcessedKnownTransaction } from './actions';
import { type ClientConfig, configureContext } from './config';
import {
  isHasProcessedKnownTransactionRequest,
  type TransactionExecutionResult,
} from './types';

export class AaveClient extends GqlClient {
  /**
   * Create a new instance of the {@link AaveClient}.
   *
   * ```ts
   * const client = AaveClient.create({
   *   environment: production,
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
}
