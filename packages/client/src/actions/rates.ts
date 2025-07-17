import {
  type APYSample,
  BorrowAPYHistoryQuery,
  SupplyAPYHistoryQuery,
  type TimeWindow,
} from '@aave/graphql';
import type { ChainId, EvmAddress, ResultAsync } from '@aave/types';
import type { AaveClient } from '../client';
import type { UnexpectedError } from '../errors';

export type BorrowAPYHistoryRequest = {
  /**
   * The markets you want to see based on the chain ids.
   */
  chainId: ChainId;
  /**
   * The user viewing the market (e.g., the connected wallet).
   *
   * If not provided, user fields will not be included.
   */
  underlyingToken: EvmAddress;
  /**
   * The order by clause for the borrow reserves in the market.
   *
   * @defaultValue { tokenName: OrderDirection.Asc }
   */
  window: TimeWindow;
  /**
   * The order by clause for the supply reserves in the market.
   *
   * @defaultValue { tokenName: OrderDirection.Asc }
   */
  market: EvmAddress;
};

export function borrowAPRHistory(
  client: AaveClient,
  { chainId, underlyingToken, window, market }: BorrowAPYHistoryRequest,
): ResultAsync<APYSample[] | null, UnexpectedError> {
  return client.query(BorrowAPYHistoryQuery, {
    request: {
      chainId,
      underlyingToken,
      window,
      market,
    },
  });
}

export type SupplyAPYHistoryRequest = {
  /**
   * The markets you want to see based on the chain ids.
   */
  chainId: ChainId;
  /**
   * The user viewing the market (e.g., the connected wallet).
   *
   * If not provided, user fields will not be included.
   */
  underlyingToken: EvmAddress;
  /**
   * The order by clause for the borrow reserves in the market.
   *
   * @defaultValue { tokenName: OrderDirection.Asc }
   */
  window: TimeWindow;
  /**
   * The order by clause for the supply reserves in the market.
   *
   * @defaultValue { tokenName: OrderDirection.Asc }
   */
  market: EvmAddress;
};

export function supplyAPRHistory(
  client: AaveClient,
  { chainId, underlyingToken, window, market }: SupplyAPYHistoryRequest,
): ResultAsync<APYSample[] | null, UnexpectedError> {
  return client.query(SupplyAPYHistoryQuery, {
    request: {
      chainId,
      underlyingToken,
      window,
      market,
    },
  });
}
