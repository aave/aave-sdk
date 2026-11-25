import type { Tagged } from 'type-fest';
import type { EvmAddress } from './hex';
import type { ChainId } from './number';

/**
 * An identifier.
 */
export type ID = Tagged<string, 'ID'>;

/**
 * A Merkl reward program identifier (UUID) returned by the backend.
 */
export type RewardId = Tagged<string, 'RewardId'>;

/**
 * An order identifier, as returned by `submitOrder`.
 */
export type OrderId = Tagged<string, 'OrderId'>;

/**
 * An order quote identifier, as returned by a swap quote or `prepareOrder`.
 */
export type OrderQuoteId = Tagged<string, 'OrderQuoteId'>;

/**
 * A swap quote identifier, used to refresh or reprice a quote.
 */
export type SwapQuoteId = Tagged<string, 'SwapQuoteId'>;

/**
 * A reserve of a market, across chains.
 */
export type ReserveId = Tagged<string, 'ReserveId'>;

/**
 * One account's supply in one reserve of a market.
 */
export type UserSupplyItemId = Tagged<string, 'UserSupplyItemId'>;

/**
 * One account's borrow in one reserve of a market.
 */
export type UserBorrowItemId = Tagged<string, 'UserBorrowItemId'>;

// The backend reads these ids as URL-safe base64 of the parts joined by `::`.
function compositeId(parts: ReadonlyArray<string | number>): string {
  return btoa(parts.join('::')).replace(/\+/g, '-').replace(/\//g, '_');
}

/**
 * Builds the {@link ReserveId} of a market's reserve.
 */
export function reserveId(args: {
  chainId: ChainId;
  market: EvmAddress;
  underlyingToken: EvmAddress;
}): ReserveId {
  return compositeId([
    args.chainId,
    args.market,
    args.underlyingToken,
  ]) as ReserveId;
}

/**
 * Builds the {@link UserSupplyItemId} of a user's supply in a market's reserve.
 */
export function userSupplyItemId(args: {
  chainId: ChainId;
  market: EvmAddress;
  user: EvmAddress;
  underlyingToken: EvmAddress;
}): UserSupplyItemId {
  return compositeId([
    args.chainId,
    args.market,
    args.user,
    args.underlyingToken,
  ]) as UserSupplyItemId;
}

/**
 * Builds the {@link UserBorrowItemId} of a user's borrow in a market's reserve.
 */
export function userBorrowItemId(args: {
  chainId: ChainId;
  market: EvmAddress;
  user: EvmAddress;
  underlyingToken: EvmAddress;
}): UserBorrowItemId {
  return compositeId([
    args.chainId,
    args.market,
    args.user,
    args.underlyingToken,
  ]) as UserBorrowItemId;
}
