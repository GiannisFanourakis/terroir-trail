-- Keep producer identity separate from the role of the mapped public point.
-- A producer shop may be mapped for an eligible producer, but generic retail shops are not producer records.

alter table public.producers
  add column if not exists public_point_type text;

alter table public.producers
  drop constraint if exists producers_public_point_type_check;

alter table public.producers
  add constraint producers_public_point_type_check
  check (
    public_point_type is null
    or public_point_type = any (array[
      'production_site'::text,
      'producer_shop'::text,
      'estate'::text,
      'visitor_center'::text,
      'other_verified_point'::text
    ])
  );

update public.producers
set name = 'Liokareas',
    category = 'olive_oil_producer',
    tag_line = 'Family olive-oil producer with a verified public shop in Lagkada, Mani',
    public_point_type = 'producer_shop',
    visit_status = 'not_publicly_confirmed',
    visit_source_url = 'https://www.liokareas.com/collections/harvest-trip-2026',
    visit_notes = 'Current first-party evidence supports Liokareas as a family olive-oil producer and documents packaged harvest-trip activity, but ordinary public access to the farm, orchards or production site is not established. The verified Lagkada map point is the producer shop only.',
    location_notes = 'Phase 10B: exact public Liokareas Olive Oil Shop location in Lagkada verified from the supplied Google Maps listing. The TerroirTrail record represents the Liokareas olive-oil producer; this mapped point is its public producer shop and does not establish that the farm, orchards or olive mill are located at the same coordinates. Road access remains unreviewed.'
where id = 'liokareas-olive-estate'
  and destination = 'peloponnese';
