-- Phase 9B: persist manually verified Google Place IDs for audit batch 2.
-- Coordinates, visitability, and road-access fields are intentionally unchanged.

update public.producers
set google_place_id = 'ChIJJ-2L8JSLnBQRwjVRodG9348'
where id = 'karavitakis-winery';

update public.producers
set google_place_id = 'ChIJuaGesySJnBQRgOXzw30bNBA'
where id = 'manousakis-winery';

update public.producers
set google_place_id = 'ChIJRTuqIBaLnBQRbiOsG6_Ozb8'
where id = 'monumental-olive-tree-vouves';

update public.producers
set google_place_id = 'ChIJdX0LdST0mhQReNnGJiIVQKk'
where id = 'domaine-paterianakis';

update public.producers
set google_place_id = 'ChIJFaEXELf5mhQRNPosWGmK770'
where id = 'douloufakis-winery';
