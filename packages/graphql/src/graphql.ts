import type {
  AnySelectionSet,
  AnyVariables,
  BigDecimal,
  BigIntString,
  BlockchainData,
  ChainId,
  Cursor,
  DateTime,
  EvmAddress,
  ID,
  Signature,
  TxHash,
  TypedSelectionSet,
  Void,
} from '@aave/types';
import {
  type DocumentDecoration,
  initGraphQLTada,
  type TadaDocumentNode,
} from 'gql.tada';
import type {
  ChainsFilter,
  OperationType,
  OrderDirection,
  PageSize,
  TimeWindow,
  VaultUserActivityTimeWindow,
  VaultUserHistoryAction,
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
    ChainsFilter: ChainsFilter;
    ChainId: ChainId;
    Cursor: Cursor;
    DateTime: DateTime;
    EvmAddress: EvmAddress;
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
    VaultUserHistoryAction: VaultUserHistoryAction;
    VaultUserActivityTimeWindow: VaultUserActivityTimeWindow;
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
