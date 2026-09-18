# TerroirTrail Agent Rules

These rules are repository-level operating constraints for any AI agent, coding assistant, researcher, or maintainer working on TerroirTrail.

## Producer verification and import policy

Producer research and onboarding must be handled in batches of exactly **two producers at a time**.

### Mandatory acceptance gate

A producer candidate may enter the accepted/import queue only when all three of the following are independently verified:

1. **Official website**
   - The website must be controlled by the producer/business itself.
   - Social-media-only presence is not sufficient.
   - A reseller, distributor, tourism directory, marketplace, or unrelated hospitality site does not count as the producer's official website.

2. **Verified Google Place ID**
   - A valid Google Place ID is mandatory.
   - It must identify the exact producer location that TerroirTrail intends to represent.
   - Do not substitute a Place ID belonging to a reseller, city office, unrelated shop, restaurant, accommodation property, or different branch.

3. **Exact latitude and longitude**
   - Exact coordinates are mandatory.
   - Approximate village/town centroids, postcode centroids, municipality centroids, manually estimated pins, or inferred coordinates are not acceptable.
   - The coordinates must correspond to the same physical location represented by the verified Google Place ID.

### Same-point identity rule

The official website, Google Place ID, and exact coordinates must resolve to the same real-world producer/public point.

A producer-owned shop may be represented only when that shop is deliberately the public point TerroirTrail intends to list. Never combine:
- a Place ID for a shop with coordinates for a farm, winery, mill, dairy, or estate;
- a Place ID for an office with coordinates for a production site;
- coordinates from one branch with the Place ID of another.

When the intended point is ambiguous, reject the candidate until the conflict is resolved.

### Automatic rejection

A candidate goes to the **rejection list** when any mandatory acceptance-gate field cannot be established:

- official website missing or not confidently attributable to the producer;
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

Only after website + Place ID + exact coordinates pass should the remaining producer audit proceed.

Verify these fields independently and do not infer one from another:

- producer category and actual products;
- country, destination, region, locality;
- whether the point is a production site, estate, producer shop, visitor centre, or another verified producer point;
- official phone/contact channels;
- public visitability and visit status;
- Google Maps URL;
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
- Google Place IDs must be independently verified; leave them blank for existing legacy records if they are not verified rather than guessing.
- Quality takes priority over producer count.

### Import consistency

For every accepted producer that is eventually imported, reconcile all authoritative surfaces used by the current architecture, including Supabase and any bundled/offline fallback catalogue, tests, counts, and generated SEO/static outputs where applicable.

Run the repository's full validation gate (currently `npm run check`) before considering an import batch complete.
