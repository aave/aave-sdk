import { APYSampleFragment } from './fragments';
import { graphql, type RequestOf } from './graphql';

/**
 * @internal
 */
export const BorrowAPYHistoryQuery = graphql(
  `query BorrowAPYHistory($request: BorrowAPYHistoryRequest!) {
    value: borrowAPYHistory(request: $request) {
      ...APYSample
    }
  }`,
  [APYSampleFragment],
);
export type BorrowAPYHistoryRequest = RequestOf<typeof BorrowAPYHistoryQuery>;

/**
 * @internal
 */
export const SupplyAPYHistoryQuery = graphql(
  `query SupplyAPYHistory($request: SupplyAPYHistoryRequest!) {
    value: supplyAPYHistory(request: $request) {
      ...APYSample
    }
  }`,
  [APYSampleFragment],
);
export type SupplyAPYHistoryRequest = RequestOf<typeof SupplyAPYHistoryQuery>;
