import { describe, expect, it } from 'vitest';
import { CURATED_ROUTES } from './loops';
import { PHASE10B_DISCOVERY_GUIDES } from './phase10bGuides';

const PHASE_10B_DESTINATIONS = new Set(['peloponnese', 'northern_greece', 'tuscany']);
const LEGACY_PHASE_10B_ROUTE_IDS = new Set([
  'peloponnese-mythic-trail',
  'northern-greece-royal-trail',
  'tuscany-chianti-classico-trail',
]);

const isPublishedGuide = (verificationStatus: string | undefined) =>
  verificationStatus === 'verified_stops' || verificationStatus === 'verified';

describe('Phase 10B route quarantine', () => {
  it('publishes only the rebuilt audited Phase 10B discovery guides', () => {
    const publishedPhase10bGuides = CURATED_ROUTES.filter(
      (route) =>
        PHASE_10B_DESTINATIONS.has(route.destination) &&
        isPublishedGuide(route.verificationStatus)
    );

    expect(publishedPhase10bGuides.map((route) => route.id)).toEqual(
      PHASE10B_DISCOVERY_GUIDES.map((route) => route.id)
    );
  });

  it('removes the three pre-audit marketing routes rather than upgrading them', () => {
    const legacyRouteIds = CURATED_ROUTES.filter((route) =>
      LEGACY_PHASE_10B_ROUTE_IDS.has(route.id)
    ).map((route) => route.id);

    expect(legacyRouteIds).toEqual([]);
  });
});
