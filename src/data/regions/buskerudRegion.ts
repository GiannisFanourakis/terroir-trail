import type { TerroirRegion } from '../terroirRegions';

/**
 * Buskerud (Buskerud).
 *
 * Statistical Region boundary source: Eurostat/GISCO Statistical Regions (SR) 2024, NO085, WGS84 (EPSG:4326),
 * 1:10M generalized geometry.
 */
export const BUSKERUD_TERROIR_REGION: TerroirRegion = {
  id: "buskerud",
  name: "Buskerud",
  nativeName: "Buskerud",
  officialName: "Buskerud",
  destination: "buskerud",
  countryCode: "NO",
  geographyType: "Statistical Region",
  nutsCode: "NO085",
  nutsLevel: 3,
  classificationVersion: "2024",
  eyebrow: "Buskerud · Norway",
  summary: "Spanning from the rolling forest valleys of Hallingdal and Numedal to the high windswept plateau of Hardangervidda, Buskerud preserves classic Norwegian mountain farming traditions: summer dairy farming (stølsdrift) on high alpine plateaus, artisanal goat and cow cheeses, foraging for cloudberries and lingonberries, and cold-hardy rye and barley.",
  highlights: ["Forested river valleys rising to the Hardangervidda high plateau","Historic stølsdrift mountain summer dairy grazing traditions","Artisan raw-milk cow & goat cheeses, Brunost & cured mountain meats"],
  sections: [
  {
    "id": "landscape",
    "title": "Forested valleys rising into the high plateau of Hardangervidda",
    "eyebrow": "Landscape",
    "body": "Buskerud stretches from the Drammen fjord in the southeast up through the expansive pine and spruce valleys of Hallingdal and Numedal, culminating in the vast subalpine plateau of Hardangervidda—Europe’s largest mountain plateau. Subalpine grazing meadows provide exceptional forage for dairy animals during the short summer.",
    "highlights": [
      "Europe’s largest mountain plateau: Hardangervidda",
      "Long glacial river valleys of Hallingdal & Numedal",
      "Subalpine birch forests and alpine meadows"
    ]
  },
  {
    "id": "history",
    "title": "Centuries of high-mountain summer dairy grazing and historic stave churches",
    "eyebrow": "History",
    "body": "Valleys in Buskerud retain some of Norway’s finest medieval wooden stave churches (such as Nore and Uvdal), testimony to wealthy agrarian communities supported by cattle and timber. For centuries, farmers maintained summer farms (støler) high in the mountains to conserve lowland valley pastures for winter hay.",
    "highlights": [
      "12th-century stave church agrarian communities",
      "Centuries of documented stølsdrift grazing rights",
      "Traditional timber architecture and folk craftsmanship"
    ]
  },
  {
    "id": "culture",
    "title": "Living støl / saeter culture and traditional flatbread baking",
    "eyebrow": "Culture",
    "body": "The soul of Buskerud’s rural culture is stølslivet—the summer mountain farm life. Families moved herds to high pastures, milking twice daily and making cheese and butter on site over wood fires. Traditional takke-baked flatbreads (kling and lefse) remain staple heritage crafts passed through generations.",
    "highlights": [
      "Living mountain støl dairy craftsmanship",
      "Traditional takke-baked flatbread baking",
      "Heritage mountain folklore and rosemåling art"
    ]
  },
  {
    "id": "food",
    "title": "Raw-milk mountain cheeses, brown goat cheese, and cured lamb",
    "eyebrow": "Food & farming",
    "body": "The region’s artisanal food production is led by award-winning dairies like Rueslåtten Ysteri in Hol: raw cow-milk cheeses like Lord Garvagh, delicate goat cheeses, authentic caramelized brown goat cheese (Brunost), cured mountain lamb (Fenalår), and wild cloudberry preserves.",
    "highlights": [
      "Artisan raw-milk Lord Garvagh & alpine cheeses",
      "Authentic caramelized brown goat cheese (Brunost)",
      "Fenalår cured lamb & wild mountain berries"
    ]
  },
  {
    "id": "explore",
    "title": "Traveling high-valley routes to working summer mountain farms and dairies",
    "eyebrow": "On TerroirTrail",
    "body": "TerroirTrail guides you along mountain routes in Hallingdal and Numedal to active family summer farms, artisan cheese dairies, and farm shops, backed by verified locations and reliable road access ratings.",
    "highlights": [
      "Verified summer støl and valley cheese dairy entrances",
      "Mountain road access and clearance classifications",
      "Direct connections to dedicated alpine producers"
    ]
  }
],
  center: [60.03, 9.31],
  zoom: 8,
  geometry: {"type":"MultiPolygon","coordinates":[[[[10.38433092200006,59.534213616000045],[10.282397762000073,59.662333441000044],[10.022283586000071,59.649162887000045],[9.947901496000043,59.586312950000035],[10.017071883000028,59.47580377700007],[9.819820203000063,59.46401684800003],[9.77124737500003,59.42987265900007],[9.752684136000028,59.41682366100008],[9.654131206000045,59.41843634800006],[9.489807112000051,59.49395541500007],[9.490833640000062,59.55152633600005],[9.347981920000052,59.708319337000034],[9.340063502000021,59.782479770000066],[9.198695004000058,59.83596713800006],[9.163912248000031,59.92299629100006],[9.013860090000037,59.98946916600005],[8.938868383000056,60.099323808000065],[8.73809248200007,60.174500497000054],[8.145821444000035,60.18356896000006],[7.831323152000039,60.11091129300007],[7.647029168000074,60.124877612000034],[7.48804036000007,60.09883859400003],[7.666574720000028,60.29961274400006],[7.716556787000059,60.49527367500008],[7.608578231000024,60.63084683500006],[7.520258027000068,60.66699825300003],[7.530446622000056,60.698504952000064],[7.604225267000061,60.73751499000008],[7.699612738000042,60.74378746000008],[7.755473574000064,60.84688655600007],[7.867716904000076,60.91795701900003],[8.044442270000047,60.899763129000064],[8.14531745100004,60.97143205700007],[8.21758939700004,60.98034395800005],[8.26583977100006,61.030230302000064],[8.235994322000067,61.05478107600004],[8.251701008000055,61.07394390200005],[8.339489454000045,61.07413080600003],[8.667891755000028,60.936030867000056],[9.276249149000023,60.76110915100003],[9.461511316000042,60.53893676000007],[9.579689102000032,60.53283759700008],[9.798817904000032,60.46360237000005],[9.840048035000052,60.56921271900006],[9.95462623800006,60.628513586000054],[10.029212775000076,60.62448853700005],[10.149232625000025,60.519363792000036],[10.176794027000028,60.46587702800008],[10.200939040000037,60.373942896000074],[10.31787197400007,60.26423727500003],[10.309858099000053,60.24643626400007],[10.375701741000057,60.222938819000035],[10.530354540000076,60.16889377200005],[10.597937246000072,60.12732265400007],[10.583491752000043,60.07846695600006],[10.503251114000022,60.023085613000035],[10.436776962000067,60.02968875500005],[10.385117432000072,59.98059679200003],[10.349660778000043,59.95740209400003],[10.362936200000036,59.90589624300003],[10.329319690000034,59.87295742800006],[10.355260155000053,59.80407289900006],[10.317188196000075,59.76237973800005],[10.313980408000077,59.72331159500004],[10.370032415000026,59.71249632900003],[10.430507182000042,59.676661453000065],[10.429963926000028,59.61245566200006],[10.416111870000066,59.656179113000064],[10.373701464000021,59.67790867200006],[10.38433092200006,59.534213616000045]]]]},
  sources: [
  {
    "label": "Buskerud fylkeskommune",
    "url": "https://bfk.no/"
  },
  {
    "label": "Norsk Gardsost",
    "url": "https://www.gardsost.no/"
  },
  {
    "label": "Hanen — Gardsmat",
    "url": "https://www.hanen.no/"
  }
],
  boundaryAttribution: "Statistical boundary: Eurostat/GISCO Statistical Regions (SR) 2024 · NO085 · EPSG:4326 · 1:10M",
};
