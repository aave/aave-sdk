import type {
  ERC712Signature,
  ExecutionPlan,
  HasProcessedKnownTransactionRequest,
  InsufficientBalanceError,
  OperationType,
  PermitTypedDataResponse,
} from '@aave/graphql';
import type { ResultAsync, TxHash } from '@aave/types';
import type { TestAnnotation } from 'vitest';
import type { SigningError, TransactionError, ValidationError } from './errors';

export type TransactionExecutionResult = {
  txHash: TxHash;
  operation: OperationType | null;
};

export type Annotate = {
  (
    message: string,
    type?: string,
    attachment?: TestAnnotation['attachment'],
  ): Promise<TestAnnotation>;
  (
    message: string,
    attachment?: TestAnnotation['attachment'],
  ): Promise<TestAnnotation>;
};

/**
 * @internal
 */
export function isHasProcessedKnownTransactionRequest(
  result: TransactionExecutionResult,
): result is HasProcessedKnownTransactionRequest {
  return result.operation !== null;
}

export type ExecutionPlanHandler<T extends ExecutionPlan = ExecutionPlan> = (
  result: T,
) => ResultAsync<
  TransactionExecutionResult,
  SigningError | TransactionError | ValidationError<InsufficientBalanceError>
>;

export type PermitHandler = (
  result: PermitTypedDataResponse,
) => ResultAsync<ERC712Signature, SigningError>;
