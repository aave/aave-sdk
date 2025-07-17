import { type Address, createWalletClient, custom } from 'viem';
import { mainnet } from 'viem/chains';

declare global {
  interface Window {
    ethereum?: any;
  }
}

const chain = mainnet;

const [address] = (await window.ethereum!.request({
  method: 'eth_requestAccounts',
})) as [Address];

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