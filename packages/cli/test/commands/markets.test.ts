import { describe, expect, it } from 'vitest';
import { runCommand } from '../helpers.js';

describe('markets list', () => {
  it('lists markets for a specific chain', async () => {
    const { stdout, error } = await runCommand('markets list --chain 1');
    expect(error).toBeUndefined();
    expect(stdout).toContain('Market');
    expect(stdout).toContain('Ethereum');
  });

  it('returns JSON output', async () => {
    const { result, error } = await runCommand<unknown[]>(
      'markets list --chain 1 --json',
    );
    expect(error).toBeUndefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result!.length).toBeGreaterThan(0);

    const first = result![0] as Record<string, unknown>;
    expect(first).toHaveProperty('name');
    expect(first).toHaveProperty('address');
    expect(first).toHaveProperty('chain');
  });

  it('shows help text', async () => {
    const { stdout } = await runCommand('markets list --help');
    expect(stdout).toContain('List Aave v3 markets');
    expect(stdout).toContain('--chain');
  });
});
