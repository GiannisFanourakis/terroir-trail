# Phase 15.8B — Trip Intelligence Contract V1

**Status:** implementation contract  
**Date:** 2026-09-23  
**Scope:** Explorer-only route-order intelligence for one assigned trip day, with explicit traveler review.

## 1. Purpose

Trip Intelligence is the next planning layer on top of My Trips. V1 answers one narrow question:

> Given the stops the traveler already assigned to this day, is there a more efficient order that respects explicit traveler constraints?

The feature is a route-order assistant, not an AI itinerary generator. It must remain explainable, reversible, fail-closed, and subordinate to TerroirTrail's producer-truth and safety model.

When an unforeseen scenario is not covered explicitly, implementations must follow these priorities:

1. never invent producer operational facts;
2. never weaken location, visitability, road/access, or publication safeguards;
3. never silently change persisted itinerary state;
4. never let commercial or Partner status influence optimization;
5. preserve the existing trip on routing or optimization failure;
6. prefer a transparent incomplete result over a fabricated complete result.

## 2. System ownership

### Firestore owns traveler trip structure

Existing My Trips remains authoritative for trip ownership, title/dates, producer membership, global order, assigned day, and optimistic revision.

V1 must not duplicate producer facts or route estimates into trip-item records.

### Supabase owns producer truth

Supabase remains authoritative for current producer identity, publication state, coordinates, visitability, booking requirements, road/access evidence, and verified operating facts.

Optimization may consume those facts but must not rewrite or reinterpret them as stronger claims.

### Trusted API owns premium computation

The browser may request optimization and review a proposal, but the trusted server must authenticate the Firebase user, verify ownership, verify active Explorer entitlement, load authoritative trip state, validate producer state/coordinates, call the routing provider, run the optimizer, and return a proposal without mutating the trip.

## 3. V1 product contract

The traveler explicitly selects one assigned day and chooses **Optimize my day**.

V1 considers only producers already assigned to that day. It never adds/removes producers, never changes day membership, never reorders automatically, and requires explicit **Apply suggested order** before persistence.
The proposal must compare current and suggested order and, when available, show estimated driving before/after and estimated saving.

Operational warnings remain separate from routing constraints.

If there is no material improvement, say the current order is already reasonable instead of manufacturing a recommendation.

If fewer than two safely routable stops exist, optimization is unavailable.

## 4. Constraint classes

### Hard constraints

Hard constraints are traveler-controlled or otherwise explicit scheduling facts that the optimizer must respect.

The contract supports:

- locked stop position;
- explicit start location;
- explicit end location;
- traveler-confirmed arrival/appointment time.

Only locked stop position is required for the first implementation. Other fields may remain unsupported/null until their UI and validation exist.

### Operational warnings

Examples include appointment/contact required, seasonal visit status, unknown visitor hours, current access uncertainty, unavailable producer, and location not sufficiently verified for routing.

A warning must never be transformed into an assumed opening window or appointment time.

### Soft objective

V1 has one objective:

`MIN_DRIVE_TIME`

The engine minimizes provider-derived estimated travel time while respecting active hard constraints.

Do not introduce a hidden weighted score combining commercial status, popularity, rating, editorial preference, Partner status, or safety confidence.

Safety/access facts determine eligibility or warnings; they are not optimization ranking boosts.

## 5. Core request contract

```ts
interface OptimizeDayRequestV1 {
  contractVersion: 1;
  tripId: string;
  dayNumber: number;
  expectedRevision: number;
  startLocation?: RoutePointV1 | null;
  endLocation?: RoutePointV1 | null;
  constraints?: TripStopConstraintV1[];
}
```

The client must not send canonical producer coordinates as authority. The server resolves current producer locations from catalogue truth.
Conceptual normalized engine input:

