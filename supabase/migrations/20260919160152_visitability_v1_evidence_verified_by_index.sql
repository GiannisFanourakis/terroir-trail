-- Cover the evidence ledger's optional auth.users foreign key.
create index if not exists idx_producer_fact_evidence_verified_by
  on public.producer_fact_evidence (verified_by_user_id)
  where verified_by_user_id is not null;
