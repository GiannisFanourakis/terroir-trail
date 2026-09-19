import type { Destination } from '../types/terroir';
import type { TerroirRegion, TerroirRegionSection } from './terroirRegions';
import { THESSALY_TERROIR_REGION } from './thessalyRegion';
import { PIEDMONT_TERROIR_REGION } from './piedmontRegion';
import { PUGLIA_TERROIR_REGION } from './regions/pugliaRegion';
import { SICILY_TERROIR_REGION } from './regions/sicilyRegion';
import { SOUTH_TYROL_TERROIR_REGION } from './regions/southTyrolRegion';
import { PROVENCE_TERROIR_REGION } from './regions/provenceRegion';
import { CATALONIA_TERROIR_REGION } from './regions/cataloniaRegion';
import { ALENTEJO_TERROIR_REGION } from './regions/alentejoRegion';
import { ISTRIA_TERROIR_REGION } from './regions/istriaRegion';
import { POMURSKA_TERROIR_REGION } from './regions/pomurskaRegion';
import { SOUTHEAST_SLOVENIA_TERROIR_REGION } from './regions/southeastSloveniaRegion';
import { CENTRAL_SLOVENIA_TERROIR_REGION } from './regions/centralSloveniaRegion';
import { GORISKA_TERROIR_REGION } from './regions/goriskaRegion';
import { TRONDELAG_TERROIR_REGION } from './regions/trondelagRegion';
import { MORE_OG_ROMSDAL_TERROIR_REGION } from './regions/moreOgRomsdalRegion';
import { BUSKERUD_TERROIR_REGION } from './regions/buskerudRegion';
import { VESTLAND_TERROIR_REGION } from './regions/vestlandRegion';

export interface TerroirRegionStory {
  eyebrow: string;
  summary: string;
  highlights: string[];
  sections: TerroirRegionSection[];
}

/**
 * Editorial copy for the territory-level Explore Story drawer.
 *
 * Geography, boundaries and source links stay in terroirRegions.ts. Keeping the
 * narrative here lets us edit the travel writing without touching the large
 * GeoJSON payloads that power the map.
 */
