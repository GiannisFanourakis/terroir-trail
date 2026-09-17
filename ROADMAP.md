# TerroirTrail Roadmap

> **Canonical project roadmap.** Update this file whenever a roadmap step is completed.
>
> Completion convention: change `- [ ] Step` to `- [x] ~~Step~~` when finished. Do not mark a step complete until it has been implemented, tested, pushed, deployed where applicable, and verified.

**Last updated:** 2026-09-17
**Current focus:** Final pre-deployment documentation, legal notices, and public metadata synchronization pass across all 5 destinations and 62 audited producers; repository preflight prior to deployment.

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

**Status:** Completed — Crete is production-verified as the first reference-quality TerroirTrail region, including the audited catalogue, trust/location/media model, mobile discovery journey, Discovery Guides, automated QA, deployment, and final production smoke.

Crete is the reference implementation for subsequent geographic and category expansion.

- [x] ~~Finish the trustworthy Crete map.~~
- [x] ~~Finish the authentic Crete producer catalogue.~~
- [x] ~~Finish useful search and filtering.~~
- [x] ~~Finish safe navigation/directions behavior.~~
- [x] ~~Finish real producer stories.~~
- [x] ~~Finish direct producer contact flows.~~
- [x] ~~Finish polished producer pages.~~
- [x] ~~Finish useful self-guided routes/day trips using verified pins only.~~
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

## Expansion Quality Bar — Applies to Phases 12–20 where relevant

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
- [ ] Build Discovery Guides only from verified stops and never present them as road-safety guarantees without route evidence.
- [ ] Synchronize bundled fallback/offline data so stale defaults cannot reappear.
- [ ] Run the full automated quality gate and a production smoke pass before marking an expansion phase complete.

---

## Phase 12 — Greek Cheese & Dairy Expansion

**Status:** Completed — Greek Cheese & Dairy Expansion verified. 9 retained audited dairy producers with persistent audited Google Place IDs; 5 unresolved candidates removed; 62 audited producers across the catalogue.

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
- The live catalogue after removal contains **62 producer/project records**: **30 Crete, 9 Santorini, and 23 across Peloponnese + Macedonia, Greece (`northern_greece`) + Tuscany / Italy**.
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

## Phase 14 — Greek Olive & Olive Oil Expansion

**Status:** Planned after Phase 13 — Interactive Terroir Regions.

- [ ] Expand beyond the current olive coverage with audited independent mills, growers, estates, cooperatives, and other appropriate olive-oil producers across Greece.
- [ ] Distinguish olive grove, working mill, bottling/brand operation, visitor centre, and retail shop identities.
- [ ] Verify origin, cultivar, production, and visitor claims from reliable sources.
- [ ] Keep mill access and rural-road evidence separate from simple business-location verification.
- [ ] Bring the new records through the common Expansion Quality Bar.

**Definition of done:** olive and olive-oil discovery represents multiple Greek regions and real production contexts without confusing shops with production sites.

---

## Phase 15 — Greek Honey & Apiary Expansion

**Status:** Planned after Phase 14.

- [ ] Build an audited apiary/honey producer batch across appropriate Greek regions.
- [ ] Distinguish beekeeper/apiary operations, packing/production premises, shops, cooperatives, and educational visitor sites.
- [ ] Verify honey type, botanical/geographic claims, public contact channels, and visitability.
- [ ] Avoid publishing sensitive or unsuitable hive locations simply to create map pins.
- [ ] Bring the new records through the common Expansion Quality Bar.

**Definition of done:** honey discovery is useful to travelers while respecting both evidence quality and the practical sensitivity of apiary locations.

---

## Phase 16 — Greek Herbs & Botanicals Expansion

**Status:** Planned after Phase 15.

- [ ] Build an audited batch of herb growers, botanical producers, distillers, and related small-scale makers where they fit TerroirTrail.
- [ ] Distinguish cultivation/production sites from shops and reseller locations.
- [ ] Verify species/product claims and avoid unsupported medicinal or health claims.
- [ ] Include regionally meaningful herbs and botanical traditions only where a real producer/project can be verified.
- [ ] Bring the new records through the common Expansion Quality Bar.

**Definition of done:** herbs and botanicals become a real producer-led category, not a collection of generic retail listings or folklore claims.

---

## Phase 17 — Greek Farm & Regional Produce Expansion

**Status:** Planned after Phase 16.

- [ ] Expand verified farms and primary-produce makers beyond the current catalogue.
- [ ] Prioritize genuinely place-linked produce such as pulses, grains, carob, nuts, fruit, vegetables, and other regional crops where a traveler-facing listing makes sense.
- [ ] Distinguish farms, packing facilities, cooperatives, markets, and shops.
- [ ] Verify whether a site is appropriate for public discovery before publishing visitor language.
- [ ] Bring the new records through the common Expansion Quality Bar.

**Definition of done:** TerroirTrail represents Greek terroir through primary agricultural production as well as drinks and processed foods.

---

## Phase 18 — Greek Regional Specialty Foods Expansion

**Status:** Planned after Phase 17.

