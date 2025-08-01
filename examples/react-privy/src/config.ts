import { chainId, evmAddress } from '@aave/react';
import { AaveV3BaseSepolia } from '@bgd-labs/aave-address-book';

export const baseSepolia = chainId(AaveV3BaseSepolia.CHAIN_ID);
export const market = evmAddress(AaveV3BaseSepolia.POOL);
export const usdc = evmAddress(AaveV3BaseSepolia.ASSETS.WETH.UNDERLYING);
