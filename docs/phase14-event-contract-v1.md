# Phase 14 Event Contract v1

**Status:** Frozen for Phase 14.2 / 14.3 implementation design. No production behavioral collection is authorized by this document alone.  
**Date:** 2026-09-20  
**Scope:** TerroirTrail first-party product-intent analytics only.

## 1. Purpose and non-goals

This contract creates one narrow, privacy-conscious event vocabulary for answering the Phase 14 product questions:

- which producers, categories and destinations generate meaningful traveler intent;
- whether producer views lead to saves;
- whether saves later lead to trip planning;
- whether trip planning leads to direct producer actions or directions;
- whether travelers return to My Trips;
- whether Passport activity appears after planning;
- whether contextual affiliate placements are useful;
- whether aggregate producer and regional signals are credible enough for later internal insights.

These events are directional product-intent signals. They are not proof of a booking, purchase, physical visit, road suitability, opening status or producer partnership.

Phase 14 does not introduce a general-purpose analytics platform, unrestricted metadata, third-party behavioral analytics vendors, cross-site tracking, route tracking, precise-location tracking, booking activation or payment tracking.

## 2. Verified Phase 14.0 baseline

Live Supabase baseline verified on 2026-09-20:

| Measure | Baseline |
|---|---:|
| Active producers | 147 |
| Inactive producers | 0 |
| Active destinations | 22 |
| Active producer categories | 13 |
| Verified producer locations | 147 / 147 |
| Visitability reviewed | 147 / 147 |
| Road/access reviewed | 147 / 147 |
| Booking requirement known | 91 / 147 |
| Visitor hours known | 90 / 147 |
| Parking evidence known | 16 / 147 |
| Visitor-language evidence known | 24 / 147 |
| Website known | 147 / 147 |
| Phone known | 133 / 147 |
| Active Experiences | 0 |
| Producer-approved Experiences | 0 |

Current visitability distribution:

- public_visits: 62
- appointment_only: 43
- not_publicly_confirmed: 20
- seasonal_public: 14
- current_access_uncertain: 8
- unreviewed: 0

Current road/access-review distribution:

- verified: 61
- not_publicly_confirmed: 86
- current_access_uncertain: 0
- unreviewed: 0

Current location distribution:

- verified_location: 143
- verified_entrance: 4
- unresolved/unreviewed: 0

Current production commercial posture verified from the repository:

- Travelpayouts affiliate pilot: enabled through VITE_ENABLE_TRAVEL_AFFILIATES=true.
- Display advertising: fail-closed; VITE_ENABLE_ADVERTISING is not enabled.
- Explorer Pass purchasing: fail-closed; VITE_ENABLE_EXPLORER_PASS_PURCHASES is not enabled.
- Public booking / Experiences: quarantined from launch entry points.
- Active Experiences in Supabase: 0.

Catalogue expansion remains frozen for Phase 14.

## 3. Architecture boundary

The trusted flow is:

React client
→ POST /api/analytics/events
→ trusted application server
→ validate event contract
→ validate Firebase token when present / required
→ apply server timestamp
→ derive pseudonymous identity keys
→ validate producer / destination / campaign context
→ derive catalogue dimensions where possible
→ write one narrow event row to Supabase

Technology ownership:

- **Firebase Auth / Firestore:** traveler-owned My Trips, Favorites, Passport and other private traveler state.
- **Supabase:** producer catalogue, verified operational facts, raw first-party intent warehouse, aggregate producer/regional reporting.
- **Trusted application server:** Firebase token verification, HMAC pseudonymization, event validation, anti-abuse controls and Supabase write.
- **Browser:** emits only approved event inputs. It never writes raw analytics rows directly to Supabase.

Analytics failure must never block producer discovery, Favorites, Passport, My Trips, directions, telephone, email or website actions.

## 4. Client request envelope

The client request body is intentionally narrow:

~~~json
{
  "schemaVersion": 1,
  "event": "producer_website_click",
  "clientEventId": "9dd96a5e-74fe-4f06-8f0f-04c8fca26586",
  "sessionId": "54892df1-f763-4e21-88cf-c0e765bf769b",
  "producerId": "example-producer-id",
  "destination": null,
  "sourceSurface": "producer_drawer",
  "affiliateCampaignId": null
}
~~~

Rules:

- schemaVersion is required and must equal 1.
- event is required and must be one of the frozen v1 event names.
- clientEventId is required, random UUID v4, unique per logical event, and exists only for retry/idempotency.
- sessionId is required for browser-originated events, random UUID v4 stored in sessionStorage only.
- producerId is present only for events whose contract permits/requires it.
- destination is client-supplied only for region events and is validated against the canonical destination catalogue.
- sourceSurface is required and must be allowed for that event.
- affiliateCampaignId is present only for affiliate events and must be on the server-side campaign allowlist.
- no arbitrary metadata object exists.
- no client-supplied user ID, actor key, category, country code, event timestamp, IP address, trip name, trip ID, date, note text or URL is accepted.

Firebase authentication travels in the Authorization header when available. Authentication tokens are never part of the JSON event payload.

## 5. Server-derived stored fields

The server, not the browser, derives or controls:

- id
- occurred_at
- actor_scope: anonymous or authenticated
- actor_key for authenticated events
- session_key
- producer-derived destination
- producer-derived country_code
- producer-derived category
- normalized source_surface
- validated affiliate campaign ID
- schema_version

Identity rules:

- actor_key = versioned server-side HMAC of Firebase UID. Raw Firebase UID is not written into normal analytics rows or reports.
- session_key = versioned server-side HMAC of the ephemeral sessionId.
- sessionId is regenerated when a browser session starts.
- sessionId is rotated on sign-in and sign-out so pre-authentication browsing is not silently stitched to an account.
- no localStorage identifier, advertising identifier, fingerprint or cross-site identity is created.

The server timestamp is authoritative. v1 does not persist a client event timestamp.

## 6. Frozen event names

### Discovery
- producer_view
- producer_share
- region_open
- region_producers_view

### Saved intent
- producer_save
- producer_unsave

### Direct producer intent
- producer_website_click
- producer_phone_click
- producer_email_click
- directions_click

### Trip intent
- trip_created
- trip_renamed
- trip_producer_added
- trip_producer_removed
- trip_item_reordered
- trip_day_assigned
- trip_opened

### Post-visit
- passport_stamp_added
- passport_stamp_removed

### Affiliate
- affiliate_impression
- affiliate_click

No additional v1 event name may be emitted without a documented product question and a contract change.

Intentionally absent from v1 include page_view, search_text, scroll_depth, hover, generic click, trip_deleted, booking, payment, ad-impression and precise-route events.

## 7. Allowed source_surface vocabulary

source_surface means the user-visible surface/control that directly caused the event.

Frozen initial values:

- producer_list_card
- map_canvas
- map_marker
- map_quick_card
- producer_drawer
- deep_link
- favorites
- passport
- region_drawer
- header_region_picker
- profile_menu
- trip_add_flow
- my_trips
- trip_workspace
- map_affiliate_banner
- trip_preparation
- region_planning

A new source_surface requires a contract update or centrally reviewed allowlist change. Free-form component names are prohibited.

## 8. Event-by-event contract

All raw events use privacy class **P1 — pseudonymous behavioral telemetry** and retention class **R1** defined below. No PII or private free text is permitted.

