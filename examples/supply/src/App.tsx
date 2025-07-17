import React, { useState } from "react";
import { AaveProvider, useSupply, evmAddress, chainId, useAaveMarkets } from "@aave/react";
import { useSendTransaction } from "@aave/react/viem";
import { client } from './client';

function SupplyExample() {
  // All hooks must be called at the top level, before any conditional returns
  const { data: markets, loading: marketsLoading, error: marketsError } = useAaveMarkets({
    chainIds: [chainId(1)]
  });

  const [supply, supplying] = useSupply();
  const [sendTransaction, sending] = useSendTransaction(undefined); // In a real app, pass the wallet client here
  
  // Form state
  const [marketAddress, setMarketAddress] = useState("0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2"); // Aave V3 Ethereum
  const [tokenAddress, setTokenAddress] = useState("0xa0b86a33e6441c8c5f0bb9b7e5e1f8bbf5b78b5c"); // Example token
  const [amount, setAmount] = useState("1000");
  const [supplierAddress, setSupplierAddress] = useState("0x742d35cc6e5c4ce3b69a2a8c7c8e5f7e9a0b1234"); // Example supplier
  
  // Transaction status
  const [txStatus, setTxStatus] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");

  // Early returns after all hooks are called
  if (marketsLoading) return <div>Loading mainnet market...</div>;
  if (marketsError) return <div>Error loading market</div>;
  if (!markets || markets.length === 0) return <div>No markets found</div>;

  const mainnetMarket = markets.find((market: any) => market.name === "AaveV3Ethereum");
  if (!mainnetMarket) return <div>Mainnet market not found</div>;

  const loading = supplying.loading || sending.loading;
  const error = supplying.error || sending.error;

  const handleSupply = async () => {
    setTxStatus("Preparing supply transaction...");
    setTxHash("");

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
        chainId: chainId(1),
      }).andThen((plan) => {
        switch (plan.__typename) {
          case "TransactionRequest":
            setTxStatus("Sending transaction...");
            return sendTransaction(plan);
          case "ApprovalRequired":
            setTxStatus("Approval required. Sending approval transaction...");
            return sendTransaction(plan.approval).andThen(() => {
              setTxStatus("Approval sent. Now sending supply transaction...");
              return sendTransaction(plan.originalTransaction);
            });
          default:
            throw new Error(`Unhandled plan type: ${(plan as any).__typename}`);
        }
      });

      if (result.isErr()) {
        console.error("Supply failed:", result.error);
        setTxStatus(`Supply failed: ${result.error}`);
      } else {
        console.log("Supply successful:", result.value);
        setTxStatus("Supply successful!");
        // result.value is the transaction hash
        setTxHash(result.value as string);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setTxStatus(`Unexpected error: ${err}`);
    }
  };

  const resetForm = () => {
    setTxStatus("");
    setTxHash("");
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2>Aave Supply Example</h2>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        This example demonstrates how to supply assets to an Aave market using the SDK.
      </p>

      <div style={{ marginBottom: '20px' }}>
        <h3>Supply Parameters</h3>
        <div style={{ display: 'grid', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Market Address:
            </label>
            <input
              type="text"
              value={marketAddress}
              onChange={(e) => setMarketAddress(e.target.value)}
              style={{ width: '100%', padding: '8px', fontFamily: 'monospace', fontSize: '12px' }}
              placeholder="Aave market address"
            />
            <small style={{ color: '#666' }}>Default: Aave V3 Ethereum mainnet</small>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Token Address:
            </label>
            <input
              type="text"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              style={{ width: '100%', padding: '8px', fontFamily: 'monospace', fontSize: '12px' }}
              placeholder="ERC20 token address to supply"
            />
            <small style={{ color: '#666' }}>The token you want to supply to the market</small>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Amount:
            </label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
              placeholder="Amount to supply (in token units)"
            />
            <small style={{ color: '#666' }}>Amount in the smallest unit of the token</small>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Supplier Address:
            </label>
            <input
              type="text"
              value={supplierAddress}
              onChange={(e) => setSupplierAddress(e.target.value)}
              style={{ width: '100%', padding: '8px', fontFamily: 'monospace', fontSize: '12px' }}
              placeholder="Address that will supply the tokens"
            />
            <small style={{ color: '#666' }}>The wallet address supplying the tokens</small>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={handleSupply}
          disabled={loading || !marketAddress || !tokenAddress || !amount || !supplierAddress}
          style={{
            backgroundColor: loading ? '#ccc' : '#4CAF50',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            marginRight: '10px'
          }}
        >
          {loading ? 'Processing...' : 'Supply to Aave'}
        </button>
        
        <button
          onClick={resetForm}
          style={{
            backgroundColor: '#f44336',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Reset
        </button>
      </div>

      {/* Status Display */}
      {(txStatus || error) && (
        <div style={{
          padding: '15px',
          borderRadius: '4px',
          marginBottom: '20px',
          backgroundColor: error ? '#ffebee' : txStatus.includes('failed') ? '#ffebee' : '#e8f5e8',
          border: `1px solid ${error ? '#f44336' : txStatus.includes('failed') ? '#f44336' : '#4CAF50'}`
        }}>
          <h4 style={{ margin: '0 0 10px 0' }}>Transaction Status</h4>
          {error && <p style={{ color: '#f44336', margin: '0' }}>Error: {error.toString()}</p>}
          {txStatus && <p style={{ margin: '0' }}>{txStatus}</p>}
          {txHash && (
            <p style={{ margin: '10px 0 0 0' }}>
              <strong>Transaction Hash:</strong>{' '}
              <code style={{ backgroundColor: '#f5f5f5', padding: '2px 4px', borderRadius: '2px' }}>
                {txHash}
              </code>
            </p>
          )}
        </div>
      )}

      {/* Educational Information */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <h3>How This Works</h3>
        <ol style={{ lineHeight: '1.6' }}>
          <li><strong>useSupply Hook:</strong> Prepares the supply transaction with your parameters</li>
          <li><strong>Transaction Planning:</strong> The SDK determines if token approval is needed</li>
          <li><strong>Approval (if needed):</strong> If this is the first time supplying this token, an approval transaction is sent first</li>
          <li><strong>Supply Transaction:</strong> The actual supply transaction is executed</li>
          <li><strong>Result Handling:</strong> Success or error states are handled appropriately</li>
        </ol>
        
        <h4>Transaction Types</h4>
        <ul style={{ lineHeight: '1.6' }}>
          <li><strong>TransactionRequest:</strong> Direct supply transaction (token already approved)</li>
          <li><strong>ApprovalRequired:</strong> Two-step process - approval first, then supply</li>
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