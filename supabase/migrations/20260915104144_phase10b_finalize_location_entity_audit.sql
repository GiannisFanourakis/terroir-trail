-- Phase 10B final exact-location/entity audit for the remaining three records.
-- Location verification remains independent from road-access classification.

update public.producers
set lat = 37.67681,
    lng = 21.30979,
    location_status = 'verified_location',
    location_source_url = 'https://mapcarta.com/W131619859',
    location_notes = 'Phase 10B exact-location audit: Mercouri Estate Winery point in Korakochori was independently matched in OpenStreetMap-backed mapping data and corroborated against the current estate address, telephone and producer identity. Road access remains unreviewed.'
where id = 'domaine-mercouri'
  and destination = 'peloponnese';

update public.producers
set lat = 37.85611,
    lng = 22.67088,
    location_status = 'verified_location',
    location_source_url = 'https://mapcarta.com/W770849854',
    location_notes = 'Phase 10B exact-location audit: GAIA Winery point in Koutsi, Nemea was independently matched in OpenStreetMap-backed mapping data and corroborated by the current producer-published Koutsi winery address and telephone. Google Place ID remains unresolved and road access remains unreviewed.'
where id = 'gaia-wines-nemea'
  and destination = 'peloponnese';

update public.producers
set category = 'farm',
    tag_line = 'Family olive farm and olive-oil producer with roots in the southern Peloponnese',
    description = 'Liokareas is a family olive farm and olive-oil producer whose current range is based on Greek olives, including Koroneiki from the family orchards. The producer describes more than five generations of family cultivation and olive-oil production.',
    location_status = 'unresolved',
    location_source_url = 'https://www.liokareas.com/collections/harvest-trip-2026',
    location_notes = 'Phase 10B entity/location audit: current first-party material supports a Liokareas family farm/orchard in the Mani Peninsula and packaged harvest-trip activity, but does not establish an ordinary publicly navigable olive-mill entity or a sufficiently exact reusable farm point. Keep location unresolved until a producer-controlled exact point is available.',
    google_maps_url = null,
    google_place_id = null,
    road_access = null,
    road_access_status = 'unreviewed'
where id = 'liokareas-olive-estate'
  and destination = 'peloponnese';
