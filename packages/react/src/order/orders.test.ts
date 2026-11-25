import type { TransactionExecutionResult } from '@aave/client';
import {
  CancelOrderMutation,
  OrderStatusQuery,
  PrepareCancelOrderQuery,
  PrepareOrderQuery,
  SubmitOrderMutation,
  SupplySwapQuoteQuery,
  TokenSwapQuoteQuery,
} from '@aave/graphql';
import {
  bigDecimal,
  chainId,
  evmAddress,
  okAsync,
  type ResultAsync,
  signatureFrom,
  txHash,
} from '@aave/types';
import { act, waitFor } from '@testing-library/react';
import { graphql, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { renderHookWithinContext } from '../test-utils';
import type { OrderHandlerResult } from './helpers';
import { useCancelOrder } from './useCancelOrder';
import { useOrderStatus } from './useOrderStatus';
import { useSupplySwapOrder } from './usePositionSwapOrder';
import { useTokenSwapOrder } from './useTokenSwapOrder';

const user = evmAddress('0x000000000000000000000000000000000000dEaD');
const token = evmAddress('0x0000000000000000000000000000000000000001');
const signature = signatureFrom('0x1234');
const mined: TransactionExecutionResult = {
  txHash: txHash(
    '0x1111111111111111111111111111111111111111111111111111111111111111',
  ),
  operation: null,
};

const decimal = {
  __typename: 'DecimalValue',
  raw: '1',
  decimals: 0,
  value: '1',
};
const amount = {
  __typename: 'TokenAmount',
  usdPerToken: '1',
  amount: decimal,
  usd: '1',
};
const percent = { ...decimal, __typename: 'PercentValue', formatted: '1' };
const quote = {
  __typename: 'SwapQuote',
  accuracy: 'ACCURATE',
  quoteId: 'swap-quote',
  orderQuoteId: 'order-quote',
  suggestedSlippage: percent,
  selectedSlippage: null,
  sell: amount,
  buy: amount,
  costs: {
    __typename: 'SwapQuoteCosts',
    networkCosts: amount,
    partnerFee: amount,
    flashloanFee: null,
    providerFee: amount,
  },
  finalSell: amount,
  finalBuy: amount,
};
const transaction = {
  __typename: 'TransactionRequest',
  to: token,
  from: user,
  data: '0x',
  value: '0',
  chainId: 1,
  operation: null,
};
const typedData = {
  __typename: 'OrderTypedData',
  types: {},
  primaryType: 'Order',
  domain: { name: 'n', version: '1', chainId: 1, verifyingContract: token },
  message: {},
};
const permit = {
  types: { EIP712Domain: [], Permit: [] },
  primaryType: 'Permit',
  domain: typedData.domain,
  message: {
    owner: user,
    spender: token,
    value: '1',
    nonce: '0',
    deadline: 42,
  },
};
const receipt = { __typename: 'OrderReceipt', orderId: 'order-1' };

const server = setupServer();
const requests: Record<string, unknown>[] = [];

function respond(
  document: Parameters<typeof graphql.query>[0],
  value: unknown,
) {
  return graphql.query(document, ({ variables }) => {
    requests.push({ op: document, ...variables });
    return HttpResponse.json({ data: { value } });
  });
}

function respondMutation(
  document: Parameters<typeof graphql.mutation>[0],
  value: unknown,
) {
  return graphql.mutation(document, ({ variables }) => {
    requests.push({ op: document, ...variables });
    return HttpResponse.json({ data: { value } });
  });
}

function requestOf(document: unknown) {
  return requests.find((r) => r.op === document)?.request;
}

function countOf(document: unknown) {
  return requests.filter((r) => r.op === document).length;
}

// Answers each status poll with the next typename, repeating the last one.
function respondStatuses(typenames: string[]) {
  let calls = 0;
  return graphql.query(OrderStatusQuery, ({ variables }) => {
    requests.push({ op: OrderStatusQuery, ...variables });
    const __typename = typenames[Math.min(calls, typenames.length - 1)];
    calls += 1;
    return HttpResponse.json({
      data: { value: { __typename, orderId: 'order-1' } },
    });
  });
}

const handler = vi.fn(
  (plan: { __typename: string }): ResultAsync<OrderHandlerResult, never> => {
    switch (plan.__typename) {
      case 'OrderTypedData':
      case 'PositionSwapAdapterContractApproval':
        return okAsync(signature);
      case 'Erc20Approval':
        return 'byPermit' in plan && plan.byPermit
          ? okAsync(signature)
          : okAsync(mined);
      default:
        return okAsync(mined);
    }
  },
);

describe('Given the order hooks', () => {
  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
    requests.length = 0;
    handler.mockClear();
  });
  afterAll(() => server.close());

  const tokenSwap = {
    market: {
      market: token,
      chainId: chainId(1),
      sell: { erc20: token },
      buy: { native: true as const },
      amount: bigDecimal('1'),
      kind: 'SELL' as never,
      user,
    },
  };

  describe(`When '${useTokenSwapOrder.name}' gets an intent quote with a permit`, () => {
    it('Then it signs the permit, prepares with it and submits the rotated quote id', async () => {
      server.use(
        respond(TokenSwapQuoteQuery, {
          __typename: 'SwapByIntentWithApprovalRequired',
          quote,
          approvals: [
            {
              __typename: 'Erc20Approval',
              byTransaction: transaction,
              byPermit: permit,
            },
          ],
        }),
        respond(PrepareOrderQuery, {
          __typename: 'PreparedOrder',
          newQuoteId: 'rotated',
          data: typedData,
        }),
        respondMutation(SubmitOrderMutation, receipt),
      );
      const { result } = renderHookWithinContext(() =>
        useTokenSwapOrder(handler),
      );

      const outcome = await act(() => result.current[0](tokenSwap));

      expect(outcome._unsafeUnwrap()).toMatchObject({ orderId: 'order-1' });
      expect(requestOf(PrepareOrderQuery)).toEqual({
        quoteId: 'order-quote',
        permitSig: { value: signature, deadline: 42 },
      });
      expect(requestOf(SubmitOrderMutation)).toEqual({
        bySignature: { quoteId: 'rotated', signature },
      });
    });
  });

  describe(`When '${useTokenSwapOrder.name}' gets a transaction quote`, () => {
    it('Then it sends the approval, submits by transaction and sends the order transaction', async () => {
      server.use(
        respond(TokenSwapQuoteQuery, {
          __typename: 'SwapByTransactionWithApprovalRequired',
          quote,
          approvals: [
            {
              __typename: 'Erc20Approval',
              byTransaction: transaction,
              byPermit: null,
            },
          ],
        }),
        respondMutation(SubmitOrderMutation, {
          __typename: 'OrderTransactionRequest',
          transaction,
          orderReceipt: receipt,
        }),
      );
      const { result } = renderHookWithinContext(() =>
        useTokenSwapOrder(handler),
      );

      const outcome = await act(() => result.current[0](tokenSwap));

      expect(outcome._unsafeUnwrap()).toMatchObject({ orderId: 'order-1' });
      expect(requestOf(SubmitOrderMutation)).toEqual({
        byTransaction: { quoteId: 'order-quote' },
      });
      expect(handler.mock.calls.map(([plan]) => plan.__typename)).toEqual([
        'Erc20Approval',
        'OrderTransactionRequest',
      ]);
    });
  });

  describe(`When '${useTokenSwapOrder.name}' gets no liquidity`, () => {
    it('Then it fails with a ValidationError and never prepares', async () => {
      server.use(
        respond(TokenSwapQuoteQuery, {
          __typename: 'InsufficientLiquidityError',
          reason: 'no route',
        }),
      );
      const { result } = renderHookWithinContext(() =>
        useTokenSwapOrder(handler),
      );

      const outcome = await act(() => result.current[0](tokenSwap));

      expect(outcome._unsafeUnwrapErr().name).toBe('ValidationError');
      expect(requestOf(PrepareOrderQuery)).toBeUndefined();
    });
  });

  describe(`When '${useSupplySwapOrder.name}' gets an adapter approval`, () => {
    it('Then it passes the adapter signature to prepareOrder', async () => {
      server.use(
        respond(SupplySwapQuoteQuery, {
          __typename: 'PositionSwapByIntentApprovalsRequired',
          quote,
          approvals: [
            {
              __typename: 'PositionSwapAdapterTransactionApproval',
              byTransaction: transaction,
            },
            {
              __typename: 'PositionSwapAdapterContractApproval',
              bySignature: typedData,
            },
          ],
        }),
        respond(PrepareOrderQuery, {
          __typename: 'PreparedOrder',
          newQuoteId: 'rotated',
          data: typedData,
        }),
        respondMutation(SubmitOrderMutation, receipt),
      );
      const { result } = renderHookWithinContext(() =>
        useSupplySwapOrder(handler),
      );

      const outcome = await act(() =>
        result.current[0]({
          market: {
            sellPosition: 'supply' as never,
            buyReserve: 'reserve' as never,
            amount: bigDecimal('1'),
            user,
          },
        }),
      );

      expect(outcome._unsafeUnwrap()).toMatchObject({ orderId: 'order-1' });
      expect(requestOf(PrepareOrderQuery)).toEqual({
        quoteId: 'order-quote',
        adapterContractSignature: signature,
      });
    });
  });

  describe(`When '${useCancelOrder.name}' is answered with a transaction`, () => {
    it('Then it signs, sends the cancel transaction and waits for the order to show cancelled', async () => {
      server.use(
        respondStatuses(['OrderOpen', 'OrderOpen', 'OrderCancelled']),
        respond(PrepareCancelOrderQuery, {
          __typename: 'PrepareCancelOrderResult',
          data: typedData,
        }),
        respondMutation(CancelOrderMutation, transaction),
      );
      const { result } = renderHookWithinContext(() => useCancelOrder(handler));

      const outcome = await act(() =>
        result.current[0]({ id: 'order-1' as never }),
      );

      expect(outcome._unsafeUnwrap()).toEqual({
        __typename: 'OrderCancelledResult',
        orderId: 'order-1',
      });
      expect(handler.mock.calls.map(([plan]) => plan.__typename)).toEqual([
        'OrderTypedData',
        'TransactionRequest',
      ]);
      expect(countOf(OrderStatusQuery)).toBe(3);
    });

    it('Then it fails with CannotCancelOrderError if the order fills first', async () => {
      server.use(
        respondStatuses(['OrderOpen', 'OrderFulfilled']),
        respond(PrepareCancelOrderQuery, {
          __typename: 'PrepareCancelOrderResult',
          data: typedData,
        }),
        respondMutation(CancelOrderMutation, transaction),
      );
      const { result } = renderHookWithinContext(() => useCancelOrder(handler));

      const outcome = await act(() =>
        result.current[0]({ id: 'order-1' as never }),
      );

      expect(outcome._unsafeUnwrapErr().name).toBe('CannotCancelOrderError');
    });

    it('Then it fails when the handler signs the cancel transaction instead of sending it', async () => {
      server.use(
        respondStatuses(['OrderOpen']),
        respond(PrepareCancelOrderQuery, {
          __typename: 'PrepareCancelOrderResult',
          data: typedData,
        }),
        respondMutation(CancelOrderMutation, transaction),
      );
      const { result } = renderHookWithinContext(() =>
        useCancelOrder(() => okAsync(signature)),
      );

      const outcome = await act(() =>
        result.current[0]({ id: 'order-1' as never }),
      );

      expect(outcome._unsafeUnwrapErr().name).toBe('UnexpectedError');
    });
  });

  describe(`When '${useCancelOrder.name}' gets an order that already filled`, () => {
    it('Then it fails with CannotCancelOrderError and never prepares', async () => {
      server.use(respondStatuses(['OrderFulfilled']));
      const { result } = renderHookWithinContext(() => useCancelOrder(handler));

      const outcome = await act(() =>
        result.current[0]({ id: 'order-1' as never }),
      );

      expect(outcome._unsafeUnwrapErr().name).toBe('CannotCancelOrderError');
      expect(requestOf(PrepareCancelOrderQuery)).toBeUndefined();
    });
  });

  describe(`When '${useOrderStatus.name}' watches an open order`, () => {
    it('Then it polls until the order is final, then stops', async () => {
      server.use(respondStatuses(['OrderOpen', 'OrderOpen', 'OrderFulfilled']));
      const { result } = renderHookWithinContext(() =>
        useOrderStatus({ id: 'order-1' as never }),
      );

      await waitFor(() =>
        expect(result.current.data?.__typename).toBe('OrderFulfilled'),
      );
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(countOf(OrderStatusQuery)).toBe(3);
    });
  });
});
