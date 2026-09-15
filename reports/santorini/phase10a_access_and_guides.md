# Phase 10A — Santorini Access Review & Discovery Guides

Date: 2026-09-15

Status: road/access evidence reviewed independently from Google location verification; three Santorini Discovery Guides added with multi-stop driving navigation intentionally fail-closed.

## Access review conclusion

All 9 Santorini catalogue records retain:

- `location_status = verified_location` from the manual Google Place audit;
- `road_access = NULL`;
- `road_access_status = not_publicly_confirmed`.

This is deliberate. A verified Google business pin, an official address, public visitor service, parking, or a statement that guests can arrive by car does not by itself establish road surface, road width, current condition, gradient, rental-car suitability, or a safe multi-stop driving route.

### Producer-specific evidence reviewed

- **Domaine Sigalas** — official address at Baxes, Oia and current visitor/tasting information are published. No producer-controlled road-surface or rental-car classification was found. Source: https://sigalas-wine.com/contact-en/
- **Vassaltis Vineyards** — official contact/reservation pages place the winery in Vourvoulos and publish visitor experiences. No road-surface or rental-car classification was found. Sources: https://vassaltis.com/contact/ and https://vassaltis.com/reservations/
- **Estate Argyros** — official FAQ states that guests arrive by private car, transfer, taxi or bus and that on-site parking is available. This supports practical vehicle access, but not a road-surface/suitability classification. Source: https://estateargyros.com/faq/
- **GAIA Wines Santorini** — official visitor page verifies the Vrachies/Exo Gonia location and seasonal visitor program. It does not classify road surface, width, condition or rental-car suitability. Source: https://gaiawines.gr/en/visit-santorini-en/
- **Santorini Brewing Company** — official pages verify the brewery in Mesa Gonia and invite visitors to the tasting area. No road-surface or rental-car classification is published. Sources: https://www.santorinibrewingcompany.gr/contact and https://www.santorinibrewingcompany.gr/our-story
- **Gavalas Winery** — official visitor and contact pages verify the Megalochori winery and tasting program. No road-surface or rental-car classification is published. Sources: https://www.gavalaswines.gr/wine-tasting and https://www.gavalaswines.gr/contact
- **Santo Wines** — official Wine Tourism Center information verifies the public visitor facility in Pyrgos. No road-surface or rental-car classification is published. Sources: https://santowines.gr/visit-us and https://santowines.gr/contact/company
- **Venetsanos Winery** — official FAQ says the winery can be reached by taxi, car or local bus. This supports practical access but not a road-surface/suitability classification. Sources: https://venetsanoswinery.com/faq/ and https://venetsanoswinery.com/contact/
- **Canava Santorini Distillery** — Google business location is verified, but current producer-controlled visitor and access evidence remains insufficient for a published Discovery Guide stop. Road type remains unclassified.

## Published Santorini Discovery Guides

Three guides are now marked `verified_stops`:

1. **Oia & Vourvoulos: Northern Santorini Wine Country**
   - Domaine Sigalas
   - Vassaltis Vineyards

2. **Episkopi & East Coast: Estate Wine, Craft Beer & Seaside Assyrtiko**
   - Estate Argyros
   - Santorini Brewing Company
   - GAIA Wines Santorini

3. **Megalochori & Pyrgos: Family Cellars and Caldera Wine**
   - Gavalas Winery
   - Santo Wines
   - Venetsanos Winery

Canava Santorini Distillery is intentionally excluded while current visitor access remains `not_publicly_confirmed`.

## Safety behavior

The guides are discovery collections, not road guarantees.

- Every published stop has a verified location and a reviewed visitor status.
- No Santorini stop currently exposes a road-access classification.
- Every guide uses `Driving distance pending access audit`.
- `evaluateRouteNavigation` therefore returns fail-closed for all three guides.
- The UI may open each producer/location independently, but multi-stop turn-by-turn driving navigation stays disabled.
- The legacy pre-audit Santorini marketing route remains in source for historical compatibility but has no verification status and is not published by the guide UI.

## Remaining Phase 10A closeout

- Run the full local quality gate after the guide additions.
- Perform a short local browser smoke pass of the three Santorini guide tabs and stop cards.
- Merge to `main` only after the gate is green.
- Deploy Firebase Hosting and perform a production smoke pass.
- Then mark Santorini complete and move Phase 10 to Peloponnese.
