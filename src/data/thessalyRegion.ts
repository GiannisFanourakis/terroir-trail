import type { TerroirRegion } from './terroirRegions';

/**
 * Thessaly / Θεσσαλία.
 *
 * Boundary source: Eurostat/GISCO NUTS 2024, NUTS-2 EL61, WGS84 (EPSG:4326),
 * 1:3M generalized geometry. The production database retains the complete
 * 303-point GISCO geometry; this bundled copy is topology-preserving simplified
 * for fast Leaflet rendering.
 */
export const THESSALY_TERROIR_REGION: TerroirRegion = {
  id: 'thessaly',
  name: 'Thessaly',
  destination: 'thessaly',
  eyebrow: 'Thessaly · Greece',
  summary:
    'Thessaly brings together the broad central plain, the foothills of Pindus and Olympus, the Meteora landscape and the Aegean-facing country around Volos and Pelion. Its producer story spans wine and tsipouro, dairy, honey, herbs, field crops and other regional foods.',
  highlights: [
    'Central Thessalian plain',
    'Meteora, Pindus & Olympus foothills',
    'Wine, spirits, dairy & regional produce',
  ],
  sections: [
    {
      id: 'landscape',
      title: 'Plain, mountain edge and Aegean coast',
      eyebrow: 'Landscape',
      body:
        'Thessaly is organised around one of Greece’s largest agricultural plains, framed by mountain systems and opening east towards the Aegean. The region changes quickly from lowland farming around Larissa and Karditsa to the western mountain edge near Trikala and Meteora, and to the coastal and upland landscapes around Volos and Pelion.',
      highlights: ['Thessalian plain', 'Mountain foothills', 'Aegean-facing landscapes'],
    },
    {
      id: 'history',
      title: 'Routes between lowland farms and mountain communities',
      eyebrow: 'History',
      body:
        'The region’s settlements, farming districts and market towns developed around the relationship between the productive plain and the surrounding uplands. Meteora adds a major monastic landscape to western Thessaly, while towns such as Larissa, Trikala, Karditsa and Volos anchor distinct local areas across the region.',
      highlights: ['Meteora landscape', 'Historic market towns', 'Lowland–upland connections'],
    },
    {
      id: 'culture',
      title: 'Agriculture still shapes everyday place identity',
      eyebrow: 'Culture',
      body:
        'Thessaly’s food culture is not one single tradition. Vineyard and distilling areas around Tyrnavos sit alongside dairy and pastoral production, grain and field-crop districts, beekeeping, mountain herbs and the produce of Pelion and the eastern side of the region. TerroirTrail treats those local differences as part of the map rather than flattening the region into one category.',
      highlights: ['Tyrnavos wine & distilling', 'Pastoral and dairy traditions', 'Mountain and lowland produce'],
    },
    {
      id: 'food',
      title: 'A broad producer landscape',
      eyebrow: 'Food & farming',
      body:
        'The first TerroirTrail expansion into Thessaly is deliberately multi-category. Wineries and distilleries are important, but the regional layer is designed to support dairies, apiaries, farms, olive and herb producers and other verified local makers as the catalogue grows.',
      highlights: ['Wine & tsipouro', 'Dairy & honey', 'Farms, herbs & local foods'],
    },
    {
      id: 'explore',
      title: 'Build the route from verified places',
      eyebrow: 'On TerroirTrail',
      body:
        'The region boundary is only the geographic frame. Each producer added inside it still needs its own identity, exact public point, visitability and road-access evidence before it becomes a trusted stop. That keeps the regional story separate from the practical claims a traveler relies on.',
      highlights: ['Verified producer identity', 'Exact public points', 'Road access checked separately'],
    },
  ],
  center: [39.592714, 22.056567],
  geometry: {
    type: 'MultiPolygon',
    coordinates: [[[[22.218431,40.176973],[22.193512,40.1547],[22.21875,40.104149],[22.284606,40.170981],[22.333631,40.171642],[22.35038,40.157249],[22.347023,40.135504],[22.368075,40.134982],[22.349677,40.070456],[22.379328,40.04226],[22.429633,40.038249],[22.48906,40.008386],[22.502316,39.964686],[22.529314,39.949927],[22.62504,39.970505],[22.6662,39.94911],[22.66243,39.975548],[22.710406,39.94709],[22.735843,39.872033],[22.851156,39.797439],[22.915911,39.602936],[22.944633,39.571288],[23.090559,39.49812],[23.266478,39.319139],[23.341216,39.189551],[23.31527,39.152284],[23.227661,39.128724],[23.193813,39.101467],[23.07173,39.091059],[23.061809,39.105909],[23.084397,39.142749],[23.106293,39.142567],[23.11334,39.106763],[23.211176,39.157885],[23.214532,39.184471],[23.163165,39.26948],[23.11995,39.301101],[23.033583,39.316874],[22.992194,39.346989],[22.943247,39.355324],[22.931877,39.299365],[22.822084,39.26948],[22.816205,39.247489],[22.852117,39.16009],[22.886407,39.182845],[22.924578,39.118355],[22.957994,39.117402],[22.977049,39.099479],[22.992158,39.050094],[22.965524,39.01397],[23.057976,39.032751],[22.934987,38.971579],[22.862048,39.001352],[22.756198,39.004177],[22.702514,39.021675],[22.669601,39.052666],[22.571971,39.036915],[22.498025,39.047924],[22.5049,39.130523],[22.452937,39.142028],[22.443076,39.177458],[22.39352,39.223523],[22.298452,39.237261],[22.258202,39.272195],[22.156214,39.158652],[22.159449,39.124396],[22.10192,39.097483],[22.075722,39.100846],[22.048054,39.079599],[22.044722,39.047879],[22.0069,39.032218],[21.959149,39.028459],[21.930985,39.099041],[21.854401,39.150327],[21.834139,39.150671],[21.777871,39.107034],[21.735656,39.116587],[21.736807,39.174994],[21.700157,39.189652],[21.701056,39.229818],[21.67616,39.249712],[21.624605,39.251878],[21.548814,39.217913],[21.507151,39.232503],[21.396378,39.164741],[21.372894,39.174614],[21.351549,39.203539],[21.426152,39.288688],[21.394115,39.347619],[21.2796,39.374639],[21.26554,39.416015],[21.198031,39.469003],[21.213394,39.494932],[21.18161,39.501088],[21.201295,39.524925],[21.191757,39.582492],[21.124111,39.679922],[21.167619,39.714557],[21.249073,39.698791],[21.229294,39.735879],[21.229421,39.803853],[21.248557,39.808708],[21.267251,39.852591],[21.318301,39.864209],[21.336747,39.833725],[21.380688,39.833299],[21.417194,39.850509],[21.425563,39.889539],[21.46696,39.899565],[21.585227,39.890101],[21.681374,39.855581],[21.721462,39.872047],[21.787464,39.848016],[21.839719,39.861077],[21.917692,39.852049],[21.907338,39.922893],[21.871267,39.953393],[21.941322,39.987884],[21.964141,40.0282],[22.07093,40.11171],[22.097377,40.143325],[22.093004,40.169342],[22.121525,40.168644],[22.115703,40.190249],[22.183686,40.195927],[22.218431,40.176973]]],[[[24.120515,39.058511],[24.097858,39.093391],[24.117614,39.102354],[24.120515,39.058511]]],[[[23.980844,39.10599],[23.968647,39.1098],[23.98591,39.126112],[23.980844,39.10599]]],[[[23.503201,39.129801],[23.506541,39.114032],[23.49166,39.129463],[23.503201,39.129801]]],[[[23.805231,39.128121],[23.789843,39.127116],[23.799901,39.142237],[23.805231,39.128121]]],[[[23.090315,39.164528],[23.082115,39.155121],[23.064908,39.159235],[23.078317,39.168623],[23.090315,39.164528]]],[[[23.524615,39.170977],[23.45348,39.13254],[23.388269,39.15613],[23.464289,39.20633],[23.524615,39.170977]]],[[[23.716629,39.147585],[23.730848,39.123556],[23.777862,39.129515],[23.789899,39.117158],[23.729532,39.074038],[23.662001,39.087474],[23.647031,39.130646],[23.589042,39.203389],[23.608885,39.206996],[23.658708,39.167634],[23.716629,39.147585]]],[[[23.982317,39.1696],[23.939102,39.181971],[23.974234,39.196815],[23.974429,39.235863],[23.989601,39.208784],[23.982317,39.1696]]],[[[24.006163,39.223611],[23.989155,39.228836],[23.999717,39.241152],[24.006163,39.223611]]],[[[23.916317,39.176695],[23.858922,39.135839],[23.832732,39.143317],[23.873089,39.174999],[23.873218,39.204353],[23.951754,39.287879],[23.979042,39.266633],[23.916317,39.176695]]],[[[24.325047,39.333677],[24.306739,39.332153],[24.3316,39.361863],[24.325047,39.333677]]],[[[24.095473,39.312596],[24.078987,39.296662],[24.040249,39.320187],[24.06473,39.365439],[24.097409,39.348203],[24.095473,39.312596]]],[[[24.173643,39.382267],[24.142004,39.336085],[24.117597,39.357897],[24.173643,39.382267]]],[[[24.185521,39.507596],[24.182401,39.490217],[24.169928,39.494999],[24.185521,39.507596]]]],
  },
  sources: [
    {
      label: 'Eurostat/GISCO — NUTS 2024, NUTS-2 EL61',
      url: 'https://gisco-services.ec.europa.eu/distribution/v2/nuts/',
    },
  ],
  boundaryAttribution:
    'Administrative boundary: Eurostat/GISCO NUTS 2024 · EL61 · EPSG:4326 · 1:3M',
};
