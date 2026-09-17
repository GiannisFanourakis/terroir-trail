# TerroirTrail — 150 Producer Expansion Programme

**Created:** 2026-09-17  
**Starting live catalogue:** 62 producer/project records  
**Working target:** 150 verified producer records across Greece and Italy  
**Net expansion target:** +88 records, subject to the existing evidence-first publication standard

## Canonical expansion rule

A new producer is never added as an isolated pin when it introduces a new TerroirTrail region.

If an approved producer belongs to a region that is not yet represented in the map/navigation hierarchy, the same expansion batch must add that region as a first-class mapped geography before the batch is considered complete.

Example: the first approved producer in Thessaly requires Thessaly to be added under Greece with its authoritative regional polygon, geography configuration, regional context card, filtering/navigation behavior and tests. The same rule applies to new Italian regions such as Piedmont, Veneto, Sicily, Puglia, Umbria, Liguria, Sardinia and Emilia-Romagna.

Hierarchy:

`Europe → Country → Region/Destination → Producer`

Current first new regional pair:

- Greece → Thessaly — NUTS 2021 Level 2 `EL61`
- Italy → Piedmont — NUTS 2021 Level 2 `ITC1`

Use official Eurostat/GISCO NUTS geography where the product region maps cleanly to NUTS. Preserve the current country-boundary architecture and attribution requirements.

## Complete-entry publication standard

Every new producer must be researched and audited as a complete TerroirTrail record. A candidate does not count toward 150 until it passes the publication standard.

Required fields/evidence where applicable:

- real producer/business identity;
- correct producer category;
- country and ISO country code;
- destination/region mapping;
- region, village and locality;
- exact verified coordinates;
- mapped-point role: production site, estate/farm, producer shop, visitor centre, or other verified point;
- official website;
- producer-controlled public phone/contact details;
- source-backed products/specialties;
- source-backed indigenous/local cultivars or protected-origin claims where relevant;
- concise TerroirTrail tagline;
- factual description and human producer story grounded in verified sources;
- `location_status`, source and notes;
- `visit_status`, source and notes — factory existence never implies public visits;
- persistent Google Place ID where exact business identity can be manually verified;
- Google Maps URL tied to the verified business identity where available;
- `road_access_status`, source and notes independently from location verification;
- road classification only when evidence supports it;
- imagery eligibility/provenance under the existing trust hierarchy;
- unknown fields remain unknown rather than being filled with synthetic defaults.

Do not publish guessed coordinates, inferred Google Place IDs, invented opening hours, ratings, prices, hospitality claims, awards, products, road conditions or visitor access.

## Regional geography completion standard

When a batch introduces a new region, complete all of the following in the same workstream:

1. Add the region to the destination/geography type model.
2. Add the country → region NUTS mapping.
3. Add an authoritative regional polygon / MultiPolygon.
4. Add visible boundary attribution.
5. Add region center/zoom behavior.
6. Add the Terroir Region context card/story with source-backed landscape, agriculture, culture and food context.
7. Ensure country-first conditional navigation exposes the region only under the correct country.
8. Ensure map hover/click behavior and producer filtering work correctly.
9. Add/update tests for geography, boundary hierarchy and filtering.
10. Update SEO/schema/noscript/sitemap surfaces where region/catalogue counts or geography are represented.
11. Update README, ROADMAP and relevant expansion reports.
12. Synchronize Supabase and bundled fallback/offline data.
13. Run the full quality gate and production smoke before calling the batch complete.

## Geography / catalogue balance

The expansion is deliberately inclusive rather than wine-only.

Priority categories include:

- olive mills and olive-oil producers;
- honey/apiary producers;
- herbs and botanical producers;
- farms and primary regional produce;
- cheese/dairy makers;
- breweries/distilleries;
- place-linked specialty-food makers where they fit the TerroirTrail producer model;
- wineries where they add meaningful geographic or terroir coverage.

Italy must expand beyond the current Tuscany foothold. Greece and Italy should both have meaningful regional depth by the time the catalogue approaches 150.

## Working batching strategy

### Batch 1 — Thessaly + Piedmont

Research and audit a compact set of strong producers while adding the two missing regional layers:

- Thessaly (`EL61`)
- Piedmont (`ITC1`)

Initial candidates under audit include, but are not pre-approved:

**Thessaly**
- Domaine Zafeirakis
- Domaine D. Migas
- Agricultural Cooperative Winery & Distillery of Tyrnavos
- Tsililis Winery / Theopetra Estate
- Meteora Oil / Haratsaris family operation

**Piedmont**
- Ceretto
- G.D. Vajra
- Cascina Barroero
- Beppino Occelli / Valcasotto maturing site
- Nocciola delle Langhe / Az. Agr. Proglio

A candidate can be removed at any point if exact identity, mapped point, producer role, visitability, access evidence or Google identity cannot be verified to the publication standard.

## Source-of-truth rule

The live Supabase catalogue is authoritative for current publication state. Repository fallback data, migrations, documentation, tests and SEO surfaces must be reconciled to that truth after each accepted batch so stale catalogue counts or synthetic defaults cannot reappear.

## Target discipline

150 is a working catalogue target, not a quota that overrides trust. If the audited catalogue reaches a lower number with stronger records, do not pad it with questionable listings. Quality, exact identity and geographic integrity remain the constraints.
