# TerroirTrail Roadmap

> **Canonical project roadmap.** Update this file whenever a roadmap step is completed.
>
> Completion convention: change `- [ ] Step` to `- [x] ~~Step~~` when finished. Do not mark a step complete until it has been implemented, tested, pushed, deployed where applicable, and verified.

**Last updated:** 2026-09-15
**Current focus:** Phase 10C — Wider Mediterranean Expansion

---

## Phase 1 — Security & Architecture Hardening

**Status:** Core Issues #1–#6 completed; re-check only when later work touches these boundaries.

- [x] ~~Complete original security and architecture hardening Issues #1–#6.~~
- [x] ~~Harden authentication and authorization boundaries.~~
- [x] ~~Separate trusted backend authority from client-controlled profile fields.~~
- [x] ~~Complete native parity/security work covered by the original hardening programme.~~
- [x] ~~Keep dormant booking/experience infrastructure non-public until producer agreements exist.~~

---

## Phase 2 — Admin, Producer & Account Authority

**Status:** Deferred into Phase 11 — Account, Admin & Host Management. This early checklist is retained as a requirements record. Do not start the broad account-management programme before regional completion unless a security issue requires an immediate fix.

### Account roles

- [ ] Establish three clearly separated roles: Traveler, Producer/Host, TerroirTrail Admin.
- [ ] Ensure admin authority is server-trusted and cannot be self-assigned from the client.
- [ ] Ensure producer ownership is server-trusted and cannot be self-assigned from the client.
- [ ] Re-check that `isProducer`, `role`, `claimedProducerId`, `claimStatus`, or similar client/profile fields are never treated as authoritative by themselves.

### Admin capabilities

- [ ] Review producer claims.
- [ ] Approve or reject producer claims.
- [ ] Assign producer ownership.
- [ ] Remove or reassign producer ownership.
- [ ] Edit/correct producer listings.
- [ ] Review producer verification status.
- [ ] Manage problematic or disputed listings.
- [ ] Manage producers awaiting verification.
- [ ] Moderate producer-supplied content.
- [ ] Create an audit trail for sensitive administrative changes.
- [ ] Prepare admin control over future Experience approval and publication.

### Producer capabilities

- [ ] Ensure producers can manage only listings explicitly assigned to them.
- [ ] Ensure producer account functionality does not imply a commercial partnership until one exists.

---

## Phase 3 — Verification-Status Frontend Fix

**Status:** Completed and deployed in commit `1b05807`.

The frontend now respects Supabase truth instead of manufacturing defaults.

- [x] ~~Add `visit_status` to the frontend producer model and mapper.~~
- [x] ~~Add `location_status` to the frontend producer model and mapper.~~
- [x] ~~Preserve nullable/unknown hospitality and metadata values instead of coercing them to false/defaults.~~
- [x] ~~Remove fake default road access such as `paved` when unknown.~~
- [x] ~~Remove fake default food options such as `dakos_snacks` when unknown.~~
- [x] ~~Remove fake default `€€` pricing when unknown.~~
- [x] ~~Remove fake default 5-star ratings when unknown.~~
- [x] ~~Stop rendering unknown pet/campervan/kid fields as negative claims.~~
- [x] ~~Stop treating null/false `walk_in_friendly` as automatically `By Appointment`.~~
- [x] ~~Replace universal `Tastings & Cellar Visits` language with verified/category-appropriate Visiting & Contact UI.~~
- [x] ~~Use `visit_status` as the authority for visitor wording.~~
- [x] ~~Replace universal `Call Cellar Door` with category-neutral or category-appropriate labels.~~
- [x] ~~Do not synthesize navigation URLs for `location_status = unresolved`.~~
- [x] ~~Hide/disable Directions when the exact navigation point is unresolved.~~
- [x] ~~Update README claims so current public functionality matches the discovery-first product model.~~
- [x] ~~Run the full test/check suite.~~
- [x] ~~Commit, push and deploy the fix.~~
- [x] ~~Verify production behavior for public, seasonal, appointment-only, unconfirmed, uncertain, unresolved, and null-metadata cases.~~

---

## Phase 4 — Crete Data Integrity & Authenticity

