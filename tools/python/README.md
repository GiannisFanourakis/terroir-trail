# TerroirTrail — Operational Python Tooling & Location Audit

This directory contains isolated operational data-quality and geospatial verification tooling for TerroirTrail.

> **Operational Tooling Notice**:  
> TypeScript remains the primary application and server runtime (React, Vite, Express, Firebase, Supabase). Python tooling is completely isolated and strictly intended for administrative and data-quality operations. It is not part of the production application runtime or end-user build pipeline.

---

## 1. Producer Location Audit (`producer_location_audit.py`)

A read-only automated audit tool that queries the live Supabase catalogue (`public.producers`) via its public REST API to evaluate coordinate validity, destination sanity, duplicate locations, Google Maps link consistency, and road access ratings.

### Security & Architecture Guardrails
- **Read-Only**: Performs purely HTTP `GET` requests to the PostgREST endpoint. Zero `POST`, `PATCH`, `PUT`, or `DELETE` requests.
- **Unprivileged Credentials**: Uses only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (or `SUPABASE_URL` / `SUPABASE_ANON_KEY`). Never accesses `service_role` or database administrator credentials.
- **Credential Hygiene**: Credentials are read from the environment or local `.env` file without logging, printing, or outputting secrets to disk or terminal.
- **No Automatic Mutations**: Coordinates and database records are never modified or moved automatically.

---

## 2. Anomaly Detection Bounding Boxes

Deliberately broad geographic bounding boxes are defined to detect gross coordinate anomalies (e.g. inverted lat/lng, misplaced country, or regional typos).

| Destination | Latitude Range (N) | Longitude Range (E) | Monitored Area |
| :--- | :---: | :---: | :--- |
| `crete` | 34.5° — 36.0° | 23.3° — 26.5° | Crete mainland & offshore islands (Gavdos, Chrysi, Koufonisi) |
| `santorini` | 36.2° — 36.6° | 25.2° — 25.6° | Santorini archipelago (Thira, Thirassia, Aspronisi) |
| `peloponnese` | 36.2° — 38.6° | 21.0° — 23.6° | Peloponnese peninsula, Argolis, Mani, Messinia |
| `northern_greece` | 39.0° — 42.0° | 19.5° — 26.8° | Macedonia, Thrace, Epirus, Thessaly |
| `tuscany` | 42.0° — 44.8° | 9.5° — 12.6° | Tuscany mainland, Chianti, Val d'Orcia, Elba |

> **IMPORTANT**: These bounding boxes are coarse anomaly detectors, not strict legal or administrative boundaries. An anomaly indicates a need for manual inspection; a coordinate is **never** moved automatically based on bounding-box checks.

---

## 3. Location Analysis Rules

### Coordinate Validity
- Both latitude and longitude must be present, numeric, and finite.
- Range constraints: `-90.0 <= latitude <= 90.0`, `-180.0 <= longitude <= 180.0`.
- Coordinates at `(0.0, 0.0)` are flagged as `ZERO_COORDINATE`.

### Duplicate Analysis (Haversine Formula)
Using spherical Earth radius $R = 6,371,000\text{ m}$:
- **Exact / Effectively Identical Pin**: Distance $\le 0.5\text{ m}$ $\rightarrow$ `DUPLICATE_COORDINATE`.
- **Near Duplicate**: Distance $> 0.5\text{ m}$ and $\le 100.0\text{ m}$ $\rightarrow$ `NEAR_DUPLICATE_COORDINATE`.

### Google Maps Link Consistency
Coordinates extracted from Google Maps URLs (supporting `?q=lat,lng`, `?query=lat,lng`, and `@lat,lng` patterns) are compared against Supabase coordinates:
- $\le 50\text{ m}$: `MAP_LINK_MATCH`
- $> 50\text{ m}$ and $\le 250\text{ m}$: `MAP_LINK_MINOR_DIFFERENCE` (e.g. entrance vs driveway)
- $> 250\text{ m}$: `MAP_LINK_COORDINATE_MISMATCH`
- Missing or malformed: `MAP_LINK_MISSING` / `MAP_LINK_COORDINATE_UNPARSEABLE`

### Road Access Sanity
Valid schema values: `paved`, `gravel_ok`, `4x4_required`. Any other value is flagged as `INVALID_ROAD_ACCESS`.

### Automated Statuses
Each producer receives exactly one high-level status:
- `PASS_INTERNAL_CHECKS`: Passes all mathematical, bounding, proximity, and schema checks.
- `REVIEW_COORDINATES`: Invalid, missing, or zero coordinate.
- `REVIEW_DUPLICATE`: Exact or near duplicate within 100 meters.
- `REVIEW_MAP_LINK`: Google Maps link mismatch (> 250m) or unparseable link.
- `REVIEW_DESTINATION`: Coordinates fall outside regional bounding box.
- `REVIEW_MULTIPLE`: Multiple review categories flagged simultaneously.

> **CRITICAL ARCHITECTURAL RULE**: Never call a producer `VERIFIED` automatically. A mathematically valid coordinate does not prove that it is the correct public visitor entrance or tasting room gate.

---

## 4. Usage

### Prerequisites
- Python 3.11+
- Standard library only (no third-party dependencies required)

### Run Unit Tests
```bash
npm run test:python
# or directly
python -m unittest discover -s tools/python/tests -p "test_*.py"
```

### Run Live Catalogue Location Audit
```bash
npm run audit:locations
# or directly
python tools/python/producer_location_audit.py
```

### Generated Reports
- **CSV Review Worksheet**: `reports/location-audit/producer_location_audit.csv`
- **Markdown Summary**: `reports/location-audit/producer_location_audit.md`
