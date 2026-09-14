-- Phase 9B: persist manually verified Google Place IDs for the first audited batch.
-- Coordinates, visitability, and road-access fields are intentionally unchanged.

update public.producers
set google_place_id = 'ChIJQwdI8aeMnBQRZAI_Lg6tC08'
where id = 'anoskeli-estate';

update public.producers
set google_place_id = 'ChIJv_2FfolkmxQRdEakPam_PwI'
where id = 'wild-herbs-kallikratis';

update public.producers
set google_place_id = 'ChIJK7sRuXvvmhQRcLM1MwiaRXU'
where id = 'aerakis-dairy-anogeia';

update public.producers
set google_place_id = 'ChIJfxev5WBtmxQRdwfwJ2hO8Cg'
where id = 'tzourmpakis-dairy-amari';
