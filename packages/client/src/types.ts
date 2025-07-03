import type { Transaction, TransactionRequest } from '@aave/graphql';
import type { ResultAsync, TxHash } from '@aave/types';
import type { SigningError } from '../dist';
import type { ValidationError } from './errors';

export type OperationHandler<T extends Transaction = Transaction> = (
  result: T,
) => ResultAsync<
  TxHash,
  SigningError | ValidationError<Exclude<T, TransactionRequest>>
>;
