import { describe, expect, it } from 'vitest';
import { runCommand } from '../helpers.js';

const ETHEREUM_MAIN_MARKET = '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2';
// Known active Aave user (aave.eth)
const ACTIVE_USER = '0x25F2226B597E8F9514B3F68F00f494cF4f286491';

describe('supplies list', () => {
  it('lists supply positions for a user', async () => {
    const { stdout, error } = await runCommand(
      `supplies list --user ${ACTIVE_USER} --market ${ETHEREUM_MAIN_MARKET} --chain 1`,
    );
    expect(error).toBeUndefined();
    // User may or may not have supplies, both are valid
    expect(stdout).toBeDefined();
  });

  it('returns JSON output', async () => {
    const { result, error } = await runCommand<unknown[]>(
      `supplies list --user ${ACTIVE_USER} --market ${ETHEREUM_MAIN_MARKET} --chain 1 --json`,
    );
    expect(error).toBeUndefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it('errors when required flags are missing', async () => {
    const { error } = await runCommand('supplies list');
    expect(error).toBeDefined();
  });

  it('shows help text', async () => {
    const { stdout } = await runCommand('supplies list --help');
    expect(stdout).toContain('List user supply positions');
    expect(stdout).toContain('--user');
    expect(stdout).toContain('--market');
    expect(stdout).toContain('--chain');
  });
});
