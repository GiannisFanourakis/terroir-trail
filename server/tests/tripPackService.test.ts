import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildTripPackFromData,
  type TripPackProducerRow,
} from '../services/tripPackService';
import type { TripWithItems } from '../services/tripService';

const trip: TripWithItems = {
  id: 'trip-1',
  ownerUid: 'alice',
  title: 'Crete <Road Trip>',
  startDate: '2026-10-01',
  endDate: '2026-10-03',
  itemCount: 1,
  revision: 1,
  schemaVersion: 1,
  createdAt: '2026-09-23T00:00:00Z',
  updatedAt: '2026-09-23T00:00:00Z',
  items: [
    {
      producerId: 'producer-1',
      position: 1,
      dayNumber: 2,
      createdAt: '2026-09-23T00:00:00Z',
      updatedAt: '2026-09-23T00:00:00Z',
    },
  ],
};

const producer: TripPackProducerRow = {
  id: 'producer-1',
  name: 'Estate <script>alert(1)</script>',
  category: 'winery',
  destination: 'crete',
  region: 'Heraklion',
  village: 'Archanes',
  locality: 'Archanes',
  phone: '+30 2810 000000',
  website: 'javascript:alert(1)',
  google_maps_url: 'https://maps.example.test/estate',
  opening_hours: 'Call ahead',
  visit_status: 'confirmed_visitable',
  visit_booking_requirement: 'recommended',
  walk_in_status: 'limited',
  parking_status: 'available',
  typical_visit_minutes: 75,
  seasonal_visit_notes: 'Harvest access varies.',
  visitor_languages: ['Greek', 'English'],
  road_access: 'easy',
  road_access_status: 'verified',
  road_access_notes: 'Narrow village approach.',
  visitability_reviewed_at: '2026-09-20T00:00:00Z',
};

test('HTML Trip Pack is printable, escaped and carries trust warnings', () => {
  const pack = buildTripPackFromData(
    trip,
    [producer],
    'html',
    new Date('2026-09-23T12:00:00Z')
  );

  assert.equal(pack.contentType, 'text/html; charset=utf-8');
  assert.match(pack.body, /Crete &lt;Road Trip&gt;/);
  assert.match(pack.body, /Estate &lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(pack.body, /<script>alert\(1\)<\/script>/);
  assert.match(pack.body, /Road access/);
  assert.match(pack.body, />Easy</);
  assert.match(pack.body, /Re-check the live TerroirTrail listing/);
  assert.match(pack.body, /@media print/);
  assert.doesNotMatch(pack.body, /javascript:alert/);
});
test('calendar export assigns saved stops to their trip day', () => {
  const pack = buildTripPackFromData(
    trip,
    [producer],
    'ics',
    new Date('2026-09-23T12:00:00Z')
  );

  assert.equal(pack.contentType, 'text/calendar; charset=utf-8');
  assert.match(pack.body, /BEGIN:VCALENDAR/);
  assert.match(pack.body, /DTSTART;VALUE=DATE:20261001/);
  assert.match(pack.body, /DTSTART;VALUE=DATE:20261002/);
  assert.match(pack.body, /SUMMARY:Estate <script>alert\(1\)<\/script>/);
  assert.match(
    pack.body,
    /Re-check the live TerroirTrail listing before travel/
  );
});

test('calendar export requires a trip start date', () => {
  assert.throws(
    () =>
      buildTripPackFromData(
        { ...trip, startDate: null, endDate: null },
        [producer],
        'ics'
      ),
    /Add a trip start date/
  );
});
