import { type ChainId, type Market, useAaveMarkets } from '@aave/react';
import { useEffect } from 'react';

interface MarketSelectorProps {
  chainId: ChainId;
  onChange: (market: Market) => void;
}

export function MarketSelector({
  chainId,
  onChange: onMarketSelect,
}: MarketSelectorProps) {
  const { data: markets } = useAaveMarkets({
    chainIds: [chainId],
    suspense: true,
  });

  useEffect(() => {
    if (markets.length > 0) {
      onMarketSelect(markets[0]);
    }
  }, [markets, onMarketSelect]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedMarket = markets.find(
      (market) => market.address === event.target.value,
    );
    if (selectedMarket) {
      onMarketSelect(selectedMarket);
    }
  };

  if (markets.length === 0) {
    return <p style={{ marginBottom: '5px' }}>No markets found</p>;
  }

  return (
    <label style={{ marginBottom: '5px' }}>
      <strong style={{ display: 'block' }}>Market:</strong>
      <select
        onChange={handleChange}
        disabled={markets.length === 1}
        style={{ padding: '8px', width: '100%' }}
      >
        {markets.map((market) => (
          <option key={market.address} value={market.address}>
            {market.name} - ${market.totalMarketSize}
          </option>
        ))}
      </select>
      <small style={{ color: '#666' }}>
        {markets.length === 1
          ? 'Only one market found'
          : 'Select the market you want to supply to'}
      </small>
    </label>
  );
}
