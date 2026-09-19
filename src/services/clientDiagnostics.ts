import { normalizeError, sanitizeMetadata } from './logger';

const MAX_REPORTS_PER_SESSION = 5;
let sentReports = 0;

const getDeviceClass = (): 'phone' | 'tablet' | 'desktop' | 'unknown' => {
  if (typeof window === 'undefined') return 'unknown';
  const width = window.innerWidth;
  if (width < 640) return 'phone';
  if (width < 1200) return 'tablet';
  return 'desktop';
};

const isStandalone = (): boolean => {
  if (typeof window === 'undefined') return false;
  return Boolean(window.matchMedia?.('(display-mode: standalone)').matches);
};

export function reportClientError(
  scope: string,
  event: string,
  error?: unknown,
  metadata?: Record<string, unknown>
): void {
  if (typeof window === 'undefined' || !import.meta.env.PROD) return;
  if (sentReports >= MAX_REPORTS_PER_SESSION) return;

  const payload = {
    scope: scope.slice(0, 80),
    event: event.slice(0, 100),
    buildId:
      typeof __APP_BUILD_ID__ !== 'undefined' ? __APP_BUILD_ID__ : 'unknown',
    path: window.location?.pathname?.slice(0, 240) || '/',
    deviceClass: getDeviceClass(),
    standalone: isStandalone(),
    online: typeof navigator === 'undefined' ? undefined : navigator.onLine,
    error: error === undefined ? undefined : normalizeError(error, false),
    metadata: sanitizeMetadata(metadata),
  };

  sentReports += 1;
  const body = JSON.stringify(payload);

  try {
    if (navigator.sendBeacon) {
      const accepted = navigator.sendBeacon(
        '/api/client-errors',
        new Blob([body], { type: 'application/json' })
      );
      if (accepted) return;
    }
  } catch {
    // Fall through to keepalive fetch.
  }

  try {
    void fetch('/api/client-errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
      credentials: 'omit',
    }).catch(() => {});
  } catch {
    // Diagnostics must never affect the traveler experience.
  }
}

export function _resetClientDiagnosticsForTesting(): void {
  sentReports = 0;
}
