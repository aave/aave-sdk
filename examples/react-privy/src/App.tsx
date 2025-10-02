import { useLogin, usePrivy } from '@privy-io/react-auth';
import { Suspense } from 'react';
import { baseSepolia, market, usdc } from './config';
import { SupplyForm } from './SupplyForm';

export function App() {
  const { ready, authenticated, user } = usePrivy();
  const { login } = useLogin();

  if (!ready) {
    return <div>Loading...</div>;
  }

  if (!authenticated) {
    return (
      <button
        type='button'
        onClick={() =>
          login({
            loginMethods: ['wallet'],
            walletChainType: 'ethereum-only',
            disableSignup: false,
          })
        }
      >
        Log in
      </button>
    );
  }

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <h1>Aave React SDK + Privy Wallet</h1>
      <p>
        This example lets you deposit Base Sepolia ETH on the Aave market on
        Base Sepolia.
      </p>
      <SupplyForm
        chainId={baseSepolia}
        market={market}
        underlyingToken={usdc}
        wallet={user!.wallet!}
      />
    </Suspense>
  );
}
