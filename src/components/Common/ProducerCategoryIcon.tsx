import React from 'react';
import type { Category } from '../../types/terroir';

export type ProducerCategoryIconKey = Category | 'all' | 'producer';

const ICON_BODIES: Record<ProducerCategoryIconKey, string> = {
  all: '<path d="M4 6.5 12 3l8 3.5v11L12 21l-8-3.5z"/><path d="M12 3v18M4 6.5l8 4 8-4M4 17.5l8-4 8 4"/>',
  producer: '<path d="M5 20V9l7-5 7 5v11"/><path d="M9 20v-6h6v6M8 10h8"/>',
  winery: '<path d="M8 3h8l-1 5.5A4 4 0 0 1 12 12a4 4 0 0 1-3-3.5z"/><path d="M12 12v7M8.5 21h7"/>',
  brewery: '<path d="M5 7h10v12H5z"/><path d="M15 9h2.5A2.5 2.5 0 0 1 20 11.5v1A2.5 2.5 0 0 1 17.5 15H15"/><path d="M7 4.5c.8-1.3 2-.9 2.6.1.6-1 1.9-1.4 2.6-.1.8-1 2.3-.7 2.8.5V7H7z"/>',
  distillery: '<path d="M9 3h6M10 3v5l-4.5 7.5A3.5 3.5 0 0 0 8.5 21h7a3.5 3.5 0 0 0 3-5.5L14 8V3"/><path d="M8 15h8"/>',
  cidery: '<path d="M12 8c-1.4-2-4.5-1.8-6 .3-2.2 3.2.3 9.8 3.4 11.5 1.2.7 1.9-.3 2.6-.3s1.4 1 2.6.3c3.1-1.7 5.6-8.3 3.4-11.5-1.5-2.1-4.6-2.3-6-.3Z"/><path d="M12 8c0-2.5 1.4-4.1 4-5M12.5 5.5c-1.3-1.1-2.6-1.4-4-1"/>',
  olive_mill: '<path d="M5 17c4-7 9-10 14-11-1 5-4 10-11 14"/><path d="M7 18c2-2 5-4 9-6"/><circle cx="8" cy="12" r="2.2"/>',
  olive_oil_producer: '<path d="M12 3s5 6 5 10a5 5 0 0 1-10 0c0-4 5-10 5-10Z"/><path d="M9.5 14.5c.5 1.1 1.3 1.7 2.5 1.8"/>',
  oil_mill: '<path d="M12 3s5 6 5 10a5 5 0 0 1-10 0c0-4 5-10 5-10Z"/><path d="M4 21h16M6 18h12"/>',
  cheese_dairy: '<path d="m4 10 8-5 8 5-8 4z"/><path d="M4 10v7l8 4 8-4v-7"/><circle cx="9" cy="12.2" r="1"/><circle cx="15.5" cy="16" r="1"/>',
  apiary: '<path d="m12 3 4 2.3v4.6l-4 2.3-4-2.3V5.3z"/><path d="m8 9.9-4 2.3v4.6L8 19l4-2.2v-4.6M16 9.9l4 2.3v4.6L16 19l-4-2.2"/>',
  confectionery: '<path d="M8 8h8l2 4-2 4H8l-2-4z"/><path d="m6 9-3-2 1 5-1 5 3-2M18 9l3-2-1 5 1 5-3-2"/>',
  herb_farm: '<path d="M5 19C6 10 11 5 19 4c-1 8-6 13-14 15Z"/><path d="M6 18c3-4 6-7 10-10"/>',
  mushroom_farm: '<path d="M5 12a7 7 0 0 1 14 0Z"/><path d="M10 12v3.5A3.5 3.5 0 0 1 8.5 18h7a3.5 3.5 0 0 1-1.5-2.5V12"/><path d="M8 9.5h.01M16 9.5h.01"/>',
  farm: '<path d="M12 21v-8"/><path d="M12 15c-4 0-7-2-7-6 4 0 7 2 7 6ZM12 12c0-4 3-7 7-7 0 4-3 7-7 7Z"/><path d="M6 21h12"/>',
};

export const getProducerCategoryIconMarkup = (
  category: ProducerCategoryIconKey
): string => {
  const body = ICON_BODIES[category] || ICON_BODIES.producer;
  return `<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true">${body}</svg>`;
};

interface ProducerCategoryIconProps {
  category: ProducerCategoryIconKey;
  className?: string;
}

export const ProducerCategoryIcon: React.FC<ProducerCategoryIconProps> = ({
  category,
  className = 'w-4 h-4',
}) => (
  <span
    aria-hidden="true"
    className={`inline-flex items-center justify-center shrink-0 leading-none ${className}`}
    dangerouslySetInnerHTML={{ __html: getProducerCategoryIconMarkup(category) }}
  />
);
