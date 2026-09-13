# TerroirTrail

TerroirTrail is an open-source, discovery-first agritourism and local-producer guide for independent culinary travelers, road-trippers and slow travelers.

**Crete is the current reference-quality region.** The live Crete catalogue contains 27 audited producer/project records across Chania, Heraklion, Rethymno and Lasithi. Future geographic expansion may include Santorini, the Peloponnese, Northern Greece, Italy/wider Mediterranean regions and Northern Europe, but those regions are not represented as equally complete until their catalogue and verification work is finished.

Production: https://terroir-trail.web.app/

## Product principles

TerroirTrail is built around trust rather than catalogue volume.

- **Discovery and Experiences are separate product layers.** A producer can be listed without being a TerroirTrail commercial partner.
- **Public visitability does not equal booking permission.** Visiting information can be researched from public producer-controlled sources without implying a TerroirTrail reservation relationship.
- **Unknown stays unknown.** The app does not invent ratings, prices, hospitality amenities, road conditions, tasting packages or other facts to fill empty UI fields.
- **Location confidence and road-access confidence are separate.** A verified map point does not automatically mean the approach road is suitable for a standard rental car.
- **Direct producer contact is preferred.** Where available, travelers are sent to producer-controlled public channels such as the official website or public phone number.
- **Crete is the reference-quality region before broad expansion.**

The canonical implementation plan and completion state are maintained in [`ROADMAP.md`](ROADMAP.md).

## Current public product

The current launch-oriented product centers on:

- interactive Leaflet map and producer/project directory;
- category, region, search and evidence-aware filtering;
- audited producer stories and contact details;
- researched visitability status;
- source-backed location and road-access confidence;
- favorites / saved places;
- traveler accounts;
- Terroir Passport visited-place stamps and private notes;
- direct producer-controlled contact links;
- resilient bundled Crete fallback data when Supabase is unavailable.

Curated driving routes are currently **under verification**. Legacy draft route definitions are quarantined and are not published as normal turn-by-turn itineraries.

## Experiences, bookings and commercial features

TerroirTrail is currently discovery-first, not a public booking marketplace.

No public TerroirTrail Experience should be created or published without explicit producer agreement. Prototype booking/Experience infrastructure may remain in the repository for future development, but it must not be interpreted as a current public offer.

Explorer Pass, Host Pro, chauffeur workflows and other monetisation concepts are future/pilot functionality unless explicitly enabled and described as such by the current product roadmap. Commercial functionality must not weaken producer verification or create unsupported partnership claims.

## Crete data integrity

The authoritative Crete catalogue currently contains **27 audited records**.

Producer/project records can carry independent confidence metadata for:

- location status and source;
- visitability status and source;
- road-access status, classification, source and notes.

Road-access classifications are exposed only when verified. Reviewed records without adequate public road evidence remain unclassified rather than being guessed.

The bundled fallback catalogue in `src/data/producers.ts` is synchronized from the audited Crete state and is tested separately from live Supabase behavior.

## Rural navigation safety

Curated multi-stop navigation is deliberately fail-closed. A route is not generated as normal turn-by-turn driving navigation when the route or any stop lacks the required verification, including cases such as:

- draft/unverified route;
- missing producer;
- unresolved or unverified navigation point;
- invalid coordinates;
- unreviewed, unconfirmed or currently uncertain road access;
- passable unpaved access without separate ordinary-vehicle suitability evidence;
- access requiring/recommending a high-clearance or 4x4 vehicle.

Individual map links identify locations; they are not presented as road-safety guarantees.

## Technology

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- Leaflet
- Supabase PostgreSQL / PostGIS for producer data
- Firebase Authentication + Firestore for account-related functionality
- Firebase Hosting
- Capacitor for mobile packaging work

## Development

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Run the full project gate:

```bash
npm run check
```

The check currently covers TypeScript, ESLint, formatting checks, frontend tests, server tests, Firestore rules tests, production build and SEO asset verification.

Synchronize the authoritative Crete fallback catalogue from Supabase:

```bash
npm run sync:fallback
```

Build:

```bash
npm run build
```

Deploy Firebase Hosting:

```bash
npm run deploy
```

## Important project files

- `ROADMAP.md` — canonical product roadmap and completion state
- `src/data/producers.ts` — audited bundled Crete fallback catalogue
- `src/services/producerService.ts` — live/fallback producer mapping and authority rules
- `src/utils/routeSafety.ts` — fail-closed route-navigation rules
- `src/components/Drawer/ProducerDetailDrawer.tsx` — producer detail, visit and access UI
- `src/components/Loops/DayTripModal.tsx` — curated-route verification UI
- `scripts/sync_fallback_producers.ts` — regenerates the Crete fallback catalogue
- `scripts/verify_seo_assets.ts` — validates canonical/SEO assets and quarantined route claims
- `reports/product-readiness/phase7_audit.md` — current launch-readiness audit

## Data and contribution rule

Do not add or “complete” producer facts by inference. For factual producer, visitability, location or road-access changes, use a reliable source and preserve uncertainty when evidence is insufficient.

Do not reactivate dormant Experiences, route claims or commercial functionality simply because supporting code exists. Match public behavior to the canonical roadmap.

## License

MIT. See [`LICENSE`](LICENSE).
