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
| Traveler authentication (Email/password, Google; dormant Apple infrastructure) | Needs work | Real Firebase email/password authentication and Google sign-in are exposed. Password reset is wired, logout and session reconciliation are present, and stale cached sessions/producer authority are cleared upon session loss. Public error copy is hardened without leaking internal configuration (Firebase Console, .env, authorized domains, developer setup). Fake Remember Me control was removed. Email/password and Google are currently exposed traveler sign-in paths. Apple authentication infrastructure exists but is not part of the currently verified public traveler sign-in surface. Account deletion remains a manual/operational privacy process (no in-app automated deletion). Full production provider/device E2E QA and operational verification still required. | Keep current public paths (email/password, Google); keep Apple dormant until device/provider verification; complete production E2E QA for signup, login, reset, logout, session recovery and operational privacy handling. |
| Traveler account state | Launch-ready candidate | Passport stamps and personal notes are account-backed. Favorites are intentionally browser-local, now scoped per guest/account identity instead of one shared browser key, and public auth copy no longer claims cross-device favorite sync. | Keep public; perform final multi-account/device QA and retain the local-only favorites wording. |
| Producer/Host authority | Needs work | Host privileges are derived from trusted producer ownership rather than client-editable profile fields. Phase 7 removed instant-verification wording and synthetic claim defaults, and ownership approval no longer implies VAT verification. The wider admin/claim lifecycle remains incomplete. | Keep trusted-host portal gated; retain manual/operator approval until the complete admin workflow exists. |
| Admin workflow | Needs work | Sensitive producer ownership assignment is operator/server trusted rather than a normal self-assignable frontend role, but the canonical roadmap still lists the full TerroirTrail Admin product/capabilities as incomplete. | Do not treat producer onboarding as a finished self-service operational workflow. |
| Map + producer discovery | Launch-ready candidate | Phase 4–6 data integrity and route safety are preserved. Phase 7 now exposes real catalogue loading/fallback state, avoids unsupported rating/review ranking, blocks map fly-to for unresolved locations, hides unverified road classifications, and adds accessibility labels to core map controls. | Final visual/mobile/keyboard/slow-network QA, then production verification. |
| Producer detail drawer | Launch-ready candidate | Visit/access wording remains fail-closed. Phase 7 removed synthetic VIP defaults and over-specific generic category claims, added dialog semantics, neutralized unsupported media-rights wording, and special-cases Peskesi as a farm rather than a distillery. | Final mobile/focus/direct-contact QA. |
| Favorites / Saved | Launch-ready candidate | Favorites remain device-local by design, but authenticated storage is now account-scoped and guest storage stays separate. The owner-switch guard prevents one account's favorites from being written into another account key during identity changes. | Keep local-only wording; manually test guest → account A → account B transitions. |
| Passport / visited stamps | Launch-ready candidate | Passport now derives its list from the stable cached catalogue rather than the current filtered discovery view, counts only known producer IDs, and guards zero-total progress. | Final manual QA with active discovery filters and empty/partial catalogue states. |
| Tasting notes / journal | Launch-ready candidate | Personal notes persist to the account profile, and the cloud `personalNotes` map is authoritative when present, so note deletion propagates instead of being merged back from stale local keys. | Final two-device deletion/update QA. |
| Curated routes/day trips | Hide for now | Legacy route definitions remain quarantined and are not verified for publication. Phase 6 intentionally blocks normal turn-by-turn routing. Public launch UI omits route-launch wiring from App (Header, FilterBar, ProfileMenu, mobile menu, About/FAQ), while draft DayTripModal infrastructure remains dormant. The FAQ explains verification status without actionable route launch. | Keep dormant; do not expose public route-launch buttons or turn-by-turn itineraries until road-access and stop verification are complete. |
| Experiences + tasting booking | Hide for now | No public TerroirTrail Experience is allowed without explicit producer agreement; live database Experiences are inactive. Public booking entry points are removed from current launch navigation while dormant infrastructure remains. | Keep dormant until producer-approved Experiences exist. |
| Explorer Pass | Future feature | Roadmap places Explorer Pass validation in Phase 13. Public upgrade/pricing entry points are removed from current launch navigation. | Keep non-public until its roadmap phase. |
| Host Pro | Future feature | Roadmap places Host Pro validation in Phase 13. Public upgrade/pricing claims and launch Host Portal navigation to Pro features are quarantined. | Keep dormant until commercial validation. |
| Chauffeur booking | Future feature | Roadmap places chauffeur partnerships in Phase 13. Public entry points are quarantined; prototype code may remain. | Keep non-public until a real provider/terms workflow exists. |
| Affiliate/sponsor fallback banners | Hide for now | Unverified fallback sponsor/`Official Partner` claims were removed from current public fallback behavior. | Only restore sponsor inventory when partner status, disclosure and claims are source-backed. |
| Google AdSense slot | Hide for now | Advertising is fail-closed behind `VITE_ENABLE_ADVERTISING=false` and `runtimeConfig.advertising`. Hardcoded AdSense and Travelpayouts scripts and preconnects were removed from `index.html`. `GoogleAdSlot` renders null and injects no external scripts when disabled or unconfigured, and `LegalModal` / `privacy.html` clarify that advertising is disabled for the current public launch. `verify_seo_assets` enforces the absence of monetization tags in production `index.html`. | Keep disabled; requires explicit product, consent and privacy review before any future activation. |

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

