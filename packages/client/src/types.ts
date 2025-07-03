import type { ExecutionPlan, TransactionRequest } from '@aave/graphql';
import type { ResultAsync, TxHash } from '@aave/types';
import type { SigningError, ValidationError } from './errors';

export type OperationHandler<T extends ExecutionPlan = ExecutionPlan> = (
  result: T,
) => ResultAsync<
  TxHash,
  SigningError | ValidationError<Exclude<T, TransactionRequest>>
>;
