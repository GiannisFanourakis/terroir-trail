alter table public.producers
  rename column greek_name to local_name;

comment on column public.producers.local_name is
  'Producer name in the language and script used locally by the producer. Preserve official brand styling; may equal name when the official local brand is already the same.';

update public.producers
set local_name = coalesce(nullif(btrim(local_name), ''), name);

update public.producers
set local_name = case id
  when 'baladinos-dairy-varipetro' then 'Μπαλαντίνος'
  when 'psiloritis-cheese-dairy-livadia' then 'Τυροκομείο Ψηλορείτης'
  when 'stamatogiorgis-dairy-smari' then 'Τυροκομείο Σταματογιώργης'
  when 'arvanitis-dairy-neochorouda' then 'Τυροκομείο Αρβανίτη'
  when 'christakis-patria-feta-proastio' then 'ΧΡΙΣΤΑΚΗΣ Α.Β.Ε.Ε.'
  when 'argogal-koromichi-kefalari' then 'ΑΡΓΟΓΑΛ'
  when 'elatos-kapetanou-schinochori' then 'ΕΛΑΤΟΣ Γαλακτοκομικά'
  when 'tyrnavos-winery-cooperative-thessaly' then 'Αγροτικός Οινοποιητικός Συνεταιρισμός Τυρνάβου'
  when 'domaine-d-migas-thessaly' then 'Κτήμα Δ. Μίγας'
  when 'domaine-zafeirakis-thessaly' then 'Κτήμα Ζαφειράκη'
  when 'tsililis-theopetra-thessaly' then 'Κ. Τσιλιλής Α.Ε. / Κτήμα Θεόπετρα'
  when 'voliotis-family-olive-mill-thessaly' then 'Ελαιοτριβείο Οικογένειας Βολιώτη'
  else local_name
end
where id in (
  'baladinos-dairy-varipetro',
  'psiloritis-cheese-dairy-livadia',
  'stamatogiorgis-dairy-smari',
  'arvanitis-dairy-neochorouda',
  'christakis-patria-feta-proastio',
  'argogal-koromichi-kefalari',
  'elatos-kapetanou-schinochori',
  'tyrnavos-winery-cooperative-thessaly',
  'domaine-d-migas-thessaly',
  'domaine-zafeirakis-thessaly',
  'tsililis-theopetra-thessaly',
  'voliotis-family-olive-mill-thessaly'
);

update public.producers
set local_name = case id
  when 'grubic-olive-oil-istria' then 'GRUBIĆ Uljara'
  when 'kozlovic-winery-istria' then 'Vinarija Kozlović'
  when 'assuli-winery-sicily' then 'Assuli'
  when 'lahnerhof-distillery-south-tyrol' then 'Bauernbrennerei Lahnerhof'
  when 'moarhof-cheese-dairy-south-tyrol' then 'Hofkäserei Moarhof'
  when 'trnulja-estate-central-slovenia' then 'Ekološka kmetija Trnulja'
  when 'stankovic-honey-garden-southeast-slovenia' then 'Zavod Čebela'
  else local_name
end
where id in (
  'grubic-olive-oil-istria',
  'kozlovic-winery-istria',
  'assuli-winery-sicily',
  'lahnerhof-distillery-south-tyrol',
  'moarhof-cheese-dairy-south-tyrol',
  'trnulja-estate-central-slovenia',
  'stankovic-honey-garden-southeast-slovenia'
);

do $$
declare
  total_count integer;
  missing_count integer;
begin
  select count(*),
         count(*) filter (where local_name is null or btrim(local_name) = '')
    into total_count, missing_count
  from public.producers;

  if total_count <> 147 then
    raise exception 'Expected 147 producers, found %', total_count;
  end if;

  if missing_count <> 0 then
    raise exception 'local_name coverage incomplete: % missing rows', missing_count;
  end if;
end $$;
