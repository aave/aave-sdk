import {
  AaveProvider,
  type Market,
  type Reserve,
  useAaveMarkets,
} from '@aave/react';
import { chainId } from '@aave/types';
import { client } from './client';

function MarketDisplay() {
  const {
    data: markets,
    loading,
    error,
  } = useAaveMarkets({
    chainIds: [chainId(1)],
  });

  if (loading) return <div>Loading mainnet market...</div>;

  if (error) return <div>Error loading market</div>;
  if (!markets || markets.length === 0) return <div>No markets found</div>;

  const mainnetMarket = markets.find(
    (market: Market) => market.name === 'AaveV3Ethereum',
  );

  if (!mainnetMarket) return <div>Mainnet market not found</div>;

  return (
    <div>
      <h2>Mainnet Market (Chain ID: 1)</h2>
      <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>
        <p>
          <strong>Name:</strong> {mainnetMarket.name}
        </p>
        <p>
          <strong>Address:</strong> {mainnetMarket.address}
        </p>
        <p>
          <strong>Chain ID:</strong> {mainnetMarket.chain.chainId}
        </p>
        <p>
          <strong>Chain Name:</strong> {mainnetMarket.chain.name}
        </p>
        <p>
          <strong>Total Market Size:</strong> {mainnetMarket.totalMarketSize}
        </p>
        <p>
          <strong>Available Liquidity:</strong>{' '}
          {mainnetMarket.totalAvailableLiquidity}
        </p>
        <p>
          <strong>Supply Reserves:</strong>{' '}
          {mainnetMarket.supplyReserves?.length || 0}
        </p>
        <p>
          <strong>Borrow Reserves:</strong>{' '}
          {mainnetMarket.borrowReserves?.length || 0}
        </p>

        {mainnetMarket.supplyReserves &&
          mainnetMarket.supplyReserves.length > 0 && (
            <div>
              <h3>Supply Reserves:</h3>
              <ul>
                {mainnetMarket.supplyReserves.map((reserve: Reserve) => (
                  <li key={reserve.underlyingToken.address}>
                    {reserve.underlyingToken.name} (
                    {reserve.underlyingToken.symbol})
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
        <h1>Fetching Aave Markets</h1>
      </header>
      <div>
        <MarketDisplay />
      </div>
    </AaveProvider>
  );
}
