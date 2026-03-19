import { describe, expect, it } from 'vitest';
import { runCommand } from '../helpers.js';

const ETHEREUM_MAIN_MARKET = '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2';
const ACTIVE_USER = '0x25F2226B597E8F9514B3F68F00f494cF4f286491';
// USDC on Ethereum
const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

describe('health-factor preview', () => {
  it('previews health factor for a supply action', async () => {
    const { stdout, error } = await runCommand(
      `health-factor preview --action supply --market ${ETHEREUM_MAIN_MARKET} --chain 1 --user ${ACTIVE_USER} --token ${USDC} --amount 1000`,
    );
    expect(error).toBeUndefined();
    expect(stdout).toContain('Health Factor Before');
    expect(stdout).toContain('Health Factor After');
  });

  it('returns JSON output', async () => {
    const { result, error } = await runCommand<Record<string, unknown>>(
      `health-factor preview --action supply --market ${ETHEREUM_MAIN_MARKET} --chain 1 --user ${ACTIVE_USER} --token ${USDC} --amount 1000 --json`,
    );
    expect(error).toBeUndefined();
    expect(result).toHaveProperty('before');
    expect(result).toHaveProperty('after');
  });

  it('errors when required flags are missing', async () => {
    const { error } = await runCommand('health-factor preview');
    expect(error).toBeDefined();
  });

  it('shows help text', async () => {
    const { stdout } = await runCommand('health-factor preview --help');
    expect(stdout).toContain('Preview health factor');
    expect(stdout).toContain('--action');
    expect(stdout).toContain('--market');
    expect(stdout).toContain('--token');
    expect(stdout).toContain('--amount');
  });
});
