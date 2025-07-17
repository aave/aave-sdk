import { AaveClient } from '@aave/client';
import { staging } from '@aave/env';

export const client = AaveClient.create({
  environment: staging,
});