**Status:** Completed — all 27 live Crete producer/project records audited and verified.

Complete the 27 Crete producer/project records with source-backed, human, authentic content.

### Regional audit batches

- [x] ~~Batch 1 — Chania (9 records)~~
- [x] ~~Batch 2 — Heraklion~~
- [x] ~~Batch 3 — Rethymno + Lasithi~~

- [x] ~~Verify and refine each real producer/family story.~~
- [x] ~~Verify what each producer actually makes.~~
- [x] ~~Verify factual origin/history details.~~
- [x] ~~Verify village/locality information.~~
- [x] ~~Give every pin a concise authentic tagline.~~
- [x] ~~Verify official websites.~~
- [x] ~~Verify public phone/contact details.~~
- [x] ~~Verify visitability separately from TerroirTrail partnership status.~~
- [x] ~~Remove any remaining invented awards, products, traditions, tasting menus, ratings, or hospitality claims.~~
- [x] ~~Ensure no producer card implies a TerroirTrail commercial relationship where none exists.~~
- [x] ~~Review all 27 Crete cards for consistent tone and completeness.~~

Closeout verification: **27 live Crete records; 0 unresolved/unreviewed locations; 0 unreviewed visit statuses; 0 legacy rating/tasting/price/access claim rows; 54 linked Experience rows, 0 active.**

Target feeling: **“I understand who these people are and why this place matters.”**

---

## Phase 5 — Offline / Fallback Data Synchronization

**Status:** Completed — bundled offline/fallback catalogue synchronized with the 27 audited Crete records; all synthetic defaults eliminated.

The bundled fallback must never resurrect old synthetic data when Supabase is unavailable.

- [x] ~~Synchronize `src/data/producers.ts` with the verified catalogue.~~
- [x] ~~Synchronize names.~~
- [x] ~~Synchronize coordinates and location-confidence behavior.~~
- [x] ~~Synchronize stories and taglines.~~
- [x] ~~Synchronize websites and phones.~~
- [x] ~~Synchronize visitability.~~
- [x] ~~Synchronize categories.~~
- [x] ~~Preserve unknown fields as unknown in fallback data.~~
- [x] ~~Ensure old synthetic ratings/tasting packages/hospitality metadata cannot reappear offline.~~
- [x] ~~Test live-data and fallback-data behavior separately.~~

---

## Phase 6 — Location & Rural Navigation Safety

**Status:** Completed — source-backed location/access confidence, fail-closed navigation, audited Crete access states, and route quarantine are implemented and deployed.

Location confidence and road-access confidence are separate concepts.

### Location confidence

- [x] ~~Maintain `verified_entrance`, `verified_location`, and `unresolved` states accurately.~~
- [x] ~~Resolve Lafkas exact entrance/location if reliable evidence becomes available.~~
- [x] ~~Resolve Aerakis exact entrance/location if reliable evidence becomes available.~~
- [x] ~~Resolve Tzourmpakis exact entrance/location if reliable evidence becomes available.~~
- [x] ~~Never substitute village-centre coordinates simply to make a pin appear complete.~~

### Road/access confidence

- [x] ~~Design a source-backed road/access confidence model.~~
- [x] ~~Restore road-access classifications only after actual verification.~~
- [x] ~~Distinguish normal paved, narrow paved, gravel, high-clearance/4x4, and other relevant access states where evidence supports them.~~
- [x] ~~Verify that map directions never route travelers to unresolved or unsafe access points.~~

Closeout verification:

