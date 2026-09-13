# Phase 7 — Product Readiness Audit

**Status:** In progress  
**Started:** 2026-09-13  
**Scope:** Public launch readiness, user-facing feature exposure, account authority, discovery flows, prototype/commercial surfaces, error/loading/offline/mobile/accessibility/legal consistency.

## Classification

Each feature is classified as one of:

- **Launch-ready** — appropriate to expose publicly after verification.
- **Needs work** — useful/current, but has concrete gaps before launch-quality.
- **Hide for now** — code may remain, but the public product must not present it as currently available.
- **Future feature** — intentionally outside the current discovery-first launch scope.

## Current readiness matrix

| Surface | Current classification | Evidence / reason | Action |
| --- | --- | --- | --- |
| Traveler authentication (Google, Apple, email/password, reset) | Needs work | Real Firebase authentication exists, cloud profiles are loaded after sign-in, password reset is wired, and producer authority is not derived from self-editable traveler profile fields. Full production E2E QA, account deletion/privacy handling and account-management UX still need explicit verification. | Keep public; test signup, login, reset, logout, session recovery and account lifecycle on production configuration. |
| Traveler account state | Needs work | Passport stamps and personal notes are stored locally and in the authenticated Firestore profile. Cross-device subscription exists. Favorites are separate browser-local state and are not part of the account profile. | Keep account core public, but fix favorites isolation/copy and note-sync deletion behavior before launch-ready classification. |
| Producer/Host authority | Needs work | Host privileges are derived from trusted producer ownership rather than client-editable `isProducer`/`claimedProducerId`. The Phase 7 producer trust hardening removed instant-verification wording and synthetic claim defaults, and ownership approval no longer implies VAT verification. The wider admin/claim lifecycle in Phase 2 is still incomplete. | Keep trusted-host portal gated; retain manual/operator approval until the complete admin workflow exists. |
| Admin workflow | Needs work | Sensitive producer ownership assignment is operator/server trusted rather than a normal self-assignable frontend role, but the canonical roadmap still lists the full TerroirTrail Admin product/capabilities as incomplete. | Do not treat producer onboarding as a finished self-service operational workflow. |
| Map + producer discovery | Launch-ready candidate | Current core product is discovery-first; Phase 4–6 completed data integrity, fallback synchronization, location confidence and route safety. | Perform visual/mobile/loading/error/accessibility QA before final launch-ready classification. |
| Producer detail drawer | Launch-ready candidate | Source-backed visit/access wording and fail-closed navigation were completed in Phase 6. | Audit empty states, hierarchy, direct-contact actions and mobile behavior. |
| Favorites / Saved | Needs work | `useFavorites` currently persists to one browser-local `terroir_trail_favorites` key. It is not scoped per authenticated account and is not cloud-synced, so different users on the same browser can inherit the same saved list. Current sign-in copy also incorrectly implies favorites sync across devices. | Scope local favorites by account/guest identity or add explicit cloud favorites support; remove cross-device wording until it is true. |
| Passport / visited stamps | Needs work | Visited producer IDs persist to the user profile and are sent to Firestore, so the core stamp state has real account persistence. However `PassportModal` receives the current discovery `producers` result, which is already filtered by destination/category/search, while `visitedCount` counts the whole user stamp list. Passport totals/progress can therefore be inconsistent when discovery filters are active. | Give Passport an unfiltered catalogue source or compute explicitly against a defined catalogue; guard empty totals. |
| Tasting notes / journal | Needs work | Personal notes persist locally and are written to the user Firestore profile. The live subscription merges cloud notes into the previous local map, which means deleting a note on one device may not remove an already-cached copy on another device. | Treat the cloud note map as authoritative when present, or implement explicit per-note deletion/tombstones. |
| Curated routes/day trips | Hide for now | Legacy route definitions are quarantined and not verified for publication. Phase 6 intentionally blocks normal turn-by-turn routing. | Public UI may show an under-verification state only; no wording should promise turn-by-turn routes. |
| Experiences + tasting booking | Hide for now | No public TerroirTrail Experience is allowed without explicit producer agreement; live database Experiences are inactive. Public booking entry points were removed from current launch navigation while dormant infrastructure remains. | Keep dormant until producer-approved Experiences exist. |
| Explorer Pass | Future feature | Roadmap places Explorer Pass validation in Phase 13. Public upgrade/pricing entry points have been removed from the current launch navigation. Private-pilot verification infrastructure remains dormant. | Keep non-public until its roadmap phase. |
| Host Pro | Future feature | Roadmap places Host Pro validation in Phase 13. Public upgrade/pricing claims and launch Host Portal navigation to Pro features are quarantined. | Keep dormant until commercial validation. |
| Chauffeur booking | Future feature | Roadmap places chauffeur partnerships in Phase 13. Public entry points are quarantined; prototype code may remain. | Keep non-public until a real provider/terms workflow exists. |
| Affiliate/sponsor fallback banners | Hide for now | Unverified fallback sponsor/`Official Partner` claims were removed from the current public fallback behavior. | Only restore sponsor inventory when partner status, disclosure and claims are source-backed. |
| Google AdSense slot | Needs work | The current map surface still includes an ad slot, while the Explorer Pass fallback upsell was removed. Consent/privacy wording and final ad-layout behavior still need audit. | Audit consent, privacy policy consistency and mobile layout before launch sign-off. |

