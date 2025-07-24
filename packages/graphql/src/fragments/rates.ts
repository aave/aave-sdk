import type { FragmentOf } from 'gql.tada';
import { graphql } from '../graphql';
import { PercentValueFragment } from './common';

export const APYSampleFragment = graphql(
  `fragment APYSample on APYSample {
    __typename
    avgRate {
      ...PercentValue
    }
    date
  }`,
  [PercentValueFragment],
);
export type APYSample = FragmentOf<typeof APYSampleFragment>;
