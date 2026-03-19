# TODOS

## CLI: Write/Mutation Commands
**What:** Add write commands (supply, borrow, repay, withdraw, collateral toggle, eMode) to `@aave/cli`.
**Why:** Makes the CLI a full DeFi tool, not just a data viewer. The V3 client already has all transaction-building functions — the missing piece is wallet/signer integration in the CLI (private key, keystore, or hardware wallet).
**Pros:** Complete CLI experience, scriptable DeFi operations.
**Cons:** Requires secure key management, signing UX, gas estimation, approval flows.
**Depends on:** Read-only CLI shipping first.

## CLI: Auto-Generated README
**What:** Set up `oclif readme` script to auto-generate CLI command documentation.
**Why:** Docs drift from code if maintained manually. V4 CLI already uses this pattern (`"readme": "oclif readme"` in scripts).
**Pros:** Zero-maintenance docs, always accurate with command signatures and flags.
**Cons:** None — oclif built-in feature.
**Depends on:** CLI commands being implemented.
