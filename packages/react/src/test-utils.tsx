import { AaveClient } from '@aave/client';
import { environment } from '@aave/client/test-utils';
import { type RenderHookOptions, renderHook } from '@testing-library/react';
// biome-ignore lint/correctness/noUnusedImports: needed for types
import React, { Component, type ReactNode, Suspense } from 'react';
import { AaveContextProvider } from './context';

class TestErrorBoundary extends Component<{ children: ReactNode }> {
  state: { error?: Error } = {};

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.error) {
      return (
        <div data-testid='error-boundary'>
          Error: {this.state.error?.message}
        </div>
      );
    }

    return this.props.children;
  }
}

function createTestWrapper() {
  const client = AaveClient.create({
    environment,
  });

  return function TestWrapper({ children }: { children: ReactNode }) {
    return (
      <AaveContextProvider client={client}>
        <TestErrorBoundary>
          <Suspense fallback={<div data-testid='loading'>Loading...</div>}>
            {children}
          </Suspense>
        </TestErrorBoundary>
      </AaveContextProvider>
    );
  };
}

export type RenderHookWithContextOptions<TProps> = Omit<
  RenderHookOptions<TProps>,
  'wrapper'
> & {
  onError?: (error: Error) => void;
};

/**
 * Unified wrapper around `renderHook` from `@testing-library/react`.
 *
 * All hooks are wrapped with:
 * - AaveContextProvider (required for Aave hooks)
 * - Suspense boundary (with loading fallback)
 * - ErrorBoundary (requires custom error handler)
 *
 * ```ts
 * const { result } = renderHookWithinContext(() => useMyHook(), {
 *   client: mockClient,
 * });
 * ```
 */
export function renderHookWithinContext<TProps, TResult>(
  callback: (props: TProps) => TResult,
  options: RenderHookWithContextOptions<TProps> = {},
) {
  return renderHook(callback, {
    wrapper: createTestWrapper(),
    ...options,
  });
}
