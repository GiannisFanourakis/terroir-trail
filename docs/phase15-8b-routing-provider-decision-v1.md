# Phase 15.8B — Routing Provider Decision V1

**Status:** accepted implementation decision  
**Date:** 2026-09-23  
**Chosen V1 provider:** Mapbox Matrix API using the `mapbox/driving` profile.

## 1. Decision

Use Mapbox Matrix API as the first production route-matrix provider behind TerroirTrail's provider-neutral `RouteMatrixProvider` abstraction.

Do not couple the optimizer, React UI, trip persistence, or analytics contract to Mapbox-specific response shapes.

Google Routes remains a viable future adapter if empirical rural-route validation or commercial requirements justify a switch.

## 2. Why Mapbox for V1

The current public Matrix API supports up to 25 coordinates and a 625-element matrix for the standard driving profile, which is comfortably above the intended small single-day V1 scope.

The API can return both travel duration and route distance. Unroutable pairs are returned as null unless an explicit fallback speed is requested.

TerroirTrail must not use fallback-speed substitution because straight-line estimates must never masquerade as routed driving time.
Current public pricing reviewed on 2026-09-23 provides a substantially larger free Matrix tier than Google Compute Route Matrix for an early-stage product, while both bill matrix usage by origin-destination elements.

This decision is not based on a claim that Mapbox is universally more accurate. Rural Greece and other TerroirTrail regions must be empirically validated before launch.

## 3. V1 request policy

Use:

- profile: `mapbox/driving`;
- annotations: `duration,distance`;
- all relevant coordinates as sources and destinations;
- server-side access token only;
- provider timeout and normalized error handling;
- no traffic profile in V1;
- no fallback speed;
- no inferred or substituted coordinates.

Do not use `mapbox/driving-traffic` in V1. Traffic introduces time sensitivity, lower matrix coordinate limits, and less deterministic comparisons without solving the core itinerary-order problem.

## 4. Security and privacy

The Mapbox token is a server secret and must not be exposed through Vite/client environment variables.

V1 sends only producer catalogue coordinates to the matrix provider.
Private traveler start/end coordinates are not part of the first release.

If private accommodation/start points are introduced later, their provider disclosure, retention, privacy wording, and analytics exclusion must be reviewed before implementation.

No trip title, Firebase UID, email, producer Partner status, private note, or other traveler identity field is sent to the routing provider.

## 5. Fail-closed behavior

For any matrix element that is missing, null, malformed, or provider-failed:

- do not substitute straight-line distance;
- do not assume zero duration;
- do not silently remove a stop;
- do not apply a partial itinerary;
- return a normalized route-unavailable result when the required optimization graph is incomplete.

The traveler's existing trip remains unchanged.

## 6. Provider-neutral normalization

Mapbox responses must be converted immediately into TerroirTrail-owned structures.

Conceptually:

```ts
interface RouteMatrixV1 {
  pointIds: string[];
  durationsSeconds: Array<Array<number | null>>;
  distancesMeters: Array<Array<number | null>>;
  provider: 'mapbox';
  profile: 'driving';
  generatedAt: string;
}
```

The optimizer consumes only normalized `RouteMatrixV1`; it must not know Mapbox request URLs, token handling, or raw response fields.

## 7. Future provider swap

A later provider can replace Mapbox when justified by measured evidence such as:

- materially better rural road coverage in target regions;
- pricing at actual TerroirTrail scale;
- required route constraints not available in the current provider;
- reliability/latency evidence;
- contractual or regional requirements.

A provider change must not require changes to Firestore trip records or the traveler-facing review/apply contract.

## 8. Production validation gate

Before enabling Optimize My Day publicly:

1. test a representative rural route sample in Crete and at least two non-Greek regions;
2. compare returned legs against manually reviewed plausible road routes;
3. confirm unresolved/isolated coordinates fail closed;
4. verify no route result is treated as road-safety or rental-car evidence;
5. verify Matrix API quota/cost alerts are configured;
6. verify the server secret is absent from client bundles;
7. run phone, iPad, and desktop optimization regression.

Passing API tests alone is not sufficient evidence of rural routing quality.
