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

export const CurrencyFragment = graphql(
  `fragment Currency on Currency {
    __typename
    address
    imageUrl
    name
    symbol
    decimals
    chainId
  }`,
);
export type Currency = FragmentOf<typeof CurrencyFragment>;

export const NativeCurrencyFragment = graphql(
  `fragment NativeCurrency on NativeCurrency {
    __typename
    imageUrl
    name
    symbol
    decimals
    chainId
  }`,
);
export type NativeCurrency = FragmentOf<typeof NativeCurrencyFragment>;

export const TokenAmountFragment = graphql(
  `fragment TokenAmount on TokenAmount {
    __typename
    amount {
      ...DecimalValue
    }
    usd
  }`,
  [DecimalValueFragment],
);
export type TokenAmount = FragmentOf<typeof TokenAmountFragment>;

export const PaginatedResultInfoFragment = graphql(
  `fragment PaginatedResultInfo on PaginatedResultInfo {
    __typename
    prev
    next
  }`,
);
export type PaginatedResultInfo = FragmentOf<
  typeof PaginatedResultInfoFragment
>;
