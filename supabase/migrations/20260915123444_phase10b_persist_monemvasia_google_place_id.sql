-- Persist the independently matched Google business identity for Monemvasia Winery Tsimbidi.
-- The Place ID is stored only after matching the current business record against
-- the audited producer phone and location; it does not alter location or road status.

update public.producers
set google_place_id = 'ChIJwU0GkC4-nhQRlcJGAJ6fbWk',
    google_maps_url = 'https://www.google.com/maps/place/?q=place_id:ChIJwU0GkC4-nhQRlcJGAJ6fbWk'
where id = 'monemvasia-winery'
  and location_status in ('verified_location','verified_entrance');
