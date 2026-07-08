# @aave/graphql

## 0.13.0

### Minor Changes

- b9220ee: Sync GraphQL schema with V3 backend and add the `kind` discriminator on points incentives.

  - `SupplyPointsIncentive` / `BorrowPointsIncentive` now expose `kind: PointsProgramKind!` (`CAMPAIGN` for Merkl-backed programs, `LOYALTY` for fixed-multiplier partner programs like Ethena, Ether.fi). For `LOYALTY`, `dailyPoints` / `pointsPerThousandUsd` are always null.
  - New fragments: `MerklSupplyIncentive`, `MerklBorrowIncentive`, `SupplyPointsIncentive`, `BorrowPointsIncentive`, `IncentiveCriteria`, `PointsProgram`, plus extended Merit fragments (`actionKey`, `rewardTokenAddress`, `rewardTokenSymbol`, `customMessage`, `customForumLink`, `selfApr`).
  - New canonical `userRewards` query (supersedes `userMeritRewards`).
  - `RewardId` scalar mapped to a branded string in `@aave/types`.

- 0384b0f: Add stkGHO migration action support

### Patch Changes

- Updated dependencies [b9220ee]
  - @aave/types@0.3.0

## 0.12.0

### Minor Changes

- dd16c47: **feat:** add sGHO (staked GHO) vault support with GraphQL fragments, client actions, and React hooks

### Patch Changes

- a9ab96f: **fix:** update schema for v3.7 (backwards compatible with v3.6)

## 0.11.0

### Minor Changes

- 6135af6: chore: updated schema for v3.6 upgrade

## 0.10.0

### Minor Changes

- c8300e3: populate baseVariableBorrowRate needed in the FE

## 0.9.0

### Minor Changes

- d231b4b: exposed unbacked field on the backend and updated the sdk's schema

## 0.8.0

### Minor Changes

- 75fd88e: feat: expose user earned/debt APY in MarketUserState

## 0.7.0

### Minor Changes

- 67ee5ad: **chore:** extract core logic into internal @aave/core package

### Patch Changes

- 65cb5b6: **feat**: Add fee recipients support to the vault
- df44eb5: **chore:** removes unused types.
- Updated dependencies [67ee5ad]
- Updated dependencies [df44eb5]
  - @aave/types@0.2.0

## 0.6.1

### Patch Changes

- 9fbf4bd: **fix:** republish due to CI issue with previous release
- Updated dependencies [9fbf4bd]
  - @aave/types@0.1.1

## 0.6.0

### Minor Changes

- fb93351: **fix:** support for meritClaimRewards query
- 3eef682: **feat:** Add withdraw/deposit/balance sGHO support

### Patch Changes

- be59081: **fix:** expose `AmountInput` type.
- 3bcb8b2: **fix:** modify sGHO withdraws to support execution plan

## 0.5.0

### Minor Changes

- **feat:** support for vaultUserActivity query

## 0.4.0

### Minor Changes

- **feat:** Support new fields for deposit/withdraw in vaults

## 0.3.1

### Patch Changes

- **fix:** Support max and exact value options in repay function.

## 0.3.0

### Minor Changes

- **feat:** support for healthFactorPreview query

## 0.2.0

### Minor Changes

- 0e36ce5: **feat:** supports for borrow credit delegation

## 0.1.0

### Minor Changes

- fb26904: **feat:** first release

### Patch Changes

- Updated dependencies [fb26904]
  - @aave/types@0.1.0
