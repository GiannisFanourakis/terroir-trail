import { Producer } from '../types/terroir';

/**
 * Source-backed content enrichment for the Phase 13 dairy additions.
 *
 * Live Supabase remains authoritative at runtime. These overrides keep the
 * bundled SEO/AEO catalogue in parity with the researched live records.
 * `indigenousVarieties` is mirrored from `productSpecialties` only as a
 * backwards-compatibility display bridge for the current producer drawer;
 * `productSpecialties` remains the category-neutral authority.
 */
const CONTENT: Record<string, Partial<Producer>> = {
  'argogal-koromichi-kefalari': {
    tagLine: 'A century of Koromichi family cheesemaking from mountain Argolida to Kefalari.',
    description:
      'ARGOGAL traces the Koromichi family cheesemaking tradition to 1916 and today works from 2,000 m² facilities in Kefalari, Argos. It collects sheep and goat milk from Greek free-range breeds in the mountainous Peloponnese and combines traditional recipes with modern food-safety controls.',
    story:
      'The story begins in 1916, when Vassilis Koromichis established a small dairy in Krya Vrysi, Argolida. The next generation, Andreas, took over in the early 1960s; in 1994 his three sons joined the business as ARGOGAL and developed the modern Kefalari facilities. The family continues to present tradition, local raw material and careful production as the core of the dairy, whose cheeses have received distinctions in Greek quality and taste competitions.',
    productSpecialties: [
      'Feta',
      'traditional white cheese in barrel',
      'goat cheese',
      'anthotyro',
      'myzithra',
      'spicy graviera',
      'low-salt graviera',
      'kefalotyri',
    ],
  },
  'arvanitis-dairy-neochorouda': {
    tagLine: 'Three generations of Macedonian cheesemaking built around Greek milk and award-winning cheeses.',
    description:
      'Arvanitis Dairy is a three-generation family cheesemaker whose history dates to 1980. From its Neochorouda fromagerie near the pastures of Macedonia, it works exclusively with Greek milk collected daily from trusted local producers and produces a broad range of traditional and specialty cheeses.',
    story:
      'Arvanitis dates its modern history to 1980 while describing three generations of family cheesemaking. The dairy emphasizes keeping its family character while growing, sourcing only Greek milk from local producers and following the milk from animal care through production. Its cheeses have earned international distinctions, including a Gold Prize at the World Championship Cheese Contest, and the company now presents Greek cheeses in Greece and international markets.',
    productSpecialties: [
      'Feta PDO',
      'barrel-matured Feta PDO',
      'Manouri PDO',
      'anthotyro',
      'goat cheese',
      'Kasseri PDO',
      'kefalotyri',
      'Smoked Thessaloniki Cheese',
      'Saganaki',
      'KYANO goat-milk blue cheese',
    ],
  },
  'baladinos-dairy-varipetro': {
    tagLine: 'Four generations of Chania cheesemaking, from Therissos pastoral roots to Varipetro.',
    description:
      'Baladinos & Sons traces its dairy tradition to Therissos and 1928. The fourth-generation family business now produces a wide range of Cretan cheeses and dairy products at its modern Varipetro factory, using milk associated with free-range animals in Crete; its long-standing Skalidi Street shop is a separate public point.',
    story:
      'The Baladinos family links its cheesemaking story to the mountain village of Therissos, where stock raising and dairy production shaped the family trade. Since 1928 the business has grown through four generations, adding a central Chania shop in the 1950s and later a modern production plant in Varipetro. The company presents its mission as preserving Cretan food culture while combining traditional cheesemaking with modern production and quality controls.',
    productSpecialties: [
      'Kefalotyri',
      'Graviera PDO',
      'Pichtogalo Chanion PDO',
      'dry anthotyros',
      'Cretan tyromalama',
      'goat and sheep white cheese',
      'Cretan butter oil',
      'sheep and goat Cretan butter',
      'goat yogurt',
      'cow yogurt',
      'sheep yogurt',
    ],
  },
  'christakis-patria-feta-proastio': {
    tagLine: 'Edessa cheesemaking since 1890, carried forward at the Christakis factory in Proastio.',
    description:
      'Christakis / Patria Feta traces its cheesemaking roots to 1890, when Dimitrios Christakis worked with milk from the mountain region of Edessa. The present CHRISTAKIS S.A. factory in Proastio produces Feta and a broad family of traditional Greek cheeses while retaining the company’s emphasis on fresh Greek milk and inherited methods.',
    story:
      'In 1890 Dimitrios Christakis established a small cheese workshop using milk from the mountain region of Edessa in Pella. Across more than a century the family operation developed into CHRISTAKIS S.A., while the company says its constant principles remain tradition and authentic taste. Its current production combines modern standardization and pasteurization equipment with fresh milk from tested Greek sheep and goat herds that graze in the countryside.',
    productSpecialties: [
      'Feta PDO',
      'sheep cheese',
      'goat cheese',
      'Manouri PDO',
      'anthotyros',
      'Giza (myzithra)',
      'Mpatzos PDO',
      'Kaseri PDO',
      'kefalotyri',
      'cheese with olive and chilli',
      'cheese with garlic and pepper',
      'cheese with dry tomato and oregano',
    ],
  },
  'elatos-kapetanou-schinochori': {
    tagLine: 'Third-generation Argolida dairy making Feta PDO and traditional sheep-and-goat milk products since 1963.',
    description:
      'ELATOS / Kapetanou Bros has operated in Schinochori, Argos since 1963 and is now a third-generation dairy. It works with fresh pasteurized sheep and goat milk from the local area, with continuous milk and production controls, and makes Feta PDO alongside traditional cheeses and sheep yogurt.',
    story:
      'Three generations of cheesemakers stand behind ELATOS. The dairy describes careful control from milk collection through distribution, supported by its own analysis laboratory, specialist staff and long-running food-safety certification. It combines that technical control with recipes rooted in local sheep and goat milk, and in 2014 received a quality award associated with the Agricultural University dairy department and Gastronomos.',
    productSpecialties: [
      'Feta PDO',
      'barrel Feta PDO',
      'dry myzithra',
      'anthotyro',
      'sheep and goat graviera',
      'sheep yogurt',
    ],
  },
  'gypas-cheese-asi-gonia': {
    tagLine: 'Asi Gonia cheesemaking shaped by the Lefka Ori, local milk and generations of family knowledge.',
    description:
      'GYPAS / Gyparaki Bros grew from a small village creamery in Asi Gonia into a modern 3,000 m² cheese factory at the edge of the village. The family combines local cheesemaking recipes with modern technology and works with Cretan sheep and goat milk, including milk from free-grazing animals for its Cretan Graviera PDO.',
    story:
      'The first family creamery stood in the centre of Asi Gonia, where grandfather Andreas and his sons Sifis and Petros made Graviera and Anthotyro for the local market. As demand grew, the business moved to larger modern premises at the edge of the village and developed into today’s 3,000 m² facility. GYPAS says it continues to build on the knowledge of local cheesemakers, pure raw materials and respect for the consumer, with certified PDO and food-safety systems.',
    productSpecialties: [
      'Cretan Graviera PDO',
      '12-month Cretan Graviera PDO',
      '15-month Cretan Graviera PDO',
      'Graviera with savory, oregano and thyme',
      'black-truffle Graviera',
      'smoked Graviera',
      'fresh anthotyros',
      'dry anthotyros',
      'GYPAS Hot Mitatotyri',
      'white brine cheese',
      'Souroti Kouroupa myzithra',
    ],
  },
  'iliakis-dairy-kato-mallaki': {
    tagLine: 'Traditional Cretan dairy production in Kato Mallaki since 1974.',
    description:
      'Iliakis Dairy / Meraki Iliaki began in 1974 to serve the Iliakis family’s own needs and has grown into an integrated traditional dairy-production unit in Kato Mallaki, Rethymno. Its products are made from sheep, goat or mixed milk sourced exclusively from livestock farmers in the surrounding area.',
    story:
      'Iliakis S.A. says the dairy first operated in 1974 for the needs of the Iliakis family. Today it remains focused on traditional Cretan dairy production, using sheep, goat or mixed milk only from local livestock farmers. The producer explicitly says it follows the old traditional method and does not add commercial milk substitutes; the current site does not publish enough accessible product-level detail for TerroirTrail to invent a more specific product list.',
    productSpecialties: [
      'traditional Cretan dairy products from sheep, goat or mixed milk',
    ],
  },
  'kalavryta-dairy-cooperative-xirokampos': {
    tagLine: 'A mountain cooperative turning member-farm milk into Kalavryta’s barrel-aged Feta PDO and regional dairy products.',
    description:
      'The Agricultural Dairy Cooperative of Kalavryta was founded in 1963 and brings together roughly 1,200 breeder-members. It collects sheep and goat milk from mountain farms across the wider Kalavryta area and is best known for Feta PDO matured in beech-wood barrels, alongside an expanding range of cheeses and dairy products.',
    story:
      'The cooperative was founded in 1963 by livestock breeders in the Kalavryta area. A milk-processing factory followed in 1972 and began mainly producing its traditional barrel Feta in 1974, creating a cooperative outlet for the region’s mountain milk and supporting local livestock incomes. The cooperative has continued to modernize its production while retaining member-farm sourcing; its Feta PDO is matured in beech barrels, and the organization expanded its dairy range from 2019 onward.',
    productSpecialties: [
      'Barrel Feta PDO',
      'goat cheese',
      'dry mizithra',
      'Afiri semi-hard cheese',
      'Alifotiri feta spread',
      'traditional sheep yogurt',
      'traditional goat yogurt',
      'fresh cow milk',
      'cow graviera',
      'vanilla cream',
      'rice pudding',
    ],
  },
  'katsouli-cheese-koliaki': {
    tagLine: 'A second-generation Argolida dairy where traditional cheeses meet the family’s small-batch Mastichoto.',
    description:
      'Katsouli Cheese Factory is a family dairy founded by Vassilis Katsoulis in 1989 and now continued by his children Thomas and Garyfallia. Working with local sheep and goat milk from small producers around Argolida, the dairy makes classic Greek cheeses alongside its distinctive small-production Mastichoto.',
    story:
      'Vassilis Katsoulis founded the dairy in 1989 with Feta at the centre of production. His children Thomas and Garyfallia later studied at the Cheese School in Ioannina and returned to the family business, bringing formal training into the evolving dairy. The factory says it works with local small milk producers and processes around 1,000–1,300 kilograms of milk per day, combining traditional methods with newer facilities.',
    productSpecialties: [
      'Feta',
      'Graviera',
      'Kefalotyri',
      'Myzithra',
      'Anthotyro',
      'goat cheese',
      'Mastichoto',
    ],
  },
  'psiloritis-cheese-dairy-livadia': {
    tagLine: 'Family cheesemaking at the foothills of Psiloritis, built around local mountain sheep and goat milk.',
    description:
      'Psiloritis Cheese Dairy has produced traditional Cretan dairy products in Livadia Mylopotamou since 1993. Founder Efstratios Klados began with milk from his own sheep and goats; the dairy later expanded its local milk network and moved to modern facilities in 2007 while retaining traditional Cretan cheeses at the centre of production.',
    story:
      'Efstratios Klados began producing Graviera and Kefalotyri in 1993 from milk supplied by his own sheep and goats at the foothills of Psiloritis. As demand grew, the dairy began working with other local producers from 1995, with particular attention to milk quality and local sheep and goat breeds reared largely in mountainous areas. In 2007 the family business relocated to modern facilities and adopted ISO 22000 food-safety certification while continuing its traditional Cretan range.',
    productSpecialties: [
      'Cretan Graviera',
      'Kefalotyri',
      'Cretan Xynomyzithra',
      'Anthotyros',
      'sweet Myzithra',
      'white brine cheese',
      'yogurt',
      'Graviera with thyme',
      'Graviera with oregano',
      'Graviera with bukovo',
      'smoked cheese',
      'grated Graviera',
      'Cretan xinochondros',
    ],
  },
  'stamatogiorgis-dairy-smari': {
    tagLine: 'Generations of Smari cheesemaking, 100% local milk and both traditional and delicatessen Cretan flavors.',
    description:
      'Stamatogiorgis is a family-owned dairy in Smari, Pediados, rooted in Cretan cheesemaking tradition. It makes classic cheeses from 100% local milk and also develops delicatessen variations with pepper, bukovo, Cretan herbs and smoking, alongside traditional dairy products.',
    story:
      'The Stamatogiorgis family describes generations of cheesemaking know-how carried into a modern family dairy in Smari. Its range begins with traditional Cretan cheeses such as Graviera, Kefalotyri, Myzithra and Anthotyro, but extends to herb, pepper and smoked cheeses and everyday dairy products. The producer also highlights international distinctions and tasting experiences at its facilities; because current booking and walk-in procedures are not clear, TerroirTrail continues to treat visitor access as uncertain rather than guaranteed.',
    productSpecialties: [
      'Graviera',
      'Kefalotyri',
      'Myzithra',
      'Anthotyro',
      'cheese with pepper',
      'cheese with bukovo',
      'cheese with Cretan herbs',
      'smoked cheese',
      'sheep yogurt',
      'anthogalo',
      'katsochoiri',
    ],
  },
  'tsatsoulis-cheese-panagitsa': {
    tagLine: 'Four generations of Arcadian cheesemaking focused on Feta PDO and Graviera from fresh sheep and goat milk.',
    description:
      'Tsatsoulis is a family cheesemaker in Panagitsa, Arcadia with at least four generations of experience. In 2008 Nikos Tsatsoulis led the modernization of the traditional dairy into a vertically organized production unit, combining family knowledge with modern equipment and certified quality systems.',
    story:
      'The Tsatsoulis family says it has specialized in traditional Greek cheese for at least four generations. A major transition came in 2008, when Nikos took leadership and modernized the traditional dairy into a vertically organized cheese-production unit while retaining the family’s inherited methods and know-how. The dairy works with fresh sheep and goat milk and applies HACCP and ISO quality systems.',
    productSpecialties: ['Feta PDO from Vytina', 'Graviera from Vytina'],
  },
};

export function enrichPhase13DairyProducer(producer: Producer): Producer {
  const override = CONTENT[producer.id];
  if (!override) return producer;

  const productSpecialties = override.productSpecialties ?? producer.productSpecialties;

  return {
    ...producer,
    ...override,
    productSpecialties,
    // Temporary compatibility mirror: the current drawer still reads the
    // legacy field for its category-specific "What They Make" chips.
    indigenousVarieties: productSpecialties ?? producer.indigenousVarieties,
  };
}
