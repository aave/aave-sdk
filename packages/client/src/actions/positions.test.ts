import { OrderDirection } from '@aave/graphql';
import { assertOk, bigDecimal, evmAddress } from '@aave/types';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  client,
  createNewWallet,
  ETHEREUM_FORK_ID,
  ETHEREUM_MARKET_ADDRESS,
  fundErc20Address,
  USDC_ADDRESS,
  WETH_ADDRESS,
} from '../test-utils';
import { sendWith } from '../viem';
import { borrow, supply } from './transactions';
import { userBorrows, userSupplies } from './user';

const user = createNewWallet();

describe('Given an Aave Market', () => {
  describe('And a user with more than one supply positions', () => {
    describe('When fetching those positions', () => {
      beforeAll(async () => {
        const supplyAndFundWeth = await fundErc20Address(
          WETH_ADDRESS,
          evmAddress(user.account!.address),
          bigDecimal('1.1'),
        ).andThen(() =>
          supply(client, {
            market: ETHEREUM_MARKET_ADDRESS,
            supplier: evmAddress(user.account!.address),
            amount: { erc20: { value: '1', currency: WETH_ADDRESS } },
            chainId: ETHEREUM_FORK_ID,
          }).andThen(sendWith(user)),
        );
        assertOk(supplyAndFundWeth);

        const supplyAndFundUsdc = await fundErc20Address(
          USDC_ADDRESS,
          evmAddress(user.account!.address),
          bigDecimal('100'),
          6,
        ).andThen(() =>
          supply(client, {
            market: ETHEREUM_MARKET_ADDRESS,
            supplier: evmAddress(user.account!.address),
            amount: { erc20: { value: '99', currency: USDC_ADDRESS } },
            chainId: ETHEREUM_FORK_ID,
          }).andThen(sendWith(user)),
        );
        assertOk(supplyAndFundUsdc);

        const borrowAndFundWeth = await borrow(client, {
          market: ETHEREUM_MARKET_ADDRESS,
          borrower: evmAddress(user.account!.address),
          amount: { erc20: { value: '0.005', currency: WETH_ADDRESS } },
          chainId: ETHEREUM_FORK_ID,
        }).andThen(sendWith(user));
        assertOk(borrowAndFundWeth);

        const borrowAndFundUsdc = await borrow(client, {
          market: ETHEREUM_MARKET_ADDRESS,
          borrower: evmAddress(user.account!.address),
          amount: { erc20: { value: '1', currency: USDC_ADDRESS } },
          chainId: ETHEREUM_FORK_ID,
        }).andThen(sendWith(user));
        assertOk(borrowAndFundUsdc);
      }, 120_000);

      it('Then it should be possible so sort them by balance', async () => {
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
        expect(balanceDescList[0]).toBeGreaterThan(balanceDescList[1]!);

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
        expect(balanceAscList[0]).toBeLessThan(balanceAscList[1]!);
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
  });

  describe('And a user with more than one borrow positions', () => {
    describe('When fetching those positions', () => {
      it('Then it should be possible so sort them by debt', async () => {
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
        expect(debtDescList[0]).toBeGreaterThan(debtDescList[1]!);

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
        expect(debtAscList[0]).toBeLessThan(debtAscList[1]!);
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
