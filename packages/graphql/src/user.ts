import {
  MarketUserReserveBorrowPositionFragment,
  MarketUserReserveSupplyPositionFragment,
  PaginatedUserTransactionHistoryResultFragment,
} from './fragments';
import { graphql, type RequestOf } from './graphql';

export const UserSuppliesQuery = graphql(
  `query UserSupplies($request: UserSuppliesRequest!) {
    value: userSupplies(request: $request) {
      ...MarketUserReserveSupplyPosition
    }
  }`,
  [MarketUserReserveSupplyPositionFragment],
);
export type UserSuppliesRequest = RequestOf<typeof UserSuppliesQuery>;

export const UserBorrowsQuery = graphql(
  `query UserBorrows($request: UserBorrowsRequest!) {
    value: userBorrows(request: $request) {
      ...MarketUserReserveBorrowPosition
    }
  }`,
  [MarketUserReserveBorrowPositionFragment],
);
export type UserBorrowsRequest = RequestOf<typeof UserBorrowsQuery>;

export const UserTransactionHistoryQuery = graphql(
  `query UserTransactionHistory($request: UserTransactionHistoryRequest!) {
    value: userTransactionHistory(request: $request) {
      ...PaginatedUserTransactionHistoryResult
    }
  }`,
  [PaginatedUserTransactionHistoryResultFragment],
);
export type UserTransactionHistoryRequest = RequestOf<
  typeof UserTransactionHistoryQuery
>;