- All **27 Crete records** now have an explicit road-access review state: **25 `not_publicly_confirmed`, 1 `current_access_uncertain`, 1 `verified`, 0 `unreviewed`**.
- Only **Peskesi Organic Farm** currently publishes a verified road classification: `unpaved_passable`, based on first-party access guidance. Passability is kept separate from rental-car suitability.
- The database no longer defaults road access to `paved`; road-access type, confidence status, source URL, and notes are independent fields.
- The frontend exposes road classifications only when `road_access_status = verified`; reviewed-but-unconfirmed and uncertain records remain explicitly unclassified.
- `ProducerDetailDrawer.tsx` uses generic road labels plus source-backed notes/source links rather than invented distances, surfaces, or standard-car claims.
- Individual location links do not masquerade as road-safety guarantees: unresolved locations suppress navigation, uncertain/high-clearance/4x4 access blocks normal driving actions, and passable unpaved access does not imply rental-car suitability.
- Curated multi-stop navigation fails closed for draft routes, missing producers, unresolved locations, unreviewed/unconfirmed/uncertain access, passable-unpaved access without separate rental-car evidence, and special-vehicle access.
- Legacy unaudited curated routes remain quarantined from the interactive app. Crawlable SEO/noscript content no longer advertises those draft loops, and the SEO verifier now fails if the quarantined route claims return.
- The bundled fallback catalogue was regenerated from the audited Supabase state and tests enforce that only source-backed verified road classifications may appear offline.
- The full `npm run check` completed successfully after the Phase 6 synchronization, including tests, production build, and SEO verification. Firebase Hosting was deployed after the final route-quarantine change.

Phase 6 completion does **not** mean curated driving loops are now published. Route design/publication remains a later product-readiness/Crete-finish task and must use verified stops and access evidence only.

---

## Phase 7 — Product Readiness Audit

**Status:** Completed — launch-readiness audit, source corrections, deployment, and manual production verification completed.

Audit TerroirTrail as a real launchable product, not merely a functioning codebase.

- [x] ~~Audit traveler signup/login.~~
- [x] ~~Audit traveler account flows.~~
- [x] ~~Audit producer account flows.~~
- [x] ~~Audit admin account flows.~~
- [x] ~~Audit map discovery.~~
- [x] ~~Audit producer detail pages.~~
- [x] ~~Audit favorites/saved producers.~~
- [x] ~~Audit passport functionality.~~
- [x] ~~Audit tasting notes/journal functionality.~~
- [x] ~~Audit routes/day trips.~~
- [x] ~~Audit mobile UX.~~
- [x] ~~Audit loading states.~~
- [x] ~~Audit error states.~~
- [x] ~~Audit offline/fallback behavior.~~
- [x] ~~Audit accessibility.~~
- [x] ~~Audit privacy/legal wording.~~
- [x] ~~Audit unsupported marketing claims.~~
- [x] ~~Identify dead/prototype functionality still exposed to users.~~
- [x] ~~Classify each major feature as `Launch-ready`, `Needs work`, `Hide for now`, or `Future feature`.~~

Closeout verification:

- Production deployment to Firebase Hosting completed and verified by the project owner.
- Traveler authentication (email/password, Google OAuth, password reset, session recovery, and logout) verified in live production testing.
- Traveler account state (favorites, Passport visited stamps, and personal journal/tasting notes) verified with persistent account-scoped storage.
- Map discovery, search, destination/category filtering, and legitimate `?producer=<id>` deep links verified in live production testing.
- Producer detail drawer verified with factual data, direct phone/website contacts, and accessible drawer mechanics.
- Mobile/responsive layouts, keyboard/focus accessibility, and slow-network loading behavior verified.
- Unverified commercial and prototype features (Explorer Pass purchase/upsell, tasting reservation checkouts, curated driving route navigation, chauffeur booking, Host Pro upgrade, host pass scanner, and affiliate/sponsor fallbacks) remain strictly quarantined.
- Third-party advertising remains disabled (`VITE_ENABLE_ADVERTISING=false`), with zero AdSense/affiliate tags loaded and SEO verifications passing.
- Explorer Pass authorization was hardened locally; operational/production verification will be completed prior to any future commercial pilot, and does not block current discovery-first launch.

---

## Phase 8 — Producer UI & Visual Authenticity

**Status:** Substantially completed — category-aware presentation, farm taxonomy, trust-aware visiting language, imagery provenance architecture, and live Google Places imagery are implemented. Remaining Phase 8 items are structural/project-classification cleanup and future first-party/rights-cleared local media.

