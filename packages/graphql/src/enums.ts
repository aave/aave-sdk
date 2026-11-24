/**
 * The order direction for sorting results.
 */
export enum OrderDirection {
  Asc = 'ASC',
  Desc = 'DESC',
}

/**
 * The page size for paginated results.
 */
export enum PageSize {
  Ten = 'TEN',
  Fifty = 'FIFTY',
}

/**
 * The time window for the historical data.
 */
export enum TimeWindow {
  LastDay = 'LAST_DAY',
  LastWeek = 'LAST_WEEK',
  LastMonth = 'LAST_MONTH',
  LastSixMonths = 'LAST_SIX_MONTHS',
  LastYear = 'LAST_YEAR',
}

/**
 * The operation type for transactions, used for tracking transaction processing.
 */
export enum OperationType {
  Borrow = 'BORROW',
  Repay = 'REPAY',
  ReserveUsedAsCollateralEnabled = 'RESERVE_USED_AS_COLLATERAL_ENABLED',
  ReserveUsedAsCollateralDisabled = 'RESERVE_USED_AS_COLLATERAL_DISABLED',
  Supply = 'SUPPLY',
  UserEmodeSet = 'USER_EMODE_SET',
  Withdraw = 'WITHDRAW',
  VaultDeployed = 'VAULT_DEPLOYED',
  VaultDeposit = 'VAULT_DEPOSIT',
  VaultFeeUpdated = 'VAULT_FEE_UPDATED',
  VaultFeeWithdrawn = 'VAULT_FEE_WITHDRAWN',
  VaultWithdraw = 'VAULT_WITHDRAW',
  Liquidation = 'LIQUIDATION',
  VaultTransfer = 'VAULT_TRANSFER',
  RevenueSplitterOwnerDeployed = 'REVENUE_SPLITTER_OWNER_DEPLOYED',
  RevenueSplitterOwnerTransfer = 'REVENUE_SPLITTER_OWNER_TRANSFER',
}

/**
 * The filter for chains.
 */
export enum ChainsFilter {
  TESTNET_ONLY = 'TESTNET_ONLY',
  MAINNET_ONLY = 'MAINNET_ONLY',
  ALL = 'ALL',
}

/**
 * The action type for vault user history.
 */
export enum VaultUserHistoryAction {
  Deposit = 'DEPOSIT',
  Withdraw = 'WITHDRAW',
}

/**
 * The time window for the vault user activity.
 */
export enum VaultUserActivityTimeWindow {
  LastWeek = 'LAST_WEEK',
  LastMonth = 'LAST_MONTH',
  LastYear = 'LAST_YEAR',
  Max = 'MAX',
}

/**
 * The kind of V3 position that can migrate to V4.
 */
export enum MigrationPositionKind {
  /**
   * A supply that backs no debt
   */
  Earn = 'EARN',
  /**
   * A market's collateral and the debt it backs, which move together
   */
  Borrow = 'BORROW',
}

/**
 * A criterion a V3 position is judged against on a V4 spoke.
 */
export enum MigrationCriterion {
  /**
   * The spoke lists every asset of the position, in the role the position holds it
   */
  AssetSupported = 'ASSET_SUPPORTED',
  /**
   * Every asset of the position is allowed to migrate
   */
  AssetAllowed = 'ASSET_ALLOWED',
  /**
   * The spoke's supply and borrow caps have room for the position
   */
  LiquidityCap = 'LIQUIDITY_CAP',
  /**
   * Moving the position leaves the hub's rates within bounds
   */
  RateImpact = 'RATE_IMPACT',
  /**
   * The position earns more once moved, and for a borrow position borrows for less
   */
  NetApy = 'NET_APY',
}

/**
 * Whether a V4 spoke takes a previewed migration.
 */
export enum MigrationPreviewStatus {
  /**
   * The spoke takes the move as it stands
   */
  Previewed = 'PREVIEWED',
  /**
   * The spoke would refuse the move as it stands
   */
  Blocked = 'BLOCKED',
  /**
   * The spoke lists no reserve for one of the assets, or nothing is left to move
   */
  Unsupported = 'UNSUPPORTED',
}

/**
 * What a signature requested during a migration is for.
 */
export enum MigrationSignaturePurpose {
  /**
   * Lets the migration move the user's aTokens out of V3
   */
  ATokenPermit = 'A_TOKEN_PERMIT',
  /**
   * Approves V4's position managers on the spoke, once per spoke
   */
  PositionManagers = 'POSITION_MANAGERS',
  /**
   * Lets the migration enable the moved supplies as collateral on V4
   */
  CollateralPermission = 'COLLATERAL_PERMISSION',
  /**
   * Lets the migration borrow on V4 what it repaid on V3
   */
  BorrowPermit = 'BORROW_PERMIT',
}
