import { UnexpectedError } from '@aave/client';
import { HealthQuery } from '@aave/graphql';
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
import { useSuspendableQuery } from './reads';

const server = setupServer(
  graphql.query(HealthQuery, () => {
    return HttpResponse.json({
      data: {
        value: true,
      },
    });
  }),
);

describe(`Given the '${useSuspendableQuery.name}' hook`, () => {
  beforeAll(() => {
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  describe('When rendering with suspense disabled', () => {
    it('Then it should return data after a loading state', async () => {
      const { result } = renderHookWithinContext(() =>
        useSuspendableQuery({
          document: HealthQuery,
          variables: {},
          suspense: false,
        }),
      );

      await vi.waitUntil(() => !result.current.loading);

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBe(true);
      expect(result.current.error).toBeUndefined();
    });

    it('Then it should return any error as component state', async () => {
      server.use(
        graphql.query(HealthQuery, () => {
          return HttpResponse.json({
            errors: [
              { message: 'Test error', extensions: { code: 'TEST_ERROR' } },
            ],
          });
        }),
      );

      const { result } = renderHookWithinContext(() =>
        useSuspendableQuery({
          document: HealthQuery,
          variables: {},
          suspense: false,
        }),
      );

      await vi.waitUntil(() => !result.current.loading);

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeDefined();
    });
  });

  describe('When rendering with suspense enabled', () => {
    it('Then it should suspend and render once the query is resolved', async () => {
      const { result } = renderHookWithinContext(() =>
        useSuspendableQuery({
          document: HealthQuery,
          variables: {},
          suspense: true,
        }),
      );

      await vi.waitUntil(() => result.current);

      expect(result.current.data).toBe(true);
    });

    it('Then it should throw any error so that can be captured via an Error Boundary', async () => {
      server.use(
        graphql.query(HealthQuery, () => {
          return HttpResponse.json({
            errors: [
              { message: 'Test error', extensions: { code: 'TEST_ERROR' } },
            ],
          });
        }),
      );

      const onError = vi.fn();
      renderHookWithinContext(
        () =>
          useSuspendableQuery({
            document: HealthQuery,
            variables: {},
            suspense: true,
          }),
        // biome-ignore lint/suspicious/noExplicitAny: not worth the effort
        { onCaughtError: onError as any },
      );

      // Wait for the error boundary to catch the error
      await vi.waitFor(() => expect(onError).toHaveBeenCalled());

      expect(onError).toHaveBeenCalledWith(
        expect.any(UnexpectedError),
        expect.any(Object),
      );
    });
  });
});