- [x] ~~Make producer cards category-appropriate rather than wine-centric.~~
- [x] ~~Make winery UI feel appropriate for wineries.~~
- [x] ~~Make brewery UI feel appropriate for breweries.~~
- [x] ~~Make dairy UI feel appropriate for dairies.~~
- [x] ~~Make olive-mill UI feel appropriate for olive mills.~~
- [x] ~~Make apiary/herb/farm UI feel appropriate for those producers.~~
- [x] ~~Add a first-class farm category/taxonomy and migrate Peskesi from the legacy `kazani` bucket.~~
- [ ] Ensure heritage/local projects do not masquerade as producers.
- [ ] Standardize producer detail hierarchy: Story → What they make → Visiting & Contact → Location & Access.
- [ ] Remove empty sections caused by correctly-null verified fields.
- [x] ~~Audit current imagery provenance.~~
- [ ] Replace generic/stock imagery with producer-approved, official press-kit, rights-safe editorial, or properly attributed Creative Commons imagery.
- [x] ~~Ensure no generic stock photo is presented as though it depicts the actual producer.~~

Phase 8 reconciliation notes:

- Farm is now a first-class taxonomy and Peskesi is no longer carried through the legacy `kazani` compatibility path.
- Producer presentation is category-aware and unverified visitability no longer produces positive hospitality claims such as `Walk-ins welcome`.
- Imagery provenance was hardened so local/category fallback imagery cannot masquerade as verified estate media.
- Google Places imagery is now production-enabled only for manually audited Crete records with verified Place IDs. Photos are loaded live at runtime, attribution remains visible, and Google photo URIs are not persisted, cached, proxied, or rehosted.
- The production image hierarchy is: approved host/producer media → explicitly credited local media → live Google Places imagery → neutral category fallback.
- Producer-uploaded media remains a gated prototype; its proposed Supabase storage migration has not been applied.

---

## Phase 9 — Crete as the First Finished Region

**Status:** In progress — the core Crete discovery/trust foundation, polished producer pages, authentic live imagery, and the complete mobile journey are verified. Remaining work is discovery guides/day trips and final regional QA.

Crete becomes the reference implementation before rapid geographic expansion.

- [x] ~~Finish the trustworthy Crete map.~~
- [x] ~~Finish the authentic Crete producer catalogue.~~
- [x] ~~Finish useful search and filtering.~~
- [x] ~~Finish safe navigation/directions behavior.~~
- [x] ~~Finish real producer stories.~~
- [x] ~~Finish direct producer contact flows.~~
- [x] ~~Finish polished producer pages.~~
- [ ] Finish useful self-guided routes/day trips using verified pins only.
- [x] ~~Finish mobile UX for the complete Crete journey.~~
- [ ] Perform final Crete regional QA.

### Phase 9A — Verified Google Place ID foundation

- [x] ~~Add persistent nullable Google Place IDs to the producer data model.~~
- [x] ~~Require verified Place IDs for Google Places media instead of coordinate-based lookup.~~
- [x] ~~Manually browser-verify the initial five producer Place IDs.~~
- [x] ~~Synchronize verified IDs into Supabase and the offline/fallback catalogue.~~
- [x] ~~Keep Google Places media production-disabled while the data foundation is validated.~~

Phase 9A milestone: `9d15449855ecd9c8968e8781416130140682d447` — `Complete Phase 9A verified Google Place ID mapping`.

### Phase 9B — Complete Crete Google Place ID audit

- [x] ~~Build a localhost browser audit tool using Google Places search with the restricted development key.~~
- [x] ~~Require manual business-identity confirmation before persisting a Place ID.~~
- [x] ~~Treat large coordinate differences as possible stale TerroirTrail data rather than automatically rejecting Google.~~
- [x] ~~Correct the stale Lafkas Brewery location after Google and producer-owned evidence confirmed the current Pazinos location.~~
- [x] ~~Manually audit and persist Google Place IDs for all 27 live Crete producer/project records.~~
- [x] ~~Synchronize the verified Place IDs into production Supabase and the bundled fallback catalogue.~~
- [x] ~~Keep location, visitability, entrance precision, and road-access verification as independent trust dimensions.~~
- [x] ~~Complete Phase 9B as a single milestone on `main`.~~

Phase 9B milestone: `0930e237a95a1cb5e1965755767c18f7ba1b83e2` — `Complete Phase 9B verified Google Place ID audit`.

