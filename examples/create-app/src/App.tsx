import { AaveProvider, useAaveChains, useAaveMarkets } from '@aave/react';
import { chainId } from '@aave/types';
import { client } from './client';

console.log("client", client);

function MarketDisplay() {
  const { data: markets, loading, error } = useAaveMarkets({
    chainIds: [chainId(1)], // Mainnet
  });

  const { data: chains, loading: chainsLoading, error: chainsError } = useAaveChains();

  console.log("chains", chains);
  console.log("markets", markets);
  if (loading) return <div>Loading mainnet market...</div>;
  console.error("error", error);

  if (error) return <div>Error loading market</div>;
  if (!markets || markets.length === 0) return <div>No markets found</div>;

  const mainnetMarket = markets[0];

  return (
    <div>
      <h2>Mainnet Market (Chain ID: 1)</h2>
      <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>
        <p><strong>Name:</strong> {mainnetMarket.name}</p>
        <p><strong>Address:</strong> {mainnetMarket.address}</p>
        <p><strong>Chain ID:</strong> {mainnetMarket.chain.chainId}</p>
        <p><strong>Chain Name:</strong> {mainnetMarket.chain.name}</p>
        <p><strong>Total Market Size:</strong> {mainnetMarket.totalMarketSize}</p>
        <p><strong>Available Liquidity:</strong> {mainnetMarket.totalAvailableLiquidity}</p>
        <p><strong>Supply Reserves:</strong> {mainnetMarket.supplyReserves?.length || 0}</p>
        <p><strong>Borrow Reserves:</strong> {mainnetMarket.borrowReserves?.length || 0}</p>
        
        {mainnetMarket.supplyReserves && mainnetMarket.supplyReserves.length > 0 && (
          <div>
            <h3>First few supply reserves:</h3>
            <ul>
              {mainnetMarket.supplyReserves.slice(0, 3).map((reserve: any, index: number) => (
                <li key={index}>
                  {reserve.underlyingToken.name} ({reserve.underlyingToken.symbol})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export function App() {
  return (
    <AaveProvider client={client}>
      <header>
        <h1>example-create-app</h1>
      </header>
      <div>
        <p>
          Edit <code>src/App.tsx</code>.
        </p>
        <MarketDisplay />
      </div>
    </AaveProvider>
  );
}
