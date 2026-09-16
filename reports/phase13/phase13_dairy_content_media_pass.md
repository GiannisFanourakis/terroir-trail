# Phase 13 Dairy Content & Media Pass

Date: 2026-09-16

## Scope

This pass enriches the 12 approved Phase 13 dairy additions without changing their location, visitability, partnership-verification, or road-access classifications.

The live Supabase records now carry researched tag lines, descriptions, stories, and product specialties. The bundled SEO/AEO catalogue applies the same content through `phase13DairyContentOverrides.ts`.

## Media state

All 12 Phase 13 additions currently have no persisted `cover_image` and an empty persisted `gallery`. TerroirTrail therefore must not pretend that stored producer photography exists.

Seven records now carry a manually audited persistent Google Place ID and a verified location. The current card and drawer media eligibility checks use the live producer object, so these records are eligible for live Google Maps imagery without needing to be precompiled into the bundled compatibility allowlist (subject to the Google Places media feature being enabled and Google actually returning photos):

- ARGOGAL / Koromichi Family
- Arvanitis Dairy
- Baladinos & Sons
- Christakis / Patria Feta
- ELATOS / Kapetanou Bros
- Psiloritis Cheese Dairy
- Stamatogiorgis Dairy

Five records remain on the neutral category placeholder because no persistent audited Google Place ID is currently stored:

- GYPAS / Gyparaki Bros
- Iliakis Dairy / Meraki Iliaki
- Agricultural Dairy Cooperative of Kalavryta
- Katsouli Cheese Factory
- Tsatsoulis Cheese

Across the final 14-producer dairy set, including the pre-existing Aerakis Cheese Products and Tzourmpakis Dairy records, 9 currently carry a persistent audited Google Place ID and 5 remain unresolved.

No Place ID was inferred from coordinates and no website photograph was hot-linked without an explicit media-provenance path.

## Content sources and additions

### ARGOGAL / Koromichi Family

Official sources:
- https://www.argogal.gr/en/company
- https://www.argogal.gr/en/products

Added: 1916 family origin in Krya Vrysi, early-1960s second generation, 1994 transition to the three sons and modern 2,000 m² Kefalari facilities, free-range Peloponnese sheep/goat milk, and the current cheese range.

### Arvanitis Dairy

Official sources:
- https://arvanitis.gr/en/company/the-company/
- https://arvanitis.gr/en/

Added: history from 1980, three-generation family identity, Greek milk collected from trusted local producers near Macedonian pastures, international awards, and the broader cheese range including Feta PDO, Manouri PDO, Kasseri PDO, Saganaki, smoked Thessaloniki cheese and KYANO.

### Baladinos & Sons

Official sources:
- https://www.balantinos.gr/en/history/
- https://www.balantinos.gr/en/products/

Added: Therissos roots, cheesemaking since 1928, fourth-generation continuity, Varipetro production, Crete/free-range sourcing language and the present cheese, butter and yogurt range. The mapped public point remains explicitly classified as the producer shop; the factory is not silently substituted.

### Christakis / Patria Feta

Official sources:
- https://www.patriafeta.com/index.php/information/history
- https://patriafeta.com/index.php/information/company
- https://patriafeta.com/index.php/products

Added: Dimitrios Christakis's 1890 Edessa workshop, continuity into CHRISTAKIS S.A., fresh Greek milk sourcing, and the full current product family including Feta PDO, Manouri PDO, Mpatzos PDO, Kaseri PDO and specialty flavored cheeses.

### ELATOS / Kapetanou Bros

Official source:
- https://afoikapetanou.gr/

Added: three generations since 1963, fresh local sheep/goat milk, continuous analysis and production controls, ISO/TÜV certification context, the 2014 quality award and the current Feta, myzithra, anthotyro, graviera and sheep-yogurt range.

### GYPAS / Gyparaki Bros

Official sources:
- https://www.gypas.gr/en/the-creamery
- https://www.gypas.gr/en/products

Added: the original village creamery of Andreas, Sifis and Petros, expansion to the modern 3,000 m² Asi Gonia facility, local milk and PDO/food-safety context, plus matured, herb, truffle and smoked Graviera, anthotyros, Mitatotyri, brine cheese and myzithra.

### Iliakis Dairy / Meraki Iliaki

Official source:
- https://iliakisdairy.gr/

Added: 1974 family origin, development into an integrated traditional dairy unit, exclusive local-farmer sheep/goat/mixed-milk sourcing and the producer's stated traditional method without commercial substitutes. The current official site does not expose a reliably fetchable detailed product catalogue, so TerroirTrail keeps the product specialty deliberately broad instead of inventing individual products.

### Agricultural Dairy Cooperative of Kalavryta

Official sources:
- https://www.kalavritacoop.gr/who-we-are
- https://www.kalavritacoop.gr/history

Added: 1963 cooperative foundation, breeder-member structure, mountain-farm milk sourcing, 1972/1974 factory milestones, beech-barrel Feta PDO and the expanded cheese and dairy range.

### Katsouli Cheese Factory

Official source:
- https://katsou.gr/en/ABOUT-US

Added: Vassilis Katsoulis's 1989 founding, second-generation Thomas and Garyfallia and their Ioannina cheese-school training, local small milk producers, approximate daily milk throughput published by the dairy, and the Mastichoto story alongside the traditional range.

### Psiloritis Cheese Dairy

Official sources:
- https://www.psiloriths.gr/en/the-company/
- https://www.psiloriths.gr/en/home/

Added: Efstratios Klados's 1993 start with his own herd, expansion to local suppliers from 1995, mountain sheep/goat breeds, 2007 modern facility and certification, and the broader current range including flavored and smoked cheeses and Cretan xinochondros.

### Stamatogiorgis Dairy

Official source:
- https://stamatogiorgis.gr/en/

Added: multi-generation family know-how, 100% local milk, traditional cheeses, delicatessen pepper/bukovo/herb/smoked variants, sheep yogurt, anthogalo and katsochoiri, plus the producer's international-distinction context. Visitor status remains `current_access_uncertain`; a tasting mention is not converted into a guaranteed walk-in claim.

### Tsatsoulis Cheese

Official sources:
- https://www.tsatsoulis.com.gr/about
- https://www.tsatsoulis.com.gr/products

Added: at least four generations of family cheesemaking, Nikos's 2008 modernization into a vertically organized unit, fresh sheep/goat milk and HACCP/ISO context, with Feta PDO from Vytina and Graviera from Vytina as the published core range.

## Trust invariants preserved

- Exact-location status is unchanged.
- No producer is newly marked as a TerroirTrail-verified commercial partner.
- No public visit, tour or walk-in promise was inferred from factory existence or marketing copy.
- Road access remains unchanged and fail-closed where not independently confirmed.
- No Google Place ID is inferred from coordinates.
- No uncredited website image is persisted as a producer photograph.