At the Phase 9B milestone, Google Places imagery was still production-disabled. Phase 9C later enabled it after the audited Place-ID foundation, restricted-key setup, runtime gating, attribution work, automated checks, and browser QA were completed.

### Phase 9C — Authentic producer imagery

- [x] ~~Replace public generic/stock cover-image bypasses with trust-aware media resolution and neutral category fallbacks.~~
- [x] ~~Use manually audited Google Place IDs and an allowlist as the only eligibility path for live Google producer imagery.~~
- [x] ~~Configure a dedicated website-restricted Google Maps browser key and keep the key out of source control.~~
- [x] ~~Preserve media priority: approved host/producer media → explicitly credited local media → live Google imagery → neutral fallback.~~
- [x] ~~Render live Google imagery on producer cards without storing or rehosting Google photos.~~
- [x] ~~Add a live Google photo carousel with contributor/Google Maps attribution to the producer Story gallery.~~
- [x] ~~Use live Google imagery in the drawer hero when no trusted local producer image exists.~~
- [x] ~~Use live Google imagery in the selected-producer map quick-card when no trusted local producer image exists.~~
- [x] ~~Verify the carousel, left cards, drawer hero, map quick-card, attribution, and fallback behavior in the browser.~~
- [x] ~~Run the full project quality gate after the imagery work and reconcile the final code to `main`.~~

Phase 9C milestones include `3df9cdaea6175c46a41be8199c1ed83044f5025d` — `Complete Phase 9C authentic producer imagery`, `6c21856f30f99abd16f03d76380af88ab76da96e` — `Complete Google producer photo carousel`, and `a60b1a7e03f673924780ab7dd8a8472b61390be1` — `Complete Google imagery across producer surfaces`.

Production behavior was visually verified by the project owner across the left producer cards, drawer hero, Story carousel, and map quick-card. Google imagery remains supplementary discovery media and is not evidence of visitability, entrance precision, or road safety.

### Phase 9D — Crete discovery guides & regional closeout

**Status:** Outstanding Crete closeout backlog; Phase 9 is not yet marked complete.

- [x] ~~Convert the Western Chania guide to verified-stop discovery data.~~
- [x] ~~Convert the Heraklion discovery guides to verified-stop discovery data.~~
- [ ] Complete the Rethymno discovery guide; keep it draft/unpublished until its stop set and presentation are ready.
- [ ] Present Crete guides as discovery itineraries/stop collections, not as road-safety guarantees.
- [ ] Keep multi-stop driving/navigation fail-closed wherever road-access evidence is insufficient.
- [ ] Complete a final Crete production smoke pass across discovery, producer imagery, mobile, deep links, and guide presentation.
- [ ] Reconcile the final Phase 9 checklist and mark Phase 9 complete only after the guide/QA closeout is verified.

---

## Phase 10 — Complete All Remaining Regions

**Status:** In progress — Phase 10A Santorini and Phase 10B Peloponnese + Northern Greece + Tuscany / Italy are complete and production-verified. Phase 10C Wider Mediterranean is next; Northern Europe follows.

Bring every other intended TerroirTrail region to the same deliberate trust and product-quality standard before moving on to account/admin/host management.

### Regional sequence

1. Santorini
2. Peloponnese
3. Northern Greece
4. Tuscany / Italy
5. Wider Mediterranean regions added to the product
6. Northern Europe regions added to the product

### Phase 10 progress

- [x] ~~Phase 10A — Complete the Santorini regional trust/location/media/Discovery Guide programme.~~
- [x] ~~Phase 10B — Complete Peloponnese + Northern Greece + Tuscany / Italy, including 19/19 audited Google identities, road review, bundled fallback parity, rebuilt Discovery Guides, deployment, and production smoke verification.~~
- [ ] Phase 10C — Define and complete the next wider Mediterranean regional batch using the same evidence-first quality bar.
- [ ] Phase 10D — Define and complete the Northern Europe regional batch after the wider Mediterranean work.

Phase 10B closeout is recorded in `reports/phase10b_peloponnese_northern_greece_tuscany.md`. The project owner confirmed the final guide build was deployed and passed the requested production smoke checks on 2026-09-15.

