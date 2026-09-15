# Phase 10B — Peloponnese + Northern Greece + Tuscany / Italy

Date: 2026-09-15

Status: **Current regional workstream. Trust and narrative cleanup complete; location/access audit remains open.**

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

The live Phase 10B catalogue currently contains **19 records**:

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
- Ethos labels are now conservative: they are retained only where the producer's current material directly supports them.

Applied narrative migrations:

- `20260915102904_phase10b_northern_greece_narrative_cleanup`
- `20260915102956_phase10b_northern_greece_narrative_cleanup_refinement`
- `20260915103146_phase10b_peloponnese_tuscany_narrative_cleanup`

### Visitability state

Visitability remains independent from location and road safety.

Current Phase 10B distribution:

- `public_visits`: 3
- `appointment_only`: 8
- `not_publicly_confirmed`: 7
- `current_access_uncertain`: 1

Public or appointment status is based on current first-party evidence. A producer can have confirmed visitor access while its exact TerroirTrail map point remains unresolved.

### Location and Google identity state

Current exact-location state:

- verified locations: **5 / 19**
- unresolved locations: **14 / 19**
- accepted Google Place IDs: **9 / 19**

A Google Place ID by itself does not upgrade `location_status`. Exact map-point verification remains a separate evidence step.

### Road-access state

Road access remains fully fail-closed for Phase 10B:

- verified/classified roads: **0 / 19**
- no producer currently receives a paved/unpaved/rental-car-suitability claim;
- no Phase 10B multi-stop driving navigation may be enabled from the current evidence state.

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

The next gate is the **remaining exact-location and Google identity audit**:

1. resolve the 14 remaining exact producer/business map points from producer-controlled or equivalently strong evidence;
2. complete the remaining Google Place ID matches without inferring IDs from coordinates or CIDs;
3. enable Google imagery only where both the persistent Place ID and location audit pass;
4. keep road access untouched until a separate road-evidence review;
5. only after exact-location parity, design candidate Discovery Guides from verified stops.

No Phase 10B regional closeout or production-reference claim should be made before the location, media, road/access, fallback and production-smoke gates are complete.

## Completion model

Phase 10B is complete only when **all three regions** have individually passed the reference-quality bar and their production behavior has been verified.

A region may be marked complete within Phase 10B before the others, but the Phase 10B batch remains open until Peloponnese, Northern Greece, and Tuscany / Italy are all closed.

## Next after Phase 10B

Continue with the wider Mediterranean regional programme, followed by Northern Europe, while preserving the geography-open architecture.
