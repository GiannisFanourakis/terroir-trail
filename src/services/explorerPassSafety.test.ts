import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  isExplorerPassPurchasesEnabled,
  startPassCheckout,
  verifyExplorerPass,
} from './explorerPass';

vi.mock('./firebase', () => ({
  auth: {
    currentUser: {
      getIdToken: vi.fn().mockResolvedValue('mock-firebase-id-token'),
    },
    authStateReady: vi.fn().mockResolvedValue(undefined),
  },
  isFirebaseConfigured: true,
}));

describe('Explorer Pass Mobile Parity & Safety Enforcement', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_ENABLE_EXPLORER_PASS_PURCHASES', 'false');
    vi.clearAllMocks();
  });

  it('strictly disables public explorer pass purchases', () => {
    expect(isExplorerPassPurchasesEnabled()).toBe(false);
  });

  it('rejects any attempt to initiate pass checkout when purchases are disabled', async () => {
    await expect(startPassCheckout('holiday')).rejects.toThrow(
      'Explorer Pass purchases are currently in private pilot and closed to new public orders.'
    );
  });

  it('validates pass ID format and structure for host verification', async () => {
    await expect(verifyExplorerPass('invalid-pass-id')).rejects.toThrow(
      'This pass code is invalid. Ask the explorer to open their current digital pass.'
    );
  });

  it('extracts pass ID from URL query strings for QR scan workflows', async () => {
    const validUuid = '12345678-1234-4234-a234-123456789abc';
    const qrUrl = `https://terroir-trail.web.app/?verify_pass=${validUuid}`;

    // Mock fetch for the verification endpoint
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: {
        get: (h: string) => (h === 'content-type' ? 'application/json' : null),
      },
      json: async () => ({
        pass: {
          passId: validUuid,
          name: 'Jane Doe',
          plan: 'holiday',
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        },
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const verified = await verifyExplorerPass(qrUrl);
    expect(verified.passId).toBe(validUuid);
    expect(verified.name).toBe('Jane Doe');
    expect(verified.tier).toBe('14-Day Holiday Pass');
  });
});
