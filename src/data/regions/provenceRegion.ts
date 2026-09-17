import type { TerroirRegion } from '../terroirRegions';

/**
 * Provence-Alpes-Côte d'Azur (Provence-Alpes-Côte d'Azur).
 *
 * NUTS boundary source: Eurostat/GISCO NUTS 2024, FRL0, WGS84 (EPSG:4326),
 * 1:10M generalized geometry.
 */
export const PROVENCE_TERROIR_REGION: TerroirRegion = {
  id: "provence",
  name: "Provence-Alpes-Côte d'Azur",
  nativeName: "Provence-Alpes-Côte d'Azur",
  officialName: "Provence-Alpes-Côte d'Azur",
  destination: "provence",
  countryCode: "FR",
  geographyType: "NUTS",
  nutsCode: "FRL0",
  nutsLevel: 2,
  classificationVersion: "2024",
  eyebrow: "Provence-Alpes-Côte d'Azur · France",
  summary: "From the Mediterranean littoral to the southern limestone pre-Alps, Provence-Alpes-Côte d’Azur encompasses rolling lavender fields on the Valensole plateau, olive groves of the Alpilles, aromatic herb farms, and coastal vineyards of Bandol and the Côtes de Provence alongside mountain goat dairies.",
  highlights: ["Garrigue landscapes, Alpilles olive groves & pre-Alpine foothills","Ancient olive mills, aromatic lavender & mountain honey","Structured Bandol Mourvèdre, Côtes de Provence & Banon AOC cheese"],
  sections: [
  {
    "id": "landscape",
    "title": "Limestone garrigue, coastal massifs, and river valleys",
    "eyebrow": "Landscape",
    "body": "Provence-Alpes-Côte d’Azur spans from the azure Mediterranean coast up to the snow-capped southern alpine peaks. Characterized by dry limestone massifs like the Sainte-Victoire and Alpilles, fertile river valleys of the Rhône and Durance, and high plateaus like Valensole, the region enjoys over 300 days of sunshine per year tempered by the brisk, cleansing Mistral wind.",
    "highlights": [
      "Limestone Alpilles & Montagne Sainte-Victoire",
      "High lavender plateaus of Valensole",
      "Mistral wind moderating Mediterranean vineyards"
    ]
  },
  {
    "id": "history",
    "title": "Phoenician vine introductions, Roman agricultural villas, and monastic terracing",
    "eyebrow": "History",
    "body": "Provence is France’s oldest wine and olive region, with vines introduced by Phocaean Greeks around Marseille in 600 BC. Roman colonization turned the province into a breadbasket, constructing aqueducts and oil mills. In the Middle Ages, Cistercian monasteries terraced the stony hillsides, establishing boundaries and water-management systems that still define rural estates.",
    "highlights": [
      "Phocaean Greek agricultural founding at Massalia",
      "Roman agricultural infrastructure & villa estates",
      "Medieval Cistercian hillside terracing"
    ]
  },
  {
    "id": "culture",
    "title": "Agrarian bastides, seasonal transhumance, and rural market culture",
    "eyebrow": "Culture",
    "body": "Provençal identity is inseparable from its rural rhythm: stone bastides nestled amidst cypress trees, weekly village farmers’ markets where producers sell directly to neighbors, and the seasonal transhumance of sheep from the lowlands to high alpine pastures in early summer.",
    "highlights": [
      "Historic stone bastide farm architecture",
      "Vibrant village farmers’ market traditions",
      "Ancient summer sheep transhumance routes"
    ]
  },
  {
    "id": "food",
    "title": "AOP Vallée des Baux olive oil, Banon goat cheese, and structured wines",
    "eyebrow": "Food & farming",
    "body": "Agricultural production here is distinctively aromatic: extra virgin olive oils from Grossane and Salonenque olives; Banon AOP raw goat cheese wrapped in chestnut leaves and tied with raffia; lavender and garrigue blossom honey; and diverse wines ranging from powerful, age-worthy Bandol Mourvèdre to delicate dry rosés and crisp Cassis whites.",
    "highlights": [
      "Vallée des Baux de Provence AOP olive oil",
      "Banon AOP goat cheese wrapped in chestnut leaves",
      "Bandol AOC Mourvèdre & Provence honey"
    ]
  },
  {
    "id": "explore",
    "title": "Discovering artisan olive mills, mountain honey farms, and certified organic estates",
    "eyebrow": "On TerroirTrail",
    "body": "TerroirTrail guides travelers past tourist hubs to certified independent farms, small-batch olive mills, and family wine domaines tucked into the foothills of the Luberon and Alpilles, with verified entrance coordinates and road accessibility details.",
    "highlights": [
      "Verified family domaine & mill access points",
      "Independent organic olive & herb growers",
      "Precise rural road suitability classifications"
    ]
  }
],
  center: [44.05, 5.97],
  zoom: 8,
  geometry: {"type":"MultiPolygon","coordinates":[[[[6.260570013000063,45.126843930000064],[6.459320759000036,45.06002666200004],[6.509434365000061,45.10436291500008],[6.63005092800006,45.10985657900005],[6.677650754000069,45.028354568000054],[6.74836024800004,44.99731876300007],[6.764548428000069,44.90251045400004],[6.869881691000046,44.85169862500004],[7.000276006000036,44.83929358800003],[7.030879038000023,44.74040607500007],[7.06575512400002,44.713464403000046],[7.064236013000027,44.68589304200003],[6.948443099000031,44.65474198900006],[6.93469759200002,44.58562954700005],[6.861717827000064,44.527977071000066],[6.923014702000046,44.43604201200003],[6.887427980000041,44.36128689800006],[7.01972440000003,44.23884033000007],[7.368914947000064,44.12248714900005],[7.670212536000065,44.17211440800003],[7.714236357000061,44.06151361700006],[7.511191993000068,43.87264446300003],[7.529860025000062,43.78401301800005],[7.440561473000059,43.749876088000065],[7.43926473700003,43.749030205000054],[7.421460771000056,43.73739414500005],[7.415697031000036,43.72591051100005],[7.156841246000056,43.64515943400005],[7.11752632200006,43.57594631400008],[6.973588798000037,43.54025042600006],[6.931325283000035,43.48025793100004],[6.84379249400007,43.419048488000044],[6.74782291300005,43.40273016000003],[6.629515864000041,43.301143446000026],[6.675047621000033,43.25695991200007],[6.657024037000042,43.22534763500005],[6.616640851000057,43.18146923100005],[6.428830309000034,43.149263071000064],[6.340493337000055,43.103561967000076],[6.217041259000041,43.10454765500003],[6.138775111000029,43.05963586100006],[5.972197214000062,43.09777595300005],[5.835759104000033,43.07151638600004],[5.67187930700004,43.17926911300003],[5.391353534000075,43.20179187100007],[5.362856964000059,43.22534763500005],[5.353202341000042,43.31570455800005],[5.324487201000068,43.346749],[5.070941805000075,43.33335974700003],[4.944834352000044,43.42683612500008],[4.856805363000035,43.40946308500003],[4.869265778000056,43.352145337000024],[4.828945074000046,43.33507245100003],[4.600477794000028,43.35819659200007],[4.573870102000058,43.38122391200005],[4.57865974200007,43.424170219000075],[4.52912731400005,43.44983689600008],[4.230280408000056,43.46018348700005],[4.256276798000044,43.50184659900003],[4.455701016000035,43.598157351000054],[4.439044280000076,43.63565179100004],[4.490485518000071,43.69520417000007],[4.615734835000069,43.69351925700005],[4.648675436000076,43.86152699000007],[4.739059704000056,43.92406183000003],[4.835058541000024,44.00491343500005],[4.71720483100006,44.09490288000006],[4.714013868000052,44.194440909000036],[4.64922738100006,44.270360080000046],[4.650610830000062,44.329802864000044],[4.76835544000005,44.31448437200004],[4.857974150000075,44.24798180200003],[4.930083070000023,44.279713652000055],[4.896141489000058,44.35951729400006],[4.925416320000068,44.401497490000054],[4.978110378000054,44.415397573000064],[5.030486002000032,44.376775774000066],[5.01570706900003,44.29816085300007],[5.134031652000033,44.284042913000064],[5.203691512000034,44.220839467000076],[5.350784769000029,44.206188817000054],[5.498786261000021,44.115716675000044],[5.590996679000057,44.18542254300007],[5.676036113000066,44.191428408000036],[5.670884589000025,44.25995042000005],[5.614955567000038,44.320718903000056],[5.478113628000074,44.34974067600007],[5.441962751000062,44.417187366000064],[5.469315177000055,44.43261729900007],[5.468701809000038,44.49203613000003],[5.619470774000035,44.482202906000055],[5.64015888800003,44.51311517500005],[5.608239461000039,44.553939187000026],[5.653783666000038,44.64244317600003],[5.792662054000061,44.661087647000045],[5.817633002000036,44.68459950700003],[5.801470037000058,44.70677733700006],[5.831763152000065,44.75212098800006],[5.932677998000031,44.759396035000066],[6.017971604000024,44.82874987100007],[6.132913002000066,44.85795481200006],[6.345660439000028,44.86039332000007],[6.354407924000043,44.92899208400007],[6.315950221000037,44.98991693800008],[6.211940191000053,45.019114666000064],[6.260570013000063,45.126843930000064]]],[[[6.218094347000033,42.99229538900005],[6.199904944000025,42.976119804000064],[6.186435730000028,42.995117949000075],[6.205413578000048,43.00749086800005],[6.218094347000033,42.99229538900005]]],[[[6.246580272000074,42.997383152000054],[6.222713328000054,42.992028667000056],[6.212284118000071,42.99964781700004],[6.217172346000041,43.01081789400007],[6.232323888000053,43.01350095000004],[6.240444199000024,43.023148622000065],[6.248868010000024,43.01625282100008],[6.246580272000074,42.997383152000054]]],[[[6.438153238000041,43.01176876400007],[6.408695845000068,42.98033979600007],[6.361659222000071,43.006219256000065],[6.402266495000049,43.032620644000076],[6.438153238000041,43.01176876400007]]]]},
  sources: [
  {
    "label": "Région Provence-Alpes-Côte d’Azur",
    "url": "https://www.maregionsud.fr/"
  },
  {
    "label": "INAO — Institut national de l’origine et de la qualité",
    "url": "https://www.inao.gouv.fr/"
  },
  {
    "label": "Syndicat des Vignerons des Côtes de Provence",
    "url": "https://www.vins-provence.com/"
  }
],
  boundaryAttribution: "Administrative boundary: Eurostat/GISCO NUTS 2024 · FRL0 · EPSG:4326 · 1:10M",
};
