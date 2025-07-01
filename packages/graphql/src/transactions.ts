import { TransactionFragment } from './fragments';
import { graphql, type RequestOf } from './graphql';

/**
 * @internal
 */
export const BorrowQuery = graphql(
  `query Borrow($request: BorrowRequest!) {
    value: borrow(request: $request) {
      ...Transaction
    }
  }`,
  [TransactionFragment],
);
export type BorrowRequest = RequestOf<typeof BorrowQuery>;
