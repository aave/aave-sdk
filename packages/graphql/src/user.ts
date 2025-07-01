import { 
  UserReserveBorrowPositionFragment, 
  UserReserveSupplyPositionFragment 
} from './fragments/positions';
import { graphql, type RequestOf } from './graphql';

/**
 * @internal
 */
export const UserSuppliesQuery = graphql(
  `query UserSupplies($request: UserSuppliesRequest!) {
    value: userSupplies(request: $request) {
      ...UserReserveSupplyPosition
    }
  }`,
  [UserReserveSupplyPositionFragment],
);
export type UserSuppliesRequest = RequestOf<typeof UserSuppliesQuery>;

/**
 * @internal
 */
export const UserBorrowsQuery = graphql(
  `query UserBorrows($request: UserBorrowsRequest!) {
    value: userBorrows(request: $request) {
      ...UserReserveBorrowPosition
    }
  }`,
  [UserReserveBorrowPositionFragment],
);
export type UserBorrowsRequest = RequestOf<typeof UserBorrowsQuery>;
