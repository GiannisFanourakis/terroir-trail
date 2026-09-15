-- Phase 10B exact-location audit, batch 2.
-- Verify exact producer locations independently from road-access status.
-- No road classifications are added by this migration.

update public.producers
set lat=40.65924,
    lng=21.70654,
    location_status='verified_location',
    location_source_url='https://mapcarta.com/W446824784',
    location_notes='Phase 10B exact-location audit: Karanika Winery building point independently matched in OpenStreetMap-backed mapping data; the mapping entity links karanika.com and the producer identity is corroborated by the official Domaine Karanika site. Road access remains unreviewed.'
where id='domaine-karanika' and destination='northern_greece';

update public.producers
set lat=40.65934,
    lng=22.07146,
    location_status='verified_location',
    location_source_url='https://mapcarta.com/N9797265812',
    location_notes='Phase 10B exact-location audit: Kir-Yianni Winery point in Yiannakohori independently matched in OpenStreetMap-backed mapping data and corroborated by the producer-published Naoussa address and contact details. Road access remains unreviewed.'
where id='kir-yianni-naoussa' and destination='northern_greece';

update public.producers
set lat=40.45069,
    lng=22.92462,
    location_status='verified_location',
    location_source_url='https://mapcarta.com/W918357275',
    location_notes='Phase 10B exact-location audit: Ktima Gerovassiliou winery point independently matched in OpenStreetMap-backed mapping data and corroborated by the current first-party Epanomi address and telephone. Road access remains unreviewed.'
where id='ktima-gerovassiliou' and destination='northern_greece';

update public.producers
set lat=40.5281,
    lng=23.0414,
    location_status='verified_location',
    location_source_url='https://untappd.com/SknipaMicrobreweryOfThessaloniki/beer',
    location_notes='Phase 10B exact-location audit: the brewery-specific location published by the official Untappd brewery profile in Nea Raidestos matches Sknipa''s producer-controlled site, 17th km Thessaloniki-Polygyros address, phone and website identity. Road access remains unreviewed.'
where id='propator-sknipa-brewery' and destination='northern_greece';

update public.producers
set lat=41.09586,
    lng=23.47099,
    location_status='verified_location',
    location_source_url='https://mapcarta.com/W1091010202',
    location_notes='Phase 10B exact-location audit: Siris Craft Brewery industrial/brewery point independently matched in OpenStreetMap-backed mapping data; domain and telephone match the producer-controlled Siris/Voreia identity. Road access remains unreviewed.'
where id='siris-craft-brewery' and destination='northern_greece';

update public.producers
set lat=37.429469,
    lng=22.489839,
    location_status='verified_location',
    location_source_url='https://tripntravel.gr/2024/06/25/wine-tour-tasting/',
    location_notes='Phase 10B exact-location audit: published GPS point for Ktima Tselepos matches the producer-controlled 14th km Tripoli-Kastri Road, Rizes address and telephone. Road access remains unreviewed.'
where id='ktima-tselepos' and destination='peloponnese';

update public.producers
set lat=38.30088,
    lng=21.81903,
    location_status='verified_location',
    location_source_url='https://mapcarta.com/W672348841',
    location_notes='Phase 10B exact-location audit: KYKAO Handcrafted industrial brewery point independently matched in OpenStreetMap-backed mapping data and corroborated by the producer-controlled Platani 26504 contact address and phone. Road access remains unreviewed.'
where id='kykao-handcrafted-beers' and destination='peloponnese';

update public.producers
set lat=37.8509,
    lng=22.6675,
    location_status='verified_location',
    location_source_url='https://www.semeliestate.gr/front/',
    location_notes='Phase 10B exact-location audit: coordinates are published directly by Semeli Estate and correspond to the Koutsi, Nemea winery identified on the producer-controlled contact page. Road access remains unreviewed.'
where id='semeli-estate-nemea' and destination='peloponnese';

update public.producers
set lat=37.68969,
    lng=22.65478,
    location_status='verified_location',
    location_source_url='https://www.allaboutpeloponnisos.com/en/type/Trips/domaine-skouras',
    location_notes='Phase 10B exact-location audit: published GPS point matches Domaine Skouras at 10th km Argos-Sternas, Malandreni, including the producer website and telephone. Road access remains unreviewed.'
where id='skouras-winery-nemea' and destination='peloponnese';

update public.producers
set lat=38.13838,
    lng=22.23567,
    location_status='verified_location',
    location_source_url='https://mapcarta.com/W292772878',
    location_notes='Phase 10B exact-location audit: Tetramythos Winery building point independently matched in OpenStreetMap-backed mapping data and corroborated by the producer-controlled 8th km Pounta-Kalavryta, Ano Diakopto address. Road access remains unreviewed.'
where id='tetramythos-winery' and destination='peloponnese';

update public.producers
set lat=43.46707,
    lng=11.34472,
    location_status='verified_location',
    location_source_url='https://mapcarta.com/N1669100024',
    location_notes='Phase 10B exact-location audit: Monteraponi locality/estate point independently matched in OpenStreetMap-backed mapping data and corroborated by the producer-controlled Radda in Chianti contact details. Road access remains unreviewed.'
where id='monteraponi-tuscany' and destination='tuscany';