export const TERROIR_REGION_STORIES: Record<Destination, TerroirRegionStory> = {
  crete: {
    eyebrow: 'Crete · Greece',
    summary:
      'Crete changes quickly once you leave the coast. Roads climb through olive country and vineyards, cross high plateaus and sheep-grazing mountains, then drop back towards fertile plains and the sea. The island’s food still follows that geography: olive oil, wine, cheese, honey, herbs and seasonal produce are part of everyday rural life.',
    highlights: [
      'Mountain villages and high plateaus',
      'Olive groves, vineyards and small farms',
      'Cheese, honey, herbs and seasonal cooking',
    ],
    sections: [
      {
        id: 'landscape',
        title: 'Crete rises fast from the sea',
        eyebrow: 'Landscape',
        body:
          'Crete is Greece’s largest island, but it rarely feels like one continuous landscape. The White Mountains, Psiloritis and Dikti break the island into distinct valleys, plateaus and coastal plains. Psiloritis reaches 2,456 metres, and even short drives can move from dry hillsides to orchards, vineyards or cooler mountain country. That variety is one reason local food and farming traditions differ so much from one part of the island to another.',
        highlights: ['White Mountains, Psiloritis and Dikti', 'Plateaus, valleys and coast', 'Psiloritis · 2,456 m'],
      },
      {
        id: 'history',
        title: 'The past is never very far away',
        eyebrow: 'History',
        body:
          'The Minoan palaces are the best-known chapter of Cretan history, but they are only one layer. In 2025 UNESCO inscribed six Minoan Palatial Centres — Knossos, Phaistos, Malia, Zakros, Zominthos and Kydonia — on the World Heritage List. Byzantine churches, Venetian towns and fortifications, Ottoman traces and old village architecture sit alongside them. In rural Crete, history is often encountered on the way to somewhere else rather than behind a museum door.',
        highlights: ['Six UNESCO Minoan palatial centres', 'Venetian and Byzantine layers', 'Historic villages and rural routes'],
      },
      {
        id: 'culture',
        title: 'Village life still matters',
        eyebrow: 'Culture',
        body:
          'Cretan identity is carried as much through ordinary village life as through monuments. Music, dance, panigyria, storytelling, craft skills and farming knowledge are still passed on locally. The island’s official intangible-heritage work records these practices alongside cultivation, food traditions and knowledge of local plants. They are not relics; many are still part of family and community life.',
        highlights: ['Music, dance and village festivals', 'Craft and farming knowledge', 'Living food traditions'],
      },
      {
        id: 'food',
        title: 'The table starts in the landscape',
        eyebrow: 'Food & farming',
        body:
          'Olive oil is everywhere, but Crete is not one-product country. Vineyards, sheep and goat dairies, apiaries, herb growers and mixed farms all shape the island’s food culture. Dakos, kalitsounia, greens, goat, regional cheeses, honey, wine and tsikoudia make more sense when you meet the people producing the ingredients. Much of the appeal is in simple food whose origin is easy to understand.',
        highlights: ['Olive oil and wine', 'Sheep and goat dairy', 'Honey, herbs and wild greens'],
      },
      {
        id: 'explore',
        title: 'Take the slower road',
        eyebrow: 'On TerroirTrail',
        body:
          'The most interesting stops are often outside the obvious resort routes: a family winery above a village, a dairy on a mountain road, an olive mill in the plain or a beekeeper working inland. TerroirTrail is meant to help you find those places without pretending every farm road is an easy drive. Producer identity, visitor information and road access are checked separately so you can decide what fits your trip.',
        highlights: ['Independent producers', 'Practical access information', 'Routes beyond the resort strip'],
      },
    ],
  },

  santorini: {
    eyebrow: 'Santorini · Greece',
    summary:
      'Most people first meet Santorini at the caldera edge. Its farming story sits just behind the view: vines trained low against the wind, dry-farmed fava and tomatoes, capers on stone walls and old cellars cut into volcanic earth. It is a small island, but agriculture here has had to adapt to unusually hard conditions.',
    highlights: [
      'Volcanic soils and dry farming',
      'Kouloura basket-trained vines',
      'Assyrtiko, fava, tomatoes and capers',
    ],
    sections: [
      {
        id: 'landscape',
        title: 'Farming on a volcano',
        eyebrow: 'Landscape',
        body:
          'Santorini is built from volcanic ash, lava and pumice. There is little fresh water, summer rain is scarce and the Aegean wind can be punishing. Farmers have learned to work with those limits rather than against them. The porous soil stores what moisture it can, while low-growing crops and vines are protected from wind and sun. The caldera gets the photographs, but the cultivated land tells you how people have actually lived here.',
        highlights: ['Ash, lava and pumice soils', 'Strong Aegean winds', 'Dry-farmed island agriculture'],
      },
      {
        id: 'history',
        title: 'Akrotiri, old vines and long memory',
        eyebrow: 'History',
        body:
          'The prehistoric settlement of Akrotiri was buried by the Bronze Age eruption and is one of the island’s clearest links to its ancient past. Viticulture also has deep roots here. Santorini’s sandy volcanic soils have helped protect vines from phylloxera, so many vineyards are still planted on ungrafted root systems that are renewed over generations. Wine is not a recent tourism invention on the island; it belongs to a much older agricultural continuity.',
        highlights: ['Prehistoric Akrotiri', 'Ungrafted vine root systems', 'Long-established viticulture'],
      },
      {
        id: 'culture',
        title: 'The kouloura is a practical idea, not a decoration',
        eyebrow: 'Culture',
        body:
          'Santorini’s best-known vineyard tradition is the kouloura: vines woven into low baskets close to the ground so the grapes sit protected inside. Traditional canavas — cave-like cellars cut into the soft volcanic rock — are another local response to the island’s climate and geology. Both are reminders that the forms visitors now find picturesque began as practical solutions to farming and winemaking in a difficult place.',
        highlights: ['Kouloura vine training', 'Traditional canava cellars', 'Farming shaped by wind and scarcity'],
      },
      {
        id: 'food',
        title: 'Small yields, strong flavours',
        eyebrow: 'Food & farming',
        body:
          'Assyrtiko and Vinsanto are the famous names, but Santorini’s food culture is broader than wine. PDO fava, small tomatoes, capers and white eggplants all come from the same dry, mineral landscape. The island’s crops tend to be low-yielding and intensely flavoured. A good way to understand Santorini is to taste the same ingredients in a village kitchen, a winery and a producer’s field rather than only at the caldera restaurants.',
        highlights: ['Assyrtiko and Vinsanto', 'PDO Santorini fava', 'Tomatoes, capers and white eggplant'],
      },
      {
        id: 'explore',
        title: 'Look inland as well as over the caldera',
        eyebrow: 'On TerroirTrail',
        body:
          'Pyrgos, Megalochori, Mesa Gonia and Exo Gonia show a quieter side of the island than the main caldera strip. Around them are wineries, old canavas, a craft brewery and small producers working in very limited space. TerroirTrail helps separate places that are genuinely set up for visitors from those that simply appear on a map, and keeps road and entrance information visible when narrow island routes matter.',
        highlights: ['Inland villages', 'Independent cellars and makers', 'Clear entrance and access information'],
      },
    ],
  },

  peloponnese: {
    eyebrow: 'Peloponnese · Greece',
    summary:
      'The Peloponnese is too varied to reduce to one postcard. A road trip can move from the vineyards of Nemea to Arcadian mountain country, from the olive groves of Messinia to citrus around Argos, then down into Mani or across to Monemvasia. Food, wine and farming change with the landscape.',
    highlights: [
      'Nemea and Mantinia wine country',
      'Messinian and Laconian olive landscapes',
      'Mountain villages, citrus plains and coastal routes',
    ],
    sections: [
      {
        id: 'landscape',
        title: 'A peninsula of mountains, plains and gulfs',
        eyebrow: 'Landscape',
        body:
          'The Peloponnese is crossed by mountain ranges and broken up by deep gulfs, fertile basins and long coastal stretches. Taygetos dominates the south, while Arcadia brings high plateaus and colder inland conditions. Nemea, Mantinia, Aigialeia, Messinia and Laconia each have very different growing environments. Distances can look modest on a map, but the roads often climb and turn; moving through the peninsula is part of understanding it.',
        highlights: ['Taygetos and Arcadian highlands', 'Nemea and Mantinia plateaus', 'Coastal plains and deep gulfs'],
      },
      {
        id: 'history',
        title: 'Ancient sites are woven into ordinary routes',
        eyebrow: 'History',
        body:
          'Mycenae, Olympia and Sparta place the Peloponnese at the centre of some of Greece’s best-known ancient history. Later periods left an equally visible mark: Byzantine Mystras, fortified Monemvasia and the Venetian layers of places such as Nafplio, Methoni and Koroni. What makes the peninsula unusual is how often these sites sit close to working vineyards, olive groves and villages rather than apart from them.',
        highlights: ['Mycenae, Olympia and Sparta', 'Byzantine Mystras', 'Monemvasia and Venetian coastal towns'],
      },
      {
        id: 'culture',
        title: 'Local identity changes from valley to valley',
        eyebrow: 'Culture',
        body:
          'There is no single Peloponnesian village culture. Mani has its stone tower houses; Arcadia has mountain settlements shaped by pastoral life; olive-growing districts follow the rhythm of the winter harvest; wine villages organise the year around pruning and vintage. Family farms, mills, dairies and small workshops still sit inside those local routines, which is why travelling slowly reveals more than trying to cover the peninsula in one sweep.',
        highlights: ['Mani stone villages', 'Mountain pastoral traditions', 'Olive and grape harvest rhythms'],
      },
      {
        id: 'food',
        title: 'Wine country meets olive country',
        eyebrow: 'Food & farming',
        body:
          'Nemea is closely associated with Agiorgitiko, while the high Mantinia plateau is known for Moschofilero. Messinia and Laconia bring major olive-growing landscapes, with Kalamata oil and table olives among the best-known products. Add local cheeses, citrus from the Argolid, cured pork traditions and the sweet wines of Monemvasia and the peninsula becomes a useful reminder that Greek regional food is rarely about one signature ingredient.',
        highlights: ['Agiorgitiko and Moschofilero', 'Olive oil and table olives', 'Cheese, citrus and regional cured meats'],
      },
      {
        id: 'explore',
        title: 'Plan by region, not by checklist',
        eyebrow: 'On TerroirTrail',
        body:
          'The Peloponnese rewards a road-trip approach: choose a valley, wine zone or stretch of coast and give it time. TerroirTrail brings together wineries, olive producers, dairies and other small makers while keeping practical details — entrance points, visitor status and road access — separate from the story. That matters in a region where the most interesting stop may be one mountain turn beyond the obvious route.',
        highlights: ['Regional road trips', 'Small producers across categories', 'Entrance and road-access checks'],
      },
    ],
  },

  thessaly: {
    eyebrow: THESSALY_TERROIR_REGION.eyebrow,
    summary: THESSALY_TERROIR_REGION.summary,
    highlights: THESSALY_TERROIR_REGION.highlights,
    sections: THESSALY_TERROIR_REGION.sections,
  },

  northern_greece: {
    eyebrow: 'Macedonia · Greece',
    summary:
      'Macedonia stretches across a large part of northern Greece, from lake country and cold inland plateaus to the plains around Thessaloniki, the hills of Chalkidiki and the eastern slopes towards Kavala and Drama. Xinomavro may be its best-known agricultural name, but dairy, peppers, beans, tsipouro and brewing are just as much part of the regional picture.',
    highlights: [
      'Naoussa and Amyndeon wine country',
      'Lakes, mountains and northern plains',
      'Dairy, peppers, beans, spirits and brewing',
    ],
    sections: [
      {
        id: 'landscape',
        title: 'Northern Greece changes character quickly',
        eyebrow: 'Landscape',
        body:
          'Western Macedonia has high plateaus, mountains and lakes, with cold winters around places such as Amyndeon and Prespa. Further east, the land opens towards the Axios plain, Thessaloniki and the Aegean, then rises again around Chalkidiki and Mount Pangeon. Those shifts in altitude and climate explain why vineyards, grazing, grain, vegetables and fruit can all feel at home within the same broad region.',
        highlights: ['Amyndeon and Prespa lake country', 'Axios plain and Aegean coast', 'Chalkidiki and Mount Pangeon'],
      },
      {
        id: 'history',
        title: 'A region shaped by routes and crossings',
        eyebrow: 'History',
        body:
          'Ancient Macedon is part of the region’s identity through places such as Aigai and Pella. Thessaloniki adds another long urban story: Roman, Byzantine, Ottoman, Sephardic Jewish and modern Balkan influences all met in a major port and trading city. Away from the city, monasteries, market towns and farming villages tell a less monumental but equally important story of movement between the Balkans and the Aegean.',
        highlights: ['Aigai and Pella', 'Byzantine Thessaloniki', 'Balkan and Aegean trading routes'],
      },
      {
        id: 'culture',
        title: 'There is no single Macedonian tradition',
        eyebrow: 'Culture',
        body:
          'The region is large enough that customs change noticeably from west to east. Wine villages around Naoussa, lake communities in the west, pastoral areas, the markets and food culture of Thessaloniki, and the monastic landscape of Mount Athos all belong to the same northern Greek geography without being interchangeable. Local festivals, music, harvest customs and family food traditions make more sense when treated as specific to place rather than as one regional stereotype.',
        highlights: ['Wine-village traditions', 'Lake and mountain communities', 'Thessaloniki and monastic heritage'],
      },
      {
        id: 'food',
        title: 'Xinomavro is only the beginning',
        eyebrow: 'Food & farming',
        body:
          'Naoussa and Amyndeon are the classic homes of Xinomavro, a grape that can produce pale, structured reds with distinctive savoury character. Beyond wine, northern Greece is known for dairy, Florina peppers, beans from the Prespa area, tsipouro and a growing craft-beer scene. Thessaloniki adds a strong urban food culture shaped by the region’s long history of migration and trade.',
        highlights: ['Naoussa and Amyndeon Xinomavro', 'Florina peppers and Prespa beans', 'Dairy, tsipouro and craft beer'],
      },
      {
        id: 'explore',
        title: 'Give northern Greece room on the map',
        eyebrow: 'On TerroirTrail',
        body:
          'The distances here are larger than on an island, so a good trip works in clusters: Naoussa and Veria, Amyndeon and the lakes, Thessaloniki and nearby producers, or the eastern wine and food routes towards Drama and Kavala. TerroirTrail helps turn those areas into practical drives by showing independent producers alongside verified locations, visitor information and entrance points.',
        highlights: ['Regional driving clusters', 'Wine, dairy and brewing stops', 'Verified locations and entrances'],
      },
    ],
  },

  tuscany: {
    eyebrow: 'Tuscany · Italy',
    summary:
      'Tuscany is famous enough to arrive with its own clichés. On the ground it is much more varied: Apennine foothills, Chianti ridges, the clay country south of Siena, Val d’Orcia, Maremma and the Tyrrhenian coast. Wine matters, but so do olive oil, sheep cheese, grain, livestock, truffles and the working farms behind the scenery.',
    highlights: [
      'Chianti hills and Val d’Orcia',
      'Sangiovese, olive oil and pecorino',
      'Family farms, borghi and country roads',
    ],
    sections: [
      {
        id: 'landscape',
        title: 'More than the cypress-road postcard',
        eyebrow: 'Landscape',
        body:
          'The familiar central Tuscan hills are only part of the region. The Apennines rise in the north and east, the Apuan Alps bring a harder mountain landscape, the clay hills of the Crete Senesi look almost bare in places, and the Maremma opens towards the Tyrrhenian coast. Vineyards and olive groves dominate many famous views, but woodland, pasture, grain and mixed farming are equally important to the rural landscape.',
        highlights: ['Apennines and Apuan Alps', 'Chianti and Crete Senesi', 'Maremma and Tyrrhenian coast'],
      },
      {
        id: 'history',
        title: 'The countryside has a political history too',
        eyebrow: 'History',
        body:
          'Etruscan settlements, Roman roads, medieval communes and Renaissance city-states all left marks on Tuscany, but the rural landscape was shaped by power and landholding as much as by art. In 1716 Cosimo III de’ Medici formally defined production areas including Chianti, Pomino, Carmignano and Valdarno. The region’s famous wine geography therefore has a documented history that predates modern appellation systems by centuries.',
        highlights: ['Etruscan and Roman roots', 'Medieval communes and Renaissance cities', '1716 Medici wine boundaries'],
      },
      {
        id: 'culture',
        title: 'Farmhouses tell part of the story',
        eyebrow: 'Culture',
        body:
          'Many of the farmhouses, field patterns and cypress-lined lanes associated with Tuscany were shaped by the old mezzadria sharecropping system. That system is gone, but its physical imprint remains. Village sagre, seasonal foraging, olive and grape harvests and small-scale craft production still give rural Tuscany a calendar that feels different from the museum cities only a short drive away.',
        highlights: ['Mezzadria farm landscapes', 'Village sagre and harvests', 'Foraging and rural craft traditions'],
      },
      {
        id: 'food',
        title: 'Simple food, very specific ingredients',
        eyebrow: 'Food & farming',
        body:
          'Tuscan cooking is often plain on paper and exacting in practice. Unsalted bread, peppery olive oil, beans, soups such as ribollita, grilled meat and pecorino all depend heavily on ingredient quality. Sangiovese anchors Chianti Classico, Brunello di Montalcino and Vino Nobile di Montepulciano, while olive oil and sheep cheese connect many of the same hill landscapes to the table.',
        highlights: ['Sangiovese wine regions', 'Extra virgin olive oil', 'Pecorino and cucina povera'],
      },
      {
        id: 'explore',
        title: 'Leave time for the road between towns',
        eyebrow: 'On TerroirTrail',
        body:
          'A useful rural Tuscany trip is not only Florence, Siena and a famous winery. Small fattorie, family estates and village producers are scattered along secondary roads, including stretches of strade bianche where route and vehicle choice matter. TerroirTrail focuses on the practical side of finding those places: the correct entrance, whether visits are genuinely offered and what kind of road leads there.',
        highlights: ['Independent fattorie and estates', 'Country-road discovery', 'Verified entrances and visitability'],
      },
    ],
  },

  piedmont: {
    eyebrow: PIEDMONT_TERROIR_REGION.eyebrow,
    summary: PIEDMONT_TERROIR_REGION.summary,
    highlights: PIEDMONT_TERROIR_REGION.highlights,
    sections: PIEDMONT_TERROIR_REGION.sections,
  },
  puglia: {
    eyebrow: PUGLIA_TERROIR_REGION.eyebrow,
    summary: PUGLIA_TERROIR_REGION.summary,
    highlights: PUGLIA_TERROIR_REGION.highlights,
    sections: PUGLIA_TERROIR_REGION.sections,
  },
  sicily: {
    eyebrow: SICILY_TERROIR_REGION.eyebrow,
    summary: SICILY_TERROIR_REGION.summary,
    highlights: SICILY_TERROIR_REGION.highlights,
    sections: SICILY_TERROIR_REGION.sections,
  },
  south_tyrol: {
    eyebrow: SOUTH_TYROL_TERROIR_REGION.eyebrow,
    summary: SOUTH_TYROL_TERROIR_REGION.summary,
    highlights: SOUTH_TYROL_TERROIR_REGION.highlights,
    sections: SOUTH_TYROL_TERROIR_REGION.sections,
  },
  provence: {
    eyebrow: PROVENCE_TERROIR_REGION.eyebrow,
    summary: PROVENCE_TERROIR_REGION.summary,
    highlights: PROVENCE_TERROIR_REGION.highlights,
    sections: PROVENCE_TERROIR_REGION.sections,
  },
  catalonia: {
    eyebrow: CATALONIA_TERROIR_REGION.eyebrow,
    summary: CATALONIA_TERROIR_REGION.summary,
    highlights: CATALONIA_TERROIR_REGION.highlights,
    sections: CATALONIA_TERROIR_REGION.sections,
  },
  alentejo: {
    eyebrow: ALENTEJO_TERROIR_REGION.eyebrow,
    summary: ALENTEJO_TERROIR_REGION.summary,
    highlights: ALENTEJO_TERROIR_REGION.highlights,
    sections: ALENTEJO_TERROIR_REGION.sections,
  },
  istria: {
    eyebrow: ISTRIA_TERROIR_REGION.eyebrow,
    summary: ISTRIA_TERROIR_REGION.summary,
    highlights: ISTRIA_TERROIR_REGION.highlights,
    sections: ISTRIA_TERROIR_REGION.sections,
  },
  pomurska: {
    eyebrow: POMURSKA_TERROIR_REGION.eyebrow,
    summary: POMURSKA_TERROIR_REGION.summary,
    highlights: POMURSKA_TERROIR_REGION.highlights,
    sections: POMURSKA_TERROIR_REGION.sections,
  },
  southeast_slovenia: {
    eyebrow: SOUTHEAST_SLOVENIA_TERROIR_REGION.eyebrow,
    summary: SOUTHEAST_SLOVENIA_TERROIR_REGION.summary,
    highlights: SOUTHEAST_SLOVENIA_TERROIR_REGION.highlights,
    sections: SOUTHEAST_SLOVENIA_TERROIR_REGION.sections,
  },
  central_slovenia: {
    eyebrow: CENTRAL_SLOVENIA_TERROIR_REGION.eyebrow,
    summary: CENTRAL_SLOVENIA_TERROIR_REGION.summary,
    highlights: CENTRAL_SLOVENIA_TERROIR_REGION.highlights,
    sections: CENTRAL_SLOVENIA_TERROIR_REGION.sections,
  },
  goriska: {
    eyebrow: GORISKA_TERROIR_REGION.eyebrow,
    summary: GORISKA_TERROIR_REGION.summary,
    highlights: GORISKA_TERROIR_REGION.highlights,
    sections: GORISKA_TERROIR_REGION.sections,
  },
  trondelag: {
    eyebrow: TRONDELAG_TERROIR_REGION.eyebrow,
    summary: TRONDELAG_TERROIR_REGION.summary,
    highlights: TRONDELAG_TERROIR_REGION.highlights,
    sections: TRONDELAG_TERROIR_REGION.sections,
  },
  more_og_romsdal: {
    eyebrow: MORE_OG_ROMSDAL_TERROIR_REGION.eyebrow,
    summary: MORE_OG_ROMSDAL_TERROIR_REGION.summary,
    highlights: MORE_OG_ROMSDAL_TERROIR_REGION.highlights,
    sections: MORE_OG_ROMSDAL_TERROIR_REGION.sections,
  },
  buskerud: {
    eyebrow: BUSKERUD_TERROIR_REGION.eyebrow,
    summary: BUSKERUD_TERROIR_REGION.summary,
    highlights: BUSKERUD_TERROIR_REGION.highlights,
    sections: BUSKERUD_TERROIR_REGION.sections,
  },
  vestland: {
    eyebrow: VESTLAND_TERROIR_REGION.eyebrow,
    summary: VESTLAND_TERROIR_REGION.summary,
    highlights: VESTLAND_TERROIR_REGION.highlights,
    sections: VESTLAND_TERROIR_REGION.sections,
  },
};

export const withTerroirRegionStory = (region: TerroirRegion): TerroirRegion => {
  const story = TERROIR_REGION_STORIES[region.destination];
  return {
    ...region,
    ...story,
  };
};