| Event | Purpose | Trigger definition | Required client fields beyond envelope | Optional fields | Allowed source surfaces | Authentication | Deduplication rule |
|---|---|---|---|---|---|---|---|
| producer_view | Measure meaningful producer-detail interest | Fire when a producer detail experience becomes active because of a deliberate navigation/open action and the canonical producer is resolved | producerId, sourceSurface | none | producer_list_card, map_marker, map_quick_card, deep_link, favorites, passport, region_drawer, trip_workspace | optional | Once per detail activation. React rerenders, media changes and internal tab changes must not refire. Reopening after leaving is a new view. clientEventId dedupes transport retries. |
| producer_share | Measure deliberate producer sharing | Fire only after native share resolves successfully or copy-link succeeds | producerId, sourceSurface | none | producer_drawer, map_quick_card, trip_workspace | optional | One per successful share action; retry duplicates collapse by clientEventId. |
| region_open | Measure deliberate terroir-region exploration | Fire when the regional drawer/context is opened by a user action | destination, sourceSurface | none | map_canvas, header_region_picker | optional | Once per drawer activation; rerenders do not refire. |
| region_producers_view | Measure transition from regional context into producer discovery | Fire on explicit View producers / map action from region context | destination, sourceSurface | none | region_drawer | optional | One per user action; retry duplicates collapse by clientEventId. |
| producer_save | Measure saved producer intent | Fire only after Favorite persistence succeeds | producerId, sourceSurface | none | producer_drawer, producer_list_card, map_quick_card | required | One event for each successful false→true persistence transition. No event for idempotent save calls. |
| producer_unsave | Measure reversal of saved producer intent | Fire only after Favorite removal persistence succeeds | producerId, sourceSurface | none | producer_drawer, favorites, producer_list_card, map_quick_card | required | One event for each successful true→false transition. |
| producer_website_click | Measure direct outbound producer interest | Fire immediately on deliberate website action; analytics transport must not delay opening | producerId, sourceSurface | none | producer_drawer, trip_workspace | optional | One per deliberate action; clientEventId handles retry. |
| producer_phone_click | Measure direct telephone intent | Fire on deliberate tel action; transport must not delay call | producerId, sourceSurface | none | producer_drawer, trip_workspace | optional | One per deliberate action; clientEventId handles retry. |
| producer_email_click | Measure direct email intent | Fire on deliberate mailto action; transport must not delay email client | producerId, sourceSurface | none | producer_drawer, trip_workspace | optional | One per deliberate action; clientEventId handles retry. |
| directions_click | Measure navigation intent | Fire only when the existing fail-closed directions/navigation action is actually allowed and invoked | producerId, sourceSurface | none | producer_drawer, map_quick_card, trip_workspace | optional | One per deliberate action. Never emit merely because a map route is rendered. |
| trip_created | Measure adoption of My Trips | Fire only after Firestore trip creation succeeds | sourceSurface | none | trip_add_flow, my_trips, profile_menu | required | One per successful create write. No trip name, dates or trip ID are sent. |
| trip_renamed | Measure active trip organization | Fire only after Firestore rename succeeds | sourceSurface | none | trip_workspace | required | One per successful rename write. Never send the old or new name. |
| trip_producer_added | Connect discovery to planning intent | Fire only after producer reference is successfully persisted into a trip | producerId, sourceSurface | none | trip_add_flow, producer_drawer, trip_workspace | required | One per successful absent→present producer membership transition. Duplicate-add attempts do not emit. |
| trip_producer_removed | Measure trip editing | Fire only after producer reference removal succeeds | producerId, sourceSurface | none | trip_workspace | required | One per successful present→absent transition. |
| trip_item_reordered | Measure use of manual organization | Fire after the settled reorder is successfully persisted | sourceSurface | none | trip_workspace | required | One per settled reorder operation, never per drag frame or rerender. |
| trip_day_assigned | Measure use of manual day organization | Fire after a producer item is successfully assigned or moved to a day bucket | sourceSurface | none | trip_workspace | required | One per successful settled assignment operation. Do not send day number/date. |
| trip_opened | Measure return to planning workflow | Fire when a persisted trip workspace is deliberately opened and data resolution succeeds | sourceSurface | none | my_trips, profile_menu | required | Once per trip-workspace activation. Rerenders/background refreshes do not refire. No trip ID is sent. |
| passport_stamp_added | Measure explicit post-visit marking | Fire only after Passport stamp persistence succeeds | producerId, sourceSurface | none | producer_drawer, passport | required | One per successful unstamped→stamped transition. |
| passport_stamp_removed | Measure reversal/correction of Passport marking | Fire only after Passport stamp removal succeeds | producerId, sourceSurface | none | producer_drawer, passport | required | One per successful stamped→unstamped transition. |
| affiliate_impression | Establish useful exposure denominator | Fire only after the specific affiliate placement is at least 50% visible for at least 1 continuous second | sourceSurface, affiliateCampaignId | destination when the placement is region-contextual | map_affiliate_banner, trip_preparation, region_planning | optional | At most once per campaign + source surface per placement activation. Rotation to a new campaign may emit a new impression after the visibility threshold. Rerenders do not refire. |
| affiliate_click | Measure useful affiliate engagement | Fire on deliberate affiliate outbound action | sourceSurface, affiliateCampaignId | destination when the placement is region-contextual | map_affiliate_banner, trip_preparation, region_planning | optional | One per deliberate action; do not store outbound URL or query string. |

