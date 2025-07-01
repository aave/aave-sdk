import { ReserveFragment } from './fragments';
import { graphql, type RequestOf } from './graphql';

/**
 * @internal
 */
export const ReserveQuery = graphql(
  `query Reserve($request: ReserveRequest!) {
    value: reserve(request: $request) {
      ...Reserve
    }
  }`,
  [ReserveFragment],
);
export type ReserveRequest = RequestOf<typeof ReserveQuery>;
