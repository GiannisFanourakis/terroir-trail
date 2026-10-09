# Multiple maker categories — implementation and rollout

Original branch: `feat/multi-category-map`, based on `6754053`. The user confirmed the map preview works on 2026-10-08. It was merged as `3df96c1` and deployed that day. Quality Gate `37825948671` and Production Deploy `37826309189` succeeded; production version/catalogue state and the dual/triple/four-category/museum desktop and phone cases were independently verified.

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

Refresh the active Supabase catalogue plus approved public listing edits with `npm run sync:seo-catalogue`, verify it with `npm run verify:live-catalogue`, and run `npm run check`. Include the refreshed runtime fallback and SEO snapshot in the feature-branch commit. Merge into main and use the existing Quality Gate → Production Deploy workflow, which releases the frontend and trusted API and verifies public/browser smoke checks. The deployment refreshes approved public edits; pending requests are never included. Database edits alone do not trigger a release, and the scheduled Production Smoke workflow checks health without republishing the catalogue.

## Verification

Behavioral tests cover primary/additional membership, unique producer counts, museum separation, malformed metadata, HTML escaping, marker anchors, grouped products, the production preview guard and authoritative cache ownership. The typecheck and 39 targeted map/category/service tests passed during rollout. The original preview browser checks cover dual/triple/four/museum examples and grouped products at 1440, 390 and 320 px widths.

All three SQL migrations passed isolated PostgreSQL checks using the current reviewed producer data. Verification covered unchanged identity/access fields and unreviewed records, repeat-safe data/evidence seeding, invalid-value rejection, atomic failure for missing/inactive/recategorized producers, and preservation of concurrently edited content.

The complete `npm run check` gate passed after the live catalogue refresh: 706 frontend tests, 191 server tests and 27 rules tests, plus typecheck, lint, format, public-grants, catalogue audit, build, SEO/AEO and link-graph checks. `npm run verify:live-catalogue` confirmed exact parity for all 146 active producer records.

For the original rollout, the aggregate JS budget was 855 KB gzip; its verified build used 853.1 KB total JS, 291.2 KB main/largest JS and 25.1 KB CSS. Initial/main and largest-chunk limits remain 330 KB; the CSS limit remains 32 KB. Preview data and UI are absent from the production bundle.

## Display and editing follow-up — 2026-10-09

The `fix/multi-category-followups` branch extends the shared maker badges to trip cards, Add to Trip and promoted producer cards. Printable/offline HTML and calendar exports include every verified maker category once and never treat museum, tasting or tours as maker categories.

Verified Hosts can propose additional maker categories and products grouped by activity. The primary category stays fixed. The form requires an official evidence URL for classification/product changes; Admin moderation shows the source, canonical primary and complete proposed product groups. The server checks active Supabase identity and primary category, validates bounded allowlisted categories/product lists, and publishes only after trusted Admin approval. A changed primary blocks approval; rejected or pending requests do not change public data. Existing client-write restrictions continue to block direct category/product publication.

Reviewed edits use the existing public Firestore `producer_overrides` layer. Shared projection applies only to an active catalogue entity and the primary category that was reviewed. Runtime category filtering and product search run after that projection, and trip exports and catalogue/SEO synchronization apply it too. Group edits also refresh the legacy specialty/variety view so cleared or removed groups do not reappear in fallback displays or search. Supabase continues to own identity, publication, geography and primary category; no new producer records or schema changes are required.

Follow-up validation passed: 714 frontend tests, 200 server tests and 28 rules tests (942 total), plus the complete `npm run check` typecheck/lint/format/data/SEO/AEO/link-graph gate. Exact live parity still covers all 146 active producers. Real Chrome checks passed at phone, portrait/landscape tablet and desktop sizes; the actual classification editor also passed desktop/phone interaction checks for four groups, category removal, the fixed primary, visitor-feature separation and required evidence, without submitting a live request.

The follow-up aggregate JS limit is 858 KB gzip, allowing the measured 2.3 KB increase for shared review logic and lazy Host/Admin editing. The verified build uses 855.4 KB total JS, 291.3 KB main/largest JS and 25.1 KB CSS. Main/largest limits remain 330 KB and CSS remains 32 KB. No dependencies were added.

Production release verification is in progress.
