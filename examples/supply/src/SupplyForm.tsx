import {
  bigDecimal,
  errAsync,
  evmAddress,
  type Reserve,
  useSupply,
} from '@aave/react';
import { useSendTransaction } from '@aave/react/viem';
import { useState } from 'react';
import type { WalletClient } from 'viem';

interface SupplyFormProps {
  reserve: Reserve;
  walletClient: WalletClient;
}

export function SupplyForm({ reserve, walletClient }: SupplyFormProps) {
  const [amount, setAmount] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  const [supply, supplying] = useSupply();
  const [sendTransaction, sending] = useSendTransaction(walletClient);

  const loading = supplying.loading || sending.loading;
  const error = supplying.error || sending.error;

  const handleSupply = async () => {
    if (!amount) {
      setStatus('Please enter an amount');
      return;
    }

    const result = await supply({
      chainId: reserve.market.chain.chainId,
      market: reserve.market.address,
      amount: {
        erc20: {
          currency: reserve.underlyingToken.address,
          value: bigDecimal(amount),
        },
      },
      supplier: evmAddress(walletClient.account!.address),
    }).andThen((plan) => {
      switch (plan.__typename) {
        case 'TransactionRequest':
          setStatus('Sending transaction...');
          return sendTransaction(plan);

        case 'ApprovalRequired':
          setStatus('Approval required. Sending approval transaction...');

          return sendTransaction(plan.approval).andThen(() => {
            setStatus('Approval sent. Now sending supply transaction...');

            return sendTransaction(plan.originalTransaction);
          });

        case 'InsufficientBalanceError':
          setStatus(
            `Insufficient balance: ${plan.available.value} ${reserve.underlyingToken.symbol}`,
          );
          return errAsync(
            new Error(`Insufficient balance: ${plan.required.value}`),
          );
      }
    });

    if (result.isOk()) {
      setStatus('Supply successful!');
    }
  };

  return (
    <div>
      <label
        style={{
          marginBottom: '5px',
        }}
      >
        <strong style={{ display: 'block' }}>Amount:</strong>
        <input
          disabled={loading}
          type='number'
          onChange={(e) => setAmount(e.target.value)}
          style={{ width: '100%', padding: '8px' }}
          placeholder='Amount to supply (in token units)'
        />
        <small style={{ color: '#666' }}>
          Human-friendly amount (e.g. 1.23, 4.56, 7.89)
        </small>
      </label>

      <button type='button' disabled={loading} onClick={handleSupply}>
        Supply
      </button>

      {status && <p style={{ marginBottom: '10px' }}>{status}</p>}

      {error && <p style={{ color: '#f44336' }}>Error: {error.toString()}</p>}
    </div>
  );
}
