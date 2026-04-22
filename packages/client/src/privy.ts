import {
  SigningError,
  type TransactionError,
  ValidationError,
} from '@aave/core';
import type {
  ExecutionPlan,
  InsufficientBalanceError,
  PermitTypedDataResponse,
  TransactionRequest,
} from '@aave/graphql';
import {
  errAsync,
  okAsync,
  ResultAsync,
  signatureFrom,
  type TxHash,
  txHash,
} from '@aave/types';
import type { PrivyClient } from '@privy-io/server-auth';
import { createPublicClient, http } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import type {
  ExecutionPlanHandler,
  PermitHandler,
  TransactionExecutionResult,
} from './types';
import { supportedChains, transactionError } from './viem';

function debugLog(message: string, data?: Record<string, unknown>) {
  const payload = data ? ` ${JSON.stringify(data)}` : '';
  console.log(`[privy] ${message}${payload}`);
}

async function sendTransaction(
  privy: PrivyClient,
  request: TransactionRequest,
  walletId: string,
): Promise<TxHash> {
  debugLog('sendTransaction:start', {
    walletId,
    chainId: request.chainId,
    from: request.from,
    to: request.to,
    operation: request.operation,
  });
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
  debugLog('sendTransaction:success', {
    walletId,
    chainId: request.chainId,
    hash,
  });
  return txHash(hash);
}

function sendTransactionAndWait(
  privy: PrivyClient,
  request: TransactionRequest,
  walletId: string,
): ResultAsync<TransactionExecutionResult, SigningError | TransactionError> {
  // TODO: verify it's on the correct chain, ask to switch if possible
  // TODO: verify if wallet account is correct, switch if possible
  const publicClient = createPublicClient({
    chain: supportedChains[request.chainId],
    transport: http(),
  });

  return ResultAsync.fromPromise(
    sendTransaction(privy, request, walletId),
    (err) => {
      debugLog('sendTransaction:error', {
        walletId,
        chainId: request.chainId,
        message: err instanceof Error ? err.message : String(err),
      });
      return SigningError.from(err);
    },
  )
    .map(async (hash) => {
      debugLog('waitForTransactionReceipt:start', {
        walletId,
        chainId: request.chainId,
        hash,
      });
      const receipt = await waitForTransactionReceipt(publicClient, {
        hash,
        pollingInterval: 100,
        retryCount: 20,
        retryDelay: 50,
      });
      debugLog('waitForTransactionReceipt:success', {
        walletId,
        chainId: request.chainId,
        hash,
        status: receipt.status,
      });
      return receipt;
    })
    .andThen((receipt) => {
      const hash = txHash(receipt.transactionHash);

      if (receipt.status === 'reverted') {
        debugLog('transaction:reverted', {
          walletId,
          chainId: request.chainId,
          hash,
        });
        return errAsync(
          transactionError(supportedChains[request.chainId], hash, request),
        );
      }
      debugLog('transaction:confirmed', {
        walletId,
        chainId: request.chainId,
        hash,
        operation: request.operation,
      });
      return okAsync({
        txHash: hash,
        operation: request.operation,
      });
    });
}

/**
 * Sends transactions using the provided Privy client.
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
    TransactionExecutionResult,
    SigningError | TransactionError | ValidationError<InsufficientBalanceError>
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

/**
 * Signs an ERC20 permit using the provided Privy client.
 */
export function signERC20PermitWith(
  privy: PrivyClient,
  walletId: string,
): PermitHandler {
  return (result: PermitTypedDataResponse) => {
    debugLog('signTypedData:start', {
      walletId,
      primaryType: result.primaryType,
    });
    return ResultAsync.fromPromise(
      privy.walletApi.ethereum.signTypedData({
        walletId,
        typedData: {
          domain: result.domain,
          types: result.types,
          message: result.message,
          primaryType: result.primaryType,
        },
      }),
      (err) => {
        debugLog('signTypedData:error', {
          walletId,
          message: err instanceof Error ? err.message : String(err),
        });
        return SigningError.from(err);
      },
    ).map((response) => {
      debugLog('signTypedData:success', {
        walletId,
      });
      return {
        deadline: result.message.deadline,
        value: signatureFrom(response.signature),
      };
    });
  };
}
