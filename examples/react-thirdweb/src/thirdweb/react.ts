import { useAsyncTask } from '../../../../packages/react/src/helpers/tasks';
import { never } from '../../../../packages/types/src/helpers/never';

export function useSendTransaction() {
  return useAsyncTask((_input: unknown) => never('Not implemented'));
}
