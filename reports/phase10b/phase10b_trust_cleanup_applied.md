# Phase 10B — Trust Cleanup Applied

Date: 2026-09-15

Migration: `20260915100849_phase10b_quarantine_legacy_defaults_and_first_visit_audit`

Status: **Applied to production Supabase and verified.**

Scope: Peloponnese + Northern Greece + Tuscany / Italy.

## What changed

### Synthetic schema defaults removed

The producer schema no longer manufactures the following facts when a value is omitted:

- `food_option`
- `dog_friendly`
- `kid_friendly`
- `walk_in_friendly`
- `campervan_friendly`
- `price_level`
- `rating`
- `review_count`

These columns now default to `NULL`, preserving unknown as unknown for future producer inserts.

### All 19 Phase 10B records quarantined before re-review

For the 9 Peloponnese, 9 Northern Greece and 1 Tuscany records:

- legacy Unsplash `cover_image` values were cleared;
- legacy gallery images were cleared;
- legacy tasting highlights were cleared;
- unsupported best-season and opening-hour values were cleared before reviewed exceptions were applied;
- food/hospitality booleans were cleared;
- legacy price/rating/review/VIP metadata was cleared;
- legacy `road_access = paved` was removed;
- road status remains `unreviewed` with no road classification;
- Google Place IDs remain null;
- Google Maps URLs were cleared;
- location status was changed from `unreviewed` to `unresolved` so exact navigation fails closed until the manual location audit;
- legacy coordinates remain in the database only as audit references and are not treated as verified navigation points.

### First-pass visitability applied from current evidence

Verified distribution after the migration:

- `appointment_only`: **8**
- `public_visits`: **2**
- `not_publicly_confirmed`: **8**
- `current_access_uncertain`: **1**

Strong current first-party visitor evidence was applied to:

- Ktima Pavlidis
- Alpha Estate
- Domaine Biblia Chora
- Ktima Kir-Yianni Naoussa
- Ktima Gerovassiliou
- Ktima Tselepos
- Monemvasia Winery / Tsimbidi
- GAIA Wines Nemea
- Semeli Estate Nemea
- Azienda Agricola Monteraponi

Conservative states were retained for producers where ordinary current visitor terms are incomplete, stale or not sufficiently first-party verified.

### Contact corrections applied

Current source-backed contact corrections include:

- Thymiopoulos Vineyards phone
- Siris Craft Brewery current website and phone
- Ktima Gerovassiliou current phone
- Sknipa / Standard Microbrewery of Thessaloniki current website and phone
- KYKAO current phone
- Monemvasia Winery current phone
- Liokareas unsupported legacy Greek phone removed pending entity/location review

## Verification results

Post-migration production queries confirmed:

| Region | Records | Unresolved locations | Road fail-closed | No Place ID | Neutral media | Synthetic fields cleared |
|---|---:|---:|---:|---:|---:|---:|
| Northern Greece | 9 | 9 | 9 | 9 | 9 | 9 |
| Peloponnese | 9 | 9 | 9 | 9 | 9 | 9 |
| Tuscany | 1 | 1 | 1 | 1 | 1 | 1 |

The eight previously synthetic schema defaults were separately verified as `NULL` defaults after migration.

## Experience quarantine

Before the migration, the live database contained:

- Northern Greece: 18 Experience rows, **0 active**
- Peloponnese: 18 Experience rows, **0 active**
- Tuscany: 0 Experience rows, **0 active**

No Experience was activated or changed as part of Phase 10B.

## Route quarantine

The old pre-audit Peloponnese, Northern Greece and Tuscany route objects remain non-public because they do not carry `verificationStatus = verified_stops` or `verified`; `DayTripModal` publishes only those two reviewed states.

Those old route objects still contain legacy marketing copy and must be removed/rebuilt rather than promoted in place. No Phase 10B Discovery Guide should be published until its stops have passed the separate identity, location and visitability gates. Multi-stop navigation remains independently fail-closed on road evidence.

## What this milestone does not prove

This cleanup does **not** mean the three Phase 10B regions are complete. It does not establish:

- verified Google Place IDs;
- verified exact locations or entrances;
- verified road surfaces or vehicle suitability;
- Google imagery eligibility;
- complete source-backed producer stories/products;
- final entity/category classification for Liokareas;
- audited offline/fallback parity;
- published Discovery Guides;
- regional production smoke verification.

## Next milestone

**Phase 10B location + Google Place ID audit.**

Each of the 19 records must be manually matched to the correct current business/place identity. Only then may `location_status`, coordinates, `google_maps_url`, and `google_place_id` be restored. Location evidence remains independent from road evidence.
