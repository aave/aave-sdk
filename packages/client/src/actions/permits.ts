import type { UnexpectedError } from '@aave/core';
import {
  PermitTypedDataQuery,
  type PermitTypedDataRequest,
  type PermitTypedDataResponse,
} from '@aave/graphql';
import type { ResultAsync } from '@aave/types';
import type { AaveClient } from '../AaveClient';

/**
 * Generates EIP-712 typed data for ERC-20 permit signature.
 *
 * ```ts
 * const result = await permitTypedData(client, {
 *   market: evmAddress('0x87870bca...'),
 *   underlyingToken: evmAddress('0xa0b86a33...'),
 *   amount: '1.5',
 *   chainId: chainId(1),
 *   spender: evmAddress('0x123...'),
 *   owner: evmAddress('0x456...'),
 * });
 *
 * if (result.isOk()) {
 *   const typedData = result.value;
 *   // Use typedData for permit signing
 * }
 * ```
 *
 * @param client - Aave client.
 * @param request - The permit typed data request parameters.
 * @returns The EIP-712 typed data for permit signature.
 */
export function permitTypedData(
  client: AaveClient,
  request: PermitTypedDataRequest,
): ResultAsync<PermitTypedDataResponse, UnexpectedError> {
  return client.query(PermitTypedDataQuery, { request });
}
