import type { FragmentOf } from 'gql.tada';
import { type FragmentDocumentFor, graphql } from '../graphql';
import { DecimalValueFragment } from './common';

export const TransactionRequestFragment = graphql(
  `fragment TransactionRequest on TransactionRequest {
    __typename
    to
    from
    data
    value
    chainId
  }`,
);
export type TransactionRequest = FragmentOf<typeof TransactionRequestFragment>;

export const ApprovalRequiredFragment = graphql(
  `fragment ApprovalRequired on ApprovalRequired {
    __typename
    approval {
      ...TransactionRequest
    }
    reason
    requiredAmount {
      ...DecimalValue
    }
    currentAllowance {
      ...DecimalValue
    }
    originalTransaction {
      ...TransactionRequest
    }
  }`,
  [TransactionRequestFragment, DecimalValueFragment],
);
export type ApprovalRequired = FragmentOf<typeof ApprovalRequiredFragment>;

export const InsufficientBalanceErrorFragment = graphql(
  `fragment InsufficientBalanceError on InsufficientBalanceError {
    __typename
    required {
      ...DecimalValue
    }
    available {
      ...DecimalValue
    }
  }`,
  [DecimalValueFragment],
);
export type InsufficientBalanceError = FragmentOf<
  typeof InsufficientBalanceErrorFragment
>;

export type Transaction =
  | TransactionRequest
  | ApprovalRequired
  | InsufficientBalanceError;

export const TransactionFragment: FragmentDocumentFor<
  Transaction,
  'Transaction'
> = graphql(
  `fragment Transaction on Transaction {
    __typename
    ... on TransactionRequest {
      ...TransactionRequest
    }
    ... on ApprovalRequired {
      ...ApprovalRequired
    }
    ... on InsufficientBalanceError {
      ...InsufficientBalanceError
    }
  }`,
  [
    TransactionRequestFragment,
    ApprovalRequiredFragment,
    InsufficientBalanceErrorFragment,
  ],
);
