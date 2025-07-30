import type { FragmentOf } from 'gql.tada';
import { type FragmentDocumentFor, graphql } from '../graphql';
import {
  DecimalValueFragment,
  PaginatedResultInfoFragment,
  TokenAmountFragment,
} from './common';
import { ReserveInfoFragment } from './reserve';

export const TransactionRequestFragment = graphql(
  `fragment TransactionRequest on TransactionRequest {
    __typename
    to
    from
    data
    value
    chainId
    operation
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

export type ExecutionPlan =
  | TransactionRequest
  | ApprovalRequired
  | InsufficientBalanceError;

export const ExecutionPlanFragment: FragmentDocumentFor<
  ExecutionPlan,
  'ExecutionPlan'
> = graphql(
  `fragment ExecutionPlan on ExecutionPlan {
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

export const UserSupplyTransactionFragment = graphql(
  `fragment UserSupplyTransaction on UserSupplyTransaction {
    __typename
    amount {
      ...TokenAmount
    }
    reserve {
      ...ReserveInfo
    }
    blockExplorerUrl
    txHash
    timestamp
  }`,
  [TokenAmountFragment, ReserveInfoFragment],
);
export type UserSupplyTransaction = FragmentOf<
  typeof UserSupplyTransactionFragment
>;

export const UserWithdrawTransactionFragment = graphql(
  `fragment UserWithdrawTransaction on UserWithdrawTransaction {
    __typename
    amount {
      ...TokenAmount
    }
    reserve {
      ...ReserveInfo
    }
    blockExplorerUrl
    txHash
    timestamp
  }`,
  [TokenAmountFragment, ReserveInfoFragment],
);
export type UserWithdrawTransaction = FragmentOf<
  typeof UserWithdrawTransactionFragment
>;

export const UserBorrowTransactionFragment = graphql(
  `fragment UserBorrowTransaction on UserBorrowTransaction {
    __typename
    amount {
      ...TokenAmount
    }
    reserve {
      ...ReserveInfo
    }
    blockExplorerUrl
    txHash
    timestamp
  }`,
  [TokenAmountFragment, ReserveInfoFragment],
);
export type UserBorrowTransaction = FragmentOf<
  typeof UserBorrowTransactionFragment
>;

export const UserRepayTransactionFragment = graphql(
  `fragment UserRepayTransaction on UserRepayTransaction {
    __typename
    amount {
      ...TokenAmount
    }
    reserve {
      ...ReserveInfo
    }
    blockExplorerUrl
    txHash
    timestamp
  }`,
  [TokenAmountFragment, ReserveInfoFragment],
);
export type UserRepayTransaction = FragmentOf<
  typeof UserRepayTransactionFragment
>;

export const UserUsageAsCollateralTransactionFragment = graphql(
  `fragment UserUsageAsCollateralTransaction on UserUsageAsCollateralTransaction {
    __typename
    enabled
    reserve {
      ...ReserveInfo
    }
    blockExplorerUrl
    txHash
    timestamp
  }`,
  [ReserveInfoFragment],
);
export type UserUsageAsCollateralTransaction = FragmentOf<
  typeof UserUsageAsCollateralTransactionFragment
>;

export const LiquidationCollateralFragment = graphql(
  `fragment LiquidationCollateral on LiquidationCollateral {
    __typename
    reserve {
      ...ReserveInfo
    }
    amount {
      ...TokenAmount
    }
  }`,
  [ReserveInfoFragment, TokenAmountFragment],
);
export type LiquidationCollateral = FragmentOf<
  typeof LiquidationCollateralFragment
>;

export const LiquidationRepaidDebtFragment = graphql(
  `fragment LiquidationRepaidDebt on LiquidationRepaidDebt {
    __typename
    reserve {
      ...ReserveInfo
    }
    amount {
      ...TokenAmount
    }
  }`,
  [ReserveInfoFragment, TokenAmountFragment],
);
export type LiquidationRepaidDebt = FragmentOf<
  typeof LiquidationRepaidDebtFragment
>;

export const UserLiquidationCallTransactionFragment = graphql(
  `fragment UserLiquidationCallTransaction on UserLiquidationCallTransaction {
    __typename
    collateral {
      ...LiquidationCollateral
    }
    debtRepaid {
      ...LiquidationRepaidDebt
    }
    blockExplorerUrl
    txHash
    timestamp
  }`,
  [LiquidationCollateralFragment, LiquidationRepaidDebtFragment],
);
export type UserLiquidationCallTransaction = FragmentOf<
  typeof UserLiquidationCallTransactionFragment
>;

export type UserTransactionItem =
  | UserSupplyTransaction
  | UserWithdrawTransaction
  | UserBorrowTransaction
  | UserRepayTransaction
  | UserUsageAsCollateralTransaction
  | UserLiquidationCallTransaction;

export const UserTransactionItemFragment: FragmentDocumentFor<
  UserTransactionItem,
  'UserTransactionItem'
> = graphql(
  `fragment UserTransactionItem on UserTransactionItem {
    __typename
    ... on UserSupplyTransaction {
      ...UserSupplyTransaction
    }
    ... on UserWithdrawTransaction {
      ...UserWithdrawTransaction
    }
    ... on UserBorrowTransaction {
      ...UserBorrowTransaction
    }
    ... on UserRepayTransaction {
      ...UserRepayTransaction
    }
    ... on UserUsageAsCollateralTransaction {
      ...UserUsageAsCollateralTransaction
    }
    ... on UserLiquidationCallTransaction {
      ...UserLiquidationCallTransaction
    }
  }`,
  [
    UserSupplyTransactionFragment,
    UserWithdrawTransactionFragment,
    UserBorrowTransactionFragment,
    UserRepayTransactionFragment,
    UserUsageAsCollateralTransactionFragment,
    UserLiquidationCallTransactionFragment,
  ],
);

export const PaginatedUserTransactionHistoryResultFragment = graphql(
  `fragment PaginatedUserTransactionHistoryResult on PaginatedUserTransactionHistoryResult {
    __typename
    items {
      ...UserTransactionItem
    }
    pageInfo {
      ...PaginatedResultInfo
    }
  }`,
  [UserTransactionItemFragment, PaginatedResultInfoFragment],
);
export type PaginatedUserTransactionHistoryResult = FragmentOf<
  typeof PaginatedUserTransactionHistoryResultFragment
>;
