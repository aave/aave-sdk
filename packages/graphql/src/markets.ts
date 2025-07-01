import { MarketFragment } from './fragments';
import { graphql, type RequestOf } from './graphql';

/**
 * @internal
 */
export const MarketsQuery = graphql(
  `query Markets($request: MarketsRequest!) {
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
  `query Market($request: MarketRequest!) {
    value: market(request: $request) {
      ...Market
    }
  }`,
  [MarketFragment],
);
export type MarketRequest = RequestOf<typeof MarketQuery>;
