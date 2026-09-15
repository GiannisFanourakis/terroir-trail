# Phase 10B — Google Place + Exact Location Audit, Batch 1

Date: 2026-09-15

Status: **In progress.** This batch records accepted Google business identities and the first producer-controlled exact-location links. Road access remains a separate, untouched trust dimension.

Scope: Peloponnese + Northern Greece + Tuscany / Italy.

## Current production state after this batch

Phase 10B live catalogue: **19 records**.

| Region | Records | Verified locations | Unresolved locations | Accepted Google Place IDs | Road classifications published |
|---|---:|---:|---:|---:|---:|
| Northern Greece | 9 | 4 | 5 | 2 | 0 |
| Peloponnese | 9 | 1 | 8 | 6 | 0 |
| Tuscany | 1 | 0 | 1 | 1 | 0 |
| **Total** | **19** | **5** | **14** | **9** | **0** |

All 19 records still have `road_access = NULL` and `road_access_status = unreviewed`. No exact-location decision in this audit is evidence of road surface, road width, standard-car suitability, rental-car suitability, parking, or entrance precision.

---

## Accepted Google Place IDs — 9

The following persistent `ChIJ…` Place IDs were accepted only where the Google listing identity matched the current producer name and current address/phone evidence. Persisting the ID alone did **not** change `location_status`.

### Northern Greece

- `kir-yianni-naoussa` — `ChIJd_C6CY-XVxMRwFU6h_zEof8`
  - Google identity: Kir-Yianni Winery, Yiannakohori 59200
  - Current phone match: +30 2332 051100
- `ktima-gerovassiliou` — `ChIJUfMMwwsUqBQRoUIYIMQbCgI`
  - Google identity: Gerovassiliou Estate, Epanomi 57500
  - Current phone match: +30 2392 044567

### Peloponnese

- `kykao-handcrafted-beers` — `ChIJyapU2RZLXhMREvVeN6Wjv0c`
  - Google identity: KYKAO Handcrafted, Platani 26504
  - Current phone match: +30 261 6007652
- `tetramythos-winery` — `ChIJ7XGKjVO-XxMReVt7WVgbCJ8`
  - Google identity: Tetramythos Winery, 8th km Pounta–Kalavryta road, Ano Diakopto
  - Current phone match: +30 2691 097500
- `ktima-tselepos` — `ChIJHXFisgYYYBMRZxx-VMAJx1s`
  - Google identity: Ktima Tselepos, 14th km Tripoli–Kastri road, Rizes
  - Current phone match: +30 271 0544440
- `domaine-mercouri` — `ChIJL4_ZhHa4YBMRhEDxMie9GGg`
  - Google identity: Mercouri Estate, Korakochori
  - Current phone match: +30 2621 041601
- `semeli-estate-nemea` — `ChIJ2Smk-U0GoBQRzptIjnEnPU0`
  - Google identity: Semeli Estate, Koutsi 20500
  - Current phone match: +30 2746 020360
- `skouras-winery-nemea` — `ChIJfXHxqfz7nxQRao9QAPAeJLQ`
  - Google identity: Domaine Skouras, 10th km Argos–Sternas road, Malandreni
  - Current phone match: +30 2751 023688

### Tuscany

- `monteraponi-tuscany` — `ChIJkZQPIE3LKxMR2vIDXqZvH54`
  - Google identity: Monteraponi, Località Monteraponi 1, Radda in Chianti
  - Current phone match: +39 0577 738208

Migration: `20260915101536_phase10b_persist_verified_google_place_ids_batch1`.

### Explicitly withheld candidate

Sknipa / Standard Microbrewery of Thessaloniki has a plausible `ChIJ…` Google listing with the current first-party phone, but its map-address presentation was not strong enough to prove that the point is the actual production facility at the first-party `17th km Thessaloniki–Polygyros` location rather than another customer-facing point. The candidate was deliberately **not** persisted.

Numeric directory IDs, TripAdvisor IDs, Google CIDs and other non-`ChIJ…` identifiers were not accepted as Google Place IDs.

---

## Producer-controlled exact locations verified — 5

These five producers publish a contact page that links directly to a specific Google Maps business point. The map destination and the producer-controlled identity/address were matched before updating coordinates.

