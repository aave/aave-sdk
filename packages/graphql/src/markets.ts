import { MarketFragment } from './fragments';
import { graphql, type RequestOf } from './graphql';

export const MarketsQuery = graphql(
  `query Markets($request: MarketsRequest!) {
    value: markets(request: $request) {
      ...Market
    }
  }`,
  [MarketFragment],
);
export type MarketsRequest = RequestOf<typeof MarketsQuery>;

export const MarketQuery = graphql(
  `query Market($request: MarketRequest!) {
    value: market(request: $request) {
      ...Market
    }
  }`,
  [MarketFragment],
);
export type MarketRequest = RequestOf<typeof MarketQuery>;
