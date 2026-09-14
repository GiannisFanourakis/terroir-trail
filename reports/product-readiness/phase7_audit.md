# Phase 7 — Product Readiness Audit

**Status:** In progress  
**Started:** 2026-09-13  
**Scope:** Public launch readiness, user-facing feature exposure, account authority, discovery flows, prototype/commercial surfaces, error/loading/offline/mobile/accessibility/legal consistency.

## Classification

Each feature is classified as one of:

- **Launch-ready** — appropriate to expose publicly after verification.
- **Launch-ready candidate** — implementation is now aligned with launch scope and automated checks are green, but final manual/production verification remains.
- **Needs work** — useful/current, but has concrete gaps before launch-quality.
- **Hide for now** — code may remain, but the public product must not present it as currently available.
- **Future feature** — intentionally outside the current discovery-first launch scope.

## Current readiness matrix

| Surface | Current classification | Evidence / reason | Action |
| --- | --- | --- | --- |
| Traveler authentication (Google, Apple, email/password, reset) | Needs work | Real Firebase authentication exists, cloud profiles are loaded after sign-in, password reset is wired, and producer authority is not derived from self-editable traveler profile fields. Full production E2E QA, account deletion/privacy handling and account-management UX still need explicit verification. | Keep public; test signup, login, reset, logout, session recovery and account lifecycle on production configuration. |
| Traveler account state | Launch-ready candidate | Passport stamps and personal notes are account-backed. Favorites are intentionally browser-local, now scoped per guest/account identity instead of one shared browser key, and public auth copy no longer claims cross-device favorite sync. | Keep public; perform final multi-account/device QA and retain the local-only favorites wording. |
| Producer/Host authority | Needs work | Host privileges are derived from trusted producer ownership rather than client-editable profile fields. Phase 7 removed instant-verification wording and synthetic claim defaults, and ownership approval no longer implies VAT verification. The wider admin/claim lifecycle remains incomplete. | Keep trusted-host portal gated; retain manual/operator approval until the complete admin workflow exists. |
| Admin workflow | Needs work | Sensitive producer ownership assignment is operator/server trusted rather than a normal self-assignable frontend role, but the canonical roadmap still lists the full TerroirTrail Admin product/capabilities as incomplete. | Do not treat producer onboarding as a finished self-service operational workflow. |
| Map + producer discovery | Launch-ready candidate | Phase 4–6 data integrity and route safety are preserved. Phase 7 now exposes real catalogue loading/fallback state, avoids unsupported rating/review ranking, blocks map fly-to for unresolved locations, hides unverified road classifications, and adds accessibility labels to core map controls. | Final visual/mobile/keyboard/slow-network QA, then production verification. |
| Producer detail drawer | Launch-ready candidate | Visit/access wording remains fail-closed. Phase 7 removed synthetic VIP defaults and over-specific generic category claims, added dialog semantics, neutralized unsupported media-rights wording, and special-cases Peskesi as a farm rather than a distillery. | Final mobile/focus/direct-contact QA. |
| Favorites / Saved | Launch-ready candidate | Favorites remain device-local by design, but authenticated storage is now account-scoped and guest storage stays separate. The owner-switch guard prevents one account's favorites from being written into another account key during identity changes. | Keep local-only wording; manually test guest → account A → account B transitions. |
| Passport / visited stamps | Launch-ready candidate | Passport now derives its list from the stable cached catalogue rather than the current filtered discovery view, counts only known producer IDs, and guards zero-total progress. | Final manual QA with active discovery filters and empty/partial catalogue states. |
| Tasting notes / journal | Launch-ready candidate | Personal notes persist to the account profile, and the cloud `personalNotes` map is authoritative when present, so note deletion propagates instead of being merged back from stale local keys. | Final two-device deletion/update QA. |
| Curated routes/day trips | Hide for now | Legacy route definitions remain quarantined and are not verified for publication. Phase 6 intentionally blocks normal turn-by-turn routing. | Public UI may show an under-verification state only; no wording should promise turn-by-turn routes. |
| Experiences + tasting booking | Hide for now | No public TerroirTrail Experience is allowed without explicit producer agreement; live database Experiences are inactive. Public booking entry points are removed from current launch navigation while dormant infrastructure remains. | Keep dormant until producer-approved Experiences exist. |
| Explorer Pass | Future feature | Roadmap places Explorer Pass validation in Phase 13. Public upgrade/pricing entry points are removed from current launch navigation. | Keep non-public until its roadmap phase. |
| Host Pro | Future feature | Roadmap places Host Pro validation in Phase 13. Public upgrade/pricing claims and launch Host Portal navigation to Pro features are quarantined. | Keep dormant until commercial validation. |
| Chauffeur booking | Future feature | Roadmap places chauffeur partnerships in Phase 13. Public entry points are quarantined; prototype code may remain. | Keep non-public until a real provider/terms workflow exists. |
| Affiliate/sponsor fallback banners | Hide for now | Unverified fallback sponsor/`Official Partner` claims were removed from current public fallback behavior. | Only restore sponsor inventory when partner status, disclosure and claims are source-backed. |
| Google AdSense slot | Needs work | The current map surface still includes an ad slot, while the Explorer Pass fallback upsell was removed. Consent/privacy wording and final ad-layout behavior still need audit. | Audit consent, privacy policy consistency and mobile layout before launch sign-off. |

