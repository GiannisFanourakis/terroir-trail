# Phase 14.5 — My Trips Domain Contract V1

**Status:** implementation contract  
**Date:** 2026-09-21  
**Scope:** account-owned trip planning only. No route optimisation, booking, payments, inferred travel times, inferred opening hours, or private-note analytics.

## 1. Purpose

My Trips is the missing planning layer between Saved places and the Terroir Passport. It must preserve TerroirTrail's trust model while remaining useful when catalogue facts change.

This contract defines the V1 data model, invariants, failure behaviour, producer lifecycle handling, privacy boundary, account lifecycle, concurrency rules, analytics semantics, practical limits, and expected behaviour for all material scenario classes identified before implementation.

When an unforeseen scenario is not covered explicitly, implementations must follow these priorities in order:

1. do not expose another traveler's data;
2. do not resurrect a producer that is no longer publicly listable;
3. do not invent or cache stale producer operational facts inside trip data;
4. do not lose user-owned trip structure silently;
5. fail closed on unverified producer additions or privileged mutations;
6. preserve recoverability where doing so does not violate privacy or producer opt-out.

## 2. System ownership

### Firestore owns traveler trip state

Trip state is account-owned private data.

```text
users/{uid}/trips/{tripId}
users/{uid}/trips/{tripId}/items/{producerId}
```

The trip document owns planning metadata only. A trip item references a canonical producer ID and contains planning structure only.

### Supabase owns producer truth

Producer identity, publication status, name, category, destination, contact details, location, visitability, access, hours and all other producer facts remain canonical in Supabase.

A trip item must never copy producer facts merely for convenience.

### Trusted API owns mutations

All trip mutations go through the trusted application server with Firebase authentication.

Reasons:

- Firestore Security Rules cannot validate a producer ID against Supabase.
- Canonical producer existence/publication must be checked before insertion.
- Practical limits must be enforced server-side.
- Reorder/day mutations must use optimistic concurrency.
- Analytics must occur only after successful persistence.

Firestore client access may read the signed-in traveler's own trip documents, but direct client writes are denied in V1.

## 3. V1 data model

### Trip

```ts
interface TripRecordV1 {
  id: string;
  ownerUid: string;
  title: string;
  startDate: string | null;   // YYYY-MM-DD, date-only
  endDate: string | null;     // YYYY-MM-DD, date-only
  itemCount: number;
  revision: number;
  schemaVersion: 1;
  createdAt: string;          // ISO timestamp, server generated
  updatedAt: string;          // ISO timestamp, server generated
}
```

### Trip item

The document ID is exactly the canonical `producerId`.

```ts
interface TripItemRecordV1 {
  producerId: string;
  position: number;           // contiguous integer 0..itemCount-1
  dayNumber: number | null;   // optional 1-based bucket
  createdAt: string;          // ISO timestamp, server generated
  updatedAt: string;          // ISO timestamp, server generated
}
```

### V1 limits

- maximum trips per account: **25**
- maximum producers per trip: **50**
- trip title: **1–80 trimmed characters**
- trip date span: **maximum 365 days**
- dayNumber: **1–365**, and when trip dates exist it must not exceed the inclusive trip duration
- one producer may appear **once per trip**
- arbitrary notes/descriptions are **not part of My Trips V1**

Limits exist for predictable UX, atomic writes and abuse protection. They are not monetisation limits.

## 4. Core invariants

1. A trip belongs to exactly one Firebase UID and cannot be transferred in V1.
2. A trip item document ID equals its `producerId`.
3. A trip cannot contain duplicate producer IDs.
4. New producer additions require a currently active canonical producer.
5. Existing trip items are not automatically deleted when a producer later becomes unavailable.
6. Trip state never contains producer name, website, phone, email, coordinates, hours, access facts, visitability facts, cover images, category or destination.
7. Every successful mutation increments `revision`.
8. Mutations that depend on existing state require the caller's expected revision. A stale revision returns conflict rather than silently overwriting newer work.
9. Reordering writes all item positions atomically and leaves contiguous positions.
10. Account deletion removes trips and items.
11. Account export includes trips and items.
12. Trip titles, dates, day assignments and ordering are private and never enter the analytics payload.
13. Trip analytics never contain trip IDs.
14. A producer opt-out is stronger than ordinary inactivity and must never be reversed automatically.

