import { AaveClient } from '@aave/client';
import { local } from '@aave/env';

export const client = AaveClient.create({
  environment: local,
});
