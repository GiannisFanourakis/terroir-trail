import { logger } from './logger';

let isInitialized = false;

/**
 * Initializes global browser failure listeners for uncaught errors and unhandled promise rejections.
 * Routed through the structured logger without swallowing errors or interfering with dev tools.
 * Safe to call multiple times; listeners are registered exactly once.
 */
export function initGlobalErrorHandlers(): void {
  if (typeof window === 'undefined' || isInitialized) return;
  isInitialized = true;

  window.addEventListener('error', (event: ErrorEvent) => {
    // We intentionally do not call event.preventDefault() so browser and dev tooling function normally
    logger.error('Window', 'unhandled_error', event.error ?? event.message, {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    // We intentionally do not call event.preventDefault() so browser and dev tooling function normally
    logger.error('Window', 'unhandled_promise_rejection', event.reason, {
      type: event.type,
    });
  });
}

/**
 * Testing helper to reset initialization state.
 */
export function _resetGlobalErrorHandlersForTesting(): void {
  isInitialized = false;
}
