---
name: publish
description: Use when manually publishing SDK packages to npm registry, after all changes are merged to main
---

# Publish SDK Packages

Publishes `@aave` packages to npm using changesets.

## Checklist

**You MUST use TodoWrite to create a todo for EACH step below. Mark each complete only after verification.**

### Pre-flight

- [ ] Verify on `main` branch and up-to-date: `git checkout main && git pull`
- [ ] Verify working directory is clean: `git status` shows no uncommitted changes
- [ ] Run `nvm use` to ensure correct Node.js version
- [ ] Run `corepack enable` to ensure correct pnpm version
- [ ] Run `pnpm install` to update dependencies
- [ ] Run `pnpm build` to build all packages

### Version Bump

- [ ] Run `pnpm changeset status` to check for pending changesets (if none exist, nothing to publish — STOP)
- [ ] Run `pnpm changeset version` to bump versions
- [ ] Review the version output and confirm changes look correct
- [ ] Stage and commit: `git add . && git commit -m "chore: bumps up versions"`

### Publish

- [ ] Verify npm authentication: run `npm whoami`
  - If it fails: ask user to run `npm login` then re-verify
- [ ] Ask user for npm OTP code (from authenticator app)
- [ ] Run `NPM_CONFIG_OTP=<otp> pnpm changeset publish` with the provided OTP
  - If OTP expires mid-publish: ask for new OTP and retry failed packages manually
  - If publish fails partially: check npm for which packages published, may need manual recovery
- [ ] Run `git push --follow-tags`

## Stop Conditions

| Condition | Action |
|-----------|--------|
| Not on main branch | `git checkout main && git pull` first |
| Uncommitted changes | Stash or commit first |
| `pnpm changeset status` shows no changesets | Nothing to publish — inform user |
| `npm whoami` fails | User must run `npm login` |

## Common Mistakes

1. **Skipping `nvm use`** — Wrong Node version causes build failures
2. **Forgetting `--follow-tags`** — Git tags not pushed, npm versions unlinked from git history
3. **Committing after `git push --follow-tags`** — Version bump commit must be pushed before tags, not after
