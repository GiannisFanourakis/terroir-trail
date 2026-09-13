import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  initGlobalErrorHandlers,
  _resetGlobalErrorHandlersForTesting,
} from './globalErrorHandlers';
import { logger } from './logger';

describe('globalErrorHandlers', () => {
  let loggerErrorSpy: any;
  const originalWindow = globalThis.window;

  beforeEach(() => {
    _resetGlobalErrorHandlersForTesting();
    loggerErrorSpy = vi.spyOn(logger, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    _resetGlobalErrorHandlersForTesting();
    vi.restoreAllMocks();
    (globalThis as any).window = originalWindow;
  });

  it('attaches listeners to window and invokes logger.error without swallowing error events', () => {
    const listeners: Record<string, (event: any) => void> = {};
    const mockWindow = {
      addEventListener: vi.fn((type: string, handler: (e: any) => void) => {
        listeners[type] = handler;
      }),
    };
    (globalThis as any).window = mockWindow;

    initGlobalErrorHandlers();

    expect(mockWindow.addEventListener).toHaveBeenCalledWith('error', expect.any(Function));
    expect(mockWindow.addEventListener).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));

    // Simulate window error event
    let defaultPrevented = false;
    const mockErrorEvent = {
      message: 'Uncaught TypeError: Cannot read properties of undefined',
      filename: 'app.js',
      lineno: 42,
      colno: 12,
      error: new TypeError('Cannot read properties of undefined'),
      preventDefault: () => {
        defaultPrevented = true;
      },
    };

    listeners['error'](mockErrorEvent);

    expect(loggerErrorSpy).toHaveBeenCalledWith(
      'Window',
      'unhandled_error',
      mockErrorEvent.error,
      expect.objectContaining({
        message: 'Uncaught TypeError: Cannot read properties of undefined',
        filename: 'app.js',
        lineno: 42,
        colno: 12,
      })
    );
    // Crucial: do not swallow error or prevent default browser handling
    expect(defaultPrevented).toBe(false);
  });

  it('routes unhandled promise rejections to logger without preventing default', () => {
    const listeners: Record<string, (event: any) => void> = {};
    const mockWindow = {
      addEventListener: vi.fn((type: string, handler: (e: any) => void) => {
        listeners[type] = handler;
      }),
    };
    (globalThis as any).window = mockWindow;

    initGlobalErrorHandlers();

    let defaultPrevented = false;
    const mockRejectionEvent = {
      type: 'unhandledrejection',
      reason: new Error('Network request failed in async task'),
      preventDefault: () => {
        defaultPrevented = true;
      },
    };

    listeners['unhandledrejection'](mockRejectionEvent);

    expect(loggerErrorSpy).toHaveBeenCalledWith(
      'Window',
      'unhandled_promise_rejection',
      mockRejectionEvent.reason,
      { type: 'unhandledrejection' }
    );
    expect(defaultPrevented).toBe(false);
  });

  it('guarantees listeners are initialized only once', () => {
    const mockWindow = {
      addEventListener: vi.fn(),
    };
    (globalThis as any).window = mockWindow;

    initGlobalErrorHandlers();
    initGlobalErrorHandlers();
    initGlobalErrorHandlers();

    expect(mockWindow.addEventListener).toHaveBeenCalledTimes(2);
  });
});
