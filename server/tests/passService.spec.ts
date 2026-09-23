import { beforeEach, expect, it, vi } from 'vitest';

const { records, retrieve, create, subscriptionRetrieve, portalCreate, db } =
  vi.hoisted(() => {
    const records = new Map<string, Record<string, unknown>>();
    const retrieve = vi.fn();
    const create = vi.fn();
    const subscriptionRetrieve = vi.fn();
    const portalCreate = vi.fn();
    const db = {
      collection: vi.fn(() => ({
        doc: (id: string) => ({ id }),
        where: (field: string, _operator: string, value: unknown) => {
          const get = async () => {
            const matches = [...records.values()].filter(
              (record) => record[field] === value
            );
            return {
              empty: matches.length === 0,
              docs: matches.map((record) => ({ data: () => record })),
            };
          };
          return { get, limit: () => ({ get }) };
        },
      })),
      runTransaction: async (
        callback: (transaction: any) => Promise<unknown>
      ) =>
        callback({
          get: async (ref: { id: string }) => ({
            exists: records.has(ref.id),
            data: () => records.get(ref.id),
          }),
          create: (ref: { id: string }, record: Record<string, unknown>) =>
            records.set(ref.id, record),
        }),
    };
    return {
      records,
      retrieve,
      create,
      subscriptionRetrieve,
      portalCreate,
      db,
    };
  });
vi.mock('../firebaseAdmin', () => ({ adminDb: () => db }));
vi.mock('../stripeClient', () => ({
  stripe: {
    checkout: { sessions: { retrieve, create } },
    subscriptions: { retrieve: subscriptionRetrieve },
    billingPortal: { sessions: { create: portalCreate } },
  },
}));
import {
  createPassBillingPortal,
  createPassCheckout,
  fulfillPass,
  getExplorerPass,
  verifyExplorerPass,
} from '../services/passService';

function annualSubscription(status = 'active') {
  return {
    id: 'sub_annual',
    status,
    customer: 'cus_alice',
    metadata: { purpose: 'explorer_pass', userId: 'alice', plan: 'annual' },
    items: {
      data: [
        {
          price: { id: 'price_annual' },
          current_period_end: 4070908800,
        },
      ],
    },
  };
}

function paidSession() {
  return {
    id: 'cs_test_valid',
    created: Math.floor(Date.now() / 1000),
    mode: 'payment',
    status: 'complete',
    payment_status: 'paid',
    currency: 'eur',
    amount_total: 999,
    metadata: {
      purpose: 'explorer_pass',
      userId: 'alice',
      name: 'Alice',
      plan: 'holiday',
    },
    client_reference_id: 'alice',
    line_items: {
      has_more: false,
      data: [{ price: { id: 'price_holiday' }, quantity: 1 }],
    },
    payment_intent: {
      latest_charge: {
        paid: true,
        refunded: false,
        amount_refunded: 0,
        disputed: false,
      },
    },
  };
}

function annualSession() {
  const session: any = paidSession();
  session.mode = 'subscription';
  session.amount_total = 2499;
  session.metadata.plan = 'annual';
  session.line_items.data[0].price.id = 'price_annual';
  session.payment_intent = null;
  session.subscription = annualSubscription();
  return session;
}

beforeEach(() => {
  records.clear();
  vi.clearAllMocks();
  vi.stubEnv('STRIPE_HOLIDAY_PRICE_ID', 'price_holiday');
  vi.stubEnv('STRIPE_ANNUAL_PRICE_ID', 'price_annual');
  vi.stubEnv('STRIPE_EXPLORER_PORTAL_CONFIGURATION_ID', 'bpc_explorer');
  vi.stubEnv('EXPLORER_PASS_CHECKOUT_ENABLED', 'true');
  vi.stubEnv('APP_URL', 'https://app.example.test');
  retrieve.mockImplementation(async () => paidSession());
  subscriptionRetrieve.mockImplementation(async () => annualSubscription());
  portalCreate.mockResolvedValue({ url: 'https://billing.stripe.com/test' });
});

it('fails closed when server-side Explorer Pass checkout is not explicitly enabled', async () => {
  vi.stubEnv('EXPLORER_PASS_CHECKOUT_ENABLED', 'false');
  await expect(createPassCheckout('alice', 'Alice', 'holiday')).rejects.toThrow(
    'Explorer Pass checkout is disabled.'
  );
  expect(create).not.toHaveBeenCalled();
});

it('creates checkout with server-controlled price, identity and return URL', async () => {
  create.mockResolvedValueOnce({ url: 'https://checkout.stripe.com/test' });
  await createPassCheckout('alice', 'Alice', 'holiday');
  expect(create.mock.calls[0][0]).toMatchObject({
    mode: 'payment',
    line_items: [{ price: 'price_holiday', quantity: 1 }],
    client_reference_id: 'alice',
    metadata: { userId: 'alice', plan: 'holiday' },
    automatic_tax: { enabled: true },
    billing_address_collection: 'required',
    success_url: 'https://app.example.test/?explorerCheckout=success',
    cancel_url: 'https://app.example.test/?explorerCheckout=cancelled',
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
  await expect(fulfillPass('cs_test_valid', 'bob')).rejects.toThrow(
    'signed-in explorer'
  );
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
  expect(await verifyExplorerPass(pass!.passId)).toBeNull();
  expect(await getExplorerPass('alice')).toBeNull();
});

it('annual checkout uses recurring subscription mode and email', async () => {
  create.mockResolvedValueOnce({ url: 'https://checkout.stripe.com/annual' });

  await createPassCheckout('alice', 'Alice', 'annual', 'alice@example.test');

  expect(create.mock.calls[0][0]).toMatchObject({
    mode: 'subscription',
    line_items: [{ price: 'price_annual', quantity: 1 }],
    customer_email: 'alice@example.test',
    subscription_data: {
      metadata: {
        purpose: 'explorer_pass',
        userId: 'alice',
        plan: 'annual',
      },
    },
    automatic_tax: { enabled: true },
  });
});

it('annual entitlement follows Stripe subscription status and period end', async () => {
  retrieve.mockImplementation(async () => annualSession());

  const pass = await fulfillPass('cs_test_valid', 'alice');
  expect(pass).toMatchObject({
    plan: 'annual',
    expiresAt: '2099-01-01T00:00:00.000Z',
  });
  expect(await getExplorerPass('alice')).toEqual(pass);

  subscriptionRetrieve.mockResolvedValueOnce(annualSubscription('canceled'));
  expect(await getExplorerPass('alice')).toBeNull();
});

it('annual subscribers can open the dedicated Explorer billing portal', async () => {
  retrieve.mockImplementation(async () => annualSession());
  await fulfillPass('cs_test_valid', 'alice');

  const portal = await createPassBillingPortal('alice');

  expect(portal.url).toBe('https://billing.stripe.com/test');
  expect(portalCreate).toHaveBeenCalledWith({
    customer: 'cus_alice',
    configuration: 'bpc_explorer',
    return_url: 'https://app.example.test/?explorerBilling=return',
  });
});
