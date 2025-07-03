import { MarketFragment } from './fragments';
import { graphql } from './graphql';

/**
 * @internal
 */
export const MarketsQuery = graphql(
  `query Markets($request: MarketsRequest!, $includeUserFields: Boolean!, $borrowsOrderBy: MarketReservesRequestOrderBy, $suppliesOrderBy: MarketReservesRequestOrderBy, $userAddress: EvmAddress!) {
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
    $request: MarketRequest!, $includeUserFields: Boolean!, $borrowsOrderBy: MarketReservesRequestOrderBy, $suppliesOrderBy: MarketReservesRequestOrderBy, $userAddress: EvmAddress!) {
    value: market(request: $request) {
      ...Market
    }
  }`,
  [MarketFragment],
);
