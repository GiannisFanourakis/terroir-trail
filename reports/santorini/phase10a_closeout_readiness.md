# Phase 10A — Santorini Closeout

Date: 2026-09-15

Status: **Completed and production-verified.** Santorini now meets the TerroirTrail reference-region quality bar and Phase 10A is closed.

## Completed scope

- Audited the 9 live Santorini producer records.
- Persisted manually verified Google Place IDs and corrected Google business coordinates.
- Removed unverified legacy `paved` road classifications; all Santorini road access remains explicitly unconfirmed unless supported by independent evidence.
- Removed synthetic ratings, review counts, price levels, hospitality booleans, VIP perks, unverified tasting copy, and uncredited stock imagery.
- Updated current producer websites, phones, visitor statuses, visitor sources, and opening guidance where first-party evidence was available.
- Kept Canava Santorini Distillery at `not_publicly_confirmed` for visitor access and excluded it from published Discovery Guides.
- Added the audited Santorini fallback catalogue and integrated it with the offline producer service.
- Enabled live Google Places imagery only through the audited Place-ID/location allowlist, preserving attribution and no-rehosting rules.
- Added three Santorini Discovery Guides using only verified locations and reviewed publishable visitor states.
- Kept every Santorini Discovery Guide fail-closed for multi-stop driving because road-access classifications are not independently verified.
- Removed the legacy pre-audit Santorini marketing route so its unsupported timing, tasting, and road claims cannot resurface.
- Renamed public route entry points to `Discovery Guides` for terminology consistency.
- Confirmed Santorini is not represented as a UNESCO Global Geopark; geological/volcanic significance remains separate from UNESCO designation.
- Updated public metadata and SEO verification to reflect Crete + Santorini as the current reference-quality regions.
- Updated the About/FAQ surface and regression tests to the current Discovery Guide terminology and regional state.

## Final verification

- Phase 10A was merged into `main`.
- The full project quality gate was run after the final metadata/test reconciliation and completed successfully before deployment.
- Firebase Hosting was deployed from the reconciled `main` state.
- Production smoke verification was completed by the project owner after deployment.
- Santorini producers and live producer imagery loaded correctly in production.
- All three Santorini Discovery Guides were present.
- Canava Santorini Distillery was not included in the published Santorini guides.
- Multi-stop driving navigation remained withheld for the Santorini guides because independent road-access evidence is incomplete.

## Trust invariants retained

- A verified Google pin does not prove road safety.
- Unknown road conditions remain unknown.
- Public visitor access does not imply a TerroirTrail partnership.
- No Santorini Experience is activated.
- Google imagery is supplementary discovery media, not visitability or access evidence.
- Discovery Guides are verified stop collections, not road-safety guarantees.

## Next phase

Proceed to **Phase 10B — Peloponnese + Northern Greece + Tuscany / Italy regional batch**.

These three regions are now grouped into one regional workstream so common auditing, trust cleanup, imagery, fallback-data, guide, and QA work can be handled consistently and efficiently. Each region still requires its own source evidence and production verification before it can be marked reference-quality.
