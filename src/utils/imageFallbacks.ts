import { Producer } from '../types/terroir';

type CategoryPlaceholder = {
  label: string;
  accent: string;
};

const PLACEHOLDER_META: Record<Producer['category'], CategoryPlaceholder> = {
  winery: { label: 'Winery', accent: '#be123c' },
  brewery: { label: 'Brewery', accent: '#d97706' },
  distillery: { label: 'Distillery', accent: '#b45309' },
  cidery: { label: 'Cidery', accent: '#65a30d' },
  olive_mill: { label: 'Olive Mill', accent: '#15803d' },
  olive_oil_producer: { label: 'Olive Oil Producer', accent: '#15803d' },
  oil_mill: { label: 'Oil Mill', accent: '#ca8a04' },
  cheese_dairy: { label: 'Dairy', accent: '#a16207' },
  apiary: { label: 'Apiary / Honey', accent: '#c2410c' },
  confectionery: { label: 'Confectionery Producer', accent: '#92400e' },
  herb_farm: { label: 'Herb Farm', accent: '#16a34a' },
  mushroom_farm: { label: 'Mushroom Farm', accent: '#57534e' },
  farm: { label: 'Farm', accent: '#047857' },
};

function buildNeutralPlaceholder(label: string, accent: string): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0c0a09"/>
          <stop offset="100%" stop-color="#292524"/>
        </linearGradient>
        <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.42"/>
          <stop offset="100%" stop-color="${accent}" stop-opacity="0.08"/>
        </linearGradient>
      </defs>

      <rect width="1200" height="800" fill="url(#bg)"/>
      <circle cx="1020" cy="90" r="340" fill="url(#accent)"/>
      <circle cx="160" cy="760" r="420" fill="url(#accent)" opacity="0.7"/>

      <path
        d="M0 610 C180 520 300 590 455 520 C620 445 760 525 900 470 C1030 420 1120 455 1200 420 L1200 800 L0 800 Z"
        fill="#1c1917"
      />

      <text
        x="72"
        y="112"
        fill="#fbbf24"
        font-family="Arial, sans-serif"
        font-size="30"
        font-weight="700"
        letter-spacing="4"
      >TERROIRTRAIL</text>

      <text
        x="72"
        y="610"
        fill="#fafaf9"
        font-family="Georgia, serif"
        font-size="68"
        font-weight="700"
      >${label}</text>

      <text
        x="76"
        y="670"
        fill="#a8a29e"
        font-family="Arial, sans-serif"
        font-size="30"
      >Producer photo pending</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export const CATEGORY_FALLBACK_IMAGES: Record<Producer['category'], string> =
  Object.fromEntries(
    Object.entries(PLACEHOLDER_META).map(([category, meta]) => [
      category,
      buildNeutralPlaceholder(meta.label, meta.accent),
    ])
  ) as Record<Producer['category'], string>;

export function getCategoryFallbackImage(
  category: Producer['category']
): string {
  return (
    CATEGORY_FALLBACK_IMAGES[category] ||
    buildNeutralPlaceholder('Independent Producer', '#d97706')
  );
}
