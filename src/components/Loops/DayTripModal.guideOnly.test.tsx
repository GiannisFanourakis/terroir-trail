import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CURATED_ROUTES } from '../../data/loops';
import { CRETAN_PRODUCERS } from '../../data/producers';
import { evaluateRouteNavigation } from '../../utils/routeSafety';
import { DayTripModal } from './DayTripModal';

const publishedCreteRoutes = CURATED_ROUTES.filter(
  (route) =>
    route.destination === 'crete' &&
    (route.verificationStatus === 'verified_stops' ||
      route.verificationStatus === 'verified')
);

const usableVisitStatuses = new Set([
  'public_visits',
  'seasonal_public',
  'appointment_only',
]);

describe('Phase 9 published Crete route guides', () => {
  it('uses only current producers with verified locations and usable visit status', () => {
    expect(publishedCreteRoutes.length).toBeGreaterThanOrEqual(3);

    for (const route of publishedCreteRoutes) {
      expect(route.stops.length).toBeGreaterThanOrEqual(2);

      for (const stop of route.stops) {
        const producer = CRETAN_PRODUCERS.find(
          (candidate) => candidate.id === stop.producerId
        );

        expect(producer, `${route.id}: missing ${stop.producerId}`).toBeDefined();

        expect(
          ['verified_location', 'verified_entrance'],
          `${route.id}: ${stop.producerId} location`
        ).toContain(producer?.locationStatus);

        expect(
          usableVisitStatuses.has(producer?.visitStatus || ''),
          `${route.id}: ${stop.producerId} visit status`
        ).toBe(true);
      }
    }
  });

  it('keeps stop-verified guides fail-closed for multi-stop driving navigation', () => {
    const guideOnlyRoutes = publishedCreteRoutes.filter(
      (route) => route.verificationStatus === 'verified_stops'
    );

    expect(guideOnlyRoutes.length).toBeGreaterThanOrEqual(3);

    for (const route of guideOnlyRoutes) {
      const evaluation = evaluateRouteNavigation(route, CRETAN_PRODUCERS);

      expect(evaluation.isSafe).toBe(false);
      expect(evaluation.url).toBeUndefined();
      expect(
        evaluation.issues.some((issue) => issue.code === 'route_not_verified')
      ).toBe(true);

      expect(route.drivingDistance.toLowerCase()).not.toContain('paved');
    }
  });

  it('renders every published guide without exposing multi-stop Google navigation', () => {
    for (const route of publishedCreteRoutes) {
      const html = renderToString(
        React.createElement(DayTripModal, {
          isOpen: true,
          onClose: () => {},
          onSelectLoop: () => {},
          onSelectProducer: () => {},
          producers: CRETAN_PRODUCERS,
          loops: [route],
        })
      );

      expect(html).toContain(route.title.replace('&', '&amp;'));

      if (route.verificationStatus === 'verified_stops') {
        expect(html).toContain('Stop locations verified');
        expect(html).toContain('Driving navigation withheld');
        expect(html).toContain('Open location');
        expect(html).not.toContain('Open in Google Maps');
      }
    }
  });

  it('contains no legacy missing producer references in the published guides', () => {
    const ids = publishedCreteRoutes.flatMap((route) =>
      route.stops.map((stop) => stop.producerId)
    );

    expect(ids).not.toContain('peza-artisanal-olive-mill');
    expect(ids).not.toContain('kazani-kokolakis');
    expect(ids).not.toContain('paraschakis-olive-mill');
  });

  it('keeps the Rethymno guide draft until its remaining access evidence is sufficient', () => {
    const route = CURATED_ROUTES.find(
      (candidate) => candidate.id === 'rethymno-mountain-cheese-mill-trail'
    );

    expect(route).toBeDefined();
    expect(route?.verificationStatus).toBe('draft');
    expect(route?.stops.map((stop) => stop.producerId)).toEqual([
      'parasiris-olive-mill',
      'tzourmpakis-dairy-amari',
    ]);

    const publishedIds = publishedCreteRoutes.map((candidate) => candidate.id);
    expect(publishedIds).not.toContain('rethymno-mountain-cheese-mill-trail');

    const allCreteStopIds = CURATED_ROUTES
      .filter((candidate) => candidate.destination === 'crete')
      .flatMap((candidate) => candidate.stops.map((stop) => stop.producerId));

    expect(allCreteStopIds).not.toContain('paraschakis-olive-mill');
    expect(route?.drivingDistance.toLowerCase()).not.toContain('paved');
  });


  it('resolves published route stops even when the current UI producer list is filtered', () => {
    const route = CURATED_ROUTES.find(
      (candidate) => candidate.id === 'chania-craft-beer-olive-trail'
    );

    expect(route).toBeDefined();

    const unrelatedProducer = CRETAN_PRODUCERS.find(
      (producer) => producer.id === 'kasta-brewery'
    );

    expect(unrelatedProducer).toBeDefined();

    const html = renderToString(
      React.createElement(DayTripModal, {
        isOpen: true,
        onClose: () => {},
        onSelectLoop: () => {},
        onSelectProducer: () => {},
        producers: [unrelatedProducer!],
        loops: [route!],
      })
    );

    expect(html).toContain('Biolea Astrikas Estate');
    expect(html).toContain('Cretan Brewery (Charma Beer)');
    expect(html).toContain('Manousakis Winery');
    expect(html).not.toContain('is no longer present in the verified producer catalogue');
  });

});
