---
name: snapshot
description: Use when publishing snapshot (pre-release test) versions of SDK packages to npm, without affecting real versions or main branch
---

# Snapshot Publish

Publishes `@aave` packages as snapshot versions to npm using changesets. Snapshot versions follow the format `0.0.0-<tag>-<timestamp>` and do not affect real semver versions.

## Checklist

**You MUST use TodoWrite to create a todo for EACH step below. Mark each complete only after verification.**

### Pre-flight

- [ ] Confirm the user has a dist-tag in mind (default: `preview`). Ask if not specified.
- [ ] Run `nvm use` to ensure correct Node.js version
- [ ] Run `corepack enable` to ensure correct pnpm version
- [ ] Run `pnpm install` to update dependencies
- [ ] Run `pnpm changeset status` to confirm pending changesets exist (if none, STOP and inform user)
- [ ] Run `pnpm build` to build all packages

### Version + Publish

- [ ] Verify npm authentication: run `npm whoami`
  - If it fails: ask user to run `npm login` then re-verify
- [ ] Run `pnpm changeset version --snapshot <tag>` to stamp snapshot versions
- [ ] Review the version output — confirm packages show `0.0.0-<tag>-<timestamp>` versions
- [ ] Ask user for npm OTP code (from authenticator app)
- [ ] Run `NPM_CONFIG_OTP=<otp> pnpm changeset publish --tag <tag> --no-git-checks` with the provided OTP
  - If OTP expires mid-publish: ask for new OTP and retry
  - If publish fails partially: check npm for which packages published

### Cleanup

- [ ] Restore the version changes: `git checkout -- .`
  - Do NOT commit the snapshot version bump — it must not land on any branch

## Stop Conditions

| Condition | Action |
|-----------|--------|
| No pending changesets | Nothing to snapshot - inform user |
| `npm whoami` fails | User must run `npm login` |
| Build fails | Fix build before publishing |

## Common Mistakes

1. **Committing the version bump** - `changeset version --snapshot` modifies `package.json` files; always restore with `git checkout -- .` after publish
2. **Skipping `--no-git-checks`** - Without it, changeset publish aborts because the working tree is dirty from the version bump
3. **Using the wrong tag** - The dist-tag used in `version` and `publish` must match, otherwise consumers can't install by tag
