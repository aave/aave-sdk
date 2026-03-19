import {
  AaveClient,
  type ChainId,
  chainId,
  type EvmAddress,
  evmAddress,
  production,
  staging,
} from '@aave/client';
import { Command, Flags } from '@oclif/core';
import TtyTable from 'tty-table';

export const chain = Flags.custom<ChainId>({
  char: 'c',
  name: 'chain',
  description: 'The chain ID (e.g. 1, 137, 42161)',
  helpValue: '<chain-id>',
  parse: async (input: string) => chainId(Number(input)),
});

export const market = Flags.custom<EvmAddress>({
  char: 'm',
  name: 'market',
  description: 'The market pool address',
  helpValue: '<pool-address>',
  parse: async (input: string) => evmAddress(input),
});

export const user = Flags.custom<EvmAddress>({
  char: 'u',
  name: 'user',
  description: 'The user wallet address',
  helpValue: '<evm-address>',
  parse: async (input: string) => evmAddress(input),
});

export const address = Flags.custom<EvmAddress>({
  parse: async (input) => evmAddress(input),
  helpValue: '<evm-address>',
});

function convertBigIntsToStrings(obj: unknown): unknown {
  if (typeof obj === 'bigint') {
    return obj.toString();
  }

  if (Array.isArray(obj)) {
    return obj.map(convertBigIntsToStrings);
  }

  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = convertBigIntsToStrings(value);
    }
    return result;
  }

  return obj;
}

export abstract class V3Command extends Command {
  protected headers: TtyTable.Header[] = [];

  public static enableJsonFlag = true;

  static baseFlags = {
    staging: Flags.boolean({
      hidden: true,
      description: 'Use staging environment',
      default: false,
    }),
  };

  protected client!: AaveClient;

  async init(): Promise<void> {
    await super.init();
    const { flags } = await this.parse(this.constructor as typeof V3Command);
    const environment = flags.staging ? staging : production;
    this.client = AaveClient.create({ environment });
  }

  protected display(rows: unknown[]) {
    const out = TtyTable(this.headers, rows).render();
    this.log(out);
  }

  protected toSuccessJson(result: unknown): unknown {
    return convertBigIntsToStrings(result);
  }
}
