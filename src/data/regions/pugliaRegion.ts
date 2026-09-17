import type { TerroirRegion } from '../terroirRegions';

/**
 * Puglia (Puglia).
 *
 * NUTS boundary source: Eurostat/GISCO NUTS 2024, ITF4, WGS84 (EPSG:4326),
 * 1:10M generalized geometry.
 */
export const PUGLIA_TERROIR_REGION: TerroirRegion = {
  id: "puglia",
  name: "Puglia",
  nativeName: "Puglia",
  officialName: "Puglia",
  destination: "puglia",
  countryCode: "IT",
  geographyType: "NUTS",
  nutsCode: "ITF4",
  nutsLevel: 2,
  classificationVersion: "2024",
  eyebrow: "Puglia · Italy",
  summary: "Stretching along the Adriatic and Ionian seas, Puglia is a sun-drenched agricultural peninsula defined by centuries-old olive groves, vast durum wheat plains of the Tavoliere, limestone karst plateaus of the Murge, and coastal vineyards producing Primitivo, Negroamaro, and Nero di Troia alongside artisan burrata and caciocavallo.",
  highlights: ["Centuries-old monumental olive groves & karst plateaus","Indigenous Primitivo, Negroamaro & Nero di Troia grapes","Artisan Burrata di Andria, Caciocavallo & durum wheat pasta"],
  sections: [
  {
    "id": "landscape",
    "title": "Limestone plateaus, coastal plains, and the Tavoliere granary",
    "eyebrow": "Landscape",
    "body": "Puglia forms the elongated heel of Italy, dominated by red Mediterranean soils over porous limestone. In the north, the Tavoliere plain represents one of Italy’s historic granaries for durum wheat. The central plateau of the Murge rises into stony karst pastures and trulli countryside, while the Salento peninsula in the south narrows between the Adriatic and Ionian seas under constant Mediterranean maritime winds.",
    "highlights": [
      "Tavoliere cereal plain",
      "Murge limestone karst",
      "Salento maritime peninsula"
    ]
  },
  {
    "id": "history",
    "title": "Messapian foundations, Roman Appian Way, and Norman-Swabian castles",
    "eyebrow": "History",
    "body": "Puglia has served as Rome’s bridge to the East and a Mediterranean crossroads for millennia. The Via Appia terminated in Brindisi, transporting grain and olive oil across the empire. Norman and Swabian rulers, particularly Emperor Frederick II, shaped the landscape with fortified farmsteads (masserie) and castles such as Castel del Monte, creating an enduring network of agricultural estates that still anchor the countryside.",
    "highlights": [
      "Terminus of the Roman Appian Way",
      "Frederick II Swabian castles",
      "Historic fortified masserie farmsteads"
    ]
  },
  {
    "id": "culture",
    "title": "Agrarian masserie, stone trulli, and transhumance heritage",
    "eyebrow": "Culture",
    "body": "Pugliese rural life is rooted in the architecture of stewardship: masserie (white-stone fortified estates) that combined living quarters, oil presses, and livestock pens, and dry-stone trulli huts built by peasant farmers. Folk harvest celebrations, olive harvest gatherings, and seasonal transhumance routes along ancient tratturi paths maintain an unbroken connection to the land.",
    "highlights": [
      "Fortified masseria agrarian life",
      "UNESCO dry-stone trulli architecture",
      "Historic pastoral tratturi routes"
    ]
  },
  {
    "id": "food",
    "title": "Centuries-old olive oil, durum wheat pasta, and artisan dairy",
    "eyebrow": "Food & farming",
    "body": "Puglia is Italy’s largest olive oil producing region, celebrated for cultivars such as Coratina, Ogliarola, and Cellina di Nardò. Hand-shaped orecchiette pasta from local durum wheat, creamy Burrata di Andria IGP, stretched-curd Caciocavallo Silano DOP, and robust red wines from Primitivo di Manduria and Salice Salentino form a deeply grounded culinary heritage.",
    "highlights": [
      "Coratina & Ogliarola extra virgin olive oils",
      "Burrata di Andria IGP & Caciocavallo",
      "Handmade orecchiette & Primitivo di Manduria"
    ]
  },
  {
    "id": "explore",
    "title": "Navigating rural masserie, artisan cheese dairies, and olive estates",
    "eyebrow": "On TerroirTrail",
    "body": "Exploring Puglia on TerroirTrail means traveling narrow lanes bordered by dry-stone walls to visit working family olive mills, artisan cheese casari crafting fresh burrata daily, and independent vineyards committed to indigenous varieties and verified road access.",
    "highlights": [
      "Verified farmstead masserie entrances",
      "Independent olive mills & cheese artisans",
      "Accurate rural road accessibility classifications"
    ]
  }
],
  center: [41, 16.7],
  zoom: 8,
  geometry: {"type":"MultiPolygon","coordinates":[[[[16.012101406000056,41.94573365600007],[16.155111714000043,41.893969060000074],[16.16404159600006,41.828940043000046],[16.17173955900006,41.77288208400006],[15.900810018000072,41.59106150100007],[15.932034215000044,41.48893309400006],[16.024738592000062,41.42559044500007],[16.54230254600003,41.22944085900008],[16.872980347000066,41.129719532000024],[17.08055610300005,41.06712165000005],[17.388981155000067,40.89186350600005],[17.513565666000034,40.816593598000054],[17.94057078900005,40.67627523900006],[18.022507076000068,40.628259264000064],[18.097446024000078,40.51530453400005],[18.240704879000077,40.44144328700003],[18.43388879400004,40.27146152800003],[18.45996169700004,40.23115955700007],[18.464827375000027,40.19576012600004],[18.511395852000078,40.13686051800005],[18.51577422200006,40.109183778000045],[18.484984460000078,40.07724124900005],[18.472454922000054,40.04520329600007],[18.43388879400004,40.01494467600003],[18.371993091000036,39.80882903200006],[18.182185634000064,39.84837126100007],[18.012489946000073,39.97509208300005],[18.003404147000026,40.10582595300008],[17.901747139000065,40.252482272000066],[17.76349642100007,40.295497399000055],[17.523354828000038,40.297121738000044],[17.394230391000065,40.336076200000036],[17.241426955000065,40.40125025100008],[17.22695596500006,40.47156607200003],[17.099696436000045,40.51639753100005],[16.97523109100007,40.48205933400004],[16.867263855000033,40.39784533900007],[16.74002889600007,40.480009610000025],[16.71274550100003,40.55213804700003],[16.724989805000064,40.71381441400007],[16.585780828000054,40.759479534000036],[16.49479778500006,40.75245352300004],[16.419939940000063,40.70980756000006],[16.244098251000025,40.83800862800007],[16.20253183500006,40.917511174000026],[16.116801329000054,40.90670818900003],[16.010862702000054,40.94891230400003],[16.02731765900006,41.034035319000054],[15.885409818000028,41.129719532000024],[15.870311162000064,41.13990010400005],[15.850532197000064,41.129719532000024],[15.783631619000062,41.09528465900007],[15.585092478000035,41.09278251200004],[15.542921076000027,41.05582347700005],[15.274319477000063,41.10724928500008],[15.249605135000024,41.129719532000024],[15.222412896000037,41.154442679000056],[15.26565335600003,41.251995358000045],[15.149196332000031,41.280412511000065],[15.068186957000023,41.35006015600004],[15.086706456000059,41.42539807400004],[15.007655460000024,41.486357131000034],[14.951080736000051,41.536505032000036],[14.947607607000066,41.59106150100007],[15.12338978300005,41.710454851000065],[15.111639289000038,41.828940043000046],[15.138178679000077,41.92700760300005],[15.444937026000048,41.904868727000064],[16.012101406000056,41.94573365600007]]]]},
  sources: [
  {
    "label": "Regione Puglia — Assessorato Agricoltura",
    "url": "https://www.regione.puglia.it/"
  },
  {
    "label": "Consorzio per la Tutela dell'Olio Extravergine di Oliva DOP Terra di Bari",
    "url": "https://www.oliodopterradibari.it/"
  },
  {
    "label": "Consorzio Tutela Vini DOP Salice Salentino",
    "url": "https://www.salicesalentino.wine/"
  }
],
  boundaryAttribution: "Administrative boundary: Eurostat/GISCO NUTS 2024 · ITF4 · EPSG:4326 · 1:10M",
};
