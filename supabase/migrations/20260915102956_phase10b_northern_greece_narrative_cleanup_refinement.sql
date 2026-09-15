-- Remove wording that can trip stale-marketing guards while preserving the sourced facts.
update public.producers
set story = $$The producer describes old ungrafted Xinomavro vines as part of its vineyard holdings and presents its farming approach as organic and biodynamic. TerroirTrail limits this record to those producer-published facts.$$ 
where id = 'domaine-karanika' and destination = 'northern_greece';

update public.producers
set story = $$The estate works within the PGI Drama wine region. Its published vineyard information emphasizes low summer night temperatures, mountain breezes and site-specific cultivation.$$ 
where id = 'ktima-pavlidis' and destination = 'northern_greece';