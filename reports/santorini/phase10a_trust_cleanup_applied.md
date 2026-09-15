# Phase 10A — Santorini Trust Cleanup Applied

Date: 2026-09-15

Status: production Supabase cleanup applied and re-queried; frontend branch changes are committed but still require the local `npm run check` gate and browser smoke verification before merge/deploy.

## Production data changes applied

All 9 Santorini producer rows now use the manually audited Google Place IDs and Google business coordinates recorded in the Phase 10A location audit.

The legacy synthetic presentation/trust fields were neutralized across Santorini:

- uncredited stock `cover_image` removed;
- `gallery` emptied;
- synthetic ratings and review counts removed;
- synthetic price levels removed;
- synthetic food/hospitality booleans removed;
- legacy VIP perks removed;
- unverified tasting-highlight copy removed;
- legacy `road_access = paved` removed;
- road access remains `not_publicly_confirmed` unless future explicit evidence supports a classification.

Current visitor states are intentionally independent from location verification:

- Canava Santorini Distillery — `not_publicly_confirmed` pending a sufficiently current producer-controlled visitor source;
- Domaine Sigalas — `appointment_only`;
- Estate Argyros — `public_visits`, with advance reservation recommended;
- GAIA Wines Santorini — `seasonal_public`;
- Gavalas Winery Santorini — `seasonal_public`;
- Santo Wines Cooperative — `public_visits`;
- Santorini Brewing Company — `public_visits`, with group-booking constraints retained in notes;
- Vassaltis Vineyards — `public_visits`, without promising unrestricted walk-ins;
- Venetsanos Winery — `public_visits`, with reservations recommended.

The 18 legacy Santorini Experience rows remain present but inactive. No Experience was activated.

## Frontend / fallback changes committed

- Added `src/data/santoriniProducers.ts` as the audited Santorini offline/fallback catalogue.
- Updated `producerService` so fallback mode contains audited Crete + Santorini while successful Supabase responses remain authoritative.
- Expanded the Google Places imagery allowlist to manually audited Crete + Santorini producers only.
- Added Santorini fallback integrity tests covering Place IDs, fail-closed road access, visitability separation, and removal of synthetic fields.
- Updated existing producer-service fallback tests for the expanded audited catalogue.

## Media behavior

Santorini records intentionally have no uncredited local cover/gallery images. Existing media resolution therefore remains:

1. approved producer/host media;
2. explicitly credited listing media;
3. live Google Places imagery for audited Place IDs, with Google attribution;
4. neutral category fallback.

Google Places photo URLs are not stored, downloaded, proxied, cached or rehosted.

## Verification already performed

Production Supabase was queried after the cleanup and confirmed:

- 9 Santorini producer rows retain manually verified Place IDs;
- all 9 retain `verified_location`;
- all 9 have `road_access = NULL` and `road_access_status = not_publicly_confirmed`;
- legacy synthetic rating/price/hospitality fields are NULL;
- stock cover imagery is NULL and galleries are empty;
- 18 Santorini Experience rows exist and 0 are active.

## Still required before this slice is merged

1. Pull `phase10a-santorini-audit` locally.
2. Run `npm run check` and fix any gate failure before merge.
3. Run the local browser and verify Santorini list/map/detail/deep-link behavior plus live Google imagery/attribution.
4. Continue road/access research independently; do not infer road safety from Google location data.
5. Build Santorini Discovery Guides only from verified stops and keep multi-stop driving fail-closed without sufficient road evidence.