- [ ] Identify regional food crafts that have a strong producer-and-place connection and fit TerroirTrail's discovery model.
- [ ] Audit makers of preserves, traditional grain products, regional sweets, cured or preserved foods, and other local specialties where inclusion is evidence-backed and meaningful.
- [ ] Avoid becoming a generic restaurant, supermarket, souvenir-shop, or packaged-food directory.
- [ ] Give each new category appropriate terminology and presentation rather than forcing it into winery-style UI.
- [ ] Bring the new records through the common Expansion Quality Bar.

**Definition of done:** regional specialty foods broaden TerroirTrail without diluting its producer-first, place-based identity.

---

## Phase 19 — Greek Geoparks, Heritage & Local Projects

**Status:** Planned after the core Greek food-producer verticals.

- [ ] Define first-class non-producer entity types for geoparks, heritage projects, community initiatives, and other local projects that genuinely help travelers understand terroir and place.
- [ ] Ensure these entities never masquerade as producers or commercial partners.
- [ ] Add Greek UNESCO Global Geoparks and other appropriate projects only with verified identity, location, public-access, and official-source information.
- [ ] Design search/filter/detail presentation that clearly separates projects/places from producer listings while allowing useful discovery connections.
- [ ] Bring the new records through the common Expansion Quality Bar where applicable.

**Definition of done:** TerroirTrail can represent the landscape and cultural context around production without corrupting the producer taxonomy.

---

## Phase 20 — International Geographic Expansion

**Status:** Deferred until the Greece-first category programme is complete and production-verified.

Greece remains the priority. Once the Greek catalogue has meaningful breadth beyond wine and the existing categories, geographic expansion can resume without reintroducing a Greece-only architecture.

### Sequence

1. Wider Mediterranean regions
2. Northern Europe regions

- [ ] Define small, manageable regional batches rather than opening entire countries at once.
- [ ] Apply the same producer/category/entity trust model established in Greece.
- [ ] Preserve local product diversity rather than exporting a wine-centric Greek taxonomy to other countries.
- [ ] Complete each international batch through the common Expansion Quality Bar before opening the next.

**Definition of done:** international growth happens from a mature, inclusive Greek reference model rather than by rapidly multiplying thin regional catalogues.

---

## Phase 21 — Producer Partnerships & Deals

**Status:** Deferred until the planned discovery-expansion programme is complete enough to support formal producer relationships safely. The Phase 11 account/authority prerequisite is already complete.

Independent researched listings and direct links to producer-controlled public channels may continue without implying a partnership.

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

## Phase 22 — Experiences

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

## Phase 23 — Booking & Payments

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

## Phase 24 — Monetisation & Scale

**Status:** Future overall; the Travelpayouts affiliate-carousel pilot is an intentionally early cross-cutting monetisation experiment and does not activate the rest of this phase.

- [ ] Validate Host Pro based on real producer needs.
- [ ] Validate Explorer Pass based on real traveler value.
- [ ] Introduce sponsored visibility/advertising only with clear disclosure and trust safeguards.
- [ ] Validate affiliate travel services beyond the current controlled Travelpayouts pilot.
- [ ] Validate chauffeur partnerships.
- [ ] Expand direct producer shop linking where appropriate.
- [ ] Revisit booking revenue only if the commercial model deliberately supports it.

Monetisation follows the product and trust model; it must not dictate or weaken producer verification.

---

## Operating Rules

1. **Producer discovery and Experiences are separate product layers.**
2. **No public TerroirTrail Experience exists without a producer agreement.**
3. **Public visitability does not equal TerroirTrail booking permission.**
4. **Unknown data stays unknown.** Never invent a positive or negative fact to fill a UI field.
5. **Never guess unresolved coordinates or unresolved producer identity.**
6. **Direct producer contact is acceptable without a partnership only through producer-controlled public channels.**
7. **Admin and producer authority must be server-trusted.**
8. **Every completed roadmap item is crossed out in this file when verified complete.**
9. **Before starting a major new feature, place it against this roadmap first.**
10. **Crete is the reference-quality regional implementation.**
11. **Phase 11 account/admin/host handling is complete; finish the current Phase 12 and Travelpayouts deployment/production-verification closeout before beginning Phase 13 Interactive Terroir Regions.**
12. **Expand Greece by product field before resuming broad international geographic expansion, with Phase 13 first adding the reusable regional-terroir interaction layer that supports those later expansions.**
13. **A shop, office, cooperative outlet, or visitor centre must never be silently treated as the underlying production site.**
14. **New categories must receive category-appropriate taxonomy and UI rather than inheriting wine-centric assumptions.**
15. **Finish the planned discovery expansion to an explicit reference-quality standard before producer-partnership/deal outreach becomes the main programme.**
16. **Traveler, Host, and Admin account capabilities are production architecture prerequisites and remain subject to regression testing as the platform expands.**
17. **Partnership-dependent commercial features stay dormant rather than forcing premature deals.**
18. **A candidate listing may be removed when exact identity cannot meet the publication standard; catalogue size is never a reason to guess a Google business identity.**
19. **Regional map overlays are contextual discovery layers, not evidence of exhaustive coverage, administrative endorsement, route safety, or commercial partnership.**