## Producer trust audit closeout

The Phase 7 producer trust batch was verified by the full local `npm run check` and pushed as commit `b119f4b`.

- Frontend identity signals, Google sign-in and VAT-format checks are evidence inputs only; none grants host authority.
- New producer claims remain `pending_verification` until trusted approval.
- The claim flow no longer manufactures legal entity, address, winery category, logistics, parcel-capacity, banking or terms-acceptance defaults.
- Host ownership approval and VAT verification are separate states.
- Launch Host Portal navigation exposes the reviewed visitor-notice workflow while Reservations, Tasting Flights, Analytics, Host Pro and Dispatch remain quarantined.
- Permanent Phase 7 regression tests protect the main trust-boundary claims.

## Traveler state audit closeout

The traveler-state corrective batch was pushed as commit `ba7677c` and subsequently verified against current source.

1. **Favorites are browser-local but isolated.** Guest favorites use the base local key, authenticated favorites use an account-scoped key, and the identity-switch guard prevents cross-account writes during transition renders.
2. **Passport uses a stable catalogue.** The Passport reads the cached catalogue, filters visited IDs against known producers, and fails safely when the catalogue is empty.
3. **Personal-note deletion now propagates.** The Firestore profile's `personalNotes` map is treated as authoritative when present instead of being merged over stale local keys.
4. **Persistence wording is accurate.** Sign-in copy describes stamps/notes as synced while favorites are described as device-local.
5. **Public commercial traveler navigation remains quarantined.** Dormant pass/booking infrastructure is not treated as part of the current launch product.

## Discovery readiness closeout

The main discovery-readiness implementation was pushed as commit `89615ca`; temporary patch scripts were removed in `ad9e7ef`.

- Catalogue loading, fallback provenance and lazy-modal loading are visible instead of failing silently.
- Unsupported `Top Rated` / `Most Reviewed` ordering was removed from the audited catalogue view.
- Producer cards expose road-access labels only when the classification itself is verified.
- Unresolved producer locations no longer trigger map fly-to, and non-finite coordinates are rejected.
- Core map controls and the producer drawer received additional accessible labels/semantics.
- Synthetic VIP defaults and generic unsupported producer-category superlatives were removed from the public drawer.
- Peskesi is presented as `Organic Farm` with farm-specific visit/contact wording while the database still carries the legacy `kazani` category.
- Until Phase 8 introduces first-class farm taxonomy, category filtering must keep Peskesi out of the public Rakokazano filter while retaining it in the unfiltered catalogue.

## Next launch-readiness blockers

1. Complete production-config traveler auth/account-lifecycle QA: signup, provider login, reset, logout, session recovery, account deletion/privacy reality and error handling.
2. Finish manual mobile/keyboard/focus QA for map, drawer, Passport and primary modals, including slow-network/loading states.
3. Audit route/day-trip deep links and any dormant direct-entry paths so quarantined route/booking/pass/chauffeur features cannot be exposed accidentally.
4. Reconcile remaining Privacy Policy / Terms / AdSense consent wording with the discovery-first product and actual persistence behavior.
5. Inventory launch-visible React hook warnings separately from fully dormant commercial/prototype components; fix launch-visible violations first.
6. Complete unsupported-marketing/dead-prototype review, then run the full check, deploy manually to Firebase Hosting and verify production before crossing Phase 7 checklist items.

## Notes

This audit does not delete future code simply because it is not launch-ready. The preferred pattern is to keep tested dormant infrastructure behind non-public entry points until the corresponding roadmap phase is active.