## 9. Validation behavior

The ingestion endpoint is strict.

Reject with a 4xx response when:

- schemaVersion is unsupported;
- event is not in the frozen vocabulary;
- clientEventId or sessionId is malformed;
- a required producerId is missing or does not resolve to a canonical producer;
- a region event destination is missing or unknown;
- sourceSurface is not allowed for that event;
- an affiliate event lacks a valid campaign ID;
- an auth-required event has no valid Firebase authentication;
- a provided Firebase token is invalid;
- the body includes any unrecognized field;
- strings exceed narrow server-defined lengths.

Unknown fields are never persisted silently.

For producer-scoped events, destination, country_code and category are derived from the canonical producer row. Client-supplied copies are rejected rather than trusted.

Rate limiting and abuse protection belong at the trusted endpoint. An IP address may be used transiently by infrastructure for abuse prevention but must not be written into the intent event row.

## 10. Privacy classification

### P1 — pseudonymous behavioral telemetry

Every retained raw v1 event is P1 because it can contain a short-lived session key and, for authenticated actions, a pseudonymous actor key.

P1 does not permit:

- raw Firebase UID;
- name;
- email address;
- phone number;
- tasting-note or personal-note text;
- private trip-note text;
- trip name;
- trip ID;
- trip date/date range;
- day number;
- free-text search query;
- contact-message content;
- password;
- Firebase/Stripe/API token;
- payment details;
- arbitrary user or React objects;
- precise background location;
- latitude/longitude representing personal movement;
- IP address in the analytics table;
- full referrer;
- outbound affiliate URL/query string;
- unrestricted metadata JSON.

Catalogue identifiers such as producerId, destination, category and campaign ID are allowed because they describe TerroirTrail content/context rather than user-entered personal content.

## 11. Retention, deletion and export — R1

### Raw events

- Retain raw intent_events for **180 days**.
- Apply deletion on a rolling basis.
- The retention job must delete expired raw rows, not merely hide them.

### Aggregates

- Retain daily non-identifying aggregate metrics for **24 months** initially.
- Aggregate rows must not contain actor_key, session_key or clientEventId.
- Longer retention requires a later explicit Phase 14/18 decision.

### Account deletion

Before/while the Firebase account is deleted:

1. derive every supported actor_key version from the Firebase UID;
2. delete retained raw analytics rows linked to those actor keys;
3. delete Firestore traveler-owned state according to the account-deletion workflow;
4. do not attempt to reverse historical non-identifying aggregate counts.

Anonymous-only events cannot be reliably tied to an account and are removed by normal 180-day expiry.

### Account export / privacy access

- Do not expose raw analytics as a normal traveler product screen.
- The backend must be able to retrieve retained raw events by derived actor_key for a verified privacy/data-access request.
- A routine product account export may summarize the existence of retained analytics and defer to the privacy-export path, but it must not falsely claim that analytics data does not exist.
- Firestore-owned Trips/Favorites/Passport/private notes remain separate account data and follow the Firebase/Firestore export path.

