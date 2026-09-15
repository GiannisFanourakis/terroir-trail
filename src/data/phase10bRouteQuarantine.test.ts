import { describe, expect, it } from 'vitest';
import { CURATED_ROUTES } from './loops';

const PHASE_10B_DESTINATIONS = new Set(['peloponnese', 'northern_greece', 'tuscany']);
const LEGACY_PHASE_10B_ROUTE_IDS = new Set([
  'peloponnese-mythic-trail',
  'northern-greece-royal-trail',
  'tuscany-chianti-classico-trail',
]);

const isPublishedGuide = (verificationStatus: string | undefined) =>
  verificationStatus === 'verified_stops' || verificationStatus === 'verified';

describe('Phase 10B route quarantine', () => {
  it('publishes no Peloponnese, Northern Greece, or Tuscany guide before regional audit', () => {
    const publishedPhase10bGuides = CURATED_ROUTES.filter(
      (route) =>
        PHASE_10B_DESTINATIONS.has(route.destination) &&
        isPublishedGuide(route.verificationStatus)
    );

    expect(publishedPhase10bGuides).toEqual([]);
  });

  it('never allows the three pre-audit marketing routes to become publishable', () => {
    const publishedLegacyRouteIds = CURATED_ROUTES.filter((route) =>
      LEGACY_PHASE_10B_ROUTE_IDS.has(route.id)
    )
      .filter((route) => isPublishedGuide(route.verificationStatus))
      .map((route) => route.id);

    expect(publishedLegacyRouteIds).toEqual([]);
  });
});
