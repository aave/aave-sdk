import type { FragmentOf } from 'gql.tada';
import { graphql } from '../graphql';

export const DecimalValueFragment = graphql(
  `fragment DecimalValue on DecimalValue {
    __typename
    raw
    decimals
    value
  }`,
);
export type DecimalValue = FragmentOf<typeof DecimalValueFragment>;
