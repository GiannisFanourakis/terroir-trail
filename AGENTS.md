# TerroirTrail Agent Rules

These rules are repository-level operating constraints for any AI agent, coding assistant, researcher, or maintainer working on TerroirTrail.

## Producer verification and import policy

Producer research and onboarding must be handled in batches of exactly **two producers at a time**.

### Mandatory acceptance gate

A producer candidate may enter the accepted/import queue only when all four of the following are independently verified:

1. **Official website**
   - The website must be controlled by the producer/business itself.
   - Social-media-only presence is not sufficient.
   - A reseller, distributor, tourism directory, marketplace, or unrelated hospitality site does not count as the producer's official website.

2. **Exact Google Maps place URL**
   - A direct Google Maps `/maps/place/...` URL for the intended producer point is mandatory.
   - Prefer the exact full place URL as supplied or discovered, preserving the embedded place identity and pin coordinates.
   - Do not replace it with a generic Google Maps search URL, shortened redirect, municipality link, or a URL for another branch.
   - Store the verified direct place URL in `google_maps_url`.

3. **Verified Google Place ID**
   - A valid Google Place ID is mandatory.
   - It must identify the exact producer location that TerroirTrail intends to represent.
   - Do not substitute a Place ID belonging to a reseller, city office, unrelated shop, restaurant, accommodation property, or different branch.

4. **Exact latitude and longitude**
   - Exact coordinates are mandatory.
   - When reading a Google Maps URL, use the actual place pin encoded by `!3d<lat>!4d<lng>`, not the viewport coordinates after `@`.
   - Approximate village/town centroids, postcode centroids, municipality centroids, manually estimated pins, or inferred coordinates are not acceptable.
   - The coordinates must correspond to the same physical location represented by the verified Google Place ID and direct Google Maps place URL.

### Required Google Maps verification procedure

For every producer candidate, perform the Google Maps check in this order:

1. Search Google Maps using the exact producer/business name. If necessary, add the verified locality or street address from the official website.
2. Open the specific Maps business/place result. Do not stop at autocomplete, a search-results page, Google Travel, an embedded map, or a generic coordinate/search URL.
3. When a clickable Google Maps / Directions / Location link is available on the producer's official website, a verified tourism/business page, or a Google result, **follow the link and resolve all redirects** until the final canonical Google Maps `/maps/place/...` URL is reached. Do not require the canonical URL to be visible in the source page itself.
4. Capture and preserve that resolved full direct Google Maps `/maps/place/...` URL for the exact listing.
5. Read the producer pin from the URL:
   - the coordinates after `@` are the map camera/viewport and are **not** authoritative for the producer point;
   - when present, `!3d<lat>!4d<lng>` are the actual Google place pin and must be used for `lat` / `lng`.
6. Resolve the Google Place ID for that same Maps listing.
   - When the direct Google Maps URL contains a feature pair in the form `!1s0x<hex_a>:0x<hex_b>`, use that exact pair to resolve the canonical `ChIJ...` Google Place ID for the same listing.
   - Prefer this URL-derived identity over unrelated search-result IDs, because it is tied to the exact Maps entity whose pin is being stored.
7. Cross-check the Maps listing against the official producer website using name plus at least one strong matching identifier such as street address, phone number, locality, or producer-owned directions link.
8. Confirm that the website, Maps URL, Place ID, and exact pin all describe the same intended physical producer/public point.
9. Record the exact direct Maps URL in `google_maps_url`; do not synthesize or shorten it.

A candidate does not pass merely because an address can be geocoded or because coordinates are published elsewhere. The actual Google Maps business/place identity must be established.

If a user supplies an exact Google Maps place URL, treat it as primary Maps evidence and extract the pin and identity from that URL, then still cross-check it against the producer's official website.

### Same-point identity rule

The official website, exact Google Maps place URL, Google Place ID, and exact coordinates must resolve to the same real-world producer/public point.

A producer-owned shop may be represented only when that shop is deliberately the public point TerroirTrail intends to list. Never combine:
- a Place ID for a shop with coordinates for a farm, winery, mill, dairy, or estate;
- a Place ID for an office with coordinates for a production site;
- coordinates from one branch with the Place ID of another.

When the intended point is ambiguous, reject the candidate until the conflict is resolved.

### Automatic rejection

A candidate goes to the **rejection list** when any mandatory acceptance-gate field cannot be established:

- official website missing or not confidently attributable to the producer;
- exact direct Google Maps place URL missing or not confidently attributable to the intended producer point;
- Google Place ID missing or not confidently attributable to the intended producer point;
- exact latitude/longitude missing;
- Place ID and coordinates resolve to different physical locations;
- producer identity cannot be confidently reconciled across the evidence.

Do not keep candidates in a temporary hold merely because one of these mandatory fields is missing.

Do not insert rejected candidates into:
- Supabase producer tables;
- bundled/offline fallback catalogues;
- SEO/static producer data;
- public maps;
- producer counts.

A rejected candidate may be reconsidered later only if new evidence resolves every mandatory acceptance-gate failure.

### Verification after the hard gate

Only after official website + exact Google Maps place URL + Place ID + exact coordinates pass should the remaining producer audit proceed.

Verify these fields independently and do not infer one from another:

- producer category and actual products;
- country, destination, region, locality;
- whether the point is a production site, estate, producer shop, visitor centre, or another verified producer point;
- official phone/contact channels;
- public visitability and visit status;
- road-access classification, evidence, and notes;
- image provenance/eligibility;
- grounded story/tagline and factual producer description.

### Visitability rule

A real production location does **not** automatically imply public visits.

Use the existing visit-status model and evidence. Do not invent tours, tastings, opening hours, walk-in access, booking availability, or partnership status.

### Road-access rule

Location verification and road-access verification are separate.

A correct Place ID or coordinate does not prove that the final approach is paved, rental-car suitable, unrestricted, or safe.

Keep road access fail-closed unless there is independent evidence supporting the classification.

### Data-quality invariants

- Unknown stays unknown.
- Never fabricate ratings, review counts, prices, opening hours, hospitality claims, amenities, experiences, road conditions, or partnership claims.
- Listing does not imply partnership.
- Public visitability does not imply TerroirTrail booking authority.
- Distinguish production sites from shops and sales offices.
- Google Maps place URLs must be direct URLs for the verified producer point; preserve the exact verified URL rather than synthesizing one from an address.
- Google Place IDs must be independently verified; leave them blank for existing legacy records if they are not verified rather than guessing.
- Quality takes priority over producer count.

### Import consistency

For every accepted producer that is eventually imported, reconcile all authoritative surfaces used by the current architecture, including Supabase and any bundled/offline fallback catalogue, tests, counts, and generated SEO/static outputs where applicable.

Run the repository's full validation gate (currently `npm run check`) before considering an import batch complete.
