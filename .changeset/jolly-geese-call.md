---
"@aave/types": patch
"@aave/graphql": patch
"@aave/client": patch
"@aave/react": patch
---

**feat:** sync GraphQL schema with V3 backend and expose canonical user rewards API

- `@aave/types`: add `RewardId` branded string type for Merkl reward program ids.
- `@aave/graphql`: regenerate schema, map the new `RewardId` scalar, add `userRewards` query plus `UserRewards` / `ClaimableReward` fragments, extend `ReserveIncentive` with the fields now served by the V3 backend (`actionKey`, `customMessage`, `customForumLink`, `customClaimMessage`, `rewardTokenAddress`, `rewardTokenSymbol`, `selfApr`, `description`, `dailyPoints`, `pointsPerThousandUsd`).
- `@aave/client`: add `userRewards` action, canonical replacement for `userMeritRewards` with a `filter.rewardIds` scope.
- `@aave/react`: add `useUserRewards` hook (suspense + non-suspense overloads). `useUserMeritRewards` is kept as a deprecated alias.

Backwards compatible with v3.6.
