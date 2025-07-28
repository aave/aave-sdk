import type {
  ExecutionPlan,
  InsufficientBalanceError,
  TransactionRequest,
} from '@aave/graphql';
import {
  type ChainId,
  chainId,
  errAsync,
  ResultAsync,
  type TxHash,
  txHash,
} from '@aave/types';
import { type Chain, defineChain, type Hash, type WalletClient } from 'viem';
import {
  sendTransaction as sendEip1559Transaction,
  waitForTransactionReceipt,
} from 'viem/actions';
// chains.ts
import {
  arbitrum,
  avalanche,
  base,
  bsc,
  celo,
  gnosis,
  linea,
  mainnet,
  mantle,
  metis,
  optimism,
  polygon,
  scroll,
  zksync,
} from 'viem/chains';
import { SigningError, ValidationError } from './errors';
import type { ExecutionPlanHandler } from './types';

// Other chains
const sonic: Chain = defineChain({
  id: 146,
  name: 'Sonic',
  nativeCurrency: { name: 'Sonic', symbol: 'S', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://sonicscan.org'], // Replace with actual RPC URL if needed
    },
  },
  blockExplorers: {
    default: {
      name: 'SonicScan',
      url: 'https://sonicscan.org',
    },
  },
});

const soneium: Chain = defineChain({
  id: 1868,
  name: 'Soneium',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://soneium.blockscout.com'], // Replace with actual RPC URL if needed
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://soneium.blockscout.com',
    },
  },
});

/**
 * @internal
 */
export const ethereumForkChain: Chain = /*#__PURE__*/ defineChain({
  id: chainId(99999999),
  name: 'Ethereum Fork',
  network: 'ethereum-fork',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        'https://virtual.mainnet.rpc.tenderly.co/27ff3c60-0e2c-4d46-8190-f5170dc7da8c',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Ethereum Fork Explorer',
      url: 'https://dashboard.tenderly.co/explorer/vnet/27ff3c60-0e2c-4d46-8190-f5170dc7da8c/transactions',
    },
  },
});

/**
 * @internal
 */
export const supportedChains: Record<
  ChainId,
  ReturnType<typeof defineChain>
> = {
  [chainId(mainnet.id)]: mainnet,
  [chainId(arbitrum.id)]: arbitrum,
  [chainId(avalanche.id)]: avalanche,
  [chainId(base.id)]: base,
  [chainId(bsc.id)]: bsc,
  [chainId(celo.id)]: celo,
  [chainId(gnosis.id)]: gnosis,
  [chainId(linea.id)]: linea,
  [chainId(metis.id)]: metis,
  [chainId(optimism.id)]: optimism,
  [chainId(polygon.id)]: polygon,
  [chainId(scroll.id)]: scroll,
  [chainId(zksync.id)]: zksync,
  [chainId(mantle.id)]: mantle,
  [chainId(sonic.id)]: sonic,
  [chainId(soneium.id)]: soneium,
  [chainId(ethereumForkChain.id)]: ethereumForkChain,
};

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
export function sendWith(walletClient: WalletClient): ExecutionPlanHandler {
  return (
    result: ExecutionPlan,
  ): ResultAsync<
    TxHash,
    SigningError | ValidationError<InsufficientBalanceError>
  > => {
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
