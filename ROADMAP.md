# TerroirTrail Roadmap

> **Canonical project roadmap.** Update this file whenever a roadmap step is completed.
>
> Completion convention: change `- [ ] Step` to `- [x] ~~Step~~` when finished. Do not mark a step complete until it has been implemented, tested, pushed, deployed where applicable, and verified.

**Last updated:** 2026-09-23
**Current focus:** Phase 15.8A Explorer is live; immediate work is B2C validation plus planned Phase 15.8B Trip Intelligence/Journey Mode. Producer Partner outreach remains deferred behind traveler evidence.

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

**Status:** Requirements were absorbed into and handled by Phase 11 — Account, Admin & Host Management. This early checklist is retained as a historical requirements record; Phase 11 is the authoritative closeout.

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
- Google Places imagery is production-enabled only for manually audited records with persistent Google Place IDs and verified location identity. Photos are loaded live at runtime, attribution remains visible, and Google photo URIs are not persisted, cached, proxied, or rehosted.
- Live Supabase producers no longer need to be precompiled into the legacy/static compatibility allowlist: producer-card and drawer eligibility now use the live producer trust state (`google_place_id` plus `verified_location` / `verified_entrance`).
- The production image hierarchy is: approved host/producer media → explicitly credited local media → live Google Places imagery → neutral category fallback.
- Producer-uploaded media remains a gated prototype; its proposed Supabase storage migration has not been applied.

---

## Phase 9 — Crete as the First Finished Region

**Status:** Completed — Crete is production-verified as the first reference-quality TerroirTrail region, including the audited catalogue, trust/location/media model, mobile discovery journey, automated QA, deployment, and final production smoke.

Crete is the reference implementation for subsequent geographic and category expansion.

- [x] ~~Finish the trustworthy Crete map.~~
- [x] ~~Finish the authentic Crete producer catalogue.~~
- [x] ~~Finish useful search and filtering.~~
- [x] ~~Finish safe navigation/directions behavior.~~
- [x] ~~Finish real producer stories.~~
- [x] ~~Finish direct producer contact flows.~~
- [x] ~~Finish polished producer pages.~~
- [x] ~~Finish useful self-guided producer discovery using verified pins only.~~
- [x] ~~Finish mobile UX for the complete Crete journey.~~
- [x] ~~Perform final Crete regional QA.~~

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

**Status:** Complete / closed.

- [x] ~~Convert the Western Chania guide to verified-stop discovery data.~~
- [x] ~~Convert the Heraklion discovery guides to verified-stop discovery data.~~
- [x] ~~Complete the Rethymno Discovery Guide using the visit-ready verified stop set; keep Tzourmpakis out while ordinary visitor access remains uncertain.~~
- [x] ~~Present Crete guides as discovery itineraries/stop collections, not as road-safety guarantees.~~
- [x] ~~Keep multi-stop driving/navigation fail-closed wherever road-access evidence is insufficient.~~
- [x] ~~Complete a final Crete production smoke pass across discovery, producer imagery, mobile/deep-link behavior, and guide presentation.~~
- [x] ~~Reconcile the final Phase 9 checklist and mark Phase 9 complete after guide/QA closeout verification.~~

Phase 9 closeout is recorded in `reports/phase9_crete_closeout.md`. The final Crete guide quality gate passed on `fd9d27479672eb6ab277fc1feaac7b89d94b45c9`, and the project owner confirmed the final Firebase Hosting deployment and requested production smoke passed on 2026-09-15.

---

## Phase 10 — Complete the Existing Regional Programme

**Status:** Completed — Santorini, Peloponnese, Northern Greece, and the current Tuscany / Italy foothold are audited, production-verified, and closed at the agreed trust standard.

Phase 10 closes the regional programme that was already present in the product. It no longer acts as a container for indefinite Mediterranean or Northern European expansion. New expansion happens only after Phase 11 and is split into explicit phases below.

### Phase 10 progress

- [x] ~~Phase 10A — Complete the Santorini regional trust/location/media/Discovery Guide programme.~~
- [x] ~~Phase 10B — Complete Peloponnese + Northern Greece + Tuscany / Italy, including 19/19 audited Google identities, road review, bundled fallback parity, rebuilt Discovery Guides, deployment, and production smoke verification.~~

Phase 10B closeout is recorded in `reports/phase10b_peloponnese_northern_greece_tuscany.md`. The project owner confirmed the final guide build was deployed and passed the requested production smoke checks on 2026-09-15.

**Definition of done:** the regions already carried by the product before the next expansion programme have explicit audited states and production-verified presentation. Further category or geographic growth is deliberately sequenced after account handling rather than being mixed into this completed phase.

---

## Phase 11 — Account, Admin & Host Management

**Status:** Completed / handled. Traveler, Host and Admin authority, account/community workflows and production-smoke coverage are implemented; Phase 11 is no longer a prerequisite blocking category expansion.

This phase absorbed the unfinished requirements recorded in Phase 2 and established the trusted account-management boundary used by the live product.

### Traveler accounts

- [x] ~~Define the complete Traveler account lifecycle: signup, login, recovery, profile, session management, logout, and account deletion/deactivation behavior.~~
- [x] ~~Preserve favorites/saved producers as account-scoped data.~~
- [x] ~~Preserve Passport visited stamps as account-scoped data.~~
- [x] ~~Preserve private journal/tasting notes as account-scoped data.~~
- [x] ~~Define which traveler preferences/settings are stored and how they are edited.~~
- [x] ~~Ensure one traveler cannot access another traveler’s private state.~~
- [x] ~~Make account state, loading, empty, error, and recovery UX production-ready on desktop and mobile.~~

### Host accounts

- [x] ~~Define the Host/Producer account lifecycle separately from Traveler accounts.~~
- [x] ~~Require explicit, server-trusted listing ownership before host-management tools become available.~~
- [x] ~~Ensure a host can manage only listings explicitly assigned to that account.~~
- [x] ~~Define which listing fields a host may propose/edit directly and which fields require admin review.~~
- [x] ~~Define host media/content management with clear provenance and moderation authority.~~
- [x] ~~Keep location, visitability, road-access confidence, verification badges, and other trust-sensitive fields under controlled authority rather than unchecked client edits.~~
- [x] ~~Provide controlled lifecycle states for host-submitted/managed content where applicable.~~
- [x] ~~Ensure having a Host account does **not** imply a TerroirTrail partnership or commercial agreement.~~

### Admin accounts and authority

- [x] ~~Establish server-trusted TerroirTrail Admin authority that cannot be self-assigned from the client.~~
- [x] ~~Review and resolve producer/host claims.~~
- [x] ~~Approve, reject, assign, remove, or reassign producer ownership.~~
- [x] ~~Edit/correct producer and project listings under trusted authority.~~
- [x] ~~Review verification, visitability, location, access, media and community states.~~
- [x] ~~Manage disputed/problematic listings and producers awaiting verification.~~
- [x] ~~Moderate producer/traveler-supplied community content under Admin authority.~~
- [x] ~~Manage user/account state where operationally necessary.~~
- [x] ~~Maintain moderation/audit evidence for sensitive administrative actions.~~
- [x] ~~Keep future Experience approval/publication under trusted authority without activating unagreed commercial Experiences.~~

### Cross-role security and product QA

- [x] ~~Define and enforce distinct Traveler, Host and Admin capabilities.~~
- [x] ~~Enforce privileged actions on trusted backend boundaries; frontend role/profile fields alone are never authority.~~
- [x] ~~Test ownership, role separation/escalation, claim handling, account isolation and failure modes.~~
- [x] ~~Include account/community data in account export/deletion handling.~~
- [x] ~~Cover Traveler isolation/persistence, Host ownership/replies, Admin moderation and Verified Visit behavior in a reversible production smoke.~~
- [x] ~~Add `npm run smoke:production` and document dedicated role-account production verification.~~

Phase 11 production-smoke work is recorded by commit `5e95575ecfd26a28aafcc143f5a3d90983793377` (`Add reversible Phase 11 production smoke`). Account export/deletion handling for community reviews is recorded by `bb6899c4d3a903250cb1d2d639e1090bdbaadb7f`.

**Definition of done:** Traveler, Host, and Admin accounts have clear, tested, server-enforced capabilities and the platform can be safely operated while catalogue expansion continues.

---

## Expansion Quality Bar — Applies whenever catalogue expansion is explicitly resumed

Every new Greek producer, project, category, regional context layer, or later international region must follow the same evidence-first standard where applicable:

- [ ] Audit real producers/projects and remove invented or stale claims.
- [ ] Verify entity type so production sites, shops, cooperatives, farms, heritage projects, geoparks, and other local projects are not misrepresented.
- [ ] Verify locations and preserve unresolved/uncertain states where evidence is insufficient.
- [ ] Verify public visitability separately from partnership status.
- [ ] Verify road/access evidence independently from location evidence and keep route safety fail-closed.
- [ ] Verify producer-controlled public contact channels.
- [ ] Add verified Google Place IDs where Google imagery is used.
- [ ] Apply the same media hierarchy and attribution rules used for Crete.
- [ ] Keep stories, taglines, products, origin claims, regional descriptions, and local context source-backed and human.
- [ ] Bring search, filters, map/list browsing, detail pages, deep links, and mobile presentation to reference-quality parity.
- [ ] Separate location verification from road-access classification and keep road-access warnings fail-closed.
- [ ] Synchronize bundled fallback/offline data so stale defaults cannot reappear.
- [ ] Run the full automated quality gate and a production smoke pass before marking an expansion phase complete.

---

## Phase 12 — Greek Cheese & Dairy Expansion

**Status:** Completed — Greek Cheese & Dairy Expansion verified. 9 retained audited dairy producers with persistent audited Google Place IDs; 5 unresolved candidates removed; 62 audited producers across the catalogue at that Phase 13 closeout snapshot.

> Implementation/reporting during this workstream used the label “Phase 13 dairy”. The canonical roadmap keeps Greek Cheese & Dairy as Phase 12 and records that work here rather than renumbering subsequent phases.

- [x] ~~Define first-class cheese/dairy taxonomy and filters without treating every dairy as a visitor attraction.~~
- [x] ~~Build an audited Greek producer batch covering genuine feta production and other regional cheeses such as graviera, manouri, kefalotyri, and locally important cheeses where evidence supports inclusion.~~
- [x] ~~Distinguish farm, dairy/creamery, maturation/production site, cooperative, and retail shop identities.~~
- [x] ~~Verify product and protected-origin claims rather than inferring them from geography or business names.~~
- [x] ~~Verify production-site location separately from any public shop or office.~~
- [x] ~~Verify visitor access independently; factory or dairy existence does not imply tours or walk-ins.~~
- [x] ~~Bring the retained records through the final common Expansion Quality Bar/build/deploy verification.~~

Phase 12 dairy rollout notes:

