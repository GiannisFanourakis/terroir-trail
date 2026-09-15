-- Phase 10B road-access audit batch 2 and review close.
-- Verified classifications apply only to the audited mapped producer/public point.
-- Remaining reviewed records are explicitly not publicly confirmed rather than guessed.

update public.producers
set road_access = 'paved',
    road_access_status = 'verified',
    road_access_source_url = 'https://www.pkm.gov.gr/ergasies-syntirisis-stin-16i-ethniki-odo-thessalonikis-polygyrou-apo-tin-perifereia-kentrikis-makedonia/',
    road_access_notes = 'Verified for the mapped brewery approach. Sknipa publishes its facilities at the 17th km Thessaloniki-Polygyros road; the Region of Central Macedonia identifies this corridor as National Road 16 and publishes active road-maintenance and traffic works on it. Classification applies to the mapped public brewery point and public-road approach, not internal service lanes.'
where id = 'propator-sknipa-brewery';

update public.producers
set road_access = 'unpaved_passable',
    road_access_status = 'verified',
    road_access_source_url = 'https://www.slowfood.it/slowine/grande-viaggio-del-vino-italiano-villa-venti-corzano-paterno-luoghi-monteraponi-tabarrini/',
    road_access_notes = 'Verified unpaved approach to the mapped estate. Slow Wine describes Monteraponi as reachable by an unpaved road from the Radda-Castellina road; later route material continues to identify gravel sectors in the Monteraponi area. This classification confirms passable unpaved access only and does not imply rental-car suitability.'
where id = 'monteraponi-tuscany';

update public.producers
set road_access = null,
    road_access_status = 'not_publicly_confirmed',
    road_access_source_url = null,
    road_access_notes = 'Phase 10B road-evidence review completed. No sufficiently specific current public evidence was found to classify the mapped public-point approach road. No road-surface or normal-rental-car suitability claim is exposed.'
where id in (
  'alpha-estate',
  'domaine-biblia-chora',
  'domaine-karanika',
  'ktima-gerovassiliou',
  'kir-yianni-naoussa',
  'ktima-pavlidis',
  'thymiopoulos-naoussa',
  'domaine-mercouri',
  'skouras-winery-nemea',
  'gaia-wines-nemea',
  'kykao-handcrafted-beers',
  'liokareas-olive-estate',
  'semeli-estate-nemea'
);
