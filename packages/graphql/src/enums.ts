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
