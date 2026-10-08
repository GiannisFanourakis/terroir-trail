import type { Producer } from '../types/terroir';
import {
  formatProducerCategories, getProducerCategories, getProducerCategoryDetails,
  getProducerVisitorFeatures,
} from './producerCategory';
import { getProducerCategoryIconMarkup } from '../components/Common/ProducerCategoryIcon';

const escapeHtml = (value: unknown): string => String(value ?? '').replace(
  /[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!
);

export function getProducerMarkerDimensions(producer: Producer, compact: boolean) {
  const count = getProducerCategories(producer).length;
  const compactWidth = count === 1 ? 36 : 10 + Math.min(count, 3) * 26 + (count > 3 ? 20 : 0);
  return {
    compactWidth,
    iconSize: [compact ? compactWidth : compactWidth + 144, compact ? 36 : 42] as [number, number],
    // Anchor the maker symbols to the location, so expanding the label does not move the pin.
    iconAnchor: [compactWidth / 2, compact ? 18 : 21] as [number, number],
  };
}

export function getProducerMarkerHtml(
  producer: Producer, isSelected: boolean, compact = false
): string {
  const categories = getProducerCategories(producer);
  const shown = categories.slice(0, 3);
  const extraCount = categories.length - shown.length;
  const hasMuseum = getProducerVisitorFeatures(producer).includes('museum');
  const dimensions = getProducerMarkerDimensions(producer, compact && !isSelected);
  const label = escapeHtml(producer.name + ' · ' + formatProducerCategories(producer) + (hasMuseum ? ' · Museum' : ''));
  const icons = shown.map((category) =>
    `<span class="pin-category-symbol pin-icon-circle ${getProducerCategoryDetails(category).markerColor} border" data-maker-category="${category}" title="${escapeHtml(getProducerCategoryDetails(category).label)}">${getProducerCategoryIconMarkup(category)}</span>`
  ).join('');
  const extra = extraCount > 0
    ? `<span class="pin-category-overflow" aria-hidden="true">+${extraCount}</span>` : '';
  const museum = hasMuseum
    ? `<span class="pin-museum-badge" data-visitor-feature="museum" title="Museum">${getProducerCategoryIconMarkup('museum')}</span>` : '';
  const locality = producer.village ? producer.village.split('(')[0].split(',')[0].trim() : producer.region;
  const text = compact && !isSelected ? '' :
    `<span class="pin-text-container"><span class="pin-text-label" title="${escapeHtml(producer.name)}">${escapeHtml(producer.name)}</span><span class="pin-text-sub">${escapeHtml(locality)}</span></span>`;

  return `<div class="modern-map-pin multi-category-pin ${compact && !isSelected ? 'producer-pin-compact' : 'producer-pin-detailed'} ${isSelected ? 'active-pin' : ''}"
    data-producer-id="${escapeHtml(producer.id)}" data-category-count="${categories.length}" title="${label}"
    style="--pin-compact-width:${dimensions.compactWidth}px;--pin-expanded-width:${dimensions.compactWidth + 144}px">
    <span class="pin-maker-symbols" aria-hidden="true">${icons}${extra}${museum}</span>${text}
  </div>`;
}
