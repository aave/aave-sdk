import { MarketFragment } from './fragments';
import { graphql } from './graphql';

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
