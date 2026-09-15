# Phase 10B — Inventory + Identity / Visitability Audit

Date: 2026-09-15

Status: **Baseline audit complete; no Phase 10B producer is reference-quality yet.**

Scope: Peloponnese + Northern Greece + Tuscany / Italy.

This report records the starting state of the live Supabase catalogue and the first source-backed identity/contact/visitability pass. It deliberately does **not** upgrade location confidence, road access, Google Place IDs, imagery eligibility, or Discovery Guide status. Those are separate trust dimensions.

## Live catalogue baseline

Live Supabase contains **19 Phase 10B producer records**:

- **Peloponnese:** 9
- **Northern Greece:** 9
- **Tuscany:** 1

At the start of this audit, all 19 records share the same legacy-risk pattern:

- `location_status = unreviewed`
- `visit_status = unreviewed`
- `road_access = paved`
- `road_access_status = unreviewed`
- `google_place_id IS NULL`
- legacy rating/review/price or VIP-style metadata remains present
- legacy tasting-highlight arrays and hospitality booleans remain present on the live rows

The existing `producerService` already suppresses the legacy `road_access = paved` value unless `road_access_status = verified`, which is correct. Other unreviewed legacy presentation fields still require quarantine or source-backed cleanup before Phase 10B can be treated as trustworthy.

## Commercial / Experience quarantine check

The live database currently contains:

- Northern Greece: **18 Experience rows, 0 active**
- Peloponnese: **18 Experience rows, 0 active**
- Tuscany: **0 Experience rows, 0 active**

No Phase 10B Experience should be activated during the regional audit. Public visitability remains separate from a TerroirTrail partnership or bookable Experience.

## Legacy route audit

`src/data/loops.ts` still contains three pre-audit marketing routes:

- `peloponnese-mythic-trail`
- `northern-greece-royal-trail`
- `tuscany-chianti-classico-trail`

They contain unsupported or unaudited timing, distance, road, tasting and descriptive claims. They currently have no `verificationStatus`, so `DayTripModal` filters them out and they are **not published**. They must remain quarantined and should be removed/rebuilt rather than upgraded in place. Any future Phase 10B Discovery Guide must be rebuilt from reviewed stops and must keep multi-stop driving navigation fail-closed unless independent road evidence is complete.

---

# Northern Greece — 9 records

## 1. Ktima Pavlidis — `ktima-pavlidis`

**Current DB:** Drama / Kokkinogia; winery.

**Identity/contact:** verified from current first-party site.

**Visit evidence:** strong first-party evidence. The estate says it welcomes visits six days per week upon communication and publishes current visiting hours.

**Primary source:** https://ktima-pavlidis.gr/en/contact-2/

**Provisional visit decision:** suitable for `appointment_only` / advance-contact wording after data reconciliation.

**Keep unknown for now:** exact location confidence, road classification, rental-car suitability, Google Place ID.

## 2. Alpha Estate — `alpha-estate`

**Current DB:** Florina / Amyndeon; winery.

**Identity/contact:** verified from current first-party site.

**Visit evidence:** strong first-party evidence. Visits are published daily/weekends 10:00–17:00 upon request, with reservation contacts.

**Primary source:** https://alpha-estate.com/visit/

**Provisional visit decision:** `appointment_only`.

**Keep unknown for now:** exact location confidence, road classification, Google Place ID.

## 3. Domaine Karanika — `domaine-karanika`

**Current DB:** Florina / Amyndeon; winery.

**Identity:** verified from current first-party site and current 2026 site content.

**Visit evidence:** insufficient in the first pass. The current site confirms the winery, vineyards and contact navigation but the audit did not find a current public visitor programme or booking terms.

**Primary source:** https://karanika.com/

**Provisional visit decision:** remain unknown / `not_publicly_confirmed` until stronger evidence exists.

**Keep unknown for now:** visitor terms, exact location confidence, road access, Google Place ID.

## 4. Domaine Biblia Chora — `domaine-biblia-chora`

**Current DB:** Kavala / Kokkinochori; winery.

**Identity/contact:** verified from current first-party site.

**Visit evidence:** strong first-party evidence. The estate publishes Monday–Friday visits, 10:00–14:00, upon request.

**Primary source:** https://bibliachora.gr/en/visit-the-estate/

**Contact source:** https://bibliachora.gr/en/contact/

**Provisional visit decision:** `appointment_only`.

**Keep unknown for now:** exact location confidence, road access, Google Place ID.

## 5. Ktima Kir-Yianni Naoussa — `kir-yianni-naoussa`

**Current DB:** Naoussa / Yiannakohori; winery.

