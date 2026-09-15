# Phase 10A — Santorini Inventory Audit

Date: 2026-09-15

Status: audit snapshot only. This document records the current live Santorini catalogue and source-backed corrections to make next. It does **not** apply production data changes.

## Audit rules

- Crete remains the reference-quality standard.
- Producer identity, visitability, location precision, road access, imagery provenance and partnership status are separate facts.
- Unknown values remain unknown.
- A public visit does not imply a TerroirTrail partnership or bookable Experience.
- No road-surface or rental-car claim is published without explicit evidence.
- Google Places media requires a manually verified Place ID; coordinate-only matching is not sufficient.
- Legacy ratings, review counts, prices, hospitality booleans and stock imagery are not trusted merely because they exist in the old row.

## Current live inventory

Production Supabase currently contains **9 Santorini producer rows**:

1. `canava-santorini-distillery` — Canava Santorini Distillery — distillery / current legacy category `kazani`
2. `domaine-sigalas-santorini` — Domaine Sigalas — winery
3. `estate-argyros-santorini` — Estate Argyros Santorini — winery
4. `gaia-wines-santorini` — GAIA Wines Santorini — winery
5. `gavalas-winery-santorini` — Gavalas Winery Santorini — winery
6. `santo-wines-santorini` — Santo Wines Cooperative — winery/cooperative
7. `santorini-brewing-company` — Santorini Brewing Company (Donkey Beer) — brewery
8. `vassaltis-vineyards` — Vassaltis Vineyards Santorini — winery
9. `venetsanos-winery-santorini` — Venetsanos Winery Santorini — winery

All 9 rows currently have:

- `google_place_id = NULL`
- `location_status = unreviewed`
- `visit_status = unreviewed`
- `road_access_status = unreviewed`
- legacy `road_access = paved`, despite no completed road audit
- legacy generic/stock Unsplash cover imagery
- legacy ratings/review counts/price levels and multiple hospitality fields that have not passed the Crete-style source audit

The database also contains **2 dormant Experience rows per Santorini producer (18 total)** and **0 active Experiences**. These remain non-public until future producer agreements.

The current bundled fallback/seed is Crete-only, so Santorini does not yet have an audited offline/fallback representation.

## Source-backed producer audit

### 1. Canava Santorini Distillery

**Current row:** Messaria; stored phone `+30 22860 32454`; stored website `https://canavasantorini.gr`; legacy `kazani` category.

**Supported now:**

- The operating identity is supported as **Canava Santorini Distillery**, Messaria, associated with Loukas Lygnos.
- Multiple current/established external sources give the contact phone as **+30 22860 31573**, not the number currently stored.
- A recent 2025 Santorini.net profile and Greek Gastronomy Guide describe the distillery as founded by Evangelos Lygnos in 1974, now continued by Loukas Lygnos, with an attached museum/visitor space.
- Greek Gastronomy Guide points to `www.canavasantorini.com`; the current TerroirTrail `.gr` URL has not yet been established as the producer's current authoritative web channel.

**Source strength:** identity is credible, but a current producer-controlled official site/visitor page has not yet been confirmed. Keep current visitability conservative until that is resolved.

**Next data action:**

- correct the phone only after final source reconciliation;
- resolve the authoritative website/domain;
- keep `visit_status` non-positive until a current producer-controlled visitor source is confirmed;
- verify exact map location and Google Place ID manually;
- review whether `kazani` is an acceptable product taxonomy label for a formal distillery/museum or whether a more precise distillery presentation is required.

Sources:
- https://www.santorini.net/canava-santorini-where-distillation-meets-history/
- https://www.greekgastronomyguide.gr/en/item/canava-santorini-distillery/

### 2. Domaine Sigalas

**Current row:** Oia (Baxedes plain); stored phone `+30 22860 71644`; stored website `https://sigalas-estate.com`.

**Supported now from the official current site:**

- Current official domain: **https://sigalas-wine.com**.
- Address: **Baxes, Oia, Santorini 84702**.
- Phone: **+30 22860 71644**.
- Domaine Sigalas has a visitable/tasting area.
- The official site states that **any visit requires advance booking**.
- The estate dates its operation to 1991 and documents Paris Sigalas' role in the estate's development.

**Proposed visit state after data migration:** `appointment_only`.

**Do not yet infer:** exact entrance coordinates or road surface from the address alone.

Sources:
- https://sigalas-wine.com/
- https://sigalas-wine.com/contact-en/

### 3. Estate Argyros Santorini

**Current row:** Episkopi Gonia; phone `+30 22860 31489`; website `https://estateargyros.com`.

**Supported now from official sources:**

