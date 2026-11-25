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
  OrderId,
  OrderQuoteId,
  ReserveId,
  RewardId,
  Signature,
  SwapQuoteId,
  TxHash,
  TypedSelectionSet,
  UserBorrowItemId,
  UserSupplyItemId,
  Void,
} from '@aave/types';
import {
  type DocumentDecoration,
  initGraphQLTada,
  type TadaDocumentNode,
} from 'gql.tada';
import type { JsonObject } from 'type-fest';
import type {
  BorrowSwapKind,
  ChainsFilter,
  OperationType,
  OrderClass,
  OrderDirection,
  OrderStatusFilter,
  PageSize,
  QuoteAccuracy,
  RepayWithSupplyKind,
  SupplySwapKind,
  SwapOrderClass,
  TimeWindow,
  TokenSwapKind,
  VaultUserActivityTimeWindow,
  VaultUserHistoryAction,
  WithdrawSwapKind,
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
    BorrowSwapKind: BorrowSwapKind;
    ChainsFilter: ChainsFilter;
    ChainId: ChainId;
    Cursor: Cursor;
    DateTime: DateTime;
    EvmAddress: EvmAddress;
    Float: number;
    ID: ID;
    Int: number;
    JSON: JsonObject;
    OperationType: OperationType;
    OrderClass: OrderClass;
    OrderDirection: OrderDirection;
    OrderId: OrderId;
    OrderQuoteId: OrderQuoteId;
    OrderStatusFilter: OrderStatusFilter;
    PageSize: PageSize;
    QuoteAccuracy: QuoteAccuracy;
    RepayWithSupplyKind: RepayWithSupplyKind;
    ReserveId: ReserveId;
    RewardId: RewardId;
    Signature: Signature;
    String: string;
    SupplySwapKind: SupplySwapKind;
    SwapOrderClass: SwapOrderClass;
    SwapQuoteId: SwapQuoteId;
    TokenSwapKind: TokenSwapKind;
    TxHash: TxHash;
    UserBorrowItemId: UserBorrowItemId;
    UserSupplyItemId: UserSupplyItemId;
    Void: Void;
    TimeWindow: TimeWindow;
    WithdrawSwapKind: WithdrawSwapKind;
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
