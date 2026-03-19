import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runCommand as oclifRunCommand } from '@oclif/test';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const CLI_ROOT = resolve(__dirname, '..');

export function runCommand<T>(args: string | string[]) {
  return oclifRunCommand<T>(args, CLI_ROOT, { stripAnsi: true });
}
