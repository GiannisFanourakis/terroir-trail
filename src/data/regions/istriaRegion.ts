import type { TerroirRegion } from '../terroirRegions';

/**
 * Istria (Istra).
 *
 * NUTS boundary source: Eurostat/GISCO NUTS 2024, HR036, WGS84 (EPSG:4326),
 * 1:10M generalized geometry.
 */
export const ISTRIA_TERROIR_REGION: TerroirRegion = {
  id: "istria",
  name: "Istria",
  nativeName: "Istra",
  officialName: "Istarska županija",
  destination: "istria",
  countryCode: "HR",
  geographyType: "NUTS",
  nutsCode: "HR036",
  nutsLevel: 3,
  classificationVersion: "2024",
  eyebrow: "Istria · Croatia",
  summary: "The heart-shaped peninsula of Istria blends Mediterranean coastal red terra rossa soils with cooler inland flysch hills: terraced olive groves producing world-renowned extra virgin oils, truffles foraged in the Mirna valley oak forests, artisan cheese makers, and crisp Malvazija Istarska alongside deep Teran wines.",
  highlights: ["Red terra rossa coastal plains & inland flysch hilltop villages","Award-winning extra virgin olive oils (Buža, Istarska Bjelica)","Mirna valley wild truffles, Malvazija Istarska & ruby Teran"],
  sections: [
  {
    "id": "landscape",
    "title": "Red coastal terra rossa, gray inland flysch hills, and Mirna river valley",
    "eyebrow": "Landscape",
    "body": "Istria is geologically defined by its distinct soil zones: “Red Istria” (crvena zemlja) along the coast with iron-rich terra rossa ideal for viticulture and olives; “Gray Istria” in the central flysch hills of marl and sandstone; and “White Istria” on the elevated limestone karst ridge of Mount Učka in the east.",
    "highlights": [
      "Iron-rich coastal terra rossa soils",
      "Inland flysch hills and Mirna river valley",
      "Mount Učka limestone mountain barrier"
    ]
  },
  {
    "id": "history",
    "title": "Roman amphora-oil trade routes, Venetian maritime dominion, and hilltop forts",
    "eyebrow": "History",
    "body": "Istrian olive oil was prized in imperial Rome, as evidenced by extensive oil amphora workshops excavated along the western coast. Centuries of Venetian rule fortified inland hilltop towns like Motovun and Grožnjan, creating a resilient landscape of terraced agriculture and forest management that continues to support truffle and olive cultivation.",
    "highlights": [
      "Roman imperial olive oil production centers",
      "Venetian hilltop fortified settlements",
      "Centuries of forest and river stewardship"
    ]
  },
  {
    "id": "culture",
    "title": "Hilltop stone settlements, truffle hunting traditions, and olive stewardship",
    "eyebrow": "Culture",
    "body": "Istrian rural life centers around the konoba—a traditional stone cellar and tavern where families preserve cured meats, wine, and olive oil. Autumn truffle hunting with trained dogs in the damp oak woods of Motovun Forest is a revered seasonal craft passed down through generations.",
    "highlights": [
      "Traditional stone konoba cellar culture",
      "Motovun oak forest truffle foraging heritage",
      "Multi-generational olive oil pressing mastery"
    ]
  },
  {
    "id": "food",
    "title": "Extra virgin olive oil, Istrian prosciutto, Motovun truffles, and Malvazija",
    "eyebrow": "Food & farming",
    "body": "Istrian agriculture leads global olive oil quality: single-variety oils from indigenous Buža and Istarska Bjelica; wind-dried Istrian pršut cured without smoke; white truffles (Tuber magnatum) and black summer truffles; and wines from indigenous Malvazija Istarska, Teran, and Muškat Momjanski.",
    "highlights": [
      "Single-cultivar Buža & Bjelica olive oils",
      "Air-cured Istrian pršut & raw sheep cheeses",
      "Crisp Malvazija Istarska & high-acid Teran"
    ]
  },
  {
    "id": "explore",
    "title": "Winding along quiet rural ridge roads connecting family frantoios and cellars",
    "eyebrow": "On TerroirTrail",
    "body": "TerroirTrail guides you through Istria’s interior along winding ridge roads to independent family olive oil mills, small-batch wine estates, and artisan goat dairies, complete with exact verified locations and clear road access classifications.",
    "highlights": [
      "Verified family frantoio and winery gates",
      "Clear navigation for narrow hilltop access roads",
      "Independent producer-focused discovery trails"
    ]
  }
],
  center: [45.15, 13.9],
  zoom: 9,
  geometry: {"type":"MultiPolygon","coordinates":[[[[13.585649207000074,45.47853194900006],[13.603013545000067,45.467011101000026],[13.64387879000003,45.458844286000044],[13.670264803000066,45.44551794300003],[13.771449454000049,45.461813394000046],[13.882136266000032,45.43088963900004],[13.975307825000073,45.45692788200006],[14.001949577000062,45.52006266600006],[14.111284542000021,45.48233550600003],[14.197463931000073,45.38253835300003],[14.202386323000042,45.177284701000076],[14.226404026000068,45.15378050400005],[14.157314076000034,45.05545297200007],[14.155326156000058,44.97383124000004],[14.067461047000052,44.96675371100008],[13.976465291000068,44.815635103000034],[13.910928603000059,44.80013955000004],[13.832093390000068,44.841571472000055],[13.779889635000075,44.95807229700006],[13.673152881000021,45.05545297200007],[13.635237075000077,45.070574313000066],[13.58991270200005,45.161782825000046],[13.58222104600003,45.30077376500003],[13.499742982000043,45.484440705000054],[13.58505629800004,45.478721964000044],[13.585649207000074,45.47853194900006]]]]},
  sources: [
  {
    "label": "Istarska županija / Regione Istriana",
    "url": "https://www.istra-istria.hr/"
  },
  {
    "label": "Udruga maslinara Istre",
    "url": "https://www.maslinari-istre.hr/"
  },
  {
    "label": "Vinistra — Association of Winegrowers and Winemakers of Istria",
    "url": "https://www.vinistra.hr/"
  }
],
  boundaryAttribution: "Administrative boundary: Eurostat/GISCO NUTS 2024 · HR036 · EPSG:4326 · 1:10M",
};
