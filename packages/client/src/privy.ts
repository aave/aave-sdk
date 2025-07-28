import type {
  ExecutionPlan,
  InsufficientBalanceError,
  TransactionRequest,
} from '@aave/graphql';
import { errAsync, ResultAsync, type TxHash, txHash } from '@aave/types';
import type { PrivyClient } from '@privy-io/server-auth';
import { createPublicClient, http } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { SigningError, ValidationError } from './errors';
import type { ExecutionPlanHandler } from './types';
import { supportedChains } from './viem';

async function sendTransaction(
  privy: PrivyClient,
  request: TransactionRequest,
  walletId: string,
): Promise<TxHash> {
  const { hash } = await privy.walletApi.ethereum.sendTransaction({
    walletId,
    caip2: `eip155:${request.chainId}`,
    transaction: {
      from: request.from,
      to: request.to,
      value: `0x${BigInt(request.value).toString(16)}`,
      chainId: request.chainId,
      data: request.data,
    },
  });
  return txHash(hash);
}

/**
 * @internal
 */
function sendTransactionAndWait(
  privy: PrivyClient,
  request: TransactionRequest,
  walletId: string,
): ResultAsync<TxHash, SigningError> {
  // TODO: verify it's on the correct chain, ask to switch if possible
  // TODO: verify if wallet account is correct, switch if possible
  const publicClient = createPublicClient({
    chain: supportedChains[request.chainId],
    transport: http(),
  });

  return ResultAsync.fromPromise(
    sendTransaction(privy, request, walletId),
    (err) => SigningError.from(err),
  ).map(async (hash) =>
    waitForTransactionReceipt(publicClient, {
      hash,
      pollingInterval: 100,
      retryCount: 20,
      retryDelay: 50,
    }),
  );
}

/**
 * Sends transactions using the provided wallet client.
 *
 * Handles {@link TransactionRequest} by signing and sending, {@link ApprovalRequired} by sending both approval and original transactions, and returns validation errors for {@link InsufficientBalanceError}.
 */
export function sendWith(
  privy: PrivyClient,
  walletId: string,
): ExecutionPlanHandler {
  return (
    result: ExecutionPlan,
  ): ResultAsync<
    TxHash,
    SigningError | ValidationError<InsufficientBalanceError>
  > => {
    switch (result.__typename) {
      case 'TransactionRequest':
        return sendTransactionAndWait(privy, result, walletId);

      case 'ApprovalRequired':
        return sendTransactionAndWait(privy, result.approval, walletId).andThen(
          () =>
            sendTransactionAndWait(privy, result.originalTransaction, walletId),
        );

      case 'InsufficientBalanceError':
        return errAsync(ValidationError.fromGqlNode(result));
    }
  };
}