## 5. Producer publication lifecycle

The current public `is_active` flag remains the final publication switch, but V1 requires an internal reason/state to distinguish why a producer is not public.

Target lifecycle states:

- `active`
- `temporarily_inactive`
- `closed`
- `opted_out`
- `suspended`

### Active

Publicly resolvable and may be added to a trip.

### Temporarily inactive

Not currently public. Existing trip references remain, rendered as unavailable. May return after deliberate verification.

### Closed

Not currently public. Existing trip references remain as a minimal closed/unavailable reference. Reopening requires evidence and deliberate catalogue action.

### Opted out

The producer explicitly requested not to be featured.

Rules:

- immediately disable public publication;
- remove from map/search/public producer APIs/SEO/sitemap/generated public catalogue on the next publication reconciliation;
- stop exposing prior producer facts through My Trips;
- retain only the minimum internal tombstone/audit data needed to prevent accidental republication;
- do not automatically reverse the state through research, sync, imports or catalogue refreshes;
- reactivation requires a deliberate documented reversal of the opt-out;
- existing trip items remain as private structural references only and resolve to “Producer no longer listed on TerroirTrail”;
- historical non-identifying aggregate analytics may remain;
- opted-out producers must not appear in named rankings, Producer Insights examples, marketing or B2B showcase material.

### Suspended

Administrative/trust hold. Hidden publicly. Existing trip reference displays unavailable without exposing a reason that is not intended for travelers. Reinstatement is deliberate.

### Stale fallback rule

A stale generated fallback must never be treated as authority over a newer non-public state.

The publication pipeline must maintain a durable suppression/tombstone mechanism for `opted_out` and `suspended` producers. Until that mechanism is fully deployed, an opt-out operational procedure must include immediate catalogue deactivation followed by publication reconciliation/deploy so static fallback and SEO assets are regenerated.

Previously downloaded offline/browser content can never be recalled from a disconnected device instantly; the product must invalidate/suppress it on the next successful update and must never intentionally preserve opted-out public details in new builds.

## 6. Date semantics

Trip dates are calendar dates, not instants.

- Store `YYYY-MM-DD`.
- Do not convert trip dates to UTC timestamps.
- A timezone change must not move a trip to the previous/next day.
- A trip may have no dates.
- V1 permits:
  - both dates null;
  - startDate only;
  - startDate and endDate.
- endDate without startDate is invalid.
- endDate before startDate is invalid.
- start/end span over 365 inclusive days is invalid.
- Changing dates does not silently delete day assignments.
- If a date-range reduction makes an existing dayNumber invalid, the date update is rejected until those assignments are moved/cleared deliberately.

## 7. Concurrency model

Every trip has a monotonically increasing integer `revision`.

A mutation that changes an existing trip must provide `expectedRevision`.

- exact revision → mutation may proceed;
- stale/future/missing revision → HTTP 409 conflict;
- client must reload current trip and ask the traveler to retry the intended action;
- no automatic last-write-wins for reorder/date/title changes.

Every item mutation increments the parent trip revision.

Reorder uses the complete current producer-ID order. The server verifies that the submitted set exactly matches the current trip items, contains no duplicates and matches the expected revision, then updates all positions atomically.

## 8. Offline model

My Trips V1 is **online-mutation only**.

The UI may show already cached/read data, but it must not claim an unsynced write succeeded.

- network unavailable before mutation → no local authoritative change;
- timeout with unknown result → reload trip before retrying;
- repeated request after confirmed success must not create duplicates;
- producer additions fail closed if canonical producer validation is unavailable;
- V1 does not implement an offline write queue.