- The final retained dairy catalogue contains **9 dairy producers total**: 2 pre-existing records plus **7 retained additions**.
- The seven retained additions are **Stamatogiorgis Dairy, ELATOS / Kapetanou Bros, Arvanitis Dairy, Baladinos & Sons, Christakis / Patria Feta, Psiloritis Cheese Dairy, and ARGOGAL / Koromichi Family**.
- **9 / 9 retained dairy records** now carry persistent manually audited Google Place IDs.
- Five originally imported candidates were removed on 2026-09-16 because their exact persistent Google business identity could not meet the final publication standard: **GYPAS / Gyparaki Bros, Iliakis Dairy / Meraki Iliaki, Agricultural Dairy Cooperative of Kalavryta, Katsouli Cheese Factory, and Tsatsoulis Cheese**.
- The five removed listings had **0 bookings, 0 reviews and 0 Experience rows** at removal time.
- The removal is recorded in Supabase migration `20260916171211_remove_unresolved_phase13_dairies` and mirrored in the repository migration of the same name.
- Historical Phase 13 closeout snapshot: **62 producer/project records** (**30 Crete, 9 Santorini, and 23 across Peloponnese + Macedonia, Greece (`northern_greece`) + Tuscany / Italy**). The catalogue has since expanded; current production totals are derived from live Supabase during SEO synchronization rather than maintained as a static roadmap snapshot.
- Google Place IDs are never inferred from coordinates or third-party directory IDs.
- Local `cover_image` / gallery fields remain empty for the retained new dairy records unless appropriately sourced, credited, or producer-provided media is obtained.
- Live producer media eligibility uses the Supabase producer trust state (`google_place_id` plus `verified_location` / `verified_entrance`) rather than requiring records to exist in the legacy static compatibility allowlist.
- The Google Places eligibility fix was deployed successfully earlier in the workstream with `npm run deploy`, and the project owner verified live dairy imagery. The final five-listing removal still requires the normal build/deploy verification before Phase 12 is formally closed.
- Google imagery remains supplementary discovery media and is not evidence of partnership, visitability, entrance precision, or road safety.

**Definition of done:** Greek cheese and dairy is a credible, source-backed TerroirTrail vertical rather than a handful of generic dairy pins.

---

## Phase 13 — Interactive Terroir Regions

**Status:** Completed — Interactive Terroir Regions implemented across all 5 destinations (Crete, Santorini, Peloponnese, Macedonia, Greece, and Tuscany) using authoritative geoBoundaries gbOpen geometries with CC BY 4.0 attribution and visible map attribution.

This phase adds a geographic discovery layer above individual producer pins so travelers can understand the character of a place before drilling into specific makers.

- [x] ~~Define a reusable regional-boundary data model and GeoJSON layer that can support Crete first and later other Greek/international regions.~~
- [x] ~~Prototype **Heraklion** with an accurate regional polygon, subtle map highlight, and clear region label.~~
- [x] ~~Add hover/focus interaction on desktop and tap interaction on mobile without interfering with producer pins or map navigation.~~
- [x] ~~Build a compact regional terroir card answering **“what makes this place distinctive?”** rather than presenting generic tourism copy.~~
- [x] ~~Keep regional descriptions, agricultural context, products, cultivars, traditions, landscape and climate claims source-backed and appropriately scoped.~~
- [x] ~~Show useful live catalogue context such as producer count and represented categories without fabricating completeness.~~
- [x] ~~Add an **Explore region** action that zooms to the region and filters/browses the relevant producer set.~~
- [x] ~~Expand the Crete reference layer to **Chania, Rethymno and Lasithi** after the Heraklion interaction is validated.~~
- [x] ~~Define zoom-level behavior so regional context is useful at wider views while producer pins remain primary at closer zoom levels.~~
- [x] ~~Ensure accessibility, keyboard/focus handling, mobile layout, reduced-motion behavior and map performance remain production quality.~~
- [x] ~~Keep regional highlighting informational rather than implying administrative endorsement, producer partnership, route safety or exhaustive coverage.~~
- [x] ~~Design the architecture so later regions such as Nemea, Santorini and Tuscany can use the same interaction model without Greece-specific assumptions.~~
- [x] ~~Run the full automated quality gate, deploy, and complete a production smoke pass before marking Phase 13 complete.~~

**Definition of done:** the map communicates regional terroir and place identity as well as individual producer locations, with Crete, Santorini, Peloponnese, Macedonia, Greece, and Tuscany serving as the verified regional implementation.

---

## Pre-Deployment Intermediate Hotfix — Mobile UX & Map Performance

**Status:** Completed — mobile UI decluttering, progressive disclosure, Leaflet marker diffing and selection isolation, documentation corrections, and preflight verification completed.

> **Deployment Gate:** Production deployment remains gated on verification of this hotfix AND separate resolution of the Supabase PostGIS security issue around `public.spatial_ref_sys` (ticket SU-475614). DO NOT DEPLOY until both gates pass.

- [x] ~~Correct README documentation inaccuracies (clean destination counts, category statistics, Leaflet 1.9.x stack, boundary licensing consistency).~~
- [x] ~~Reduce mobile UI crowding with progressive disclosure (compact Header destination picker, expandable search, progressive FilterBar drawer/sheet, collapsed map controls).~~
- [x] ~~Isolate Leaflet marker diffing from selection in `MapCanvas.tsx` to eliminate marker recreation on select.~~
- [x] ~~Optimize Leaflet CSS by removing blanket `will-change: transform` and providing compact touch pin styling on coarse pointers.~~
- [x] ~~Debounce remote search queries (250ms) to reduce redundant network/filter cycles.~~
- [x] ~~Ensure all touch targets meet or exceed 44×44px on coarse pointers.~~
- [x] ~~Verify automated test suites (`npm run check`, `npm run test:python`, `npm run mobile:preflight -- all`).~~

---

## Phase 14 — Product Value & Monetisation Foundations

**Status:** Active — this is the current product programme.

**Primary objective:** turn the existing verified catalogue and operational travel data into measurable traveler utility, reusable planning workflows, producer intelligence, and regional intelligence **before** deciding what should become a paid product.

**Non-goals for Phase 14:**

- no catalogue expansion;
- no generic AI itinerary generator;
- no automatic route optimization;
- no invented drive times, opening times, road suitability or availability;
- no new booking marketplace;
- no commission model;
- no public Host Pro pricing;
- no Traveler Plus paywall;
- no paid producer ranking;
- no paywall on essential safety/access information;
- no activation of dormant Explorer Pass, QR-pass, chauffeur or public booking flows.

### Phase 14 ownership boundary

**Supabase / data-side work**

- event schema and aggregation model;
- RLS, analytics retention/deletion and reporting behavior;
- privacy-preserving internal reporting views;
- producer/regional aggregate views;
- database-side verification and integrity checks.

**Firebase / Firestore traveler-state work**

- account-owned My Trips persistence;
- trip items referencing canonical producer IDs;
- trip ownership, deletion and account-export behavior;
- consistency with existing Firebase Auth / Firestore traveler state.

**Application / codebase work**

- trusted analytics ingestion endpoint and Firebase-token validation;
- event instrumentation in React/TypeScript;
- My Trips UI and account integration;
- contextual affiliate placement;
- internal admin visualization;
- Producer Insights prototype UI;
- Regional Intelligence prototype UI/report rendering;
- tests, accessibility, build/deploy and production-smoke work.

Do not duplicate routine operational/data migrations into the repository unless the application-facing database contract materially changes.

---

### 14.0 — Baseline, freeze and success criteria

**Purpose:** establish the exact starting point before new behavior is introduced.

- [x] ~~Confirm catalogue expansion remains frozen and no producer/project additions are part of Phase 14.~~
- [x] ~~Record the current production baseline for active producers, regions, categories and audited visitability/access coverage.~~
- [x] ~~Record the current traveler surfaces that can generate measurable intent: producer drawer, favorites, region guide, Passport, direct contact, directions and affiliate banner.~~
- [x] ~~Record current monetisation feature flags and confirm:~~
  - Explorer Pass purchases disabled;
  - display advertising disabled;
  - public Experiences/bookings quarantined;
  - Travelpayouts affiliate pilot is the only active monetisation experiment.
- [x] ~~Define the minimum Phase 14 success questions:~~
  - Which producers/regions generate meaningful traveler intent?
  - Do saves lead to trip planning?
  - Do trip plans lead to direct producer contact or directions?
  - Which affiliate placements are useful rather than distracting?
  - Can producer-level aggregates provide useful operational insight?
  - Can regional aggregates support a credible institutional report?
- [x] ~~Define the minimum production privacy boundary before any behavioral analytics are collected.~~

**Gate 14.0:** do not create production analytics tables or instrument user behavior until the event taxonomy, prohibited fields and retention/deletion principles are written down.

---

### 14.1 — Define the first-party intent event contract

**Purpose:** create one stable event vocabulary shared by Supabase, the frontend and future reporting.

#### 14.1.1 Event taxonomy

Define canonical events, initially limited to meaningful actions:

**Discovery**

- [x] ~~`producer_view`~~
- [x] ~~`producer_share`~~
- [x] ~~`region_open`~~
- [x] ~~`region_producers_view`~~

**Saved intent**

- [x] ~~`producer_save`~~
- [x] ~~`producer_unsave`~~

**Direct producer intent**

- [x] ~~`producer_website_click`~~
- [x] ~~`producer_phone_click`~~
- [x] ~~`producer_email_click`~~
- [x] ~~`directions_click`~~

**Trip intent**

- [x] ~~`trip_created`~~
- [x] ~~`trip_renamed`~~
- [x] ~~`trip_producer_added`~~
- [x] ~~`trip_producer_removed`~~
- [x] ~~`trip_item_reordered`~~
- [x] ~~`trip_day_assigned`~~
- [x] ~~`trip_opened`~~

**Post-visit**

- [x] ~~`passport_stamp_added`~~
- [x] ~~`passport_stamp_removed`~~

**Affiliate**

- [x] ~~`affiliate_impression`~~
- [x] ~~`affiliate_click`~~

Do not add events merely because they are easy to track. Every event must answer a defined product or commercial question.

#### 14.1.2 Allowed event context

- [x] ~~Define a strict allowlist for event metadata.~~
- [x] ~~Allow identifiers/context such as:~~
  - producer ID;
  - region/destination;
  - country;
  - producer category;
  - source surface;
  - affiliate campaign ID;
  - coarse authenticated/anonymous scope;
  - event timestamp.
- [x] ~~Decide whether anonymous sessions require a pseudonymous rotating session ID; avoid persistent cross-site identity.~~
- [x] ~~Keep user/account identifiers out of general aggregate reporting unless required for account-scoped product behavior.~~

#### 14.1.3 Prohibited event content

Explicitly prohibit:

- [x] ~~tasting-note text;~~
- [x] ~~personal trip-note text;~~
- [x] ~~email addresses;~~
- [x] ~~phone numbers;~~
- [x] ~~contact-message contents;~~
- [x] ~~exact free-text search strings if they may contain personal information, unless separately reviewed;~~
- [x] ~~passwords/tokens/secrets;~~
- [x] ~~precise background location;~~
- [x] ~~payment details;~~
- [x] ~~arbitrary serialized component/user objects.~~

#### 14.1.4 Contract documentation

