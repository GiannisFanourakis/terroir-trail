# Phase 10B — Peloponnese + Northern Greece + Tuscany / Italy

Date: 2026-09-15

Status: **COMPLETE / CLOSED.** The regional trust, identity, location, Google media, road-review, fallback, automated QA, deployment, and production-smoke work for the 19-record Phase 10B catalogue is complete. Discovery Guide publication is explicitly deferred rather than treated as a blocking closeout gate.

Phase 10B grouped Peloponnese, Northern Greece, and Tuscany / Italy into one coordinated regional expansion batch while keeping evidence decisions region-specific.

## Final audited inventory

The live Phase 10B catalogue contains **19 records**:

- Peloponnese: **9**
- Northern Greece: **9**
- Tuscany / Italy: **1**

The wider bundled audited catalogue is **55 records**: 27 Crete + 9 Santorini + 19 Phase 10B.

## Final closeout state

- trust quarantine and synthetic-data cleanup: **complete**
- narrative/source cleanup: **19 / 19**
- verified public location points: **19 / 19**
- unresolved public locations: **0 / 19**
- persistent manually audited Google Place IDs: **19 / 19**
- Google-media eligible Phase 10B records: **19 / 19**
- road approaches reviewed: **19 / 19**
- verified/classified roads: **6 / 19**
- reviewed but not publicly confirmed roads: **13 / 19**
- unreviewed roads: **0 / 19**
- bundled fallback parity: **19 / 19**
- Phase 10B Google media/fallback tests: **green**
- full `npm run check`: **green at closeout**
- Firebase Hosting/Functions deployment: **completed**
- production smoke of the newly enabled Google-media/deep-link paths: **confirmed by the project owner**

## Trust cleanup and narrative state

All 19 Phase 10B records were reconciled to the same trust model used by the reference regions:

- legacy synthetic ratings/review counts removed;
- legacy price bands and VIP/perk claims removed;
- unsupported walk-in, pet, child and campervan claims removed;
- legacy tasting-highlight packages removed;
- inherited road classifications removed unless independently supported;
- stock producer imagery removed from producer-identity presentation;
- schema defaults that could recreate unsupported claims removed;
- Experiences remain inactive unless explicit producer approval exists;
- stories, taglines and factual descriptions were rewritten from current producer-controlled or otherwise appropriate evidence;
- unsupported promotional superlatives were removed;
- unknown states remain unknown rather than being converted into positive or negative claims.

## Location, identity and media

Location verification, Google identity and road safety remain independent trust dimensions.

At closeout:

- all 19 records have verified public points;
- all 19 have persistent manually audited Google Place IDs;
- Google imagery is eligible only because each of those records also has a verified location state;
- Google Place IDs were not inferred from coordinates or legacy CIDs;
- Google imagery remains supplementary discovery media, not evidence of visitability, entrance precision or road suitability;
- live Google attribution remains part of the media presentation.

The final Google-identity migrations include:

- `20260915123444_phase10b_persist_monemvasia_google_place_id`
- `20260915125512_phase10b_persist_sknipa_google_place_id`
- `20260915125656_phase10b_persist_northern_greece_google_place_ids_batch2`
- `20260915134155_phase10b_persist_gaia_nemea_google_place_id`
- `20260915135348_phase10b_persist_remaining_google_place_ids`

The final five IDs added during closeout were GAIA Wines Nemea, Domaine Karanika, Domaine Biblia Chora, Thymiopoulos Vineyards Naoussa, and Siris Craft Brewery.

## Producer identity versus mapped public point

Phase 10B preserves the distinction between:

1. producer category;
2. mapped public point;
3. producer/production-site visitability.

Liokareas remains the reference example:

- producer identity: **Liokareas**;
- producer category: `olive_oil_producer`;
- verified mapped point: `producer_shop` in Lagkada, Mani;
- producer/production-site visitability: `not_publicly_confirmed`;
- Google Place ID: `ChIJhUj2fKPpYRMRLPwSoXMbgBM`.

The mapped shop must not be described as the farm or olive mill. A producer-owned shop does not prove that the production site accepts visitors.

## Road-access closeout

The public road-evidence review is complete. No additional classifications are required merely to close the phase.

Verified/classified roads:

- `tetramythos-winery`: `narrow_paved`
- `ktima-tselepos`: `paved`
- `siris-craft-brewery`: `paved`
- `monemvasia-winery`: `paved`
- `propator-sknipa-brewery`: `paved`
- `monteraponi-tuscany`: `unpaved_passable`

The remaining 13 approaches stay `not_publicly_confirmed`. They are reviewed, not forgotten. They must not be upgraded without new evidence.

`monteraponi-tuscany` being `unpaved_passable` is not normal-rental-car evidence. Passability and rental-car suitability remain separate questions.

Multi-stop driving navigation remains fail-closed wherever route/access evidence is incomplete.

## Discovery Guide closeout decision

Discovery Guide publication is **not** required to close Phase 10B.

This supersedes the earlier wording that treated guide publication as a blocking gate. The product decision at closeout is:

- do not invent a Peloponnese or Northern Greece driving route merely to satisfy a checklist;
- do not present Tuscany as a multi-stop guide while the audited Tuscany inventory contains only one producer;
- keep old unaudited marketing/day-trip routes quarantined;
- when Discovery Guides are revisited, build them only from verified stops and keep multi-stop driving/navigation disabled wherever access evidence is insufficient.

This is a deliberate deferral, not missing audit work.

## Production and QA closeout

Before closure:

- the final Google Place identities were persisted to production Supabase;
- bundled fallback parity was synchronized;
- the Phase 10B Google media eligibility count reached **19 / 19**;
- automated tests and the full project check passed;
- the current build was deployed to Firebase Hosting/Functions;
- the project owner confirmed correct producer imagery and direct deep-link behavior on the newly enabled production records.

No producer visitability, road classification or partnership state was broadened as part of the media rollout.

## Guardrails carried forward

The following remain binding after Phase 10B:

- verified location does not imply verified road access;
- verified road access does not imply confirmed public visits;
- Google identity does not upgrade visitability or road safety;
- producer-owned retail points must not be relabeled as farms, mills or wineries;
- unknown data stays unknown;
- Experiences remain inactive without producer agreement;
- multi-stop driving navigation fails closed where route evidence is incomplete;
- no stock imagery may be presented as if it depicts a specific producer.

## Closeout decision

**Phase 10B is closed.** Peloponnese, Northern Greece and the current one-record Tuscany scope have completed this regional catalogue/trust/media expansion batch.

This does **not** close the broader Phase 10 regional-expansion programme. The next regional work is the wider Mediterranean programme, followed by Northern Europe, while preserving the geography-open architecture and the same evidence-first quality bar.
