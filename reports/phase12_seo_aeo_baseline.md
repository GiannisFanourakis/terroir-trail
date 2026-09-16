# Phase 12 — SEO, AEO & Entity Discovery Baseline

**Recorded:** 2026-09-16  
**Search Console settled through:** 2026-09-13  
**Property:** `https://terroir-trail.web.app/`

## Why this phase comes before further catalogue expansion

TerroirTrail already contains a substantial audited catalogue, but search engines currently have only one meaningful acquisition page: the homepage. The next expansion phase is therefore deferred until the existing producer knowledge is exposed as durable, crawlable, canonical entities.

## Google Search Console baseline

Last 28 settled days:

- 6 clicks
- 22 impressions
- 27.27% CTR
- 4.74 average position
- exactly one page has Search Console performance: `https://terroir-trail.web.app/`

Current sitemap performance:

- sitemap: `https://terroir-trail.web.app/sitemap.xml`
- 2 sitemap URLs
- 1 sitemap URL with Search Console impressions
- homepage: 6 clicks / 22 impressions
- `privacy.html`: 0 clicks / 0 impressions

Fresh URL Inspection on 2026-09-16 confirms:

- homepage: **Submitted and indexed**, indexing allowed, robots allowed, fetch successful, crawled as mobile; last recorded crawl 2026-09-10
- `?producer=anoskeli-estate`: **URL is unknown to Google**
- `?producer=domaine-sigalas`: **URL is unknown to Google**
- `?producer=alpha-estate`: **URL is unknown to Google**
- `?producer=gaia-wines-nemea`: **URL is unknown to Google**
- `?producer=monteraponi-tuscany`: **URL is unknown to Google**

This is the central Phase 12 benchmark: producer detail views work as application state, but Google does not currently know them as independent entities/URLs.

## Current technical strengths

- homepage is crawlable and indexed
- robots allow indexing
- sitemap exists and is valid
- homepage has title, description, canonical, Open Graph/Twitter metadata and JSON-LD
- `llms.txt` exists
- build already runs an SEO verification script
- audited producer data is available in deterministic bundled fallback snapshots, so generated search pages can be built from evidence-backed data instead of synthetic copy

## Current gaps

1. Producer deep links use `?producer=<id>` application state rather than canonical content URLs.
2. Sitemap exposes only the homepage and privacy page.
3. There are no crawlable producer pages, category landing pages, destination pages or guide pages as independent URLs.
4. Internal producer cards do not expose ordinary crawlable producer links.
5. `llms.txt` and homepage machine-readable copy still describe the pre-Phase-10B state (36 records / Crete + Santorini / Peloponnese next), while the audited bundled catalogue now also contains Phase 10B Peloponnese, Northern Greece and Tuscany records.
6. SEO verification currently protects the old machine-readable state instead of verifying the current catalogue/entity architecture.

## Phase 12 implementation sequence

### 12A — Canonical producer entities

- Generate a real `/producers/<id>/` HTML page for every audited bundled producer/project.
- Give every producer page unique title, description, canonical URL, social metadata and source-backed visible HTML.
- Add producer/entity JSON-LD without inventing visitor, access, product or partnership claims.
- Make the React app understand `/producers/<id>/` and open the normal producer detail experience for human visitors.
- Keep legacy `?producer=<id>` links working and upgrade them to the canonical path in the browser.
- Expose crawlable producer links from the producer list.
- Generate the production sitemap from the audited catalogue at build time.
- Extend automated SEO verification to every generated producer page.

### 12B — Destination, region and category architecture

Create useful indexable landing pages only where the catalogue supports meaningful content, beginning with current audited destinations and high-value producer categories. Avoid thin combinatorial pages.

### 12C — Discovery Guide URLs and internal linking

Expose published verified-stop Discovery Guides as canonical pages and connect producer ↔ destination ↔ category ↔ guide relationships with ordinary HTML links.

### 12D — Answer-ready entity content

Standardize direct, factual answers around what a producer makes, where it is, whether visits are confirmed, whether booking/contact is required, and what is actually known about location and road access.

### 12E — Measurement and closeout

Repeat URL Inspection on representative producers and track the progression:

**Unknown → Discovered → Crawled → Indexed → Impressions → Clicks**

Search Console expansion success is measured primarily by growth in indexed/performing non-homepage pages and relevant producer/category/destination queries, not by preserving the unusually high early homepage CTR.

## Quality rule

SEO/AEO may reorganize and expose verified information, but it must never manufacture missing facts, turn a mapped point into a visitor attraction, imply a partnership, or turn uncertain road/visitability data into positive marketing language.