- [x] ~~Create one canonical event-contract document/type shared by implementation and tests.~~
- [x] ~~Define required/optional fields for every event.~~
- [x] ~~Define allowed `source_surface` values.~~
- [x] ~~Define validation behavior for malformed events.~~
- [x] ~~Define deduplication/idempotency behavior where duplicate events would distort metrics.~~

**Gate 14.1:** event names and payload contracts must be frozen enough for both database and frontend implementation before Stage 14.2/14.3 begin.

**Canonical artifact:** `docs/phase14-event-contract-v1.md` — baseline verified and event contract frozen on 2026-09-20.

---

### 14.2 — Build the Supabase intent-measurement foundation

**Purpose:** provide a secure, minimal, queryable first-party measurement layer.

#### 14.2.1 Schema

- [x] ~~Create the canonical event table with a narrow schema.~~
- [x] ~~Separate event identity/time from optional contextual metadata.~~
- [x] ~~Use database constraints or validated enums/checks for canonical event names.~~
- [x] ~~Add only indexes justified by expected aggregate queries.~~
- [x] ~~Do not store redundant producer facts that can be joined from canonical producer data.~~

#### 14.2.2 Security

- [x] ~~Enable RLS before exposing any event-write path.~~
- [x] ~~Ensure travelers cannot read other users' raw events.~~
- [x] ~~Ensure public/anonymous users cannot enumerate raw event data.~~
- [x] ~~Ensure frontend clients cannot forge privileged/admin-only dimensions.~~
- [x] ~~Restrict internal aggregate reporting appropriately.~~
- [x] ~~Verify service-role/admin access remains server-side only.~~

#### 14.2.3 Privacy lifecycle

- [x] ~~Define event retention period.~~
- [x] ~~Define account deletion behavior.~~
- [x] ~~Define whether account export includes raw events, summarized events, or neither based on product/privacy policy.~~
- [x] ~~Define handling for anonymous-session events.~~
- [x] ~~Ensure expired/deleted identity links do not break aggregate reporting unnecessarily.~~
- [x] ~~Document what remains as anonymized aggregate statistics after account deletion, if applicable.~~

#### 14.2.4 Aggregation layer

Create internal aggregates for:

- [x] ~~producer views;~~
- [x] ~~producer saves;~~
- [x] ~~trip additions;~~
- [x] ~~direct website/contact actions;~~
- [x] ~~directions actions;~~
- [x] ~~region engagement;~~
- [x] ~~affiliate impressions/click-through;~~
- [x] ~~time-window trends.~~

Prefer aggregate views/materialized summaries where appropriate rather than giving operational dashboards unrestricted raw-event access.

#### 14.2.5 Verification

- [x] ~~Insert controlled test events.~~
- [x] ~~Verify accepted payloads.~~
- [x] ~~Verify rejected malformed/prohibited payloads.~~
- [x] ~~Verify RLS from anonymous, traveler and privileged contexts.~~
- [x] ~~Verify deletion/retention behavior.~~
- [x] ~~Verify aggregate counts match source events.~~
- [x] ~~Run Supabase security/performance advisors after DDL.~~

**Gate 14.2:** no frontend production instrumentation until RLS, privacy lifecycle and aggregate correctness pass verification.

**Phase 14.2 verification:** completed 2026-09-20. Private `analytics` schema, raw event warehouse, strict contract constraints, RLS/privilege boundaries, 180-day raw retention, 24-month daily aggregates, pg_cron maintenance, service-role-only ingestion/export/deletion RPCs and controlled database tests are implemented. Synthetic test data was removed; production event count remains zero. Supabase advisors were rerun; the Phase-14 affiliate FK index finding was fixed. INFO-level no-policy/unused-index notices on the private zero-row analytics warehouse are expected; pre-existing managed PostGIS/public-extension findings remain separate maintenance work.

**Authoritative implementation record:** `docs/phase14-event-contract-v1.md`. Supabase migration history remains authoritative; routine operational migration SQL is not duplicated into Git.

---

### 14.3 — Instrument the existing product

**Purpose:** measure the existing discovery loop before building a new monetised product.

#### 14.3.1 Producer interaction instrumentation

- [x] ~~Instrument producer detail views without double-counting rerenders.~~
- [x] ~~Instrument save/unsave actions.~~
- [x] ~~Instrument share actions.~~
- [x] ~~Instrument producer website clicks.~~
- [x] ~~Instrument phone actions.~~
- [x] ~~Instrument email actions.~~
- [x] ~~Instrument directions actions.~~
- [x] ~~Include valid source-surface context.~~

#### 14.3.2 Regional interaction instrumentation

- [x] ~~Instrument region-guide opens.~~
- [x] ~~Instrument "view producers on map" actions.~~
- [x] ~~Preserve current region UX and do not add tracking-only UI.~~

#### 14.3.3 Passport instrumentation

- [x] ~~Instrument stamp add/remove actions.~~
- [x] ~~Never send tasting-note contents.~~
- [x] ~~Keep personal notes private and outside analytics payloads.~~

#### 14.3.4 Affiliate baseline instrumentation

- [x] ~~Instrument affiliate impressions.~~
- [x] ~~Instrument affiliate clicks.~~
- [x] ~~Record affiliate campaign ID and source surface.~~
- [x] ~~Do not track destination URLs containing unnecessary personal/query information.~~
- [x] ~~Preserve clear affiliate disclosure.~~

#### 14.3.5 Reliability

- [x] ~~Tracking failures must never break discovery, contact, navigation, favorites or Passport.~~
- [x] ~~Avoid blocking page interaction while analytics requests complete.~~
- [x] ~~Prevent obvious duplicate producer-view/impression events from rerenders.~~
- [x] ~~Add focused automated tests for event dispatch and payload sanitization.~~

#### 14.3.6 Production verification

- [x] ~~Deploy with measurement enabled only after privacy/RLS checks pass.~~
- [x] ~~Perform a controlled production smoke for each event class.~~
- [x] ~~Verify received events in Supabase.~~
- [x] ~~Verify no private note/contact contents are present.~~
- [x] ~~Verify event volumes are plausible rather than duplicated.~~

**Phase 14.3 production verification:** completed 2026-09-21. The current Cloud Run analytics API and Firebase Hosting surface passed production health/smoke checks. Controlled live actions confirmed producer view, save/unsave, website/directions, Passport stamp add/remove, region, and affiliate impression/click flows. Supabase verification confirmed valid pseudonymous identity formats, canonical producer-derived dimensions, unique client event IDs, and no raw columns for private notes/contact payload contents. One unusually share-heavy anonymous session contained unique, time-separated events rather than duplicate IDs; treat that session as low-volume/outlier noise when interpreting the Phase 14.4 baseline.

**Gate 14.3:** COMPLETE — production measurement is active and verified. Collect and interpret the baseline in Phase 14.4 before using intent data to redesign affiliate placement or expose producer/regional insights.

---

### 14.4 — Internal intent dashboard / baseline report

**Purpose:** prove that the measurement layer answers useful questions before building paid-product concepts.

- [x] ~~Add an admin-only internal view/report for aggregate intent.~~
- [x] ~~Show configurable time windows.~~
- [x] ~~Show producer-level aggregate demand signals.~~
- [x] ~~Show region-level aggregate demand signals.~~
- [x] ~~Show category-level aggregate demand signals.~~
- [x] ~~Show the funnel:~~
  - producer view;
  - save;
  - trip addition;
  - direct contact/directions;
  - Passport stamp where measurable.
- [x] ~~Show affiliate impressions and clicks by placement/campaign.~~
- [x] ~~Explicitly label low-volume data to avoid over-interpreting tiny samples.~~
- [x] ~~Do not expose individual traveler identities.~~
- [x] ~~Document which metrics are directional rather than proof of an actual visit/purchase.~~

**Phase 14.4 production verification:** completed 2026-09-21. Firebase Hosting is deployed at commit `4571637`; `/api/health` returns healthy and the admin intent endpoint is live behind Firebase authentication/admin authorization, returning 401 without credentials. The service-role-only aggregate report produces current producer, region, category, funnel and affiliate metrics with 7/30/90/180-day windows, low-volume labeling and no traveler identity exposure. The 30-day baseline remains intentionally small and directional.

**Gate 14.4:** COMPLETE — the event system produces interpretable aggregate data and is suitable as a foundation for later internal Producer Insights and Regional Intelligence work.

---

### 14.5 — Design the My Trips domain model

**Purpose:** define the missing product layer between Saved and Passport.

#### 14.5.1 Core trip model

- [x] ~~Define account-owned `trips`.~~
- [x] ~~Define `trip_items` referencing existing producer IDs.~~
- [x] ~~Support trip name/title.~~
- [x] ~~Support optional date/date-range without requiring it.~~
- [x] ~~Support manual ordering.~~
- [x] ~~Support optional day buckets/day numbers.~~
- [x] ~~Support created/updated timestamps.~~
- [x] ~~Decide whether one producer may appear more than once in a trip; default to one occurrence unless a real use case requires otherwise.~~
- [x] ~~Decide behavior when a producer becomes inactive after being added to a trip.~~

#### 14.5.2 Security and account lifecycle

- [x] ~~Ensure travelers can read/write only their own trips.~~
- [x] ~~Include trips in account deletion.~~
- [x] ~~Include appropriate trip data in account export.~~
- [x] ~~Define guest behavior:~~
  - [x] ~~either signed-in only initially;~~
  - [x] ~~or local guest draft with explicit later migration.~~
- [x] ~~Do not silently merge guest trips into an account without a deliberate migration rule.~~

#### 14.5.3 Integrity

- [x] ~~Foreign-key/reference trip items to canonical producers where technically appropriate.~~
- [x] ~~Prevent invalid producer IDs from entering a trip.~~
- [x] ~~Ensure ordering updates are atomic enough to avoid duplicate/unstable positions.~~
- [x] ~~Define maximum practical trip/item limits if needed for abuse protection, not monetisation.~~

#### 14.5.4 Trip event integration

- [x] ~~Emit the canonical trip events from 14.1.~~
- [x] ~~Never put private trip notes into event payloads.~~

**Phase 14.5 production verification record — 2026-09-21:** The authoritative scenario/domain contract is in `docs/phase14-my-trips-domain-contract-v1.md`. Trusted API persistence, optimistic revisions, canonical producer validation, account export/deletion coverage, owner-read/server-write Firestore rules, practical limits (25 trips, 50 stops/trip) and frozen trip analytics support are implemented and verified in production. Private Supabase publication tombstone enforcement prevents opted-out/delisted producers from being reactivated.

**Gate 14.5:** COMPLETE — trip persistence, ownership and deletion/export behavior are fully verified.

---

### 14.6 — Build free My Trips V1

**Purpose:** make verified data useful for actual trip preparation without introducing route-generation or payment complexity.

#### 14.6.1 Entry points

- [x] ~~Add "Add to trip" from producer detail.~~
- [x] ~~Add trip access from the signed-in traveler menu.~~
- [x] ~~Allow creation of a trip during the add flow without losing the current producer context.~~
- [x] ~~Keep Favorites separate from Trips; a saved producer is not automatically assigned to a trip.~~

