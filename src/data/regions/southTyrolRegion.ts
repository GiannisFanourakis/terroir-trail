import type { TerroirRegion } from '../terroirRegions';

/**
 * South Tyrol (Südtirol / Alto Adige).
 *
 * NUTS boundary source: Eurostat/GISCO NUTS 2024, ITH1, WGS84 (EPSG:4326),
 * 1:10M generalized geometry.
 */
export const SOUTH_TYROL_TERROIR_REGION: TerroirRegion = {
  id: "south_tyrol",
  name: "South Tyrol",
  nativeName: "Südtirol / Alto Adige",
  officialName: "Provincia Autonoma di Bolzano/Bozen",
  destination: "south_tyrol",
  countryCode: "IT",
  geographyType: "NUTS",
  nutsCode: "ITH1",
  nutsLevel: 2,
  classificationVersion: "2024",
  eyebrow: "South Tyrol · Italy",
  summary: "Framed by the dramatic limestone spires of the Dolomites and the Central Eastern Alps, South Tyrol blends alpine pastoral farming with precision valley horticulture: steep terraced apple orchards, mountain dairies producing raw-milk Graukäse, alpine apiaries, and steep hillside vineyards producing crisp white wines and Lagrein.",
  highlights: ["UNESCO World Heritage Dolomites & steep alpine valleys","Steep terraced vineyards producing Pinot Grigio, Gewürztraminer & Lagrein","Raw-milk Graukäse, Alto Adige Speck IGP & orchard cider and apples"],
  sections: [
  {
    "id": "landscape",
    "title": "Alpine valleys, dolomite crags, and sun-drenched Adige terraces",
    "eyebrow": "Landscape",
    "body": "South Tyrol sits on the southern side of the main Alpine divide, protected from northern weather by high mountain chains while benefiting from warm Mediterranean currents flowing up the Adige and Isarco river valleys. Glacial moraine soils, steep porphyry slopes, and dramatic altitude variations from 200 to over 3,000 meters create distinct microclimates in close proximity.",
    "highlights": [
      "Alpine-Mediterranean microclimate intersection",
      "Steep porphyry & limestone terraced slopes",
      "Adige and Isarco glacial river valleys"
    ]
  },
  {
    "id": "history",
    "title": "Tyrolean closed-farm inheritance law and alpine cooperatives",
    "eyebrow": "History",
    "body": "South Tyrol’s rural landscape has been uniquely preserved by the historic Geschlossener Hof (closed farm) legal principle, which prohibited the subdivision of hereditary farmsteads for centuries. This ensured viable family farm units and fostered strong cooperative structures (Genossenschaften) that continue to anchor dairy, apple, and wine production across the province.",
    "highlights": [
      "Centuries-old Geschlossener Hof farm preservation",
      "Historical Tyrolean alpine heritage",
      "Strong grassroots agricultural cooperatives"
    ]
  },
  {
    "id": "culture",
    "title": "Bilingual alpine farming tradition, seasonal Alm pastures, and harvest Törggelen",
    "eyebrow": "Culture",
    "body": "South Tyrolean culture is characterized by its bilingual German and Italian heritage, deep Catholic village traditions, and seasonal pastoral cycles. In summer, dairy cattle graze high mountain pastures (Almen), while autumn brings the Törggelen tradition, where locals and visitors gather in farmhouse parlors (Stuben) to taste young wine, roasted chestnuts, and farmstead cured meats.",
    "highlights": [
      "Seasonal Alm mountain pasture transhumance",
      "Autumn Törggelen farmhouse celebration",
      "Traditional Tyrolean Stube hospitality"
    ]
  },
  {
    "id": "food",
    "title": "Mountain pasture cheeses, Alto Adige speck IGP, and alpine wines",
    "eyebrow": "Food & farming",
    "body": "South Tyrolean cuisine bridges alpine hearty sustenance and Mediterranean lightness: zero-fat raw-milk Ahrntaler Graukäse (Presidio Slow Food), lightly smoked juniper-cured Speck Alto Adige IGP, crisp Val Venosta apples, mountain blossom honey, and renowned minerally white wines alongside indigenous Lagrein and Schiava/Vernatsch.",
    "highlights": [
      "Ahrntaler Graukäse & alpine farmstead cheeses",
      "Alto Adige Speck IGP & Val Venosta apples",
      "Indigenous Lagrein & aromatic mountain whites"
    ]
  },
  {
    "id": "explore",
    "title": "Winding along high alpine valleys, artisan dairies, and terraced family estates",
    "eyebrow": "On TerroirTrail",
    "body": "Navigating South Tyrol with TerroirTrail leads travelers off main valley highways onto steep scenic mountain roads to visit independent family Hof estates, alpine cheese dairies, and high-elevation vineyard cellars with verified entrance locations and clear road-access notes.",
    "highlights": [
      "Verified Hof estate & dairy entrances",
      "Steep slope mountain access verification",
      "Comprehensive alpine farm discovery itineraries"
    ]
  }
],
  center: [46.65, 11.43],
  zoom: 9,
  geometry: {"type":"MultiPolygon","coordinates":[[[[11.828336593000074,46.50891451600006],[11.658163867000042,46.49595736500004],[11.55156510300003,46.35846268900008],[11.47686148400004,46.356217109000056],[11.398065461000044,46.315053223000064],[11.381844682000064,46.26865314300005],[11.31884554000004,46.28045863700004],[11.217704509000043,46.22497459300007],[11.162054050000052,46.281050047000065],[11.216687012000023,46.42924533100006],[11.185045486000035,46.49992163700006],[11.122634683000058,46.489321294000035],[11.072235685000066,46.52025666800006],[11.056210484000076,46.448824141000046],[10.978076032000047,46.47676958800008],[10.839897705000055,46.43906782800008],[10.757618292000075,46.47829494900003],[10.622145398000043,46.44810188900004],[10.452801186000045,46.53068305700003],[10.483347370000047,46.61307689300003],[10.406368917000066,46.64466329700008],[10.39043797000005,46.68105961900005],[10.469651302000045,46.85490900100007],[10.666884011000036,46.87048784800004],[10.761537748000023,46.79849294700006],[11.00831785400004,46.76914264900006],[11.16428131500004,46.965722622000044],[11.329777139000043,46.99026840000005],[11.412602912000068,46.97058111800004],[11.478015835000065,47.002260112000045],[11.627199512000061,47.01329884000006],[11.741946795000047,46.97984842100004],[12.13601377200007,47.08066745900004],[12.240745397000069,47.06916836200003],[12.130957782000053,47.00690736400003],[12.155546913000023,46.917692818000035],[12.276770099000032,46.87262802400005],[12.294783801000051,46.787661393000064],[12.47792408600003,46.67983561400007],[12.38149594600003,46.62871982200005],[12.212323088000062,46.61238864900008],[12.077923922000025,46.66576491700005],[12.005563625000036,46.54472911700003],[11.828336593000074,46.50891451600006]]]]},
  sources: [
  {
    "label": "Autonome Provinz Bozen – Südtirol",
    "url": "https://www.provinz.bz.it/"
  },
  {
    "label": "Südtiroler Bauernbund",
    "url": "https://www.sbb.it/"
  },
  {
    "label": "Consorzio Vini Alto Adige",
    "url": "https://www.vinialtoadige.com/"
  }
],
  boundaryAttribution: "Administrative boundary: Eurostat/GISCO NUTS 2024 · ITH1 · EPSG:4326 · 1:10M",
};
