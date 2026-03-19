import { describe, expect, it } from 'vitest';
import { runCommand } from '../helpers.js';

const ACTIVE_USER = '0x25F2226B597E8F9514B3F68F00f494cF4f286491';

describe('incentives list', () => {
  it('runs the incentives command without crashing on valid input', async () => {
    const { stdout, error } = await runCommand(
      `incentives list --user ${ACTIVE_USER} --chain 1`,
    );
    // The Merkl rewards API may be intermittently unavailable,
    // so we accept either success or a server error
    if (error) {
      expect(error.message).toContain('Server error');
    } else {
      expect(stdout).toBeDefined();
    }
  });

  it('errors when required flags are missing', async () => {
    const { error } = await runCommand('incentives list');
    expect(error).toBeDefined();
  });

  it('shows help text', async () => {
    const { stdout } = await runCommand('incentives list --help');
    expect(stdout).toContain('Merit reward');
    expect(stdout).toContain('--user');
    expect(stdout).toContain('--chain');
  });
});
