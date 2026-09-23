import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  PartnerBillingError,
  createPartnerBillingPortal,
  createPartnerCheckout,
  getPartnerBillingAvailability,
  processPartnerStripeEvent,
} from '../services/partnerBillingService';

const makeDb = (producerIds: string[]) => ({
  collection: (name: string) => {
    if (name === 'admin_users') {
      return {
        doc: () => ({
          get: async () => ({ exists: false, data: () => undefined }),
        }),
      };
    }
    if (name === 'producer_owners') {
      return {
        where: (_field: string, _operator: string, uid: string) => ({
          get: async () => ({
            docs: producerIds.map(id => ({
              id,
              data: () => ({ ownerUid: uid, status: 'active', producerId: id }),
            })),
          }),
        }),
      };
    }
    throw new Error('Unexpected collection: ' + name);
  },
});

const withBillingEnv = async (
  values: Partial<Record<'STRIPE_PARTNER_BILLING_ENABLED' | 'STRIPE_PARTNER_ANNUAL_PRICE_ID' | 'PARTNER_BILLING_GRACE_DAYS' | 'APP_URL', string | undefined>>,
  fn: () => Promise<void> | void
) => {
  const keys = Object.keys(values) as Array<keyof typeof values>;
  const before = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  try {
    for (const key of keys) {
      const value = values[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    await fn();
  } finally {
    for (const key of keys) {
      const value = before[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
};

test('Partner billing stays disabled unless strict gate and recurring Price ID are configured', async () => {
  await withBillingEnv(
    {
      STRIPE_PARTNER_BILLING_ENABLED: 'false',
      STRIPE_PARTNER_ANNUAL_PRICE_ID: 'price_partner_annual',
    },
    () => {
      assert.deepEqual(getPartnerBillingAvailability(), {
        checkoutEnabled: false,
        portalEnabled: true,
        planCode: 'partner_annual_v1',
      });
    }
  );

  await withBillingEnv(
    {
      STRIPE_PARTNER_BILLING_ENABLED: 'true',
      STRIPE_PARTNER_ANNUAL_PRICE_ID: undefined,
    },
    () => {
      assert.deepEqual(getPartnerBillingAvailability(), {
        checkoutEnabled: false,
        portalEnabled: false,
        planCode: 'partner_annual_v1',
      });
    }
  );
});

test('Partner Checkout is ownership-scoped and pins the configured server-side annual Price', async () => {
  await withBillingEnv(
    {
      STRIPE_PARTNER_BILLING_ENABLED: 'true',
      STRIPE_PARTNER_ANNUAL_PRICE_ID: 'price_partner_annual',
      APP_URL: 'https://terroir-trail.web.app',
    },
    async () => {
      const rpcCalls: Array<{ name: string; args: Record<string, unknown> }> = [];
      const supabase = {
        rpc: async (name: string, args: Record<string, unknown>) => {
          rpcCalls.push({ name, args });
          return { data: {}, error: null };
        },
        from: (table: string) => {
          assert.equal(table, 'commercial_partner_subscriptions');
          return {
            select: () => ({
              eq: () => ({
                not: () => ({
                  order: () => ({
                    limit: async () => ({ data: [], error: null }),
                  }),
                }),
              }),
            }),
          };
        },
      };

      let checkoutArgs: any = null;
      const stripeClient = {
        checkout: {
          sessions: {
            create: async (args: any) => {
              checkoutArgs = args;
              return { url: 'https://checkout.stripe.com/c/pay_test' };
            },
          },
        },
      };

      const result = await createPartnerCheckout(
        'host-uid',
        'host@example.com',
        'producer-1',
        makeDb(['producer-1']) as any,
        supabase as any,
        stripeClient as any
      );

      assert.equal(result.url, 'https://checkout.stripe.com/c/pay_test');
      assert.equal(rpcCalls[0].name, 'prepare_commercial_partner_checkout_v1');
      assert.equal(rpcCalls[0].args.p_producer_id, 'producer-1');
      assert.equal(rpcCalls[0].args.p_actor_uid, 'host-uid');
      assert.equal(checkoutArgs.mode, 'subscription');
      assert.deepEqual(checkoutArgs.line_items, [{ price: 'price_partner_annual', quantity: 1 }]);
      assert.equal(checkoutArgs.metadata.purpose, 'producer_partner');
      assert.equal(checkoutArgs.metadata.producerId, 'producer-1');
      assert.equal(checkoutArgs.subscription_data.metadata.planCode, 'partner_annual_v1');
      assert.deepEqual(checkoutArgs.subscription_data.billing_mode, { type: 'flexible' });
      assert.equal(checkoutArgs.customer_email, 'host@example.com');
      assert.equal('payment_method_types' in checkoutArgs, false);
      assert.equal('automatic_tax' in checkoutArgs, false);
      assert.match(checkoutArgs.integration_identifier, /^terroirtrail_partner_[A-Za-z]{8}$/);
      assert.match(checkoutArgs.success_url, /partnerCheckout=success/);
      assert.match(checkoutArgs.cancel_url, /partnerCheckout=cancelled/);

      await assert.rejects(
        createPartnerCheckout(
          'host-uid',
          'host@example.com',
          'producer-other',
          makeDb(['producer-1']) as any,
          supabase as any,
          stripeClient as any
        ),
        (error: unknown) =>
          error instanceof PartnerBillingError && error.code === 'forbidden'
      );
    }
  );
});

test('disabled Partner Checkout fails before commercial or Stripe writes', async () => {
  await withBillingEnv(
    {
      STRIPE_PARTNER_BILLING_ENABLED: 'false',
      STRIPE_PARTNER_ANNUAL_PRICE_ID: 'price_partner_annual',
    },
    async () => {
      let dbTouched = false;
      let stripeTouched = false;
      const db = {
        collection: () => {
          dbTouched = true;
          throw new Error('should not reach ownership');
        },
      };
      const stripeClient = {
        checkout: { sessions: { create: async () => {
          stripeTouched = true;
          return { url: 'https://checkout.stripe.com/test' };
        } } },
      };

      await assert.rejects(
        createPartnerCheckout('host', 'host@example.com', 'producer-1', db as any, {} as any, stripeClient as any),
        (error: unknown) =>
          error instanceof PartnerBillingError && error.code === 'service_unavailable'
      );
      assert.equal(dbTouched, false);
      assert.equal(stripeTouched, false);
    }
  );
});

test('billing portal resolves Stripe customer only on the server', async () => {
  await withBillingEnv(
    {
      STRIPE_PARTNER_BILLING_ENABLED: 'false',
      STRIPE_PARTNER_ANNUAL_PRICE_ID: 'price_partner_annual',
      APP_URL: 'https://terroir-trail.web.app',
    },
    async () => {
      const supabase = {
        from: (table: string) => {
          assert.equal(table, 'commercial_partner_subscriptions');
          return {
            select: () => ({
              eq: (_field: string, producerId: string) => {
                assert.equal(producerId, 'producer-1');
                return {
                  not: () => ({
                    order: () => ({
                      limit: async () => ({
                        data: [{ provider_customer_id: 'cus_server_only' }],
                        error: null,
                      }),
                    }),
                  }),
                };
              },
            }),
          };
        },
      };

      let portalArgs: any = null;
      const stripeClient = {
        billingPortal: {
          sessions: {
            create: async (args: any) => {
              portalArgs = args;
              return { url: 'https://billing.stripe.com/p/session' };
            },
          },
        },
      };

      const result = await createPartnerBillingPortal(
        'host-uid',
        'producer-1',
        makeDb(['producer-1']) as any,
        supabase as any,
        stripeClient as any
      );

      assert.equal(result.url, 'https://billing.stripe.com/p/session');
      assert.equal(portalArgs.customer, 'cus_server_only');
      assert.match(portalArgs.return_url, /partnerBilling=return/);
    }
  );
});

test('subscription webhook activates only the configured Partner Price and persists normalized period fields', async () => {
  await withBillingEnv(
    {
      STRIPE_PARTNER_ANNUAL_PRICE_ID: 'price_partner_annual',
    },
    async () => {
      const rpcCalls: Array<{ name: string; args: Record<string, unknown> }> = [];
      const supabase = {
        rpc: async (name: string, args: Record<string, unknown>) => {
          rpcCalls.push({ name, args });
          return { data: { processed: true, duplicate: false }, error: null };
        },
      };

      const subscription = {
        id: 'sub_partner',
        status: 'active',
        customer: 'cus_partner',
        cancel_at_period_end: false,
        metadata: {
          purpose: 'producer_partner',
          producerId: 'producer-1',
          planCode: 'partner_annual_v1',
        },
        items: {
          data: [{
            price: { id: 'price_partner_annual' },
            current_period_start: 1790121600,
            current_period_end: 1821657600,
          }],
        },
      };

      const event = {
        id: 'evt_partner_active',
        type: 'customer.subscription.updated',
        created: 1790121600,
        data: { object: subscription },
      };

      const result = await processPartnerStripeEvent(
        event as any,
        supabase as any,
        {} as any
      );

      assert.equal(result.processed, true);
      assert.equal(result.subscriptionStatus, 'active');
      assert.equal(rpcCalls[0].name, 'apply_stripe_partner_subscription_event_v1');
      assert.equal(rpcCalls[0].args.p_producer_id, 'producer-1');
      assert.equal(rpcCalls[0].args.p_provider_customer_id, 'cus_partner');
      assert.equal(rpcCalls[0].args.p_provider_subscription_id, 'sub_partner');
      assert.equal(rpcCalls[0].args.p_subscription_status, 'active');
      assert.equal(rpcCalls[0].args.p_grace_until, null);
      assert.equal(typeof rpcCalls[0].args.p_current_period_start, 'string');
      assert.equal(typeof rpcCalls[0].args.p_current_period_end, 'string');
    }
  );
});

test('failed renewal enters bounded grace and a later paid invoice restores active status', async () => {
  await withBillingEnv(
    {
      STRIPE_PARTNER_ANNUAL_PRICE_ID: 'price_partner_annual',
      PARTNER_BILLING_GRACE_DAYS: '5',
    },
    async () => {
      const statuses: string[] = [];
      const graceValues: Array<unknown> = [];
      const supabase = {
        rpc: async (_name: string, args: Record<string, unknown>) => {
          statuses.push(String(args.p_subscription_status));
          graceValues.push(args.p_grace_until);
          return { data: { processed: true, duplicate: false }, error: null };
        },
      };

      const subscription = {
        id: 'sub_partner',
        status: 'past_due',
        customer: 'cus_partner',
        cancel_at_period_end: false,
        metadata: {
          purpose: 'producer_partner',
          producerId: 'producer-1',
          planCode: 'partner_annual_v1',
        },
        items: {
          data: [{
            price: { id: 'price_partner_annual' },
            current_period_start: 1790121600,
            current_period_end: 1821657600,
          }],
        },
      };

      const stripeClient = {
        subscriptions: {
          retrieve: async (id: string) => {
            assert.equal(id, 'sub_partner');
            return subscription;
          },
        },
      };

      const failed = {
        id: 'evt_invoice_failed',
        type: 'invoice.payment_failed',
        created: 1790121600,
        data: {
          object: {
            parent: {
              subscription_details: { subscription: 'sub_partner' },
            },
          },
        },
      };

      const paid = {
        id: 'evt_invoice_paid',
        type: 'invoice.paid',
        created: 1790121700,
        data: {
          object: {
            parent: {
              subscription_details: { subscription: 'sub_partner' },
            },
          },
        },
      };

      await processPartnerStripeEvent(failed as any, supabase as any, stripeClient as any);
      await processPartnerStripeEvent(paid as any, supabase as any, stripeClient as any);

      assert.deepEqual(statuses, ['grace', 'active']);
      assert.equal(typeof graceValues[0], 'string');
      assert.equal(graceValues[1], null);
    }
  );
});

test('wrong Stripe Price or unrelated subscription metadata cannot activate Partner entitlement', async () => {
  await withBillingEnv(
    { STRIPE_PARTNER_ANNUAL_PRICE_ID: 'price_partner_annual' },
    async () => {
      let rpcCalled = false;
      const supabase = {
        rpc: async () => {
          rpcCalled = true;
          return { data: {}, error: null };
        },
      };

      const unrelated = {
        id: 'evt_unrelated',
        type: 'customer.subscription.updated',
        created: 1790121600,
        data: {
          object: {
            id: 'sub_other',
            status: 'active',
            customer: 'cus_other',
            cancel_at_period_end: false,
            metadata: { purpose: 'something_else' },
            items: { data: [{ price: { id: 'price_other' } }] },
          },
        },
      };

      const ignored = await processPartnerStripeEvent(unrelated as any, supabase as any, {} as any);
      assert.equal(ignored.processed, false);
      assert.equal(rpcCalled, false);

      const wrongPrice = structuredClone(unrelated) as any;
      wrongPrice.id = 'evt_wrong_price';
      wrongPrice.data.object.metadata = {
        purpose: 'producer_partner',
        producerId: 'producer-1',
        planCode: 'partner_annual_v1',
      };

      await assert.rejects(
        processPartnerStripeEvent(wrongPrice, supabase as any, {} as any),
        (error: unknown) =>
          error instanceof PartnerBillingError && error.code === 'bad_request'
      );
      assert.equal(rpcCalled, false);
    }
  );
});