This avoids silent merge conflicts while the product is small. Offline editing can be designed later as a separate synchronization feature.

## 9. Guest model

My Trips V1 is **signed-in only**.

- guest may browse producers;
- guest selecting “Add to trip” is prompted to sign in;
- V1 does not create a local guest trip;
- therefore there is no silent guest-to-account merge;
- a future guest-draft feature requires a separate explicit migration/conflict contract.

## 10. Scenario register

The following register is exhaustive for the known V1 scenario classes. New cases must map to the invariants above rather than inventing ad-hoc behaviour.

### A. Authentication and identity

| ID | Scenario | V1 behaviour |
|---|---|---|
| A01 | Signed-in traveler creates trip | Allowed after validation. |
| A02 | Signed-out visitor creates trip | 401; UI prompts sign-in. |
| A03 | Session expires before mutation | 401; no write. |
| A04 | Session expires after server accepted mutation | Persisted mutation remains; client reloads after re-authentication. |
| A05 | Invalid/revoked Firebase token | 401; no write. |
| A06 | User guesses another trip ID | Not found/forbidden; never reveal whether another user's trip exists. |
| A07 | Host account uses My Trips as traveler | Allowed; traveler capability is baseline. |
| A08 | Admin account uses My Trips | Allowed as its own traveler state; admin role grants no access to other private trips through traveler APIs. |
| A09 | User changes email/provider | Trips remain under immutable Firebase UID. |
| A10 | Disabled/deleted auth account | No authenticated access; deletion lifecycle handles stored trips. |

### B. Trip creation and metadata

| ID | Scenario | V1 behaviour |
|---|---|---|
| B01 | Valid title, no dates | Create. |
| B02 | Title has leading/trailing spaces | Trim before validation/storage. |
| B03 | Empty/whitespace title | Reject 400. |
| B04 | Title >80 chars | Reject 400. |
| B05 | Unicode/non-Latin title | Allow within length. |
| B06 | Title contains HTML/script text | Store as plain text; UI escapes normally. |
| B07 | 25 trips already exist | Reject limit; no paid upsell. |
| B08 | Two simultaneous creates near limit | Server rechecks count; rare race must not become a security issue; later hard quota counter may be introduced if observed. |
| B09 | Rename valid trip | Require expected revision; increment revision. |
| B10 | Rename stale trip | 409 conflict. |
| B11 | Set startDate only | Allowed. |
| B12 | Set endDate without startDate | Reject. |
| B13 | endDate < startDate | Reject. |
| B14 | Date span >365 days | Reject. |
| B15 | Remove dates | Allowed only if existing day assignments remain semantically acceptable; day buckets are independent planning labels. |
| B16 | Shrink date range below assigned dayNumber | Reject until assignments are cleared/moved. |
| B17 | Delete empty trip | Allowed. |
| B18 | Delete populated trip | Atomically delete parent and all capped items. |
| B19 | Delete with stale revision | 409 conflict. |
| B20 | Open missing/deleted trip | 404. |

### C. Producer addition and item integrity

| ID | Scenario | V1 behaviour |
|---|---|---|
| C01 | Add active canonical producer | Allowed. |
| C02 | Add same producer again | Idempotent conflict/duplicate response; no second item. |
| C03 | Add malformed producer ID | Reject. |
| C04 | Add nonexistent producer | Reject. |
| C05 | Add inactive producer | Reject. |
| C06 | Add opted-out producer | Reject. |
| C07 | Add suspended producer | Reject. |
| C08 | Canonical catalogue unavailable | 503; do not accept unverified ID. |
| C09 | Producer becomes inactive just after validation | Existing reference may remain; resolution reflects latest publication state. |
| C10 | 50 items already present | Reject limit. |
| C11 | Producer ID contains path separators/control chars | Reject. |
| C12 | Remove existing item | Allowed with expected revision; reindex positions. |
| C13 | Remove missing item | 404/idempotent-safe response; never corrupt count. |
| C14 | Remove stale revision | 409. |
| C15 | Item count disagrees with stored items | Treat as integrity error; repair via trusted maintenance, do not guess client-side. |

