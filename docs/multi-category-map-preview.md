# Multiple maker categories — implementation and rollout

Branch: `feat/multi-category-map`, based on `6754053`. The user confirmed the map preview works on 2026-10-08.

## Development preview

From the separate worktree:

```powershell
node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5174 --strictPort
```

Open http://localhost:5174/?preview=categories&country=GR&destination=crete&focus=anoskeli-estate . The normal header and map controls are used; no extra preview toolbar appears. The development-only overlay shows dual, triple, four-category and museum examples at existing coordinates. Production builds exclude the sample overlay and preview camera behavior.

## Behavior and taxonomy

One producer remains one entity, one map point and one overall count. The primary `category` remains canonical. `additional_categories` holds other verified maker activities; category filters and SEO groups match either field. Pins show up to three maker symbols and a `+N` count. Cards and details show every maker badge. Badge rows contain maker categories only. Tasting, guided tours and museums appear as text under Visiting & Access. The museum symbol remains a separate map-pin badge and filter checkbox.

Museum is a `visitor_features` value, not a fourteenth maker category. It does not establish current public access. `product_sections` groups source-backed specialties and varieties by maker activity, with legacy fields retained as a fallback.

The reviewed classifications cover ten existing producers with multiple maker activities and Canava Santorini's museum. Anoskeli is a winery and olive mill; externally distilled tsikoudia does not establish an on-site distillery. Canava's museum and product evidence use a dated public listing, rather than current first-party access confirmation. Striligkas is not added.

## Database rollout

The three migrations were applied to production Supabase on 2026-10-08. Filenames match their recorded migration versions:

- `20261008182959_producer_multiple_categories.sql`: allowlisted additional maker categories and visitor features, optional JSON product sections, and a GIN index.
- `20261008183004_reviewed_multiple_category_producers.sql`: guarded classifications and source evidence for eleven existing active IDs.
- `20261008183009_reviewed_multiple_category_content.sql`: source-backed copy and product fields for La Vinyeta, Stilianou, Anoskeli and Canava. Field guards prevent overwriting another edit made after review.

La Vinyeta's narrative and product list now include estate-made cheese and honey. Stilianou's tagline and story include organic olive oil. Its olive-oil tasting highlight omits a price because its official pages quote conflicting prices. Anoskeli and Canava have product fields and factual maker highlights.

Live verification found 146 active producers, 10 with multiple categories, one museum feature and 11 populated product-section records. No producer was inserted. Existing primary classifications, identities, coordinates and access facts were preserved; all other producer records matched their pre-rollout hash. The migration change introduced no new security-advisor findings.

## Release workflow

After the database migration, refresh the authoritative snapshot with `npm run sync:seo-catalogue`, verify it with `npm run verify:live-catalogue`, and run `npm run check`. Include the refreshed runtime fallback and SEO snapshot in the feature-branch commit. Merge into main, deploy Firebase Hosting with `npm run deploy`, and verify the public and browser smoke checks.

## Verification

Behavioral tests cover primary/additional membership, unique producer counts, museum separation, malformed metadata, HTML escaping, marker anchors, grouped products, the production preview guard and authoritative cache ownership. The typecheck and 39 targeted map/category/service tests passed during rollout. The original preview browser checks cover dual/triple/four/museum examples and grouped products at 1440, 390 and 320 px widths.

All three SQL migrations passed isolated PostgreSQL checks using the current reviewed producer data. Verification covered unchanged identity/access fields and unreviewed records, repeat-safe data/evidence seeding, invalid-value rejection, atomic failure for missing/inactive/recategorized producers, and preservation of concurrently edited content.

The complete `npm run check` gate passed after the live catalogue refresh: 706 frontend tests, 191 server tests and 27 rules tests, plus typecheck, lint, format, public-grants, catalogue audit, build, SEO/AEO and link-graph checks. `npm run verify:live-catalogue` confirmed exact parity for all 146 active producer records.

The aggregate JS budget is 855 KB gzip; the verified build uses 853.1 KB total JS, 291.2 KB main/largest JS and 25.1 KB CSS. Initial/main and largest-chunk limits remain 330 KB; the CSS limit remains 32 KB. Preview data and UI are absent from the production bundle.