## Traveler authentication & account-lifecycle closeout

The traveler authentication cleanup batch aligns public auth UX and error handling with launch boundaries while keeping traveler authentication classified as **Needs work**.

1. **Fake "Remember Me" removed.** The non-functional checkbox and React state were removed from `AuthModal.tsx`; existing Firebase session behavior is unchanged without misleading client controls.
2. **Public authentication errors sanitized.** Developer and configuration details (Firebase Console, `.env`, authorized domains, Apple Developer credentials) were removed from public error copy. Users receive neutral, actionable messages while internal logging and rejection codes are preserved.
3. **Apple Sign-In accurately scoped.** Dormant Apple authentication infrastructure exists in `useAuth.ts` and `AuthModal.tsx`, but email/password and Google are currently exposed traveler sign-in paths. Apple authentication infrastructure exists but is not part of the currently verified public traveler sign-in surface.
4. **AuthModal accessibility pass completed.** Added dialog semantics (`role="dialog"`, `aria-modal="true"`, `aria-labelledby="auth-modal-title"`), stable title id, `role="alert"` on errors, `role="status"` and `aria-live="polite"` on password reset success, accessible `aria-label`s on password visibility toggles, and `aria-pressed` on the account-type switcher.
5. **Session reconciliation and producer trust boundaries intact.** Session nullification clears cached users and revokes host privileges; demo fixtures remain disabled when cloud Firebase is configured.
6. **Account deletion remains operational/manual.** In-app automated account deletion is not implemented; privacy/deletion requests continue to be directed to the TerroirTrail contact email as specified in `LegalModal.tsx`. Full operational verification is still required before launch.

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

## Public prototype & direct-entry quarantine closeout

The public prototype and direct-entry quarantine batch removes actionable commercial and unverified route entry points from the public launch surface while preserving underlying dormant infrastructure for future roadmap phases.