```ts
interface DayOptimizationInputV1 {
  contractVersion: 1;
  tripId: string;
  dayNumber: number;
  tripRevision: number;
  objective: 'MIN_DRIVE_TIME';
  startLocation: RoutePointV1 | null;
  endLocation: RoutePointV1 | null;
  stops: OptimizationStopV1[];
}

interface OptimizationStopV1 {
  producerId: string;
  coordinates: [number, number];
  lockedPosition: number | null;
  confirmedArrivalTime: string | null;
  earliestArrival: string | null;
  latestArrival: string | null;
  visitDurationMinutes: number | null;
  visitDurationSource: VisitDurationSourceV1 | null;
}
```

Future-shaped fields may be null in V1. Their presence does not authorize inference.

## 6. Visit-duration provenance

Visit duration is separate from route ordering.

Allowed provenance vocabulary:

- `producer_verified_duration`
- `experience_duration`
- `category_default_estimate`
- `traveler_override`

A category default is always presented as an estimate. Unknown duration remains null until the Estimated Day Timeline phase explicitly defines fallback behavior.

## 7. Routing-provider abstraction

Routing is isolated behind a provider-neutral server interface.

```ts
interface RouteMatrixProvider {
  getMatrix(input: RouteMatrixRequestV1): Promise<RouteMatrixV1>;
}
```

The provider adapter owns authentication, request batching/limits, coordinate formatting, transport mode, timeout/retry policy, error normalization, and required attribution/licensing metadata.

The optimizer must not call a vendor directly. React must never contain privileged routing credentials.

## 8. Route-matrix rules

- Use only server-resolved verified producer coordinates.
- Never substitute village centroids or guessed coordinates.
- Never use straight-line distance as if it were driving time.
- A missing/unroutable leg is unresolved, not zero travel time.
- Route estimates must be labeled as estimates.
- Road/access truth remains separately displayed.
- A provider returning a route does not prove rental-car suitability or safe final access.

## 9. Optimization engine abstraction

```ts
interface DayOptimizationEngine {
  optimize(
    input: DayOptimizationInputV1,
    matrix: RouteMatrixV1
  ): OptimizationProposalV1;
}
```

Initial engine identity: `ts-v1`.

V1 may use exhaustive or bounded combinatorial search appropriate to the validated small stop count.

The frontend must not depend on engine implementation. A later `ortools-v2` or Python service may replace it without changing the traveler review/apply flow.

## 10. Proposal contract

```ts
interface OptimizationProposalV1 {
  contractVersion: 1;
  proposalId: string;
  tripId: string;
  dayNumber: number;
  basedOnRevision: number;
  originalOrder: string[];
  proposedOrder: string[];
  estimatedDriveMinutesBefore: number | null;
  estimatedDriveMinutesAfter: number | null;
  estimatedMinutesSaved: number | null;
  estimatedDistanceKmBefore: number | null;
  estimatedDistanceKmAfter: number | null;
  warnings: OptimizationWarningV1[];
  unresolvedConstraints: string[];
  routingProvider: string;
  engineVersion: string;
  generatedAt: string;
}
```

The proposal is ephemeral computation, not authoritative trip state. V1 does not need to persist proposals in Firestore.

## 11. Review and Apply semantics

Proposal generation is read-only.

Applying a proposal must:

1. require explicit **Apply suggested order**;
2. require the same trip ownership;
3. require `basedOnRevision` to still match current trip revision;
4. preserve all producers not belonging to the optimized day;
5. preserve every item's existing day assignment;
6. reorder only the selected day's relative sequence;
7. reuse the existing atomic revision-safe reorder semantics, or a narrowly extended equivalent;
8. increment trip revision exactly once.

If the trip changed after proposal generation, Apply returns conflict and requires recomputation/review.

**Keep my order** performs no mutation.

## 12. Persistence after Explorer expiry

Once an optimized order is explicitly applied, it becomes ordinary traveler-owned trip structure.

Explorer expiry must not restore the old order, hide/delete the trip, or invalidate already-downloaded outputs. Running a new premium computation requires an active entitlement.

## 13. Failure semantics

Optimization must fail closed without modifying the itinerary.

Stable error classes should include:

- `explorer_pass_required`
- `bad_request`
- `trip_conflict`
- `insufficient_stops`
- `producer_unavailable`
- `location_unverified`
- `route_unavailable`
- `no_feasible_solution`
- `service_unavailable`

