import type { FragmentOf } from 'gql.tada';
import { graphql } from '../graphql';

export const APYSampleFragment = graphql(
  `fragment APYSample on APYSample {
    __typename
    avgRate {
      __typename
      value
      raw
      decimals
    }
    date
  }`,
);
export type APYSample = FragmentOf<typeof APYSampleFragment>;