### D. Ordering and day assignment

| ID | Scenario | V1 behaviour |
|---|---|---|
| D01 | Reorder all current items | Atomic contiguous positions. |
| D02 | Reorder omits an item | Reject. |
| D03 | Reorder contains unknown item | Reject. |
| D04 | Reorder duplicates an ID | Reject. |
| D05 | Reorder stale revision | 409. |
| D06 | Two devices reorder simultaneously | First commit wins; second receives 409. |
| D07 | Add/remove races with reorder | Revision mismatch prevents stale reorder overwriting membership. |
| D08 | Assign valid day number | Allowed, revision++. |
| D09 | Clear day assignment | Allowed, revision++. |
| D10 | dayNumber 0/negative/non-integer | Reject. |
| D11 | dayNumber >365 | Reject. |
| D12 | dayNumber outside known date duration | Reject. |
| D13 | Trip has no dates and dayNumber=4 | Allowed as manual day bucket. |
| D14 | Reorder across different day buckets | Allowed; global position remains explicit. |

### E. Producer lifecycle after item creation

| ID | Scenario | V1 behaviour |
|---|---|---|
| E01 | Producer renamed | Trip resolves current canonical name; trip record unchanged. |
| E02 | Producer changes category | Resolve current category; no trip mutation. |
| E03 | Producer changes destination | Resolve current destination; no copied stale destination. |
| E04 | Producer coordinates change | Resolve current coordinates. |
| E05 | Visitability/hours/access change | Resolve current facts every time; never use trip snapshot. |
| E06 | Producer temporarily inactive | Keep item; display unavailable. |
| E07 | Producer closes | Keep structural item; display closed/unavailable. |
| E08 | Producer opts out | Keep item ID only; display “Producer no longer listed on TerroirTrail”; no old details/contact/directions. |
| E09 | Producer suspended | Keep item; generic unavailable state; do not expose internal suspension reason. |
| E10 | Temporarily inactive producer reactivated | Existing item resolves normally again. |
| E11 | Closed producer verifiably reopens | Existing item resolves after deliberate catalogue reactivation. |
| E12 | Opted-out producer later consents to return | Requires deliberate documented reversal; existing items may resolve again only after publication. |
| E13 | Import/research tries to reactivate opted-out row | Blocked by tombstone/lifecycle rule. |
| E14 | Producer ID is changed during catalogue cleanup | Avoid changing canonical IDs; if unavoidable, require explicit migration map before old ID removal. |
| E15 | Duplicate producer records merged | Explicit migration must rewrite private references server-side or retain alias resolution; never silently orphan them. |

### F. Network, retries and partial failures

| ID | Scenario | V1 behaviour |
|---|---|---|
| F01 | Offline before request | Show failure/offline state; no authoritative local mutation. |
| F02 | Request times out before server receives | Reload before retry where result is ambiguous. |
| F03 | Server commits but response is lost | Reload reveals committed revision; duplicate add cannot duplicate item. |
| F04 | Firestore unavailable | 503; no analytics success event. |
| F05 | Supabase unavailable during producer add | 503; no item created. |
| F06 | Analytics unavailable after trip write | Trip write stays successful; analytics is non-blocking and may be absent. |
| F07 | Client retries create after unknown result | V1 UI should reload trip list before recreating; future idempotency key may be added if telemetry shows need. |
| F08 | Client retries add producer | Producer-ID document key prevents duplicate. |
| F09 | Partial reorder write | Firestore atomic operation prevents partial positions. |
| F10 | Browser crashes after success | Firestore state remains authoritative. |

### G. Privacy and content

