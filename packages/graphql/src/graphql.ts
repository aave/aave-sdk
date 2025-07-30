import type {
  BigDecimal,
  BigIntString,
  BlockchainData,
  ChainId,
  Cursor,
  DateTime,
  EvmAddress,
  FixedBytes32,
  ID,
  Signature,
  TxHash,
  Void,
} from '@aave/types';
import { InvariantError } from '@aave/types';
import {
  type DocumentDecoration,
  initGraphQLTada,
  type TadaDocumentNode,
} from 'gql.tada';
import type { StandardData } from './common';
import type {
  OperationType,
  OrderDirection,
  PageSize,
  TimeWindow,
} from './enums';
import type { introspection } from './graphql-env';

export type { FragmentOf } from 'gql.tada';

export const graphql = initGraphQLTada<{
  disableMasking: true;
  introspection: introspection;
  scalars: {
    AlwaysTrue: true;
    BigDecimal: BigDecimal;
    BigInt: BigIntString;
    BlockchainData: BlockchainData;
    Boolean: boolean;
    ChainId: ChainId;
    Cursor: Cursor;
    DateTime: DateTime;
    EvmAddress: EvmAddress;
    FixedBytes32: FixedBytes32;
    Float: number;
    ID: ID;
    Int: number;
    OperationType: OperationType;
    OrderDirection: OrderDirection;
    PageSize: PageSize;
    Signature: Signature;
    String: string;
    TxHash: TxHash;
    Void: Void;
    TimeWindow: TimeWindow;
  };
}>();

/**
 * @internal
 */
export type RequestOf<Document> = Document extends DocumentDecoration<
  unknown,
  { request: infer Request }
>
  ? Request
  : never;

/**
 * @internal
 */
export type FragmentShape = NonNullable<Parameters<typeof graphql>[1]>[number];

type GetDocumentNode<
  In extends string = string,
  Fragments extends FragmentShape[] = FragmentShape[],
> = ReturnType<typeof graphql<In, Fragments>>;

/**
 * Used in unions to future-proof against new types being added.
 *
 * ⚠️ DO NOT MATCH ON THIS — it's here to block exhaustive checks.
 */
export type __FutureProofUnion = { __typename: symbol };

/**
 * @internal
 */
export type AnySelectionSet = object;

/**
 * @internal
 */
export type AnyVariables = Record<string, unknown>;

/**
 * @internal
 */
export type TypedSelectionSet<TTypename extends string = string> = {
  __typename: TTypename;
};

/**
 * @internal
 */
export type FragmentDocumentFor<
  TGqlNode extends AnySelectionSet,
  TTypename extends string = TGqlNode extends TypedSelectionSet<infer TTypename>
    ? TTypename
    : never,
  TFragmentName extends string = TTypename,
> = TadaDocumentNode<
  TGqlNode,
  AnyVariables,
  {
    fragment: TFragmentName;
    on: TTypename;
    masked: false;
  }
>;

export type RequestFrom<In extends string> = RequestOf<
  GetDocumentNode<In, FragmentShape[]>
>;

// biome-ignore lint/suspicious/noExplicitAny: simplifies necessary type assertions
export type StandardDocumentNode<Value = any, Request = any> = TadaDocumentNode<
  StandardData<Value>,
  { request: Request }
>;

/*
 * Asserts that the node is of a specific type in a union.
 *
 * ```ts
 * type A = { __typename: 'A', a: string };
 * type B = { __typename: 'B', b: string };
 *
 * const node: A | B = { __typename: 'A', a: 'a' };
 *
 * assertTypename(node, 'A');
 *
 * console.log(node.a); // OK
 * ```
 *
 * @param node - The node to assert the typename of
 * @param typename - The expected typename
 */
export function assertTypename<Typename extends string>(
  node: TypedSelectionSet,
  typename: Typename,
): asserts node is TypedSelectionSet<Typename> {
  if (node.__typename !== typename) {
    throw new InvariantError(
      `Expected node to have typename "${typename}", but got "${node.__typename}"`,
    );
  }
}
