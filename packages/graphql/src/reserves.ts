import { ReserveFragment } from './fragments';
import { graphql } from './graphql';

/**
 * @internal
 */
export const ReserveQuery = graphql(
  `query Reserve($request: ReserveRequest!, $includeUserFields: Boolean!, $userAddress: EvmAddress) {
    value: reserve(request: $request) {
      ...Reserve
    }
  }`,
  [ReserveFragment],
);
