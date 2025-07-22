import type { Reserve } from '@aave/react';

interface ReserveSelectorProps {
  children?: React.ReactNode;
  reserves: Reserve[];
  onChange: (reserve: Reserve) => void;
}

export function ReserveSelector({
  children,
  reserves,
  onChange,
}: ReserveSelectorProps) {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedReserve = reserves.find(
      (reserve) => reserve.underlyingToken.address === event.target.value,
    );
    console.log(selectedReserve);
    if (selectedReserve) {
      onChange(selectedReserve);
    }
  };

  return (
    <label style={{ marginBottom: '5px' }}>
      <strong style={{ display: 'block' }}>Reserve:</strong>
      <select onChange={handleChange} style={{ padding: '8px', width: '100%' }}>
        {reserves.map((reserve) => (
          <option
            key={reserve.underlyingToken.address}
            value={reserve.underlyingToken.address}
          >
            {reserve.underlyingToken.symbol} - APY:{' '}
            {reserve.supplyInfo.apy.value}%
          </option>
        ))}
      </select>
      {children}
    </label>
  );
}