### Ktima Pavlidis — `ktima-pavlidis`

- verified point: `41.2009752, 23.9524658`
- first-party source: `https://ktima-pavlidis.gr/en/contact-2/`
- source page publishes Kokkinogia, Drama and links directly to the Ktima Pavlidis Google Maps point
- result: `location_status = verified_location`
- Google Place ID: still unknown

### Alpha Estate — `alpha-estate`

- verified point: `40.6941926, 21.7063052`
- first-party source: `https://alpha-estate.com/contact/`
- source page publishes 2nd km Amyndeon–St. Panteleimon and links directly to the Alpha Estate Google Maps destination
- result: `location_status = verified_location`
- Google Place ID: still unknown

### Domaine Biblia Chora — `domaine-biblia-chora`

- verified point: `40.8118053, 23.9908103`
- first-party source: `https://bibliachora.gr/en/contact/`
- source page publishes Kokkinochori, Kavala and links directly to the Ktima Biblia Chora Winery Google Maps point
- result: `location_status = verified_location`
- Google Place ID: still unknown

### Thymiopoulos Vineyards — `thymiopoulos-naoussa`

- verified point: `40.5741154, 22.1475532`
- first-party source: `https://www.thymiopoulosvineyards.gr/contact`
- source page publishes Trilofos, Naoussa and links directly to the Thymiopoulos Vineyards Google Maps point
- result: `location_status = verified_location`
- Google Place ID: still unknown

### Monemvasia Winery / Tsimbidi — `monemvasia-winery`

- verified point: `36.7338774, 22.9670391`
- first-party source: `https://www.monemvasiawinery.gr/en/contact/`
- source page links directly to the Monemvasia Winery Tsimbidi Google Maps point
- result: `location_status = verified_location`
- Google Place ID: still unknown

Migration: `20260915101844_phase10b_verify_first_party_linked_locations_batch1`.

## Why this correction matters

Several verified first-party map points differ materially from the old legacy coordinates. The old coordinates were therefore correctly quarantined instead of being treated as safe navigation points simply because they looked plausible.

The audit deliberately uses `verified_location`, not `verified_entrance`: a producer-linked Google business point does not by itself prove the exact driveway/entrance.

---

## Still unresolved — 14 exact locations

The following remain unresolved until coordinate evidence is independently matched:

### Place ID known, coordinates still awaiting independent location confirmation

- Ktima Kir-Yianni Naoussa
- Ktima Gerovassiliou
- KYKAO Handcrafted
- Tetramythos Winery
- Ktima Tselepos
- Domaine Mercouri
- Semeli Estate Nemea
- Domaine / Ktima Skouras
- Azienda Agricola Monteraponi

### Neither accepted Place ID nor completed exact-location review yet

- Domaine Karanika
- Siris Craft Brewery / Voreia
- Sknipa / Standard Microbrewery of Thessaloniki
- GAIA Wines Nemea
- Liokareas

Liokareas remains a special entity/location case: current first-party material supports a family olive-oil producer and family farm in Mani plus a packaged harvest trip, but not a normal public mill/estate point that TerroirTrail can safely expose as an ordinary producer destination.

---

## Route and imagery implications

- No Phase 10B Discovery Guide is published yet.
- The three pre-audit Phase 10B marketing routes remain non-publishable; an automated test now enforces that no Peloponnese, Northern Greece or Tuscany route may become `verified_stops` / `verified` accidentally during the audit.
- Phase 10B Google imagery remains disabled because Google Places eligibility is currently built from the audited Crete and Santorini catalogues only. A Place ID by itself is not enough.
- Location verification does not change road status.

## Next actions

1. Resolve exact coordinates for the nine records that already have accepted Place IDs, preferably through producer-controlled map links or an equivalent independent location match.
2. Resolve Place ID/location evidence for Karanika, Siris, Sknipa and GAIA Nemea.
3. Resolve Liokareas entity type and the correct public-facing Greek location, if one exists; otherwise keep it non-navigable.
4. Only after the location layer is complete, perform the separate road/access review.
5. Regenerate/add Phase 10B fallback catalogues only after live rows are fully source-clean.
6. Run the full project quality gate before deployment.
