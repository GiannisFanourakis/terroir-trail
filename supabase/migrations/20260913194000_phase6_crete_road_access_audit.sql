-- Phase 6 Crete road/access audit, 2026-09-13.
-- A reviewed record may remain without a road classification when no reliable
-- public source explicitly supports surface, width, or vehicle suitability.

UPDATE public.producers
SET
  road_access = NULL,
  road_access_status = 'not_publicly_confirmed',
  road_access_source_url = website,
  road_access_notes = 'Phase 6 review (2026-09-13): no explicit source-backed road-surface, width, or vehicle-suitability classification was found in the reviewed public material. Road type remains unpublished.'
WHERE destination = 'crete'
  AND id NOT IN ('peskesi-farm-kazani', 'wild-herbs-kallikratis');

UPDATE public.producers
SET
  road_access = 'unpaved_passable',
  road_access_status = 'verified',
  road_access_source_url = 'https://peskesicrete.gr/en/experiences/explore-the-farm',
  road_access_notes = 'Producer states that access to the farm is via a passable dirt road; entry is limited to vehicles up to 20 seats. The producer recommends approaching through Skotino, Voritsi and Charaso from the Gouves area and following wooden signs. This verifies passable unpaved access but does not by itself establish rental-car suitability.'
WHERE id = 'peskesi-farm-kazani';

UPDATE public.producers
SET
  road_access = NULL,
  road_access_status = 'current_access_uncertain',
  road_access_source_url = 'https://cretazine.com/en/crete/travel-explore/crete-360/item/1269-herbal-sanctuaries-of-crete',
  road_access_notes = 'Current first-party road-surface and vehicle-suitability guidance was not found. An older independent report describes dusty mountain roads to Kallikratis and says the Fragkokastelo approach is more difficult. Because that evidence is old and route-dependent, no current road classification is published; confirm conditions before driving.'
WHERE id = 'wild-herbs-kallikratis';

UPDATE public.producers SET
  road_access_source_url = 'https://douloufakis.wine/en/getting-here/',
  road_access_notes = 'Official directions confirm access by car from Heraklion via the Heraklion–Moires highway, Stavrakia–Siva provincial road and final village streets, with winery parking. The official page does not explicitly classify road surface, width, or rental-car suitability, so no road type is published.'
WHERE id = 'douloufakis-winery';

UPDATE public.producers SET
  road_access_source_url = 'https://www.cretanbeer.gr/en/cretan-brewery/visit-us/',
  road_access_notes = 'Official visit information explicitly lists driving a car as a way to reach the brewery. It does not publish a road-surface, width, or vehicle-suitability classification, so no road type is published.'
WHERE id = 'cretan-brewery-charma';

UPDATE public.producers SET
  road_access_source_url = 'https://www.manousakiswinery.com/contact',
  road_access_notes = 'Official contact information provides Getting Here options by car, taxi, bus and shuttle. It does not publish a road-surface, width, or vehicle-suitability classification, so no road type is published.'
WHERE id = 'manousakis-winery';

UPDATE public.producers SET
  road_access_source_url = 'https://biolea.gr/contact/',
  road_access_notes = 'Official Biolea contact information publishes the Astrikas Estate address and exact GPS point. No explicit road-surface, width, or vehicle-suitability classification is published, so road type remains unconfirmed.'
WHERE id = 'biolea-estate';

UPDATE public.producers SET
  road_access_source_url = 'https://solobeer.gr/en/',
  road_access_notes = 'Official Solo Brewery information publishes a How to Reach address and Google Map for the Kallithea brewery. No explicit road-surface, width, or vehicle-suitability classification is published, so road type remains unconfirmed.'
WHERE id = 'solo-craft-brewery';

UPDATE public.producers SET
  road_access_source_url = 'https://cretancheeseaerakis.com/',
  road_access_notes = 'Official Aerakis information confirms the dairy is based in Sokaras, Gortyna. No explicit public road-surface, width, or vehicle-suitability guidance was found, so road type remains unconfirmed.'
WHERE id = 'aerakis-dairy-anogeia';

UPDATE public.producers SET
  road_access_source_url = 'https://tzourmpakis.gr/',
  road_access_notes = 'Official Tzourmpakis information confirms the Mixorrouma dairy location and provides a map link. No explicit public road-surface, width, or vehicle-suitability classification is published, so road type remains unconfirmed.'
WHERE id = 'tzourmpakis-dairy-amari';
