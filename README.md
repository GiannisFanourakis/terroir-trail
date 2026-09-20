# TerroirTrail

TerroirTrail is a discovery-first agritourism, craft beverage, and artisan food guide for independent culinary travelers, road-trippers, and slow travelers across Europe. Current production catalogue totals are derived from the live Supabase `public.producers` catalogue rather than maintained by hand.

Production deployment runs `npm run sync:seo-catalogue` before the build, refreshes the deterministic SEO/AEO snapshot, and calculates producer, destination, country, region, category, country-breakdown, landing-page, and sitemap totals from that synchronized set.

Production: https://terroir-trail.web.app/

---

## Product Principles

TerroirTrail is built around authenticity, safety, and rigorous verification rather than uncurated volume:

- **Discovery and Commercial Partnerships are Separate Layers:** A producer can be catalogued and discovered without being a commercial partner. Editorial discovery does not imply a paid relationship.
- **Public Visitability Does Not Equal Booking Permission:** Visiting information is researched from producer-controlled or verified public channels without implying a TerroirTrail booking relationship.
- **Unknown Stays Unknown:** The platform never fabricates ratings, review scores, visitor prices, amenities, road conditions, or hours to fill empty fields.
- **Location Confidence and Road-Access Confidence are Separate:** A verified geographic coordinate does not mean the access road is suitable for a standard low-clearance rental car.
- **Direct Producer Contact is Preferred:** Travelers are connected directly to official producer-controlled channels (official website, direct phone, email).
- **Rural Road Safety (Fail-Closed Navigation):** Turn-by-turn navigation is deliberately suppressed if coordinates, road access, or vehicle suitability are unverified or require 4x4 vehicles.

The canonical implementation state and milestone history are maintained in [`ROADMAP.md`](ROADMAP.md).

---

## Current Public Product

- **Interactive Terroir Map:** High-performance Leaflet map featuring administrative terroir region boundaries sourced from geoBoundaries and Eurostat / GISCO (CC BY 4.0) and custom tile providers.
- **Multi-Category Producer Directory:** Wineries, craft breweries, artisan cheese dairies, olive mills and olive-oil producers, apiaries, farms, cideries, confectioneries, herb farms, mushroom farms, oil mills, and distilleries across the currently published European catalogue.
- **Evidence-Backed Auditing:** Independent verification badges for location precision, visitability status, and road-access suitability.
- **Traveler Accounts & Passport:** Private accounts (Firebase Auth), visited-place passport stamps, and private tasting notes.
- **Favorites / Saved Places:** Account-partitioned saved producers in device local storage.
- **Travel Affiliate Links (Travelpayouts):** Curated, non-intrusive outbound affiliate links for car hire, transfers, experiences, and travel eSIMs. No personal profile data or tracking cookies are transmitted; active Explorer Pass holders enjoy an ad-free experience.
- **Fail-Closed Road Access Warnings:** Location confidence and road-access confidence are strictly separated; clear road-access warnings and rental-car advisories are provided per producer.
- **Resilient Fallback Data:** Offline/static catalogue fallback ensures full usability even if remote services are unavailable.

---

## Experiences, Bookings, and Commercial Features

TerroirTrail is currently **discovery-first**, not an online travel agency (OTA) or open booking marketplace.

- **Experiences:** All prototype commercial experiences in the database remain inactive (`is_active = FALSE`). Public experiences require explicit, negotiated agreements with individual hosts.
- **Dormant Commercial Infrastructure:** Payment workflows (Stripe checkout) and display advertising (Google AdSense) are architecturally integrated but **disabled/dormant (pilot safety active)** in this production release.
- **Affiliate Disclosure:** Outbound links to external travel providers (e.g. car rental, transfers, activities/experiences, or travel eSIMs) may earn TerroirTrail a referral commission at no additional cost to the user.

---

## Catalogue Statistics & Structure