#### 14.6.2 Trip workspace

- [x] ~~Show trip title/date context.~~
- [x] ~~Show included producers.~~
- [x] ~~Support manual reorder.~~
- [x] ~~Support optional day assignment.~~
- [x] ~~Support remove-from-trip.~~
- [x] ~~Support direct opening of the producer drawer from the trip.~~
- [x] ~~Preserve mobile usability.~~

#### 14.6.3 Trip readiness

For each producer, derive a readiness summary only from verified/current TerroirTrail data:

- [x] ~~location confidence;~~
- [x] ~~visit status;~~
- [x] ~~booking requirement;~~
- [x] ~~walk-in status where known;~~
- [x] ~~visitor hours where current;~~
- [x] ~~evidence freshness/review timestamp where useful;~~
- [x] ~~direct producer contact;~~
- [x] ~~parking where known;~~
- [x] ~~road/access classification/caution where verified;~~
- [x] ~~explicit unknown/not-confirmed state.~~

#### 14.6.4 Safety rules

- [x] ~~Preserve all existing fail-closed navigation behavior.~~
- [x] ~~Do not infer road safety from coordinates or map routing.~~
- [x] ~~Do not invent travel times.~~
- [x] ~~Do not optimize producer order into a route.~~
- [x] ~~Do not claim a producer is open on a planned date unless current evidence explicitly supports that inference.~~
- [x] ~~Do not claim booking availability.~~
- [x] ~~Keep safety/access facts free.~~

#### 14.6.5 V1 scope control

Do **not** add in V1:

- [x] ~~checkout;~~
- [x] ~~paid trip limits;~~
- [x] ~~AI itinerary generation;~~
- [x] ~~automatic routing;~~
- [x] ~~collaborative editing;~~
- [x] ~~accommodation booking;~~
- [x] ~~live availability;~~
- [x] ~~producer reservation requests.~~

#### 14.6.6 QA

- [x] ~~Test create/rename/delete trip.~~
- [x] ~~Test add/remove producer.~~
- [x] ~~Test duplicate-add behavior.~~
- [x] ~~Test reorder/day assignment.~~
- [x] ~~Test account isolation.~~
- [x] ~~Test inactive/missing producer behavior.~~
- [x] ~~Test mobile.~~
- [x] ~~Test offline/failure state.~~
- [x] ~~Test event instrumentation.~~
- [x] ~~Run full quality gate and production smoke.~~

**Phase 14.6 closeout verification checkpoint — 2026-09-21:** Free My Trips V1 verification gaps closed: fail-closed catalogue offline handling implemented (`catalogueIsLive === false` suppresses fallback facts while preserving structural trip stops), drawer opening from trip workspace correctly attributes `trip_workspace`, directions link clicks instrumented with `directions_click` (`trip_workspace`), expandable visit readiness details expose full audit status and direct producer contact, partial-failure retry in AddToTripModal preserves created trips without duplicate creation, and user-facing HTML entities cleaned. Final reviewed contract edges closed: `no_longer_listed` status maintains precedence over catalogue outage (`catalogueIsLive === false`), and ambiguous add-to-trip mutations authoritatively reconcile via `getTrip` (confirming addition without duplicate mutations, updating fresh revisions upon absence for safe retry, and providing explicit reload controls on unconfirmed outcomes).

**Gate 14.6:** COMPLETE — Free My Trips V1 is verified and production-ready with all reviewed contract edges closed.

---

### 14.6A — Organic Discovery Foundation (SEO + AEO + GEO)

**Purpose:** make the existing verified catalogue discoverable through non-brand search and usable as a source for answer/generative engines before expanding monetisation.

**Baseline — 2026-09-21**

- Search Console, last 28 settled days: **7 clicks / 29 impressions**, with current page visibility attributable to the homepage.
- Live sitemap: **234 URLs**.
- Sitemap URLs with Search Console visibility in the baseline window: **1 / 234**.
- Google URL Inspection: homepage **Submitted and indexed**; sampled producer directory, producer entity, Crete destination and Crete wineries pages were **URL is unknown to Google**.
- Sitemap was newly submitted and pending with **0 warnings / 0 errors** at baseline.

#### 14.6A.1 Discovery/indexation foundation

- [x] ~~Keep the normal app `#root` empty until React mounts; retain discovery through the sitemap, canonical static landing pages, rendered app navigation and the genuine no-JavaScript fallback without a visible preload SEO page.~~
- [x] ~~Preserve canonical producer, destination, category, region and country pages.~~
- [x] ~~Add a build-time internal-link graph check so important sitemap URLs cannot become orphans.~~
- [x] ~~Keep sitemap deterministic and free of query-state/private app URLs.~~
- [x] ~~Publish a public verification methodology page and link it throughout the entity graph.~~

#### 14.6A.2 Search-intent landing pages

- [x] ~~Align destination/category page titles and H1s with natural intents such as **Wineries in Crete**, **Olive mills in Crete**, and **Dairies / cheesemakers in Crete** where real catalogue depth supports them.~~
- [x] ~~Keep the existing minimum catalogue thresholds; do not manufacture thin keyword permutations.~~
- [x] ~~Add direct catalogue-derived planning answers and per-producer planning snapshots for visitability, booking, walk-ins, location confidence and road-access evidence.~~
- [x] ~~Reuse human-written terroir context instead of generic generated travel copy.~~

#### 14.6A.3 AEO/GEO trust layer

- [x] ~~Make answer-first content visible in canonical HTML.~~
- [x] ~~Preserve **UNKNOWN != FALSE** in all aggregate and per-producer answers.~~
- [x] ~~Keep structured data aligned with visible facts; do not invent producer logos or special “AI SEO” schema.~~
- [x] ~~Keep `llms.txt` supplemental while canonical HTML remains the source of truth.~~
- [x] ~~Keep major search/answer-engine crawlers allowed.~~

#### 14.6A.4 Distribution readiness

- [x] ~~Publish an IndexNow verification key file without adding long-lived secrets.~~
- [x] ~~Configure IndexNow after production verification: submit only a small priority URL batch after successful SEO/catalogue-relevant production changes, never all sitemap URLs on every deploy.~~
- [x] ~~Establish Search Console page/query/indexation tracking for the new landing clusters.~~

**Gate 14.6A:** implementation must pass the normal quality gate and production deployment. Immediate Google indexing is not a deployment gate because crawling/indexation is asynchronous; success is measured over time by sitemap discovery, indexed pages, non-brand query impressions/clicks and answer-engine referrals/citations.

---

### 14.6B — My Trips Product Closeout

**Purpose:** finish the existing free My Trips experience as a polished traveler product before producer-partner or subscription work begins. Keep the verified V1 persistence/security contract unchanged.

- [x] ~~Add a trip overview map that plots only current verified producer locations from the live catalogue.~~
- [x] ~~Number/day-label mapped trip stops without drawing routes, estimating drive times, or inferring road suitability.~~
- [x] ~~Add a trip-level readiness summary with explicit `Ready`, `Contact first`, `Information gap`, and unavailable states derived only from current evidence.~~
- [x] ~~Add an expandable preparation checklist explaining the operational reason for each stop state.~~
- [x] ~~Show calendar dates alongside Day 1 / Day 2 labels when the trip has a start date.~~
- [x] ~~Preserve fail-closed behavior during catalogue outages and for delisted/unavailable producers.~~
- [x] ~~Re-verify trip-open, producer-add, direct-contact, and directions analytics without treating planning actions as bookings or visits.~~
- [x] ~~Run the full repository quality gate and responsive browser smoke.~~
- [x] ~~Deploy and verify the completed workspace in production before freezing the free My Trips core.~~

**Non-goals:** no automatic routing, travel-time estimates, live availability, booking requests, collaboration, paid trip limits, AI itinerary generation, print/export, or advanced offline packs.

**14.6B production verification — 2026-09-23:** merged in commit `b13429e` via PR #23. Main Quality Gate run **753** passed. Production Deploy run **31** passed synchronized catalogue verification, the full repository gate, responsive browser smoke, final frontend build, Firestore deployment, Cloud Run deployment/health, Firebase Hosting deployment, Firebase API rewrite health, public production smoke, production UI smoke, and deployed catalogue-hash verification. The trip persistence/security contract was not changed.

**Gate 14.6B:** COMPLETE — the free My Trips core is frozen. Advanced collaboration, export/offline packs, premium planning, or other paid trip capabilities require a later Traveler Plus decision rather than reopening V1.

---

### 14.7 — Contextual affiliate utility

**Purpose:** move affiliate monetisation from generic interruption toward relevant trip-preparation utility.

#### 14.7.1 Establish baseline

- [x] ~~Measure current map-banner impressions/clicks before major placement changes.~~
- [x] ~~Record performance by campaign.~~
- [x] ~~Identify placements with high impressions but negligible useful engagement.~~

**14.7.1 baseline — 2026-09-21:** first-party affiliate analytics began recording on 2026-09-21. The only active affiliate surface was `map_affiliate_banner`, with **216 qualified impressions / 1 click (0.46% CTR)** across **13 impression sessions**. Campaign breakdown: Klook Experiences **67 / 1 (1.49%)**; Localrent Cars **44 / 0**; Welcome Pickups **39 / 0**; GetTransfer Rides **35 / 0**; Yesim eSIM **31 / 0**. The four zero-click campaigns are the current negligible-engagement observations, but this is a low-volume Day-0 baseline and is **not decision-grade evidence to remove or rank campaigns**. Use it only as the pre-contextual-placement comparison point for 14.7.4.

#### 14.7.2 Define allowed contextual surfaces

Candidate contexts:

- [x] ~~trip preparation;~~
- [x] ~~destination/region planning;~~
- [x] ~~transport preparation;~~
- [x] ~~connectivity preparation.~~

Potential categories:

- [x] ~~car rental;~~
- [x] ~~transfers;~~
- [x] ~~eSIM/connectivity.~~

**14.7.2 placement decision — 2026-09-21:** keep the frozen analytics vocabulary and use only `trip_preparation` and `region_planning` as contextual affiliate source surfaces. Transport preparation is represented within trip preparation using car-rental and transfer offers; connectivity preparation may appear in trip or region planning using eSIM offers. Do not place affiliate utility inside producer cards/drawers or safety/access evidence. The contextual pilot should use a small number of non-rotating, context-matched offers rather than the current generic rotating banner. Generic third-party activity marketplaces such as Klook remain outside this pilot because they can overlap with TerroirTrail's producer-first experience proposition.

Treat generic third-party activity marketplaces separately because they may conflict with TerroirTrail's producer-first positioning.

#### 14.7.3 Placement rules

- [x] ~~Affiliate blocks must be clearly labeled.~~
- [x] ~~Affiliate participation must never affect producer ordering/ranking.~~
- [x] ~~Do not insert affiliate CTAs into safety/access warnings.~~
- [x] ~~Avoid placing commercial content between a warning and its source/evidence.~~
- [x] ~~Prefer a small number of contextually relevant offers over rotating unrelated offers.~~

