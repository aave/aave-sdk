/// <reference path="../../../vite-env.d.ts" />

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
  type Chain,
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
import { local, staging } from './environments';
import { GraphQLErrorCode, UnexpectedError } from './errors';

export const environment =
  import.meta.env.ENVIRONMENT === 'local' ? local : staging;

export const ETHEREUM_FORK_ID = chainId(
  Number.parseInt(import.meta.env.ETHEREUM_TENDERLY_FORK_ID),
);

export const ETHEREUM_WETH_ADDRESS = evmAddress(
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
);
export const ETHEREUM_USDC_ADDRESS = evmAddress(
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
);
export const ETHEREUM_DAI_ADDRESS = evmAddress(
  '0x6B175474E89094C44Da98b954EedeAC495271d0F',
);
export const ETHEREUM_MARKET_ADDRESS = evmAddress(
  '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
);
export const ETHEREUM_MARKET_ETH_CORRELATED_EMODE_CATEGORY = 1;

const ETHEREUM_FORK_RPC_URL = import.meta.env.ETHEREUM_TENDERLY_PUBLIC_RPC;

const ETHEREUM_FORK_RPC_URL_ADMIN = import.meta.env.ETHEREUM_TENDERLY_ADMIN_RPC;

// Re-export for convenience
export { bigDecimal } from '@aave/types';

export const ethereumForkChain: Chain = defineChain({
  id: chainId(99999999),
  name: 'Ethereum Fork',
  network: 'ethereum-fork',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: [ETHEREUM_FORK_RPC_URL],
    },
  },
  blockExplorers: {
    default: {
      name: 'Ethereum Fork Explorer',
      url: import.meta.env.ETHEREUM_TENDERLY_BLOCKEXPLORER,
    },
  },
});

export const client = AaveClient.create({
  environment,
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
  console.log(`wallet address ${wallet.account.address}`);
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

export async function fetchReserve(
  tokenAddress: EvmAddress,
  user?: EvmAddress,
): Promise<Reserve> {
  const result = await reserve(client, {
    chainId: ETHEREUM_FORK_ID,
    market: ETHEREUM_MARKET_ADDRESS,
    underlyingToken: tokenAddress,
    user: user,
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

export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Function to get balance ERC20 token
export async function getBalance(
  address: EvmAddress,
  tokenAddress: EvmAddress,
): Promise<number> {
  const publicClient = createPublicClient({
    chain: ethereumForkChain,
    transport: http(ETHEREUM_FORK_RPC_URL),
  });

  const [balance, decimals] = await Promise.all([
    publicClient.readContract({
      address: tokenAddress,
      abi: [
        {
          inputs: [
            { internalType: 'address', name: 'account', type: 'address' },
          ],
          name: 'balanceOf',
          outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function',
        },
      ] as const,
      functionName: 'balanceOf',
      args: [address],
    }),
    publicClient.readContract({
      address: tokenAddress,
      abi: [
        {
          inputs: [],
          name: 'decimals',
          outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
          stateMutability: 'pure',
          type: 'function',
        },
      ] as const,
      functionName: 'decimals',
    }),
  ]);

  return Number.parseFloat(
    (Number(balance) / 10 ** Number(decimals)).toFixed(decimals),
  );
}
