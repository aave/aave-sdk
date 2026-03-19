import { describe, expect, it } from 'vitest';
import { runCommand } from '../helpers.js';

const ETHEREUM_MAIN_MARKET = '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2';
const ACTIVE_USER = '0x25F2226B597E8F9514B3F68F00f494cF4f286491';

describe('positions list', () => {
  it('shows user position summary', async () => {
    const { stdout, error } = await runCommand(
      `positions list --user ${ACTIVE_USER} --market ${ETHEREUM_MAIN_MARKET} --chain 1`,
    );
    expect(error).toBeUndefined();
    // tty-table wraps headers across lines, so check for partial matches
    expect(stdout).toContain('Net');
    expect(stdout).toContain('Health');
  });

  it('returns JSON output with position fields', async () => {
    const { result, error } = await runCommand<Record<string, unknown>>(
      `positions list --user ${ACTIVE_USER} --market ${ETHEREUM_MAIN_MARKET} --chain 1 --json`,
    );
    expect(error).toBeUndefined();
    expect(result).toHaveProperty('netWorth');
    expect(result).toHaveProperty('healthFactor');
    expect(result).toHaveProperty('totalCollateralBase');
    expect(result).toHaveProperty('totalDebtBase');
  });

  it('errors when required flags are missing', async () => {
    const { error } = await runCommand('positions list');
    expect(error).toBeDefined();
  });

  it('shows help text', async () => {
    const { stdout } = await runCommand('positions list --help');
    expect(stdout).toContain('View user position summary');
    expect(stdout).toContain('--user');
    expect(stdout).toContain('--market');
    expect(stdout).toContain('--chain');
  });
});
