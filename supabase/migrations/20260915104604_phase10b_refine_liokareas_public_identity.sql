-- Phase 10B: refine Liokareas public-facing identity.
-- The verified map point is a public olive-oil shop; it is not evidence that the farm or mill itself is at this address.

update public.producers
set name = 'Liokareas Olive Oil Producer & Shop',
    category = 'farm',
    tag_line = 'Family olive-oil producer with a verified public shop in Lagkada, Mani',
    description = 'Liokareas is a family olive-oil producer with roots in the southern Peloponnese and a verified public olive-oil shop in Lagkada, Mani. The producer describes more than five generations of family cultivation and olive-oil production, including Koroneiki from the family orchards.',
    visit_status = 'public_visits',
    visit_source_url = 'https://www.google.com/maps/place/Liokareas+Olive+Oil+Shop/@36.7821875,22.3396875,17z/data=!3m1!4b1!4m6!3m5!1s0x1361e9a37cf64885:0x13801b73a112fc2c!8m2!3d36.7821875!4d22.3396875!16s%2Fg%2F11fv7xxhp1',
    visit_notes = 'Verified public retail point: Liokareas Olive Oil Shop in Lagkada. This confirms ordinary public access to the shop, not public access to the Liokareas farm, orchards or olive mill. Check current shop hours before travel.',
    location_notes = 'Phase 10B: exact public Liokareas Olive Oil Shop location in Lagkada verified from the supplied Google Maps listing. This mapped point is the public shop/contact location for the Liokareas olive-oil producer; it does not establish that the farm, orchards or olive mill are located at the same coordinates. Road access remains unreviewed.'
where id = 'liokareas-olive-estate'
  and destination = 'peloponnese';
