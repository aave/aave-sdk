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
  ReserveDataUpdated = 'RESERVE_DATA_UPDATED',
  ReserveUsedAsCollateralEnabled = 'RESERVE_USED_AS_COLLATERAL_ENABLED',
  ReserveUsedAsCollateralDisabled = 'RESERVE_USED_AS_COLLATERAL_DISABLED',
  Supply = 'SUPPLY',
  UserEmodeSet = 'USER_EMODE_SET',
  Withdraw = 'WITHDRAW',
  VaultDeployed = 'VAULT_DEPLOYED',
  VaultDeposit = 'VAULT_DEPOSIT',
  VaultEmergencyRescue = 'VAULT_EMERGENCY_RESCUE',
  VaultOwnershipTransferred = 'VAULT_OWNERSHIP_TRANSFERRED',
  VaultFeeUpdated = 'VAULT_FEE_UPDATED',
  VaultFeeWithdrawn = 'VAULT_FEE_WITHDRAWN',
  VaultRewardClaimed = 'VAULT_REWARD_CLAIMED',
  VaultTransfer = 'VAULT_TRANSFER',
  VaultWithdraw = 'VAULT_WITHDRAW',
  VaultYieldAccrued = 'VAULT_YIELD_ACCRUED',
  Liquidation = 'LIQUIDATION',
}
