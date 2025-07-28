import type { ExecutionPlan, InsufficientBalanceError } from '@aave/graphql';
import type { ResultAsync, TxHash } from '@aave/types';
import type { SigningError, TransactionError, ValidationError } from './errors';

export type ExecutionPlanHandler<T extends ExecutionPlan = ExecutionPlan> = (
  result: T,
) => ResultAsync<
  TxHash,
  SigningError | TransactionError | ValidationError<InsufficientBalanceError>
>;
