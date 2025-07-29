import { type FragmentOf, graphql, type RequestOf } from './graphql';

export const TypeFieldFragment = graphql(
  `fragment TypeField on TypeField {
    __typename
    name
    type
  }`,
);
export type TypeField = FragmentOf<typeof TypeFieldFragment>;

export const TypeDefinitionFragment = graphql(
  `fragment TypeDefinition on TypeDefinition {
    __typename
    EIP712Domain {
      ...TypeField
    }
    Permit {
      ...TypeField
    }
  }`,
  [TypeFieldFragment],
);
export type TypeDefinition = FragmentOf<typeof TypeDefinitionFragment>;

export const DomainDataFragment = graphql(
  `fragment DomainData on DomainData {
    __typename
    name
    version
    chainId
    verifyingContract
  }`,
);
export type DomainData = FragmentOf<typeof DomainDataFragment>;

export const MessageDataFragment = graphql(
  `fragment MessageData on MessageData {
    __typename
    owner
    spender
    value
    nonce
    deadline
  }`,
);
export type MessageData = FragmentOf<typeof MessageDataFragment>;

export const PermitTypedDataResponseFragment = graphql(
  `fragment PermitTypedDataResponse on PermitTypedDataResponse {
    __typename
    types {
      ...TypeDefinition
    }
    primaryType
    domain {
      ...DomainData
    }
    message {
      ...MessageData
    }
  }`,
  [TypeDefinitionFragment, DomainDataFragment, MessageDataFragment],
);
export type PermitTypedDataResponse = FragmentOf<
  typeof PermitTypedDataResponseFragment
>;

export type ERC712Signature = ReturnType<
  typeof graphql.scalar<'ERC712Signature'>
>;

/**
 * @internal
 */
export const PermitTypedDataQuery = graphql(
  `query PermitTypedData($request: PermitRequest!) {
    value: permitTypedData(request: $request) {
      ...PermitTypedDataResponse
    }
  }`,
  [PermitTypedDataResponseFragment],
);
export type PermitTypedDataRequest = RequestOf<typeof PermitTypedDataQuery>;
