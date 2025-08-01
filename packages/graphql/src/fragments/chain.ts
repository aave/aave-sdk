import type { FragmentOf } from 'gql.tada';
import { graphql } from '../graphql';

export const ChainFragment = graphql(
  `fragment Chain on Chain {
    __typename
    name
    icon
    chainId
    explorerUrl
    isTestnet
    nativeWrappedToken
  }`,
);
export type Chain = FragmentOf<typeof ChainFragment>;