1. **Curated routes quarantined from public UI.** Public wiring (`onOpenLoops`) was removed from `App.tsx`, hiding the Curated Routes button from Header, FilterBar, ProfileMenu (desktop and mobile), and the mobile hamburger menu. Draft `DayTripModal` infrastructure remains dormant.
2. **About / FAQ route copy hardened.** The FAQ clarifies that curated routes are under verification without publishing turn-by-turn itineraries or providing an actionable route-launch CTA (`actionText` and `actionType: 'loops'` removed). About section copy updated to state: *"Curated driving routes are not currently published as a public route feature while their stops and access conditions are being re-verified."*
3. **Legacy commercial query parameters quarantined.** `App.tsx` no longer interprets `checkout_session_id`, `verify_pass`, `vip`, or `producer=upgraded`, and the associated Stripe/pass confirmation banner was removed.
4. **Legitimate producer discovery deep links preserved.** `?producer=<id>` continues to open the ProducerDetailDrawer for valid producer records, while legacy special parameter values (such as `producer=upgraded`) cease to trigger commercial handling.
5. **Dormant future components preserved.** `DayTripModal`, `BookingModal`, `MyBookingsModal`, `ExplorerPassModal`, `DigitalPassModal`, `ChauffeurBookingModal`, `HostVerificationModal`, and supporting services remain in the codebase as dormant assets for future roadmap phases (Phases 8–13) rather than being deleted.
6. **Producer-facing pass scanning quarantined.** The authenticated producer-facing `Scan Guest Pass` action is now gated behind the disabled `ENABLE_FUTURE_HOST_FEATURES` flag. `HostQrScannerModal`, `HostVerificationModal`, scanner state/handlers, and pass verification services remain in the codebase but are dormant for the current launch.
7. **Backend pass verification authorization hardened locally.** `GET /api/passes/verify/:passId` no longer permits anonymous verification: the server requires a valid Firebase identity and an active trusted ownership record from `producer_owners`, derived by authenticated UID rather than frontend role claims, before checking pass validity. Missing or invalid authentication returns `401`, authenticated users without active ownership receive `403`, and ownership lookup failures fail closed with `503`; pass verification does not run first, so unauthorized callers cannot use pass validity as an existence oracle. The dormant scanner client now sends its Firebase bearer token for future private-pilot compatibility, while its UI remains quarantined behind `ENABLE_FUTURE_HOST_FEATURES = false`. Explorer Pass remains a **Future feature**. This hardening was validated locally only; no production deployment or production verification occurred.

## Advertising & third-party monetization quarantine closeout

The Phase 7 advertising quarantine ensures that the public launch remains free of unconsented third-party trackers, display ads, and affiliate scripts.

1. **Strict launch-gate feature flag.** Introduced `VITE_ENABLE_ADVERTISING=false` in `.env.example` and wired centralized evaluation via `runtimeConfig.advertising.enabled`. Configured publisher or slot IDs alone never load advertising.
2. **Hardcoded third-party scripts removed from HTML.** Removed Google AdSense verification meta tag, `pagead2.googlesyndication.com` script tag, Travelpayouts script injection, and affiliate preconnects (`tpx.lv`, `emrld.ltd`) from `index.html`.
3. **GoogleAdSlot fails closed.** `GoogleAdSlot` reads `runtimeConfig.advertising`. When disabled (or if client/slot is missing, or for passholders), it returns `null`, renders zero elements, injects zero `<script>` tags, and performs zero ad calls. Unit tests verify all gate and fallback states.
4. **Automated SEO & build protection.** `scripts/verify_seo_assets.ts` asserts that `dist/index.html` does not contain `pagead2.googlesyndication.com`, `emrld.ltd`, or publisher IDs.
5. **Privacy Policy and Legal notices reconciled.** `LegalModal.tsx` and `public/privacy.html` explicitly clarify that advertising infrastructure is disabled for the current public launch and fails closed without sponsor fallbacks.
6. **Passport modal cleaned.** Removed unused `Award` import and unused `onOpenExplorerPass` / `onOpenDigitalPass` callback props from `PassportModal.tsx`.

## React warning inventory & runtime lifecycle closeout