**Identity/contact:** verified from current first-party site.

**Visit evidence:** strong current first-party evidence. Naoussa is open Tuesday–Sunday, 11:00–18:00, and reservations are necessary.

**Primary source:** https://kiryianni.gr/visit/

**Contact source:** https://kiryianni.gr/contact/

**Provisional visit decision:** `appointment_only`.

**Keep unknown for now:** exact location confidence, road access, Google Place ID.

## 6. Thymiopoulos Vineyards Naoussa — `thymiopoulos-naoussa`

**Current DB:** Naoussa / Trilofos; winery.

**Identity/contact:** verified from current first-party site/materials.

**Contact correction candidate:** current first-party materials publish `+30 2331 093 604` and `+30 693 206 4161`; the live DB currently carries the older `+30 23320 44200`.

**Primary source:** https://www.thymiopoulosvineyards.gr/

**Visit evidence:** insufficient in the first pass. No current first-party public visiting programme was found.

**Provisional visit decision:** remain unknown / `not_publicly_confirmed`.

**Keep unknown for now:** visitor terms, exact location confidence, road access, Google Place ID.

## 7. Siris Craft Brewery / Voreia — `siris-craft-brewery`

**Current DB:** Serres; brewery.

**Identity/contact:** verified from current first-party site.

**Current-source corrections:**

- website should be reviewed against `https://www.sirisbrewery.com/`
- current first-party phone: `2321 099 949`
- current address: 6th km National Road Serres–Thessaloniki, 62100 Serres

**Primary source:** https://www.sirisbrewery.com/en/contact-us/

**Visit evidence:** partial but meaningful. The brewery explicitly says it is delighted to welcome visitors and take them on a brewery tour, but ordinary visit hours/booking rules are not published clearly enough in the first pass.

**Provisional visit decision:** do not infer walk-in access; use advance-contact wording or keep `not_publicly_confirmed` until visit terms are pinned down.

**Keep unknown for now:** walk-in status, exact location confidence, road access, Google Place ID.

## 8. Ktima Gerovassiliou — `ktima-gerovassiliou`

**Current DB:** Thessaloniki / Epanomi; winery.

**Identity/contact:** verified from current first-party site.

**Contact correction candidate:** current first-party phone is `+30 23920 44567`; live DB currently carries `+30 23920 44526`.

**Visit evidence:** strong first-party evidence. The estate and Wine Museum publish public opening times; advance booking is required for groups and schools.

**Primary source:** https://gerovassiliou.gr/en/contact

**Provisional visit decision:** `public_visits` with current-hours caveat.

**Keep unknown for now:** exact entrance confidence, road access, Google Place ID.

## 9. Standard Microbrewery of Thessaloniki / Sknipa — `propator-sknipa-brewery`

**Current DB:** Thessaloniki / Nea Raidestos; brewery.

**Identity/contact:** verified, but live DB identity/contact details are stale.

**Current-source corrections:**

- current first-party site: https://www.sknipa.beer/
- current facility: 17th km Thessaloniki–Polygyros, Thermi area
- current phone: `+30 2310 463 444`

**Primary sources:**

- https://www.sknipa.beer/en/
- https://www.sknipa.beer/en/facilities

**Visit evidence:** insufficient for ordinary public access. The brewery participates in the annual Open Breweries initiative, but an event-specific open day is not proof of normal year-round visitor access.

**Provisional visit decision:** remain `not_publicly_confirmed` until regular visiting terms are found.

**Keep unknown for now:** ordinary visitor access, exact location confidence, road access, Google Place ID.

---

# Peloponnese — 9 records

## 1. KYKAO Handcrafted Beer — `kykao-handcrafted-beers`

**Current DB:** Achaia / Patras; brewery.

**Identity/contact:** verified from current first-party site.

**Current-source corrections:**

- current phone: `2616007652`
- current location text: Platani 26504, Patra

**Primary sources:**

- https://kykao.gr/
- https://kykao.gr/contact-us

**Visit evidence:** partial. The current first-party site exposes a Tap Room and a `Visit Tap Room` entry point, but the first pass did not establish dependable current opening/booking terms.

**Provisional visit decision:** do not infer walk-in access; retain conservative advance-contact / unconfirmed wording until terms are verified.

**Keep unknown for now:** visit schedule, exact location confidence, road access, Google Place ID.

## 2. Tetramythos Winery — `tetramythos-winery`

**Current DB:** Aigialeia / Ano Diakopto; winery.

**Identity:** verified from current first-party site.

