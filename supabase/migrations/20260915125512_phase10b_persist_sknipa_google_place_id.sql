-- Persist the independently matched Google business identity for Sknipa Craft Beer.
-- Match was verified against the producer-controlled 17th km Thessaloniki-Polygyros
-- address and +30 2310 463 444 telephone. This changes Google identity only and
-- does not alter location, visitability, or road-access state.

update public.producers
set google_place_id = 'ChIJHSyH3VFAqBQRdF-4PVdW8f8',
    google_maps_url = 'https://www.google.com/maps/place/?q=place_id:ChIJHSyH3VFAqBQRdF-4PVdW8f8'
where id = 'propator-sknipa-brewery'
  and location_status in ('verified_location', 'verified_entrance')
  and phone = '+30 2310 463 444';
