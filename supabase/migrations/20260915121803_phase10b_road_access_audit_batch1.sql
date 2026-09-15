-- Phase 10B road-access audit batch 1.
-- Road classifications apply only to the verified mapped producer/public point.
-- They do not classify vineyard, orchard, agricultural, or unrelated service tracks.

update public.producers
set road_access = 'narrow_paved',
    road_access_status = 'verified',
    road_access_source_url = 'https://visit-achaia.gr/en/see-and-do/routes/202-route5',
    road_access_notes = 'Verified for the mapped winery approach, not vineyard tracks. Tetramythos publishes its winery at the 8th km of the Pounta-Kalavryta road; the Achaia regional route guide describes this ascending road through Ano Diakopto as good but a little narrow and winding.'
where id = 'tetramythos-winery';

update public.producers
set road_access = 'paved',
    road_access_status = 'verified',
    road_access_source_url = 'https://www.climbagiospetros.gr/en/getting-to-agios-petros/',
    road_access_notes = 'Verified for the mapped winery approach. Ktima Tselepos publishes its address at the 14th km Tripoli-Kastri road; the Tripoli-Kastri-Agios Petros corridor is documented as a paved mountain road. No claim is made about vineyard tracks beyond the visitor site.'
where id = 'ktima-tselepos';

update public.producers
set road_access = 'paved',
    road_access_status = 'verified',
    road_access_source_url = 'https://www.ia.ihu.gr/en/howtogetthere/',
    road_access_notes = 'Verified for the mapped brewery point. Siris publishes its brewery at the 6th km of the Serres-Thessaloniki National Road; International Hellenic University documents the Thessaloniki-Serres National Highway as the road approach into Serres. Classification applies to the public brewery point, not any unrelated service tracks.'
where id = 'siris-craft-brewery';

update public.producers
set road_access = 'paved',
    road_access_status = 'verified',
    road_access_source_url = 'https://www.monemvasiawinery.gr/privacy-policy/',
    road_access_notes = 'Verified for the mapped winery point from the producer legal premises address, which explicitly places the business on the Tarapsa-Monemvasia National Road. This does not classify vineyard or agricultural tracks.'
where id = 'monemvasia-winery';
