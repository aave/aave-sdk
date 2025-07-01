import { ChainFragment } from './fragments';
import { graphql } from './graphql';

export const HealthQuery = graphql(
  `query Health {
    value: health
  }`,
);

export const ChainsQuery = graphql(
  `query Chains {
    value: chains {
      ...Chain
    }
  }`,
  [ChainFragment],
);
