import { ChainFragment } from './fragments';
import { graphql } from './graphql';

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
