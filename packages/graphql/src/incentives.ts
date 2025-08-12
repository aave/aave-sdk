import type { FragmentOf } from 'gql.tada';
import { CurrencyFragment, TokenAmountFragment } from './fragments/common';
import { TransactionRequestFragment } from './fragments/transactions';
import { graphql, type RequestOf } from './graphql';

export const MeritRewardFragment = graphql(
  `fragment MeritReward on MeritReward {
    __typename
    amount {
      ...TokenAmount
    }
    currency {
      ...Currency
    }
  }`,
  [TokenAmountFragment, CurrencyFragment],
);
export type MeritReward = FragmentOf<typeof MeritRewardFragment>;

export const MeritClaimTransactionFragment = graphql(
  `fragment MeritClaimTransaction on MeritClaimTransaction {
    __typename
    chain
    rewards {
      ...MeritReward
    }
    transaction {
      ...TransactionRequest
    }
  }`,
  [MeritRewardFragment, TransactionRequestFragment],
);
export type MeritClaimTransaction = FragmentOf<
  typeof MeritClaimTransactionFragment
>;

export const MeritClaimQuery = graphql(
  `query MeritClaim($request: MeritClaimRequest!) {
    value: meritClaim(request: $request) {
      ...MeritClaimTransaction
    }
  }`,
  [MeritClaimTransactionFragment],
);
export type MeritClaimRequest = RequestOf<typeof MeritClaimQuery>;
