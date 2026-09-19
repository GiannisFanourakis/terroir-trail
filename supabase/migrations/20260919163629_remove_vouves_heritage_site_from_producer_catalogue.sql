-- Remove the Vouves museum/monumental tree heritage attraction from the
-- producer catalogue entirely. It is not a producer and must not reappear
-- through dependent experience rows, offline fallback, or future seeded state.

delete from public.bookings
where producer_id='monumental-olive-tree-vouves';

delete from public.reviews
where producer_id='monumental-olive-tree-vouves';

delete from public.producer_fact_evidence
where producer_id='monumental-olive-tree-vouves';

delete from public.experiences
where producer_id='monumental-olive-tree-vouves';

delete from public.producers
where id='monumental-olive-tree-vouves';
