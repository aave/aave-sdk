import { MarketFragment, MarketUserStatsFragment } from './fragments';
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

/**
 * @internal
 */
export const MarketQuery = graphql(
  `query Market(
    $request: MarketRequest!, $borrowsOrderBy: MarketReservesRequestOrderBy, $suppliesOrderBy: MarketReservesRequestOrderBy) {
    value: market(request: $request) {
      ...Market
    }
  }`,
  [MarketFragment],
);

/**
 * @internal
 */
export const UserMarketStatsQuery = graphql(
  `query UserMarketStats($request: UserMarketStatsRequest!) {
    value: userMarketStats(request: $request) {
      ...MarketUserStats
    }
  }`,
  [MarketUserStatsFragment],
);
export type UserMarketStatsRequest = RequestOf<typeof UserMarketStatsQuery>;
