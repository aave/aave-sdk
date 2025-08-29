import type {
  ExecutionPlan,
  InsufficientBalanceError,
  PermitTypedDataResponse,
  TransactionRequest,
} from '@aave/graphql';
import {
  errAsync,
  nonNullable,
  okAsync,
  ResultAsync,
  signatureFrom,
  txHash,
} from '@aave/types';
import type { Signer, TransactionResponse } from 'ethers';
import { SigningError, TransactionError, ValidationError } from './errors';
import type {
  ExecutionPlanHandler,
  PermitHandler,
  TransactionExecutionResult,
} from './types';

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
): ResultAsync<TransactionExecutionResult, SigningError | TransactionError> {
  return ResultAsync.fromPromise(sendTransaction(signer, request), (err) =>
    SigningError.from(err),
  )
    .map((tx) => tx.wait())
    .andThen((receipt) => {
      const hash = txHash(nonNullable(receipt?.hash));

      if (receipt?.status === 0) {
        return errAsync(
          TransactionError.new({
            txHash: hash,
            request,
          }),
        );
      }
      return okAsync({
        txHash: hash,
        operation: request.operation,
      });
    });
}

/**
 * Sends transactions using the provided ethers signer.
 *
 * Handles {@link TransactionRequest} by signing and sending, {@link ApprovalRequired} by sending both approval and original transactions, and returns validation errors for {@link InsufficientBalanceError}.
 */
export function sendWith(signer: Signer): ExecutionPlanHandler {
  return (
    result: ExecutionPlan,
  ): ResultAsync<
    TransactionExecutionResult,
    SigningError | TransactionError | ValidationError<InsufficientBalanceError>
  > => {
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

/**
 * Signs an ERC20 permit using the provided ethers signer.
 */
export function signERC20PermitWith(signer: Signer): PermitHandler {
  return (result: PermitTypedDataResponse) => {
    return ResultAsync.fromPromise(
      signer.signTypedData(result.domain, result.types, result.message),
      (err) => SigningError.from(err),
    ).map((signature) => ({
      deadline: result.message.deadline,
      value: signatureFrom(signature),
    }));
  };
}
