import { describe, expect, it } from 'vitest';
import { runCommand } from '../helpers.js';

const ACTIVE_USER = '0x25F2226B597E8F9514B3F68F00f494cF4f286491';

describe('gho balance', () => {
  it('shows sGHO balance for a user', async () => {
    const { stdout, error } = await runCommand(
      `gho balance --user ${ACTIVE_USER}`,
    );
    expect(error).toBeUndefined();
    expect(stdout).toContain('sGHO');
  });

  it('returns JSON output', async () => {
    const { result, error } = await runCommand<Record<string, unknown>>(
      `gho balance --user ${ACTIVE_USER} --json`,
    );
    expect(error).toBeUndefined();
    expect(result).toHaveProperty('amount');
    expect(result).toHaveProperty('usd');
  });

  it('errors when user flag is missing', async () => {
    const { error } = await runCommand('gho balance');
    expect(error).toBeDefined();
  });

  it('shows help text', async () => {
    const { stdout } = await runCommand('gho balance --help');
    expect(stdout).toContain('sGHO');
    expect(stdout).toContain('--user');
  });
});
