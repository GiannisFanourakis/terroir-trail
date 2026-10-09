# TerroirTrail

TerroirTrail is an independent, discovery-first agritourism and producer guide for culinary travelers, road-trippers, and slow travelers across Europe. It helps people find place-based producers, understand whether and how they can be visited, assess practical access information, and contact makers directly through official channels.

Production: https://terroir-trail.web.app/

---

## What TerroirTrail Is

TerroirTrail is built around **curated discovery rather than catalogue volume**. The public product brings together wineries, breweries, cideries, distilleries, olive mills, olive-oil producers, other oil producers, dairies / cheesemakers, apiaries / honey producers, confectionery producers, herb farms, mushroom farms, and traditional farms across Europe.

A public listing is an editorial discovery record. It does **not** automatically mean that the producer is a commercial partner, accepts bookings through TerroirTrail, or has paid for inclusion. Published does not mean partnered.

The current roadmap and milestone history are maintained in [ROADMAP.md](ROADMAP.md).

---

## Product Principles

- **Unknown stays unknown.** Missing evidence is never converted into a positive claim or an unsupported travel promise.
- **Listing, visitability, and partnership are separate.** A producer can be discoverable without being a commercial partner, and a mapped producer is not automatically open to visitors.
- **Location and road access are separate facts.** A verified map point does not prove that the final approach is suitable for a standard rental car.
- **Direct producer contact comes first.** Official websites, phone numbers, and producer-controlled channels are preferred for current visiting arrangements.
- **Road guidance fails closed.** Positive access guidance is only shown when it has been independently supported; otherwise uncertainty remains visible.
- **Evidence is attached to the fact it supports.** Visitability, location, and access can have different sources and different confidence states.
- **The public catalogue is curated.** Expansion is allowed only when new records meet the same identity, location, evidence, and publication standards.

---

## Current Public Product

- **Interactive map and producer directory** with country, destination, region, and category discovery.
- **Multiple maker categories per producer** across 13 supported categories, with grouped products and matching map, trip, export and promoted-card presentation. Visitor features remain separate.
- **Producer detail pages** with story, products, official contact details, map location, visit information, and access notes where known.
- **Visitability V1** with explicit states for public visits, seasonal public access, appointment-only access, uncertain current access, and visits that are not publicly confirmed.
- **Booking and walk-in guidance** that distinguishes required, recommended, not-required, accepted, not-accepted, and subject-to-availability states without turning unknown values into “No.”
- **Independent road-access classification** with fail-closed rental-car guidance.
- **Traveler accounts and Terroir Passport** for visited places and private tasting / trip notes.
- **Favorites / saved places** separated by traveler account.
- **Producer claim / Host Portal** with ownership review before management privileges are granted, plus source-backed category and grouped-product proposals that require Admin approval.
- **Canonical SEO/AEO pages** for active producer entities and eligible country, destination, region, category, and destination/category landing pages.
- **Offline/static fallback** generated from the same active catalogue and lazy-loaded only when the live service is unavailable.

---

## Catalogue Source of Truth

Supabase **public.producers** controls authoritative producer identity, active publication, geography, primary category and the base catalogue facts.

Admin-approved public listing edits are stored in Firestore **producer_overrides** and projected onto active producers. Additional maker categories and grouped products require an official source, trusted Host ownership and Admin approval. The current Supabase primary category is checked at submission and approval; an edit tied to an outdated primary category is not applied. Direct Host writes cannot publish these fields.

Runtime discovery, trip exports and catalogue/SEO synchronization use the same approved classification projection. Pending requests never enter the public catalogue. SEO reflects approved public edits when the existing reconciliation or deployment workflow next rebuilds the static pages.

Publication is controlled by **public.producers.is_active**.

Only rows with **is_active = true** are exposed through the public RLS policy and included in runtime discovery, generated fallback data, SEO/AEO output, public catalogue summaries, and sitemap generation.

Current totals are **not maintained manually in README, FAQ, About copy, tests, or SEO prose**.

The synchronization pipeline generates:

- **src/data/liveCatalogue.generated.ts** — deterministic active producer snapshot used by SEO/AEO and the full offline fallback.
- **src/data/activeProducerIds.generated.ts** — compact active-ID publication set.
- **src/data/catalogueSummary.generated.ts** — lightweight public totals, country names, and category names used by About/FAQ UI.
- **dist/catalogue-state.json** — deployment state containing catalogue dimensions and a deterministic catalogue hash.
- canonical producer pages, landing pages, **llms.txt**, and the production sitemap.

Exact synchronization checks compare producer IDs **and** a SHA-256 catalogue-content hash, so a same-size producer swap or content change cannot pass unnoticed.

---

## Automated Catalogue & Deployment Publication

The **Production Deploy** workflow runs after a successful **Quality Gate** on `main` and can also be invoked manually. It:

1. reads the latest active Supabase catalogue and approved public listing edits;
2. regenerates the active producer snapshot, active IDs, and public catalogue summary;
3. verifies exact live ↔ generated parity;
4. runs the complete quality gate and real-browser responsive checks;
5. commits generated catalogue changes when necessary;
6. builds the final production frontend and re-verifies live catalogue parity;
7. deploys Firestore rules/indexes, the trusted Cloud Run API and Firebase Hosting; and
8. verifies API health, public pages, production UI and the deployed catalogue hash.

Failed checks prevent deployment. Runtime listings use live Supabase data plus approved public edits; generated fallback data, public counts, SEO/AEO pages and sitemaps refresh on the next successful deployment. Database edits alone do not trigger a release. The separate **Production Smoke** workflow runs every six hours and checks HTTP/browser health; it does not regenerate or publish the catalogue.

---

## Commercial Status

TerroirTrail is currently **discovery-first**, not an online travel agency or open booking marketplace.

- The producer-facing **TerroirTrail Partner — Annual** subscription is live for approved Hosts at **€199/year** through hosted Stripe Checkout. It unlocks eligibility for clearly labelled, Admin-reviewed paid promotion only; it does not buy listing inclusion, verification, visitability/access facts, or organic ranking.
- Traveler-facing **TerroirTrail Passes** add optional planning conveniences without paywalling producer discovery or trust facts: **Holiday Pass €9.99 / 14 days (one-time)** and **Annual Explorer Pass €24.99/year (recurring)**. Paid conveniences are ad-free planning, printable/save-to-PDF Trip Packs, calendar export and downloadable offline trip snapshots.
- Public TerroirTrail tasting checkout, Explorer venue-perk/QR redemption, open OTA-style booking, and chauffeur bookings remain dormant/quarantined and are not active public products.
- Display advertising remains disabled.
- Some outbound travel links may be affiliate links. TerroirTrail may receive a referral commission from the third-party provider at no additional cost to the traveler.
- Editorial producer inclusion is independent of affiliate activity and commercial partnership. Published does not mean partnered.

Dormant infrastructure in the codebase must not be treated as an active public feature.

---

## For Producers

### Are you a producer who belongs on TerroirTrail?

If you run an independent, place-based producer that fits the TerroirTrail catalogue, contact **[terroirtrail@gmail.com](mailto:terroirtrail@gmail.com)** with:

- producer name;
- location;
- official website or public business page; and
- a short description of what you make.

TerroirTrail reviews identity, location, visitability, and access independently. An enquiry does not guarantee inclusion, verification, commercial partnership, booking permission, or Host access.

### Already listed?

Use the Host Portal to submit a producer claim. Management privileges are granted only after ownership review.

---

## Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons
- **Mapping:** Leaflet 1.9.x
- **Geospatial data:** sourced regional boundaries from geoBoundaries and Eurostat / GISCO
- **Catalogue / backend:** Supabase PostgreSQL / PostGIS
- **Traveler identity and private account data:** Firebase Authentication and Cloud Firestore
- **Hosting:** Firebase Hosting
- **Mobile packaging:** Capacitor for iOS and Android wrappers
- **Automation:** GitHub Actions + deterministic catalogue generation / verification

---

## Development

### Install

```bash
npm install
```

### Run locally

```bash
npm run dev
```

### Full quality gate

```bash
npm run check
```