## Producer trust audit closeout

The Phase 7 producer trust batch is verified by the full local `npm run check` and pushed as commit `b119f4b`.

- Frontend identity signals, Google sign-in and VAT-format checks are evidence inputs only; none grants host authority.
- New producer claims remain `pending_verification` until trusted approval.
- The claim flow no longer manufactures legal entity, address, winery category, logistics, parcel-capacity, banking or terms-acceptance defaults.
- Host ownership approval and VAT verification are separate states.
- Launch Host Portal navigation exposes the reviewed visitor-notice workflow while Reservations, Tasting Flights, Analytics, Host Pro and Dispatch remain quarantined.
- Permanent Phase 7 regression tests protect the main trust-boundary claims.

## Traveler account audit findings

1. **Authentication foundation is real, but not fully launch-audited.** Google, Apple and email/password paths use Firebase when configured, cloud user profiles are fetched on sign-in, and password reset is wired. Production-provider configuration, session recovery on target devices, account deletion and privacy lifecycle still need explicit QA.
2. **Favorites are not account data today.** They are stored under one browser-local key and survive independently of login/logout. This is useful for guest discovery but must not be described as cross-device account persistence, and it should not leak between different signed-in users on the same browser.
3. **Passport stamps are account-backed.** `visitedProducers` is saved to the local user cache and Firestore profile and consumed by the Passport UI. The current Passport catalogue input is filter-dependent, so progress math and remaining counts can be inconsistent with the user's full stamp collection.
4. **Personal notes are account-backed but deletion sync is flawed.** The Firestore listener merges remote note keys into existing local keys, so a remote deletion is not necessarily reflected on another already-running client.
5. **Public commercial traveler navigation remains quarantined.** Current `App` no longer supplies Explorer Pass or tasting-booking callbacks into the normal Header/Profile menu, even though dormant component code remains for later phases.

## Next launch-readiness blockers

1. Scope favorites by account/guest identity and correct the public persistence wording; decide separately whether favorites need cloud sync for launch.
2. Make Passport operate on a stable unfiltered catalogue and make its progress calculation fail-safe.
3. Fix personal-note deletion propagation in real-time cloud sync.
4. Audit React Rules-of-Hooks warnings on launch-visible components first; classify warnings in fully dormant commercial components separately instead of treating all warnings as equal launch risk.
5. Continue map/detail/mobile/loading/error/accessibility QA.
6. Reconcile Privacy Policy / Terms wording with the discovery-first current product and actual local/cloud persistence behavior.

## Notes

This audit does not delete future code simply because it is not launch-ready. The preferred pattern is to keep tested dormant infrastructure behind non-public entry points until the corresponding roadmap phase is active.
