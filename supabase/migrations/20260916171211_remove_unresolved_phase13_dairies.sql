-- Remove five Phase 13 dairy listings that do not meet the final
-- persistent Google business-identity publication standard.
--
-- These records had no bookings, reviews, or Experience rows at removal time.
-- The delete is intentionally idempotent and preserves the evidence-first rule:
-- unresolved Google business identity is not guessed merely to retain a listing.

delete from public.producers
where id in (
  'gypas-cheese-asi-gonia',
  'iliakis-dairy-kato-mallaki',
  'kalavryta-dairy-cooperative-xirokampos',
  'katsouli-cheese-koliaki',
  'tsatsoulis-cheese-panagitsa'
);
