# Phase 13 — Greek Cheese & Dairy Expansion: Stage 3 Import Readiness

Date: 2026-09-16

## Purpose

This stage converts the owner-approved 16-producer shortlist into an import-readiness queue. It does **not** authorize publication. The goal is to separate records that already have a well-defined production-site identity from those that still need exact map-point resolution.

TerroirTrail rules remain unchanged:

- exact coordinates are never guessed from a village/locality;
- a shop, office, cooperative HQ or reseller does not silently replace the production site;
- public business hours do not automatically mean tours or tastings;
- road access remains unclassified unless explicit evidence supports a road type;
- protected-origin claims are stated only where producer/certification evidence supports them.

## Current common state

All 16 candidates still pass producer identity, product and producer-controlled contact checks from Stage 2.

Road access remains `not_publicly_confirmed` for all 16. No source reviewed so far provides sufficiently specific, current road-surface/width/normal-rental-car evidence for publication.

No candidate is inserted into Supabase in this stage.

---

## Tier A — strongest candidates for exact map-point persistence

These records have the clearest production-site identity and should be resolved first. They are not yet import-ready because coordinates/entrance role still require a final exact-point match.

### 1. Stamatogiorgis Dairy — Smari Pediados, Heraklion

- Producer site: https://stamatogiorgis.gr/en/
- Production locality: Smari Pediados, Kastelli, Heraklion 70006
- Google business identity candidate already isolated in Stage 2: `ChIJDZQB-RFhmhQRcsREVVyuhSQ`
- Current producer site explicitly mentions tasting experiences at its facilities.
- Conservative visit state until procedure/hours are explicit: **hold; do not mark walk-in/public yet**.
- Next action: manually confirm the Google pin is the production/tasting facility, capture exact coordinates, then persist as `production_site`.

### 2. ELATOS / Kapetanou Bros — Alogomandra, Schinochori, Argos

- Producer site: https://afoikapetanou.gr/
- Production address: Alogomandra Schinochoriou, Argos 21200
- Google business identity candidate already isolated in Stage 2: `ChIJce0j3iH-nxQRSYbQZyh7_Q0`
- Visitability: `not_publicly_confirmed`.
- Next action: confirm the Google business point matches the dairy facility rather than an office/shop, capture coordinates and persist mapped-point role.

### 3. Arvanitis Dairy — Neochorouda, Thessaloniki

- Producer site: https://arvanitis.gr/en/company/the-company/
- Production address: Symmachiki Odos, Neochorouda 54500
- Google business identity candidate already isolated in Stage 2: `ChIJ8VOFJRcxqBQR5ROjidyM_FI`
- The public Agora Modiano Experience Store is a separate `producer_shop` identity and must not replace the factory.
- Visitability of factory: `not_publicly_confirmed`.
- Next action: confirm exact Neochorouda factory pin and coordinates.

### 4. O Mythos tou Vounou — Kato Oreini, Serres

- Producer site: https://omythostouvounou.gr/en/locations
- Dairy address: Kato Oreini, Serres 62100
- Producer publishes current dairy hours: Mon–Sat 09:00–18:00; Sun closed.
- Producer publishes route directions: from Serres toward Lailias; Kato Oreini is reached after 17 km.
- The site says the dairy is in Kato Oreini and separates it from 27 retail sales points.
- Public-facing evidence is strong, but the site does not explicitly promise production tours or tastings.
- Next action: resolve exact dairy entrance/pin and map role. Candidate visit state after pin verification should remain conservative unless ordinary customer access is explicitly established.

### 5. Baladinos & Sons — Varipetro, Chania

- Producer site: https://www.balantinos.gr/en/quality/
- First-party evidence states that all production activity moved to privately owned facilities in Varipetro in 2014.
- Current third-party business directories consistently identify the factory at Varipetro Kydonias, Chania (postal code listings vary between 73100/73500).
- Central Chania retail shop remains a separate identity.
- Visitability of factory: `not_publicly_confirmed`.
- Next action: resolve the exact Varipetro factory pin/coordinates and ensure no Chania retail point is substituted.

### 6. Katsouli Cheese Factory — Koliaki / Trachia, Argolida

- Producer site: https://katsou.gr/en/Contact
- Production address: Epar.Od. Old Epidaurus–Tracheia, Koliaki, Argolida 21052
- Producer describes the dairy itself as the family cheese factory in Koliaki/Trachia.
- Visitability remains `not_publicly_confirmed`; destination-style editorial wording does not equal a published visitor programme.
- Next action: exact road-address pin resolution and coordinate capture.

### 7. Agricultural Dairy Cooperative of Kalavryta — Xirokampos, Kalavryta

- Producer site: https://www.kalavritacoop.gr/en
- Certification evidence resolves the production site more precisely than the general contact page:
  - **Production Site: 2nd km Kalavryta–Patras, Xirokampos, 25001 Kalavryta, Achaia**
  - Current supporting certificate: https://www.kalavritacoop.gr/managed_images/certifications/TUVNORD-PRODUCTION-2-2025.pdf
