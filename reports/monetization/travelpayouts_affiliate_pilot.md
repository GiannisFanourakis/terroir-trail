# Travelpayouts Affiliate Carousel Pilot

**Implementation date:** 2026-09-16  
**Status:** Implemented in repository; build/deploy/production verification still required.

## Scope

TerroirTrail now uses one restrained rotating travel-affiliate carousel rather than multiple simultaneous ad placements.

Current tracked Travelpayouts campaigns:

- Klook — experiences
- Localrent — car rental
- Welcome Pickups — transfers
- GetTransfer — transfers
- Yesim — eSIM/connectivity

Each campaign uses an explicit `sub_id` so Travelpayouts reporting can distinguish carousel placements and campaign performance.

## Product rules

- One affiliate offer is visible at a time.
- The carousel rotates every 14 seconds.
- Every offer is clearly disclosed as `Affiliate · Sponsored`.
- Links use `rel="sponsored noopener noreferrer"`.
- Unsupported `Official Partner` wording and unverified service promises were removed.
- The active map monetization slot now renders the Travelpayouts carousel rather than the dormant AdSense slot.
- AdSense infrastructure remains in the repository but is not the active monetization surface for this pilot.

## Feature gate

The carousel is controlled by:

```env
VITE_ENABLE_TRAVEL_AFFILIATES=true
```

Production explicitly enables the pilot. Development/test defaults remain fail-closed unless the flag is intentionally enabled.

## Ad-free traveler passes

The current traveler account model uses `hasExplorerPass` as the active entitlement flag and `explorerPassPlan` to distinguish `holiday` and `annual` plans.

The affiliate carousel renders nothing when `hasExplorerPass` is active. This means both the Explorer/Holiday pass and the Annual Traveler pass are ad-free when those commercial plans are activated later.

The plan value by itself does not remove ads; the active entitlement flag remains authoritative so an expired/inactive plan cannot accidentally receive ad-free treatment.

## Verification required before calling the pilot complete

1. Pull the latest `main` branch.
2. Run `npm run check`.
3. Deploy with `npm run deploy` if the quality gate passes.
4. Verify production shows one rotating affiliate offer for a normal traveler/non-signed-in visitor.
5. Verify an account with an active pass entitlement sees no affiliate carousel.
6. Verify outbound links preserve the expected Travelpayouts destination and `sub_id`.

Do not mark the roadmap monetization item complete until those checks pass.
