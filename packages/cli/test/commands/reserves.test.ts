import { describe, expect, it } from 'vitest';
import { runCommand } from '../helpers.js';

const ETHEREUM_MAIN_MARKET = '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2';

describe('reserves list', () => {
  it('lists reserves for the Ethereum main market', async () => {
    const { stdout, error } = await runCommand(
      `reserves list --market ${ETHEREUM_MAIN_MARKET} --chain 1`,
    );
    expect(error).toBeUndefined();
    expect(stdout).toContain('Asset');
    // tty-table wraps headers, check for partial match
    expect(stdout).toContain('APY');
  });

  it('returns JSON output', async () => {
    const { result, error } = await runCommand<Record<string, unknown>>(
      `reserves list --market ${ETHEREUM_MAIN_MARKET} --chain 1 --json`,
    );
    expect(error).toBeUndefined();
    expect(result).toHaveProperty('supplyReserves');
  });

  it('errors when market flag is missing', async () => {
    const { error } = await runCommand('reserves list --chain 1');
    expect(error).toBeDefined();
  });

  it('errors when chain flag is missing', async () => {
    const { error } = await runCommand(
      `reserves list --market ${ETHEREUM_MAIN_MARKET}`,
    );
    expect(error).toBeDefined();
  });

  it('shows help text', async () => {
    const { stdout } = await runCommand('reserves list --help');
    expect(stdout).toContain('List reserves');
    expect(stdout).toContain('--market');
    expect(stdout).toContain('--chain');
  });
});
