import { ChainFragment } from './fragments';
import { CurrencyFragment } from './fragments/common';
import { type FragmentOf, graphql, type RequestOf } from './graphql';

/**
 * @internal
 */
export const HealthQuery = graphql(
  `query Health {
    value: health
  }`,
);

/**
 * @internal
 */
export const ChainsQuery = graphql(
  `query Chains {
    value: chains {
      ...Chain
    }
  }`,
  [ChainFragment],
);

/**
 * @internal
 */
export const HasProcessedKnownTransactionQuery = graphql(
  `query HasProcessedKnownTransaction($txHash: TxHash!) {
    value: hasProcessedKnownTransaction(txHash: $txHash)
  }`,
);

export const UsdExchangeRateFragment = graphql(
  `fragment UsdExchangeRate on UsdExchangeRate {
    __typename
    currency {
      ...Currency
    }
    rate
  }`,
  [CurrencyFragment],
);
export type UsdExchangeRate = FragmentOf<typeof UsdExchangeRateFragment>;

/**
 * @internal
 */
export const UsdExchangeRatesQuery = graphql(
  `query UsdExchangeRates($request: UsdExchangeRatesRequest!) {
    value: usdExchangeRates(request: $request) {
      ...UsdExchangeRate
    }
  }`,
  [UsdExchangeRateFragment],
);
export type UsdExchangeRatesRequest = RequestOf<typeof UsdExchangeRatesQuery>;
