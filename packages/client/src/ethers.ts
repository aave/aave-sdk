import type {
  ExecutionPlan,
  InsufficientBalanceError,
  TransactionRequest,
} from '@aave/graphql';
import {
  errAsync,
  invariant,
  nonNullable,
  ResultAsync,
  type TxHash,
  txHash,
} from '@aave/types';
import type { Signer, TransactionResponse } from 'ethers';
import { SigningError, ValidationError } from './errors';
import type { ExecutionPlanHandler } from './types';

async function sendTransaction(
  signer: Signer,
  request: TransactionRequest,
): Promise<TransactionResponse> {
  return signer.sendTransaction({
    to: request.to,
    data: request.data,
    value: request.value,
    from: request.from,
  });
}

/**
 * @internal
 */
export function sendTransactionAndWait(
  signer: Signer,
  request: TransactionRequest,
): ResultAsync<TxHash, SigningError> {
  return ResultAsync.fromPromise(sendTransaction(signer, request), (err) =>
    SigningError.from(err),
  )
    .map((tx) => tx.wait())
    .map((receipt) => txHash(nonNullable(receipt?.hash)));
}

/**
 * Sends transactions using the provided ethers signer.
 *
 * Handles {@link TransactionRequest} by signing and sending, {@link ApprovalRequired} by sending both approval and original transactions, and returns validation errors for {@link InsufficientBalanceError}.
 */
export function sendWith(signer: Signer | undefined): ExecutionPlanHandler {
  return (
    result: ExecutionPlan,
  ): ResultAsync<
    TxHash,
    SigningError | ValidationError<InsufficientBalanceError>
  > => {
    invariant(signer, 'Expected a Signer to handle the operation result.');

    switch (result.__typename) {
      case 'TransactionRequest':
        return sendTransactionAndWait(signer, result);

      case 'ApprovalRequired':
        return sendTransactionAndWait(signer, result.approval).andThen(() =>
          sendTransactionAndWait(signer, result.originalTransaction),
        );

      case 'InsufficientBalanceError':
        return errAsync(ValidationError.fromGqlNode(result));
    }
  };
}
