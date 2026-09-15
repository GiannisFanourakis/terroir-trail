# Phase 10A — Santorini Closeout Readiness

Date: 2026-09-15

Status: implementation complete enough for the final local quality gate and production smoke pass; not yet marked region-complete.

## Completed in this branch

- Audited the 9 live Santorini producer records.
- Persisted manually verified Google Place IDs and corrected Google business coordinates.
- Removed unverified legacy `paved` road classifications; all Santorini road access remains explicitly unconfirmed.
- Removed synthetic ratings, review counts, price levels, hospitality booleans, VIP perks, unverified tasting copy, and uncredited stock imagery.
- Updated current producer websites, phones, visitor statuses, visitor sources, and opening guidance where first-party evidence was available.
- Kept Canava Santorini Distillery at `not_publicly_confirmed` for visitor access and excluded it from published Discovery Guides.
- Added the audited Santorini fallback catalogue and integrated it with the offline producer service.
- Enabled live Google Places imagery only through the audited Place-ID/location allowlist, preserving attribution and no-rehosting rules.
- Added three Santorini Discovery Guides using only verified locations and reviewed publishable visitor states.
- Kept every Santorini Discovery Guide fail-closed for multi-stop driving because road-access classifications are not independently verified.
- Removed the legacy pre-audit Santorini marketing route so its unsupported timing, tasting, and road claims cannot resurface.
- Renamed public route entry points to `Discovery Guides` for terminology consistency.
- Confirmed Santorini is not represented as a UNESCO Global Geopark; geological/volcanic significance must remain separate from UNESCO designation.

## Still required before Phase 10A can be closed

1. Pull the latest `phase10a-santorini-audit` branch.
2. Run `npm run check` and resolve any failure.
3. Launch the browser and verify Santorini map/list/detail/deep-link behavior, Google imagery and attribution, and the three Discovery Guides.
4. Verify the orange `Multi-stop driving navigation withheld` state remains visible for all Santorini guides.
5. Merge to `main` only after the full gate is green.
6. Deploy Firebase Hosting and complete a short production smoke pass.
7. Update `ROADMAP.md` to mark Santorini complete only after those verification steps.

## Trust invariants retained

- A verified Google pin does not prove road safety.
- Unknown road conditions remain unknown.
- Public visitor access does not imply a TerroirTrail partnership.
- No Santorini Experience is activated.
- Google imagery is supplementary discovery media, not visitability or access evidence.
