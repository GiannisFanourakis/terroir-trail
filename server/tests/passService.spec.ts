import { beforeEach, expect, it, vi } from 'vitest';

const { records, retrieve, create, db } = vi.hoisted(() => {
  const records = new Map<string, Record<string, unknown>>();
  const retrieve = vi.fn();
  const create = vi.fn();
  const db = {
    collection: vi.fn(() => ({
      doc: (id: string) => ({ id }),
      where: (field: string, _operator: string, value: unknown) => {
        const get = async () => {
          const matches = [...records.values()].filter(record => record[field] === value);
          return { empty: matches.length === 0, docs: matches.map(record => ({ data: () => record })) };
        };
        return { get, limit: () => ({ get }) };
      },
    })),
    runTransaction: async (callback: (transaction: any) => Promise<unknown>) => callback({
      get: async (ref: { id: string }) => ({ exists: records.has(ref.id), data: () => records.get(ref.id) }),
      create: (ref: { id: string }, record: Record<string, unknown>) => records.set(ref.id, record),
    }),
  };
  return { records, retrieve, create, db };
});
vi.mock('../firebaseAdmin', () => ({ adminDb: () => db }));
vi.mock('../stripeClient', () => ({ stripe: { checkout: { sessions: { retrieve, create } } } }));
import { createPassCheckout, fulfillPass, getExplorerPass, verifyExplorerPass } from '../services/passService';

function paidSession() {
  return {
    id: 'cs_test_valid', created: Math.floor(Date.now() / 1000), mode: 'payment', status: 'complete',
    payment_status: 'paid', currency: 'eur', amount_total: 1499,
    metadata: { purpose: 'explorer_pass', userId: 'alice', name: 'Alice', plan: 'holiday' },
    client_reference_id: 'alice',
    line_items: { has_more: false, data: [{ price: { id: 'price_holiday' }, quantity: 1 }] },
    payment_intent: { latest_charge: { paid: true, refunded: false, amount_refunded: 0, disputed: false } },
  };
}

beforeEach(() => {
  records.clear();
  vi.clearAllMocks();
  vi.stubEnv('STRIPE_HOLIDAY_PRICE_ID', 'price_holiday');
  vi.stubEnv('APP_URL', 'https://app.example.test');
  retrieve.mockImplementation(async () => paidSession());
});

it('creates checkout with server-controlled price, identity and return URL', async () => {
  create.mockResolvedValueOnce({ url: 'https://checkout.stripe.com/test' });
  await createPassCheckout('alice', 'Alice', 'holiday');
  expect(create.mock.calls[0][0]).toMatchObject({
    line_items: [{ price: 'price_holiday', quantity: 1 }],
    client_reference_id: 'alice', metadata: { userId: 'alice', plan: 'holiday' },
    success_url: 'https://app.example.test/?checkout_session_id={CHECKOUT_SESSION_ID}',
  });
});

it('repeated confirmation preserves the original token and expiry', async () => {
  const original = await fulfillPass('cs_test_valid', 'alice');
  const repeated = await fulfillPass('cs_test_valid', 'alice');
  expect(repeated).toEqual(original);
  expect(records.size).toBe(1);
  expect(original?.passId).toMatch(/^[0-9a-f-]{36}$/);
});

it('cross-account confirmation cannot write an entitlement', async () => {
  await expect(fulfillPass('cs_test_valid', 'bob')).rejects.toThrow('signed-in explorer');
  expect(records.size).toBe(0);
});

it('QR and account lookup return the paid record without private IDs', async () => {
  const pass = await fulfillPass('cs_test_valid', 'alice');
  expect(await verifyExplorerPass(pass!.passId)).toEqual(pass);
  expect(await getExplorerPass('alice')).toEqual(pass);
  expect(await getExplorerPass('bob')).toBeNull();
  expect(pass).not.toHaveProperty('userId');
  expect(pass).not.toHaveProperty('sessionId');
});

it('expired and forged tokens cannot verify', async () => {
  const pass = await fulfillPass('cs_test_valid', 'alice');
  records.get('cs_test_valid')!.expiresAt = '2000-01-01T00:00:00Z';
  retrieve.mockClear();
  expect(await verifyExplorerPass(pass!.passId)).toBeNull();
  expect(await verifyExplorerPass('TR-VIP-DEMO-2026')).toBeNull();
  expect(retrieve).not.toHaveBeenCalled();
});

it('a subsequent refund invalidates the QR and account entitlement', async () => {
  const pass = await fulfillPass('cs_test_valid', 'alice');
  const refunded = paidSession();
  refunded.payment_intent.latest_charge.refunded = true;
  retrieve.mockResolvedValue(refunded);
  await expect(verifyExplorerPass(pass!.passId)).rejects.toThrow('refunded');
  expect(await getExplorerPass('alice')).toBeNull();
});
