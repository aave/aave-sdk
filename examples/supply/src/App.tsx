import { type ChainId, chainId, type Market, type Reserve } from '@aave/react';
import { Suspense, useState } from 'react';
import { ChainSelector } from './ChainSelector';
import { MarketSelector } from './MarketSelector';
import { ReserveSelector } from './ReserveSelector';
import { SupplyForm } from './SupplyForm';
import { address, walletClient } from './wallet';

const INITIAL_CHAIN_ID = chainId(1);

export function App() {
  const [chainId, setChainId] = useState<ChainId>(INITIAL_CHAIN_ID);
  const [market, setMarket] = useState<Market | null>(null);
  const [reserve, setReserve] = useState<Reserve | null>(null);

  const handleMarketSelect = (market: Market) => {
    setMarket(market);
    setReserve(market.supplyReserves[0]);
  };

  return (
    <div>
      <header style={{ textAlign: 'center', padding: '20px' }}>
        <h1>Aave Supply Example</h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          This example demonstrates how to supply assets to an Aave market using
          the Aave React SDK.
        </p>
      </header>
      <div
        style={{
          backgroundColor: '#e8f5e8',
          border: '1px solid #4CAF50',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '20px',
        }}
      >
        <strong>✅ Wallet Connected:</strong> {address}
      </div>

      <Suspense fallback={<div>Loading chains...</div>}>
        <ChainSelector
          initialValue={chainId}
          onChange={(chain) => setChainId(chain.chainId)}
        />

        <Suspense
          fallback={
            <div style={{ marginBottom: '10px' }}>Loading markets...</div>
          }
        >
          <MarketSelector chainId={chainId} onChange={handleMarketSelect} />

          {market && (
            <>
              <ReserveSelector
                reserves={market.supplyReserves}
                onChange={setReserve}
              >
                <small style={{ color: '#666' }}>
                  The token you want to supply to the market
                </small>
              </ReserveSelector>

              {reserve && (
                <SupplyForm reserve={reserve} walletClient={walletClient} />
              )}
            </>
          )}
        </Suspense>
      </Suspense>
    </div>
  );
}
