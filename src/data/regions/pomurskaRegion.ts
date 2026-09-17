import type { TerroirRegion } from '../terroirRegions';

/**
 * Pomurska (Pomurska regija).
 *
 * NUTS boundary source: Eurostat/GISCO NUTS 2024, SI031, WGS84 (EPSG:4326),
 * 1:10M generalized geometry.
 */
export const POMURSKA_TERROIR_REGION: TerroirRegion = {
  id: "pomurska",
  name: "Pomurska",
  nativeName: "Pomurska regija",
  officialName: "Pomurska",
  destination: "pomurska",
  countryCode: "SI",
  geographyType: "NUTS",
  nutsCode: "SI031",
  nutsLevel: 3,
  classificationVersion: "2024",
  eyebrow: "Pomurska · Slovenia",
  summary: "Nestled along the Mura River in northeastern Slovenia, Pomurska is defined by fertile alluvial plains, thermal waters, and the gentle rolling volcanic hills of Goričko: traditional pumpkin seed oil milling (bučno olje), heritage grain and buckwheat farming, artisan cured meats, and mineral-rich white wines.",
  highlights: ["Gentle rolling hills of Goričko Nature Park & Mura river plain","PGI dark roasted pumpkin seed oil (Štajersko prekmursko bučno olje)","Prekmurska gibanica, heritage buckwheat & mineral Šipon wines"],
  sections: [
  {
    "id": "landscape",
    "title": "Alluvial Mura river lowlands and the gentle rolling hills of Goričko",
    "eyebrow": "Landscape",
    "body": "Pomurska occupies Slovenia’s northeastern corner, bordering Austria, Hungary, and Croatia. It is characterized by the broad, fertile alluvial basin of the Mura River—a vital biosphere reserve—rising gently northward into the rounded, wooded sandstone and basalt hills of Goričko Nature Park under a sunny Pannonian climate.",
    "highlights": [
      "Mura River UNESCO Biosphere Reserve",
      "Rolling forested hills of Goričko Nature Park",
      "Sunny continental Pannonian climate"
    ]
  },
  {
    "id": "history",
    "title": "Historic floating water mills on the Mura and ancient Pannonian settlements",
    "eyebrow": "History",
    "body": "Agriculture in Pomurska has been sustained for centuries by the Mura River, where historic floating wooden mills once ground locally grown buckwheat, rye, and wheat. The region’s distinctive cultural position between Slavic and Hungarian traditions fostered a unique agrarian resilience and craft self-sufficiency.",
    "highlights": [
      "Historic floating Mura river grain mills",
      "Ancient Pannonian agricultural trade links",
      "Centuries of smallholder family parcel farming"
    ]
  },
  {
    "id": "culture",
    "title": "Pannonian village architecture, artisan oil pressing, and folk crafts",
    "eyebrow": "Culture",
    "body": "Rural life in Pomurska is expressed through whitewashed L-shaped farmsteads, community gathering at village oil mills (oljarna) during the autumn pumpkin seed pressing, and living folk traditions of pottery and basketry that support local farm food storage.",
    "highlights": [
      "Traditional oljarna community pressing gatherings",
      "Historic Pannonian farmstead architecture",
      "Living village craft and culinary traditions"
    ]
  },
  {
    "id": "food",
    "title": "Pumpkin seed oil, Prekmurska gibanica, Tünka cured pork, and Šipon",
    "eyebrow": "Food & farming",
    "body": "The region’s culinary identity is anchored by dark green, intensely nutty Štajersko prekmursko bučno olje (protected pumpkin seed oil); layered Prekmurska gibanica pastry filled with poppy seeds, walnuts, apples, and curd; lard-cured Tünka pork; and crisp, mineral white wines from Šipon (Furmint) and Renski Rizling.",
    "highlights": [
      "Certified PGI dark roasted pumpkin seed oil",
      "Layered artisanal Prekmurska gibanica pastry",
      "Mineral Šipon (Furmint) & regional fruit wines"
    ]
  },
  {
    "id": "explore",
    "title": "Visiting traditional pumpkin seed oil mills and Goričko hill vineyards",
    "eyebrow": "On TerroirTrail",
    "body": "TerroirTrail guides you along peaceful, unhurried rural roads in northeastern Slovenia to authentic family oil presses, organic grain farms, and hillside cellars, with clear visitability details and road access ratings.",
    "highlights": [
      "Verified artisanal oil mill and winery gates",
      "Peaceful rural cycling and driving routes",
      "Direct family producer contact information"
    ]
  }
],
  center: [46.67, 16.2],
  zoom: 10,
  geometry: {"type":"MultiPolygon","coordinates":[[[[16.113849224000035,46.869068120000065],[16.13460096700004,46.85608098800003],[16.175273884000035,46.85709584500006],[16.297566578000044,46.86637246500004],[16.343455651000056,46.835463350000055],[16.33720003700006,46.80794783700003],[16.31308019100004,46.797578213000065],[16.312161471000024,46.778002428000036],[16.370793261000074,46.722243537000054],[16.368553271000053,46.70422941100003],[16.422299330000044,46.689861533000055],[16.41755102600007,46.66434365600003],[16.393412411000043,46.66180288000004],[16.39037931000007,46.63822225600006],[16.596804964000057,46.47590244000003],[16.344073706000074,46.54110200900004],[16.313045979000037,46.52445395700005],[16.252237540000067,46.50048174500006],[16.242148436000036,46.49007557200008],[16.11780928500002,46.490292544000056],[16.105323213000077,46.50012795600003],[16.066045664000058,46.49977327700003],[16.04143754000006,46.50840956500008],[16.01161180300005,46.51020213500004],[16.014320767000072,46.51290410900003],[16.001997578000044,46.52376392900004],[15.981100998000045,46.54629304400004],[15.967836861000023,46.564417641000034],[15.97391310300003,46.58560145400003],[15.944390640000051,46.588864568000076],[15.92316093200003,46.59610691700004],[15.885683934000042,46.64511986700006],[15.890965015000063,46.66437803100007],[15.841604422000046,46.67259379300003],[15.805973767000069,46.69774895100005],[15.786422178000066,46.70746935000005],[15.861914518000049,46.71960338300005],[15.96000364200006,46.687005842000076],[16.03345232600003,46.65789416000007],[16.038086133000036,46.65614554800004],[16.03950354400007,46.69090183600008],[15.995842942000024,46.73445350000003],[15.989034107000066,46.774937066000064],[15.996236035000038,46.83539866700005],[16.05839037800007,46.83867001300007],[16.113849224000035,46.869068120000065]]]]},
  sources: [
  {
    "label": "Ministrstvo za kmetijstvo, gozdarstvo in prehrano",
    "url": "https://www.gov.si/"
  },
  {
    "label": "Krajinski park Goričko",
    "url": "https://www.park-goricko.org/"
  }
],
  boundaryAttribution: "Administrative boundary: Eurostat/GISCO NUTS 2024 · SI031 · EPSG:4326 · 1:10M",
};
