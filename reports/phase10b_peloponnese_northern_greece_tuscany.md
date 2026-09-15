# Phase 10B — Peloponnese + Northern Greece + Tuscany / Italy

Date: 2026-09-15

Status: **Current regional workstream. Trust/narrative cleanup, exact-location coverage, producer/public-point taxonomy, and bundled fallback parity are complete; remaining Google identity, Discovery Guide, and production-reference gates remain open; 13 road approaches remain explicitly reviewed-but-unconfirmed.**

Phase 10B combines Peloponnese, Northern Greece, and Tuscany / Italy into one coordinated regional expansion batch. The purpose is to reuse one audit and QA framework across all three regions while preserving region-specific evidence and verification decisions.

## Why these regions are merged

- They can share the same producer/project audit workflow.
- They can share the same trust-cleanup rules for visitability, location, road access, imagery, contact channels, and fallback data.
- They can share the same Google Place ID and media eligibility process.
- They can share one Discovery Guide publication model and navigation-safety gate.
- They can be tested under one coordinated regional quality programme instead of repeating setup work three times.

The regions are grouped operationally, not factually. Evidence for one region must never be reused as evidence for another.

## Region set

1. Peloponnese, Greece
2. Northern Greece
3. Tuscany / Italy

## Current audited inventory

The live Phase 10B catalogue contains **19 records**:

- Peloponnese: 9
- Northern Greece: 9
- Tuscany / Italy: 1

### Completed trust cleanup

The Phase 10B trust quarantine has been applied to all 19 records:

- legacy synthetic ratings and review counts removed;
- legacy price bands and VIP/perk claims removed;
- unsupported walk-in, pet, child and campervan claims removed;
- legacy tasting-highlight packages removed;
- inherited `paved` road classifications removed;
- stock Unsplash producer imagery removed;
- schema defaults that could recreate synthetic ratings, price bands, food options or hospitality booleans removed;
- Experiences remain inactive unless explicit producer approval exists;
- the old Peloponnese, Northern Greece and Tuscany marketing routes remain quarantined and are not published Discovery Guides.

### Narrative audit

Narrative cleanup is complete for all 19 Phase 10B records.

- Northern Greece: 9/9 rewritten from current producer-controlled sources.
- Peloponnese: 9/9 rewritten from current producer-controlled sources.
- Tuscany / Italy: 1/1 rewritten from current producer-controlled sources.
- Promotional legacy language such as unsupported "world", "legendary", "benchmark", "best", "royalty", "icon", "cult", "award", "premier" and similar claims is no longer present in the live Phase 10B `tag_line`, `description` or `story` fields.
- Ethos labels are conservative and retained only where current evidence directly supports them.

Applied narrative migrations:

- `20260915102904_phase10b_northern_greece_narrative_cleanup`
- `20260915102956_phase10b_northern_greece_narrative_cleanup_refinement`
- `20260915103146_phase10b_peloponnese_tuscany_narrative_cleanup`

### Visitability state

Visitability remains independent from producer identity, mapped public-point role, exact location, and road safety.

A producer-owned shop is not treated as evidence that the farm, winery, mill, orchard, or other production site accepts ordinary public visits.

### Location and Google identity state

Current exact-location state after the Liokareas public-point audit:

- verified public location points: **19 / 19**
- unresolved public location points: **0 / 19**
- accepted persistent Google Place IDs: **14 / 19**
- Google-media eligible Phase 10B records: **14 / 19**

Applied location/entity migrations include:

- `20260915101844_phase10b_verify_first_party_linked_locations_batch1`
- `20260915103850_phase10b_verify_exact_locations_batch2`
- `20260915104144_phase10b_finalize_location_entity_audit`
- `20260915104413_phase10b_verify_liokareas_public_shop`
- `20260915104604_phase10b_refine_liokareas_public_identity`
- `20260915104832_phase10b_add_olive_oil_producer_category`
- `20260915105042_phase10b_separate_producer_identity_from_public_point`
- `20260915123444_phase10b_persist_monemvasia_google_place_id`
- `20260915125512_phase10b_persist_sknipa_google_place_id`
- `20260915125656_phase10b_persist_northern_greece_google_place_ids_batch2`

### Producer identity versus mapped public point

Phase 10B now explicitly separates three concepts:

1. **Producer category** — what kind of maker the catalogue entity actually is.
2. **Mapped public point** — what the verified navigation point represents.
3. **Producer visitability** — whether ordinary public access to the producer/production site is confirmed.

Liokareas is the first record using this separation:

