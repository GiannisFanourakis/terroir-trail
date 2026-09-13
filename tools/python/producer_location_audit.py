#!/usr/bin/env python3
"""TerroirTrail — Automated Producer Location Audit.

Operational data-quality and geospatial tooling for TerroirTrail.
Performs read-only validation of live Supabase producer coordinates,
destination bounding boxes, duplicate/near-duplicate detection via Haversine,
Google Maps URL consistency, and road access sanity.

Standard library only. No external runtime dependencies.
"""

import argparse
import csv
import datetime
import json
import math
import os
import pathlib
import re
import sys
import urllib.parse
import urllib.request
from typing import Any, Dict, List, Optional, Set, Tuple

# Earth radius in meters for WGS84 spherical calculations
EARTH_RADIUS_METERS: float = 6371000.0

# Broad geographic bounding boxes for anomaly detection (not legal truth boundaries)
DESTINATION_BOUNDS: Dict[str, Dict[str, float]] = {
    'crete': {
        'min_lat': 34.5,
        'max_lat': 36.0,
        'min_lng': 23.3,
        'max_lng': 26.5,
    },
    'santorini': {
        'min_lat': 36.2,
        'max_lat': 36.6,
        'min_lng': 25.2,
        'max_lng': 25.6,
    },
    'peloponnese': {
        'min_lat': 36.2,
        'max_lat': 38.6,
        'min_lng': 21.0,
        'max_lng': 23.6,
    },
    'northern_greece': {
        'min_lat': 39.0,
        'max_lat': 42.0,
        'min_lng': 19.5,
        'max_lng': 26.8,
    },
    'tuscany': {
        'min_lat': 42.0,
        'max_lat': 44.8,
        'min_lng': 9.5,
        'max_lng': 12.6,
    },
}

VALID_ROAD_ACCESS: Set[str] = {'paved', 'gravel_ok', '4x4_required'}

# Canonical issue code sort order for deterministic reporting
ISSUE_CODE_ORDER: List[str] = [
    'MISSING_COORDINATE',
    'INVALID_LATITUDE',
    'INVALID_LONGITUDE',
    'ZERO_COORDINATE',
    'OUTSIDE_DESTINATION_BOUNDS',
    'DUPLICATE_COORDINATE',
    'NEAR_DUPLICATE_COORDINATE',
    'MAP_LINK_COORDINATE_MISMATCH',
    'MAP_LINK_COORDINATE_UNPARSEABLE',
    'MAP_LINK_MISSING',
    'INVALID_ROAD_ACCESS',
]

