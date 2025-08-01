import { evmAddress } from '@aave/react';
import { Suspense } from 'react';
import { ConnectButton, useActiveAccount } from 'thirdweb/react';
import { baseSepolia, market, usdc } from './config';
import { SupplyForm } from './SupplyForm';
import { client } from './thirdwebClient';

export function App() {
  const account = useActiveAccount();

  if (!account) {
    return <ConnectButton client={client} />;
  }

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <h1>Aave React SDK + thirdweb SDK</h1>
      <p>
        This example lets you deposit Base Sepolia ETH on the Aave market on
        Base Sepolia.
      </p>
      <SupplyForm
        chainId={baseSepolia}
        market={market}
        underlyingToken={usdc}
        wallet={evmAddress(account.address)}
      />
    </Suspense>
  );
}
