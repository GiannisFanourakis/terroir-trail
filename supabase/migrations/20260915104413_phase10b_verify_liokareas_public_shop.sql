-- Phase 10B: verify the public Liokareas shop location supplied directly by the project owner.
-- This is a retail/public contact point, not evidence that the farm or mill itself is located here.

update public.producers
set lat = 36.7821875,
    lng = 22.3396875,
    village = 'Lagkada (Mani)',
    category = 'farm',
    location_status = 'verified_location',
    location_source_url = 'https://www.google.com/maps/place/Liokareas+Olive+Oil+Shop/@36.7821875,22.3396875,17z/data=!3m1!4b1!4m6!3m5!1s0x1361e9a37cf64885:0x13801b73a112fc2c!8m2!3d36.7821875!4d22.3396875!16s%2Fg%2F11fv7xxhp1',
    location_notes = 'Phase 10B: exact public Liokareas Olive Oil Shop location in Lagkada verified from the supplied Google Maps listing. This point represents the public shop/contact location, not a claim that the Liokareas farm, orchards or olive mill are located at the same coordinates. Road access remains unreviewed.',
    google_maps_url = 'https://www.google.com/maps/place/Liokareas+Olive+Oil+Shop/@36.7821875,22.3396875,17z/data=!3m1!4b1!4m6!3m5!1s0x1361e9a37cf64885:0x13801b73a112fc2c!8m2!3d36.7821875!4d22.3396875!16s%2Fg%2F11fv7xxhp1',
    google_place_id = 'ChIJhUj2fKPpYRMRLPwSoXMbgBM',
    road_access = null,
    road_access_status = 'unreviewed'
where id = 'liokareas-olive-estate'
  and destination = 'peloponnese';
