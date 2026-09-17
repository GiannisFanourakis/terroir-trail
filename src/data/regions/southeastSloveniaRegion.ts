import type { TerroirRegion } from '../terroirRegions';

/**
 * Southeast Slovenia (Jugovzhodna Slovenija).
 *
 * NUTS boundary source: Eurostat/GISCO NUTS 2024, SI037, WGS84 (EPSG:4326),
 * 1:10M generalized geometry.
 */
export const SOUTHEAST_SLOVENIA_TERROIR_REGION: TerroirRegion = {
  id: "southeast_slovenia",
  name: "Southeast Slovenia",
  nativeName: "Jugovzhodna Slovenija",
  officialName: "Jugovzhodna Slovenija",
  destination: "southeast_slovenia",
  countryCode: "SI",
  geographyType: "NUTS",
  nutsCode: "SI037",
  nutsLevel: 3,
  classificationVersion: "2024",
  eyebrow: "Southeast Slovenia · Slovenia",
  summary: "Covering the karst woodlands of Kočevje and the rolling vineyard hills along the Krka River, Southeast Slovenia is home to distinct agro-ecological traditions: mountain honey from vast fir and beech forests, artisan goat and cow dairying, and the light, refreshing ruby Cviček PTP wine produced by small vineyard cottages (zidanice).",
  highlights: ["Dense karst forests of Kočevsko & vineyard-covered Dolenjska hills","Certified Kočevje forest honey (Kočevski gozdni med PGI)","Traditional Cviček PTP ruby wine & hillside zidanica cottage heritage"],
  sections: [
  {
    "id": "landscape",
    "title": "Vast karst forests of Kočevsko and rolling Dolenjska hills",
    "eyebrow": "Landscape",
    "body": "Southeast Slovenia encompasses two contrasting natural worlds: the deep, primeval beech and fir forests of Kočevsko and the Kolpa river canyon in the south, transitioning into the sunny, vine-clad rolling hills and thermal springs of the Krka river basin in Dolenjska.",
    "highlights": [
      "Ancient virgin forests of Kočevsko",
      "Meandering Krka and Kolpa river valleys",
      "Terraced vineyard ridges of Dolenjska"
    ]
  },
  {
    "id": "history",
    "title": "Centuries of forest beekeeping, woodenware craft, and historic monasteries",
    "eyebrow": "History",
    "body": "Forests have sustained rural communities here for centuries. In Ribnica, royal patents from the 15th century permitted peasants to trade handcrafted woodenware (suha roba), while Cistercian monks at Kostanjevica na Krki established model vineyards and orchard farming that influenced regional cultivation practices.",
    "highlights": [
      "15th-century Ribnica woodenware craft charter",
      "Cistercian monastic agricultural development",
      "Centuries of sustainable forest stewardship"
    ]
  },
  {
    "id": "culture",
    "title": "Vineyard cottage culture (zidanica) and deep forest stewardship",
    "eyebrow": "Culture",
    "body": "The iconic cultural symbol of the region is the zidanica—a masonry vineyard cottage with a wine cellar below and living quarters above. Traditionally, families tended small hillside parcels, welcoming guests with home-cured meats and fresh wine under the hospitality custom of the countryside.",
    "highlights": [
      "Authentic zidanica vineyard cottage tradition",
      "Deep forest beekeeping and mushroom foraging",
      "Warm rural open-door hospitality customs"
    ]
  },
  {
    "id": "food",
    "title": "Certified forest honey, Cviček PTP wine, and Belokranjska pogača",
    "eyebrow": "Food & farming",
    "body": "The regional table features unique, highly regulated specialties: Kočevski gozdni med (mineral-rich honeydew forest honey with PGI status); Cviček PTP, an ancient low-alcohol blend of red and white grapes; salted cumin-crusted Belokranjska pogača flatbread; and artisan sheep and goat cheeses.",
    "highlights": [
      "Kočevski gozdni med PGI forest honey",
      "Distinctive ruby Cviček PTP wine",
      "Warm Belokranjska pogača & artisan farm cheeses"
    ]
  },
  {
    "id": "explore",
    "title": "Touring hillside zidanice vineyards, forest apiaries, and riverside dairies",
    "eyebrow": "On TerroirTrail",
    "body": "TerroirTrail guides you along scenic country ridge roads connecting family-run zidanica cellars, certified forest honey apiaries, and artisan farmsteads with verified locations and clear road accessibility advice.",
    "highlights": [
      "Verified zidanica cellar and apiary coordinates",
      "Scenic routes through vine-clad Dolenjska hills",
      "Independent craft producers with honest road data"
    ]
  }
],
  center: [45.72, 14.97],
  zoom: 9,
  geometry: {"type":"MultiPolygon","coordinates":[[[[15.148260381000057,45.978134168000054],[15.173331441000073,45.95103865300007],[15.225250096000025,45.92855836000007],[15.294726506000075,45.95801888700004],[15.351226412000074,45.93760395400005],[15.348816113000055,45.88704212000005],[15.379111660000035,45.884390893000045],[15.37747850900007,45.82989799200004],[15.40448931900005,45.792765501000076],[15.331290255000056,45.762855158000036],[15.316895887000044,45.75972587100006],[15.298686110000062,45.753248393000035],[15.259645549000027,45.726086019000036],[15.294137747000036,45.69893990300005],[15.356741543000055,45.70247342400006],[15.394659564000051,45.658641947000035],[15.30303473600003,45.62605902100006],[15.29742470900004,45.58568733300007],[15.35380970500006,45.48544363500008],[15.226437266000062,45.427088052000045],[15.152389062000054,45.431393754000055],[15.057328790000042,45.49230892600008],[14.962493074000065,45.51115955000006],[14.839758328000073,45.46595081800007],[14.787230495000074,45.50090942400004],[14.697140755000078,45.536513573000036],[14.689006077000045,45.58120059700008],[14.569820647000029,45.672429032000025],[14.537503869000034,45.73932388600008],[14.578665538000052,45.73766438400003],[14.564807269000028,45.79146217200008],[14.585379713000066,45.79393988500004],[14.688183998000056,45.819038145000036],[14.819218146000026,45.72950411800008],[14.82647501300005,45.756215885000074],[14.804826275000039,45.798399490000065],[14.850296338000078,45.809794758000066],[14.876092905000064,45.87012299300005],[14.885718231000055,45.93379608400005],[14.924865744000044,45.96315193200007],[14.94861387900005,45.97849790500004],[14.998312431000045,45.96303250500006],[15.03146547800003,45.97886488000006],[15.036575651000078,46.00366657200004],[15.099407631000076,46.01895901600005],[15.148260381000057,45.978134168000054]]]]},
  sources: [
  {
    "label": "Ministrstvo za kmetijstvo, gozdarstvo in prehrano",
    "url": "https://www.gov.si/"
  },
  {
    "label": "Zavod Kočevsko",
    "url": "https://www.kocevsko.com/"
  },
  {
    "label": "Društvo vinogradnikov Dolenjske",
    "url": "https://www.vinogradniki-dolenjske.si/"
  }
],
  boundaryAttribution: "Administrative boundary: Eurostat/GISCO NUTS 2024 · SI037 · EPSG:4326 · 1:10M",
};