#### 14.7.4 Experiment and decision

- [ ] Compare contextual placement against map-banner baseline.
- [ ] Measure click-through and downstream usefulness where available.
- [ ] Remove low-value campaigns.
- [ ] Decide whether the primary-map sponsor banner should be reduced or retired.

**Gate 14.7:** affiliate placement is judged by relevance and user utility, not impression volume alone.

---

### 14.8 — Internal Producer Insights prototype

**Purpose:** validate which producer-facing intent signals are useful as campaign proof and operational context. Producer Insights is supporting infrastructure for paid distribution/visibility, not the primary producer product unless later evidence proves otherwise.

#### 14.8.1 Define producer metrics

Candidate metrics:

- [x] ~~profile views;~~
- [x] ~~saves;~~
- [x] ~~trip additions;~~
- [x] ~~website clicks;~~
- [x] ~~phone actions;~~
- [x] ~~email actions;~~
- [x] ~~directions actions;~~
- [x] ~~aggregate region/category comparison where sample size is sufficient;~~
- [x] ~~time trends.~~

**Metric contract — 2026-09-21:** producer metrics use first-party intent aggregates only. Time trend means the selected reporting window versus the immediately preceding equal-length window. Region/category context is descriptive, never a ranking, and is withheld unless the comparison contains at least **5 active producers and 100 producer views**.

**Founder Insights V1 required metric set — 2026-09-21:**

- **Reach:** profile views and unique visitor sessions.
- **Audience:** visitor country (coarse country-level only) and interface/browser language.
- **Acquisition:** how the producer was discovered, using coarse source/channel categories rather than raw referral URLs.
- **Planning:** saves and trip additions.
- **Intent:** website clicks, phone actions, email actions and directions actions.
- **Trend:** reporting-period time series and comparison with the immediately preceding equal-length period.
- **Optional/future only after validation:** planning lead time, seasonality detail, booking-page conversion, returning-interest cohorts, device detail, sub-country geography and other segmentation.

**Current instrumentation gap:** action/planning/source-surface metrics and equal-window trends exist. Unique-session reporting is derivable from pseudonymous session keys but is not yet exposed in Producer Insights. Visitor country, visitor language and external acquisition channel are **not currently collected** and must not be inferred from the existing producer `country_code`. They require a separate privacy-reviewed instrumentation decision before collection.

**Audience privacy rule:** never expose IP addresses or individual traveler geography. Country/language/source segments must be aggregate-only; small segments must be suppressed or grouped into `Other`. Do not describe coarse network geography as nationality.

#### 14.8.2 Privacy and trust constraints

- [x] ~~No individual traveler identities.~~
- [x] ~~No private trip contents.~~
- [x] ~~No tasting-note contents.~~
- [x] ~~No claim that a click equals a booking or visit.~~
- [x] ~~No ranking boost tied to metrics or payment.~~
- [x] ~~Do not expose tiny demographic/segment counts that could identify individuals.~~

#### 14.8.3 Internal prototype

- [x] ~~Build admin-only producer insight view first.~~
- [x] ~~Validate metric definitions and consistency.~~
- [x] ~~Test whether metrics remain understandable at low traffic.~~
- [x] ~~Identify which metrics a verified Host could reasonably act on.~~

**14.8 internal prototype — 2026-09-21:** deployed at `f82d53c`. The admin view separates discovery signals (views, saves, trip additions) from operational outbound actions (website, phone, email, directions), shows equal-window movement without manufacturing conversion claims, warns on very small producer samples, and suppresses region/category context below the comparison threshold. Supabase reporting remains server-only: `anon` and `authenticated` cannot execute the reporting RPC. Quality Gate `35600911485` and Production Deploy `35601089359` both passed. These metrics are candidate Host-useful signals only; repeatable value still requires 14.8.4 producer validation.

#### 14.8.4 Commercial-role decision

- [x] ~~Do not make analytics the primary producer value proposition.~~
- [x] ~~Retain the internal prototype as the measurement/reporting foundation for future Partner campaigns.~~
- [x] ~~Move producer-facing willingness-to-pay validation to the real Phase 15 Partner product, where metrics can be shown as proof of paid distribution rather than sold as a standalone dashboard.~~
- [x] ~~Keep standalone producer workflow software as a later option only if producers demonstrate a separate repeatable need.~~

**14.8 direction decision — 2026-09-23:** Producer Insights remains internal/supporting infrastructure. The producer commercial core is now paid distribution/visibility; campaign reporting will reuse the existing reach/planning/intent aggregates and dedicated Partner attribution added in Phase 15.

**Gate 14.8:** COMPLETE for Phase 14 — do not create an analytics-first Producer Pro product. Use these metrics to support future Partner campaign reporting.

---

### 14.9 — Internal Regional Intelligence prototype

**Purpose:** test an institutional B2B revenue line using the data already collected. Regional Intelligence remains strategically useful, but it is separate from the producer-paid Partner/visibility product.

#### 14.9.1 Supply/readiness metrics

Build regional aggregates for:

- [x] ~~audited producer count;~~
- [x] ~~category coverage;~~
- [x] ~~verified-location coverage;~~
- [x] ~~public/seasonal/appointment-only visitability;~~
- [x] ~~booking-policy coverage;~~
- [x] ~~visitor-hours coverage;~~
- [x] ~~road/access review coverage;~~
- [x] ~~parking evidence coverage;~~
- [x] ~~visitor-language evidence coverage;~~
- [x] ~~evidence freshness;~~
- [x] ~~reviewed-unknown coverage;~~
- [x] ~~direct-contact coverage.~~

#### 14.9.2 Demand/intent metrics

Once enough Stage 14.3 data exists:

- [x] ~~producer views by region;~~
- [x] ~~saves by region;~~
- [x] ~~trip additions by region;~~
- [x] ~~direct producer actions by region;~~
- [x] ~~directions actions by region;~~
- [x] ~~category demand within region;~~
- [x] ~~affiliate/travel-preparation engagement where meaningful.~~

Demand/category comparisons are withheld below **100 regional producer views**. Destination-context affiliate conclusions are withheld below **100 impressions**.

#### 14.9.3 Reporting

- [x] ~~Build an admin-only regional report first.~~
- [x] ~~Make the reporting period explicit.~~
- [x] ~~Make curated/non-exhaustive coverage explicit.~~
- [x] ~~Separate supply/readiness from traveler-demand metrics.~~
- [x] ~~Avoid scoring a region with a single opaque "quality score".~~
- [x] ~~Prefer auditable component metrics.~~
- [ ] Create export/print output only after the on-screen report is correct.

**14.9 internal prototype — 2026-09-21:** deployed at `a95bd81`. Quality Gate `35605792382` and Production Deploy `35606010679` both passed. The report uses current audited catalogue state for supply/readiness and explicit reporting windows for traveler intent. It remains an internal validation tool; no standalone B2B portal or commercial packaging is justified before 14.9.4 external validation.

#### 14.9.4 External validation

Potential future validation audiences include:

- regional/municipal tourism bodies;
- local development organizations;
- producer associations;
- chambers;
- geoparks/heritage organizations where relevant.

- [ ] Validate which metrics they actually need.
- [ ] Identify whether they value recurring monitoring, one-off audits, embeds, reports or data export.
- [ ] Do not promise exhaustive regional coverage unless the catalogue truly is exhaustive.

**Gate 14.9:** do not build a standalone B2B portal until the internal report has been reviewed with real potential institutional users.

---

### 14.10 — Paid-product validation and Phase 14 closeout

**Purpose:** decide what deserves commercial development based on evidence collected in Phase 14.

#### Validation / build order

1. **Contextual affiliates** — finish the current placement experiment and decide whether the generic map banner should remain.
2. **Producer Partner / paid visibility** — build the controlled commercial-partnership and campaign-distribution layer on top of existing Host ownership, My Trips and first-party intent analytics.
3. **B2B Regional Intelligence / regional contracts** — continue external validation as an institutional revenue line.
4. **Traveler premium planning** — only after free My Trips usage demonstrates demand for advanced convenience.
5. **Standalone producer workflow software** — only if producer validation identifies a problem beyond visibility/distribution.
6. **Booking/transaction commission** — much later, if ever, and only after explicit Experiences/booking activation.

#### Required decision package

Before closing Phase 14:

- [ ] Summarize real usage of discovery, saves, trips, direct actions and affiliates.
- [ ] Summarize My Trips adoption and repeat use.
- [ ] Record the Producer Insights direction decision: supporting campaign/reporting infrastructure, not the primary producer product.
- [ ] Summarize Regional Intelligence validation.
- [ ] Record the chosen next commercial build: Producer Partner / paid visibility, with actual willingness-to-pay tested through the functioning Phase 15 product.
- [ ] Keep Regional Intelligence external validation as a parallel institutional workstream rather than a blocker for building the producer Partner foundation.
- [ ] Explicitly record products **not** being pursued.
- [ ] Decide whether existing Explorer Pass/Stripe entitlement code should be:
  - retained dormant;
  - generalized into reusable entitlements;
  - or removed later.
- [ ] Keep essential safety/access data outside any paid boundary.
- [ ] Update Phase 18 commercial priorities from evidence rather than assumptions.

**Phase 14 definition of done:** TerroirTrail has a secure first-party intent-measurement layer, a production-quality free My Trips workflow, measured/contextual affiliate utility, internal Producer Insights and Regional Intelligence foundations, and a documented commercial direction: producer-paid distribution/visibility is the next product to build without weakening the trust layer.

---

## Phase 15 — Producer Partner & Paid Visibility

**Status:** Next commercial build after the short Phase 14.7 affiliate decision.

**Objective:** create a real producer-paid distribution product inside TerroirTrail. Independent producers remain discoverable for free; verified Hosts may enter an explicit commercial Partner relationship that buys additional clearly labelled distribution to relevant travelers without changing organic ranking, verification, visitability or safety/access truth.

**Core proposition:**

> **Free to be discovered. Pay to reach more relevant travelers.**

**Commercial boundary:**

- organic catalogue/map/search visibility remains independent of payment;
- paid status never changes verification, location confidence, visitability, road/access evidence or editorial ranking;
- paid placement is always visually distinguishable from organic/editorial discovery;
- factual Host corrections remain free;
- Partner reporting measures campaign exposure and downstream intent, not bookings/visits unless those are later explicitly measured.

### 15.1 — Define Partner, subscription and campaign contracts

- [x] ~~Define formal relationship states:~~
  1. independent researched listing;
  2. verified Host managing factual/listing content;
  3. commercial Partner with an active/eligible paid distribution entitlement;
  4. Partner with approved Experiences only if Phase 16 is later activated.
