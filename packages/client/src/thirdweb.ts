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
  type Signature,
  signatureFrom,
  type TxHash,
  txHash,
} from '@aave/types';
import {
  defineChain,
  Engine,
  type ThirdwebClient,
  waitForReceipt,
} from 'thirdweb';
import { SigningError, TransactionError, ValidationError } from './errors';
import type {
  ExecutionPlanHandler,
  PermitHandler,
  TransactionExecutionResult,
} from './types';

async function sendTransaction(
  wallet: Engine.ServerWallet,
  request: TransactionRequest,
): Promise<TxHash> {
  const txResponse = await wallet.sendTransaction({
    type: 'eip1559',
    chainId: request.chainId,
    to: request.to,
    value: BigInt(request.value),
    data: request.data,
  });
  return txHash(txResponse.transactionHash);
}

function sendTransactionAndWait(
  client: ThirdwebClient,
  request: TransactionRequest,
): ResultAsync<TransactionExecutionResult, SigningError | TransactionError> {
  const wallet = Engine.serverWallet({
    client,
    address: request.from,
  });

  return ResultAsync.fromPromise(sendTransaction(wallet, request), (err) =>
    SigningError.from(err),
  )
    .map(async (hash) =>
      waitForReceipt({
        client,
        chain: request.chainId,
        transactionHash: hash,
      }),
    )
    .andThen((receipt) => {
      const hash = txHash(receipt.transactionHash);

      if (receipt.status === 'reverted') {
        return errAsync(
          new TransactionError(`Transaction failed: ${hash}`, request),
        );
      }
      return okAsync({
        txHash: hash,
        operation: request.operation,
      });
    });
}

/**
 * Sends transactions using the provided Thirdweb client and account.
 *
 * Handles {@link TransactionRequest} by signing and sending, {@link ApprovalRequired} by sending both approval and original transactions, and returns validation errors for {@link InsufficientBalanceError}.
 */
export function sendWith(client: ThirdwebClient): ExecutionPlanHandler {
  return (
    result: ExecutionPlan,
  ): ResultAsync<
    TransactionExecutionResult,
    SigningError | TransactionError | ValidationError<InsufficientBalanceError>
  > => {
    switch (result.__typename) {
      case 'TransactionRequest':
        return sendTransactionAndWait(client, result);

      case 'ApprovalRequired':
        return sendTransactionAndWait(client, result.approval).andThen(() =>
          sendTransactionAndWait(client, result.originalTransaction),
        );

      case 'InsufficientBalanceError':
        return errAsync(ValidationError.fromGqlNode(result));
    }
  };
}

async function signTypedData(
  client: ThirdwebClient,
  result: PermitTypedDataResponse,
): Promise<Signature> {
  const wallet = Engine.serverWallet({
    client,
    chain: defineChain({ id: result.domain.chainId }),
    address: result.message.owner,
  });

  const signature = await wallet.signTypedData({
    // silence the rest of the type inference
    types: result.types as Record<string, unknown>,
    domain: result.domain,
    primaryType: result.primaryType,
    message: result.message,
  });

  return signatureFrom(signature);
}

/**
 * Signs an ERC20 permit using the provided Thirdweb client and account.
 */
export function signERC20PermitWith(client: ThirdwebClient): PermitHandler {
  return (result: PermitTypedDataResponse) => {
    return ResultAsync.fromPromise(signTypedData(client, result), (err) =>
      SigningError.from(err),
    ).map((value) => ({
      deadline: result.message.deadline,
      value,
    }));
  };
}
