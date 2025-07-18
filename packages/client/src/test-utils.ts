/// <reference path="../../../vite-env.d.ts" />

import { local, staging } from '@aave/env';
import type { AnyVariables, Reserve } from '@aave/graphql';
import { schema } from '@aave/graphql/test-utils';
import {
  assertOk,
  type BigDecimal,
  bigDecimal,
  chainId,
  type EvmAddress,
  evmAddress,
  nonNullable,
  ResultAsync,
} from '@aave/types';
import type { TypedDocumentNode } from '@urql/core';
import { validate } from 'graphql';
import type { ValidationRule } from 'graphql/validation/ValidationContext';
import {
  createPublicClient,
  createWalletClient,
  defineChain,
  http,
  parseEther,
  parseUnits,
  type WalletClient,
} from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { expect } from 'vitest';
import { reserve } from './actions';
import { AaveClient } from './client';
import { GraphQLErrorCode, UnexpectedError } from './errors';

export const signer = privateKeyToAccount(import.meta.env.PRIVATE_KEY);
export const environment =
  import.meta.env.ENVIRONMENT === 'local' ? local : staging;

export const ETHEREUM_FORK_ID = chainId(99999999);

export const WETH_ADDRESS = evmAddress(
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
);
export const USDC_ADDRESS = evmAddress(
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
);
export const DEFAULT_MARKET_ADDRESS = evmAddress(
  '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
);

export const ETHEREUM_FORK_RPC_URL =
  'https://virtual.mainnet.rpc.tenderly.co/27ff3c60-0e2c-4d46-8190-f5170dc7da8c';

export const ETHEREUM_FORK_RPC_URL_ADMIN =
  'https://virtual.mainnet.rpc.tenderly.co/95925d93-2ca7-4986-8b4f-e606f6b243bd';

// Re-export for convenience
export { bigDecimal } from '@aave/types';

const ethereumForkChain = defineChain({
  id: ETHEREUM_FORK_ID,
  name: 'Ethereum Fork',
  network: 'ethereum-fork',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: [ETHEREUM_FORK_RPC_URL] } },
});

export const client = AaveClient.create({
  environment,
});

export const wallet: WalletClient = createWalletClient({
  account: signer,
  chain: ethereumForkChain,
  transport: http(),
});

export function createNewWallet(): WalletClient {
  const privateKey = generatePrivateKey();
  // Log private key to debug test issues
  console.log(`private key ${privateKey}`);
  const wallet = createWalletClient({
    account: privateKeyToAccount(privateKey),
    chain: ethereumForkChain,
    transport: http(),
  });
  return wallet;
}

// Tenderly RPC type for setBalance
type TSetBalanceRpc = {
  Method: 'tenderly_setBalance';
  Parameters: [addresses: string[], amount: string];
  ReturnType: string;
};

// Tenderly RPC type for set ERC20 balance
type TSetErc20BalanceRpc = {
  Method: 'tenderly_setErc20Balance';
  Parameters: [tokenAddress: string, address: string, amount: string];
  ReturnType: string;
};

export function fundNativeAddress(
  address: EvmAddress,
  amount: BigDecimal = bigDecimal('1.0'), // 1 ETH
): ResultAsync<string, UnexpectedError> {
  // Create client with fork chain - you'll need to replace this with your actual fork chain config
  const publicClient = createPublicClient({
    chain: {
      id: ETHEREUM_FORK_ID,
      name: 'Tenderly Fork',
      network: 'tenderly-fork',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: {
        default: { http: [ETHEREUM_FORK_RPC_URL_ADMIN] },
      },
    },
    transport: http(ETHEREUM_FORK_RPC_URL_ADMIN),
  });

  const amountInWei = parseEther(amount);
  const amountHex = `0x${amountInWei.toString(16)}`;

  return ResultAsync.fromPromise(
    publicClient.request<TSetBalanceRpc>({
      method: 'tenderly_setBalance',
      params: [[address], amountHex],
    }),
    (err) => UnexpectedError.from(err),
  );
}

export function fundErc20Address(
  tokenAddress: EvmAddress,
  address: EvmAddress,
  amount: BigDecimal,
  decimals = 18,
): ResultAsync<string, UnexpectedError> {
  const publicClient = createPublicClient({
    chain: {
      id: ETHEREUM_FORK_ID,
      name: 'Tenderly Fork',
      network: 'tenderly-fork',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: {
        default: { http: [ETHEREUM_FORK_RPC_URL_ADMIN] },
      },
    },
    transport: http(ETHEREUM_FORK_RPC_URL_ADMIN),
  });

  // Convert amount to the smallest unit (e.g., wei for 18 decimals)
  const amountInSmallestUnit = parseUnits(amount, decimals);
  const amountHex = `0x${amountInSmallestUnit.toString(16)}`;

  return ResultAsync.fromPromise(
    publicClient.request<TSetErc20BalanceRpc>({
      method: 'tenderly_setErc20Balance',
      params: [tokenAddress, address, amountHex],
    }),
    (err) => UnexpectedError.from(err),
  );
}

export async function getReserveInfo(
  tokenAddress: EvmAddress,
  marketAddress = DEFAULT_MARKET_ADDRESS,
): Promise<Reserve> {
  const result = await reserve(client, {
    chainId: ETHEREUM_FORK_ID,
    market: marketAddress,
    underlyingToken: tokenAddress,
  }).map(nonNullable);
  assertOk(result);
  return result.value;
}

const messages: Record<GraphQLErrorCode, string> = {
  [GraphQLErrorCode.UNAUTHENTICATED]:
    "Unauthenticated - Authentication is required to access '<operation>'",
  [GraphQLErrorCode.FORBIDDEN]:
    "Forbidden - You are not authorized to access '<operation>'",
  [GraphQLErrorCode.INTERNAL_SERVER_ERROR]:
    'Internal server error - Please try again later',
  [GraphQLErrorCode.BAD_USER_INPUT]:
    'Bad user input - Please check the input and try again',
  [GraphQLErrorCode.BAD_REQUEST]:
    'Bad request - Please check the request and try again',
};

export function createGraphQLErrorObject(code: GraphQLErrorCode) {
  return {
    message: messages[code],
    locations: [],
    path: [],
    extensions: {
      code: code,
    },
  };
}

export function assertTypedDocumentSatisfies<
  TResult,
  TVariables extends AnyVariables,
>(
  document: TypedDocumentNode<TResult, TVariables>,
  rules: ReadonlyArray<ValidationRule>,
) {
  expect(validate(schema, document, rules)).toEqual([]);
}
