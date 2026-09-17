import type { TerroirRegion } from '../terroirRegions';

/**
 * Central Slovenia (Osrednjeslovenska regija).
 *
 * NUTS boundary source: Eurostat/GISCO NUTS 2024, SI041, WGS84 (EPSG:4326),
 * 1:10M generalized geometry.
 */
export const CENTRAL_SLOVENIA_TERROIR_REGION: TerroirRegion = {
  id: "central_slovenia",
  name: "Central Slovenia",
  nativeName: "Osrednjeslovenska regija",
  officialName: "Osrednjeslovenska",
  destination: "central_slovenia",
  countryCode: "SI",
  geographyType: "NUTS",
  nutsCode: "SI041",
  nutsLevel: 3,
  classificationVersion: "2024",
  eyebrow: "Central Slovenia · Slovenia",
  summary: "Encompassing the fertile Ljubljana Marshes (Ljubljansko barje) and the surrounding pre-alpine hills, Central Slovenia blends historic agrarian wetlands with alpine dairy pastures and orchard slopes: heritage vegetable farming, artisan cheese making, honey production, and traditional craft distilling.",
  highlights: ["UNESCO-listed Ljubljansko barje wetlands & pre-alpine hills","Indigenous Carniolan honeybee (Kranjska čebela) beekeeping","Artisan farmstead cheeses, orchard brandies & fresh market crops"],
  sections: [
  {
    "id": "landscape",
    "title": "The wetland plain of the Ljubljana Marshes and pre-alpine hills",
    "eyebrow": "Landscape",
    "body": "Central Slovenia is centered around a unique geological basin: the flat, peat-rich basin of the Ljubljana Marshes (Ljubljansko barje), surrounded by forested pre-alpine hills and limestone karst plateaus. Rich soils and abundant natural springs sustain both intensive horticulture and upland pastoral farming.",
    "highlights": [
      "Ljubljana Marshes Nature Park landscape",
      "Surrounding wooded pre-alpine mountain slopes",
      "Abundant freshwater springs and pristine streams"
    ]
  },
  {
    "id": "history",
    "title": "Prehistoric pile dwellings and historic river trade routes",
    "eyebrow": "History",
    "body": "Human agriculture here dates back over 5,000 years to Neolithic pile-dwelling settlements on the marshes, where the world’s oldest wooden wheel with an axle was discovered. In the 18th and 19th centuries, organized drainage projects converted wetland margins into productive arable meadows and pastures.",
    "highlights": [
      "5,000-year-old pile-dwelling agricultural heritage",
      "Historical 19th-century marsh drainage farming",
      "Heritage river trade paths along the Ljubljanica"
    ]
  },
  {
    "id": "culture",
    "title": "Carniolan honeybee stewardship and local farmers’ market traditions",
    "eyebrow": "Culture",
    "body": "Central Slovenia is the historical heartland of the Carniolan honeybee (Apis mellifera carnica), celebrated for its docility and resilience. Painted beehive panels (panjske končnice) and traditional apiaries represent a cherished folk art, while daily open-air farmers’ markets maintain direct ties between growers and urban eaters.",
    "highlights": [
      "Carniolan honeybee breeding and apiary culture",
      "Painted beehive panel (panjske končnice) folk art",
      "Century-old daily open-air farm market traditions"
    ]
  },
  {
    "id": "food",
    "title": "Ljubljana Marshes produce, Carniolan sausage, and artisan farm cheeses",
    "eyebrow": "Food & farming",
    "body": "The regional gastronomic basket includes Kranjska klobasa (protected Carniolan pork sausage flavored with garlic and pepper), raw-milk farmhouse cheeses from upland dairy pastures, fresh seasonal vegetables, forest and meadow honeys, and distilled apple and pear brandies (žganje).",
    "highlights": [
      "Protected Kranjska klobasa pork sausage",
      "Fresh raw-milk farmstead cheeses & butters",
      "Pure meadow honey & traditional orchard spirits"
    ]
  },
  {
    "id": "explore",
    "title": "Visiting small organic vegetable farms, wetland apiaries, and foothill dairies",
    "eyebrow": "On TerroirTrail",
    "body": "TerroirTrail connects travelers directly to small-scale growers and artisans surrounding the capital: from certified organic vegetable growers on the edge of the marshes to family-run beekeepers and hillside dairies with clear road access details.",
    "highlights": [
      "Verified farm gate and farmstead shop locations",
      "Short scenic excursions just outside the urban core",
      "Clear road access notes for rural country lanes"
    ]
  }
],
  center: [46.05, 14.52],
  zoom: 9,
  geometry: {"type":"MultiPolygon","coordinates":[[[[14.898418871000047,46.20551726200006],[14.826703257000077,46.15885896800006],[14.835089917000062,46.13505895900005],[14.75173421200003,46.09784482100008],[14.71175757900005,46.07792984500003],[14.746009892000075,46.06803590000004],[14.893028041000036,46.05695087600003],[14.94861387900005,45.97849790500004],[14.924865744000044,45.96315193200007],[14.885718231000055,45.93379608400005],[14.876092905000064,45.87012299300005],[14.850296338000078,45.809794758000066],[14.804826275000039,45.798399490000065],[14.82647501300005,45.756215885000074],[14.819218146000026,45.72950411800008],[14.688183998000056,45.819038145000036],[14.585379713000066,45.79393988500004],[14.564807269000028,45.79146217200008],[14.505655063000063,45.84226788900003],[14.490759506000074,45.88226923000008],[14.418963720000022,45.87156511000006],[14.37250728400005,45.87753376000006],[14.300492244000054,45.88694564800005],[14.278621005000048,45.846998118000045],[14.12957754100006,45.86949911900007],[14.123501101000045,45.878637738000066],[14.105473028000063,45.93102875900007],[14.140111735000062,46.004658412000026],[14.186019785000042,46.03700153900007],[14.189962366000032,46.03774037000005],[14.225433613000064,46.09656058600007],[14.326428426000064,46.09631261000004],[14.395369163000055,46.157812480000075],[14.405380942000022,46.19003100600003],[14.458350578000022,46.19170854500004],[14.46471144700007,46.204714539000065],[14.500559274000068,46.200471916000026],[14.554006874000038,46.24248410800004],[14.542763974000025,46.309339849000025],[14.535457662000056,46.35739663500004],[14.565211816000044,46.36769714800005],[14.637874382000064,46.36422836000003],[14.704636060000041,46.284834501000034],[14.724140487000057,46.25876941000007],[14.854123526000024,46.25038563900006],[14.885220176000075,46.237491918000046],[14.908703357000036,46.207611892000045],[14.898418871000047,46.20551726200006]]]]},
  sources: [
  {
    "label": "Javni zavod Krajinski park Ljubljansko barje",
    "url": "https://www.ljubljanskobarje.si/"
  },
  {
    "label": "Čebelarska zveza Slovenije",
    "url": "https://www.czs.si/"
  }
],
  boundaryAttribution: "Administrative boundary: Eurostat/GISCO NUTS 2024 · SI041 · EPSG:4326 · 1:10M",
};