- Address: **Episkopi Gonia, Thira 84700, Santorini**.
- Phone: **+30 22860 31489**.
- Estate Argyros was established in **1903**; the current winery in Episkopi was established in **2015**.
- Official wine-tour pages describe visits/tastings **by appointment**.
- Official FAQ says the winery is open year-round except national holidays and advises checking availability before visiting.
- Guests can arrive by private car, transfer, taxi or bus, and the property has parking. This supports practical vehicle access but **does not classify the road surface or rental-car suitability**.
- The official site states the oldest vineyard parcels exceed two centuries; avoid simplifying this into a blanket age claim for all vines.

**Proposed visit state after data migration:** `appointment_only`.

**Road state:** reviewed but road type still unpublished unless stronger road-surface evidence is found.

Sources:
- https://estateargyros.com/
- https://estateargyros.com/contact/
- https://estateargyros.com/tour/
- https://estateargyros.com/faq/

### 4. GAIA Wines Santorini

**Current row:** stored village `Monolithos / Kamari Beach`; stored phone `+30 22860 31761`; website `https://gaiawines.gr`.

**Supported now from official 2026 visitor information:**

- Current location wording: **Vrachies of Exo Gonia**, on eastern Santorini between Kamari and Monolithos, approximately five minutes from the airport.
- The winery occupies a restored early-20th-century tomato-processing building by the sea.
- 2026 visitor season: **29 April–31 October, daily 12:00–20:00**.
- Advance online booking is recommended; the official visitor page says walk-ins may be accommodated subject to availability.
- Current official phone: **+30 22860 34186**. The database phone is stale.
- Official pages support the restored tomato-factory story and the Thalassitis Submerged project.

**Proposed visit state after data migration:** `seasonal_public`, with the conditional walk-in wording kept in notes rather than flattened into a universal promise.

Sources:
- https://gaiawines.gr/en/visit-santorini-en/
- https://gaiawines.gr/en/santorini-en/

### 5. Gavalas Winery Santorini

**Current row:** Megalochori; phone `+30 22860 82552`; website `https://gavalaswines.gr`.

**Supported now from official sources:**

- Location: **Megalochori, Santorini 84700**.
- Phone: **+30 22860 82552**.
- Family winery; official site describes five generations of winemaking and three centuries of history.
- Official site states Gavalas vinifies Assyrtiko, Aidani, Mandilaria and Mavrotragano and is the only Santorini winery using the rare local Katsano and Voudomato varieties.
- Official wine-tasting page publishes visitor service **April–October, 11:00–19:00** and describes tastings/tours in the traditional and modern winery spaces.

**Proposed visit state after data migration:** `seasonal_public`. Do not assert unrestricted walk-in access unless explicitly confirmed.

Sources:
- https://www.gavalaswines.gr/
- https://www.gavalaswines.gr/contact
- https://www.gavalaswines.gr/wine-tasting

### 6. Santo Wines Cooperative

**Current row:** Pyrgos; stored phone `+30 22860 22233`; website `https://santowines.gr`.

**Supported now from official sources:**

- Wine Tourism Center: **Pyrgos Santorini, 84701**.
- The Wine Tourism Center is described by Santo Wines as **open all year round**.
- The current production-winery numbers are **+30 22860 22596 / 23137**.
- Current wine-tourism/reservation numbers are **+30 22860 28058 / 28099**.
- The database number `22233` is not the current contact number published on the official contact page.
- The current Pyrgos winery building is documented as built in **1992**. Do not conflate cooperative history with the construction date of the present winery.
- Wine tasting, winery tours, restaurant, shop and other services are directly operated by Santo Wines; these are not TerroirTrail Experiences.

**Proposed visit state after data migration:** `public_visits`, while specific guided tours can still carry reservation guidance.

Sources:
- https://santowines.gr/
- https://santowines.gr/visit-us
- https://santowines.gr/contact/company
- https://santowines.gr/winery-tour

### 7. Santorini Brewing Company (Donkey Beer)

**Current row:** Mesa Gonia; phone `+30 22860 30268`; website `https://santorinibrewingcompany.gr`.

**Supported now from official sources:**

- Location: **Mesa Gonia, Santorini**.
- Phone: **+30 22860 30268**.
- The brewery explicitly invites visitors to its tasting area above the brewery.
- Detailed brewery page states summer opening **Monday–Saturday 11:30–17:00**, winter (November–April) weekdays **12:00–16:00**, always closed Sunday.
- Appointments are requested for groups of **4+** because of limited space.
- The contact page contains a conflicting English summer-hours line (Monday–Friday 12:00–17:00), so use the detailed brewery page as the working source and retain the inconsistency in audit notes until directly reconciled.

