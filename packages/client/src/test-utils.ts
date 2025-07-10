/// <reference path="../../../vite-env.d.ts" />

import { local, staging } from '@aave/env';
import type { AnyVariables } from '@aave/graphql';
import { schema } from '@aave/graphql/test-utils';
import { chainId } from '@aave/types';
import type { TypedDocumentNode } from '@urql/core';
import { validate } from 'graphql';
import type { ValidationRule } from 'graphql/validation/ValidationContext';
import { createWalletClient, http, type WalletClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { expect } from 'vitest';
import { AaveClient } from './client';
import { GraphQLErrorCode } from './errors';

export const signer = privateKeyToAccount(import.meta.env.PRIVATE_KEY);
export const environment =
  import.meta.env.ENVIRONMENT === 'local' ? local : staging;

export const tenderlyFork = chainId(99999999);

export const client = AaveClient.create({
  environment,
});

export const wallet: WalletClient = createWalletClient({
  account: signer,
  chain: sepolia,
  transport: http(),
});

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
