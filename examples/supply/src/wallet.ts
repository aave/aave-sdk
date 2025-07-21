import 'viem/window';

import { type Address, createWalletClient, custom } from 'viem';
import { mainnet } from 'viem/chains';

const chain = mainnet;

const [address]: [Address] = await window.ethereum!.request({
  method: 'eth_requestAccounts',
});

export const walletClient = createWalletClient({
  account: address,
  chain,
  transport: custom(window.ethereum!),
});

const chainId = await walletClient.getChainId();

if (chainId !== chain.id) {
  try {
    await walletClient.switchChain({ id: chain.id });
  } catch {
    await walletClient.addChain({ chain });
  }
}

export { address };
