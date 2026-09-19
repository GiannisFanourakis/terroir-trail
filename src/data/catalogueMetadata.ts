export const CATALOGUE_REVIEWED_AT = '2026-09-18';

export function formatCatalogueReviewedAt(
  locale = 'en-GB'
): string {
  const date = new Date(`${CATALOGUE_REVIEWED_AT}T00:00:00Z`);
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
