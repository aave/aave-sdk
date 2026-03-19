import { describe, expect, it } from 'vitest';
import { runCommand } from '../helpers.js';

describe('vaults list', () => {
  it('lists vaults', async () => {
    const { stdout, error } = await runCommand('vaults list');
    expect(error).toBeUndefined();
    expect(stdout).toBeDefined();
  });

  it('returns JSON output', async () => {
    const { result, error } =
      await runCommand<Record<string, unknown>>('vaults list --json');
    expect(error).toBeUndefined();
    expect(result).toHaveProperty('items');
  });

  it('shows help text', async () => {
    const { stdout } = await runCommand('vaults list --help');
    expect(stdout).toContain('List Aave v3 vaults');
    expect(stdout).toContain('--user');
    expect(stdout).toContain('--owner');
  });
});
