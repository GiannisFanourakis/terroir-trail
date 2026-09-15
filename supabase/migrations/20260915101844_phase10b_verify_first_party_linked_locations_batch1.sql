-- Phase 10B exact-location audit, batch 1.
-- Promote only locations whose producer-controlled contact page links directly
-- to the corresponding Google Maps point. This verifies the business location,
-- not the road surface, entrance precision or vehicle suitability.

UPDATE public.producers
SET lat = 41.2009752,
    lng = 23.9524658,
    location_status = 'verified_location',
    location_source_url = 'https://ktima-pavlidis.gr/en/contact-2/',
    location_notes = 'Producer-controlled contact page links directly to the Ktima Pavlidis Google Maps business point in Kokkinogia. Business location verified; entrance and road access remain unverified.',
    google_maps_url = 'https://www.google.com/maps/place/%CE%9A%CF%84%CE%AE%CE%BC%CE%B1+%CE%A0%CE%B1%CF%85%CE%BB%CE%AF%CE%B4%CE%B7/@41.2009792,23.9498909,17z/data=!4m6!3m5!1s0x14a9582060af5c89:0xd5ca27994d388d82!8m2!3d41.2009752!4d23.9524658!16s%2Fg%2F11byl5rsct'
WHERE id = 'ktima-pavlidis';

UPDATE public.producers
SET lat = 40.6941926,
    lng = 21.7063052,
    location_status = 'verified_location',
    location_source_url = 'https://alpha-estate.com/contact/',
    location_notes = 'Producer-controlled contact page links directly to the Alpha Estate Google Maps destination at 2nd km Amyndeon-St. Panteleimon. Business location verified; entrance and road access remain unverified.',
    google_maps_url = 'https://www.google.com/maps/dir//%CE%9A%CE%A4%CE%97%CE%9C%CE%91+%CE%91%CE%9B%CE%A6%CE%91+-+ALPHA+ESTATE+2%CE%BF+%CF%87%CE%BB%CE%BC+Ag.+Panteleimon+532+00/@40.6941926,21.7063052,11z'
WHERE id = 'alpha-estate';

UPDATE public.producers
SET lat = 40.8118053,
    lng = 23.9908103,
    location_status = 'verified_location',
    location_source_url = 'https://bibliachora.gr/en/contact/',
    location_notes = 'Producer-controlled contact page links directly to the Ktima Biblia Chora Winery Google Maps point in Kokkinochori. Business location verified; entrance and road access remain unverified.',
    google_maps_url = 'https://goo.gl/maps/W7vnA7R25BgL5yKt9'
WHERE id = 'domaine-biblia-chora';

UPDATE public.producers
SET lat = 40.5741154,
    lng = 22.1475532,
    location_status = 'verified_location',
    location_source_url = 'https://www.thymiopoulosvineyards.gr/contact',
    location_notes = 'Producer-controlled contact page links directly to the Thymiopoulos Vineyards Google Maps point in Trilofos. Business location verified; entrance and road access remain unverified.',
    google_maps_url = 'https://www.google.com/maps/place/THYMIOPOULOS+VINEYARDS/@40.5741154,22.1431758,16z/data=!4m8!1m2!2m1!1sthymiopoulos+vineyards!3m4!1s0x135793d3faa7784b:0xe4981a0edf80b43c!8m2!3d40.5741154!4d22.1475532'
WHERE id = 'thymiopoulos-naoussa';

UPDATE public.producers
SET lat = 36.7338774,
    lng = 22.9670391,
    location_status = 'verified_location',
    location_source_url = 'https://www.monemvasiawinery.gr/en/contact/',
    location_notes = 'Producer-controlled contact page links directly to the Monemvasia Winery Tsimbidi Google Maps point. Business location verified; entrance and road access remain unverified.',
    google_maps_url = 'https://maps.app.goo.gl/hw393D9Q1NCfbeAD9'
WHERE id = 'monemvasia-winery';
