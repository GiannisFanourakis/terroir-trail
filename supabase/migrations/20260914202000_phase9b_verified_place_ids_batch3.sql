-- Phase 9B: persist the final manually verified Crete Google Place IDs.
-- Coordinates, visitability, and road-access fields are intentionally unchanged.

update public.producers
set google_place_id = 'ChIJgzInNBjwmhQRutqQL7tYua4'
where id = 'gavalas-crete-winery';

update public.producers
set google_place_id = 'ChIJ94-gKsBbmhQRN5SD4LmOscM'
where id = 'kasta-brewery';

update public.producers
set google_place_id = 'ChIJ88HxsqT0mhQRh_C91lHjOsc'
where id = 'meligyris-apiary';

update public.producers
set google_place_id = 'ChIJV-H_WvJZmhQRhDv7rC9J7BI'
where id = 'notos-brewery';

update public.producers
set google_place_id = 'ChIJCwKcSg35mhQRemlU_UuJXJg'
where id = 'silva-daskalaki-winery';

update public.producers
set google_place_id = 'ChIJo2tbh7JZmhQRkvvJabgPQH8'
where id = 'solo-craft-brewery';

update public.producers
set google_place_id = 'ChIJ64tJU_71mhQRkQMBKPHOyUs'
where id = 'kazani-stilianou';

update public.producers
set google_place_id = 'ChIJc19IswH2mhQRs59Vro6kHog'
where id = 'titakis-winery';

update public.producers
set google_place_id = 'ChIJRS6SqV3imhQRh2S9CPLm4oE'
where id = 'zacharioudakis-winery';

update public.producers
set google_place_id = 'ChIJEaesXnDvkBQRqf3MIrUc1WQ'
where id = 'toplou-monastery-winery';

update public.producers
set google_place_id = 'ChIJVVVVVeV_kBQRuwz899nRDW0'
where id = 'cretan-olive-oil-farm';

update public.producers
set google_place_id = 'ChIJc4w4p8SomxQRNLLndoFdE0E'
where id = 'parasiris-olive-mill';
