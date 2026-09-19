-- Visitability V1: planner-ready operational facts and evidence ledger.
-- Missing operational fields remain NULL: unknown must never be treated as false.
-- The evidence ledger is internal in V1; browser roles have no access.

alter table public.producers
  add column if not exists visit_booking_requirement text,
  add column if not exists walk_in_status text,
  add column if not exists parking_status text,
  add column if not exists typical_visit_minutes integer,
  add column if not exists visitor_hours jsonb,
  add column if not exists seasonal_visit_notes text,
  add column if not exists visitor_languages text[],
  add column if not exists visitability_reviewed_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'producers_visit_booking_requirement_check'
  ) then
    alter table public.producers
      add constraint producers_visit_booking_requirement_check
      check (
        visit_booking_requirement is null
        or visit_booking_requirement in ('required','recommended','not_required')
      );
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'producers_walk_in_status_check'
  ) then
    alter table public.producers
      add constraint producers_walk_in_status_check
      check (
        walk_in_status is null
        or walk_in_status in ('accepted','not_accepted','subject_to_availability')
      );
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'producers_parking_status_check'
  ) then
    alter table public.producers
      add constraint producers_parking_status_check
      check (
        parking_status is null
        or parking_status in ('available','limited','no_dedicated_parking')
      );
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'producers_typical_visit_minutes_check'
  ) then
    alter table public.producers
      add constraint producers_typical_visit_minutes_check
      check (
        typical_visit_minutes is null
        or (typical_visit_minutes between 1 and 720)
      );
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'producers_visitor_hours_json_check'
  ) then
    alter table public.producers
      add constraint producers_visitor_hours_json_check
      check (
        visitor_hours is null
        or jsonb_typeof(visitor_hours) in ('object','array')
      );
  end if;
end $$;

create table if not exists public.producer_fact_evidence (
  id uuid primary key default gen_random_uuid(),
  producer_id text not null references public.producers(id) on delete cascade,
  field_key text not null check (char_length(trim(field_key)) > 0),
  value_json jsonb not null,
  verification_type text not null check (
    verification_type in (
      'producer_confirmed',
      'first_party_source',
      'terroirtrail_review',
      'public_listing'
    )
  ),
  source_url text,
  source_label text,
  verified_at timestamptz not null,
  expires_at timestamptz,
  notes text,
  verified_by_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (expires_at is null or expires_at > verified_at)
);

create index if not exists idx_producer_fact_evidence_lookup
  on public.producer_fact_evidence (producer_id, field_key, verified_at desc);

alter table public.producer_fact_evidence enable row level security;

revoke all on table public.producer_fact_evidence from anon, authenticated;
grant all on table public.producer_fact_evidence to service_role;

-- Appointment-only is already an audited visit-status assertion, so this
-- structured field is a safe derivation. Other statuses remain unknown.
update public.producers
set visit_booking_requirement = 'required'
where destination = 'crete'
  and visit_status = 'appointment_only'
  and visit_booking_requirement is null;

-- First Crete Visitability V1 review batch.
update public.producers
set visitability_reviewed_at = timestamptz '2026-09-19 00:00:00+03'
where id in (
  'gavalas-crete-winery',
  'stamatogiorgis-dairy-smari',
  'tzourmpakis-dairy-amari',
  'meligyris-apiary',
  'notos-brewery',
  'psiloritis-cheese-dairy-livadia'
);

update public.producers
set visit_source_url = 'https://www.fragospitowinery.com/ksenagisi/'
where id = 'gavalas-crete-winery';

insert into public.producer_fact_evidence (
  producer_id,
  field_key,
  value_json,
  verification_type,
  source_url,
  source_label,
  verified_at,
  notes
)
select
  p.id,
  'visit_status',
  jsonb_build_object('status', p.visit_status),
  'first_party_source',
  p.visit_source_url,
  p.name || ' first-party source',
  timestamptz '2026-09-19 00:00:00+03',
  'Crete Visitability V1 review. The current source supports the existing conservative visit classification and does not justify a stronger public-access claim.'
from public.producers p
where p.id in (
  'gavalas-crete-winery',
  'stamatogiorgis-dairy-smari',
  'tzourmpakis-dairy-amari',
  'meligyris-apiary',
  'notos-brewery',
  'psiloritis-cheese-dairy-livadia'
)
and not exists (
  select 1
  from public.producer_fact_evidence e
  where e.producer_id = p.id
    and e.field_key = 'visit_status'
    and e.verified_at = timestamptz '2026-09-19 00:00:00+03'
);
