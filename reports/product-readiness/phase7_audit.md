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

## Initial high-risk surface audit

| Surface | Current classification | Evidence / reason | Action |
| --- | --- | --- | --- |
| Traveler authentication (Google, Apple, email/password, reset) | Needs work | Real Firebase auth exists and producer privileges are not derived from self-editable profile fields. End-to-end production account QA, account-management UX, and deletion/privacy flows still need explicit audit. | Keep public; test all login/signup/reset/logout/session-recovery paths. |
| Producer/Host authority | Needs work | Host privileges are derived from trusted producer ownership rather than client-editable `isProducer`/`claimedProducerId`. However the wider admin/claim lifecycle in Phase 2 is not complete. | Keep trusted-host portal gated; audit registration/claim/admin handoff before calling launch-ready. |
| Admin workflow | Needs work | Canonical roadmap still lists admin role/capabilities as incomplete. | Do not treat producer onboarding as a finished operational workflow. |
| Map + producer discovery | Launch-ready candidate | Current core product is discovery-first; Phase 4–6 completed data integrity, fallback synchronization, location confidence and route safety. | Perform visual/mobile/loading/error/accessibility QA before final launch-ready classification. |
| Producer detail drawer | Launch-ready candidate | Source-backed visit/access wording and fail-closed navigation were completed in Phase 6. | Audit empty states, hierarchy, direct-contact actions and mobile behavior. |
| Favorites / Saved | Launch-ready candidate | Public UI exposes saved producers without creating commercial claims. | Verify persistence, signed-in/signed-out behavior and empty state. |
| Passport / visited stamps / tasting notes | Needs work | Functional account features exist, but product-readiness, cross-device behavior and privacy expectations still require QA. | Keep public only if end-to-end tests confirm predictable persistence and recovery. |
| Curated routes/day trips | Hide for now | Legacy route definitions are quarantined and not verified for publication. Phase 6 intentionally blocks normal turn-by-turn routing. | Public UI may show an under-verification state only; no wording should promise turn-by-turn routes. |
| Experiences + tasting booking | Hide for now | No public TerroirTrail Experience is allowed without explicit producer agreement; live database Experiences are inactive. | Remove public booking entry points while keeping dormant infrastructure. |
| Explorer Pass | Future feature | Roadmap places Explorer Pass validation in Phase 13. Purchase service itself says public purchases are private-pilot/closed. | Remove public upgrade/pricing prompts. Existing private-pilot verification infrastructure may remain dormant. |
| Host Pro | Future feature | Roadmap places Host Pro validation in Phase 13, but profile UI currently advertises `€199/yr`, badges, bottle-shop links and 0% booking commission. | Remove public pricing/upgrade claims; keep trusted host dashboard separate from a paid plan. |
| Chauffeur booking | Future feature | Roadmap places chauffeur partnerships in Phase 13 and current implementation stores a local booking-like object. | Remove/hide public booking entry points until a real provider/terms workflow exists. |
| Affiliate/sponsor fallback banners | Needs work | UI labels several third-party links as `Official Partner` and makes product/service claims that are not independently established by the app. | Do not show fallback partner cards until claims, disclosure, partner status and destination terms are verified. Prefer no fallback over unsupported claims. |
| Google AdSense slot | Needs work | Advertisement labeling exists, but current ad component also promotes the future Explorer Pass. | Remove Explorer Pass upsell; later audit consent/privacy/ads policy and layout. |

## First launch-readiness blockers

1. Remove public Explorer Pass and Host Pro pricing/upgrade surfaces while their underlying infrastructure remains dormant.
2. Remove public tasting-booking entry points until approved Experiences exist.
3. Ensure route buttons/tooltips say routes are under verification rather than promising turn-by-turn navigation.
4. Stop rendering affiliate fallback cards with `Official Partner` or unverified service guarantees; fail closed to no fallback card.
5. Keep producer portal access tied only to trusted ownership and audit the registration → review → ownership workflow separately.
6. Reconcile Privacy Policy / Terms wording with the discovery-first current product after public feature exposure is cleaned up.

## Notes

This audit does not delete future code simply because it is not launch-ready. The preferred pattern is to keep tested dormant infrastructure behind non-public entry points until the corresponding roadmap phase is active.
