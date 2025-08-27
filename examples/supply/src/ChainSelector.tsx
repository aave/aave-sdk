import {
  type Chain,
  type ChainId,
  ChainsFilter,
  type EvmAddress,
  useAaveChains,
} from '@aave/react';

interface ChainSelectorProps {
  initialValue?: ChainId;
  onChange: (chain: Chain) => void;
  disabled?: boolean;
}

export function ChainSelector({
  initialValue: selectedChainId,
  onChange: onChainSelect,
  disabled = false,
}: ChainSelectorProps) {
  const { data: chains } = useAaveChains({
    suspense: true,
    filter: ChainsFilter.ALL,
  });

  const firstChain = chains?.[0];
  if (firstChain) {
    const test: EvmAddress = firstChain.chainId;
  }

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedChain = chains.find(
      (chain) => chain.chainId === Number(event.target.value),
    );
    if (selectedChain) {
      onChainSelect(selectedChain);
    }
  };

  if (chains.length === 0) {
    return <p style={{ marginBottom: '5px' }}>No chains found</p>;
  }

  return (
    <label style={{ marginBottom: '5px' }}>
      <strong style={{ display: 'block' }}>Chain:</strong>
      <select
        value={selectedChainId || ''}
        onChange={handleChange}
        disabled={disabled}
        style={{ padding: '8px', width: '100%' }}
      >
        <option value=''>Select a chain</option>
        {chains.map((chain) => (
          <option key={chain.chainId} value={chain.chainId}>
            {chain.name} (ID: {chain.chainId})
          </option>
        ))}
      </select>
    </label>
  );
}
