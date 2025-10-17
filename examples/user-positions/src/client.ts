import { AaveClient, staging } from '@aave/react';

export const client = AaveClient.create({
  environment: staging,
});
