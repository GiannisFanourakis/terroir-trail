import type { TerroirRegion } from '../terroirRegions';

/**
 * Sicily (Sicilia).
 *
 * NUTS boundary source: Eurostat/GISCO NUTS 2024, ITG1, WGS84 (EPSG:4326),
 * 1:10M generalized geometry.
 */
export const SICILY_TERROIR_REGION: TerroirRegion = {
  id: "sicily",
  name: "Sicily",
  nativeName: "Sicilia",
  officialName: "Sicilia",
  destination: "sicily",
  countryCode: "IT",
  geographyType: "NUTS",
  nutsCode: "ITG1",
  nutsLevel: 2,
  classificationVersion: "2024",
  eyebrow: "Sicily · Italy",
  summary: "At the crossroads of the Mediterranean, Sicily’s volcanic soils around Mount Etna, calcareous southern hills, and sun-soaked coastal valleys nurture an extraordinary agrarian diversity: ancient olive cultivars, heirloom citrus orchards, mountain pasture cheeses, inland almond and pistachio groves, and indigenous grape varieties.",
  highlights: ["Volcanic soils of Mount Etna & terraced mountain vineyards","Indigenous Nerello Mascalese, Carricante & Nero d’Avola grapes","Artisan Ragusano DOP cheese, Bronte pistachios & blood oranges"],
  sections: [
  {
    "id": "landscape",
    "title": "Mount Etna volcanic slopes, interior hills, and coastal plains",
    "eyebrow": "Landscape",
    "body": "Sicily is the Mediterranean’s largest island, dominated in the east by Mount Etna (over 3,300 m), Europe’s most active stratovolcano. Its black volcanic ash, basalt terraces, and high-altitude microclimates create exceptional growing conditions. Across the island, the terrain shifts into rolling clay-limestone hills around Caltanissetta, the plateau of the Hyblaean Mountains in Ragusa, and coastal citrus groves along the Ionian and Tyrrhenian shores.",
    "highlights": [
      "Mount Etna volcanic terraces",
      "Hyblaean limestone plateau in Ragusa",
      "Sun-drenched coastal citrus belts"
    ]
  },
  {
    "id": "history",
    "title": "Greek agricultural colonies, Arab irrigation systems, and feudal bagli",
    "eyebrow": "History",
    "body": "Sicily’s agricultural heritage is a mosaic of civilizations. Ancient Greeks introduced specialized viticulture and olive cultivation to eastern Sicily; Arab rulers introduced citrus, almonds, sugarcane, and advanced irrigation terracing; and the Norman-Baroque era established large rural estates (bagli) that organized wheat, olive, and wine production across centuries.",
    "highlights": [
      "Ancient Magna Graecia viticultural roots",
      "Arab introduced irrigation & citrus orchards",
      "Historic fortified baglio courtyard estates"
    ]
  },
  {
    "id": "culture",
    "title": "Centuries of peasant craftsmanship and diversified polyculture",
    "eyebrow": "Culture",
    "body": "Sicilian farming is characterized by resilience and biodiversity. Unlike mono-crop regions, traditional Sicilian farmsteads cultivate vines alongside olives, carob, almonds, and capers. The seasonal rhythms of olive pressing in autumn, almond harvests in late summer, and vintage picking on Etna’s high volcanic slopes reflect deep family stewardship.",
    "highlights": [
      "Polyculture farming tradition",
      "Dry-stone terrace viticulture",
      "Deep-rooted family harvest rituals"
    ]
  },
  {
    "id": "food",
    "title": "Etna and Vittoria indigenous wines, Ragusano DOP cheese, and pistachios",
    "eyebrow": "Food & farming",
    "body": "Sicily’s gastronomic identity is world-renowned: indigenous wines from Nerello Mascalese, Carricante, and Frappato; ancient stone-pressed extra virgin olive oils from Nocellara del Belice and Tonda Iblea; raw cow-milk Ragusano DOP aged in wooden troughs; sweet Bronte pistachios; and Pantelleria salted capers.",
    "highlights": [
      "Etna DOC & Cerasuolo di Vittoria DOCG",
      "Nocellara del Belice extra virgin olive oil",
      "Raw cow-milk Ragusano DOP & Bronte pistachios"
    ]
  },
  {
    "id": "explore",
    "title": "Traversing volcanic vineyard terraces, coastal groves, and mountain dairies",
    "eyebrow": "On TerroirTrail",
    "body": "TerroirTrail connects travelers directly to independent Sicilian growers and producers: from high-altitude volcanic cellars reached by narrow mountain switchbacks to remote sheep dairies in the Madonie mountains and historic olive estates in the Belice valley.",
    "highlights": [
      "Verified volcanic cellar & mill entrances",
      "High-altitude artisan dairies & groves",
      "Clear mountain and rural road access ratings"
    ]
  }
],
  center: [37.5, 14.25],
  zoom: 8,
  geometry: {"type":"MultiPolygon","coordinates":[[[[15.599376447000054,38.277446172000055],[15.493792476000067,38.07932204900004],[15.258139134000032,37.80729854700007],[15.21425804100005,37.74511518400004],[15.170838439000022,37.581478394000044],[15.093130622000047,37.487909400000035],[15.091498994000062,37.357708641000045],[15.113700086000051,37.31310086900004],[15.225574378000033,37.26369260000007],[15.192631165000023,37.19039540700004],[15.226998318000028,37.129562812000074],[15.289890084000035,37.09836947900004],[15.280520796000076,37.04906610900008],[15.31749394600007,37.02085679900006],[15.17049299100006,36.929009646000054],[15.10853878200004,36.828340928000046],[15.124722447000067,36.678508900000054],[15.078558986000075,36.65736947800008],[15.000358138000024,36.70284761700003],[14.699208290000058,36.723370138000064],[14.500830503000032,36.78993973100006],[14.458004238000058,36.828340928000046],[14.337611976000062,37.00197127300004],[14.197859985000036,37.08117847900007],[14.036207325000078,37.106028421000076],[13.900192180000033,37.10039517200005],[13.735960024000065,37.158307956000044],[13.553935458000069,37.28036704200008],[13.450613710000027,37.29778554500007],[13.289278297000067,37.383651719000056],[13.174877239000068,37.48400191800005],[13.025806500000044,37.502459473000044],[12.944021657000064,37.57103861400003],[12.896495988000027,37.577118373000076],[12.674273436000021,37.56807166200008],[12.595698380000044,37.64343729400008],[12.490970423000022,37.68717781500004],[12.436132357000076,37.79836540500003],[12.515559383000038,38.01325761500004],[12.713053263000063,38.11763812400005],[12.73617293500007,38.17014324200005],[12.875012637000054,38.04045910900004],[12.944021657000064,38.03059737600006],[12.977262495000048,38.040205865000075],[13.064032786000041,38.087541901000066],[13.063741518000029,38.142942979000054],[13.102966292000076,38.18244448400003],[13.20846135100004,38.177832919000025],[13.312407928000027,38.215554859000065],[13.395240718000025,38.10948797800006],[13.529378429000076,38.10362189700004],[13.565622318000067,38.04549321400003],[13.740788438000038,37.975518486000055],[13.998549247000028,38.03732207000007],[14.183486325000047,38.01939645900006],[14.487782042000049,38.03865732300005],[14.63775025600006,38.07644007000005],[14.745705011000041,38.157049855000025],[14.913496785000063,38.18296489100004],[15.10450150500003,38.127889770000024],[15.23527903200005,38.21143888100005],[15.361684398000023,38.22099534100005],[15.52919589000004,38.295567755000036],[15.599376447000054,38.277446172000055]]],[[[12.664429231000042,35.50894723300007],[12.62427976500004,35.48399189500003],[12.574978645000044,35.50296881500003],[12.627651093000054,35.529324263000035],[12.664429231000042,35.50894723300007]]],[[[12.90259485300004,35.85678572900008],[12.857193675000076,35.84383416500003],[12.819656885000029,35.87270363300007],[12.875928320000071,35.88888754100003],[12.90259485300004,35.85678572900008]]],[[[12.06471414300006,36.768628516000035],[11.999751769000056,36.730906670000024],[11.914090439000063,36.80493606600004],[11.987503225000069,36.840785889000074],[12.06471414300006,36.768628516000035]]],[[[12.353283324000074,37.92421974700005],[12.315599735000035,37.90446289700003],[12.267346798000062,37.92745624200006],[12.321995918000027,37.95117354200005],[12.353283324000074,37.92421974700005]]],[[[12.099863844000026,37.961594895000076],[12.059880451000026,37.94573339100003],[12.014185377000047,37.97328258300007],[12.071588080000026,37.991229264000026],[12.099863844000026,37.961594895000076]]],[[[12.36426042100004,37.98257584900006],[12.329043254000055,37.97466459100008],[12.30086706800006,38.00227220000005],[12.334054759000026,38.036755381000035],[12.36426042100004,37.98257584900006]]],[[[15.008908250000047,38.37293223000006],[14.96963704500007,38.368687023000064],[14.928979041000048,38.40634443500005],[14.975261559000046,38.41681616600005],[15.008908250000047,38.37293223000006]]],[[[14.963551596000059,38.51778797700007],[14.955868870000074,38.44230247100006],[14.889229456000066,38.476701286000036],[14.912904807000075,38.51823225900006],[14.963551596000059,38.51778797700007]]],[[[14.38408148800005,38.55268468600008],[14.35636033000003,38.513211228000046],[14.312267148000046,38.543077949000065],[14.348781243000076,38.56838184500003],[14.38408148800005,38.55268468600008]]],[[[14.894688135000024,38.56087141300003],[14.86270627600004,38.535860669000044],[14.808921651000048,38.55970336000007],[14.857633498000041,38.582836204000046],[14.894688135000024,38.56087141300003]]],[[[14.61442340700006,38.570173348000026],[14.573108148000074,38.546005054000034],[14.525023603000022,38.56775706900004],[14.578671168000028,38.59128807900004],[14.61442340700006,38.570173348000026]]],[[[13.232939274000046,38.709558198000025],[13.197705890000066,38.687906449000025],[13.143017100000066,38.710797196000044],[13.190855226000053,38.732871328000044],[13.232939274000046,38.709558198000025]]],[[[15.250468571000056,38.80457139200007],[15.220288176000054,38.766023903000075],[15.171985059000065,38.78971969100007],[15.217558104000034,38.81691746600006],[15.250468571000056,38.80457139200007]]]]},
  sources: [
  {
    "label": "Regione Siciliana — Dipartimento dell’Agricoltura",
    "url": "https://www.regione.sicilia.it/"
  },
  {
    "label": "Consorzio di Tutela Vini Etna DOC",
    "url": "https://www.proconsorzioetnadoc.com/"
  },
  {
    "label": "Parco dell’Etna",
    "url": "https://www.parcoetna.it/"
  }
],
  boundaryAttribution: "Administrative boundary: Eurostat/GISCO NUTS 2024 · ITG1 · EPSG:4326 · 1:10M",
};
