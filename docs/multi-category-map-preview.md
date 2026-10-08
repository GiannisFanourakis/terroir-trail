# Multiple maker categories — map review

Branch: `feat/multi-category-map`, based on `6754053`.

## Open the development preview

From the separate worktree, run:

```powershell
node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5174 --strictPort
```

Open http://localhost:5174/?preview=categories&country=GR&destination=crete&focus=anoskeli-estate . The development-only selector switches between dual, triple, four-category and museum examples. It focuses the actual existing coordinates. Production builds exclude the selector, sample classification overlay and preview camera behavior.

## What changes

One producer remains one entity, one map point and one overall count. The primary `category` stays unchanged. `additional_categories` holds other verified maker activities; category filters and SEO category groups match either field. Pins show up to three maker symbols and a `+N` count. Cards and details show every maker badge. These badge rows contain maker categories only; visitor features such as tasting, guided tours and museums are shown as text under Visiting & Access. The museum symbol remains a separate map-pin badge. Optional product sections group specialties and varieties by activity.

Museum is a `visitor_features` value, with a separate blue badge and checkbox. It is not a fourteenth maker category and does not imply current public access. Existing location, visiting and road evidence remain authoritative.

The reviewed overlay covers ten existing producers with multiple maker activities and Canava Santorini's museum example. Anoskeli is a winery and olive mill; its externally distilled tsikoudia does not establish an on-site distillery. Canava's museum is supported by a dated public listing, recorded as `public_listing`, rather than current first-party access confirmation. Striligkas is not added by this change.

## Database rollout after map review

Two additive migrations are prepared and have not been applied to production:

- `20261008111640_producer_multiple_categories.sql`: allowlisted secondary category and visitor feature arrays, optional JSON product sections, and a GIN index.
- `20261008112330_reviewed_multiple_category_producers.sql`: guarded updates to the eleven existing active IDs and source evidence. The migration aborts if an ID is missing, inactive or has changed its primary classification. No producer is inserted and no coordinates or access facts are changed.

After approval of the map, apply the migrations, refresh the authoritative catalogue with `npm run sync:seo-catalogue`, run `npm run verify:live-catalogue` and `npm run check`, commit the refreshed snapshot, merge the feature branch into main, then deploy and run the public/browser smoke checks. The refreshed fallback and SEO snapshot must be included in the merge.

## Verification

Behavioral tests cover primary/secondary membership, deduplication, museum separation, malformed metadata, HTML escaping, marker anchors, product grouping, the production preview guard and authoritative cache ownership. Real browser checks cover the dual/triple/four/museum examples and grouped products at 1440, 390 and 320 px widths.

Both migrations were executed in an isolated PostgreSQL test database. Checks confirmed unchanged identity/location/access fields, preserved unreviewed values, repeat-safe data/evidence seeding, invalid-value rejection and atomic failure for missing reviewed producers. Production Supabase remains unchanged.

The aggregate JS budget increases from 850 to 855 KB gzip because the existing build was already at approximately 850 KB and this feature adds approximately 2 KB. Initial/main and largest-chunk limits remain 330 KB; the CSS limit remains 32 KB. Preview data and UI are absent from the production bundle.