- Cooperative HQ at Konstantinou Fassou & Agias Lauras is distinct from the production site.
- Visitability of production site: `not_publicly_confirmed`.
- Next action: map the Xirokampos production site, not HQ; capture exact coordinates and role.

### 8. Christakis / Patria Feta — Proastio, Edessa

- Producer site: https://www.patriafeta.com/
- Production address: 3rd km Edessa–Flamouria, Proastio Edessas 58200
- Visitability: `not_publicly_confirmed`.
- Next action: resolve the road-address factory pin and confirm the point is Patria/Christakis production, not an unrelated Christakis business.

---

## Tier B — producer locality is strong; exact production pin still unresolved

These records remain approved but need a better exact-site match before any import.

### 9. Psiloritis Cheese Dairy — Livadia Mylopotamou, Rethymno

- Producer site: https://www.psiloriths.gr/en/the-company/
- Current first-party evidence confirms the family dairy in Livadia and explicitly says the business relocated to new facilities in 2007.
- Blocker: exact post-2007 facility/entrance pin is not independently resolved.
- Visitability: `not_publicly_confirmed`.

### 10. GYPAS / Gyparaki Bros — Asi Gonia

- Producer site: https://www.gypas.gr/en/the-creamery
- Producer confirms the modern 3,000 m² creamery is at the edge of Asi Gonia, distinct from the original village-centre creamery.
- Blocker: exact current edge-of-village production pin is unresolved.
- Visitability: `not_publicly_confirmed`.

### 11. KARGAKIS Dairy Products — Anopoli, Heraklion

- Producer site: https://kargaki.gr/about-us/?lang=en
- Producer confirms relocation to new Anopoli facilities in 2009.
- Published address: Anopoli, Heraklion 70008.
- Blocker: exact production-site entrance/pin unresolved.
- Visitability: `not_publicly_confirmed`.

### 12. O Polyfimos — Eva, Messinia

- Producer dairy identity is independently corroborated in Eva, Androusa 24200, with the same phone used in the Stage 2 audit.
- Producer also has retail identities; those must remain separate.
- Blocker: exact Eva dairy pin unresolved.
- Visitability of dairy: `not_publicly_confirmed`.

### 13. Tsatsoulis Cheese — Panagitsa, Arcadia

- Producer site: https://www.tsatsoulis.com.gr/
- Published producer address: Panagitsa, 22002, Arcadia.
- Blocker: exact production-site pin/entrance unresolved.
- Visitability: `not_publicly_confirmed`.

### 14. ARGOGAL / Koromichi Family — Kefalari, Argos

- Producer site: https://www.argogal.gr/en/company
- Producer confirms modern 2,000 m² production facilities in Kefalari, Argos.
- Blocker: exact factory pin/entrance unresolved.
- Visitability: `not_publicly_confirmed`.

### 15. Vogiatzis Traditional Cheeses of Lagadas — Perivolaki

- Producer site: https://www.feta-vogiatzis.gr/en
- Producer confirms private production facilities in Perivolaki Lagada.
- Blocker: exact facility pin unresolved.
- Visitability: `not_publicly_confirmed`.

### 16. Karagiannis Theofilos Dairy Products — Arnaia, Chalkidiki

- Producer site: https://www.karagiannifeta.gr/en/about
- Producer confirms modern facilities north of Arnaia; current public address context is Arnaia 63074 / Arnaia–Apollonia road.
- Blocker: exact production-site pin unresolved.
- Visitability: `not_publicly_confirmed`.

---

## Import-readiness result

### Ready for final exact-point resolution first

1. Stamatogiorgis Dairy
2. ELATOS / Kapetanou Bros
3. Arvanitis Dairy
4. O Mythos tou Vounou
5. Baladinos & Sons
6. Katsouli Cheese Factory
7. Agricultural Dairy Cooperative of Kalavryta
8. Christakis / Patria Feta

These eight have enough production-site specificity that a final exact map/entrance match is the remaining location gate.

### Still require deeper site-resolution research

9. Psiloritis Cheese Dairy
10. GYPAS / Gyparaki Bros
11. KARGAKIS Dairy Products
12. O Polyfimos
13. Tsatsoulis Cheese
14. ARGOGAL / Koromichi Family
15. Vogiatzis Traditional Cheeses of Lagadas
16. Karagiannis Theofilos Dairy Products

## Publication rule

No Stage 3 candidate is public-import authorized until exact coordinates are resolved without guessing. When a precise production point is confirmed, the record may be prepared with:

- `category = cheese_dairy`
- verified `destination`, country, region and locality
- `public_point_type = production_site` unless evidence proves another role
- conservative `visit_status`
- `road_access_status = not_publicly_confirmed` unless a later road audit resolves it
- source-backed `product_specialties`
- source-backed story/tagline only
- Google Place ID only when the exact production entity is positively matched

The first import batch should be the subset of Tier A that clears exact-point verification, not an arbitrary numerical target.