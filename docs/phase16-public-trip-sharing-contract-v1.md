# Phase 16 — Public Trip Sharing Contract V1

**Status:** implementation contract  
**Date:** 2026-10-01  
**Scope:** owner-created, revocable, read-only public links for My Trips.

## 1. Purpose

Public Trip Sharing turns a private My Trips plan into an explicitly shared
read-only view. It creates a distribution loop without changing ownership,
collaboration, booking authority, or producer truth.

The traveler must deliberately enable sharing. Private trips remain private by
default.

## 2. Authority and storage

The existing private trip remains authoritative:

```text
users/{uid}/trips/{tripId}
users/{uid}/trips/{tripId}/items/{producerId}
```

The trip document may additionally store:

```text
publicShareId: string | null
publicShareEnabled: boolean
publicSharedAt: ISO timestamp | null
```
The share ID is a high-entropy random identifier. It is not derived from the
traveler UID, trip title, email, dates, or producer IDs.

Supabase remains authoritative for whether a producer is currently public.

## 3. Public URL

Canonical form:

```text
https://terroir-trail.web.app/trip/{shareId}
```

A public share requires no authentication. The link is effectively a bearer
capability: anyone who receives it can view the public trip representation.

## 4. Public payload

The public response may expose only information the traveler deliberately
shares through the trip:

- trip title;
- start/end dates;
- stop order;
- day assignment;
- current count of planned stops;
- current public producer IDs for stops that remain actively published.

It must never expose:

- owner UID;
- account name/email;
- auth identifiers;
- private account metadata;
- internal producer lifecycle reasons;
- opt-out/suspension reason;
- payment/pass state;
- private analytics identifiers.
## 5. Producer lifecycle

Before every public read, producer state is resolved against current canonical
publication state.

For an active producer, the public payload may return its canonical producer ID
so the public app can resolve current public catalogue facts.

For any producer that is unavailable, inactive, suspended, opted out, or no
longer publicly listable, the public payload returns an unavailable placeholder
without the producer ID. Historical producer facts are never resurrected.

The public page uses live catalogue facts only. If current catalogue resolution
is unavailable, it withholds producer details rather than reconstructing them
from stale fallback data.

## 6. Revocation and re-sharing

The owner can disable sharing at any time.

Disabling clears the active share ID. The old URL must return 404 immediately
after trusted state is updated.

Re-enabling sharing creates a new random share ID. A revoked URL must never
become valid again accidentally.

Sharing metadata is independent of the trip planning revision. Enabling or
disabling a link does not reorder stops or mutate planning structure.
## 7. Read-only boundary

Public visitors cannot:

- edit the trip;
- add/remove/reorder stops;
- change day assignments;
- access exports reserved for the owner;
- see the owner's other trips;
- infer owner identity from the URL.

Public visitors may open currently public producer listings and may start their
own TerroirTrail discovery flow.

## 8. Deletion and account lifecycle

Because share metadata lives on the trip document, deleting the trip removes
the share state with it.

Account deletion continues to delete the complete trip tree. No separate public
share object survives account deletion.

## 9. Failure semantics

- invalid or revoked share ID: 404;
- missing/deleted trip: 404;
- current producer-state resolution unavailable: 503;
- owner share mutation without auth: 401;
- unowned trip share mutation: 404.

Public responses fail closed and never leak whether a private trip exists behind
an invalid token.

## 10. Deliberately excluded

V1 does not add collaborative editing, comments, public indexing/sitemaps,
discoverable trip directories, traveler profiles, follower graphs, guest edits,
or producer access to traveler plans.