- **Live Supabase catalogue:** authoritative published producer/project rows in `public.producers`.
- **Bundled deterministic SEO/AEO snapshot:** refreshed from the live catalogue before production deployment.
- **Canonical sitemap footprint:** generated from the synchronized producer set plus eligible country, destination, region, category, and index pages.
- **SEO/AEO deployment contract:** generation and verification require the live catalogue snapshot, canonical producer pages, landing-page entity graph, robots.txt, llms.txt, and sitemap to remain synchronized.
- **Current totals and geography/category breakdowns:** emitted by the live sync and SEO build logs instead of being hand-maintained in this README.

---

## Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons
- **Mapping & Geospatial:** Leaflet 1.9.x, sourced regional geometries, geoBoundaries, Eurostat/GISCO
- **Data & Backend:** Supabase (PostgreSQL / PostGIS) for producer catalogue, Firebase Authentication + Cloud Firestore for traveler accounts & private passport notes
- **Hosting & Infrastructure:** Firebase Hosting (production web), Google Cloud Platform
- **Mobile Packaging:** Capacitor (iOS & Android native wrappers)

---

## For Producers

### Are you a producer who belongs on TerroirTrail?

If you run an independent winery, brewery, cidery, distillery, olive or other oil producer, dairy/cheesemaker, apiary, farm, confectionery, herb farm, mushroom farm, or another place-based producer that fits the TerroirTrail catalogue, we would like to hear from you.

Contact **[terroirtrail@gmail.com](mailto:terroirtrail@gmail.com)** with your producer name, location, official website or public business page, and a short note about what you make.

TerroirTrail reviews producer identity, location, visitability and access independently. An enquiry does not automatically guarantee inclusion, verification, a commercial partnership, or a booking relationship.

## Development & Verification

### Install Dependencies

```bash
npm install
```

### Run Locally

```bash
npm run dev
```

### Full Quality & Verification Gate

```bash
npm run check
```

The check gate runs:
1. TypeScript compiler checks (`tsc --noEmit`)
2. ESLint code quality checks
3. Prettier format validation
4. Vitest frontend component & logic test suites
5. Node / Vitest server test suites
6. Firestore Security Rules unit tests (Firestore emulator)
7. Production Vite build & synchronized SEO/AEO generation and verification (producer-page and sitemap totals are derived from the synchronized catalogue)

### Additional Tests

```bash
# Python verification tools
npm run test:python

# Mobile preflight validation
npm run mobile:preflight -- all
```

---

## Important Project Files

- [`LICENSE.md`](LICENSE.md) — Proprietary software license, open-source acknowledgements, and geospatial attributions
- [`PRIVACY_POLICY.md`](PRIVACY_POLICY.md) — Comprehensive privacy policy and GDPR disclosure
- [`TERMS_OF_SERVICE.md`](TERMS_OF_SERVICE.md) — Terms of service and commercial disclosures
- [`ROADMAP.md`](ROADMAP.md) — Canonical product roadmap and feature statuses
- [`AGENTS.md`](AGENTS.md) — Repository-level operating rules, including the mandatory producer verification/import gate
- [`src/data/terroirRegions.ts`](src/data/terroirRegions.ts) — Sourced regional terroir polygon boundaries
- [`src/utils/producerAccess.ts`](src/utils/producerAccess.ts) — Fail-closed producer road-access warnings and rental-car advisories
- [`public/llms.txt`](public/llms.txt) — Authoritative machine-readable catalogue summary

---

## License & Attribution

TerroirTrail software, design assets, and proprietary database schemas are **Proprietary Works** owned exclusively by TerroirTrail. All rights reserved. See [`LICENSE.md`](LICENSE.md).

Third-party dependencies and open-source packages remain subject to their respective licenses. Regional boundary geometries are sourced from geoBoundaries (ADM2 for Crete, Tuscany, Agion Oros) and Eurostat / GISCO (LAU 2021 Thira, NUTS 2021 NUTS 3 for Peloponnese and Macedonia), licensed under CC BY 4.0. Map base tiles are provided by OpenStreetMap contributors (ODbL), CARTO, and Esri.
