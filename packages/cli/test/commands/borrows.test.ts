import { describe, expect, it } from 'vitest';
import { runCommand } from '../helpers.js';

const ETHEREUM_MAIN_MARKET = '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2';
const ACTIVE_USER = '0x25F2226B597E8F9514B3F68F00f494cF4f286491';

describe('borrows list', () => {
  it('lists borrow positions for a user', async () => {
    const { stdout, error } = await runCommand(
      `borrows list --user ${ACTIVE_USER} --market ${ETHEREUM_MAIN_MARKET} --chain 1`,
    );
    expect(error).toBeUndefined();
    expect(stdout).toBeDefined();
  });

  it('returns JSON output', async () => {
    const { result, error } = await runCommand<unknown[]>(
      `borrows list --user ${ACTIVE_USER} --market ${ETHEREUM_MAIN_MARKET} --chain 1 --json`,
    );
    expect(error).toBeUndefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it('errors when required flags are missing', async () => {
    const { error } = await runCommand('borrows list');
    expect(error).toBeDefined();
  });

  it('shows help text', async () => {
    const { stdout } = await runCommand('borrows list --help');
    expect(stdout).toContain('List user borrow positions');
    expect(stdout).toContain('--user');
    expect(stdout).toContain('--market');
    expect(stdout).toContain('--chain');
  });
});
