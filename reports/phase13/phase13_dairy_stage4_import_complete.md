# Phase 13 — Dairy Expansion: Stage 4 Import Complete

Date: 2026-09-16
Owner approval to import: confirmed 2026-09-16

## Result

The owner-approved dairy list has been imported into the live Supabase `public.producers` table.

- Existing retained dairy producers: **2**
- Newly imported dairy producers: **12**
- Final `cheese_dairy` total: **14**
- Removed candidates: **5**
- New experiences activated: **0**
- Researched producers marked as platform-verified partners: **0**

The import is also recorded in:

`supabase/migrations/20260916165500_phase13_import_verified_dairy_producers.sql`

The migration is idempotent by producer `id` and intentionally leaves the two pre-existing dairy records unchanged.

## Trust rules applied

1. A new producer was imported only after an exact production-site/public-point coordinate could be defensibly matched.
2. `verified_location` confirms the business location, not necessarily a specific customer entrance.
3. Production sites were not treated as publicly visitable merely because an address or factory exists.
4. Road access remains `not_publicly_confirmed` for the new records because no source-backed last-mile vehicle-suitability classification was established.
5. Retail shops, offices and headquarters were not substituted for production sites.
6. No new producer was marked `is_verified=true`; research inclusion does not imply partnership or owner verification.
7. No experiences were created or activated by this import.

## Final imported/retained set

| Producer | Status | Exact point | Website | Map |
|---|---|---:|---|---|
| Aerakis Cheese Products | Existing / retained | 35.065803, 25.106932 | https://www.aerakis.net/ | https://www.google.com/maps?q=35.065803,25.106932 |
| Tzourmpakis Dairy | Existing / retained | 35.2211278, 24.4979202 | https://tzourmpakis.gr | https://www.google.com/maps?q=35.2211278,24.4979202 |
| Stamatogiorgis Dairy | Imported | 35.237247, 25.3152673 | https://stamatogiorgis.gr/en/ | https://www.google.com/maps?q=35.237247,25.3152673 |
| ELATOS / Kapetanou Bros | Imported | 37.6787461, 22.6540322 | https://afoikapetanou.gr/ | https://www.google.com/maps?q=37.6787461,22.6540322 |
| Arvanitis Dairy | Imported | 40.7091636, 22.8796043 | https://arvanitis.gr/en/ | https://www.google.com/maps?q=40.7091636,22.8796043 |
| Baladinos & Sons | Imported | 35.5133795, 24.0162928 | https://www.balantinos.gr/en/ | https://www.google.com/maps?q=35.5133795,24.0162928 |
| Katsouli Cheese Factory | Imported | 37.582741, 23.147568 | https://katsou.gr/en/homepage-Tyrokomeio-Katsoyli | https://www.google.com/maps?q=37.582741,23.147568 |
| Agricultural Dairy Cooperative of Kalavryta | Imported | 38.0322125, 22.1063514 | https://www.kalavritacoop.gr/en | https://www.google.com/maps?q=38.0322125,22.1063514 |
| Christakis / Patria Feta | Imported | 40.783506, 22.060069 | https://www.patriafeta.com/ | https://www.google.com/maps?q=40.783506,22.060069 |
| Psiloritis Cheese Dairy | Imported | 35.3038706, 24.8093411 | https://www.psiloriths.gr/en/home/ | https://www.google.com/maps?q=35.3038706,24.8093411 |
| GYPAS / Gyparaki Bros | Imported | 35.2728027, 24.2781829 | https://www.gypas.gr/en/ | https://www.google.com/maps?q=35.2728027,24.2781829 |
| Tsatsoulis Cheese | Imported | 37.7559711, 22.2236474 | https://www.tsatsoulis.com.gr/ | https://www.google.com/maps?q=37.7559711,22.2236474 |
| ARGOGAL / Koromichi Family | Imported | 37.5903119, 22.7124346 | https://www.argogal.gr/en/ | https://www.google.com/maps?q=37.5903119,22.7124346 |
| Iliakis Dairy / Meraki Iliaki | Imported | 35.2847797, 24.4135176 | https://iliakisdairy.gr/ | https://www.google.com/maps?q=35.2847797,24.4135176 |

### Visit-status note

Stamatogiorgis has current first-party evidence that tasting experiences take place at its facilities, but no clear current walk-in policy or complete booking procedure was verified during this audit. It is therefore stored as `current_access_uncertain`, not as guaranteed public access.

All other newly imported producers are stored as `not_publicly_confirmed` for visitability.

## Removed from the Phase 13 import

The following candidates were deliberately excluded because an exact defensible production-site point could not be established under the owner-approved rule, “whatever we don't find we remove from the list”:

- O Mythos tou Vounou — Kato Oreini, Serres
- KARGAKIS Dairy Products — Anopoli, Heraklion
- O Polyfimos — Eva, Messinia
- Vogiatzis Traditional Cheeses of Lagadas — Perivolaki, Thessaloniki
- Karagiannis Theofilos Dairy Products — Arnaia, Chalkidiki

Their exclusion is a mapping-confidence decision, not a claim that the businesses are invalid.

## Import verification

After the live insertion:

- the `cheese_dairy` category contained **14** rows;
- all 12 new producer IDs were present;
- all 12 new rows had `location_status = 'verified_location'`;
- all 12 new rows had a non-null PostGIS `location` value;
- all new rows retained `is_verified = false`;
- all new road-access statuses remained `not_publicly_confirmed`;
- no removed candidate was imported.
