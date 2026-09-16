import { auth } from './firebase';
import { resolveApiBaseUrl } from './apiOrigin';

export interface AccountExportPayload {
  exportedAt: string;
  account: Record<string, unknown>;
  profile: Record<string, unknown> | null;
  producerOwnerships: Array<Record<string, unknown>>;
  producerRegistrations: Array<Record<string, unknown>>;
  bookings: Array<Record<string, unknown>>;
  explorerPasses: Array<Record<string, unknown>>;
}

const authenticatedRequest = async (path: string, init?: RequestInit) => {
  await auth?.authStateReady();
  if (!auth?.currentUser) {
    throw new Error('Sign in to manage your account.');
  }

  const response = await fetch(`${resolveApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      Authorization: `Bearer ${await auth.currentUser.getIdToken()}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(20000),
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : null;
  if (!response.ok) {
    const error = new Error(payload?.error || 'Account request failed.') as Error & { code?: string };
    error.code = payload?.code;
    throw error;
  }
  return payload;
};

export const exportOwnAccountData = async (): Promise<AccountExportPayload> => {
  const payload = await authenticatedRequest('/api/account/export', { method: 'GET' });
  return payload.data as AccountExportPayload;
};

export const deleteOwnAccount = async (): Promise<{ deleted: boolean; producerIdsUnassigned: string[] }> => {
  return authenticatedRequest('/api/account', { method: 'DELETE' });
};
