-- Phase 10B Northern Greece narrative/trust cleanup.
-- Replace legacy promotional copy with restrained, source-backed descriptions.
-- This migration does not change location, road-access, visitability, or Google Place verification.

update public.producers
set tag_line = $$Drama estate with vineyards in Kokkinogia and Perichora$$,
    description = $$Ktima Pavlidis is a winery in Drama with privately owned vineyards in Kokkinogia and Perichora. The estate describes a Mediterranean-continental growing environment and uses manual vineyard work together with integrated vineyard management and climate monitoring.$$,
    story = $$The estate works within the PGI Drama wine region. Its published vineyard information emphasizes low summer night temperatures, mountain breezes and site-specific cultivation rather than tourism or award claims.$$,
    indigenous_varieties = array[]::text[],
    ethos = array[]::text[]
where id = 'ktima-pavlidis' and destination = 'northern_greece';

update public.producers
set tag_line = $$High-altitude Amyndeon estate founded in 1997$$,
    description = $$Alpha Estate was founded in 1997 by viticulturist Makis Mavridis and oenologist Angelos Iatridis in Amyndeon, Florina. Its privately owned vineyard covers about 220 hectares at roughly 620 to 710 metres above sea level.$$,
    story = $$The winery is located within the estate vineyards and uses short grape transport, cooling and gravity in its winemaking workflow. The founders' next generation, Angeliki Iatridou and Emorfili Mavridou, now participates in the estate.$$,
    indigenous_varieties = array['Xinomavro','Malagouzia','Sauvignon Blanc','Syrah']::text[],
    ethos = array[]::text[]
where id = 'alpha-estate' and destination = 'northern_greece';

update public.producers
set tag_line = $$Organic and biodynamic vineyards on the Amyndeon plateau$$,
    description = $$Domaine Karanika farms organic and biodynamic vineyards on the Amyndeon plateau and produces sparkling and still wines. The estate places Xinomavro at the centre of its work alongside Assyrtiko and Limniona.$$,
    story = $$The producer describes old ungrafted Xinomavro vines as part of its vineyard holdings and presents its farming approach as organic and biodynamic. TerroirTrail does not add broader quality or award claims beyond that producer-published information.$$,
    indigenous_varieties = array['Xinomavro','Assyrtiko','Limniona']::text[],
    ethos = array['organic','biodynamic','indigenous_only']::text[]
where id = 'domaine-karanika' and destination = 'northern_greece';

update public.producers
set tag_line = $$Organic estate on Mount Pangeon near Kokkinochori$$,
    description = $$Ktima Biblia Chora was established by winemakers Vassilis Tsaktsarlis and Vangelis Gerovassiliou on the slopes of Mount Pangeon near Kokkinochori. The first vines were planted in 1998 and the winery began vinifying there in 2001.$$,
    story = $$The estate reports an approximately 80-hectare privately owned vineyard at about 380 metres elevation, farmed organically from the beginning. Vineyard work, including harvesting, is carried out by hand, and the estate says its labels became certified organic wine in 2020.$$,
    indigenous_varieties = array['Assyrtiko','Sauvignon Blanc','Cabernet Sauvignon','Syrah','Merlot']::text[],
    ethos = array['organic']::text[]
where id = 'domaine-biblia-chora' and destination = 'northern_greece';

update public.producers
set tag_line = $$Naoussa estate on the eastern foothills of Mount Vermion$$,
    description = $$Kir-Yianni was founded in 1997 by Yiannis Boutaris. Its Naoussa estate developed from the Yianakohori vineyard first acquired in 1968 and planted with Xinomavro in the early 1970s.$$,
    story = $$The current Naoussa estate covers about 60 hectares across multiple vineyard blocks and includes Xinomavro together with Syrah, Merlot and Cabernet Sauvignon. The estate is now led by Stellios Boutaris, representing the fifth generation of the family's winemaking history.$$,
    indigenous_varieties = array['Xinomavro','Syrah','Merlot','Cabernet Sauvignon']::text[],
    ethos = array['family_estate']::text[]
where id = 'kir-yianni-naoussa' and destination = 'northern_greece';

update public.producers
set tag_line = $$Naoussa producer devoted to Xinomavro$$,
    description = $$Thymiopoulos Vineyards works with Xinomavro in the Naoussa region, drawing from parcels around Trilofos and Fytia at different elevations. The producer presents Xinomavro as the central variety across its portfolio.$$,
    story = $$Published wine information describes parcels on limestone, schist and clay soils, with wines made from Xinomavro under the Naoussa appellation. Some vineyard parcels are identified by the producer as certified organic; TerroirTrail does not generalize that claim to every vineyard.$$,
    indigenous_varieties = array['Xinomavro']::text[],
    ethos = array['indigenous_only']::text[]
where id = 'thymiopoulos-naoussa' and destination = 'northern_greece';

update public.producers
set name = 'Siris Craft Brewery (Voreia)',
    tag_line = $$Serres microbrewery producing Voreia craft beers$$,
    description = $$Siris Craft Brewery was established in Serres in 2013 and produces the Voreia range of craft beers. The brewery describes its beers as unpasteurized and positions its work within the development of Greek craft brewing.$$,
    story = $$The brewery is located outside Serres and takes its name from Siris, the ancient name associated with the city. Its current range includes styles such as Pilsner, IPA, Stout, Wit, Smoked Amber Ale, Imperial Porter and Lager.$$,
    indigenous_varieties = array['Voreia Pilsner','Voreia IPA','Voreia Smoked Amber Ale','Voreia Imperial Porter']::text[],
    ethos = array['unpasteurized','craft_batch']::text[]
where id = 'siris-craft-brewery' and destination = 'northern_greece';

update public.producers
set tag_line = $$Epanomi estate centred on Malagousia and a dedicated wine museum$$,
    description = $$Ktima Gerovassiliou is an Epanomi wine estate producing PGI Epanomi wines from Greek and international grape varieties. The estate credits Vangelis Gerovassiliou's work with preserving and re-establishing the Malagousia variety.$$,
    story = $$The property combines vineyards, a winery, tasting spaces and the Gerovassiliou Wine Museum. The museum's collections cover corkscrews, wine vessels and tools connected with viticulture, winemaking, cooperage and bottling.$$,
    indigenous_varieties = array['Malagousia','Assyrtiko','Limnio','Mavroudi','Mavrotragano']::text[],
    ethos = array[]::text[]
where id = 'ktima-gerovassiliou' and destination = 'northern_greece';

update public.producers
set name = 'Sknipa Craft Beer',
    tag_line = $$Thessaloniki microbrewery founded from a home-brewing group$$,
    description = $$The team behind Sknipa began as home brewers in 2010 before establishing the Standard Microbrewery of Thessaloniki. The producer describes its beer as fresh, unpasteurized and unfiltered.$$,
    story = $$The brewery operates on the Thessaloniki-Polygyros road and produces the Sknipa and Salonikia beer ranges. Current products include Sknipa Lager, Strong Ale, Bold and Lady alongside Salonikia labels.$$,
    indigenous_varieties = array['Sknipa Lager','Sknipa Strong Ale','Sknipa Bold','Sknipa Lady']::text[],
    ethos = array['unpasteurized','craft_batch']::text[]
where id = 'propator-sknipa-brewery' and destination = 'northern_greece';