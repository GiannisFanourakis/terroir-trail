# Phase 13 Dairy Content & Media Pass

Date: 2026-09-16

## Final scope

The dairy implementation workstream originally imported 12 researched additions. After the final Google business-identity review, the project owner chose to remove five listings whose exact persistent Google Place identity could not be verified to the agreed publication standard.

The retained expansion therefore contains **7 new dairy/cheese producers**, alongside the **2 pre-existing dairy records**, for a final live dairy catalogue of **9 records**.

The five removed listings are:

- GYPAS / Gyparaki Bros
- Iliakis Dairy / Meraki Iliaki
- Agricultural Dairy Cooperative of Kalavryta
- Katsouli Cheese Factory
- Tsatsoulis Cheese

They were removed rather than retaining coordinate-only or otherwise incomplete Google identity matches. No Place ID was guessed from coordinates or substituted from a retailer or nearby business.

At removal time, all five records had **0 bookings, 0 reviews, and 0 Experience rows**, so the deletion did not remove traveler activity or commercial data.

## Final retained dairy set

The seven retained additions are:

- ARGOGAL / Koromichi Family
- Arvanitis Dairy
- Baladinos & Sons
- Christakis / Patria Feta
- ELATOS / Kapetanou Bros
- Psiloritis Cheese Dairy
- Stamatogiorgis Dairy

Together with the pre-existing Aerakis Cheese Products and Tzourmpakis Dairy records, the live dairy vertical now contains **9 producers**.

## Google Places media state

All **9 / 9 retained dairy records** now carry a persistent manually audited Google Place ID and an eligible verified location state.

The seven retained additions therefore use the same live Google Places media path as the earlier audited catalogue:

`verified producer → persistent google_place_id → live producer eligibility → Google Places media`

The current card, drawer, carousel and related media eligibility checks use the live producer trust object. A producer does not need to be added manually to a legacy static allowlist when the live record itself has both a persistent audited Place ID and `verified_location` / `verified_entrance` status.

Google imagery remains supplementary discovery media. It is not evidence of a TerroirTrail partnership, public visitability, entrance precision, road safety, or an Experience offer. Google photo content is loaded live and is not persisted or rehosted as TerroirTrail-owned producer photography.

## Retained content sources and additions

### ARGOGAL / Koromichi Family

Official sources:
- https://www.argogal.gr/en/company
- https://www.argogal.gr/en/products

Added: 1916 family origin in Krya Vrysi, early-1960s second generation, 1994 transition to the three sons and modern Kefalari facilities, Peloponnese sheep/goat milk context, and the current cheese range.

### Arvanitis Dairy

Official sources:
- https://arvanitis.gr/en/company/the-company/
- https://arvanitis.gr/en/

Added: history from 1980, three-generation family identity, Greek milk sourcing, awards context, and the broader cheese range including Feta PDO and Manouri PDO.

### Baladinos & Sons

Official sources:
- https://www.balantinos.gr/en/history/
- https://www.balantinos.gr/en/products/

Added: Therissos roots, cheesemaking since 1928, fourth-generation continuity, Varipetro production, Crete sourcing language and the present cheese, butter and yogurt range. The mapped public point remains explicitly classified as the producer shop; the factory is not silently substituted.

### Christakis / Patria Feta

Official sources:
- https://www.patriafeta.com/index.php/information/history
- https://patriafeta.com/index.php/information/company
- https://patriafeta.com/index.php/products

Added: Dimitrios Christakis's 1890 Edessa workshop, continuity into CHRISTAKIS S.A., fresh Greek milk sourcing, and the current product family including Feta PDO and other cheeses.

### ELATOS / Kapetanou Bros

Official source:
- https://afoikapetanou.gr/

Added: three generations since 1963, local sheep/goat milk, production-control and certification context, and the current Feta, myzithra, anthotyro, graviera and sheep-yogurt range.

### Psiloritis Cheese Dairy

Official sources:
- https://www.psiloriths.gr/en/the-company/
- https://www.psiloriths.gr/en/home/

Added: Efstratios Klados's 1993 start, expansion to local suppliers, mountain sheep/goat breeds, the 2007 facility, certification context, and the broader current product range.

### Stamatogiorgis Dairy

Official source:
- https://stamatogiorgis.gr/en/

Added: multi-generation family know-how, local milk, traditional cheeses and related current products. Visitor status remains `current_access_uncertain`; a tasting mention is not converted into a guaranteed walk-in claim.

## Catalogue reconciliation

After the five removals:

- live Supabase catalogue: **62 total producer/project records**;
- Crete: **30** records;
- Santorini: **9** records;
- Peloponnese + Northern Greece + Tuscany / Italy: **23** records;
- dairy/cheese producers: **9** records;
- dairy records with persistent audited Google Place IDs: **9 / 9**;
- removed dairy IDs still present in Supabase: **0**.

The bundled audited catalogue, public catalogue copy, SEO/AEO generation inputs, and tests are being synchronized to the same retained set so a fallback build cannot resurrect the removed records.

## Trust invariants preserved

- No producer is marked as a TerroirTrail-verified commercial partner merely because it is listed.
- No public visit, tour or walk-in promise is inferred from factory existence or marketing copy.
- Road access remains independent and fail-closed where not confirmed.
- No Google Place ID is inferred from coordinates.
- No generic retailer is substituted for an unresolved producer identity.
- No uncredited website image is persisted as producer photography.
- Listings that cannot meet the final identity standard may be removed rather than padded with uncertain data.