- [x] ~~Keep commercial Partner state separate from Host ownership, verification and catalogue publication state.~~
- [x] ~~Define Partner lifecycle separately from subscription billing state: `pending → active ↔ suspended → ended`, with `ended → pending` as the deliberate re-entry path.~~
- [x] ~~Define subscription lifecycle: `pending → active → past_due/grace → cancelled/expired`; exact Stripe webhook transitions remain for 15.8.~~
- [x] ~~Define promotion campaign lifecycle: `draft → awaiting_review → approved → scheduled/active → paused/completed/withdrawn`, with rejected campaigns allowed back to draft.~~
- [x] ~~Define campaign fields: producer ID, campaign ID, campaign type, allowed placement(s), canonical destination/category context, start/end dates, creative/message payload, status and audit timestamps.~~
- [x] ~~Decide V1 will not use a transferable/spendable credit ledger. Any initial annual campaign allowance is a simple plan entitlement/count, defined with Stripe packaging in 15.8 rather than an auction/bidding system.~~
- [x] ~~Define termination/suspension behavior so commercial state can end without removing or demoting the free producer listing.~~

**15.1 contract — 2026-09-23:** recorded in `docs/phase15-partner-commercial-contract-v1.md`. Firebase/Firestore remains the trusted Host-ownership authority; Supabase stores commercial Partner/subscription/campaign state; the Cloud Run API is the only bridge between them.

### 15.2 — Define the first paid product

Start deliberately narrow:

**TerroirTrail Partner — annual subscription**

V1 value may include:

- [ ] eligibility for approved Featured Partner distribution;
- [ ] a fixed annual allocation of promotion credits or campaigns;
- [ ] regional discovery placement;
- [ ] contextual My Trips placement;
- [ ] seasonal/open-day promotion eligibility;
- [ ] campaign result reporting;
- [ ] future Experience-publishing eligibility only after Phase 16 activation.

Do **not** include:

- [ ] paid organic ranking;
- [ ] paid verification;
- [ ] paid access/safety facts;
- [ ] arbitrary demographic targeting;
- [ ] self-serve bidding/CPM/CPC controls;
- [ ] unsupported claims about visits, bookings or revenue.

Pricing is a hypothesis until real paid usage exists. Initial checkout may use one annual Partner price plus a small number of fixed campaign add-ons; do not build a complex ad-rate card first.

### 15.3 — Build trusted commercial data and entitlement authority

- [x] ~~Create server-trusted commercial Partner/subscription records; do not reuse legacy client-facing `isProTier` as authority.~~
- [x] ~~Create campaign records with admin-controlled approval/status.~~
- [x] ~~Reserve Stripe customer/subscription identifiers only in the trusted commercial layer; browser roles have no direct table access.~~
- [ ] Define the final paid-entitlement source of truth and cache behavior when Stripe Checkout is connected.
- [ ] Define and implement idempotent Stripe activation/cancellation updates.
- [ ] Complete subscription-state audit writes when the Stripe webhook lifecycle is implemented; Partner and campaign audit writes are already active.
- [x] ~~Ensure ordinary producer read paths omit Stripe provider identifiers and other unnecessary billing metadata.~~

**15.3 Block A foundation — 2026-09-23:** Supabase migration `20260923055613_phase15_partner_commercial_authority` created service-role-only RLS-protected Partner, subscription, campaign, placement and audit records plus atomic Partner/campaign lifecycle RPCs. Trusted Host/Admin API routes were added without any public placement or checkout activation.

### 15.4 — Build first paid distribution surfaces

V1 should use only a small number of useful surfaces.

#### Regional discovery

- [x] ~~Add a clearly labelled `Featured Partner · Paid placement` module in appropriate destination/region discovery.~~
- [x] ~~Keep the normal producer ordering/list/map unchanged.~~
- [x] ~~Show a Partner only where the campaign's canonical destination/category context is relevant.~~

#### My Trips

- [x] ~~Add a clearly labelled contextual Partner suggestion inside My Trips/trip preparation.~~
- [x] ~~Use trip destination context rather than behavioral profiling unrelated to the trip.~~
- [x] ~~Keep paid placement outside safety/access warnings and their evidence.~~
- [x] ~~Do not imply the suggested Partner is required, safer or editorially preferred.~~

#### Seasonal / temporary promotion

- [x] ~~Support a small approved `seasonal_notice` campaign type for real producer announcements such as open days or harvest periods.~~
- [x] ~~Require campaign review/approval before public activation.~~
- [x] ~~Keep campaign copy separate from canonical visitability truth.~~

**15.4 Block B — 2026-09-23:** regional and My Trips placements are live in code with explicit paid disclosure, fail-closed active-campaign serving, no organic-rank mutation and no real campaign rows seeded.

### 15.5 — Add campaign attribution to first-party analytics

Do not misuse affiliate events.

- [x] ~~Extend the event contract with dedicated Partner promotion events: `partner_impression`, `partner_open`, `partner_save`, `partner_trip_add`, and `partner_contact_action`.~~
- [x] ~~Include validated campaign ID, producer ID, placement/source surface and database-derived destination/category context.~~
- [x] ~~Preserve privacy rules: no private trip notes, message contents, PII or precise background location.~~
- [x] ~~Deduplicate qualified impressions by pseudonymous session in the Partner daily aggregate.~~
- [x] ~~Keep paid-distribution actions in a separate Partner aggregate instead of inflating organic producer metrics.~~

**15.5 Block B — 2026-09-23:** production migration `20260923062004_phase15_partner_campaign_attribution` added the dedicated attribution fields, active-campaign validation, hourly Partner aggregate and v2 ingestion bridge while preserving legacy event traffic.

### 15.6 — Extend the existing Host Portal

Do not create a second producer application.

- [x] ~~Add a Promotions tab to the existing trusted Host Portal.~~
- [x] ~~Show Partner and subscription state without exposing Stripe provider identifiers.~~
- [x] ~~Show campaign lifecycle state for the selected owned producer.~~
- [x] ~~Keep V1 credits absent for now; the product contract deliberately does not use a transferable/spendable credit ledger.~~
- [x] ~~Show simple campaign results: qualified impressions, profile opens, saves, trip additions and attributed website/phone/email/directions actions.~~
- [x] ~~Label low-volume results and state explicitly that intent actions are not confirmed bookings, visits or revenue.~~
- [x] ~~Keep factual listing/visitor information controls available without Partner status.~~

**15.6 Block C — 2026-09-23:** Host reporting is read-only and ownership-scoped through the trusted Cloud Run API. Results are sourced from the separate Partner aggregate.

### 15.7 — Build admin campaign controls

- [x] ~~Let trusted Admin create/edit/review/schedule/activate/pause/complete/withdraw Partner campaigns.~~
- [x] ~~Let Admin inspect Partner eligibility, activation source and subscription state.~~
- [x] ~~Require the campaign lifecycle to pass through approval before public activation.~~
- [x] ~~Require Admin review context and show an explicit warning to compare promotional copy with canonical visitor facts before activation.~~
- [x] ~~Expose the trusted commercial audit trail in Admin controls.~~
- [x] ~~Add paid-placement preview before activation; editing is restricted to draft/rejected states.~~

**15.7 Block C — 2026-09-23:** production migration `20260923064747_phase15_partner_host_admin_commercial` added service-role Host reporting and pre-public campaign editing. Admin/Host UI remains separate from verification and organic ranking.

### 15.8 — Stripe Checkout V1

Build real billing, but keep it narrow.

- [x] ~~Define/create the one initial annual Partner Stripe Product/Price for V1.~~ **Created clean live product `TerroirTrail Partner — Annual` at €199/year (`price_1UIkraPTLRkIE3byfmvTRhAt`); the legacy Featured Producer product remains quarantined.**
- [x] ~~Keep campaign add-ons out of the first billing implementation; add them only if real pilot usage justifies them.~~
- [x] ~~Build hosted Stripe Checkout launch from the verified Host Portal, behind a strict server-side feature gate and configured annual Price ID.~~
- [x] ~~Keep secret keys, customer IDs, Price authority and privileged Stripe calls server-side.~~
- [x] ~~Process subscription state from verified Stripe webhooks, never browser assertions or checkout redirects.~~
- [x] ~~Implement webhook idempotency and stale/out-of-order event rejection in trusted Supabase authority.~~
- [x] ~~Handle activation, cancellation/expiry, renewal failure grace and successful payment recovery; hourly grace expiry ends paid entitlement automatically.~~
- [x] ~~Provide Stripe Customer Portal billing management from the existing Host Portal without exposing customer IDs to the browser.~~
- [x] ~~Ensure ended Stripe entitlement transitions the commercial Partner relationship to `ended`, which triggers automatic paid-campaign withdrawal while leaving the free producer listing untouched.~~
- [x] ~~Keep bidding, per-impression auctions, advertiser audiences and a general-purpose ad manager out of V1.~~
- [x] ~~Configure and verify the live webhook endpoint/event subscriptions for Partner Billing.~~ Production webhook is configured for the approved Partner billing events; its signing secret is stored in Google Secret Manager and a signed Cloud Run probe succeeded.
- [x] ~~Pin `STRIPE_PARTNER_ANNUAL_PRICE_ID` into Cloud Run deployment configuration while explicitly keeping `STRIPE_PARTNER_BILLING_ENABLED=false`.~~
- [x] ~~Enable `STRIPE_PARTNER_BILLING_ENABLED=true` in Cloud Run only after live webhook verification, the completed sandbox billing E2E, and an explicit production-launch decision.~~ **Production launch approved on 2026-09-23; the deploy workflow is configured to enable the gate from the production repository variable while Explorer Pass checkout stays disabled.**
- [x] ~~Verify the real Stripe sandbox Partner billing contract end-to-end before producer launch.~~ `npm run stripe:e2e:sandbox` now creates a real hosted Checkout Session and €199/year sandbox subscription, replays actual Stripe subscription events through signed webhook verification, and proves activation → cancellation-at-period-end → entitlement expiry without touching live billing.

**15.8 Block D — 2026-09-23:** trusted Stripe authority migrations `20260923070927_phase15_partner_stripe_authority` and `20260923071920_phase15_partner_stripe_event_ordering` add service-role-only webhook idempotency, entitlement mapping, bounded payment-recovery grace, stale event protection and automatic expiry. Application code uses hosted subscription Checkout, Customer Portal and signed webhook processing. PR #29 passed the complete Quality Gate plus responsive browser smoke, merged to `main`, and Production Deploy #47 completed successfully. The clean live `TerroirTrail Partner — Annual` product/price is now pinned at €199/year. The production webhook is configured and its signing-secret path has been verified end-to-end. The default live Customer Portal is saved with invoice history, payment-method updates, customer detail updates and cancellation at period end. The production-launch decision was made on 2026-09-23: Partner Checkout is enabled only for approved Hosts with trusted producer ownership; Explorer Pass checkout remains disabled. Production deployment reproduces `APP_URL`, the Partner Price ID, the repository-controlled billing gate and both Stripe Secret Manager bindings.

**15.8 Production launch readiness — 2026-09-23:** Partner self-service is intentionally post-claim: only a Host with an Admin-approved trusted producer ownership assignment can reach Checkout. The Host Portal now surfaces the €199/year Partner subscription after approval, while pending claims remain unable to pay. Live Stripe Tax is active with the Partner Product classified as Website Advertising (`txcd_10701000`); hosted Checkout requests Automatic Tax, business tax-ID collection and billing-address collection. Explorer Pass checkout remains disabled.