CSV_COLUMNS: List[str] = [
    'producer_id',
    'name',
    'category',
    'destination',
    'country_code',
    'region',
    'village',
    'current_lat',
    'current_lng',
    'road_access',
    'website',
    'google_maps_url',
    'coordinate_valid',
    'destination_bounds_ok',
    'google_maps_coordinate_lat',
    'google_maps_coordinate_lng',
    'google_maps_distance_m',
    'google_maps_status',
    'nearest_other_producer_id',
    'nearest_other_producer_distance_m',
    'near_duplicate_ids',
    'issue_codes',
    'automated_status',
    'manual_verification_status',
    'suggested_arrival_lat',
    'suggested_arrival_lng',
    'suggested_move_distance_m',
    'evidence_url_1',
    'evidence_url_2',
    'arrival_point_notes',
    'road_access_review',
    'reviewer_notes',
]


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates the great-circle distance between two points in meters using the Haversine formula."""
    if lat1 == lat2 and lon1 == lon2:
        return 0.0

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    # Numerical stability clamp
    a = min(1.0, max(0.0, a))
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return EARTH_RADIUS_METERS * c


def validate_coordinates(
    lat_raw: Any, lng_raw: Any
) -> Tuple[bool, Optional[float], Optional[float], List[str]]:
    """Validates latitude and longitude values.

    Returns:
        (is_valid, lat_float, lng_float, issues)
    """
    issues: List[str] = []

    if lat_raw is None or str(lat_raw).strip() == '':
        issues.append('MISSING_COORDINATE')
    if lng_raw is None or str(lng_raw).strip() == '' and 'MISSING_COORDINATE' not in issues:
        issues.append('MISSING_COORDINATE')

    if issues:
        return False, None, None, issues

    lat_val: Optional[float] = None
    lng_val: Optional[float] = None

    try:
        lat_val = float(lat_raw)
    except (ValueError, TypeError):
        issues.append('INVALID_LATITUDE')

    try:
        lng_val = float(lng_raw)
    except (ValueError, TypeError):
        issues.append('INVALID_LONGITUDE')

    if issues:
        return False, None, None, issues

    # Range checks
    assert lat_val is not None
    assert lng_val is not None

    if math.isnan(lat_val) or math.isinf(lat_val) or lat_val < -90.0 or lat_val > 90.0:
        issues.append('INVALID_LATITUDE')

    if math.isnan(lng_val) or math.isinf(lng_val) or lng_val < -180.0 or lng_val > 180.0:
        issues.append('INVALID_LONGITUDE')

    # Zero coordinate check (0.0, 0.0 null island check)
    if not issues and lat_val == 0.0 and lng_val == 0.0:
        issues.append('ZERO_COORDINATE')

    is_valid = len(issues) == 0
    return is_valid, (lat_val if is_valid else None), (lng_val if is_valid else None), issues


def check_destination_bounds(
    destination: Optional[str], lat: Optional[float], lng: Optional[float]
) -> Tuple[bool, List[str]]:
    """Checks if coordinates fall within deliberately broad destination bounding boxes.

    Returns:
        (bounds_ok, issues)
    """
    if lat is None or lng is None:
        return False, []

    dest_key = (destination or '').strip().lower()
    if dest_key in DESTINATION_BOUNDS:
        b = DESTINATION_BOUNDS[dest_key]
        if b['min_lat'] <= lat <= b['max_lat'] and b['min_lng'] <= lng <= b['max_lng']:
            return True, []
        return False, ['OUTSIDE_DESTINATION_BOUNDS']

    # Unknown or unmonitored destination outside defined bounds
    return False, ['OUTSIDE_DESTINATION_BOUNDS']


def parse_google_maps_url(url: Optional[str]) -> Tuple[Optional[float], Optional[float], str]:
    """Extracts latitude and longitude from common Google Maps URL structures.

    Supported patterns:
        - ?q=lat,lng
        - ?query=lat,lng
        - ?ll=lat,lng
        - ?destination=lat,lng
        - @lat,lng
        - /place/.../lat,lng

    Returns:
        (lat, lng, status_code) where status_code is 'PARSED', 'MAP_LINK_MISSING',
        or 'MAP_LINK_COORDINATE_UNPARSEABLE'.
    """
    if not url or not url.strip():
        return None, None, 'MAP_LINK_MISSING'

    raw_url = url.strip()
    coord_pattern = re.compile(r'(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)')

    try:
        parsed = urllib.parse.urlparse(raw_url)
        qs = urllib.parse.parse_qs(parsed.query)

        # 1. Check common query parameters
        for param in ('q', 'query', 'll', 'destination'):
            if param in qs and qs[param]:
                match = coord_pattern.search(qs[param][0])
                if match:
                    lat = float(match.group(1))
                    lng = float(match.group(2))
                    if -90.0 <= lat <= 90.0 and -180.0 <= lng <= 180.0:
                        return lat, lng, 'PARSED'

        # 2. Check '@lat,lng' syntax in URL path/fragment
        at_pattern = re.compile(r'@(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)')
        at_match = at_pattern.search(raw_url)
        if at_match:
            lat = float(at_match.group(1))
            lng = float(at_match.group(2))
            if -90.0 <= lat <= 90.0 and -180.0 <= lng <= 180.0:
                return lat, lng, 'PARSED'

        # 3. Check generic coordinate in path
        path_match = coord_pattern.search(parsed.path)
        if path_match:
            lat = float(path_match.group(1))
            lng = float(path_match.group(2))
            if -90.0 <= lat <= 90.0 and -180.0 <= lng <= 180.0:
                return lat, lng, 'PARSED'

    except Exception:
        pass

    return None, None, 'MAP_LINK_COORDINATE_UNPARSEABLE'


def evaluate_google_maps_link(
    url: Optional[str], sup_lat: Optional[float], sup_lng: Optional[float]
) -> Tuple[Optional[float], Optional[float], Optional[float], str, List[str]]:
    """Compares Supabase coordinates against Google Maps URL coordinates.

    Thresholds:
        <= 50 m:       MAP_LINK_MATCH
        > 50 <= 250 m: MAP_LINK_MINOR_DIFFERENCE
        > 250 m:       MAP_LINK_COORDINATE_MISMATCH
        missing:       MAP_LINK_MISSING
        unparseable:   MAP_LINK_COORDINATE_UNPARSEABLE

    Returns:
        (map_lat, map_lng, distance_m, google_maps_status, issues)
    """
    map_lat, map_lng, parse_status = parse_google_maps_url(url)

    if parse_status == 'MAP_LINK_MISSING':
        return None, None, None, 'MAP_LINK_MISSING', ['MAP_LINK_MISSING']

    if parse_status == 'MAP_LINK_COORDINATE_UNPARSEABLE':
        return None, None, None, 'MAP_LINK_COORDINATE_UNPARSEABLE', ['MAP_LINK_COORDINATE_UNPARSEABLE']

    # Successfully parsed
    if sup_lat is None or sup_lng is None:
        return map_lat, map_lng, None, 'MAP_LINK_COORDINATE_MISMATCH', ['MAP_LINK_COORDINATE_MISMATCH']

    dist_m = haversine_distance(sup_lat, sup_lng, map_lat, map_lng)
    dist_rounded = round(dist_m, 1)

    if dist_m <= 50.0:
        return map_lat, map_lng, dist_rounded, 'MAP_LINK_MATCH', []
    elif dist_m <= 250.0:
        return map_lat, map_lng, dist_rounded, 'MAP_LINK_MINOR_DIFFERENCE', []
    else:
        return map_lat, map_lng, dist_rounded, 'MAP_LINK_COORDINATE_MISMATCH', ['MAP_LINK_COORDINATE_MISMATCH']


def validate_road_access(road_access: Optional[str]) -> Tuple[bool, List[str]]:
    """Validates road access parameter against known schema constraints."""
    val = (road_access or '').strip().lower()
    if val in VALID_ROAD_ACCESS:
        return True, []
    return False, ['INVALID_ROAD_ACCESS']


def analyze_duplicates(
    producers_records: List[Dict[str, Any]], threshold_m: float = 100.0
) -> Dict[str, Dict[str, Any]]:
    """Performs Haversine pairwise distance analysis across all valid producers.

    Identifies:
        - nearest_other_producer_id
        - nearest_other_producer_distance_m
        - near_duplicate_ids (producers within threshold_m)
        - exact duplicates (distance <= 0.5 m) -> DUPLICATE_COORDINATE
        - near duplicates (0.5 m < distance <= threshold_m) -> NEAR_DUPLICATE_COORDINATE

    Returns:
        Mapping of producer_id to duplicate analysis dictionary.
    """
    results: Dict[str, Dict[str, Any]] = {}

    # Pre-filter producers with valid float coordinates
    valid_points: List[Tuple[str, float, float]] = []
    for p in producers_records:
        pid = str(p.get('id', ''))
        lat = p.get('_validated_lat')
        lng = p.get('_validated_lng')
        if lat is not None and lng is not None:
            valid_points.append((pid, lat, lng))

    for p in producers_records:
        pid = str(p.get('id', ''))
        lat = p.get('_validated_lat')
        lng = p.get('_validated_lng')

        if lat is None or lng is None:
            results[pid] = {
                'nearest_id': '',
                'nearest_dist_m': None,
                'near_dup_ids': [],
                'issues': [],
            }
            continue

        min_dist: Optional[float] = None
        min_id = ''
        near_dup_ids: List[str] = []
        has_exact_dup = False
        has_near_dup = False

        for other_id, o_lat, o_lng in valid_points:
            if other_id == pid:
                continue

            dist = haversine_distance(lat, lng, o_lat, o_lng)

            if min_dist is None or dist < min_dist:
                min_dist = dist
                min_id = other_id

            if dist <= threshold_m:
                near_dup_ids.append(other_id)
                if dist <= 0.5:
                    has_exact_dup = True
                else:
                    has_near_dup = True

        issues: List[str] = []
        if has_exact_dup:
            issues.append('DUPLICATE_COORDINATE')
        if has_near_dup:
            issues.append('NEAR_DUPLICATE_COORDINATE')

        near_dup_ids.sort()

        results[pid] = {
            'nearest_id': min_id,
            'nearest_dist_m': round(min_dist, 1) if min_dist is not None else None,
            'near_dup_ids': near_dup_ids,
            'issues': issues,
        }

    return results


def sort_issue_codes(issues: List[str]) -> List[str]:
    """Sorts issue codes deterministically according to ISSUE_CODE_ORDER."""
    unique_issues = list(set(issues))

    def sort_key(code: str) -> int:
        if code in ISSUE_CODE_ORDER:
            return ISSUE_CODE_ORDER.index(code)
        return len(ISSUE_CODE_ORDER)

    return sorted(unique_issues, key=sort_key)


def compute_automated_status(issues: List[str]) -> str:
    """Computes single high-level automated status from issue codes.

    Categories:
        - PASS_INTERNAL_CHECKS
        - REVIEW_COORDINATES
        - REVIEW_DUPLICATE
        - REVIEW_MAP_LINK
        - REVIEW_DESTINATION
        - REVIEW_MULTIPLE
    """
    if not issues:
        return 'PASS_INTERNAL_CHECKS'

    coord_issues = {'MISSING_COORDINATE', 'INVALID_LATITUDE', 'INVALID_LONGITUDE', 'ZERO_COORDINATE'}
    dup_issues = {'DUPLICATE_COORDINATE', 'NEAR_DUPLICATE_COORDINATE'}
    dest_issues = {'OUTSIDE_DESTINATION_BOUNDS'}
    map_issues = {'MAP_LINK_COORDINATE_MISMATCH', 'MAP_LINK_COORDINATE_UNPARSEABLE', 'MAP_LINK_MISSING'}
    road_issues = {'INVALID_ROAD_ACCESS'}

    categories: Set[str] = set()
    for issue in issues:
        if issue in coord_issues:
            categories.add('COORDINATES')
        elif issue in dup_issues:
            categories.add('DUPLICATE')
        elif issue in dest_issues:
            categories.add('DESTINATION')
        elif issue in map_issues:
            categories.add('MAP_LINK')
        elif issue in road_issues:
            categories.add('ROAD_ACCESS')
        else:
            categories.add('OTHER')

    if len(categories) > 1:
        return 'REVIEW_MULTIPLE'
    if 'COORDINATES' in categories:
        return 'REVIEW_COORDINATES'
    if 'DUPLICATE' in categories:
        return 'REVIEW_DUPLICATE'
    if 'DESTINATION' in categories:
        return 'REVIEW_DESTINATION'
    if 'MAP_LINK' in categories:
        return 'REVIEW_MAP_LINK'

    # Any single non-geo issue category (e.g. invalid road access alone)
    return 'REVIEW_MULTIPLE'


def run_audit(
    producers_records: List[Dict[str, Any]], duplicate_threshold_m: float = 100.0
) -> List[Dict[str, Any]]:
    """Performs full audit on a list of raw producer records.

    Returns audit row dictionaries sorted deterministically:
    review-required first, then destination, then producer name.
    """
    # Step 1: Pre-validation of individual coordinates
    for p in producers_records:
        coord_valid, lat_f, lng_f, coord_issues = validate_coordinates(
            p.get('lat'), p.get('lng')
        )
        p['_coord_valid'] = coord_valid
        p['_validated_lat'] = lat_f
        p['_validated_lng'] = lng_f
        p['_coord_issues'] = coord_issues

    # Step 2: Pairwise duplicate analysis
    dup_results = analyze_duplicates(producers_records, threshold_m=duplicate_threshold_m)

    audit_rows: List[Dict[str, Any]] = []

    # Step 3: Run comprehensive checks per producer
    for p in producers_records:
        pid = str(p.get('id', ''))
        name = str(p.get('name', ''))
        category = str(p.get('category', ''))
        destination = str(p.get('destination', ''))
        country_code = str(
            p.get('country_code')
            or ('IT' if destination == 'tuscany' else 'GR')
        )
        region = str(p.get('region', ''))
        village = str(p.get('village', ''))
        road_access = str(p.get('road_access', ''))
        website = str(p.get('website', '') or '')
        google_maps_url = str(p.get('google_maps_url', '') or '')

        coord_valid = p['_coord_valid']
        lat_f = p['_validated_lat']
        lng_f = p['_validated_lng']
        coord_issues = p['_coord_issues']

        # Destination bounds check
        bounds_ok, dest_issues = check_destination_bounds(destination, lat_f, lng_f)

        # Google Maps URL check
        map_lat, map_lng, map_dist, map_status, map_issues = evaluate_google_maps_link(
            google_maps_url, lat_f, lng_f
        )

        # Road access check
        road_ok, road_issues = validate_road_access(road_access)

        # Duplicate results
        dup_data = dup_results.get(
            pid,
            {'nearest_id': '', 'nearest_dist_m': None, 'near_dup_ids': [], 'issues': []},
        )
        dup_issues = dup_data['issues']

        # Aggregate all issues deterministically
        all_issues = coord_issues + dest_issues + dup_issues + map_issues + road_issues
        sorted_issues = sort_issue_codes(all_issues)
        automated_status = compute_automated_status(sorted_issues)

        # Raw display coordinates
        current_lat_str = str(p.get('lat', ''))
        current_lng_str = str(p.get('lng', ''))

        row = {
            'producer_id': pid,
            'name': name,
            'category': category,
            'destination': destination,
            'country_code': country_code,
            'region': region,
            'village': village,
            'current_lat': current_lat_str,
            'current_lng': current_lng_str,
            'road_access': road_access,
            'website': website,
            'google_maps_url': google_maps_url,
            'coordinate_valid': 'true' if coord_valid else 'false',
            'destination_bounds_ok': 'true' if bounds_ok else 'false',
            'google_maps_coordinate_lat': f'{map_lat:.6f}' if map_lat is not None else '',
            'google_maps_coordinate_lng': f'{map_lng:.6f}' if map_lng is not None else '',
            'google_maps_distance_m': f'{map_dist:.1f}' if map_dist is not None else '',
            'google_maps_status': map_status,
            'nearest_other_producer_id': dup_data['nearest_id'],
            'nearest_other_producer_distance_m': (
                f"{dup_data['nearest_dist_m']:.1f}"
                if dup_data['nearest_dist_m'] is not None
                else ''
            ),
            'near_duplicate_ids': ', '.join(dup_data['near_dup_ids']),
            'issue_codes': '; '.join(sorted_issues),
            'automated_status': automated_status,
            # Manual review fields intentionally blank
            'manual_verification_status': '',
            'suggested_arrival_lat': '',
            'suggested_arrival_lng': '',
            'suggested_move_distance_m': '',
            'evidence_url_1': '',
            'evidence_url_2': '',
            'arrival_point_notes': '',
            'road_access_review': '',
            'reviewer_notes': '',
        }
        audit_rows.append(row)

    # Sort deterministically: review-required first, then destination, then name
    def row_sort_key(r: Dict[str, Any]) -> Tuple[int, str, str, str]:
        review_priority = 0 if r['automated_status'] != 'PASS_INTERNAL_CHECKS' else 1
        return (
            review_priority,
            r['destination'].lower(),
            r['name'].lower(),
            r['producer_id'].lower(),
        )

    audit_rows.sort(key=row_sort_key)
    return audit_rows


def write_csv_report(audit_rows: List[Dict[str, Any]], output_path: pathlib.Path) -> None:
    """Writes audit rows to CSV report worksheet."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=CSV_COLUMNS)
        writer.writeheader()
        for row in audit_rows:
            writer.writerow(row)


