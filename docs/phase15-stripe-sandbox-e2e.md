# Phase 15 - Stripe Partner Sandbox E2E

## Purpose

This test validates the Partner billing contract against a real Stripe sandbox without
moving money or enabling production Partner Checkout.

Run it with:

```bash
npm run stripe:e2e:sandbox
```

The script accepts `STRIPE_E2E_SECRET_KEY` when provided. Otherwise it reads the
active Stripe CLI sandbox `test_mode_api_key` from the local Stripe CLI config.
The key is never printed or written into the repository.

## Safety boundaries

The test refuses any key that is not a Stripe test/sandbox key. Before importing
TerroirTrail billing modules it sets `STRIPE_SECRET_KEY` to the sandbox key, so
application Stripe clients cannot fall through to a live key from local `.env`.
Production configuration is not changed. In particular, the production
`STRIPE_PARTNER_BILLING_ENABLED` gate remains independent and fail-closed.

All Stripe resources created by the script are tagged with an E2E run identifier.
The subscription is cancelled, the open Checkout Session is expired, the customer
is deleted, and the temporary Product is archived during cleanup.

## What the test proves

The test uses the real `createPartnerCheckout` service with an ownership-scoped
test Host and an isolated in-memory commercial persistence adapter. It creates a
real recurring EUR 199/year Price and real hosted Checkout Session in the active
Stripe sandbox, then retrieves the Session and verifies:

- subscription mode;
- the exact server-selected annual Price;
- Partner purpose, producer and Host metadata;
- the commercial checkout preparation RPC boundary.

The script then creates a real Stripe sandbox Customer, test PaymentMethod and
annual Subscription carrying the same authoritative Partner metadata.
It polls Stripe for the actual `customer.subscription.created` event, signs that
real event payload with an E2E webhook secret, and passes it through
TerroirTrail's normal webhook verification and Partner event-processing path.

It verifies that the commercial subscription becomes active and that the Stripe
customer is associated only with the synthetic test producer.

The test then requests cancellation at period end, replays the actual
`customer.subscription.updated` event and verifies that entitlement remains
active while `cancel_at_period_end` is true.

Finally it cancels the sandbox subscription, replays the actual
`customer.subscription.deleted` event and verifies that the Partner entitlement
expires.

The persistence adapter rejects unexpected RPCs and producer IDs. This provides a
regression guard that billing activity remains scoped to the commercial Partner
contract rather than mutating verification, visitability, road/access or organic
ranking facts.

## Hosted Checkout UI boundary

Stripe's automated-testing guidance explicitly discourages browser automation of
Stripe-hosted Checkout and other Stripe UI surfaces because those interfaces have
security controls that make Selenium-style automation unreliable.

For that reason this E2E deliberately splits the integration at the supported
boundary:

1. TerroirTrail -> Stripe is exercised by creating and retrieving a real hosted
   Checkout Session with the application's production service code.
2. Stripe -> TerroirTrail is exercised with real sandbox subscription objects and
   actual Stripe event payloads replayed through signed webhook verification.

This is stronger than a mocked unit test while avoiding brittle or unsupported
automation of Stripe's hosted payment form.

The first genuine producer subscription in production should therefore be treated
as monitored production validation, not as a sacrificial self-purchase required
to prove the billing code.
