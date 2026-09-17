import type { TerroirRegion } from '../terroirRegions';

/**
 * Goriška (Goriška regija).
 *
 * NUTS boundary source: Eurostat/GISCO NUTS 2024, SI043, WGS84 (EPSG:4326),
 * 1:10M generalized geometry.
 */
export const GORISKA_TERROIR_REGION: TerroirRegion = {
  id: "goriska",
  name: "Goriška",
  nativeName: "Goriška regija",
  officialName: "Goriška",
  destination: "goriska",
  countryCode: "SI",
  geographyType: "NUTS",
  nutsCode: "SI043",
  nutsLevel: 3,
  classificationVersion: "2024",
  eyebrow: "Goriška · Slovenia",
  summary: "Stretching from the turquoise waters of the Soča River down to the gentle sunlit hills of Goriška Brda and the Vipava Valley, Goriška bridges the Alps and the Mediterranean: terraced vineyards producing Rebula and Zelen, historic olive groves, cherry orchards, and artisan mountain cheeses like Tolminc.",
  highlights: ["Goriška Brda terraced hills & the dramatic Emerald Soča valley","Indigenous Rebula, Zelen & Pinela mineral white wines","Artisan raw-milk Tolminc DOP alpine cheese & sweet Brda cherries"],
  sections: [
  {
    "id": "landscape",
    "title": "Alpine limestone gorges transitioning into terraced Mediterranean hills",
    "eyebrow": "Landscape",
    "body": "Goriška represents one of Europe’s most dramatic geographic transitions: the high Julian Alps and deep emerald canyons of the Soča River in the north yield to the warm, terraced flysch and marl (opoka) hills of Goriška Brda and the wind-swept, sun-drenched plains of the Vipava Valley in the south.",
    "highlights": [
      "Emerald Soča alpine river canyon",
      "Opoka marl terraced hills of Goriška Brda",
      "Vipava valley wind-swept Mediterranean corridor"
    ]
  },
  {
    "id": "history",
    "title": "Centuries of border viticulture and alpine grazing cooperatives",
    "eyebrow": "History",
    "body": "Goriška’s position on the border between Germanic, Romance, and Slavic cultures shaped an exceptional agrarian resilience. Mountain communities in the upper Soča valley formed dairy cooperatives as early as the 13th century, while the southern hills supplied premium fruit, olive oil, and wine to the courts of Vienna and Venice.",
    "highlights": [
      "Medieval 13th-century alpine dairy cooperatives",
      "Austro-Hungarian imperial wine and fruit trade",
      "Historic dry-stone terracing on steep slopes"
    ]
  },
  {
    "id": "culture",
    "title": "Stone village architecture, terraced viticulture, and summer mountain pastures",
    "eyebrow": "Culture",
    "body": "Rural life is shaped by the Mediterranean stone architecture of fortified villages like Šmartno and Vipavski Križ. In the Julian Alps, herdsmen continue the seasonal move to high mountain pastures (planine) to craft cheese over open wood fires in traditional alpine huts.",
    "highlights": [
      "Fortified medieval stone village architecture",
      "Living alpine planina cheesemaking heritage",
      "Centuries of multi-generational hillside viticulture"
    ]
  },
  {
    "id": "food",
    "title": "Tolminc DOP cheese, Brda extra virgin olive oil, and indigenous wines",
    "eyebrow": "Food & farming",
    "body": "Goriška produces some of Slovenia’s most celebrated culinary treasures: raw cow-milk Tolminc DOP cheese aged for months in mountain cellars; fresh olive oils from northernmost olive groves; sweet cherries and apricots; and distinctively structured wines from indigenous Rebula, Zelen, and Pinela grapes.",
    "highlights": [
      "Raw cow-milk Tolminc DOP alpine cheese",
      "Indigenous Zelen, Pinela & Rebula mineral wines",
      "Northernmost Mediterranean extra virgin olive oils"
    ]
  },
  {
    "id": "explore",
    "title": "Exploring scenic ridge roads in Brda, Vipava stone cellars, and alpine dairies",
    "eyebrow": "On TerroirTrail",
    "body": "TerroirTrail guides you along panoramic ridge roads connecting independent family wineries in Brda, stone vaulted cellars in Vipava, and remote mountain cheesemakers in the upper Soča valley with verified locations and road accessibility confidence.",
    "highlights": [
      "Verified family cellar and dairy entrance coordinates",
      "Scenic mountain pass and ridge road suitability ratings",
      "Independent growers committed to authentic terroir"
    ]
  }
],
  center: [46.1, 13.76],
  zoom: 9,
  geometry: {"type":"MultiPolygon","coordinates":[[[[13.735041706000061,46.28161243000005],[13.850688800000057,46.23174640600007],[13.993444109000052,46.236926416000074],[13.98822096300006,46.192954910000026],[14.073447447000035,46.15650754300003],[14.03051995100003,46.07183065500004],[14.054648516000043,46.06169898200005],[14.140111735000062,46.004658412000026],[14.105473028000063,45.93102875900007],[14.123501101000045,45.878637738000066],[14.12957754100006,45.86949911900007],[14.049503282000046,45.83733752900008],[14.04237127500005,45.76135900300005],[13.995897859000024,45.76611408500003],[13.907899980000025,45.81142143200003],[13.892101186000048,45.828821627000025],[13.84035917500006,45.83532141900008],[13.715857207000056,45.86351388600008],[13.673171942000067,45.82038342800007],[13.597137159000056,45.819470729000045],[13.582943618000058,45.86137090200003],[13.611410263000039,45.90376807400003],[13.637172391000036,45.938025613000036],[13.620869162000076,45.98459602600008],[13.514704359000064,45.979582795000056],[13.48846713000006,46.004036460000066],[13.496939053000062,46.05133502700005],[13.530244727000024,46.067383550000045],[13.664051766000057,46.170440609000025],[13.633614378000061,46.19179083000006],[13.42399643400006,46.219485063000036],[13.402879967000047,46.300137007000046],[13.451950103000058,46.35630496400006],[13.598527423000064,46.43207829100004],[13.684031874000027,46.43747236200005],[13.770552786000053,46.425513041000045],[13.83644156500003,46.37835233900006],[13.724821660000032,46.29679506100007],[13.735041706000061,46.28161243000005]]]]},
  sources: [
  {
    "label": "Združenje vinogradnikov in vinarjev Brda",
    "url": "https://www.brda.si/"
  },
  {
    "label": "Posoški razvojni center — Tolminc DOP Cheese",
    "url": "https://www.prc.si/"
  },
  {
    "label": "Vipavska dolina — Regional Tourism & Agriculture",
    "url": "https://www.vipavskadolina.si/"
  }
],
  boundaryAttribution: "Administrative boundary: Eurostat/GISCO NUTS 2024 · SI043 · EPSG:4326 · 1:10M",
};
