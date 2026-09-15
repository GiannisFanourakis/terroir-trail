-- Phase 10B Google Place identity audit, batch 1.
-- Persist only unambiguous Google Place IDs whose listing identity matches the
-- current producer name/address/phone evidence. Exact location coordinates
-- remain unresolved until the separate coordinate review.

UPDATE public.producers
SET google_place_id = 'ChIJd_C6CY-XVxMRwFU6h_zEof8',
    google_maps_url = 'https://www.google.com/maps/place/?q=place_id:ChIJd_C6CY-XVxMRwFU6h_zEof8',
    location_notes = 'Phase 10B: Google business identity matched Ktima Kir-Yianni in Yiannakohori, Naoussa; exact coordinates still pending separate verification.'
WHERE id = 'kir-yianni-naoussa';

UPDATE public.producers
SET google_place_id = 'ChIJUfMMwwsUqBQRoUIYIMQbCgI',
    google_maps_url = 'https://www.google.com/maps/place/?q=place_id:ChIJUfMMwwsUqBQRoUIYIMQbCgI',
    location_notes = 'Phase 10B: Google business identity matched Ktima Gerovassiliou in Epanomi; exact coordinates still pending separate verification.'
WHERE id = 'ktima-gerovassiliou';

UPDATE public.producers
SET google_place_id = 'ChIJyapU2RZLXhMREvVeN6Wjv0c',
    google_maps_url = 'https://www.google.com/maps/place/?q=place_id:ChIJyapU2RZLXhMREvVeN6Wjv0c',
    location_notes = 'Phase 10B: Google business identity matched KYKAO Handcrafted in Platani, Patras; exact coordinates still pending separate verification.'
WHERE id = 'kykao-handcrafted-beers';

UPDATE public.producers
SET google_place_id = 'ChIJ7XGKjVO-XxMReVt7WVgbCJ8',
    google_maps_url = 'https://www.google.com/maps/place/?q=place_id:ChIJ7XGKjVO-XxMReVt7WVgbCJ8',
    location_notes = 'Phase 10B: Google business identity matched Tetramythos Winery at 8th km Pounta-Kalavryta road, Ano Diakopto; exact coordinates still pending separate verification.'
WHERE id = 'tetramythos-winery';

UPDATE public.producers
SET google_place_id = 'ChIJHXFisgYYYBMRZxx-VMAJx1s',
    google_maps_url = 'https://www.google.com/maps/place/?q=place_id:ChIJHXFisgYYYBMRZxx-VMAJx1s',
    location_notes = 'Phase 10B: Google business identity matched Ktima Tselepos at 14th km Tripoli-Kastri road, Rizes; exact coordinates still pending separate verification.'
WHERE id = 'ktima-tselepos';

UPDATE public.producers
SET google_place_id = 'ChIJL4_ZhHa4YBMRhEDxMie9GGg',
    google_maps_url = 'https://www.google.com/maps/place/?q=place_id:ChIJL4_ZhHa4YBMRhEDxMie9GGg',
    location_notes = 'Phase 10B: Google business identity matched Mercouri Estate in Korakochori, Ilia; exact coordinates still pending separate verification.'
WHERE id = 'domaine-mercouri';

UPDATE public.producers
SET google_place_id = 'ChIJ2Smk-U0GoBQRzptIjnEnPU0',
    google_maps_url = 'https://www.google.com/maps/place/?q=place_id:ChIJ2Smk-U0GoBQRzptIjnEnPU0',
    location_notes = 'Phase 10B: Google business identity matched Semeli Estate in Koutsi, Nemea; exact coordinates still pending separate verification.'
WHERE id = 'semeli-estate-nemea';

UPDATE public.producers
SET google_place_id = 'ChIJfXHxqfz7nxQRao9QAPAeJLQ',
    google_maps_url = 'https://www.google.com/maps/place/?q=place_id:ChIJfXHxqfz7nxQRao9QAPAeJLQ',
    location_notes = 'Phase 10B: Google business identity matched Domaine Skouras at 10th km Argos-Sternas road, Malandreni; exact coordinates still pending separate verification.'
WHERE id = 'skouras-winery-nemea';

UPDATE public.producers
SET google_place_id = 'ChIJkZQPIE3LKxMR2vIDXqZvH54',
    google_maps_url = 'https://www.google.com/maps/place/?q=place_id:ChIJkZQPIE3LKxMR2vIDXqZvH54',
    location_notes = 'Phase 10B: Google business identity matched Monteraponi, Localita Monteraponi 1, Radda in Chianti; exact coordinates still pending separate verification.'
WHERE id = 'monteraponi-tuscany';
