import type { TerroirRegion } from '../terroirRegions';

/**
 * Catalonia (Catalunya / Cataluña).
 *
 * NUTS boundary source: Eurostat/GISCO NUTS 2024, ES51, WGS84 (EPSG:4326),
 * 1:10M generalized geometry.
 */
export const CATALONIA_TERROIR_REGION: TerroirRegion = {
  id: "catalonia",
  name: "Catalonia",
  nativeName: "Catalunya / Cataluña",
  officialName: "Cataluña",
  destination: "catalonia",
  countryCode: "ES",
  geographyType: "NUTS",
  nutsCode: "ES51",
  nutsLevel: 2,
  classificationVersion: "2024",
  eyebrow: "Catalonia · Spain",
  summary: "Spanning from the Pyrenean peaks to the Ebro Delta, Catalonia’s diverse microclimates support an ancient agrarian tradition: Mediterranean olive oil from Siurana, terraced slate vineyards in Priorat, mountain artisan cheeses in the Pyrenees, and fruit orchards along the coastal plains.",
  highlights: ["Priorat slate llicorella terraces & Pyrenean mountain pastures","Arbequina extra virgin olive oil from Siurana & Les Garrigues","Artisan Garrotxa goat cheese & mineral-rich Garnatxa and Carinyena wines"],
  sections: [
  {
    "id": "landscape",
    "title": "Pyrenean mountain passes, Priorat slate hills, and Mediterranean coast",
    "eyebrow": "Landscape",
    "body": "Catalonia exhibits remarkable geographic diversity in a compact territory: the high granite and limestone Pyrenees rising to over 3,000 meters, descending through the central agricultural depressions of Lleida, into the rugged slate (llicorella) ridges of Priorat and Montsant, before reaching the coastal Mediterranean plains of Penedès and Empordà.",
    "highlights": [
      "High Pyrenean alpine pastures",
      "Priorat black slate llicorella terraces",
      "Penedès Mediterranean limestone valleys"
    ]
  },
  {
    "id": "history",
    "title": "Medieval monastic agrarian stewardship and the cooperative cellar movement",
    "eyebrow": "History",
    "body": "Carthusian monks founded the Scala Dei monastery in the 12th century, cultivating Priorat’s steep hillsides. In the early 20th century, following the phylloxera crisis, Catalan farmers formed pioneering agricultural cooperatives, commissioning celebrated modernist architect Cèsar Martinell to build magnificent “cathedrals of wine” (catedrals del vi) that combined functional efficiency with architectural beauty.",
    "highlights": [
      "12th-century Scala Dei Carthusian monastic viticulture",
      "Agrarian modernism: Catedrals del Vi cooperatives",
      "Centuries-old masia estate land tenure"
    ]
  },
  {
    "id": "culture",
    "title": "The traditional Catalan masia, agrarian modernism, and cooperative winemaking",
    "eyebrow": "Culture",
    "body": "The social and economic foundation of rural Catalonia is the masia—an autonomous stone farmstead designed for mixed agriculture. Rural culture celebrates seasonal produce through communal gatherings: winter calçotades, autumn chestnut festivals (castanyada), and active peasant guilds preserving indigenous crop varieties.",
    "highlights": [
      "Traditional masia farmstead architecture",
      "Winter calçotada harvest gatherings",
      "Strong cooperative farming networks"
    ]
  },
  {
    "id": "food",
    "title": "Siurana DOP extra virgin olive oil, Garrotxa cheese, and Priorat wines",
    "eyebrow": "Food & farming",
    "body": "Catalan agriculture is renowned for exceptional purity of flavor: cold-pressed Arbequina extra virgin olive oil from DOP Siurana and Les Garrigues; velvet-skinned Garrotxa ash-coated goat cheese; hazelnut and almond orchards; and deep, mineral-driven red wines from Garnatxa and Carinyena in DOQ Priorat alongside traditional-method sparkling wines in Penedès.",
    "highlights": [
      "DOP Siurana Arbequina extra virgin olive oil",
      "Artisan Garrotxa goat cheese & Pyrenean cow cheeses",
      "DOQ Priorat llicorella terroir wines"
    ]
  },
  {
    "id": "explore",
    "title": "Exploring historic stone masies, artisan cheese makers, and mountain vineyards",
    "eyebrow": "On TerroirTrail",
    "body": "TerroirTrail connects travelers to genuine Catalan producers, guiding you along rural stone-walled roads to family-run olive mills, high-mountain Pyrenean cheese dairies, and secluded terraced vineyards with verified access and honest road status.",
    "highlights": [
      "Verified masia cellar & cheese dairy locations",
      "Steep terraced road suitability assessments",
      "Comprehensive Catalan artisan food itineraries"
    ]
  }
],
  center: [41.7, 1.8],
  zoom: 8,
  geometry: {"type":"MultiPolygon","coordinates":[[[[1.464022998000075,42.440003931000035],[1.53816379400007,42.43666140900007],[1.725801230000059,42.50440199700006],[1.731010891000039,42.49240083700005],[1.83563341100006,42.46759678300003],[1.853261265000071,42.46341754700006],[1.893683155000076,42.45383426800004],[2.027519672000039,42.369001258000026],[2.262851338000075,42.42552270500005],[2.55434069000006,42.34208674400003],[2.63318887600002,42.349216123000076],[2.722768700000074,42.41387520300003],[2.925389756000072,42.465253424000025],[3.174022446000038,42.43523914200006],[3.173376363000045,42.43358578300007],[3.164404636000029,42.37068633200005],[3.241091101000052,42.34017576800005],[3.296525748000022,42.318120477000036],[3.271002113000065,42.257699708000075],[3.154200404000051,42.25404539900006],[3.115563087000055,42.20090490700005],[3.124793676000024,42.13894845100003],[3.202955023000072,42.06395707100006],[3.224110762000066,41.96026842800006],[3.206230816000073,41.905696438000064],[3.135174690000042,41.852588565000076],[3.103533951000031,41.828940043000046],[3.047735411000076,41.787235802000055],[2.894058967000035,41.70821883900004],[2.778512932000069,41.64880767200003],[2.625185584000064,41.59106150100007],[2.55434069000006,41.56437988600004],[2.536695542000075,41.55773436700008],[2.336534315000051,41.48234961300005],[2.252396710000028,41.44257125100006],[2.106022800000062,41.29043024500004],[1.896140172000059,41.24723793600003],[1.853261265000071,41.23841377100007],[1.83563341100006,41.23478608800008],[1.645323423000036,41.19562168500005],[1.381176961000051,41.129719532000024],[0.968533231000038,41.02676865400008],[0.711721776000047,40.801914200000056],[0.869293153000058,40.72235827800006],[0.868424552000022,40.69889227900006],[0.749839620000046,40.637304706000066],[0.602247050000074,40.61705781200004],[0.515238434000025,40.522918609000044],[0.28971854200006,40.633839540000054],[0.276469545000054,40.68848959200005],[0.170485307000035,40.73293597800006],[0.26903143800007,40.82268085100003],[0.247474667000063,40.887112700000046],[0.284323391000044,40.97362961600004],[0.220754469000042,41.07133057000004],[0.228906626000025,41.129719532000024],[0.297930415000053,41.16780993800006],[0.385557770000048,41.278612432000045],[0.33594836900005,41.40743234900003],[0.354608344000042,41.48072166000003],[0.439925097000071,41.55147710800003],[0.422379974000023,41.59479524100004],[0.358236661000035,41.606611626000074],[0.334103286000072,41.67882569500006],[0.565147354000032,41.852588565000076],[0.582439231000023,41.86559338300003],[0.575230550000072,41.941111026000044],[0.684111575000031,42.08128355200006],[0.73647326400004,42.27743622700007],[0.71883299700005,42.39233360600008],[0.705592113000023,42.47857622300006],[0.752702338000063,42.59586713200008],[0.660127054000043,42.69095264900005],[0.662615567000046,42.712972007000076],[0.677338870000028,42.84324966400004],[0.858215053000038,42.82574115800003],[1.068172959000037,42.77850611300005],[1.174779499000067,42.71681356000005],[1.347723170000052,42.712972007000076],[1.361354401000028,42.69726235700006],[1.442566157000044,42.60366785300005],[1.44058155700003,42.47150645700003],[1.464022998000075,42.440003931000035]]],[[[0.692161777000024,40.58840799500007],[0.651546978000056,40.549550390000036],[0.607266321000054,40.569618707000075],[0.656775839000034,40.598234955000066],[0.692161777000024,40.58840799500007]]],[[[2.00534536300006,42.45128888000005],[1.980651602000023,42.43652373500004],[1.938912110000047,42.45503416500003],[1.978718320000041,42.497368151000046],[2.00534536300006,42.45128888000005]]]]},
  sources: [
  {
    "label": "Generalitat de Catalunya — Departament d’Acció Climàtica, Alimentació i Agenda Rural",
    "url": "https://agricultura.gencat.cat/"
  },
  {
    "label": "Consell Regulador de la DOP Siurana",
    "url": "https://www.olisiurana.com/"
  },
  {
    "label": "DOQ Priorat",
    "url": "https://www.doqpriorat.org/"
  }
],
  boundaryAttribution: "Administrative boundary: Eurostat/GISCO NUTS 2024 · ES51 · EPSG:4326 · 1:10M",
};