**Visit evidence:** partial-to-strong. The official site explicitly labels the estate a winery to visit and advertises guided tours, but the first pass did not establish current hours/booking rules.

**Primary source:** https://www.tetramythoswines.com/en/

**Provisional visit decision:** visitor-capable, but do not invent walk-in/appointment terms; retain conservative status until operational details are confirmed.

**Keep unknown for now:** exact visit terms, location confidence, road access, Google Place ID.

## 3. Ktima Tselepos — `ktima-tselepos`

**Current DB:** Arcadia / Rizes; winery.

**Identity/contact:** verified from current first-party site.

**Visit evidence:** strong current first-party evidence. Tours are available daily Monday–Sunday by appointment; the estate publishes current tasting programmes and contact details.

**Primary sources:**

- https://tselepos.gr/%CE%B5%CF%80%CE%B9%CF%83%CE%BA%CE%B5%CF%86%CF%84%CE%B5%CE%AF%CF%84%CE%B5-%CE%BC%CE%B1%CF%82/?lang=en
- https://tselepos.gr/contact/?lang=en

**Provisional visit decision:** `appointment_only`.

**Keep unknown for now:** exact location confidence, road access, Google Place ID.

## 4. Domaine Mercouri — `domaine-mercouri`

**Current DB:** Ilia / Korakochori; winery.

**Identity:** verified; official estate site remains online.

**Visit evidence:** historically strong first-party evidence but stale. Official Mercouri material publishes Monday–Saturday 09:00–15:00 visitor access and tours/tastings, but the accessible visitor documents are old enough that the schedule should not be treated as current without reconfirmation.

**Primary sources:**

- https://www.mercouri.gr/
- https://www.mercouri.gr/instructions_en.pdf
- https://www.mercouri.gr/brochure_en.pdf

**Provisional visit decision:** `current_access_uncertain` or equivalent conservative wording until current operating details are confirmed.

**Keep unknown for now:** current visiting hours, exact location confidence, road access, Google Place ID.

## 5. Monemvasia Winery / Tsimbidi — `monemvasia-winery`

**Current DB:** Laconia / Velies; winery.

**Identity/contact:** verified from current first-party site.

**Contact correction candidate:** current phone is `+30 2732 071 705`; live DB currently carries `+30 27320 54104`.

**Visit evidence:** strong current first-party evidence. Tours/tastings are Tuesday–Saturday 10:00–16:00 and reservation is required.

**Primary sources:**

- https://www.monemvasiawinery.gr/en/tour-tasting/
- https://www.monemvasiawinery.gr/en/contact/

**Provisional visit decision:** `appointment_only`.

**Keep unknown for now:** exact location confidence, road access, Google Place ID.

## 6. Liokareas — `liokareas-olive-estate`

**Current DB:** Messinia / Mani Peninsula; currently typed `olive_mill`.

**Identity:** genuine producer brand/family-farm story is supported by the current first-party site.

**Entity/category warning:** current evidence does **not** yet establish that the TerroirTrail record should be presented as a normal publicly visitable olive mill at the current mapped point. The first-party site is primarily a producer/e-commerce brand and promotes an annual multi-day Harvest Trip to the family farm.

**Contact warning:** the live DB Greek phone should not be treated as current merely because it exists. Current first-party public contact is `1-888-96-OILIO` / `sales@liokareas.com`.

**Primary sources:**

- https://www.liokareas.com/pages/contact-us
- https://www.liokareas.com/collections/harvest-trip-2026

**Visit evidence:** special packaged harvest-trip access exists, but that is not evidence of ordinary drop-in/public mill visitation.

**Provisional visit decision:** `not_publicly_confirmed` for ordinary producer visits.

**Required next audit:** resolve entity type, exact Greek production/farm location, whether the listing is an olive estate/farm versus mill, and whether any normal public visit programme exists.

## 7. GAIA Wines Nemea — `gaia-wines-nemea`

**Current DB:** Nemea / Koutsi; winery.

**Identity/contact:** verified from current first-party site.

**Visit evidence:** strong current first-party evidence. Nemea is open year-round Wednesday–Sunday 10:30–16:30; advance online booking is recommended and the site notes walk-ins may be accommodated subject to availability.

**Primary sources:**

- https://gaiawines.gr/en/visit-nemea-en/
- https://gaiawines.gr/en/contact/

**Provisional visit decision:** `public_visits` with booking recommended.

**Keep unknown for now:** exact location confidence, road access, Google Place ID.

## 8. Domaine / Ktima Skouras — `skouras-winery-nemea`

**Current DB:** Nemea area / Malandreni (Argos); winery.

