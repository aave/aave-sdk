import {
  AaveProvider,
  chainId,
  evmAddress,
  type Market,
  type Reserve,
  type TxHash,
  useAaveMarkets,
  useSupply,
} from '@aave/react';
import { useSendTransaction } from '@aave/react/viem';
import { useEffect, useState } from 'react';
import { client } from './client';
import { address, walletClient } from './wallet';

const CHAIN_ID = 1; // use whatever chain id you want

function SupplyExample() {
  const {
    data: markets,
    loading: marketsLoading,
    error: marketsError,
  } = useAaveMarkets({
    chainIds: [chainId(CHAIN_ID)],
  });

  const [supply, supplying] = useSupply();
  const [sendTransaction, sending] = useSendTransaction(walletClient);

  const [marketAddress, setMarketAddress] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [amount, setAmount] = useState('1000');
  const [supplierAddress, setSupplierAddress] = useState(address as string);

  const [txStatus, setTxStatus] = useState<string>('');
  const [txHash, setTxHash] = useState<TxHash | null>(null);

  useEffect(() => {
    if (markets && !marketsLoading && !marketsError) {
      const mainnetMarket = markets.find(
        (market: Market) => market.name === 'AaveV3Ethereum',
      );
      const usdcToken = mainnetMarket?.supplyReserves.find(
        (reserve: Reserve) =>
          reserve.underlyingToken.symbol.toLowerCase() === 'usdc',
      );
      if (mainnetMarket && usdcToken) {
        setMarketAddress(mainnetMarket.address);
        setTokenAddress(usdcToken.underlyingToken.address);
      }
    }
  }, [markets, marketsLoading, marketsError]);

  if (marketsLoading) return <div>Loading mainnet market...</div>;
  if (marketsError) return <div>Error loading market</div>;
  if (!markets || markets.length === 0) return <div>No markets found</div>;

  const mainnetMarket = markets.find(
    (market: Market) => market.name === 'AaveV3Ethereum',
  );
  if (!mainnetMarket) return <div>Mainnet market not found</div>;

  const loading = supplying.loading || sending.loading;
  const error = supplying.error || sending.error;

  const handleSupply = async () => {
    setTxStatus('Preparing supply transaction...');
    setTxHash(null);

    try {
      const result = await supply({
        market: evmAddress(marketAddress),
        amount: {
          erc20: {
            currency: evmAddress(tokenAddress),
            value: amount,
          },
        },
        supplier: evmAddress(supplierAddress),
        chainId: chainId(CHAIN_ID),
      }).andThen((plan) => {
        switch (plan.__typename) {
          case 'TransactionRequest':
            setTxStatus('Sending transaction...');
            return sendTransaction(plan);
          case 'ApprovalRequired':
            setTxStatus('Approval required. Sending approval transaction...');
            return sendTransaction(plan.approval).andThen(() => {
              setTxStatus('Approval sent. Now sending supply transaction...');
              return sendTransaction(plan.originalTransaction);
            });
          default:
            throw new Error(`Unhandled plan type: ${plan.__typename}`);
        }
      });

      if (result.isErr()) {
        console.error('Supply failed:', result.error);
        setTxStatus(`Supply failed: ${result.error}`);
      } else {
        console.log('Supply successful:', result.value);
        setTxStatus('Supply successful!');
        // result.value is the transaction hash
        setTxHash(result.value);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setTxStatus(`Unexpected error: ${err}`);
    }
  };

  const resetForm = () => {
    setTxStatus('');
    setTxHash(null);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2>Aave Supply Example</h2>
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
      <p style={{ color: '#666', marginBottom: '30px' }}>
        This example demonstrates how to supply assets to an Aave market using
        the SDK.
      </p>

      <div style={{ marginBottom: '20px' }}>
        <h3>Supply Parameters</h3>
        <div style={{ display: 'grid', gap: '15px' }}>
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: 'bold',
              }}
            >
              Market Address:
            </label>
            <input
              type='text'
              value={marketAddress}
              onChange={(e) => setMarketAddress(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                fontFamily: 'monospace',
                fontSize: '12px',
              }}
              placeholder='Auto-populated from mainnet market'
            />
            <small style={{ color: '#666' }}>
              Default: Aave V3 Ethereum mainnet
            </small>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: 'bold',
              }}
            >
              Token Address:
            </label>
            <input
              type='text'
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                fontFamily: 'monospace',
                fontSize: '12px',
              }}
              placeholder='ERC20 token address to supply'
            />
            <small style={{ color: '#666' }}>
              The token you want to supply to the market
            </small>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: 'bold',
              }}
            >
              Amount:
            </label>
            <input
              type='text'
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
              placeholder='Amount to supply (in token units)'
            />
            <small style={{ color: '#666' }}>
              Amount in the smallest unit of the token
            </small>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: 'bold',
              }}
            >
              Supplier Address:
            </label>
            <input
              type='text'
              value={supplierAddress}
              onChange={(e) => setSupplierAddress(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                fontFamily: 'monospace',
                fontSize: '12px',
              }}
              placeholder='Address that will supply the tokens'
            />
            <small style={{ color: '#666' }}>
              Connected wallet address (auto-populated)
            </small>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button
          type='button'
          onClick={handleSupply}
          disabled={
            loading ||
            !marketAddress ||
            !tokenAddress ||
            !amount ||
            !supplierAddress
          }
          style={{
            backgroundColor: loading ? '#ccc' : '#4CAF50',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            marginRight: '10px',
          }}
        >
          {loading ? 'Processing...' : 'Supply to Aave'}
        </button>

        <button
          type='button'
          onClick={resetForm}
          style={{
            backgroundColor: '#f44336',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          Reset
        </button>
      </div>

      {(txStatus || error) && (
        <div
          style={{
            padding: '15px',
            borderRadius: '4px',
            marginBottom: '20px',
            backgroundColor: error
              ? '#ffebee'
              : txStatus.includes('failed')
                ? '#ffebee'
                : '#e8f5e8',
            border: `1px solid ${error ? '#f44336' : txStatus.includes('failed') ? '#f44336' : '#4CAF50'}`,
          }}
        >
          <h4 style={{ margin: '0 0 10px 0' }}>Transaction Status</h4>
          {error && (
            <p style={{ color: '#f44336', margin: '0' }}>
              Error: {error.toString()}
            </p>
          )}
          {txStatus && <p style={{ margin: '0' }}>{txStatus}</p>}
          {txHash && (
            <p style={{ margin: '10px 0 0 0' }}>
              <strong>Transaction Hash:</strong>{' '}
              <code
                style={{
                  backgroundColor: '#f5f5f5',
                  padding: '2px 4px',
                  borderRadius: '2px',
                }}
              >
                {txHash}
              </code>
            </p>
          )}
        </div>
      )}

      {/* Educational Information */}
      <div
        style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #dee2e6',
        }}
      >
        <h3>How This Works</h3>
        <ol style={{ lineHeight: '1.6' }}>
          <li>
            <strong>useSupply Hook:</strong> Prepares the supply transaction
            with your parameters
          </li>
          <li>
            <strong>Transaction Planning:</strong> The SDK determines if token
            approval is needed
          </li>
          <li>
            <strong>Approval (if needed):</strong> If this is the first time
            supplying this token, an approval transaction is sent first
          </li>
          <li>
            <strong>Supply Transaction:</strong> The actual supply transaction
            is executed
          </li>
          <li>
            <strong>Result Handling:</strong> Success or error states are
            handled appropriately
          </li>
        </ol>

        <h4>Transaction Types</h4>
        <ul style={{ lineHeight: '1.6' }}>
          <li>
            <strong>TransactionRequest:</strong> Direct supply transaction
            (token already approved)
          </li>
          <li>
            <strong>ApprovalRequired:</strong> Two-step process - approval
            first, then supply
          </li>
        </ul>
      </div>
    </div>
  );
}

export function App() {
  return (
    <AaveProvider client={client}>
      <header style={{ textAlign: 'center', padding: '20px' }}>
        <h1>Aave Supply Transaction Example</h1>
      </header>
      <SupplyExample />
    </AaveProvider>
  );
}