The order inside Phase 10 can be adjusted deliberately, but the rule remains: **finish the regional content/product layer before moving into account-management and partnership work.** The architecture must remain geography-open rather than reintroducing a Greece-only fence.

### Required quality bar for every region

- [ ] Audit real producers/projects and remove invented or stale claims.
- [ ] Verify category/entity type so farms, heritage projects, geoparks, and other local projects do not masquerade as a different kind of listing.
- [ ] Verify locations and preserve unresolved/uncertain states where evidence is insufficient.
- [ ] Verify public visitability separately from partnership status.
- [ ] Verify road/access evidence independently from location evidence and keep route safety fail-closed.
- [ ] Verify producer-controlled public contact channels.
- [ ] Add verified Google Place IDs where Google imagery is used.
- [ ] Apply the same media hierarchy and attribution rules used for Crete.
- [ ] Keep stories, taglines, products, and local context source-backed and human.
- [ ] Bring search, filters, map/list browsing, detail pages, deep links, and mobile presentation to parity with the Crete reference implementation.
- [ ] Build discovery guides only from verified stops and never present them as road-safety guarantees without route evidence.
- [ ] Synchronize bundled fallback/offline data so stale defaults cannot reappear.
- [ ] Run the full automated quality gate and a regional production smoke pass before marking each region complete.

**Definition of done:** every region TerroirTrail intends to have publicly available before partnerships has reached an explicit reference-quality standard, with no knowingly half-built public region left behind.

---

## Phase 11 — Account, Admin & Host Management

**Status:** Begins only after Phase 10 regional completion. This phase defines who can sign in, what each account type can do, and which actions require trusted backend authority.

This phase absorbs the unfinished requirements recorded in Phase 2 and turns them into one complete account-management programme.

### Traveler accounts

- [ ] Define the complete Traveler account lifecycle: signup, login, recovery, profile, session management, logout, and account deletion/deactivation behavior.
- [ ] Preserve favorites/saved producers as account-scoped data.
- [ ] Preserve Passport visited stamps as account-scoped data.
- [ ] Preserve private journal/tasting notes as account-scoped data.
- [ ] Define which traveler preferences/settings are stored and how they are edited.
- [ ] Ensure one traveler cannot access another traveler’s private state.
- [ ] Make account state, loading, empty, error, and recovery UX production-ready on desktop and mobile.

### Host accounts

- [ ] Define the Host/Producer account lifecycle separately from Traveler accounts.
- [ ] Require explicit, server-trusted listing ownership before host-management tools become available.
- [ ] Ensure a host can manage only listings explicitly assigned to that account.
- [ ] Define which listing fields a host may propose/edit directly and which fields require admin review.
- [ ] Define host media upload/management with clear provenance and moderation status.
- [ ] Keep location, visitability, road-access confidence, verification badges, and other trust-sensitive fields under controlled authority rather than unchecked client edits.
- [ ] Provide clear draft/pending/published states for host-submitted changes.
- [ ] Ensure having a Host account does **not** imply a TerroirTrail partnership or commercial agreement.

### Admin accounts and authority

- [ ] Establish server-trusted TerroirTrail Admin authority that cannot be self-assigned from the client.
- [ ] Review and resolve producer/host claims.
- [ ] Approve, reject, assign, remove, or reassign producer ownership.
- [ ] Edit/correct producer and project listings.
- [ ] Review verification, visitability, location, access, and media states.
- [ ] Manage disputed/problematic listings and producers awaiting verification.
- [ ] Moderate producer-supplied content and media.
- [ ] Manage user/account status where operationally necessary.
- [ ] Create an audit trail for sensitive administrative actions.
- [ ] Prepare admin control over future Experience approval/publication without activating commercial Experiences yet.

### Cross-role security and product QA

- [ ] Define a role/capability matrix for Traveler, Host, and Admin accounts.
- [ ] Enforce every privileged action on a trusted backend boundary; frontend role/profile fields alone are never authority.
- [ ] Test ownership, role escalation, claim handling, account isolation, and failure modes.
- [ ] Re-check privacy/legal wording for the actual account data and moderation workflows in production.
- [ ] Complete full desktop/mobile/account accessibility and recovery QA.
- [ ] Run the full automated quality gate and end-to-end production account smoke pass.

