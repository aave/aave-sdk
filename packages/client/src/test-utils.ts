/// <reference path="../../../vite-env.d.ts" />

import { local, staging } from '@aave/env';
import type { AnyVariables } from '@aave/graphql';
import { schema } from '@aave/graphql/test-utils';
import {
  type BigDecimal,
  bigDecimal,
  chainId,
  type EvmAddress,
} from '@aave/types';
import type { TypedDocumentNode } from '@urql/core';
import { validate } from 'graphql';
import type { ValidationRule } from 'graphql/validation/ValidationContext';
import {
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
  type WalletClient,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { expect } from 'vitest';
import { AaveClient } from './client';
import { GraphQLErrorCode } from './errors';

export const signer = privateKeyToAccount(import.meta.env.PRIVATE_KEY);
export const environment =
  import.meta.env.ENVIRONMENT === 'local' ? local : staging;

export const ETHEREUM_FORK_ID = chainId(99999999);

export const ETHEREUM_FORK_RPC_URL =
  'https://virtual.mainnet.rpc.tenderly.co/27ff3c60-0e2c-4d46-8190-f5170dc7da8c';

// Re-export for convenience
export { bigDecimal } from '@aave/types';

export const client = AaveClient.create({
  environment,
});

export const wallet: WalletClient = createWalletClient({
  account: signer,
  chain: sepolia,
  transport: http(),
});

// Tenderly RPC type for setBalance
type TSetBalanceRpc = {
  Method: 'tenderly_setBalance';
  Parameters: [addresses: string[], amount: string];
  ReturnType: string;
};

/**
 * Fund an address on Tenderly fork with specified ETH amount
 * @param address - Address to fund
 * @param amount - Amount in ETH (BigDecimal string, e.g., "1.5" for 1.5 ETH)
 * @returns Transaction hash
 */
export async function fundAddress(
  address: EvmAddress,
  amount: BigDecimal = bigDecimal('1.0'), // 1 ETH
): Promise<string> {
  // Create client with fork chain - you'll need to replace this with your actual fork chain config
  const publicClient = createPublicClient({
    chain: {
      id: ETHEREUM_FORK_ID,
      name: 'Tenderly Fork',
      network: 'tenderly-fork',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: {
        default: { http: [ETHEREUM_FORK_RPC_URL] },
      },
    },
    transport: http(ETHEREUM_FORK_RPC_URL),
  });

  const amountInWei = parseEther(amount);
  const amountHex = `0x${amountInWei.toString(16)}`;

  const txHash = await publicClient.request<TSetBalanceRpc>({
    method: 'tenderly_setBalance',
    params: [[address], amountHex],
  });

  return txHash;
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