## 12. Valid payload examples

Anonymous producer website action:

~~~json
{
  "schemaVersion": 1,
  "event": "producer_website_click",
  "clientEventId": "3e946228-238b-4d36-a923-7f3ec95aca8d",
  "sessionId": "ee817bf8-b808-4bda-909c-52db1f675a01",
  "producerId": "lyrarakis-winery",
  "sourceSurface": "producer_drawer"
}
~~~

Authenticated save action:

~~~json
{
  "schemaVersion": 1,
  "event": "producer_save",
  "clientEventId": "da6911d7-b2ef-4cb0-9b18-27462fc59177",
  "sessionId": "0dbf279a-9902-43ac-86c1-53b4bf9517e6",
  "producerId": "lyrarakis-winery",
  "sourceSurface": "producer_drawer"
}
~~~

The Firebase ID token is in the Authorization header, not in this body.

Region open:

~~~json
{
  "schemaVersion": 1,
  "event": "region_open",
  "clientEventId": "69fae852-0881-4cf7-91d5-6473d9ff52d4",
  "sessionId": "ae88ba1c-8aea-4a90-a207-dc62f0330990",
  "destination": "crete",
  "sourceSurface": "map_canvas"
}
~~~

Affiliate impression:

~~~json
{
  "schemaVersion": 1,
  "event": "affiliate_impression",
  "clientEventId": "2eab56bf-dac7-401e-a102-d14e1ff63a9c",
  "sessionId": "4aa3d46a-ec1d-446f-92e6-cc7ba8b68173",
  "sourceSurface": "map_affiliate_banner",
  "affiliateCampaignId": "localrent-cars"
}
~~~

Trip producer addition:

~~~json
{
  "schemaVersion": 1,
  "event": "trip_producer_added",
  "clientEventId": "4d2cc4a3-7153-45d4-87fd-c45924289d5b",
  "sessionId": "aac3974c-92d6-48f7-8c0f-740dbb8260ea",
  "producerId": "lyrarakis-winery",
  "sourceSurface": "trip_add_flow"
}
~~~

## 13. Invalid / prohibited payload examples

Reject payloads that include PII or private text:

~~~json
{
  "event": "producer_email_click",
  "producerId": "example",
  "email": "traveler@example.com",
  "message": "Please book me for Tuesday"
}
~~~

Reject private trip content:

~~~json
{
  "event": "trip_renamed",
  "tripId": "abc123",
  "tripName": "Giannis and Maria honeymoon",
  "startDate": "2026-10-03"
}
~~~

Reject precise personal movement:

~~~json
{
  "event": "directions_click",
  "producerId": "example",
  "userLat": 35.123456,
  "userLng": 25.123456
}
~~~

Reject arbitrary metadata:

~~~json
{
  "event": "producer_view",
  "producerId": "example",
  "metadata": {
    "componentState": {},
    "user": {}
  }
}
~~~

Reject client authority claims:

~~~json
{
  "event": "producer_save",
  "producerId": "example",
  "firebaseUid": "raw-user-id",
  "actorKey": "client-chosen-key",
  "occurredAt": "2026-09-20T10:00:00Z"
}
~~~

## 14. Initial affiliate campaign allowlist

Current map-banner campaign IDs observed in the production source:

- klook-experiences
- localrent-cars
- welcome-pickups
- gettransfer-rides
- yesim-esim

Campaign configuration may change without changing the event-name schema, but every accepted campaign ID must exist in trusted server/application configuration.

## 15. Implemented Supabase mapping for Phase 14.2

Implemented in the non-exposed `analytics` schema. Browser roles have no schema usage and no raw-table privileges.

Implemented raw table:

~~~text
analytics.intent_events

id                 uuid primary key
schema_version     smallint not null
client_event_id    uuid not null unique
event_name         text not null
occurred_at        timestamptz not null default now()

actor_scope        text not null
actor_key          text null
session_key        text not null

