-- Correct Titakis audit timestamps to the actual review time.

update public.producers
set visitability_reviewed_at = timestamptz '2026-09-19 19:05:00+03'
where id = 'titakis-winery'
  and visitability_reviewed_at = timestamptz '2026-09-19 19:15:00+03';

update public.producer_fact_evidence
set verified_at = timestamptz '2026-09-19 19:05:00+03'
where producer_id='titakis-winery'
  and verified_at = timestamptz '2026-09-19 19:15:00+03'
  and field_key in ('booking_requirement','programme_durations','advance_notice');