**Definition of done:** Traveler, Host, and Admin accounts have clear, tested, server-enforced capabilities and the platform can be safely operated before any partnership/deal outreach begins.

---

## Phase 12 — Producer Partnerships & Deals

**Status:** Deferred until Crete, all intended regions, and Phase 11 account/admin/host management are complete.

Only after the product, regional catalogue, and account-management model are finished do we begin talking to producers about formal relationships or commercial terms. Independent researched listings and direct links to producer-controlled public channels may continue without implying a partnership.

- [ ] Define producer partnership onboarding.
- [ ] Verify producer identity and authorized representative.
- [ ] Convert the appropriate verified Host/listing ownership state into a formal partnership state only after agreement.
- [ ] Obtain contact/inquiry permissions where applicable.
- [ ] Obtain image/content rights where applicable.
- [ ] Agree commercial terms where applicable.
- [ ] Allow a producer to opt into TerroirTrail inquiries without requiring a full bookable Experience.
- [ ] Define how partnership status is displayed without confusing it with public visitability or listing verification.

Relationship levels:

1. Independent researched listing
2. Partner accepting TerroirTrail inquiries
3. Partner offering approved Experiences

---

## Phase 13 — Experiences

**Status:** Do not populate before producer agreements.

- [ ] Create Experiences only after explicit producer agreement.
- [ ] Agree the exact activity.
- [ ] Agree title and description.
- [ ] Agree duration.
- [ ] Agree price.
- [ ] Agree capacity.
- [ ] Agree inclusions.
- [ ] Agree schedule and seasonal availability.
- [ ] Agree cancellation terms.
- [ ] Agree accessibility information where relevant.
- [ ] Agree the booking process.
- [ ] Implement/confirm lifecycle: `draft → awaiting producer approval → approved → published → paused/withdrawn`.
- [ ] Ensure pausing/removing an Experience never removes the underlying producer listing.

---

## Phase 14 — Booking & Payments

**Status:** Future.

Only after real approved Experiences exist.

- [ ] Decide whether TerroirTrail handles inquiry only, reservation, payment, or deposits.
- [ ] Design availability/scheduling model.
- [ ] Design cancellation/refund flows.
- [ ] Design producer payout model if payments are handled.
- [ ] Decide commission/subscription economics.
- [ ] Address VAT/invoicing/accounting implications.
- [ ] Implement booking security and authorization around actual commercial agreements.

---

## Phase 15 — Monetisation & Scale

**Status:** Future.

- [ ] Validate Host Pro based on real producer needs.
- [ ] Validate Explorer Pass based on real traveler value.
- [ ] Introduce sponsored visibility/advertising only with clear disclosure and trust safeguards.
- [ ] Validate affiliate travel services.
- [ ] Validate chauffeur partnerships.
- [ ] Expand direct producer bottle-shop linking where appropriate.
- [ ] Revisit booking revenue only if the commercial model deliberately supports it.

Monetisation follows the product and trust model; it must not dictate or weaken producer verification.

---

## Operating Rules

1. **Producer discovery and Experiences are separate product layers.**
2. **No public TerroirTrail Experience exists without a producer agreement.**
3. **Public visitability does not equal TerroirTrail booking permission.**
4. **Unknown data stays unknown.** Never invent a positive or negative fact to fill a UI field.
5. **Never guess unresolved coordinates.**
6. **Direct producer contact is acceptable without a partnership only through producer-controlled public channels.**
7. **Admin and producer authority must be server-trusted.**
8. **Every completed roadmap item is crossed out in this file when verified complete.**
9. **Before starting a major new feature, place it against this roadmap first.**
10. **Crete is the reference-quality region before broad expansion.**
11. **Finish Crete before beginning the remaining-region programme.**
12. **Finish all intended public regions before beginning the broad Traveler/Host/Admin account-management programme.**
13. **Finish and production-verify Traveler, Host, and Admin account capabilities before producer-partnership or deal outreach begins.**
14. **Partnership-dependent commercial features stay dormant rather than forcing premature deals.**