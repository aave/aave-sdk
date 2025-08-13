import { MeritClaimQuery, type MeritClaimRequest } from '@aave/graphql';
import type { AaveClient } from '../client';

/**
 * Fetches Merit claim transactions for a user.
 *
 * ```ts
 * const result = await meritClaim(client, {
 *   user: evmAddress('0x742d35cc…'),
 * });
 * ```
 *
 * @param client - Aave client.
 * @param request - The merit claim request parameters.
 * @returns The transactions to claim merit rewards.
 */
export function meritClaim(client: AaveClient, request: MeritClaimRequest) {
  return client.query(MeritClaimQuery, { request });
}