**15.8 Sandbox E2E — 2026-09-23:** a dedicated Stripe general sandbox now validates the Partner billing contract without moving real money. The reproducible `stripe:e2e:sandbox` test uses the real checkout service to create and retrieve a hosted subscription Checkout Session, then creates a real sandbox subscription with the same authoritative Partner metadata, replays actual Stripe subscription events through signed webhook verification, and verifies active entitlement, cancellation-at-period-end state and final expiry. Stripe-hosted Checkout UI is intentionally not browser-automated; the first genuine producer subscription should be monitored as production validation rather than used as a sacrificial self-purchase.

**Legacy payment quarantine follow-up — 2026-09-23:** live Stripe audit found three active legacy Payment Links despite the corresponding products being dormant in TerroirTrail: the €199/year Featured Producer partnership, the €29.99/year Explorer Pass, and the €14.99 one-time Explorer Pass. All three Payment Links were deactivated; Stripe reported zero subscriptions. A second trust gap was found in the server API: `POST /api/passes/checkout` could still create Explorer Pass Checkout Sessions for authenticated callers even while the UI feature flag was false. The checkout service now requires the separate server-only `EXPLORER_PASS_CHECKOUT_ENABLED=true` gate and otherwise fails closed. Historical pass lookup/verification remains available.

### 15.8A — Traveler convenience passes and B2C commercial validation

Producer Partner infrastructure remains available, but producer outreach is deferred until TerroirTrail can demonstrate meaningful traveler utility and intent. The immediate commercial product is therefore an optional traveler convenience layer that never paywalls producer discovery or trust/safety facts.

- [x] Define a free core plus **Holiday Pass €9.99 / 14 days (one-time)** and **Annual Explorer Pass €24.99/year (recurring)**.
- [x] Surface **Passes** in the primary app header/mobile menu with a Free/Holiday/Annual comparison.
- [x] Keep core map/directory discovery, My Trips, visitability, road/access facts, directions and direct producer contact free.
- [x] Add paid convenience tools: ad-free planning, printable/save-to-PDF Trip Pack, calendar export and downloadable offline trip snapshot.
- [x] Guarantee Holiday Pass expiry/repurchase semantics: active passes block accidental duplicate checkout; at the exact 14-day expiry the traveler returns to Free; the same account can then purchase a new Holiday Pass with a new pass ID and fresh 14-day entitlement.
- [x] Protect Trip Pack/calendar export server-side with the active Explorer entitlement rather than frontend visibility alone.
- [x] Make Annual entitlement follow the live Stripe subscription period/status and provide a dedicated Stripe Customer Portal for cancellation/payment management.
- [x] Validate the Passes dialog at phone 390×844, iPad portrait 834×1194, iPad landscape 1194×834 and desktop 1440×900.
- [x] Create a clean live Stripe Explorer Product with tax-inclusive €9.99 one-time and €24.99/year recurring Prices; leave public checkout fail-closed until release validation completes.
- [x] ~~Verify both Checkout contracts against a Stripe sandbox.~~ `npm run stripe:e2e:explorer` creates real sandbox Holiday and Annual hosted Checkout Sessions with the same service function, verifies the server-selected €9.99 payment / €24.99 yearly subscription contracts, and proves Annual active → cancel-at-period-end → canceled entitlement behavior without live money.
- [x] ~~Run the complete local release gate and responsive browser smoke.~~ Typecheck, lint (0 errors), 674 frontend tests, 132 Node server tests, 17 service specs, Firestore rules, production build/SEO/budget checks and the real-browser smoke all passed; the browser smoke covers phone, iPad portrait, iPad landscape and desktop.
- [x] ~~Verify the merged build with the production deployment/smoke while Explorer checkout remains fail-closed.~~ Main Quality Gate `35862102825` and Production Deploy `35862313736` passed before launch; the serving revision was `terroirtrail-api-00055-8tb` with Explorer checkout still disabled.
- [x] ~~Enable the repository-controlled Explorer checkout gate only after that production verification and an explicit launch decision.~~ Explicit launch approval was given on 2026-09-23. `EXPLORER_PASS_CHECKOUT_ENABLED=true` was set in the repository and deployed successfully; later production verification continues to show the gate enabled in Cloud Run and the public frontend.
- [x] ~~Add clearer paid-layer discovery without turning the app into a paywall.~~ `Upgrade your trip` now appears in My Trips and as a secondary first-run welcome CTA with the Holiday/Annual prices; PR #38 merged as `83af1d6` and production responsive smoke passed.
- [x] ~~Add a one-time alcohol-content notice without collecting age/DOB data.~~ Winery, brewery and distillery detail flows now show a legal-drinking-age notice with Continue / Back to discovery; only a local acknowledgement flag is stored. PR #39 merged as `e1b289a` and production verification passed.
- [x] ~~Fix tablet/iPad producer-detail state so each newly selected map listing returns to quick preview and requires `Explore Story` again.~~ PR #40 merged as `31e4c6e`; PR #41 (`c7c953c`) stabilized an exact two-producer iPad portrait/landscape regression. Production Deploy `35879251207` and a direct live production browser smoke both passed.
- [ ] Treat the first genuine traveler purchase as monitored production validation; do not create a sacrificial live self-purchase.
- [ ] Measure Pass popup -> Checkout -> paid entitlement -> Trip Pack/calendar use before changing price or adding more paid features.

**15.8A Explorer production launch - 2026-09-23:** Explorer checkout is live. The live traveler products remain Holiday Pass EUR 9.99 / 14 days (one-time) and Annual Explorer Pass EUR 24.99/year (recurring), both tax-inclusive. Current production after the post-launch UX fixes is `main` commit `c7c953c`, Cloud Run revision `terroirtrail-api-00059-nrs`, with `EXPLORER_PASS_CHECKOUT_ENABLED=true`. No sacrificial live self-purchase was made; the first genuine traveler purchase remains the monitored production-validation event.

### 15.8B - Explorer Trip Intelligence and Journey Mode (planned)

This is the next B2C value phase. It must make an actual road trip easier without moving existing discovery, visitability, road/access or current free Trip Readiness facts behind a paywall.

- [ ] Define **Optimize my day** as a user-requested suggestion within an assigned day; never silently reorder the itinerary and allow important/booking-constrained stops to be locked.
- [ ] Add an estimated day timeline using travel-time and visit-duration assumptions with explicit uncertainty labels; never imply unverified opening hours or visit availability.
- [ ] Add **Navigate next stop** as a simple handoff to the traveler's mapping app.
- [ ] Design opt-in **Nearby / passing-by producer alerts** using route detour rather than straight-line radius where possible; cap alert frequency and respect visitability/booking/opening confidence. Initial web/PWA behavior may be foreground/active-journey only because background location is platform-constrained.
- [ ] Decide the **unlimited trips** packaging before implementation. Candidate model: a small Free active-trip allowance, unlimited active trips while Holiday/Annual is active, and unlimited annual archive/history. Never delete or hide trips a traveler already created when a pass expires.
- [ ] Preserve already-generated paid outputs after expiry: optimized order, downloaded Trip Pack/calendar files and existing itinerary state remain the traveler's; only running new premium computations/exports requires an active entitlement.
- [ ] Evaluate later Journey Mode additions only after the core planner is useful: route-gap suggestions, trip-change alerts, shared trips, travel journal/Passport history and journey recap.
- [ ] Keep paid placement completely separate from route optimization, nearby-alert eligibility, visitability, road/access facts and organic relevance.
- [ ] Run server-side entitlement checks for privileged/premium computations and add phone/iPad/desktop production regression coverage before launch.

### 15.9 — Controlled production pilot (producer side, deferred behind B2C validation)

The Partner product already exists technically, but broad producer outreach should wait until traveler usage provides a meaningful audience/value proposition. The eventual first producer pilot can still be deliberately small and manually curated.

- [ ] Seed a small number of internal/test Partner campaigns first.
- [ ] Verify organic producer ranking/order is unchanged.
- [ ] Verify Partner labels on mobile and desktop.
- [ ] Verify attribution from impression → profile open → save/trip add → direct action where it occurs.
- [ ] Verify campaign expiry removes paid placement automatically.
- [ ] Verify subscription cancellation/expiry does not affect free discovery.
- [ ] Verify Host Portal reporting matches aggregate analytics.
- [ ] Verify no campaign can bypass factual/admin review.
- [ ] Run full quality gate and production smoke.

### 15.10 — Producer launch and commercial validation

Only after the production loop works end-to-end:

- [ ] Offer the real Partner product to a deliberately small number of appropriate producers.
- [ ] Measure actual paid conversion/willingness to pay rather than survey interest alone.
- [ ] Record which visibility surfaces/campaign types producers value.
- [ ] Record whether producers understand the separation between paid promotion and verification/editorial discovery.
- [ ] Review renewal intent after meaningful usage.
- [ ] Adjust price/credits/campaign packaging from real usage rather than assumptions.
- [ ] Stop or revise surfaces that do not produce useful qualified engagement.

### 15.11 — Exit gate

- [ ] Partner/subscription/campaign authority is server-trusted and audited.
- [ ] Stripe Checkout/webhooks are production-verified.
- [ ] At least one paid placement works end-to-end with attribution/reporting.
- [ ] Non-partner producers remain unaffected in organic discovery.
- [ ] Verification, visitability and safety/access truth remain independent of payment.
- [ ] There is real paid producer usage or clear evidence to revise/stop before scaling.

**Phase 15 definition of done:** TerroirTrail has a production-grade Producer Partner product: a verified Host can subscribe, receive approved clearly labelled paid distribution in relevant traveler contexts, see campaign results in the existing Host Portal, and cancel/expire without affecting the free trusted listing.

---

## Phase 16 — Experiences

**Status:** Deferred — activate only after Phase 15 has real partner producers who explicitly want TerroirTrail-managed Experience publishing.

**Objective:** create accurate, producer-approved activity records without turning the producer catalogue itself into a booking marketplace.

**Prerequisites:**

- explicit partner agreement;
- producer-approved activity;
- trusted producer ownership;
- clear operational responsibility;
- no assumption that public visitability equals Experience permission.

### 16.1 — Define the Experience contract

For each Experience define:

- [ ] producer ID;
- [ ] canonical title;
- [ ] factual description;
- [ ] activity type;
- [ ] duration;
- [ ] capacity/minimum group;
- [ ] price/currency where applicable;
- [ ] inclusions/exclusions;
- [ ] language availability;
- [ ] accessibility information;
- [ ] age/participant restrictions where justified;
- [ ] season/date availability model;
- [ ] meeting point;
- [ ] cancellation/change terms;
- [ ] booking/inquiry method;
- [ ] evidence/producer approval reference.

### 16.2 — Lifecycle and approval

- [ ] Enforce lifecycle:
      `draft → awaiting producer approval → approved → published → paused/withdrawn`.
- [ ] Require explicit producer approval before publication.
- [ ] Keep admin authority over publication state.
- [ ] Record approval/version history.
- [ ] Ensure material content changes can trigger re-approval.
- [ ] Ensure pausing/removing an Experience never removes the producer listing.

