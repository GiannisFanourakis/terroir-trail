import { auth } from './firebase';

export interface ExplorerPass {
  passId: string;
  name: string;
  plan: 'holiday' | 'annual';
  expiresAt: string;
}

async function request<T>(path: string, options: RequestInit = {}, authenticated = true): Promise<T> {
  const headers = new Headers(options.headers);
  if (authenticated) {
    await auth?.authStateReady();
    if (!auth?.currentUser) throw new Error('Please sign in with a real account to purchase or retrieve a pass.');
    headers.set('Authorization', `Bearer ${await auth.currentUser.getIdToken()}`);
  }
  if (options.body) headers.set('Content-Type', 'application/json');
  const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
  const response = await fetch(`${base}/api/passes${path}`, {
    ...options, headers, cache: 'no-store', signal: AbortSignal.timeout(15000),
  });
  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new Error('The pass service is unavailable. Please try again later.');
  }
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Unable to verify this pass.');
  return data as T;
}

export const isExplorerPassPurchasesEnabled = (): boolean => {
  return import.meta.env.VITE_ENABLE_EXPLORER_PASS_PURCHASES === 'true';
};

export const startPassCheckout = async (plan: ExplorerPass['plan']) => {
  if (!isExplorerPassPurchasesEnabled()) {
    throw new Error('Explorer Pass purchases are currently in private pilot and closed to new public orders.');
  }
  return request<{ url: string }>('/checkout', { method: 'POST', body: JSON.stringify({ plan }) });
};

export const fetchExplorerPass = () => request<{ pass: ExplorerPass | null }>('/me');

export const confirmExplorerPass = (sessionId: string) =>
  request<{ pass: ExplorerPass | null }>('/confirm', { method: 'POST', body: JSON.stringify({ sessionId }) });

export async function verifyExplorerPass(input: string) {
  const value = input.trim();
  let passId = value;
  if (value.includes('?')) {
    try { passId = new URL(value).searchParams.get('verify_pass') || ''; }
    catch { throw new Error('Enter a valid pass ID or verification link.'); }
  }
  if (!/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(passId)) {
    throw new Error('This pass code is invalid. Ask the explorer to open their current digital pass.');
  }
  const { pass } = await request<{ pass: ExplorerPass }>(`/verify/${encodeURIComponent(passId)}`, {}, false);
  if (!pass || Date.parse(pass.expiresAt) <= Date.now() || !Number.isFinite(Date.parse(pass.expiresAt))) {
    throw new Error('This pass is invalid or expired.');
  }
  return {
    passId: pass.passId, name: pass.name, expiresAt: pass.expiresAt,
    tier: pass.plan === 'annual' ? 'Annual Explorer Pass (365 Days)' : '14-Day Holiday Pass',
  };
}
