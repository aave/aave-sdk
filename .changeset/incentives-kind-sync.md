---
"@aave/graphql": minor
"@aave/client": minor
"@aave/react": minor
"@aave/types": minor
---

Sync GraphQL schema with V3 backend and add the `kind` discriminator on points incentives.

- `SupplyPointsIncentive` / `BorrowPointsIncentive` now expose `kind: PointsProgramKind!` (`CAMPAIGN` for Merkl-backed programs, `LOYALTY` for fixed-multiplier partner programs like Ethena, Ether.fi). For `LOYALTY`, `dailyPoints` / `pointsPerThousandUsd` are always null.
- New fragments: `MerklSupplyIncentive`, `MerklBorrowIncentive`, `SupplyPointsIncentive`, `BorrowPointsIncentive`, `IncentiveCriteria`, `PointsProgram`, plus extended Merit fragments (`actionKey`, `rewardTokenAddress`, `rewardTokenSymbol`, `customMessage`, `customForumLink`, `selfApr`).
- New canonical `userRewards` query (supersedes `userMeritRewards`).
- `RewardId` scalar mapped to a branded string in `@aave/types`.
