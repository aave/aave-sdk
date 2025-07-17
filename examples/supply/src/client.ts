import { AaveClient, local } from '@aave/react';

export const client = AaveClient.create({
  environment: local,
});
