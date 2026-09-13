"""Unit tests for TerroirTrail producer location audit tooling.

Network-free tests using purely synthetic data.
Covers:
- valid coordinate
- invalid latitude
- invalid longitude
- 0,0 (zero coordinate)
- missing coordinate
- destination outside bounds
- Haversine distance
- exact duplicate
- near duplicate
- maps ?q=lat,lng
- maps ?query=lat,lng
- maps @lat,lng
- malformed Maps URL
- missing Maps URL
- <= 50 m match
- 50–250 m difference
- > 250 m mismatch
- valid road access
- invalid road access
- deterministic issue ordering
- automated status calculation
- end-to-end synthetic audit run
"""

import unittest
from tools.python.producer_location_audit import (
    haversine_distance,
    validate_coordinates,
    check_destination_bounds,
    parse_google_maps_url,
    evaluate_google_maps_link,
    validate_road_access,
    analyze_duplicates,
    sort_issue_codes,
    compute_automated_status,
    run_audit,
    DESTINATION_BOUNDS,
    ISSUE_CODE_ORDER,
)


class TestProducerLocationAudit(unittest.TestCase):

    def test_valid_coordinate(self):
        valid, lat, lng, issues = validate_coordinates(35.338, 25.144)
        self.assertTrue(valid)
        self.assertAlmostEqual(lat, 35.338)
        self.assertAlmostEqual(lng, 25.144)
        self.assertEqual(issues, [])

    def test_invalid_latitude(self):
        # Out of range positive
        valid, lat, lng, issues = validate_coordinates(95.0, 25.0)
        self.assertFalse(valid)
        self.assertIn('INVALID_LATITUDE', issues)

        # Out of range negative
        valid, lat, lng, issues = validate_coordinates(-91.0, 25.0)
        self.assertFalse(valid)
        self.assertIn('INVALID_LATITUDE', issues)

        # Non-numeric
        valid, lat, lng, issues = validate_coordinates('invalid_lat', 25.0)
        self.assertFalse(valid)
        self.assertIn('INVALID_LATITUDE', issues)

    def test_invalid_longitude(self):
        # Out of range positive
        valid, lat, lng, issues = validate_coordinates(35.0, 185.0)
        self.assertFalse(valid)
        self.assertIn('INVALID_LONGITUDE', issues)

        # Out of range negative
        valid, lat, lng, issues = validate_coordinates(35.0, -181.0)
        self.assertFalse(valid)
        self.assertIn('INVALID_LONGITUDE', issues)

        # Non-numeric
        valid, lat, lng, issues = validate_coordinates(35.0, 'bad_lng')
        self.assertFalse(valid)
        self.assertIn('INVALID_LONGITUDE', issues)

    def test_zero_coordinate(self):
        valid, lat, lng, issues = validate_coordinates(0.0, 0.0)
        self.assertFalse(valid)
        self.assertIn('ZERO_COORDINATE', issues)

        # Non-zero single coordinate is not a ZERO_COORDINATE
        valid2, lat2, lng2, issues2 = validate_coordinates(0.0, 25.0)
        self.assertTrue(valid2)
        self.assertNotIn('ZERO_COORDINATE', issues2)

    def test_missing_coordinate(self):
        valid, lat, lng, issues = validate_coordinates(None, 25.0)
        self.assertFalse(valid)
        self.assertIn('MISSING_COORDINATE', issues)

        valid, lat, lng, issues = validate_coordinates('', '')
        self.assertFalse(valid)
        self.assertIn('MISSING_COORDINATE', issues)

    def test_destination_within_bounds(self):
        # Crete point
        ok, issues = check_destination_bounds('crete', 35.3, 24.5)
        self.assertTrue(ok)
        self.assertEqual(issues, [])

        # Santorini point
        ok, issues = check_destination_bounds('santorini', 36.4, 25.4)
        self.assertTrue(ok)
        self.assertEqual(issues, [])

        # Tuscany point
        ok, issues = check_destination_bounds('tuscany', 43.5, 11.3)
        self.assertTrue(ok)
        self.assertEqual(issues, [])

    def test_destination_outside_bounds(self):
        # Coordinates in Crete, but destination declared as Tuscany
        ok, issues = check_destination_bounds('tuscany', 35.3, 24.5)
        self.assertFalse(ok)
        self.assertIn('OUTSIDE_DESTINATION_BOUNDS', issues)

        # Unknown destination
        ok, issues = check_destination_bounds('unknown_region', 35.3, 24.5)
        self.assertFalse(ok)
        self.assertIn('OUTSIDE_DESTINATION_BOUNDS', issues)

    def test_haversine_distance(self):
        # Identical coordinates
        self.assertEqual(haversine_distance(35.0, 25.0, 35.0, 25.0), 0.0)

        # 1 degree of latitude is roughly 111.19 km (111,195 m)
        dist = haversine_distance(35.0, 25.0, 36.0, 25.0)
        self.assertGreater(dist, 110000.0)
        self.assertLess(dist, 112000.0)

    def test_exact_duplicate(self):
        producers = [
            {
                'id': 'p1',
                '_validated_lat': 35.3,
                '_validated_lng': 24.5,
            },
            {
                'id': 'p2',
                '_validated_lat': 35.3,
                '_validated_lng': 24.5,
            },
        ]
        results = analyze_duplicates(producers, threshold_m=100.0)
        self.assertIn('DUPLICATE_COORDINATE', results['p1']['issues'])
        self.assertIn('DUPLICATE_COORDINATE', results['p2']['issues'])
        self.assertEqual(results['p1']['nearest_id'], 'p2')
        self.assertEqual(results['p1']['nearest_dist_m'], 0.0)
        self.assertIn('p2', results['p1']['near_dup_ids'])

    def test_near_duplicate(self):
        # 35.3000 to 35.3003 is ~33.3 meters
        lat1, lng1 = 35.3000, 24.5000
        lat2, lng2 = 35.3003, 24.5000
        d = haversine_distance(lat1, lng1, lat2, lng2)
        self.assertGreater(d, 10.0)
        self.assertLess(d, 50.0)

        producers = [
            {'id': 'p1', '_validated_lat': lat1, '_validated_lng': lng1},
            {'id': 'p2', '_validated_lat': lat2, '_validated_lng': lng2},
        ]
        results = analyze_duplicates(producers, threshold_m=100.0)
        self.assertIn('NEAR_DUPLICATE_COORDINATE', results['p1']['issues'])
        self.assertNotIn('DUPLICATE_COORDINATE', results['p1']['issues'])
        self.assertEqual(results['p1']['nearest_id'], 'p2')
        self.assertIn('p2', results['p1']['near_dup_ids'])

    def test_maps_q_param(self):
        url = 'https://maps.google.com/?q=35.4785,23.8320'
        lat, lng, status = parse_google_maps_url(url)
        self.assertEqual(status, 'PARSED')
        self.assertAlmostEqual(lat, 35.4785)
        self.assertAlmostEqual(lng, 23.8320)

    def test_maps_query_param(self):
        url = 'https://www.google.com/maps/search/?api=1&query=36.3985,25.4520'
        lat, lng, status = parse_google_maps_url(url)
        self.assertEqual(status, 'PARSED')
        self.assertAlmostEqual(lat, 36.3985)
        self.assertAlmostEqual(lng, 25.4520)

    def test_maps_at_syntax(self):
        url = 'https://www.google.com/maps/place/Some+Estate/@37.721,22.684,17z/data=...'
        lat, lng, status = parse_google_maps_url(url)
        self.assertEqual(status, 'PARSED')
        self.assertAlmostEqual(lat, 37.721)
        self.assertAlmostEqual(lng, 22.684)

    def test_malformed_maps_url(self):
        url = 'https://maps.google.com/search?q=not_a_coordinate'
        lat, lng, status = parse_google_maps_url(url)
        self.assertIsNone(lat)
        self.assertIsNone(lng)
        self.assertEqual(status, 'MAP_LINK_COORDINATE_UNPARSEABLE')

    def test_missing_maps_url(self):
        lat, lng, status = parse_google_maps_url('')
        self.assertEqual(status, 'MAP_LINK_MISSING')
        lat, lng, status = parse_google_maps_url(None)
        self.assertEqual(status, 'MAP_LINK_MISSING')

    def test_maps_match_within_50m(self):
        # Coordinates ~20m apart
        url = 'https://maps.google.com/?q=35.4785,23.8320'
        # slightly offset (~15m offset)
        sup_lat, sup_lng = 35.4786, 23.8321
        lat, lng, dist, status, issues = evaluate_google_maps_link(url, sup_lat, sup_lng)
        self.assertEqual(status, 'MAP_LINK_MATCH')
        self.assertEqual(issues, [])
        self.assertLessEqual(dist, 50.0)

    def test_maps_minor_difference_50_to_250m(self):
        # Coordinates ~100m apart
        # 0.0009 deg lat is ~100m
        url = 'https://maps.google.com/?q=35.4780,23.8320'
        sup_lat, sup_lng = 35.4789, 23.8320
        lat, lng, dist, status, issues = evaluate_google_maps_link(url, sup_lat, sup_lng)
        self.assertEqual(status, 'MAP_LINK_MINOR_DIFFERENCE')
        self.assertEqual(issues, [])
        self.assertGreater(dist, 50.0)
        self.assertLessEqual(dist, 250.0)

    def test_maps_mismatch_over_250m(self):
        # Coordinates ~1 km apart
        url = 'https://maps.google.com/?q=35.4780,23.8320'
        sup_lat, sup_lng = 35.4880, 23.8320
        lat, lng, dist, status, issues = evaluate_google_maps_link(url, sup_lat, sup_lng)
        self.assertEqual(status, 'MAP_LINK_COORDINATE_MISMATCH')
        self.assertIn('MAP_LINK_COORDINATE_MISMATCH', issues)
        self.assertGreater(dist, 250.0)

    def test_valid_road_access(self):
        for road in ('paved', 'gravel_ok', '4x4_required', 'PAVED', '  gravel_ok  '):
            ok, issues = validate_road_access(road)
            self.assertTrue(ok)
            self.assertEqual(issues, [])

    def test_invalid_road_access(self):
        for bad_road in ('asphalt', 'dirt_road', '', None, 'highway'):
            ok, issues = validate_road_access(bad_road)
            self.assertFalse(ok)
            self.assertIn('INVALID_ROAD_ACCESS', issues)

    def test_deterministic_issue_ordering(self):
        raw_issues = [
            'INVALID_ROAD_ACCESS',
            'DUPLICATE_COORDINATE',
            'MISSING_COORDINATE',
            'OUTSIDE_DESTINATION_BOUNDS',
            'MAP_LINK_COORDINATE_MISMATCH',
        ]
        sorted_issues = sort_issue_codes(raw_issues)
        expected = [
            'MISSING_COORDINATE',
            'OUTSIDE_DESTINATION_BOUNDS',
            'DUPLICATE_COORDINATE',
            'MAP_LINK_COORDINATE_MISMATCH',
            'INVALID_ROAD_ACCESS',
        ]
        self.assertEqual(sorted_issues, expected)

    def test_compute_automated_status(self):
        # Clean record
        self.assertEqual(compute_automated_status([]), 'PASS_INTERNAL_CHECKS')

        # Single category cases
        self.assertEqual(
            compute_automated_status(['INVALID_LATITUDE']), 'REVIEW_COORDINATES'
        )
        self.assertEqual(
            compute_automated_status(['DUPLICATE_COORDINATE']), 'REVIEW_DUPLICATE'
        )
        self.assertEqual(
            compute_automated_status(['NEAR_DUPLICATE_COORDINATE']), 'REVIEW_DUPLICATE'
        )
        self.assertEqual(
            compute_automated_status(['OUTSIDE_DESTINATION_BOUNDS']), 'REVIEW_DESTINATION'
        )
        self.assertEqual(
            compute_automated_status(['MAP_LINK_COORDINATE_MISMATCH']), 'REVIEW_MAP_LINK'
        )

        # Multiple categories
        self.assertEqual(
            compute_automated_status(['OUTSIDE_DESTINATION_BOUNDS', 'MAP_LINK_COORDINATE_MISMATCH']),
            'REVIEW_MULTIPLE',
        )
        self.assertEqual(
            compute_automated_status(['INVALID_LATITUDE', 'DUPLICATE_COORDINATE']),
            'REVIEW_MULTIPLE',
        )

    def test_full_synthetic_audit_pipeline(self):
        synthetic_producers = [
            # 1. Clean producer
            {
                'id': 'clean-producer',
                'name': 'Clean Estate',
                'category': 'winery',
                'destination': 'crete',
                'country_code': 'GR',
                'region': 'Heraklion',
                'village': 'Archanes',
                'lat': 35.234,
                'lng': 25.161,
                'road_access': 'paved',
                'website': 'https://clean-estate.gr',
                'google_maps_url': 'https://maps.google.com/?q=35.2340,25.1610',
            },
            # 2. Destination anomaly
            {
                'id': 'anomaly-dest',
                'name': 'Misplaced Estate',
                'category': 'winery',
                'destination': 'tuscany',
                'country_code': 'IT',
                'region': 'Tuscany',
                'village': 'Greve',
                'lat': 35.234,  # Inside Crete, not Tuscany
                'lng': 25.161,
                'road_access': 'paved',
                'website': '',
                'google_maps_url': 'https://maps.google.com/?q=35.2340,25.1610',
            },
            # 3. Exact duplicate of clean-producer
            {
                'id': 'duplicate-producer',
                'name': 'Duplicate Estate',
                'category': 'kazani',
                'destination': 'crete',
                'country_code': 'GR',
                'region': 'Heraklion',
                'village': 'Archanes',
                'lat': 35.234,
                'lng': 25.161,
                'road_access': 'paved',
                'website': '',
                'google_maps_url': 'https://maps.google.com/?q=35.2340,25.1610',
            },
            # 4. Map link mismatch (>250m)
            {
                'id': 'mismatch-map',
                'name': 'Mismatch Estate',
                'category': 'olive_mill',
                'destination': 'peloponnese',
                'country_code': 'GR',
                'region': 'Messinia',
                'village': 'Kalamata',
                'lat': 37.042,
                'lng': 22.114,
                'road_access': 'paved',
                'website': '',
                'google_maps_url': 'https://maps.google.com/?q=37.0700,22.1140',  # ~3 km away
            },
        ]

        results = run_audit(synthetic_producers)
        self.assertEqual(len(results), 4)

        # Verify review-required records are sorted before PASS_INTERNAL_CHECKS
        # (Clean producer shares coordinates with duplicate-producer so clean also gets REVIEW_DUPLICATE!)
        for r in results:
            self.assertIn('automated_status', r)
            self.assertIn('issue_codes', r)
            self.assertEqual(r['manual_verification_status'], '')

        res_by_id = {r['producer_id']: r for r in results}
        self.assertIn('DUPLICATE_COORDINATE', res_by_id['duplicate-producer']['issue_codes'])
        self.assertIn('OUTSIDE_DESTINATION_BOUNDS', res_by_id['anomaly-dest']['issue_codes'])
        self.assertEqual(res_by_id['mismatch-map']['google_maps_status'], 'MAP_LINK_COORDINATE_MISMATCH')


if __name__ == '__main__':
    unittest.main()