producer_id        text null
destination        text null
country_code       text null
category           text null
source_surface     text not null
affiliate_campaign text null
~~~

Constraints should enforce:

- frozen event-name vocabulary;
- frozen source-surface vocabulary;
- actor_scope in anonymous/authenticated;
- authenticated requires actor_key;
- anonymous requires actor_key IS NULL;
- producer-required events require producer_id;
- region events require destination;
- affiliate events require affiliate_campaign;
- affiliate_campaign must be null for non-affiliate events;
- trip/private text cannot be represented because there are no corresponding columns.

Suggested indexes, justified by planned reporting only:

- occurred_at
- event_name + occurred_at
- producer_id + occurred_at
- destination + occurred_at
- category + occurred_at
- affiliate_campaign + source_surface + occurred_at

Raw rows must not be readable or writable by anon/authenticated browser roles. RLS should still be enabled as defense in depth. The trusted server/service credential is the write path.

## 16. Initial aggregate/reporting plan

Implemented as persistent non-identifying daily aggregate tables so 24-month aggregate retention can outlive the 180-day raw-event window.

### producer_intent_daily

Dimensions:
- day
- producer_id
- destination
- country_code
- category

Measures:
- producer_views
- saves
- unsaves
- trip_additions
- website_clicks
- phone_clicks
- email_clicks
- directions_clicks
- passport_stamps_added

### region_intent_daily

Dimensions:
- day
- destination
- country_code

Measures:
- region_opens
- region_producers_views
- producer_views
- saves
- trip_additions
- direct_producer_actions
- directions_clicks
- passport_stamps_added

### category_intent_daily

Dimensions:
- day
- category

Measures:
- producer_views
- saves
- trip_additions
- direct_producer_actions
- directions_clicks

### affiliate_intent_daily

Dimensions:
- day
- affiliate_campaign
- source_surface
- destination when applicable

Measures:
- impressions
- clicks
- CTR derived as clicks / impressions

No aggregate exposes actor_key, session_key, clientEventId, traveler identity or private trip contents.

## 17. Trusted endpoint contract for Gemini

Phase 14.2 database verification has passed. Gemini should now implement the trusted application endpoint against the service-role-only database RPC `public.ingest_intent_event_v1`:

- endpoint: POST /api/analytics/events;
- accept only the v1 request envelope;
- central schema validation;
- reject unknown properties;
- validate producer IDs/destinations/campaign IDs;
- validate Firebase token when supplied;
- require Firebase auth for save/unsave, all trip events and Passport events;
- allow anonymous producer/region/direct-action/affiliate events;
- derive actor_key via server-held HMAC;
- derive session_key via server-held HMAC;
- rotate browser sessionId on auth-state transition;
- do not send a client timestamp; the database applies the authoritative `occurred_at`;
- send only producer/destination context permitted by the v1 contract; the database independently derives producer destination/country/category and validates region context;
- never expose Supabase service credentials to the browser;
- never allow browser direct inserts into the analytics warehouse;
- return a simple success response without echoing stored identity keys;
- rate-limit abuse;
- analytics failure never blocks the user's product action.

## 18. Central frontend analytics client contract for Gemini

Create one centralized client, conceptually trackIntent(), which owns:

- schemaVersion;
- clientEventId generation;
- sessionId lifecycle in sessionStorage;
- Firebase Authorization header when available;
- source-surface validation;
- request transport;
- bounded retry behavior using the same clientEventId;
- failure swallowing/logging appropriate for non-critical analytics.

Do not scatter raw fetch calls through React components.

Do not use logger.ts as behavioral analytics.

Do not add Google Analytics, Mixpanel, PostHog or another behavioral analytics vendor as part of Phase 14.

## 19. Instrumentation rules for Gemini

Existing-product instrumentation comes before My Trips.

Instrument first:

- producer detail activation;
- favorite save/unsave;
- producer share;
- website/phone/email;
- directions;
- region open;
- region → producers action;
- Passport stamp add/remove;
- current affiliate banner impression/click.

