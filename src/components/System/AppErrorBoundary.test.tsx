import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { AppErrorBoundary } from './AppErrorBoundary';
import { logger } from '../../services/logger';

describe('AppErrorBoundary', () => {
  let loggerErrorSpy: any;
  const originalWindow = (globalThis as any).window;

  beforeEach(() => {
    loggerErrorSpy = vi.spyOn(logger, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    (globalThis as any).window = originalWindow;
  });

  it('renders normal children when no error occurs', () => {
    const html = renderToString(
      React.createElement(
        AppErrorBoundary,
        null,
        React.createElement('div', { id: 'test-child' }, 'TerroirTrail Normal Content')
      )
    );

    expect(html).toContain('TerroirTrail Normal Content');
    expect(html).not.toContain('Something went wrong');
    expect(loggerErrorSpy).not.toHaveBeenCalled();
  });

  it('catches render failures via getDerivedStateFromError and logs through logger.error', () => {
    const boundary = new AppErrorBoundary({
      children: React.createElement('div', null, 'Protected Content'),
    });

    const simulatedError = new Error('Database hydration failed with sensitive key sk_live_123');
    const simulatedErrorInfo = {
      componentStack: '\n    at BrokenWidget\n    at App',
    };

    // Verify error state transition
    const derivedState = AppErrorBoundary.getDerivedStateFromError(simulatedError);
    expect(derivedState).toEqual({ hasError: true });

    // Verify componentDidCatch routes to structured logger
    boundary.componentDidCatch(simulatedError, simulatedErrorInfo);
    expect(loggerErrorSpy).toHaveBeenCalledWith(
      'AppErrorBoundary',
      'unhandled_react_render_error',
      simulatedError,
      { componentStack: simulatedErrorInfo.componentStack }
    );
  });

  it('renders calm fallback recovery UI without exposing stack traces or implementation details', () => {
    const boundary = new AppErrorBoundary({
      children: React.createElement('div', null, 'Protected Content'),
    });

    // Set error state
    boundary.state = { hasError: true };

    const rendered = boundary.render();
    const html = renderToString(rendered as React.ReactElement);

    // Verify friendly, calm traveler message
    expect(html).toContain('Something went wrong');
    expect(html).toContain('Reload TerroirTrail');
    expect(html).toContain('An unexpected error occurred while rendering the page');

    // Verify raw implementation details, stack traces, and secrets are NEVER exposed in UI
    expect(html).not.toContain('Database hydration failed');
    expect(html).not.toContain('sk_live_123');
    expect(html).not.toContain('componentStack');
    expect(html).not.toContain('BrokenWidget');
  });

  it('triggers window.location.reload when reload button handler is invoked', () => {
    const reloadMock = vi.fn();
    (globalThis as any).window = { location: { reload: reloadMock } };

    const boundary = new AppErrorBoundary({
      children: React.createElement('div', null, 'Content'),
    });

    boundary.handleReload();
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it('renders custom fallback if provided in props', () => {
    const boundary = new AppErrorBoundary({
      children: React.createElement('div', null, 'Normal'),
      fallback: React.createElement('div', { id: 'custom-fallback' }, 'Custom Recovery View'),
    });

    boundary.state = { hasError: true };

    const html = renderToString(boundary.render() as React.ReactElement);
    expect(html).toContain('Custom Recovery View');
    expect(html).not.toContain('Reload TerroirTrail');
  });
});