1. **Warning classification completed.** The repository passes ESLint with 132 total warnings across dormant, test and launch-visible files. All warnings were classified into Launch-Visible (Category A), Dormant / Future / Prototype (Category B: 70 warnings across inactive booking, pass, wine box, and chauffeur components), and Test / Internal Tooling (Category C: 6 warnings).
2. **Launch-visible Rules-of-Hooks violation resolved.** In `ProducerPortalModal.tsx`, the early return `if (!isOpen) return null;` previously preceded 24 `useState` and `useEffect` calls, directly violating React's Rules of Hooks whenever the modal was mounted or toggled. The guard was repositioned to immediately precede JSX return, and the `selectedProducer` dependency was added to its sync effect. All 24 conditional hook warnings and the missing dependency warning were eliminated with zero regression.
3. **Intentional launch-visible warnings documented.**
   - `AuthModal.tsx` (`react-hooks/exhaustive-deps`, line 112): `selectedProducerId` is intentionally omitted from the modal open reset effect to prevent wiping user input fields when selecting an estate in the claim dropdown.
   - `MapCanvas.tsx` (`react-hooks/exhaustive-deps`, lines 206, 227, 236, 306): Leaflet map container mount effect `[]` intentionally runs once on mount to prevent tearing down the map instance; `TILE_CONFIGS` and `DESTINATION_CENTERS` are immutable module constants; and `onSelectProducer` is omitted from the marker synchronization effect to prevent destroying and recreating Leaflet DOM markers on every parent re-render.
4. **Zero credible runtime warnings remain on launch surfaces.** No stale closures, uncleaned event listeners, or unsafe effect lifecycles remain unaddressed on active launch surfaces.

## Unsupported marketing & dead prototype public exposure sweep closeout

A full keyword and surface sweep was conducted across public launch surfaces (`index.html`, `App.tsx`, `Header.tsx`, `FilterBar.tsx`, `ProducerDetailDrawer.tsx`, `AboutFaqModal.tsx`, `PassportModal.tsx`, `ProducerPortalModal.tsx`, `AuthModal.tsx`, `ProfileMenu.tsx`, `ProducerList.tsx`, `ProducerCard.tsx`, `MapCanvas.tsx`, `LegalModal.tsx`, `PrivacyModal.tsx`, `GoogleAdSlot.tsx`).

1. **No public exposure of commercial prototypes.** Public entry points for Explorer Pass purchases, digital pass displays, chauffeur van bookings, tasting reservation checkouts, curated route navigation, and Host Pro upgrades remain strictly quarantined.
2. **Public wiring confirmed quarantined.** `App.tsx` passes no route or booking callbacks (`onOpenLoops`, `onOpenExperiences`, `onOpenMyBookings`, `onOpenExplorerPass`, `onOpenDigitalPass`) to public header, drawer, filter, or menu components.
3. **Direct-entry parameters validated.** Commercial query parameters (`checkout_session_id`, `verify_pass`, `vip`, `producer=upgraded`) remain deactivated, while legitimate producer discovery deep links (`?producer=<id>`) remain supported.
4. **Legitimate public copy verified.** All public references to bookings, passes, routes, and advertising in FAQ, legal notices, and SEO metadata accurately explain launch boundaries (discovery-first product, 0% commissions, draft routes under verification, advertising failing closed, and commercial features reserved for future phases).
5. **Dormant architecture preserved.** Prototype components and server verification routes remain preserved in the codebase for future activation (Phases 8–13).

## Next launch-readiness blockers

1. Complete production-config traveler auth/account-lifecycle QA: real Firebase email/password signup and Google OAuth login on production domain, password reset delivery, logout/session recovery on mobile/desktop, operational verification of privacy/deletion handling, and provider error boundary checks.
2. Finish manual mobile/keyboard/focus QA for map, drawer, Passport and primary modals, including slow-network/loading states.
3. Before any future private pilot or commercial activation, complete operational review and production verification of the hardened Explorer Pass authorization path; this batch was not deployed.
4. Deployment and production smoke verification on Firebase Hosting before crossing Phase 7 checklist items.

## Notes

This audit does not delete future code simply because it is not launch-ready. The preferred pattern is to keep tested dormant infrastructure behind non-public entry points until the corresponding roadmap phase is active.