def generate_markdown_report(
    audit_rows: List[Dict[str, Any]], output_path: pathlib.Path, timestamp_iso: str
) -> None:
    """Generates comprehensive Markdown summary report."""
    output_path.parent.mkdir(parents=True, exist_ok=True)

    total_producers = len(audit_rows)
    valid_coords = sum(1 for r in audit_rows if r['coordinate_valid'] == 'true')
    invalid_coords = total_producers - valid_coords

    exact_dup_count = sum(1 for r in audit_rows if 'DUPLICATE_COORDINATE' in r['issue_codes'])
    near_dup_count = sum(1 for r in audit_rows if 'NEAR_DUPLICATE_COORDINATE' in r['issue_codes'])
    dest_anomalies = sum(1 for r in audit_rows if r['destination_bounds_ok'] == 'false')

    maps_matches = sum(1 for r in audit_rows if r['google_maps_status'] == 'MAP_LINK_MATCH')
    maps_minor = sum(1 for r in audit_rows if r['google_maps_status'] == 'MAP_LINK_MINOR_DIFFERENCE')
    maps_mismatches = sum(1 for r in audit_rows if r['google_maps_status'] == 'MAP_LINK_COORDINATE_MISMATCH')
    maps_missing_unparseable = sum(
        1
        for r in audit_rows
        if r['google_maps_status'] in ('MAP_LINK_MISSING', 'MAP_LINK_COORDINATE_UNPARSEABLE')
    )

    valid_road = sum(1 for r in audit_rows if 'INVALID_ROAD_ACCESS' not in r['issue_codes'])
    invalid_road = total_producers - valid_road

    pass_checks = sum(1 for r in audit_rows if r['automated_status'] == 'PASS_INTERNAL_CHECKS')
    review_required = total_producers - pass_checks

    status_breakdown: Dict[str, int] = {}
    for r in audit_rows:
        status_breakdown[r['automated_status']] = status_breakdown.get(r['automated_status'], 0) + 1

    # Tables data
    highest_priority_anomalies = [
        r
        for r in audit_rows
        if (
            r['coordinate_valid'] == 'false'
            or 'ZERO_COORDINATE' in r['issue_codes']
            or r['google_maps_status'] == 'MAP_LINK_COORDINATE_MISMATCH'
            or r['destination_bounds_ok'] == 'false'
        )
    ]

    duplicates_table = [
        r
        for r in audit_rows
        if 'DUPLICATE_COORDINATE' in r['issue_codes'] or 'NEAR_DUPLICATE_COORDINATE' in r['issue_codes']
    ]

    map_mismatch_table = [
        r for r in audit_rows if r['google_maps_status'] == 'MAP_LINK_COORDINATE_MISMATCH'
    ]

    dest_anomaly_table = [
        r for r in audit_rows if r['destination_bounds_ok'] == 'false'
    ]

    md_lines: List[str] = [
        '# TerroirTrail — Producer Location Audit Report',
        '',
        '> **CRITICAL ARCHITECTURAL NOTICE**: Automated checks do not establish that a coordinate is the correct visitor arrival point. A mathematically valid coordinate, bounding-box clearance, or matching Google Maps pin does not verify visitor gate accessibility or tasting room driveway accuracy. All records must be manually reviewed prior to database mutation.',
        '',
        f'**Audit Timestamp**: `{timestamp_iso}`  ',
        '**Operational Mode**: Read-Only Live Catalogue Inspection  ',
        '**Authority**: Supabase Public REST API (`public.producers`)  ',
        '',
        '---',
        '',
        '## 1. Executive Metrics Summary',
        '',
        '| Metric | Count | Percentage |',
        '| :--- | :---: | :---: |',
        f'| **Total Live Producers Audited** | **{total_producers}** | 100.0% |',
        f'| Valid Coordinates | {valid_coords} | {(valid_coords/total_producers*100) if total_producers else 0:.1f}% |',
        f'| Invalid / Missing Coordinates | {invalid_coords} | {(invalid_coords/total_producers*100) if total_producers else 0:.1f}% |',
        f'| Exact Duplicate Coordinates (<= 0.5 m) | {exact_dup_count} | {(exact_dup_count/total_producers*100) if total_producers else 0:.1f}% |',
        f'| Near Duplicate Coordinates (0.5 m - 100 m) | {near_dup_count} | {(near_dup_count/total_producers*100) if total_producers else 0:.1f}% |',
        f'| Destination Bounding-Box Anomalies | {dest_anomalies} | {(dest_anomalies/total_producers*100) if total_producers else 0:.1f}% |',
        f'| Google Maps Link Matches (<= 50 m) | {maps_matches} | {(maps_matches/total_producers*100) if total_producers else 0:.1f}% |',
        f'| Google Maps Minor Differences (50 m - 250 m) | {maps_minor} | {(maps_minor/total_producers*100) if total_producers else 0:.1f}% |',
        f'| Google Maps Mismatches (> 250 m) | {maps_mismatches} | {(maps_mismatches/total_producers*100) if total_producers else 0:.1f}% |',
        f'| Google Maps Missing / Unparseable | {maps_missing_unparseable} | {(maps_missing_unparseable/total_producers*100) if total_producers else 0:.1f}% |',
        f'| Valid Road Access (`paved`, `gravel_ok`, `4x4_required`) | {valid_road} | {(valid_road/total_producers*100) if total_producers else 0:.1f}% |',
        f'| Invalid Road Access | {invalid_road} | {(invalid_road/total_producers*100) if total_producers else 0:.1f}% |',
        f'| **Producers Passing Automated Checks** | **{pass_checks}** | **{(pass_checks/total_producers*100) if total_producers else 0:.1f}%** |',
        f'| **Producers Requiring Manual Review** | **{review_required}** | **{(review_required/total_producers*100) if total_producers else 0:.1f}%** |',
        '',
        '### Automated Status Distribution',
        '',
        '| Status | Count | Meaning |',
        '| :--- | :---: | :--- |',
        f'| `PASS_INTERNAL_CHECKS` | {status_breakdown.get("PASS_INTERNAL_CHECKS", 0)} | Passes all automated bounding, distance, and road checks |',
        f'| `REVIEW_COORDINATES` | {status_breakdown.get("REVIEW_COORDINATES", 0)} | Missing, invalid range, or 0,0 coordinates |',
        f'| `REVIEW_DUPLICATE` | {status_breakdown.get("REVIEW_DUPLICATE", 0)} | Exact or near-duplicate pin within 100 meters |',
        f'| `REVIEW_MAP_LINK` | {status_breakdown.get("REVIEW_MAP_LINK", 0)} | Map link coordinate mismatch (> 250 m) or unparseable link |',
        f'| `REVIEW_DESTINATION` | {status_breakdown.get("REVIEW_DESTINATION", 0)} | Coordinates fall outside broad regional boundary |',
        f'| `REVIEW_MULTIPLE` | {status_breakdown.get("REVIEW_MULTIPLE", 0)} | Multiple review categories flagged simultaneously |',
        '',
        '---',
        '',
        '## 2. Highest-Priority Anomalies',
        '',
    ]

    if not highest_priority_anomalies:
        md_lines.append('_No highest-priority anomalies detected._\n')
    else:
        md_lines.extend([
            '| Producer ID | Name | Destination | Coordinates | Issue Codes | Status |',
            '| :--- | :--- | :--- | :--- | :--- | :--- |',
        ])
        for r in highest_priority_anomalies:
            coords = f"`({r['current_lat']}, {r['current_lng']})`"
            md_lines.append(
                f"| `{r['producer_id']}` | {r['name']} | {r['destination']} | {coords} | `{r['issue_codes']}` | `{r['automated_status']}` |"
            )
        md_lines.append('')

    md_lines.extend([
        '---',
        '',
        '## 3. Duplicate and Near-Duplicate Coordinate Groups (Threshold: 100m)',
        '',
    ])

    if not duplicates_table:
        md_lines.append('_No exact or near-duplicate coordinates detected._\n')
    else:
        md_lines.extend([
            '| Producer ID | Name | Nearest Producer ID | Distance (m) | Near-Duplicate IDs | Status |',
            '| :--- | :--- | :--- | :---: | :--- | :--- |',
        ])
        for r in duplicates_table:
            md_lines.append(
                f"| `{r['producer_id']}` | {r['name']} | `{r['nearest_other_producer_id']}` | {r['nearest_other_producer_distance_m']} | `{r['near_duplicate_ids']}` | `{r['automated_status']}` |"
            )
        md_lines.append('')

    md_lines.extend([
        '---',
        '',
        '## 4. Google Maps Link Mismatches (> 250m)',
        '',
    ])

    if not map_mismatch_table:
        md_lines.append('_No severe Google Maps link mismatches (> 250m) detected._\n')
    else:
        md_lines.extend([
            '| Producer ID | Name | Supabase Coordinates | Maps URL Coordinates | Distance (m) | Status |',
            '| :--- | :--- | :--- | :--- | :---: | :--- |',
        ])
        for r in map_mismatch_table:
            sup_coords = f"`({r['current_lat']}, {r['current_lng']})`"
            map_coords = f"`({r['google_maps_coordinate_lat']}, {r['google_maps_coordinate_lng']})`"
            md_lines.append(
                f"| `{r['producer_id']}` | {r['name']} | {sup_coords} | {map_coords} | {r['google_maps_distance_m']} | `{r['automated_status']}` |"
            )
        md_lines.append('')

    md_lines.extend([
        '---',
        '',
        '## 5. Destination Bounding-Box Anomalies',
        '',
    ])

    if not dest_anomaly_table:
        md_lines.append('_No destination bounding-box anomalies detected._\n')
    else:
        md_lines.extend([
            '| Producer ID | Name | Destination | Coordinates | Issue Codes | Status |',
            '| :--- | :--- | :--- | :--- | :--- | :--- |',
        ])
        for r in dest_anomaly_table:
            coords = f"`({r['current_lat']}, {r['current_lng']})`"
            md_lines.append(
                f"| `{r['producer_id']}` | {r['name']} | {r['destination']} | {coords} | `{r['issue_codes']}` | `{r['automated_status']}` |"
            )
        md_lines.append('')

    md_lines.extend([
        '---',
        '',
        '## 6. Verification and Human Review Guidelines',
        '',
        '1. **Review Worksheet**: Open `reports/location-audit/producer_location_audit.csv` in your preferred spreadsheet tool.',
        '2. **Arrival Point Validation**: For every producer requiring review, confirm satellite imagery and road signage.',
        '3. **Fill Manual Fields**: Record `suggested_arrival_lat`, `suggested_arrival_lng`, `suggested_move_distance_m`, and `road_access_review` directly in the CSV review sheet.',
        '4. **Zero Production Mutation**: The audit tool never modifies Supabase, Firestore, or application code. Coordinate updates require an explicit, reviewed migration step.',
        '',
    ])

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(md_lines))


