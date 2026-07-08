# @aave/types

## 0.3.0

### Minor Changes

- b9220ee: Sync GraphQL schema with V3 backend and add the `kind` discriminator on points incentives.

  - `SupplyPointsIncentive` / `BorrowPointsIncentive` now expose `kind: PointsProgramKind!` (`CAMPAIGN` for Merkl-backed programs, `LOYALTY` for fixed-multiplier partner programs like Ethena, Ether.fi). For `LOYALTY`, `dailyPoints` / `pointsPerThousandUsd` are always null.
  - New fragments: `MerklSupplyIncentive`, `MerklBorrowIncentive`, `SupplyPointsIncentive`, `BorrowPointsIncentive`, `IncentiveCriteria`, `PointsProgram`, plus extended Merit fragments (`actionKey`, `rewardTokenAddress`, `rewardTokenSymbol`, `customMessage`, `customForumLink`, `selfApr`).
  - New canonical `userRewards` query (supersedes `userMeritRewards`).
  - `RewardId` scalar mapped to a branded string in `@aave/types`.

## 0.2.0

### Minor Changes

- 67ee5ad: **chore:** extract core logic into internal @aave/core package

### Patch Changes

- df44eb5: **chore:** removes unused types.

## 0.1.1

### Patch Changes

- 9fbf4bd: **fix:** republish due to CI issue with previous release

## 0.1.0

### Minor Changes

- fb26904: **feat:** first release