**Proposed visit state after data migration:** `public_visits`, with group-booking and seasonal-hours notes.

**Do not retain without evidence:** the legacy claim that Santorini's water itself is a special mineral brewing ingredient.

Sources:
- https://www.santorinibrewingcompany.gr/the-brewery
- https://www.santorinibrewingcompany.gr/contact

### 8. Vassaltis Vineyards Santorini

**Current row:** Vourvoulos; stored phone `+30 22860 25056`; website `https://vassaltis.com`.

**Supported now from official sources:**

- Address: **Vourvoulos–Oia peripheral road, 84700, Santorini**.
- Current phone: **+30 22860 22211**. The database phone is stale.
- Official contact page publishes opening hours **11:00–20:00**.
- Vassaltis publishes wine experiences, lunch/dinner and an online reservation form.
- The official site identifies the project with Yannis Valambous and documents the winery team and vineyard/winemaking story.

**Proposed visit state after data migration:** `public_visits`, with booking availability noted; do not label walk-ins as guaranteed unless the producer states that explicitly.

Sources:
- https://vassaltis.com/
- https://vassaltis.com/contact/
- https://vassaltis.com/reservation-form/

### 9. Venetsanos Winery Santorini

**Current row:** Megalochori / Caldera; phone `+30 22860 21100`; website `https://venetsanoswinery.com`.

**Supported now from official sources:**

- Address: **Caldera Megalochori, P.O. Box 510, GR-84700 Santorini**.
- Phone: **+30 22860 21100**.
- Main Hall Terrace: **daily 11:00–20:00**.
- Sunset Terrace: **May–September 18:00–22:00**.
- Last tasting pour: **18:30**; reservations handled 11:00–19:00.
- Visitor/tasting operations are clearly public, but reservation availability should not be translated into a blanket walk-in promise.

**Proposed visit state after data migration:** `public_visits`.

Source:
- https://venetsanoswinery.com/contact/

## Cross-record cleanup required before Santorini can match Crete

### Trust-state reset

For all 9 rows:

- remove the legacy `road_access = paved` value unless explicit road evidence supports it;
- complete a road-access review independently of location verification;
- change `road_access_status` from `unreviewed` to an evidence-backed state only after review;
- keep road type NULL when the surface/width/suitability is not publicly confirmed.

### Legacy synthetic fields

The existing Santorini rows contain old ratings, review counts, price levels, hospitality booleans, food options, ethos tags and tasting-highlight copy that were not built under the Crete verification rules. These values must not be carried forward automatically. Each field must either receive a current source or become NULL/unknown.

### Stories and taglines

The old Santorini copy contains several promotional or over-specific assertions. Rebuild each story/tagline from current first-party evidence, using the same human but conservative tone as Crete. Avoid unsupported superlatives such as “world-renowned,” “legendary,” “first true Greek IPA,” “world-class sunset,” or precise product/process claims unless the source actually establishes them.

### Imagery

Current Santorini cover/gallery URLs are generic Unsplash images and are not acceptable as producer-authentic media. Keep them quarantined. After manual Google Place ID verification, use the same media hierarchy as Crete:

1. approved producer/host media;
2. explicitly credited local media;
3. live Google Places imagery with attribution;
4. neutral category fallback.

Do not download, cache, proxy or rehost Google Place photos.

### Location / Google Place ID audit

Official locality/address evidence now exists for most records, but the exact stored coordinates have not yet been revalidated against audited Google Place IDs. Location status should therefore not be upgraded merely from this document. Run the same manual Place-ID audit workflow used for Crete and persist IDs only after business identity and map position are confirmed.

### Offline/fallback parity

`src/data/producers.ts` and `supabase/seed.sql` currently contain the audited Crete catalogue only. Once the Santorini production records are cleaned and verified, generate an audited Santorini fallback representation rather than copying the legacy rows into source control.

## Recommended implementation order

1. Remove/neutralize legacy synthetic fields and fake `paved` road classifications in a reviewed Santorini data migration.
2. Correct verified official domains, phones, locality wording and visit statuses.
3. Rewrite all nine taglines/descriptions/stories from the sources above.
4. Manually verify exact map coordinates and Google Place IDs for all nine records.
5. Apply live Google imagery only after Place-ID verification.
6. Review road/access evidence independently; keep unknown roads unknown.
7. Add the audited Santorini catalogue to fallback/offline data.
8. Verify map/list cards, detail drawer, direct contact, deep links and mobile presentation.
9. Build Santorini Discovery Guides only from verified stops.
10. Run `npm run check`, deploy, and perform a Santorini production smoke pass before closing Phase 10A.