- producer identity: **Liokareas**;
- producer category: `olive_oil_producer`;
- verified mapped point: `producer_shop` in Lagkada, Mani;
- producer/production-site visitability: `not_publicly_confirmed`;
- Google Place ID: `ChIJhUj2fKPpYRMRLPwSoXMbgBM`;
- road access: unreviewed.

The mapped point must not be described as the farm or olive mill. The category `olive_oil_producer` is producer-only: generic olive-oil shops, resellers, delicatessens, souvenir shops, and other retailers do not qualify for the producer catalogue merely because they sell local products. A producer-owned shop may be represented only as a public point of an already-qualified producer.

A Google Place ID by itself does not upgrade `location_status`, and verified coordinates do not imply road suitability.

### Bundled fallback parity

The audited Phase 10B catalogue is now included in the bundled fallback path:

- 19 Phase 10B records are stored in `src/data/phase10bProducers.ts`;
- live Supabase mapping preserves `public_point_type` as frontend `publicPointType`;
- fallback data preserves the Liokareas producer/shop distinction;
- Google Places eligibility now includes Phase 10B only where both a verified location and persistent audited Place ID exist;
- automated tests guard the 19-record regional inventory, Liokareas taxonomy, producer-shop separation, Google Place ID, and fail-closed road state.

The total bundled audited producer catalogue is therefore 55 records: 27 Crete + 9 Santorini + 19 Phase 10B. This does **not** mean Phase 10B has reached regional reference-quality closeout; road/access, guide design, and production-reference verification remain separate gates.

### Road-access state

The Phase 10B public road-evidence review is complete. Classifications are exposed only where sufficiently specific evidence exists:

- verified/classified roads: **6 / 19**;
- reviewed but not publicly confirmed: **13 / 19**;
- unreviewed roads: **0 / 19**;
- `tetramythos-winery`: `narrow_paved`;
- `ktima-tselepos`: `paved`;
- `siris-craft-brewery`: `paved`;
- `monemvasia-winery`: `paved`;
- `propator-sknipa-brewery`: `paved`;
- `monteraponi-tuscany`: `unpaved_passable` and therefore not treated as normal rental-car route evidence;
- vineyard, orchard, agricultural and unrelated service tracks are never inferred from the public-point classification;
- no Phase 10B multi-stop driving navigation is enabled merely because individual stops have passed road review.

Applied road migrations:

- `20260915121803_phase10b_road_access_audit_batch1`
- `20260915123105_phase10b_road_access_audit_batch2_and_review_close`

## Shared quality bar

For each region:

- audit every intended public producer/project record;
- remove invented, stale, synthetic, or unsupported claims;
- verify entity/category type so producers, farms, heritage projects, geoparks, and other local projects are represented truthfully;
- verify public visitability independently from TerroirTrail partnership status;
- verify exact location independently from road/access confidence;
- keep unresolved and uncertain states explicit rather than guessed;
- verify producer-controlled public contact channels;
- persist manually verified Google Place IDs before enabling Google imagery;
- apply the same media hierarchy and attribution rules used in Crete and Santorini;
- synchronize live and bundled fallback data;
- bring map/list browsing, search, filters, detail pages, deep links, and mobile behavior to reference-region parity;
- publish Discovery Guides only from verified stops;
- keep multi-stop driving navigation fail-closed wherever road/access evidence is incomplete;
- keep Experiences inactive unless a producer agreement exists;
- run the full automated quality gate;
- complete regional production smoke verification before marking the region reference-quality.

## Next Phase 10B gate

The next gate is the **remaining Google identity and Discovery Guide audit**:

1. complete remaining persistent Google Place ID matches without inferring IDs from coordinates or CIDs;
2. keep Google imagery enabled only where both a manually audited persistent Place ID and verified location exist;
3. preserve the completed road-evidence audit as a separate safety gate; do not upgrade reviewed-but-unconfirmed approaches without new evidence;
4. design candidate Discovery Guides only from verified stops, with multi-stop navigation withheld wherever access evidence remains incomplete;
5. run the full automated quality gate after fallback parity is synchronized;
6. complete a production smoke before any Phase 10B regional reference-quality claim.

No Phase 10B regional closeout or production-reference claim should be made before the remaining road/access, Discovery Guide, and production-smoke gates are complete.

## Completion model

Phase 10B is complete only when **all three regions** have individually passed the reference-quality bar and their production behavior has been verified.

A region may be marked complete within Phase 10B before the others, but the Phase 10B batch remains open until Peloponnese, Northern Greece, and Tuscany / Italy are all closed.

## Next after Phase 10B

Continue with the wider Mediterranean regional programme, followed by Northern Europe, while preserving the geography-open architecture.