def resolve_supabase_credentials(
    env_file_path: Optional[pathlib.Path] = None,
) -> Tuple[Optional[str], Optional[str]]:
    """Safely extracts Supabase URL and Anon Key from environment or env file.

    Never prints or dumps keys.
    """
    url = os.environ.get('VITE_SUPABASE_URL') or os.environ.get('SUPABASE_URL')
    key = os.environ.get('VITE_SUPABASE_ANON_KEY') or os.environ.get('SUPABASE_ANON_KEY')

    if url and key:
        return url.strip(), key.strip()

    search_files: List[pathlib.Path] = []
    if env_file_path:
        search_files.append(env_file_path)
    else:
        repo_root = pathlib.Path(__file__).resolve().parent.parent.parent
        search_files.extend([repo_root / '.env.local', repo_root / '.env'])

    for path in search_files:
        if path.is_file():
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    for line in f:
                        line = line.strip()
                        if not line or line.startswith('#') or '=' not in line:
                            continue
                        k, v = line.split('=', 1)
                        k = k.strip()
                        v = v.strip().strip('\'"')
                        if k in ('VITE_SUPABASE_URL', 'SUPABASE_URL') and not url:
                            url = v
                        elif k in ('VITE_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY') and not key:
                            key = v
            except Exception:
                pass

        if url and key:
            break

    return (url.strip() if url else None), (key.strip() if key else None)


