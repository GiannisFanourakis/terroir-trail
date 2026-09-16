import type { Destination } from '../types/terroir';

export interface TerroirRegionSource {
  label: string;
  url: string;
}

export interface TerroirRegionSection {
  id: 'landscape' | 'history' | 'culture' | 'food' | 'explore';
  title: string;
  eyebrow: string;
  body: string;
  highlights?: string[];
}

export interface TerroirRegion {
  id: string;
  name: string;
  destination: Destination;
  eyebrow: string;
  summary: string;
  highlights: string[];
  sections: TerroirRegionSection[];
  center: [number, number];
  /** GeoJSON geometry coordinates use [longitude, latitude]. */
  geometry: {
    type: 'MultiPolygon';
    coordinates: number[][][][];
  };
  sources: TerroirRegionSource[];
}

/**
 * Phase 13 reference region.
 *
 * Boundary geometry is the simplified 1:10 Greece regional geometry derived
 * from Eurostat/GISCO by the public `dimitris1ps/Geojson` dataset. Keeping the
 * geometry local makes the map deterministic and avoids a runtime GIS request.
 * Editorial claims are deliberately concise and tied to first-party or
 * institutional sources listed below.
 */
export const CRETE_TERROIR_REGION: TerroirRegion = {
  id: 'crete',
  name: 'Crete',
  destination: 'crete',
  eyebrow: 'Island terroir · Greece',
  summary:
    'High mountain massifs, plateaus, valleys and a long coastline shape sharply varied landscapes across Crete. Olive oil, vineyards and wine, dairy, honey and other crops remain important parts of the island’s agricultural identity.',
  highlights: [
    'Mountain massifs & plateaus',
    'Olive groves & vineyards',
    'Dairy, honey & regional produce',
  ],
  sections: [
    {
      id: 'landscape',
      title: 'A mountain island in the Mediterranean',
      eyebrow: 'Landscape',
      body:
        'Crete is Greece’s largest island. Its four regional units — Chania, Rethymno, Heraklion and Lasithi — stretch across a landscape of high massifs, gorges, plateaus, fertile valleys and long coastlines. Psiloritis reaches 2,456 metres, while the White Mountains and Dikti create sharply different local environments over relatively short distances.',
      highlights: ['4 regional units', 'Psiloritis · 2,456 m', 'Gorges, plateaus & coast'],
    },
    {
      id: 'history',
      title: 'From Minoan Crete to a Mediterranean crossroads',
      eyebrow: 'Deep history',
      body:
        'Crete was the heartland of the Minoan civilisation, whose palatial centres connected administration, ritual, craft production, farming and maritime exchange. In 2025 UNESCO inscribed six Minoan Palatial Centres — Knossos, Phaistos, Malia, Zakros, Zominthos and Kydonia — on the World Heritage List. Later Byzantine, Venetian and Ottoman periods added further architectural and cultural layers that remain visible across the island.',
      highlights: ['Minoan civilisation', '6 UNESCO palatial centres', 'Byzantine · Venetian · Ottoman layers'],
    },
    {
      id: 'culture',
      title: 'A living culture, not only a museum landscape',
      eyebrow: 'Culture & traditions',
      body:
        'Cretan identity is still carried through village life, music, dance, oral traditions, festivals, craft practices and agricultural knowledge. The Region of Crete’s intangible-heritage work explicitly records customs, music-and-dance traditions, storytelling, handicrafts, cultivation practices, ethnobotanical knowledge and food heritage as living parts of the island’s collective memory.',
      highlights: ['Music & dance', 'Craft traditions', 'Village customs & oral memory'],
    },
    {
      id: 'food',
      title: 'Terroir you can taste',
      eyebrow: 'Food & farming',
      body:
        'Olive oil, wine, sheep- and goat-milk dairy, honey, wild greens, herbs and seasonal produce connect the landscape directly to the table. Cretan gastronomy is built around simple ingredients and local production, with dishes such as dakos, kalitsounia, goat, wild greens and regional cheeses sitting alongside wine and tsikoudia traditions.',
      highlights: ['Olive oil & wine', 'Sheep & goat dairy', 'Honey, herbs & wild greens'],
    },
    {
      id: 'explore',
      title: 'Follow the island through its producers',
      eyebrow: 'On TerroirTrail',
      body:
        'Use the map to move from the island-scale story into individual places: wineries, olive producers, dairies, apiaries, farms and other small makers. TerroirTrail keeps producer identity, visitability and road-access evidence separate, so the cultural story never substitutes for practical verification.',
      highlights: ['Producer stories', 'Verified map identity', 'Access evidence stays separate'],
    },
  ],
  center: [35.2401, 24.8093],
  geometry: {
    type: 'MultiPolygon',
    coordinates: [
      [
        [
          [24.31741, 35.35377],
          [24.54771, 35.37621],
          [24.68662, 35.42387],
          [24.928, 35.40691],
          [25.00325, 35.42006],
          [25.07314, 35.34276],
          [25.36684, 35.33605],
          [25.4907, 35.29833],
          [25.64031, 35.3402],
          [25.73225, 35.33158],
          [25.74853, 35.27197],
          [25.72646, 35.15785],
          [25.79069, 35.12174],
          [26.05063, 35.2261],
          [26.12118, 35.21183],
          [26.1586, 35.20427],
          [26.24539, 35.26551],
          [26.2918, 35.19507],
          [26.25885, 35.08675],
          [26.16803, 35.01394],
          [26.12118, 35.01788],
          [25.94516, 35.03266],
          [25.55057, 34.99076],
          [24.76755, 34.92741],
          [24.72252, 35.09254],
          [24.56836, 35.1043],
          [24.38125, 35.19042],
          [24.28752, 35.17601],
          [23.84374, 35.24054],
          [23.67453, 35.24348],
          [23.60572, 35.24468],
          [23.54334, 35.29425],
          [23.5409, 35.3745],
          [23.58522, 35.53901],
          [23.67453, 35.52788],
          [23.69521, 35.5253],
          [23.74133, 35.66262],
          [23.85225, 35.535],
          [23.98803, 35.52252],
          [24.08985, 35.57921],
          [24.14517, 35.57942],
          [24.17313, 35.53633],
          [24.14477, 35.48545],
          [24.22869, 35.4557],
          [24.31741, 35.35377],
        ],
      ],
      [
        [
          [24.11839, 34.85153],
          [24.10968, 34.81738],
          [24.07261, 34.82483],
          [24.04278, 34.85371],
          [24.07261, 34.87158],
          [24.11839, 34.85153],
        ],
      ],
      [
        [
          [26.1995, 35.3568],
          [26.19418, 35.30395],
          [26.14429, 35.33051],
          [26.16993, 35.36549],
          [26.1995, 35.3568],
        ],
      ],
      [
        [
          [25.2529, 35.4542],
          [25.24779, 35.41806],
          [25.18837, 35.44706],
          [25.21144, 35.47656],
          [25.2529, 35.4542],
        ],
      ],
    ],
  },
  sources: [
    {
      label: 'Region of Crete — regional geography',
      url: 'https://www.crete.gov.gr/perifereia/',
    },
    {
      label: 'UNESCO — Minoan Palatial Centres',
      url: 'https://whc.unesco.org/en/list/1733',
    },
    {
      label: 'Eurostat/GISCO regional boundary source',
      url: 'https://ec.europa.eu/eurostat/web/gisco/geodata/reference-data/administrative-units-statistical-units/nuts',
    },
    {
      label: 'Region of Crete — intangible cultural heritage',
      url: 'https://www.crete.gov.gr/diimerida-perifereias-kritis-perifereiako-eyretirio-aylis-politistikis-klironomias-tis-kritis-paroysiasi-dynatotites-kai-prooptikes/',
    },
    {
      label: 'Visit Greece — Cretan gastronomy',
      url: 'https://www.visitgreece.gr/experiences/gastronomy/traditional-cuisine/local-flavours-of-the-greek-cuisine/',
    },
    {
      label: 'Visit Greece — Chania cultural layers',
      url: 'https://www.visitgreece.gr/en/islands/Crete/Chania',
    },
  ],
};

export const TERROIR_REGIONS: TerroirRegion[] = [CRETE_TERROIR_REGION];