The quality gate covers TypeScript, ESLint, formatting, frontend and server tests, Firebase rules tests, production build generation, SEO/AEO verification, and build budgets.

### Synchronize the active catalogue locally

Requires the public Supabase URL and publishable/anon key used by the application:

```bash
npm run sync:seo-catalogue
npm run verify:live-catalogue
```

### Production-oriented live build

```bash
npm run build:live
```

### Automatic production deploy

Normal production releases are triggered by a successful push to `main`:

```bash
git push origin main
```

GitHub Actions runs the Quality Gate first. When it passes, `Production Deploy`:

1. synchronizes and verifies the active catalogue;
2. reruns the full repository gate and responsive browser smoke;
3. deploys Firestore rules/indexes;
4. deploys the existing `terroirtrail-api` Cloud Run service;
5. verifies API health;
6. deploys Firebase Hosting;
7. runs public production/UI smoke checks and verifies the catalogue hash.

`git pull` never deploys production.

Google Cloud authentication is keyless through GitHub OIDC / Workload Identity Federation. One-time project bootstrap:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup_github_deploy_wif.ps1
```

The manual commands below remain recovery/fallback tools only.

### Minimum production redeploy

From the repository root, update local `main` first:

```bash
git pull origin main
```

**Frontend / Firebase Hosting only:**

```bash
npm run deploy
```

**API / Cloud Run after server-side changes:**

```bash
gcloud run deploy terroirtrail-api --source . --project=terroir-trail --region=europe-west1 --allow-unauthenticated --min-instances=0 --max-instances=3 --cpu=1 --memory=512Mi
```

**Firestore rules/indexes only:**

```bash
npm run deploy:firestore
```

If a change touches Firestore rules, deploy them with `npm run deploy:firestore`. If a change touches API and frontend, deploy Cloud Run first, then run `npm run deploy`.

The Cloud Run command updates the existing `terroirtrail-api` service. Do not create a second service. Existing server environment variables and Secret Manager bindings must remain configured on that service.

Before a manual production redeploy, prefer:

```bash
npm run check
```

The automated **Production Reconcile** workflow deploys Firebase Hosting, but it does **not** deploy Cloud Run server changes.

### Additional checks

```bash
npm run test:python
npm run mobile:preflight -- all
```

---

## Important Project Files

- [ROADMAP.md](ROADMAP.md) — canonical product roadmap and milestone state
- [AGENTS.md](AGENTS.md) — repository operating and producer-verification rules
- [LICENSE.md](LICENSE.md) — proprietary software notice and third-party attributions
- [PRIVACY_POLICY.md](PRIVACY_POLICY.md) — privacy and GDPR disclosures
- [TERMS_OF_SERVICE.md](TERMS_OF_SERVICE.md) — service and commercial terms
- [src/services/producerService.ts](src/services/producerService.ts) — runtime producer retrieval and fallback behavior
- [src/data/catalogueSummary.generated.ts](src/data/catalogueSummary.generated.ts) — generated lightweight public catalogue scope
- [scripts/sync_seo_catalogue.ts](scripts/sync_seo_catalogue.ts) — active-catalogue generator
- [scripts/verify_live_catalogue_sync.ts](scripts/verify_live_catalogue_sync.ts) — exact live/generated parity verification
- [.github/workflows/production-deploy.yml](.github/workflows/production-deploy.yml) — automated catalogue/frontend/API publication
- [.github/workflows/production-smoke.yml](.github/workflows/production-smoke.yml) — scheduled production health checks
- [public/llms.txt](public/llms.txt) — source template for the machine-readable public product summary
- [src/utils/producerAccess.ts](src/utils/producerAccess.ts) — road-access and rental-car guidance logic

---

## License & Attribution

TerroirTrail software, design assets, proprietary database schemas, and associated project materials are **Proprietary Works** owned exclusively by TerroirTrail. All rights reserved. See [LICENSE.md](LICENSE.md).

Third-party libraries and data remain subject to their respective licenses. Map boundaries and base layers retain their required geoBoundaries, Eurostat / GISCO, OpenStreetMap, CARTO, Esri, and other applicable attributions.
