import {
  type BigIntString,
  type BlockchainData,
  type ChainId,
  type EvmAddress,
  ResultAwareError,
  type TxHash,
  type TypedSelectionSet,
} from '@aave/types';
import type { CombinedError } from '@urql/core';

/**
 * @internal
 */
export enum GraphQLErrorCode {
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  FORBIDDEN = 'FORBIDDEN',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  BAD_USER_INPUT = 'BAD_USER_INPUT',
  BAD_REQUEST = 'BAD_REQUEST',
}
/**
 * @internal
 */
export function hasExtensionCode(
  error: CombinedError,
  code: GraphQLErrorCode,
): boolean {
  return error.graphQLErrors.some((gqlError) => {
    return gqlError.extensions?.code === code;
  });
}

/**
 * Error indicating an unexpected condition occurred.
 */
export class UnexpectedError extends ResultAwareError {
  name = 'UnexpectedError' as const;
}

/**
 * Error indicating an error occurred while signing.
 */
export class SigningError extends ResultAwareError {
  name = 'SigningError' as const;
}

export type UnsignedTransactionRequest = {
  to: EvmAddress;
  from: EvmAddress;
  data: BlockchainData;
  value: BigIntString;
  chainId: ChainId;
};

export type TransactionErrorArgs = {
  txHash: TxHash;
  request: UnsignedTransactionRequest;
  link?: string;
};

/**
 * Error indicating a transaction failed.
 */
export class TransactionError extends ResultAwareError {
  name = 'TransactionError' as const;

  protected constructor(message: string, cause: UnsignedTransactionRequest) {
    super(message, { cause });
  }

  static new(args: TransactionErrorArgs) {
    const { txHash, request, link } = args;
    const message = link
      ? `Transaction failed: ${txHash}\n→ View on explorer: ${link}`
      : `Transaction failed: ${txHash}`;
    return new TransactionError(message, request);
  }
}

/**
 * Error indicating a timeout occurred.
 */
export class TimeoutError extends ResultAwareError {
  name = 'TimeoutError' as const;
}

/**
 * Error indicating an operation was not executed due to a validation error.
 * See the `cause` property for more information.
 */
export class ValidationError<
  TGqlNode extends TypedSelectionSet,
> extends ResultAwareError {
  name = 'ValidationError' as const;

  constructor(public readonly cause: TGqlNode) {
    super(cause.__typename);
  }

  static fromGqlNode<TGqlNode extends TypedSelectionSet>(
    error: TGqlNode,
  ): ValidationError<TGqlNode> {
    return new ValidationError(error);
  }
}
