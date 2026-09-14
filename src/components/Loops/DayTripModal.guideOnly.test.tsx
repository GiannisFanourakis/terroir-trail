import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CURATED_ROUTES } from '../../data/loops';
import { CRETAN_PRODUCERS } from '../../data/producers';
import { evaluateRouteNavigation } from '../../utils/routeSafety';
import { DayTripModal } from './DayTripModal';

describe('Phase 9 stop-verified route guide', () => {
  it('publishes the Western Chania guide while withholding multi-stop driving navigation', () => {
    const route = CURATED_ROUTES.find(
      (candidate) => candidate.id === 'chania-craft-beer-olive-trail'
    );

    expect(route).toBeDefined();
    expect(route?.verificationStatus).toBe('verified_stops');
    expect(route?.stops).toHaveLength(3);

    const stopProducers = route!.stops.map((stop) =>
      CRETAN_PRODUCERS.find((producer) => producer.id === stop.producerId)
    );

    expect(stopProducers.every(Boolean)).toBe(true);

    for (const producer of stopProducers) {
      expect(['verified_location', 'verified_entrance']).toContain(
        producer?.locationStatus
      );
    }

    const evaluation = evaluateRouteNavigation(route!, CRETAN_PRODUCERS);

    expect(evaluation.isSafe).toBe(false);
    expect(evaluation.url).toBeUndefined();
    expect(evaluation.issues.some((issue) => issue.code === 'route_not_verified')).toBe(true);
    expect(
      evaluation.issues.some((issue) => issue.code === 'road_access_not_confirmed')
    ).toBe(true);

    const html = renderToString(
      React.createElement(DayTripModal, {
        isOpen: true,
        onClose: () => {},
        onSelectLoop: () => {},
        onSelectProducer: () => {},
        producers: CRETAN_PRODUCERS,
        loops: [route!],
      })
    );

    expect(html).toContain('Western Chania: Olive Oil, Craft Beer &amp; Wine');
    expect(html).toContain('Stop locations verified');
    expect(html).toContain('Driving navigation withheld');
    expect(html).toContain('Open location');
    expect(html).toContain('Start with first stop');
    expect(html).not.toContain('Open in Google Maps');
    expect(html).not.toContain('All paved');
  });
});