Trip events are implemented only when My Trips exists.

Specific anti-duplication requirements:

- producer_view must not fire from React rerenders;
- region_open must not fire from rerenders;
- affiliate_impression uses visibility threshold and must not refire because a component rerendered;
- drag/reorder emits only after a settled persisted reorder;
- persistence-backed events fire only after successful state mutation.

## 20. Phase gate

This document freezes Phase 14.1.

Before production instrumentation:

1. implement and verify the Phase 14.2 Supabase warehouse;
2. verify no anon/authenticated raw-event access;
3. verify malformed/prohibited payload rejection;
4. verify retention/deletion mechanics;
5. verify aggregate correctness;
6. update privacy/disclosure copy as required before behavioral collection;
7. only then hand the frozen v1 contract to frontend/server implementation.

My Trips is not built before the existing-product analytics baseline is verified.


## 21. Phase 14.2 implementation record

**Completed and verified:** 2026-09-20.

Supabase migration history is authoritative for this operational database work. No duplicate routine migration files were added to Git.

Applied migrations:

- `20260920144220 phase14_analytics_foundation`
- `20260920144249 phase14_analytics_maintenance_jobs`
- `20260920144421 phase14_analytics_affiliate_fk_index`
- `20260920144540 phase14_analytics_server_rpc_bridge`

Implemented database objects:

- private `analytics` schema;
- `analytics.intent_events`;
- `analytics.affiliate_campaigns`;
- `analytics.producer_intent_daily`;
- `analytics.region_intent_daily`;
- `analytics.category_intent_daily`;
- `analytics.affiliate_intent_daily`;
- strict event/source/auth/context constraints;
- catalogue-context derivation trigger;
- actor-deletion function;
- raw-event and aggregate-retention functions;
- hourly daily-aggregate refresh;
- daily retention maintenance;
- service-role-only `public.ingest_intent_event_v1`;
- service-role-only `public.delete_intent_actor_v1`;
- service-role-only `public.export_intent_events_v1`.

Security state:

- `anon`: no `USAGE` on `analytics`; no raw-event SELECT/INSERT; no execution rights on the three public analytics RPCs.
- `authenticated`: no `USAGE` on `analytics`; no raw-event SELECT/INSERT; no execution rights on the three public analytics RPCs.
- `service_role`: server-only access required by the ingestion/export/deletion path.
- RLS is enabled and forced on every analytics table.
- No browser-facing RLS policies exist by design; lack of a policy is an additional deny boundary, not an omission.
- The analytics schema is not exposed to browser Data API access.

Automated lifecycle:

- raw events: 180-day rolling retention;
- non-identifying daily aggregate tables: 24-month rolling retention;
- aggregate refresh cron: hourly at minute 17;
- retention cron: daily at 03:43;
- pg_cron scheduler verified active.

Controlled verification passed:

- valid producer context derivation;
- valid authenticated save;
- valid region event;
- valid affiliate impression;
- valid trip event;
- invalid source-surface rejection;
- auth-required event rejection when anonymous;
- unknown producer rejection;
- unknown destination rejection;
- unknown affiliate campaign rejection;
- inactive affiliate campaign rejection;
- duplicate `client_event_id` idempotency;
- malformed/raw actor-key rejection;
- future timestamp rejection;
- producer aggregate reconciliation;
- affiliate aggregate reconciliation;
- actor deletion;
- 180-day raw purge;
- RPC export behavior;
- RPC delete behavior;
- RPC retry/idempotency behavior.

All synthetic raw events and test campaign rows were removed after verification. Current raw-event count remains zero, so **production behavioral tracking is still not enabled**.

Supabase advisors were rerun after DDL. The Phase-14-specific unindexed affiliate foreign key was corrected. Remaining analytics notices are INFO-level unused-index/no-policy notices expected for a new zero-row private warehouse. Pre-existing managed/public extension findings such as `public.spatial_ref_sys`, PostGIS placement and `st_estimatedextent` remain outside Phase 14.2 and were not modified.