**Identity/contact:** identity and current location are strongly corroborated; current public contact remains `+30 27510 23688`, `info@skouras.gr`.

**Visit evidence:** current third-party regional/wine sources describe the winery as visitable with tastings, but the first pass did not retrieve a sufficiently current first-party visitor page.

**Corroborating source:** https://www.wondergreece.gr/v1/en/Regions/Korinthia_Prefecture/Local_Products_Gastronomy/Wineries/15184-Domaine_Skouras

**Provisional visit decision:** do not promote to a verified public-visit state until current first-party evidence is obtained.

**Keep unknown for now:** current visiting terms, exact location confidence, road access, Google Place ID.

## 9. Semeli Estate Nemea — `semeli-estate-nemea`

**Current DB:** Nemea / Koutsi; winery.

**Identity/contact:** verified from current first-party site.

**Visit evidence:** strong current first-party evidence. Wine-tourism programmes are available every day except Tuesday; booking is mandatory.

**Primary source:** https://www.semeliestate.gr/contact/

**Provisional visit decision:** `appointment_only`.

**Note:** the current source also publishes age and pet rules, but those should only be exposed if deliberately retained as source-backed facts rather than inherited from legacy booleans.

**Keep unknown for now:** exact location confidence, road access, Google Place ID.

---

# Tuscany — 1 record

## Azienda Agricola Monteraponi — `monteraponi-tuscany`

**Current DB:** Tuscany / Radda in Chianti; winery.

**Identity/contact:** verified from current first-party site.

**Visit evidence:** strong current first-party evidence. Tastings/visits are available Monday–Friday 09:00–17:00 by advance booking.

**Primary source:** https://www.monteraponi.it/contatti_azienda_agricola_monteraponi.php?lang=en

**Provisional visit decision:** `appointment_only`.

**Keep unknown for now:** exact location confidence, road access, Google Place ID.

---

# First-pass outcome

## Strong current first-party visit evidence

The following records have enough current first-party evidence to support a later visit-status update after reconciliation:

1. Ktima Pavlidis
2. Alpha Estate
3. Domaine Biblia Chora
4. Ktima Kir-Yianni Naoussa
5. Ktima Gerovassiliou
6. Ktima Tselepos
7. Monemvasia Winery / Tsimbidi
8. GAIA Wines Nemea
9. Semeli Estate Nemea
10. Azienda Agricola Monteraponi

## Partial / requires operational confirmation

1. Siris Craft Brewery — tours welcomed, ordinary scheduling not yet pinned down
2. KYKAO — Tap Room/visit entry exists, dependable current visit terms not yet pinned down
3. Tetramythos — guided tours advertised, current hours/booking rules not yet pinned down
4. Domaine Mercouri — first-party visitor evidence exists but is stale and needs current reconfirmation

## Keep visitability unconfirmed

1. Domaine Karanika
2. Thymiopoulos Vineyards
3. Sknipa / Standard Microbrewery of Thessaloniki for normal year-round access
4. Domaine Skouras until current first-party visitor evidence is retrieved
5. Liokareas for ordinary farm/mill access

---

# Next execution order

1. **Quarantine legacy presentation fields** for explicitly unreviewed producers so old ratings, review counts, price levels, VIP perks, tasting packages and hospitality booleans cannot masquerade as verified facts.
2. **Apply source-backed identity/contact corrections** only where current first-party evidence is strong.
3. **Update visit statuses** for the 10 strong-evidence records; keep all others conservative/unknown.
4. **Resolve the five weak/ambiguous visitor cases**, with special entity-type review for Liokareas.
5. **Manual Google Place ID + location audit** for all 19 records. A Google business pin may establish location confidence but does not establish road safety.
6. **Road/access audit separately.** Do not infer paved road, standard-car suitability or rental-car suitability from an address, Google pin, parking mention or ordinary driving directions.
7. **Build audited fallback data** for Phase 10B only after live values are source-clean.
8. **Remove/rebuild legacy Phase 10B marketing routes** as verified-stop Discovery Guides only after stop/location/visit reviews are complete.
9. Run `npm run check`, deploy, and production-smoke each region before reference-quality closeout.

## Trust invariants retained

- Public visitability does not imply a TerroirTrail partnership.
- No Phase 10B Experience is activated.
- A verified location does not prove road safety.
- Unknown road conditions remain unknown.
- Google imagery cannot be enabled before a manually verified Place ID/location mapping.
- Event-specific open days do not prove normal year-round visitor access.
- A packaged tour is not automatically evidence of ordinary public producer visitation.
- Multi-stop navigation remains fail-closed until independent road-access evidence supports it.
