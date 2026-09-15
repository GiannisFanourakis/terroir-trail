-- Phase 10B Peloponnese + Tuscany narrative/trust cleanup.
-- Replace legacy promotional copy with restrained, source-backed descriptions.
-- This migration does not change location, road-access, visitability, or Google Place verification.

update public.producers
set tag_line = $$Independent cooperative microbrewery near Patras$$,
    description = $$KYKAO is a small independent cooperative microbrewery founded near Patras. The brewery describes its work as handcrafted beer production with an emphasis on experimentation and an equal working environment.$$,
    story = $$The brewery operates in Platani near Patras and publishes a changing range that includes hop-forward, fruit, grape-ale, sour and barrel-aged beers. TerroirTrail does not carry forward unsupported claims about specific fermentation methods across the whole range.$$,
    indigenous_varieties = array['Mediterranean Fig DIPA','Konophorus Grape Ale','Flemish Red Ale']::text[],
    ethos = array['craft_batch']::text[]
where id = 'kykao-handcrafted-beers' and destination = 'peloponnese';

update public.producers
set tag_line = $$Organic winery in the mountainous Aigialeia and Kalavryta area$$,
    description = $$Tetramythos Winery grew from the vineyard work of brothers Aristos and Stathis Spanos, who later worked with local oenologist Panagiotis Papagiannopoulos. The first Tetramythos bottles were released in 1999.$$,
    story = $$The producer says its vineyards and other crops were brought into organic cultivation, with additional organic vineyards planted in the following years. Construction of the current winery began in 2003 and was completed in 2004.$$,
    indigenous_varieties = array[]::text[],
    ethos = array['organic']::text[]
where id = 'tetramythos-winery' and destination = 'peloponnese';

update public.producers
set tag_line = $$Mantinia estate founded in 1989 with a focus on Moschofilero$$,
    description = $$Ktima Tselepos was founded in Mantinia in 1989 by Yiannis and Amalia Tselepos. The estate's early development centred on the Mantinia vineyard and Moschofilero, with its first Mantinia bottling released in 1991.$$,
    story = $$The winery expanded over time into Nemea and Santorini projects while retaining its Arcadian base at Rizes. The producer's current portfolio includes Moschofilero from Mantinia alongside Agiorgitiko and other Greek and international varieties.$$,
    indigenous_varieties = array['Moschofilero','Agiorgitiko']::text[],
    ethos = array[]::text[]
where id = 'ktima-tselepos' and destination = 'peloponnese';

update public.producers
set tag_line = $$Historic family agricultural estate at Korakochori$$,
    description = $$Domaine Mercouri is a family-owned agricultural estate at Korakochori in the western Peloponnese. The estate traces its foundation to 1864 and has a long history of wine and olive-oil production.$$,
    story = $$The estate's published history records the first vineyard planting in 1870 using Refosco material brought from northern Italy. Wine production later developed alongside the estate's other agricultural activities.$$,
    indigenous_varieties = array['Refosco']::text[],
    ethos = array['family_estate']::text[]
where id = 'domaine-mercouri' and destination = 'peloponnese';

update public.producers
set name = 'Monemvasia Winery Tsimbidi',
    tag_line = $$Family winery in Laconia focused on local Greek grape varieties$$,
    description = $$Monemvasia Winery was founded in 1997 in Laconia by Yorgos and Elli Tsimbidi. The winery developed around the study and revival of local grape varieties and the historic Monemvasia-Malvasia wine tradition.$$,
    story = $$The producer worked with research institutions and wine specialists on the Monemvasia-Malvasia project and local varieties including Monemvasia, Kydonitsa, Asproudi and Mavroudi. The winery states that it works exclusively with Greek local varieties.$$,
    indigenous_varieties = array['Monemvasia','Kydonitsa','Asproudi','Mavroudi']::text[],
    ethos = array['indigenous_only','family_estate']::text[]
where id = 'monemvasia-winery' and destination = 'peloponnese';

update public.producers
set name = 'Liokareas',
    tag_line = $$Family olive-oil producer with roots in the southern Peloponnese$$,
    description = $$Liokareas is a family olive-oil producer whose current range is based on Greek olives, including Koroneiki from the family's orchards. The producer describes more than five generations of family cultivation and olive-oil production.$$,
    story = $$The current portfolio includes extra virgin olive oil, early-harvest oil and cold-fused oils made with ingredients pressed alongside olives. TerroirTrail treats organic certification as product-specific unless broader estate certification is explicitly documented.$$,
    indigenous_varieties = array['Koroneiki','Kalamata olive']::text[],
    ethos = array['family_estate']::text[]
where id = 'liokareas-olive-estate' and destination = 'peloponnese';

update public.producers
set tag_line = $$Nemea winery and vineyard in Koutsi focused on Agiorgitiko$$,
    description = $$Gaia Wines was founded in 1994 by agriculturists Yiannis Paraskevopoulos and Leon Karatsalos. Its Nemea winery was established in 1997 within a privately owned vineyard in Koutsi.$$,
    story = $$The Koutsi winery sits at about 550 metres in the PDO Nemea zone and focuses strongly on Agiorgitiko. Gaia also operates in Santorini and works with both Greek and international grape varieties across its wider portfolio.$$,
    indigenous_varieties = array['Agiorgitiko']::text[],
    ethos = array[]::text[]
where id = 'gaia-wines-nemea' and destination = 'peloponnese';

update public.producers
set name = 'Domaine Skouras',
    tag_line = $$Peloponnese winery established in 1986$$,
    description = $$Domaine Skouras has produced wine in the Peloponnese since 1986. Its current technical portfolio includes native varieties such as Agiorgitiko, Moschofilero and Assyrtiko alongside international varieties.$$,
    story = $$The estate's current wine documentation covers vineyards across Nemea, Mantinia, Argolida and other Peloponnese sites. TerroirTrail keeps this record focused on the producer's published vineyard and wine information rather than legacy superlatives.$$,
    indigenous_varieties = array['Agiorgitiko','Moschofilero','Assyrtiko']::text[],
    ethos = array[]::text[]
where id = 'skouras-winery-nemea' and destination = 'peloponnese';

update public.producers
set tag_line = $$Koutsi estate and winery on the slopes of Nemea$$,
    description = $$Semeli Estate was founded in 1979 and operates a winery among its vineyards in Koutsi, Corinthia. The winery building was completed in 2003 and uses the natural slope of the site for a gravity-fed production process.$$,
    story = $$The estate is located at about 600 metres in Koutsi and works with estate vineyards and affiliated local growers. Its published grape portfolio includes Greek varieties such as Agiorgitiko, Moschofilero, Roditis and Malagousia alongside international varieties.$$,
    indigenous_varieties = array['Agiorgitiko','Moschofilero','Roditis','Malagousia']::text[],
    ethos = array[]::text[]
where id = 'semeli-estate-nemea' and destination = 'peloponnese';

update public.producers
set tag_line = $$Certified-organic estate in Radda in Chianti$$,
    description = $$Azienda Agricola Monteraponi is based in a historic hamlet near Radda in Chianti. The winery sits on a hill at about 470 metres and produces Chianti Classico wines, Vin Santo, olive oil and grappa.$$,
    story = $$The producer states that its products are certified organic by ICEA Italia. Current wine documentation lists vineyard elevations from about 450 to 570 metres and varieties including Sangiovese, Canaiolo, Colorino and Trebbiano.$$,
    indigenous_varieties = array['Sangiovese','Canaiolo','Colorino','Trebbiano']::text[],
    ethos = array['organic']::text[]
where id = 'monteraponi-tuscany' and destination = 'tuscany';