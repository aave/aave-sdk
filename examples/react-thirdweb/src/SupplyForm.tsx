import {
  bigDecimal,
  type ChainId,
  type EvmAddress,
  errAsync,
  useAaveReserve,
  useSupply,
} from '@aave/react';
import { useSendTransaction } from '@aave/react/thirdweb';
import { useState } from 'react';
import { client as thirdwebClient } from './thirdwebClient';

interface SupplyFormProps {
  chainId: ChainId;
  market: EvmAddress;
  underlyingToken: EvmAddress;
  wallet: EvmAddress;
}

export function SupplyForm({
  chainId,
  market,
  underlyingToken,
  wallet,
}: SupplyFormProps) {
  const { data: reserve } = useAaveReserve({
    chainId,
    market,
    underlyingToken,
    suspense: true,
  });
  const [status, setStatus] = useState<string>('');

  const [supply, supplying] = useSupply();
  const [sendTransaction, sending] = useSendTransaction(thirdwebClient);

  const loading = supplying.loading || sending.loading;
  const error = supplying.error || sending.error;

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const amount = e.currentTarget.amount.value as string;
    if (!amount) {
      setStatus('Please enter an amount');
      return;
    }

    const result = await supply({
      chainId: reserve!.market.chain.chainId,
      market: reserve!.market.address,
      amount: {
        native: bigDecimal(amount),
      },
      sender: wallet,
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
            `Insufficient balance: ${plan.available.value} ${reserve!.underlyingToken.symbol}`,
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
    <form onSubmit={submit}>
      <label
        style={{
          marginBottom: '5px',
        }}
      >
        <strong style={{ display: 'block' }}>Amount:</strong>
        <input
          name='amount'
          type='number'
          step='0.000000000000000001'
          disabled={loading}
          style={{ width: '100%', padding: '8px' }}
          placeholder='Amount to supply (in token units)'
        />
        <small style={{ color: '#666' }}>
          Human-friendly amount (e.g. 1.23, 4.56, 7.89)
        </small>
      </label>

      <button type='submit' disabled={loading}>
        Supply
      </button>

      {status && <p style={{ marginBottom: '10px' }}>{status}</p>}

      {error && <p style={{ color: '#f44336' }}>Error: {error.toString()}</p>}
    </form>
  );
}