| ID | Scenario | V1 behaviour |
|---|---|---|
| G01 | Traveler puts personal information in trip title | It remains private account data; export/delete include it; analytics never receive it. |
| G02 | Trip dates reveal travel plans | Private; not analytics dimensions. |
| G03 | Day assignments reveal itinerary | Private; not analytics payload. |
| G04 | Producer sees traveler trip | Never through Host authority. |
| G05 | Admin uses ordinary admin UI | No private trip access by default. Support tooling would require a separate justified audited capability. |
| G06 | Logs/errors | Do not log titles, dates, item lists or trip contents. |
| G07 | Analytics | No trip ID, title, dates, day numbers, position, notes or full itinerary. |
| G08 | Account export | Includes the user's own complete trip structure. |
| G09 | Account deletion | Removes complete trip structure. |
| G10 | Aggregate analytics after deletion | Non-identifying daily aggregates may remain, consistent with existing analytics lifecycle. |

### H. Account lifecycle

| ID | Scenario | V1 behaviour |
|---|---|---|
| H01 | Normal account export | Include trips and their items. |
| H02 | Normal self-deletion | Delete trips/items before deleting user auth record. |
| H03 | Account deletion fails before trip deletion | Abort destructive continuation; return error, preserve recoverable account. |
| H04 | Failure after trips deleted but before auth deletion | Existing account deletion workflow must surface failure; retry is safe because trip deletion is idempotent. |
| H05 | User re-registers with same email | New Firebase UID receives no old trips. |
| H06 | Host deletes account | Personal trips removed; public producer catalogue remains independent. |
| H07 | Admin attempts self-deletion | Existing admin safety rule still applies before trip deletion. |
| H08 | Export while producer item unavailable | Export stores reference/structure, not resurrected producer facts. |

### I. Security and abuse

| ID | Scenario | V1 behaviour |
|---|---|---|
| I01 | Direct client writes trip | Denied by Firestore rules. |
| I02 | Direct client writes item | Denied. |
| I03 | Other user direct-reads trip | Denied. |
| I04 | Owner direct-reads own trip/items | Allowed. |
| I05 | Malicious owner changes ownerUid | Direct write denied; API never accepts ownerUid. |
| I06 | Unsupported JSON properties | Route rejects or ignores by explicit allowlist; preferred behaviour is reject. |
| I07 | Oversized request body | Existing Express 16 KB cap rejects. |
| I08 | Huge item lists in reorder | Reject above 50 and require exact membership. |
| I09 | Rapid mutation spam | Existing infrastructure/rate protection may be extended; limits prevent unbounded writes. |
| I10 | Crafted timestamps | Client timestamps are never accepted. |
| I11 | Crafted itemCount/revision/position | Server derives them. |
| I12 | User attempts to add arbitrary producer text | Only canonical producer ID is accepted. |

### J. Analytics integration

| ID | Scenario | V1 behaviour |
|---|---|---|
| J01 | Trip created successfully | `trip_created` may emit after persistence from allowed surface. |
| J02 | Rename succeeds | `trip_renamed` after persistence. |
| J03 | Producer added | `trip_producer_added` with canonical producer ID only. |
| J04 | Producer removed | `trip_producer_removed` with producer ID only. |
| J05 | Reorder succeeds | `trip_item_reordered`; no ordering payload. |
| J06 | Day assignment succeeds | `trip_day_assigned`; no day number payload. |
| J07 | Trip workspace opened | `trip_opened`; no trip ID. |
| J08 | Mutation fails | Do not emit success event. |
| J09 | Analytics request retries | Existing clientEventId idempotency applies. |
| J10 | User deletes account | Retained actor-linked raw events are removed by existing privacy lifecycle. |

### K. UI resolution contract for Phase 14.6

| ID | Scenario | V1 behaviour |
|---|---|---|
| K01 | All producers resolve | Normal cards. |
| K02 | One producer inactive | Keep slot with unavailable state and remove unsafe actions. |
| K03 | One producer opted out | Minimal “no longer listed” placeholder; no name/contact/details if policy requires complete delisting. |
| K04 | Catalogue request temporarily fails | Do not mislabel producers as opted out/closed; show “details temporarily unavailable.” |
| K05 | Empty trip | Valid; show empty-state Add flow. |
| K06 | Deleted trip still open in another tab | Next mutation/read returns 404; tab exits gracefully. |
| K07 | Stale revision in another tab | Reload conflict state; never overwrite silently. |
| K08 | Item order integrity failure | Fail safely and request reload; do not invent order. |

