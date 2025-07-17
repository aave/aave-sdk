import type {
  ExecutionPlan,
  InsufficientBalanceError,
  TransactionRequest,
} from '@aave/graphql';
import {
  errAsync,
  invariant,
  ResultAsync,
  type TxHash,
  txHash,
} from '@aave/types';
import type { Hash, WalletClient } from 'viem';
import {
  sendTransaction as sendEip1559Transaction,
  waitForTransactionReceipt,
} from 'viem/actions';
import { SigningError, ValidationError } from './errors';
import type { ExecutionPlanHandler } from './types';

async function sendTransaction(
  walletClient: WalletClient,
  request: TransactionRequest,
): Promise<Hash> {
  return sendEip1559Transaction(walletClient, {
    account: request.from,
    data: request.data,
    to: request.to,
    value: BigInt(request.value),
    chain: walletClient.chain,
  });
}

/**
 * @internal
 */
export function sendTransactionAndWait(
  walletClient: WalletClient,
  request: TransactionRequest,
): ResultAsync<TxHash, SigningError> {
  // TODO: verify it's on the correct chain, ask to switch if possible
  // TODO: verify if wallet account is correct, switch if possible

  return ResultAsync.fromPromise(
    sendTransaction(walletClient, request),
    (err) => SigningError.from(err),
  )
    .map(async (hash) =>
      waitForTransactionReceipt(walletClient, {
        hash,
        pollingInterval: 100,
        retryCount: 20,
        retryDelay: 50,
      }),
    )
    .map((receipt) => txHash(receipt.transactionHash));
}

/**
 * Sends transactions using the provided wallet client.
 *
 * Handles {@link TransactionRequest} by signing and sending, {@link ApprovalRequired} by sending both approval and original transactions, and returns validation errors for {@link InsufficientBalanceError}.
 */
export function sendWith(
  walletClient: WalletClient | undefined,
): ExecutionPlanHandler {
  return (
    result: ExecutionPlan,
  ): ResultAsync<
    TxHash,
    SigningError | ValidationError<InsufficientBalanceError>
  > => {
    invariant(
      walletClient,
      'Expected a WalletClient to handle the operation result.',
    );

    switch (result.__typename) {
      case 'TransactionRequest':
        return sendTransactionAndWait(walletClient, result);

      case 'ApprovalRequired':
        return sendTransactionAndWait(walletClient, result.approval).andThen(
          () =>
            sendTransactionAndWait(walletClient, result.originalTransaction),
        );

      case 'InsufficientBalanceError':
        return errAsync(ValidationError.fromGqlNode(result));
    }
  };
}
