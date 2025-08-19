import { OrderDirection } from '@aave/graphql';
import { assertOk, bigDecimal, evmAddress, ResultAsync } from '@aave/types';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  client,
  createNewWallet,
  ETHEREUM_FORK_ID,
  ETHEREUM_MARKET_ADDRESS,
  ETHEREUM_USDC_ADDRESS,
  ETHEREUM_WETH_ADDRESS,
  fundErc20Address,
} from '../test-utils';
import { sendWith } from '../viem';
import { borrow, supply } from './transactions';
import { userBorrows, userSupplies } from './user';

const user = createNewWallet();

describe('Given an Aave Market', () => {
  describe('And a user with more than one supply/borrow positions', () => {
    beforeAll(async () => {
      const funds = await ResultAsync.combine([
        fundErc20Address(
          ETHEREUM_WETH_ADDRESS,
          evmAddress(user.account!.address),
          bigDecimal('0.05'),
        ),
        fundErc20Address(
          ETHEREUM_USDC_ADDRESS,
          evmAddress(user.account!.address),
          bigDecimal('100'),
          6,
        ),
      ]);
      assertOk(funds);

      const supplies = await client.batch((c) => [
        supply(c, {
          market: ETHEREUM_MARKET_ADDRESS,
          sender: evmAddress(user.account!.address),
          amount: {
            erc20: { value: '0.03', currency: ETHEREUM_WETH_ADDRESS },
          },
          chainId: ETHEREUM_FORK_ID,
        })
          .andThen(sendWith(user))
          .andThen(c.waitForTransaction),
        supply(c, {
          market: ETHEREUM_MARKET_ADDRESS,
          sender: evmAddress(user.account!.address),
          amount: {
            erc20: { value: '99', currency: ETHEREUM_USDC_ADDRESS },
          },
          chainId: ETHEREUM_FORK_ID,
        })
          .andThen(sendWith(user))
          .andThen(c.waitForTransaction),
      ]);
      assertOk(supplies);

      const borrows = await client.batch((c) => [
        borrow(c, {
          market: ETHEREUM_MARKET_ADDRESS,
          sender: evmAddress(user.account!.address),
          amount: {
            erc20: { value: '0.0003', currency: ETHEREUM_WETH_ADDRESS },
          },
          chainId: ETHEREUM_FORK_ID,
        })
          .andThen(sendWith(user))
          .andThen(c.waitForTransaction),
        borrow(c, {
          market: ETHEREUM_MARKET_ADDRESS,
          sender: evmAddress(user.account!.address),
          amount: { erc20: { value: '1', currency: ETHEREUM_USDC_ADDRESS } },
          chainId: ETHEREUM_FORK_ID,
        })
          .andThen(sendWith(user))
          .andThen(c.waitForTransaction),
      ]);
      assertOk(borrows);
    }, 120_000);

    describe('When fetching supply positions', () => {
      it('Then it should be possible so sort them by balance', async ({
        annotate,
      }) => {
        annotate(`user address: ${user.account!.address}`);
        const listSuppliesDesc = await userSupplies(client, {
          user: evmAddress(user.account!.address),
          markets: [
            { address: ETHEREUM_MARKET_ADDRESS, chainId: ETHEREUM_FORK_ID },
          ],
          orderBy: { balance: OrderDirection.Desc },
        });

        assertOk(listSuppliesDesc);
        expect(listSuppliesDesc.value.length).toBeGreaterThan(0);
        const balanceDescList = listSuppliesDesc.value.map((supply) =>
          Number(supply.balance.usd),
        );
        expect(balanceDescList[1]).toBeGreaterThan(balanceDescList[0]!);

        const listSuppliesAsc = await userSupplies(client, {
          user: evmAddress(user.account!.address),
          markets: [
            { address: ETHEREUM_MARKET_ADDRESS, chainId: ETHEREUM_FORK_ID },
          ],
          orderBy: { balance: OrderDirection.Asc },
        });
        assertOk(listSuppliesAsc);
        expect(listSuppliesAsc.value.length).toBeGreaterThan(0);
        const balanceAscList = listSuppliesAsc.value.map((supply) =>
          Number(supply.balance.usd),
        );
        expect(balanceAscList[1]).toBeLessThan(balanceAscList[0]!);
      });

      it('Then it should be possible so sort them by name', async () => {
        const listSuppliesDesc = await userSupplies(client, {
          user: evmAddress(user.account!.address),
          markets: [
            { address: ETHEREUM_MARKET_ADDRESS, chainId: ETHEREUM_FORK_ID },
          ],
          orderBy: { name: OrderDirection.Desc },
        });

        assertOk(listSuppliesDesc);
        expect(listSuppliesDesc.value.length).toBeGreaterThan(0);
        const nameDescList = listSuppliesDesc.value.map(
          (supply) => supply.currency.name,
        );
        expect(nameDescList).toEqual([...nameDescList].sort().reverse());

        const listSuppliesAsc = await userSupplies(client, {
          user: evmAddress(user.account!.address),
          markets: [
            { address: ETHEREUM_MARKET_ADDRESS, chainId: ETHEREUM_FORK_ID },
          ],
          orderBy: { name: OrderDirection.Asc },
        });
        assertOk(listSuppliesAsc);
        expect(listSuppliesAsc.value.length).toBeGreaterThan(0);
        const nameAscList = listSuppliesAsc.value.map(
          (supply) => supply.currency.name,
        );
        expect(nameAscList).toEqual([...nameAscList].sort());
      });

      it('Then it should be possible so sort them by APY', async () => {
        const listSuppliesDesc = await userSupplies(client, {
          user: evmAddress(user.account!.address),
          markets: [
            { address: ETHEREUM_MARKET_ADDRESS, chainId: ETHEREUM_FORK_ID },
          ],
          orderBy: { apy: OrderDirection.Desc },
        });

        assertOk(listSuppliesDesc);
        expect(listSuppliesDesc.value.length).toBeGreaterThan(0);
        const apyDescList = listSuppliesDesc.value.map((supply) =>
          Number(supply.apy.formatted),
        );
        expect(apyDescList[0]).toBeGreaterThan(apyDescList[1]!);

        const listSuppliesAsc = await userSupplies(client, {
          user: evmAddress(user.account!.address),
          markets: [
            { address: ETHEREUM_MARKET_ADDRESS, chainId: ETHEREUM_FORK_ID },
          ],
          orderBy: { apy: OrderDirection.Asc },
        });
        assertOk(listSuppliesAsc);
        expect(listSuppliesAsc.value.length).toBeGreaterThan(0);
        const apyAscList = listSuppliesAsc.value.map((supply) =>
          Number(supply.apy.formatted),
        );
        expect(apyAscList[0]).toBeLessThan(apyAscList[1]!);
      });

      it('Then it should be possible so sort them by whether the position is used as collateral', async () => {
        const listSuppliesDesc = await userSupplies(client, {
          user: evmAddress(user.account!.address),
          markets: [
            { address: ETHEREUM_MARKET_ADDRESS, chainId: ETHEREUM_FORK_ID },
          ],
          orderBy: { isCollateralized: OrderDirection.Desc },
        });

        assertOk(listSuppliesDesc);
        expect(listSuppliesDesc.value.length).toBeGreaterThan(0);

        const listSuppliesAsc = await userSupplies(client, {
          user: evmAddress(user.account!.address),
          markets: [
            { address: ETHEREUM_MARKET_ADDRESS, chainId: ETHEREUM_FORK_ID },
          ],
          orderBy: { isCollateralized: OrderDirection.Asc },
        });
        assertOk(listSuppliesAsc);
        expect(listSuppliesAsc.value.length).toBeGreaterThan(0);
      });
    });

    describe('When fetching borrow positions', () => {
      it('Then it should be possible so sort them by debt', async ({
        annotate,
      }) => {
        annotate(`user address: ${user.account!.address}`);
        const listBorrowsDesc = await userBorrows(client, {
          user: evmAddress(user.account!.address),
          markets: [
            { address: ETHEREUM_MARKET_ADDRESS, chainId: ETHEREUM_FORK_ID },
          ],
          orderBy: { debt: OrderDirection.Desc },
        });
        assertOk(listBorrowsDesc);
        expect(listBorrowsDesc.value.length).toBeGreaterThan(0);
        const debtDescList = listBorrowsDesc.value.map((borrow) =>
          Number(borrow.debt.usd),
        );
        expect(debtDescList[1]).toBeGreaterThan(debtDescList[0]!);

        const listBorrowsAsc = await userBorrows(client, {
          user: evmAddress(user.account!.address),
          markets: [
            { address: ETHEREUM_MARKET_ADDRESS, chainId: ETHEREUM_FORK_ID },
          ],
          orderBy: { debt: OrderDirection.Asc },
        });
        assertOk(listBorrowsAsc);
        expect(listBorrowsAsc.value.length).toBeGreaterThan(0);
        const debtAscList = listBorrowsAsc.value.map((borrow) =>
          Number(borrow.debt.usd),
        );
        expect(debtAscList[1]).toBeLessThan(debtAscList[0]!);
      });

      it('Then it should be possible so sort them by name', async () => {
        const listBorrowsDesc = await userBorrows(client, {
          user: evmAddress(user.account!.address),
          markets: [
            { address: ETHEREUM_MARKET_ADDRESS, chainId: ETHEREUM_FORK_ID },
          ],
          orderBy: { name: OrderDirection.Desc },
        });
        assertOk(listBorrowsDesc);
        expect(listBorrowsDesc.value.length).toBeGreaterThan(0);
        const nameDescList = listBorrowsDesc.value.map(
          (borrow) => borrow.currency.name,
        );
        expect(nameDescList).toEqual([...nameDescList].sort().reverse());

        const listBorrowsAsc = await userBorrows(client, {
          user: evmAddress(user.account!.address),
          markets: [
            { address: ETHEREUM_MARKET_ADDRESS, chainId: ETHEREUM_FORK_ID },
          ],
          orderBy: { name: OrderDirection.Asc },
        });
        assertOk(listBorrowsAsc);
        expect(listBorrowsAsc.value.length).toBeGreaterThan(0);
        const nameAscList = listBorrowsAsc.value.map(
          (borrow) => borrow.currency.name,
        );
        expect(nameAscList).toEqual([...nameAscList].sort());
      });

      it('Then it should be possible so sort them by APY', async () => {
        const listBorrowsDesc = await userBorrows(client, {
          user: evmAddress(user.account!.address),
          markets: [
            { address: ETHEREUM_MARKET_ADDRESS, chainId: ETHEREUM_FORK_ID },
          ],
          orderBy: { apy: OrderDirection.Desc },
        });
        assertOk(listBorrowsDesc);
        expect(listBorrowsDesc.value.length).toBeGreaterThan(0);
        const apyDescList = listBorrowsDesc.value.map((borrow) =>
          Number(borrow.apy.formatted),
        );
        expect(apyDescList[0]).toBeGreaterThan(apyDescList[1]!);

        const listBorrowsAsc = await userBorrows(client, {
          user: evmAddress(user.account!.address),
          markets: [
            { address: ETHEREUM_MARKET_ADDRESS, chainId: ETHEREUM_FORK_ID },
          ],
          orderBy: { apy: OrderDirection.Asc },
        });
        assertOk(listBorrowsAsc);
        expect(listBorrowsAsc.value.length).toBeGreaterThan(0);
        const apyAscList = listBorrowsAsc.value.map((borrow) =>
          Number(borrow.apy.formatted),
        );
        expect(apyAscList[0]).toBeLessThan(apyAscList[1]!);
      });
    });
  });
});