def fetch_live_producers(url: str, anon_key: str) -> List[Dict[str, Any]]:
    """Performs read-only HTTP GET to Supabase REST endpoint public.producers.

    Never uses service_role, database passwords, or privileged credentials.
    Fails clearly if Supabase cannot be reached.
    """
    endpoint = f"{url.rstrip('/')}/rest/v1/producers?select=*"
    req = urllib.request.Request(
        endpoint,
        headers={
            'apikey': anon_key,
            'Authorization': f'Bearer {anon_key}',
            'Range': '0-999',
            'User-Agent': 'TerroirTrail-Producer-Location-Audit/1.0',
        },
        method='GET',
    )

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            if resp.status != 200 and resp.status != 206:
                raise RuntimeError(f'HTTP {resp.status}')
            data = json.loads(resp.read().decode('utf-8'))
            if not isinstance(data, list):
                raise ValueError('Response is not a list of producers')
            return data
    except Exception as e:
        sys.stderr.write(f'Live Supabase catalogue unavailable; audit not run. ({e})\n')
        sys.exit(1)


def main() -> None:
    parser = argparse.ArgumentParser(
        description='TerroirTrail — Automated Producer Location Audit'
    )
    parser.add_argument(
        '--output-csv',
        type=pathlib.Path,
        default=pathlib.Path('reports/location-audit/producer_location_audit.csv'),
        help='Output path for CSV review worksheet',
    )
    parser.add_argument(
        '--output-md',
        type=pathlib.Path,
        default=pathlib.Path('reports/location-audit/producer_location_audit.md'),
        help='Output path for Markdown summary report',
    )
    parser.add_argument(
        '--duplicate-threshold',
        type=float,
        default=100.0,
        help='Duplicate proximity threshold in meters (default: 100.0)',
    )
    parser.add_argument(
        '--env-file',
        type=pathlib.Path,
        default=None,
        help='Custom .env path for Supabase credentials',
    )
    parser.add_argument(
        '--input-json',
        type=pathlib.Path,
        default=None,
        help='Offline synthetic or cached JSON file (bypasses live Supabase fetch)',
    )

    args = parser.parse_args()

    timestamp_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

    if args.input_json:
        if not args.input_json.is_file():
            sys.stderr.write(f'Input JSON file not found: {args.input_json}\n')
            sys.exit(1)
        with open(args.input_json, 'r', encoding='utf-8') as f:
            producers = json.load(f)
        print(f'Loaded {len(producers)} producers from offline JSON: {args.input_json}')
    else:
        url, key = resolve_supabase_credentials(args.env_file)
        if not url or not key:
            sys.stderr.write('Live Supabase catalogue unavailable; audit not run.\n')
            sys.exit(1)

        print(f'Fetching authoritative live catalogue from Supabase: {url.split("://")[-1].split("/")[0]}')
        producers = fetch_live_producers(url, key)
        print(f'Live producers fetched successfully: {len(producers)}')

    audit_rows = run_audit(producers, duplicate_threshold_m=args.duplicate_threshold)

    # Write reports
    write_csv_report(audit_rows, args.output_csv)
    generate_markdown_report(audit_rows, args.output_md, timestamp_iso)

    # Output executive summary to stdout
    total = len(audit_rows)
    passes = sum(1 for r in audit_rows if r['automated_status'] == 'PASS_INTERNAL_CHECKS')
    reviews = total - passes
    exact_dups = sum(1 for r in audit_rows if 'DUPLICATE_COORDINATE' in r['issue_codes'])
    near_dups = sum(1 for r in audit_rows if 'NEAR_DUPLICATE_COORDINATE' in r['issue_codes'])
    dest_anomalies = sum(1 for r in audit_rows if r['destination_bounds_ok'] == 'false')
    map_mismatches = sum(1 for r in audit_rows if r['google_maps_status'] == 'MAP_LINK_COORDINATE_MISMATCH')
    unparseable_maps = sum(
        1
        for r in audit_rows
        if r['google_maps_status'] in ('MAP_LINK_MISSING', 'MAP_LINK_COORDINATE_UNPARSEABLE')
    )
    invalid_coords = sum(1 for r in audit_rows if r['coordinate_valid'] == 'false')
    invalid_roads = sum(1 for r in audit_rows if 'INVALID_ROAD_ACCESS' in r['issue_codes'])

    print('\n=======================================================')
    print('TERROIRTRAIL PRODUCER LOCATION AUDIT SUMMARY')
    print('=======================================================')
    print(f'Total Live Producers Audited:  {total}')
    print(f'Invalid Coordinates:           {invalid_coords}')
    print(f'Exact Duplicates (<= 0.5m):    {exact_dups}')
    print(f'Near Duplicates (<= 100m):     {near_dups}')
    print(f'Destination Anomalies:         {dest_anomalies}')
    print(f'Map Link Mismatches (> 250m):  {map_mismatches}')
    print(f'Missing/Unparseable Map Links: {unparseable_maps}')
    print(f'Invalid Road Access:           {invalid_roads}')
    print(f'PASS_INTERNAL_CHECKS:          {passes}')
    print(f'Review Required:               {reviews}')
    print('-------------------------------------------------------')
    print(f'CSV Worksheet: {args.output_csv}')
    print(f'Markdown Summary: {args.output_md}')
    print('=======================================================\n')


if __name__ == '__main__':
    main()
