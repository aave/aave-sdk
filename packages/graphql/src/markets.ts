import { MarketFragment, MarketUserStateFragment } from './fragments';
import { graphql, type RequestOf } from './graphql';

/**
 * @internal
 */
export const MarketsQuery = graphql(
  `query Markets($request: MarketsRequest!, $borrowsOrderBy: MarketReservesRequestOrderBy, $suppliesOrderBy: MarketReservesRequestOrderBy) {
    value: markets(request: $request) {
      ...Market
    }
  }`,
  [MarketFragment],
);
export type MarketsRequest = RequestOf<typeof MarketsQuery>;

/**
 * @internal
 */
export const MarketQuery = graphql(
  `query Market($request: MarketRequest!, $borrowsOrderBy: MarketReservesRequestOrderBy, $suppliesOrderBy: MarketReservesRequestOrderBy) {
    value: market(request: $request) {
      ...Market
    }
  }`,
  [MarketFragment],
);
export type MarketRequest = RequestOf<typeof MarketQuery>;

/**
 * @internal
 */
export const UserMarketStateQuery = graphql(
  `query UserMarketState($request: UserMarketStatsRequest!) {
    value: userMarketStats(request: $request) {
      ...MarketUserState
    }
  }`,
  [MarketUserStateFragment],
);
export type UserMarketStateRequest = RequestOf<typeof UserMarketStateQuery>;
