-- Persist independently matched Google business identities for two Northern Greece producers.
-- Each match was verified against producer-controlled identity/contact details and the
-- already verified TerroirTrail location. This changes Google identity only and does
-- not alter location, visitability, or road-access state.

update public.producers
set google_place_id = 'ChIJq_TNZHdzVxMRrY3Giv0bikM',
    google_maps_url = 'https://www.google.com/maps/place/?q=place_id:ChIJq_TNZHdzVxMRrY3Giv0bikM'
where id = 'alpha-estate'
  and location_status in ('verified_location', 'verified_entrance')
  and phone = '+30 23860 20111';

update public.producers
set google_place_id = 'ChIJiVyvYCBYqRQRgo04TZknytU',
    google_maps_url = 'https://www.google.com/maps/place/?q=place_id:ChIJiVyvYCBYqRQRgo04TZknytU'
where id = 'ktima-pavlidis'
  and location_status in ('verified_location', 'verified_entrance')
  and phone = '+30 25210 58300';
