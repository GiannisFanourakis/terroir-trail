# Phase 15 Producer Partner Commercial Contract V1

**Status:** Block A implementation contract  
**Date:** 2026-09-23  
**Scope:** commercial authority and data model only

## 1. Trust boundary

TerroirTrail keeps four concepts separate:

1. **Independent researched listing** — producer appears in the public catalogue.
2. **Verified Host ownership** — Firestore `producer_owners` grants a trusted account authority to manage factual listing content.
3. **Commercial Partner relationship** — Supabase `commercial_partner_accounts` records eligibility for paid distribution.
4. **Subscription / campaign state** — separate Supabase records describe payment entitlement and approved promotional activity.

None of these states may manufacture or override location verification, visitability, booking policy, road/access evidence, publication state, or organic/editorial ordering.

Host identity is resolved only from server-trusted Firestore ownership records. Commercial records are never directly readable or writable by browser `anon` or `authenticated` Supabase roles.

## 2. Partner relationship lifecycle

`commercial_partner_accounts.status`:

- `pending` — commercial relationship created but not yet active.
- `active` — producer is eligible for approved paid-distribution workflows.
- `suspended` — commercial distribution is temporarily disabled without ending the free listing.
- `ended` — commercial relationship ended.

Allowed V1 transitions:

- new → `pending` or `active`
- `pending` → `active`, `suspended`, or `ended`
- `active` → `suspended` or `ended`
- `suspended` → `active` or `ended`
- `ended` → `pending` only

`activation_source` is either `admin_pilot` or `stripe_subscription`. This intentionally supports controlled internal production pilots before Stripe Checkout is activated.

## 3. Subscription lifecycle

`commercial_partner_subscriptions` is historical and provider-facing. V1 plan code is `partner_annual_v1`; V1 provider is Stripe.

Allowed stored states:

- `pending`
- `active`
- `past_due`
- `grace`
- `cancelled`
- `expired`

At most one subscription per producer may be in `pending`, `active`, `past_due`, or `grace` simultaneously.

Stripe customer/subscription IDs are trusted server metadata. They are not returned from the ordinary Host commercial-state endpoint.

The Stripe webhook state machine and entitlement rules are deliberately deferred to the Stripe implementation block.

## 4. Campaign contract

V1 campaign types:

- `regional_featured`
- `trip_contextual`
- `seasonal_notice`

V1 placements:

- `region_discovery`
- `trip_preparation`

Campaign lifecycle:

`draft → awaiting_review → approved → scheduled/active → paused/completed/withdrawn`

Rejected campaigns may return to `draft`. Completed and withdrawn campaigns are terminal.

Every campaign belongs to exactly one commercial Partner producer. The trusted API constrains targeting to the producer's canonical active-catalogue destination and category; V1 does not permit arbitrary cross-region or cross-category targeting.

Campaign copy is commercial content and remains separate from canonical visitability truth.

## 5. Authority

**Host**
- may read commercial state only for producer IDs present in that account's active trusted `producer_owners` records;
- cannot create/activate Partner status;
- cannot create, approve, schedule, pause, or end campaigns in Block A;
- does not receive Stripe provider identifiers through the Host read endpoint.

**Admin**
- may read commercial state;
- may create/transition Partner status;
- may create campaign drafts;
- may transition campaign lifecycle state.

**Stripe/system**
- reserved actor types in the audit model for later trusted server workflows;
- browser clients never assert these actor types.

## 6. Database exposure

Commercial tables are in `public` so the Cloud Run API can reach them through Supabase's Data API using the service role.

For every commercial table:
- RLS is enabled;
- `anon` and `authenticated` table privileges are revoked;
- only `service_role` receives CRUD privileges.

Commercial mutation RPCs are `SECURITY INVOKER`, have execution revoked from `PUBLIC`, `anon`, and `authenticated`, and grant execution only to `service_role`.

This is intentionally stricter than relying on RLS policies alone.

## 7. Audit

Every Partner status transition and campaign creation/status transition creates a row in `commercial_partner_audit`.

Audit records contain:
- producer ID;
- entity type / entity ID;
- event type;
- trusted actor type;
- actor UID where applicable;
- previous/new status;
- bounded reason;
- timestamp.

The audit table is also service-role only.

## 8. Explicit non-goals for Block A

Block A does **not**:
- expose paid placements to travelers;
- add Partner analytics events;
- add Host Portal or Admin UI;
- create Stripe Checkout;
- process Stripe webhooks;
- grant promotion automatically after payment;
- create campaign credits;
- change organic ranking;
- change producer verification or visitability;
- activate Experiences or booking.

Those belong to later Phase 15 blocks.