Traveler-facing routing failure:

> We couldn't reliably calculate this day's route. Your existing trip has not been changed.

No meaningful improvement:

> Your current stop order is already reasonable based on the available route estimates.

Never silently drop a stop to obtain a feasible result.

## 14. Start/end locations and privacy

The contract permits start/end points so later versions can support accommodation or a chosen meeting point.

V1 must not require live GPS.

If a traveler later provides a private accommodation/start point:

- use it only for the requested routing computation;
- do not add exact coordinates/address to behavioral analytics;
- do not expose it to producers;
- do not treat it as catalogue data;
- define retention separately before persistent storage is introduced.

A producer may be a start/end point via canonical producer ID and server-resolved coordinates.

## 15. Analytics boundary

Trip Intelligence analytics must remain aggregate and privacy-safe.

Potential future events include optimization requested, proposal produced, optimization applied, kept/rejected, and route calculation failed.

Do not send trip ID/title/dates, day number, producer sequence, private coordinates, accommodation address, exact itinerary times, or user-entered appointment details.

The Phase 14 event contract must be explicitly extended before these events are enabled.

## 16. Commercial neutrality

Partner/commercial status must never affect route-matrix eligibility, optimization order, estimated timeline, nearby-alert eligibility, access/safety treatment, operational warnings, or Navigate Next Stop.

Paid placement remains a separate labeled surface.

## 17. V1 complexity boundary

The first implementation supports a normal small single-day itinerary and rejects inputs beyond its validated computational bound.

The exact stop limit is an implementation constant covered by tests.

Do not add Python infrastructure merely to increase theoretical capacity. This contract intentionally allows a future Python/OR-Tools engine when multi-day/time-window complexity justifies it.

## 18. Estimated Day Timeline dependency

The later timeline consumes this architecture without changing it.

Timeline inputs may include day start, accepted/current stop order, provider travel-time estimates, visit-duration values with provenance, and confirmed traveler constraints.

Opening hours or availability may constrain a schedule only when explicitly verified and represented with provenance.

## 19. Navigate Next Stop dependency

Navigate Next Stop is a handoff action, not TerroirTrail turn-by-turn navigation.

It uses the current next stop with a verified navigation point, hands off to the traveler's mapping app, preserves existing road/access warnings, and fails closed for unresolved/blocked navigation states.

## 20. Nearby / Passing-By dependency

Passing-By alerts are deliberately later than Optimize My Day.

They should consume route geometry/detour information where available rather than simple straight-line proximity.

Initial Journey Mode may be foreground/active-app only. Do not promise closed-app background alerts until native/platform capability is deliberately implemented and verified.

## 21. Test contract

Before production launch, automated tests must cover ownership/authentication, Explorer entitlement, day scoping, locked stops, unchanged membership/day assignments, deterministic optimization for fixed matrices, no-improvement behavior, missing/unverified coordinates, unreachable edges, stale Apply, no mutation on proposal failure/Keep, commercial neutrality, and phone/iPad/desktop review/apply behavior.

## 22. Implementation sequence

1. Freeze this contract.
2. Choose and document the route/travel-time provider.
3. Implement provider-neutral route-matrix types and adapter boundary.
4. Implement `ts-v1` optimizer with deterministic tests.
5. Add trusted Explorer-only proposal endpoint.
6. Add review UI in `TripWorkspace`.
7. Add revision-safe Apply behavior.
8. Extend analytics contract only if/when measurement is activated.
9. Run full quality gate and responsive browser regression.
10. Deploy and production-verify before starting Estimated Day Timeline.

## 23. Deliberately deferred

Not part of Optimize My Day V1:

- automatic itinerary mutation;
- automatic producer additions/removals;
- cross-day rebalancing;
- multi-day optimization;
- inferred opening hours or booking availability;
- live reservation inventory;
- mandatory live GPS;
- closed-app background proximity alerts;
- collaborative optimization;
- paid/Partner ranking influence;
- Python/OR-Tools production service.

These require deliberate later contracts or version increments.
