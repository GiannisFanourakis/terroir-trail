update public.producers
set
  google_place_id = 'ChIJ2a11wv8GoBQR1Nhkz3BBHp8',
  google_maps_url = 'https://www.google.com/maps/place/?q=place_id:ChIJ2a11wv8GoBQR1Nhkz3BBHp8'
where id = 'gaia-wines-nemea'
  and location_status = 'verified_location'
  and phone = '+30 27460 22057'
  and google_place_id is null;