### L. Catalogue publication and recovery

| ID | Scenario | V1 behaviour |
|---|---|---|
| L01 | Accidental ordinary deactivation | Admin can deliberately reactivate after verification. |
| L02 | Accidental opt-out flag | Correction requires audited deliberate action; automation may not clear it. |
| L03 | Opt-out request authenticity uncertain | Hide/pause if appropriate while verifying; do not expose claimant private data. |
| L04 | Producer requests immediate removal of images/contact | Public publication is disabled immediately; reconciliation removes generated assets/references. |
| L05 | Search engine cached old page | Serve non-public/not-found/noindex state; external cache expiry is outside TerroirTrail control. |
| L06 | Old installed PWA/browser cache | New service-worker/build invalidates on next connection; no new build republishes opted-out details. |
| L07 | Backup contains historical producer row | Backup is not a publication source; restoration must reapply current tombstones before going public. |
| L08 | Database rollback precedes opt-out | Deployment/recovery checklist must reapply durable opt-out state before public traffic. |

## 11. Error semantics

Trusted trip APIs use stable classes:

- **400** malformed input or violated invariant
- **401** authentication required/expired
- **404** trip/item not available to this owner, without leaking other-user existence
- **409** stale revision, duplicate membership or state conflict
- **429** abuse/rate limit if introduced
- **503** Firestore/catalogue dependency unavailable

Responses must not include private contents from another account or internal database error details.

## 12. Analytics contract activation

The database already supports:

- `trip_created`
- `trip_renamed`
- `trip_producer_added`
- `trip_producer_removed`
- `trip_item_reordered`
- `trip_day_assigned`
- `trip_opened`

Allowed surfaces remain exactly those frozen in Phase 14.1.

Trip events require authentication. Producer add/remove events require a canonical producer ID. All other trip events carry no producer/destination/trip identifier.

## 13. Account export/delete changes required

### Export

Add:

```text
trips: [
  {
    ...trip metadata,
    items: [...]
  }
]
```

This is a user privacy export, so private title/date/day/order data is correctly included.

### Delete

Before deleting the `users/{uid}` parent and Firebase Auth account:

1. enumerate the user's trip documents;
2. delete each trip's item subcollection;
3. delete each trip document;
4. continue the existing account-deletion lifecycle.

Deletion must be idempotent.

## 14. Firestore Security Rules target

```text
users/{uid}/trips/{tripId}
  read: owner only
  write: false (Admin SDK trusted API only)

users/{uid}/trips/{tripId}/items/{producerId}
  read: owner only
  write: false
```

This intentionally prevents bypassing Supabase producer validation.

## 15. Implementation sequence

1. Freeze this contract.
2. Add Firestore owner-read/server-write rules and tests.
3. Add trusted trip service and routes.
4. Validate producer additions against canonical active Supabase producer records.
5. Add optimistic revisions and atomic reorder/day operations.
6. Extend account export/deletion.
7. Activate trip events in application analytics allowlists.
8. Add tests for validation, ownership, stale revisions, limits, deletion/export and analytics privacy.
9. Deploy Firestore rules/API and production-verify.
10. Only then begin Phase 14.6 UI.

## 16. Deliberately deferred

Not part of V1:

- shared/collaborative trips;
- public/shareable trip links;
- guest/local trip drafts;
- offline mutation queues;
- free-text trip notes;
- lodging/flights;
- route optimisation;
- drive-time calculation;
- opening-hour inference;
- booking/availability;
- paid trip limits;
- AI itinerary generation;
- producer access to traveler trip contents.

Each deferred capability requires a new contract because it changes privacy, authority, synchronization or safety assumptions.
