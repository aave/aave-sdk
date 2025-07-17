import { AaveProvider, useUserSupplies, useUserBorrows, evmAddress, chainId, useAaveMarkets, ZERO_ADDRESS  } from '@aave/react';
import { client } from './client';

// TODO: change to your address or any address you want to query
const user = evmAddress("ZERO_ADDRESS");

function UserPositions() {
  const { data: markets, loading: marketsLoading } = useAaveMarkets({
    chainIds: [chainId(1), chainId(8453)],
  });

  const marketAddresses = markets?.map(market => ({
    address: market.address,
    chainId: market.chain.chainId,
  })) || [];

  const { data: userSupplies, loading: userSuppliesLoading } = useUserSupplies({
    markets: marketAddresses,
    user,
  });

  const { data: userBorrows, loading: userBorrowsLoading } = useUserBorrows({
    markets: marketAddresses,
    user,
  });

  if (userSuppliesLoading || userBorrowsLoading || marketsLoading) {
    return <p>Loading positions...</p>;
  }

  return (
    <>
      <header>
        <h1>👻 Aave V3 User Positions</h1>
        <p>Address: {user}</p>
      </header>
      
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h2>Supply Positions ({userSupplies?.length || 0})</h2>
        
        {userSupplies?.map((position, index) => (
          <div key={index} style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '16px',
            margin: '16px 0',
            backgroundColor: '#f9f9f9'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <img 
                src={position.currency.imageUrl} 
                alt={position.currency.symbol}
                style={{ width: '32px', height: '32px', marginRight: '12px' }}
              />
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0', color: '#333' }}>
                  {position.currency.name} ({position.currency.symbol})
                </h3>
                <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                  {position.market.name}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img 
                  src={position.market.chain.icon} 
                  alt={position.market.chain.name}
                  style={{ width: '20px', height: '20px' }}
                />
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0', fontWeight: 'bold', fontSize: '14px', color: '#333' }}>
                    {position.market.chain.name}
                  </p>
                  <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>
                    Chain ID: {position.market.chain.chainId}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <p style={{ margin: '4px 0', fontWeight: 'bold', color: '#333' }}>Balance</p>
                <p style={{ margin: '4px 0', fontSize: '18px' }}>
                  {parseFloat(position.balance.amount.value).toFixed(6)} {position.currency.symbol}
                </p>
                <p style={{ margin: '4px 0', color: '#666' }}>
                  ${parseFloat(position.balance.usd).toFixed(2)} USD
                </p>
              </div>

              <div>
                <p style={{ margin: '4px 0', fontWeight: 'bold', color: '#333' }}>Supply APY</p>
                <p style={{ margin: '4px 0', fontSize: '18px', color: '#00a86b' }}>
                  {(parseFloat(position.apy.value) * 100).toFixed(2)}%
                </p>
              </div>

              <div>
                <p style={{ margin: '4px 0', fontWeight: 'bold', color: '#333' }}>Token Price</p>
                <p style={{ margin: '4px 0', fontSize: '18px' }}>
                  ${parseFloat(position.balance.usdPerToken).toLocaleString()}
                </p>
              </div>

              <div>
                <p style={{ margin: '4px 0', fontWeight: 'bold', color: '#333' }}>Collateral Status</p>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    backgroundColor: position.canBeCollateral ? '#e8f5e8' : '#f5e8e8',
                    color: position.canBeCollateral ? '#2d5016' : '#5d1a1a'
                  }}>
                    {position.canBeCollateral ? '✅ Can Collateralize' : '❌ Cannot Collateralize'}
                  </span>
                  {position.isCollateral && (
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      backgroundColor: '#e3f2fd',
                      color: '#1565c0'
                    }}>
                      🔒 Used as Collateral
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {userSupplies?.length === 0 && (
          <p style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
            No supply positions found for this address.
          </p>
        )}

        <h2>Borrow Positions ({userBorrows?.length || 0})</h2>
        
        {userBorrows?.map((position, index) => (
          <div key={index} style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '16px',
            margin: '16px 0',
            backgroundColor: '#fff9f9'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <img 
                src={position.currency.imageUrl} 
                alt={position.currency.symbol}
                style={{ width: '32px', height: '32px', marginRight: '12px' }}
              />
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0', color: '#333' }}>
                  {position.currency.name} ({position.currency.symbol})
                </h3>
                <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                  {position.market.name}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img 
                  src={position.market.chain.icon} 
                  alt={position.market.chain.name}
                  style={{ width: '20px', height: '20px' }}
                />
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0', fontWeight: 'bold', fontSize: '14px', color: '#333' }}>
                    {position.market.chain.name}
                  </p>
                  <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>
                    Chain ID: {position.market.chain.chainId}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <p style={{ margin: '4px 0', fontWeight: 'bold', color: '#333' }}>Debt Amount</p>
                <p style={{ margin: '4px 0', fontSize: '18px' }}>
                  {parseFloat(position.debt.amount.value).toFixed(6)} {position.currency.symbol}
                </p>
                <p style={{ margin: '4px 0', color: '#666' }}>
                  ${parseFloat(position.debt.usd).toFixed(2)} USD
                </p>
              </div>

              <div>
                <p style={{ margin: '4px 0', fontWeight: 'bold', color: '#333' }}>Borrow APY</p>
                <p style={{ margin: '4px 0', fontSize: '18px', color: '#d73527' }}>
                  {(parseFloat(position.apy.value) * 100).toFixed(2)}%
                </p>
              </div>

              <div>
                <p style={{ margin: '4px 0', fontWeight: 'bold', color: '#333' }}>Token Price</p>
                <p style={{ margin: '4px 0', fontSize: '18px' }}>
                  ${parseFloat(position.debt.usdPerToken).toLocaleString()}
                </p>
              </div>

              <div>
                <p style={{ margin: '4px 0', fontWeight: 'bold', color: '#333' }}>Borrow Type</p>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  backgroundColor: '#ffe8e8',
                  color: '#8b0000'
                }}>
                  📉 Borrowed Debt
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {userBorrows?.length === 0 && (
          <p style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
            No borrow positions found for this address.
          </p>
        )}
      </div>
    </>
  );
}

export function App() {
  return (
    <AaveProvider client={client}>
      <UserPositions />
    </AaveProvider>
  );
}