### 16.3 — Data and UI boundaries

- [ ] Keep producer visitability separate from Experience availability.
- [ ] Do not reuse Experience price/duration as a generic producer-level fact.
- [ ] Clearly label the Experience as a separate commercial/product layer.
- [ ] Preserve direct producer discovery regardless of Experience participation.
- [ ] Keep non-partner producers free of artificial disadvantages.

### 16.4 — Pilot publication

- [ ] Publish only a small approved set.
- [ ] Verify mobile/desktop presentation.
- [ ] Verify accurate dates/times/prices.
- [ ] Verify pause/withdrawal behavior.
- [ ] Verify stale Experience content cannot remain public after withdrawal.
- [ ] Run production smoke with partner confirmation.

### 16.5 — Exit gate

- [ ] Confirm producers can understand and approve what is published.
- [ ] Confirm TerroirTrail can keep Experience details operationally current.
- [ ] Confirm no Experience publication implies booking/payment capability unless Phase 17 is active.

**Phase 16 definition of done:** approved partner Experiences can be published, changed, paused and withdrawn safely while remaining strictly separate from the underlying independent producer catalogue.

---

## Phase 17 — Booking & Payments

**Status:** Future — do not activate merely because booking/payment code already exists.

**Objective:** decide whether TerroirTrail should become transactionally responsible at all, and if so implement the smallest safe commercial model.

**Prerequisites:**

- real approved Phase 16 Experiences;
- demonstrated booking demand;
- producers willing to operate under defined commercial terms;
- support capacity;
- legal/accounting review appropriate to the chosen model.

### 17.1 — Choose the commercial responsibility level

Explicitly choose one model before implementation:

1. [ ] outbound/direct producer contact only;
2. [ ] TerroirTrail inquiry request without confirmed reservation;
3. [ ] reservation confirmation without payment;
4. [ ] deposit collection;
5. [ ] full payment/marketplace transaction.

Do not implement levels 3–5 unless they are deliberately chosen.

### 17.2 — Availability model

- [ ] Define authoritative availability source.
- [ ] Define how slots become held/confirmed.
- [ ] Define race-condition/double-booking prevention.
- [ ] Define timezone behavior.
- [ ] Define cutoff windows.
- [ ] Define producer closure/blackout handling.
- [ ] Define stale-availability failure behavior.

### 17.3 — Booking lifecycle

- [ ] Define booking states.
- [ ] Define traveler request/confirmation UX.
- [ ] Define producer acceptance/rejection where needed.
- [ ] Define cancellation and modification flows.
- [ ] Define no-show behavior.
- [ ] Define notification responsibilities.
- [ ] Define support/escalation path.

### 17.4 — Payment architecture, only if selected

- [ ] Decide merchant-of-record/payment-facilitator responsibilities.
- [ ] Define deposit/full-payment model.
- [ ] Define producer payout/reconciliation.
- [ ] Define refund/chargeback handling.
- [ ] Define currency behavior.
- [ ] Define tax/VAT/invoicing responsibilities.
- [ ] Keep secret/payment credentials server-side.
- [ ] Test idempotency and webhook replay.
- [ ] Test failure recovery.

### 17.5 — Legal/operational readiness

- [ ] Update traveler terms.
- [ ] Update producer commercial agreements.
- [ ] Define support SLA/process.
- [ ] Define refund responsibility.
- [ ] Define accounting/reconciliation process.
- [ ] Define fraud/abuse response.
- [ ] Confirm privacy/data-retention implications.

### 17.6 — Pilot and exit gate

- [ ] Pilot with very few partners/Experiences.
- [ ] Reconcile every test/real transaction manually during pilot.
- [ ] Verify refunds/cancellations.
- [ ] Verify producer notifications.
- [ ] Verify support workflow.
- [ ] Do not scale until operations are stable.

**Phase 17 definition of done:** TerroirTrail has deliberately chosen and safely proven a booking responsibility level; payment is introduced only if the operational/legal model supports it.

---

## Phase 18 — Monetisation & Scale

**Status:** Traveler Explorer is live as the first B2C paid product. Producer Partner infrastructure is production-ready, but broad producer outreach remains deferred behind traveler evidence. Scaling still depends on real paid usage and later-phase evidence.

**Objective:** commercialize only validated value while preserving TerroirTrail's independent discovery and trust model.

### Commercial priority order

1. Traveler Explorer B2C validation and useful trip-planning intelligence;
2. contextual affiliate utility;
3. Producer Partner / paid visibility and campaign distribution after traveler evidence improves the producer value proposition;
4. B2B Regional Intelligence / regional contracts;
5. standalone producer workflow software only if separately validated;
6. booking/payment commission only if Phase 17 proves viable.

### 18.1 - Validate the first live paid product

Phase 15.8A selected and launched Traveler Explorer as the first live B2C commercial experiment. The remaining Phase 18 work is therefore validation/scale discipline, not another product-selection exercise.

- [ ] Review Phase 14 evidence.
- [ ] State the paying customer clearly.
- [ ] State the problem being solved.
- [ ] State what remains free.
- [ ] State what is paid.
- [ ] Record willingness-to-pay evidence.
- [ ] Reject monetisation concepts without demonstrated value.

### 18.2 — Define entitlements

Only after a paid product is chosen:

- [ ] Define generic entitlement/capability IDs.
- [ ] Avoid hard-coding all future commerce around `hasExplorerPass`.
- [ ] Define entitlement source of truth.
- [ ] Define start/end/grace/cancel state.
- [ ] Define account transfer/refund effects.
- [ ] Keep entitlement checks server-trusted for privileged functionality.
- [ ] Decide whether dormant Explorer Pass infrastructure can be generalized or should remain untouched.

### 18.3 — Pricing and packaging

- [ ] Define pricing hypothesis from validated customer value.
- [ ] Avoid charging for safety/access facts.
- [ ] Avoid paid ranking.
- [ ] Define trial/pilot terms only if useful.
- [ ] Define invoicing/subscription handling appropriate to customer type.
- [ ] For B2B, prefer contract/value-based packaging over forcing consumer subscription mechanics.

### 18.4 — Product-specific scale gates

**B2B Regional Intelligence**

- [ ] validate report cadence;
- [ ] validate export/data needs;
- [ ] define contract scope;
- [ ] define data freshness commitment;
- [ ] ensure non-exhaustive coverage is represented honestly.

**Producer Partner / paid visibility**

- [ ] validate Partner subscription conversion and renewal;
- [ ] validate which regional/My Trips/seasonal placements produce qualified engagement;
- [ ] preserve organic ranking and free factual/safety corrections;
- [ ] keep campaign reporting descriptive and attribution-based;
- [ ] expand campaign inventory only when existing surfaces demonstrate value.

**Producer workflow software**

- [ ] build only when producers demonstrate a separate workflow problem worth paying for;
- [ ] do not use existing analytics availability as justification by itself;
- [ ] preserve the free Host factual-management boundary.

**Traveler Explorer / premium planning**

- [ ] validate first genuine paid conversion and entitlement fulfillment;
- [ ] validate actual use of the live Trip Pack, offline snapshot and calendar export;
- [ ] validate repeat Holiday Pass purchase / Annual conversion behavior before changing price;
- [ ] validate repeat My Trips use and whether users ask for the planned 15.8B Trip Intelligence/Journey Mode features;
- [ ] never hide discovery, current Trip Readiness, visitability, road/access or other safety facts behind the paid tier.

### 18.5 — Affiliate scale

- [ ] Keep affiliate placements contextual.
- [ ] Keep disclosure explicit.
- [ ] Measure by useful engagement, not impression volume.
- [ ] Remove irrelevant campaigns.
- [ ] Never tie producer editorial visibility to affiliate economics.

### 18.6 — Commercial reporting

- [ ] Track revenue by product line.
- [ ] Track conversion separately from discovery metrics.
- [ ] Track churn/renewal where applicable.
- [ ] Track support burden.
- [ ] Track whether monetisation harms core discovery behavior.
- [ ] Maintain a clear trust metric/QA review independent of revenue.

### 18.7 — Scale decision

Before scaling any paid product:

- [ ] confirm real customer value;
- [ ] confirm operational support;
- [ ] confirm privacy/security;
- [ ] confirm economics;
- [ ] confirm the free trust layer remains intact;
- [ ] explicitly decide whether to scale, revise or stop the product.

### Product principle

> **Monetise convenience, distribution, workflow and intelligence — not trust or safety.**

**Phase 18 definition of done:** TerroirTrail has one or more validated commercial products with clear economics, entitlement boundaries and operating processes, while independent discovery, factual correction, visitability and safety/access information remain useful without payment.

---

## Operating Rules

1. **Producer discovery and Experiences are separate product layers.**
2. **No public TerroirTrail Experience exists without a producer agreement.**
3. **Public visitability does not equal TerroirTrail booking permission.**
4. **Unknown data stays unknown.** Never invent a positive or negative fact to fill a UI field.
5. **Never guess unresolved coordinates, producer identity, visitor availability, drive time or road suitability.**
6. **Direct producer contact is acceptable without a partnership only through producer-controlled public channels.**
7. **Admin and producer authority must be server-trusted.**
8. **Essential location, visitability, road/access and other safety-relevant information remains free and fail-closed.**
9. **Monetise convenience, distribution, workflow and intelligence — not trust or safety.**
10. **Producer factual corrections and trust/safety updates must not require a paid producer plan.**
11. **Paid tiers must never buy organic/editorial ranking, verification status or the appearance of being more trustworthy; paid distribution must use clearly labelled commercial surfaces.**
12. **The first traveler-planning product organizes verified facts; it does not generate unsupported AI routes, opening times, drive times or road-safety claims.**
13. **Booking, public Experiences, chauffeur workflows, QR partner-pass benefits and transaction/commission complexity remain dormant until explicitly reactivated by roadmap decision.**
14. **Contextual affiliates must be clearly disclosed and should migrate toward relevant planning/preparation contexts rather than dominate the primary discovery surface.**
15. **No catalogue-expansion programme is currently scheduled. Do not add new producers or projects unless a future roadmap update explicitly creates and activates a new expansion phase.**
16. **A shop, office, cooperative outlet or visitor centre must never be silently treated as the underlying production site.**
17. **New categories must receive category-appropriate taxonomy and UI rather than inheriting wine-centric assumptions.**
18. **Crete remains the reference-quality regional implementation standard.**
19. **Regional discovery layers are contextual tools, not evidence of exhaustive coverage, administrative endorsement, route safety or commercial partnership.**
20. **Intent analytics must be privacy-conscious and must never collect private tasting-note contents, personal trip-note contents, message contents or unnecessary PII.**
21. **Explorer is now a live commercial experiment, not proof of product-market fit.** Keep pricing, packaging and future paid features evidence-driven; do not interpret infrastructure readiness or a live checkout as willingness-to-pay evidence.
22. **Before starting a major new feature, place it against this roadmap first.**
23. **Every completed roadmap item is crossed out in this file only after implementation, testing and any required production verification.**

---
