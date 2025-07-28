import { chainId, evmAddress } from '@aave/react';
import { useLogin, usePrivy } from '@privy-io/react-auth';
import { Suspense } from 'react';
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
            walletChainType: 'ethereum-and-solana',
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
      <SupplyForm
        chainId={chainId(99999999)}
        market={evmAddress('0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2')}
        underlyingToken={evmAddress(
          '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        )}
        wallet={user!.wallet!}
      />
    </Suspense>
  );
}
