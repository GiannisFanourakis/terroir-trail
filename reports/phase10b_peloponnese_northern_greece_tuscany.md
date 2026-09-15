# Phase 10B — Peloponnese + Northern Greece + Tuscany / Italy

Date: 2026-09-15

Status: **FINAL IMPLEMENTATION COMPLETE — production guide deployment/smoke pending.** The regional trust, identity, location, Google media, road-review, fallback, Discovery Guide implementation, and automated QA work is complete for the 19-record Phase 10B catalogue. The phase remains open only until the newly published Discovery Guides are deployed and verified in production.

Phase 10B groups Peloponnese, Northern Greece, and Tuscany / Italy into one coordinated regional expansion batch while keeping evidence decisions region-specific.

## Final audited inventory

The Phase 10B catalogue contains **19 records**:

- Peloponnese: **9**
- Northern Greece: **9**
- Tuscany / Italy: **1**

The wider bundled audited catalogue is **55 records**: 27 Crete + 9 Santorini + 19 Phase 10B.

## Current completion state

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
- Phase 10B Discovery Guides implemented: **3 / 3 regional scopes**
- legacy Phase 10B marketing routes removed: **3 / 3**
- Phase 10B Google media/fallback/guide tests: **green**
- full GitHub Actions `npm run check`: **green** on the guide implementation
- prior Google-media deployment and production smoke: **confirmed by the project owner**
- final Discovery Guide deployment/smoke: **pending**

## Trust cleanup and narrative state

All 19 Phase 10B records are reconciled to the same evidence-first trust model used by the reference regions:

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

At closeout readiness:

- all 19 records have verified public points;
- all 19 have persistent manually audited Google Place IDs;
- Google imagery is eligible only because each record also has a verified location state;
- Google Place IDs were not inferred from coordinates or legacy CIDs;
- Google imagery remains supplementary discovery media, not evidence of visitability, entrance precision or road suitability;
- live Google attribution remains part of the media presentation.

The final Google-identity migrations include:

- `20260915123444_phase10b_persist_monemvasia_google_place_id`
- `20260915125512_phase10b_persist_sknipa_google_place_id`
- `20260915125656_phase10b_persist_northern_greece_google_place_ids_batch2`
- `20260915134155_phase10b_persist_gaia_nemea_google_place_id`
- `20260915135348_phase10b_persist_remaining_google_place_ids`

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

The remaining 13 approaches stay `not_publicly_confirmed`. They are reviewed, not forgotten, and must not be upgraded without new evidence.

`monteraponi-tuscany` being `unpaved_passable` is not normal-rental-car evidence. Passability and rental-car suitability remain separate questions.

Multi-stop driving navigation remains fail-closed wherever route/access evidence is incomplete.

## Discovery Guides

Phase 10B now publishes three rebuilt `verified_stops` discovery collections. They are not upgrades of the old marketing routes.

### Peloponnese — Nemea

`peloponnese-nemea-producer-discovery`

- GAIA Wines Nemea
- Semeli Estate Nemea

Both stops have verified locations and current producer-controlled visitor evidence. The guide does not publish a combined driving route or road-surface claim.

### Northern Greece

`northern-greece-verified-winery-planner`

- Ktima Gerovassiliou
- Ktima Kir-Yianni Naoussa
- Alpha Estate
- Domaine Biblia Chora
- Ktima Pavlidis

This is deliberately a regional visit planner rather than a same-day route. Each included producer has a verified location and a current publishable visitor state. Producers whose ordinary visitor access remains unconfirmed are excluded.

### Tuscany

`tuscany-monteraponi-discovery`

The current audited Tuscany scope contains only Monteraponi, so the product presents one verified discovery stop instead of inventing a multi-stop Tuscany route. Advance booking is required. Its `unpaved_passable` access classification does not imply rental-car suitability.

### Legacy route removal

The three pre-audit marketing routes were removed entirely rather than promoted:

- `peloponnese-mythic-trail`
- `northern-greece-royal-trail`
- `tuscany-chianti-classico-trail`

Their unsupported timing, distance, road, tasting and promotional claims can no longer surface through the guide UI.

## Automated guide safeguards

The Phase 10B guide tests enforce that:

- exactly one audited guide is published for each Phase 10B destination scope;
- every published stop exists in the audited Phase 10B catalogue;
- every published stop has a verified location/entrance;
- every published stop has a current publishable visitor state (`public_visits`, `seasonal_public`, or `appointment_only`);
- ordinary-visit-unconfirmed producers are excluded;
- all three guides keep multi-stop route navigation fail-closed;
- Tuscany remains a one-stop discovery entry;
- Monteraponi retains its verified `unpaved_passable` warning state;
- the three legacy marketing route IDs are absent from `CURATED_ROUTES`.

GitHub Actions completed the repository's full `npm run check` successfully after these changes.

## Guardrails carried forward

The following remain binding:

- verified location does not imply verified road access;
- verified road access does not imply confirmed public visits;
- Google identity does not upgrade visitability or road safety;
- producer-owned retail points must not be relabelled as farms, mills or wineries;
- unknown data stays unknown;
- Experiences remain inactive without producer agreement;
- multi-stop driving navigation fails closed where route evidence is incomplete;
- no stock imagery may be presented as if it depicts a specific producer.

## Final Phase 10B gate

Only one gate remains before the phase is formally closed:

1. deploy the current `main` build to production;
2. open the Discovery Guides in production and confirm the new Nemea, Northern Greece and Tuscany entries render correctly;
3. confirm the three old Phase 10B marketing routes do not appear;
4. confirm multi-stop driving navigation is withheld for all three new guides;
5. confirm producer cards open correctly from each guide on desktop/mobile or responsive view;
6. record the production verification and mark Phase 10B **COMPLETE / CLOSED**.

No additional producer, Google-ID, location, narrative or road audit is required for this phase unless the final smoke reveals a regression.

## Next after Phase 10B

After the production gate passes, continue the broader Phase 10 regional programme with the wider Mediterranean programme, followed by Northern Europe, preserving the geography-open architecture and the same evidence-first quality bar.
