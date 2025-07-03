import { describe, it } from 'vitest';
import { client, wallet } from '../test-utils';
import { sendWith } from '../viem';
import { supply } from './transactions';

describe('Transactions', () => {
  it('should be able to run a test', async () => {
    const result = await supply(client, {} as any).andThen(sendWith(wallet));
  });
});
