import type { TerroirRegion } from '../terroirRegions';

/**
 * Alentejo (Alentejo).
 *
 * NUTS boundary source: Eurostat/GISCO NUTS 2024, PT1C, WGS84 (EPSG:4326),
 * 1:10M generalized geometry.
 */
export const ALENTEJO_TERROIR_REGION: TerroirRegion = {
  id: "alentejo",
  name: "Alentejo",
  nativeName: "Alentejo",
  officialName: "Alentejo",
  destination: "alentejo",
  countryCode: "PT",
  geographyType: "NUTS",
  nutsCode: "PT1C",
  nutsLevel: 2,
  classificationVersion: "2024",
  eyebrow: "Alentejo · Portugal",
  summary: "Characterized by rolling plains and the iconic montado ecosystem of cork and holm oaks, Alentejo is Portugal’s agricultural heartland: extensive dry-farmed grain fields, heritage olive groves producing robust oils, free-range Iberian pork, artisan raw sheep-milk cheeses from Nisa and Serpa, and bold regional wines.",
  highlights: ["UNESCO-recognized Montado silvo-pastoral agroforestry landscape","Centuries-old clay amphora (Vinho de Talha) winemaking traditions","Artisan raw sheep-milk cheeses of Serpa & Nisa, olive oil & Iberian pork"],
  sections: [
  {
    "id": "landscape",
    "title": "Gentle rolling plains, cork oak montado landscapes, and coastal plateaus",
    "eyebrow": "Landscape",
    "body": "Covering roughly a third of Portugal south of the Tagus River, the Alentejo landscape is defined by vast undulating golden plains, granite and schist outcrops, and the vast open canopy of the montado—a human-shaped agro-silvo-pastoral forest of cork oaks (sobreiros) and holm oaks (azinheiras) that sustains rich ecological diversity.",
    "highlights": [
      "Undulating montado cork and oak forest",
      "Vast cereal plains and granite outcrops",
      "Guadiana river valley and reservoir ecosystems"
    ]
  },
  {
    "id": "history",
    "title": "Roman agricultural estates, Moorish water-management systems, and heritage montes",
    "eyebrow": "History",
    "body": "The Romans recognized Alentejo as a vital agricultural granary, introducing villa estates and clay-amphora fermentation (vinho de talha) that has continued uninterrupted for over two millennia. Moorish rule contributed sophisticated waterwheels and dry-farming methods, shaping the whitewashed isolated montes (hilltop farmsteads) that dot the horizon.",
    "highlights": [
      "Two millennia of continuous Roman amphora winemaking",
      "Moorish dry-farming and irrigation heritage",
      "Historic whitewashed monte farmsteads"
    ]
  },
  {
    "id": "culture",
    "title": "Montado silvo-pastoral agroforestry and traditional polyphonic singing",
    "eyebrow": "Culture",
    "body": "Alentejo’s agricultural rhythm is patient and community-centered. The cyclical stripping of cork bark every nine years, traditional shepherd grazing rights, and the communal Cante Alentejano (polyphonic male choral singing, recognized by UNESCO) reflect an egalitarian agrarian culture forged through collective field labor.",
    "highlights": [
      "Nine-year cyclical cork harvesting craft",
      "UNESCO-inscribed Cante Alentejano agrarian singing",
      "Deep communal shepherd pastoral tradition"
    ]
  },
  {
    "id": "food",
    "title": "DOP raw sheep cheeses of Serpa and Nisa, olive oil, and clay-amphora wines",
    "eyebrow": "Food & farming",
    "body": "Alentejo’s culinary soul is built on simple, unpretentious agricultural excellence: thistle-curd raw sheep-milk cheeses including creamy Queijo Serpa DOP and firm Queijo de Nisa DOP; herbaceous olive oils from Galega and Cobrançosa olives; acorn-fed Alentejano black pork; and bold wines fermented in unglazed clay talhas.",
    "highlights": [
      "Thistle-curd Queijo Serpa DOP & Queijo de Nisa DOP",
      "Heritage Galega extra virgin olive oil",
      "Authentic DOC Vinho de Talha amphora wines"
    ]
  },
  {
    "id": "explore",
    "title": "Driving scenic rural backroads connecting whitewashed montes and olive presses",
    "eyebrow": "On TerroirTrail",
    "body": "Exploring Alentejo on TerroirTrail takes you along quiet, tree-lined country lanes to family-owned cork farms, traditional talha cellars in small villages, and artisan cheese dairies, all backed by verified road conditions and direct producer contact details.",
    "highlights": [
      "Verified monte farmstead and cellar gates",
      "Independent amphora winemakers & cheese makers",
      "Clear rural road access confidence ratings"
    ]
  }
],
  center: [38.5, -7.9],
  zoom: 8,
  geometry: {"type":"MultiPolygon","coordinates":[[[[-7.492743548999954,39.590039303000026],[-7.308922915999972,39.45928789000004],[-7.312663629999975,39.35370812700006],[-7.231467159999966,39.278431039000054],[-7.237566782999977,39.21418558800008],[-7.148672902999976,39.170142773000066],[-7.131942404999961,39.11031518200008],[-7.05514760799997,39.11703570900005],[-6.987084030999938,39.08743057600003],[-6.960074817999953,39.02635741300003],[-7.05514760799997,38.85906227100003],[-7.203134912999928,38.75101749100003],[-7.260157035999953,38.70599305800005],[-7.255434013999945,38.61541787700003],[-7.307032946999925,38.525952421000056],[-7.308414722999942,38.44776451100006],[-7.107952585999953,38.188121617000036],[-7.05514760799997,38.17948929000005],[-6.931738572999961,38.208378046000064],[-7.006274579999968,38.03451286100005],[-7.05514760799997,38.01776296300005],[-7.106695127999956,38.035458636000044],[-7.250253028999964,37.979401679000034],[-7.292076992999966,37.86136459800008],[-7.416506861999949,37.743557288000034],[-7.50484271299996,37.59480706700003],[-7.512691485999937,37.52625636400006],[-7.742641563999939,37.48819263000007],[-8.081491805999974,37.32960535900003],[-8.218478775999927,37.36500150000006],[-8.293214039999953,37.42690911400007],[-8.37835606599998,37.430588459000035],[-8.47751094299997,37.381135820000054],[-8.70560308399996,37.40225819700004],[-8.796265455999958,37.44287863000005],[-8.795650055999943,37.857556318000036],[-8.812751121999952,37.91820896100006],[-8.873809631999961,37.96628947000005],[-8.781583114999933,38.186499197000046],[-8.794512746999942,38.38970274800005],[-8.697128323999948,38.428315663000035],[-8.735019809999926,38.51569646100006],[-8.639114078999967,38.54949093300007],[-8.643590032999953,38.61304569500004],[-8.508634404999952,38.72114236600004],[-8.513934018999976,38.75420872300003],[-8.546797539999943,38.763436013000046],[-8.318039975999966,38.849974909000025],[-8.162159603999953,38.80296182300003],[-8.177348429999938,38.862005888000056],[-8.250108370999953,38.91258292300006],[-8.227914918999943,38.98738697500005],[-8.332706335999944,39.10901188200006],[-8.172599411999954,39.233313517000056],[-7.955560359999936,39.39792134600003],[-8.001535708999938,39.474461259000066],[-7.958127674999957,39.55267461500006],[-7.857980664999957,39.519024443000035],[-7.825103857999977,39.537365015000034],[-7.691991007999945,39.63723162000008],[-7.542845391999947,39.66278609400007],[-7.492743548999954,39.590039303000026]]]]},
  sources: [
  {
    "label": "Direção Regional de Agricultura e Pescas do Alentejo",
    "url": "https://www.drapalentejo.gov.pt/"
  },
  {
    "label": "Comissão Vitivinícola Regional Alentejana (CVRA)",
    "url": "https://www.vinhosdoalentejo.pt/"
  },
  {
    "label": "Instituto da Conservação da Natureza e das Florestas (ICNF)",
    "url": "https://www.icnf.pt/"
  }
],
  boundaryAttribution: "Administrative boundary: Eurostat/GISCO NUTS 2024 · PT1C · EPSG:4326 · 1:10M",
};
