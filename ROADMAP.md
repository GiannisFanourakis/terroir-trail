# TerroirTrail Roadmap

> **Canonical project roadmap.** Update this file whenever a roadmap step is completed.
>
> Completion convention: change `- [ ] Step` to `- [x] ~~Step~~` when finished. Do not mark a step complete until it has been implemented, tested, pushed, deployed where applicable, and verified.

**Last updated:** 2026-09-14
**Current focus:** Phase 8 — Producer UI & Visual Authenticity

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

**Status:** Not complete. Priority before commercial launch.

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

**Status:** Pending.

- [ ] Make producer cards category-appropriate rather than wine-centric.
- [ ] Make winery UI feel appropriate for wineries.
- [ ] Make brewery UI feel appropriate for breweries.
- [ ] Make dairy UI feel appropriate for dairies.
- [ ] Make olive-mill UI feel appropriate for olive mills.
- [ ] Make apiary/herb/farm UI feel appropriate for those producers.
- [ ] Add a first-class farm category/taxonomy and migrate Peskesi from the legacy `kazani` bucket.
- [ ] Ensure heritage/local projects do not masquerade as producers.
- [ ] Standardize producer detail hierarchy: Story → What they make → Visiting & Contact → Location & Access.
- [ ] Remove empty sections caused by correctly-null verified fields.
- [ ] Audit current imagery provenance.
- [ ] Replace generic/stock imagery with producer-approved, official press-kit, rights-safe editorial, or properly attributed Creative Commons imagery.
- [ ] Ensure no generic stock photo is presented as though it depicts the actual producer.

---

## Phase 9 — Crete as the First Finished Region

**Status:** Pending.

Crete becomes the reference implementation before rapid geographic expansion.

- [ ] Finish the trustworthy Crete map.
- [ ] Finish the authentic Crete producer catalogue.
- [ ] Finish useful search and filtering.
- [ ] Finish safe navigation/directions behavior.
- [ ] Finish real producer stories.
- [ ] Finish direct producer contact flows.
- [ ] Finish polished producer pages.
- [ ] Finish useful self-guided routes/day trips using verified pins only.
- [ ] Finish mobile UX for the complete Crete journey.
- [ ] Perform final Crete regional QA.

Expansion order after Crete can proceed through Santorini, Peloponnese, Northern Greece, Italy/wider Mediterranean, and Northern Europe based on product priorities.

---

## Phase 10 — Producer Partnerships

**Status:** Future commercial phase.

- [ ] Define producer partnership onboarding.
- [ ] Verify producer identity and authorized representative.
- [ ] Establish listing ownership.
- [ ] Obtain contact/inquiry permissions where applicable.
- [ ] Obtain image/content rights where applicable.
- [ ] Agree commercial terms where applicable.
- [ ] Allow a producer to opt into TerroirTrail inquiries without requiring a full bookable Experience.

Relationship levels:

1. Independent researched listing
2. Partner accepting TerroirTrail inquiries
3. Partner offering approved Experiences

---

## Phase 11 — Experiences

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

## Phase 12 — Booking & Payments

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

## Phase 13 — Monetisation & Scale

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
