import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { auth } = vi.hoisted(() => ({ auth: {
  authStateReady: vi.fn().mockResolvedValue(undefined),
  currentUser: null as null | { getIdToken: () => Promise<string> },
} }));
vi.mock('./firebase', () => ({ auth }));
import { startPassCheckout, fetchExplorerPass, confirmExplorerPass, verifyExplorerPass, isExplorerPassPurchasesEnabled } from './explorerPass';

const passId = '78e4a766-e771-4f50-9f7b-b367e027f507';
const pass = { passId, name: 'Verified Explorer', plan: 'holiday', expiresAt: '2099-01-01T00:00:00Z' };
const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
  vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.test/');
  vi.stubEnv('VITE_ENABLE_EXPLORER_PASS_PURCHASES', 'true');
  auth.currentUser = { getIdToken: vi.fn().mockResolvedValue('firebase-token') };
});
afterEach(() => { vi.clearAllMocks(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('explorer pass purchase gating', () => {
  it('detects when purchases are enabled or disabled via environment flag', () => {
    vi.stubEnv('VITE_ENABLE_EXPLORER_PASS_PURCHASES', 'false');
    expect(isExplorerPassPurchasesEnabled()).toBe(false);

    vi.stubEnv('VITE_ENABLE_EXPLORER_PASS_PURCHASES', 'true');
    expect(isExplorerPassPurchasesEnabled()).toBe(true);
  });

  it('blocks startPassCheckout when purchases are disabled without a network request', async () => {
    vi.stubEnv('VITE_ENABLE_EXPLORER_PASS_PURCHASES', 'false');
    await expect(startPassCheckout('holiday')).rejects.toThrow('private pilot');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('authenticated pass requests', () => {
  it('sends only the chosen plan with a Firebase bearer token', async () => {
    fetchMock.mockResolvedValueOnce(Response.json({ url: 'https://checkout.stripe.com/test' }));
    await expect(startPassCheckout('holiday')).resolves.toEqual({ url: 'https://checkout.stripe.com/test' });
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.example.test/api/passes/checkout');
    expect(options.headers.get('Authorization')).toBe('Bearer firebase-token');
    expect(JSON.parse(options.body)).toEqual({ plan: 'holiday' });
    expect(options.cache).toBe('no-store');
  });

  it('rejects demo or signed-out purchases without a network request', async () => {
    auth.currentUser = null;
    await expect(startPassCheckout('annual')).rejects.toThrow('real account');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('never activates a pass on a failed confirmation or an HTML hosting fallback', async () => {
    fetchMock.mockResolvedValueOnce(Response.json({ error: 'Payment is pending' }, { status: 409 }));
    await expect(confirmExplorerPass('cs_test_pending')).rejects.toThrow('Payment is pending');
    fetchMock.mockResolvedValueOnce(new Response('<html>SPA</html>', { headers: { 'content-type': 'text/html' } }));
    await expect(fetchExplorerPass()).rejects.toThrow('service is unavailable');
  });
});

describe('QR verification', () => {
  it('rejects old, arbitrary and malformed IDs without querying the server', async () => {
    for (const input of ['TR-VIP-DEMO-2026', 'anything', 'https://example.test/?name=Fake&tier=annual']) {
      await expect(verifyExplorerPass(input)).rejects.toThrow('invalid');
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('uses server identity and tier, ignoring forged URL claims', async () => {
    auth.currentUser = null;
    fetchMock.mockResolvedValueOnce(Response.json({ pass }));
    const result = await verifyExplorerPass(`https://example.test/?verify_pass=${passId}&name=Fake&tier=annual`);
    expect(result.name).toBe('Verified Explorer');
    expect(result.tier).toBe('14-Day Holiday Pass');
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(`https://api.example.test/api/passes/verify/${passId}`);
    expect(options.headers.has('Authorization')).toBe(false);
  });

  it('rejects expired, invalid and unavailable verification responses', async () => {
    for (const expiresAt of ['2000-01-01T00:00:00Z', 'invalid']) {
      fetchMock.mockResolvedValueOnce(Response.json({ pass: { ...pass, expiresAt } }));
      await expect(verifyExplorerPass(passId)).rejects.toThrow('expired');
    }
    fetchMock.mockResolvedValueOnce(Response.json({ error: 'Unable to verify' }, { status: 503 }));
    await expect(verifyExplorerPass(passId)).rejects.toThrow('Unable to verify');
  });
});
