# TerroirTrail — Producer Location Audit Report

> **CRITICAL ARCHITECTURAL NOTICE**: Automated checks do not establish that a coordinate is the correct visitor arrival point. A mathematically valid coordinate, bounding-box clearance, or matching Google Maps pin does not verify visitor gate accessibility or tasting room driveway accuracy. All records must be manually reviewed prior to database mutation.

**Audit Timestamp**: `2026-09-13T09:46:44.537489+00:00`  
**Operational Mode**: Read-Only Live Catalogue Inspection  
**Authority**: Supabase Public REST API (`public.producers`)  

---

## 1. Executive Metrics Summary

| Metric | Count | Percentage |
| :--- | :---: | :---: |
| **Total Live Producers Audited** | **58** | 100.0% |
| Valid Coordinates | 58 | 100.0% |
| Invalid / Missing Coordinates | 0 | 0.0% |
| Exact Duplicate Coordinates (<= 0.5 m) | 0 | 0.0% |
| Near Duplicate Coordinates (0.5 m - 100 m) | 0 | 0.0% |
| Destination Bounding-Box Anomalies | 0 | 0.0% |
| Google Maps Link Matches (<= 50 m) | 58 | 100.0% |
| Google Maps Minor Differences (50 m - 250 m) | 0 | 0.0% |
| Google Maps Mismatches (> 250 m) | 0 | 0.0% |
| Google Maps Missing / Unparseable | 0 | 0.0% |
| Valid Road Access (`paved`, `gravel_ok`, `4x4_required`) | 58 | 100.0% |
| Invalid Road Access | 0 | 0.0% |
| **Producers Passing Automated Checks** | **58** | **100.0%** |
| **Producers Requiring Manual Review** | **0** | **0.0%** |

### Automated Status Distribution

| Status | Count | Meaning |
| :--- | :---: | :--- |
| `PASS_INTERNAL_CHECKS` | 58 | Passes all automated bounding, distance, and road checks |
| `REVIEW_COORDINATES` | 0 | Missing, invalid range, or 0,0 coordinates |
| `REVIEW_DUPLICATE` | 0 | Exact or near-duplicate pin within 100 meters |
| `REVIEW_MAP_LINK` | 0 | Map link coordinate mismatch (> 250 m) or unparseable link |
| `REVIEW_DESTINATION` | 0 | Coordinates fall outside broad regional boundary |
| `REVIEW_MULTIPLE` | 0 | Multiple review categories flagged simultaneously |

---

## 2. Highest-Priority Anomalies

_No highest-priority anomalies detected._

---

## 3. Duplicate and Near-Duplicate Coordinate Groups (Threshold: 100m)

_No exact or near-duplicate coordinates detected._

---

## 4. Google Maps Link Mismatches (> 250m)

_No severe Google Maps link mismatches (> 250m) detected._

---

## 5. Destination Bounding-Box Anomalies

_No destination bounding-box anomalies detected._

---

## 6. Verification and Human Review Guidelines

1. **Review Worksheet**: Open `reports/location-audit/producer_location_audit.csv` in your preferred spreadsheet tool.
2. **Arrival Point Validation**: For every producer requiring review, confirm satellite imagery and road signage.
3. **Fill Manual Fields**: Record `suggested_arrival_lat`, `suggested_arrival_lng`, `suggested_move_distance_m`, and `road_access_review` directly in the CSV review sheet.
4. **Zero Production Mutation**: The audit tool never modifies Supabase, Firestore, or application code. Coordinate updates require an explicit, reviewed migration step.
