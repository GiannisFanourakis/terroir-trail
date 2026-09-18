# Pre-Deployment Intermediate Hotfix Report: Mobile UX & Map Performance

**Date:** 2026-09-17
**Repository:** `GiannisFanourakis/terroir-trail`
**Branch:** `main`
**Status:** Ready for Preflight Verification (Production Deployment Gated)

---

## 1. Executive Summary

This hotfix addresses the intermediate pre-deployment objectives identified following the multi-region boundary expansion and final documentation pass:
1. **Resolved documentation inaccuracies** in `README.md` (clean destination producer counts, aggregated category statistics, removed outdated React-Leaflet reference, and harmonized boundary attributions with `LICENSE.md`).
2. **De-cluttered the mobile user experience** through progressive disclosure in `Header.tsx` (compact destination picker, expandable search bar, collapsed header height on mobile), `FilterBar.tsx` (accessible 44px touch targets), and `MapCanvas.tsx` (collapsed 4-theme picker into single style menu, hidden redundant zoom buttons on touch screens).
3. **Optimized Leaflet map responsiveness** by eliminating full marker teardown on producer selection, diffing markers by ID on filter changes, cleaning up compositor-thrashing `will-change: transform` styles in `index.css`, implementing compact circular pins on coarse pointers, coalescing container resize operations via `requestAnimationFrame`, and debouncing search queries in `useProducers.ts`.
4. **Recorded milestone** in `ROADMAP.md` and enforced the pre-deployment gate.

> [!IMPORTANT]
> **Production Deployment Gate**:
> Production deployment remains gated on verification of this hotfix AND separate resolution of the Supabase PostGIS security issue around `public.spatial_ref_sys` (ticket SU-475614). **DO NOT DEPLOY** until both gates pass.

---

## 2. Root Cause Analysis & Technical Decisions

### A. Leaflet Marker Recreation on Selection
- **Diagnosis:** `MapCanvas.tsx` previously had `[producers, selectedProducer]` in the marker rendering effect dependency array. Whenever a user tapped a pin or selected a producer from the drawer/list, every single marker on the map was destroyed (`marker.remove()`) and rebuilt from scratch (`new L.divIcon`, `new L.marker`, `marker.addTo(map)`). On mobile, this caused noticeable 150–300ms frame drops and DOM thrashing.
- **Fix:** Split marker collection diffing from marker selection:
  - **Collection Effect `[producers]`:** Diffs markers by ID against `markersRef.current`. Stale markers are removed; existing markers remain on the map untouched; only newly matching markers are instantiated.
  - **Selection Effect `[selectedProducer]`:** Isolates icon and `zIndex` updates. When a selection changes, only the previous marker's icon and the next marker's icon are updated (`marker.setIcon()`, `marker.setZIndexOffset()`). Zero markers are destroyed or created.

### B. Hardware Acceleration & Compositor Layer Explosion
- **Diagnosis:** `src/index.css` had `will-change: transform;` declared across `.leaflet-tile-container`, `.leaflet-tile`, and `.leaflet-map-pane`. On mobile Safari (WebKit) and mobile Chrome (Blink), applying `will-change: transform` to dozens of raster/vector map tiles simultaneously forces the GPU compositor to allocate separate texture memory buffers for each tile, causing VRAM pressure, checkerboarding during pans, and potential tab memory crashes.
- **Fix:** Removed `will-change: transform;` while preserving GPU hardware acceleration via `transform: translateZ(0); backface-visibility: hidden;`.

### C. Pin Overlap on Touch Screens
- **Diagnosis:** Map pins defaulted to 180px capsules displaying producer name and rating. On small mobile displays (<400px wide) with clusters of 5–10 producers (e.g. Heraklion, Chania, Nemea), the wide capsules overlapped each other extensively, making individual pins difficult to tap.
- **Fix:** Introduced `@media (hover: none) and (pointer: coarse)` in `src/index.css` so that on mobile touch devices, unselected pins default to compact 36px circular badges. When tapped, the active pin expands into the full badge (`active-pin`), ensuring legible and tap-friendly interactions.

### D. Mobile Header & Viewport Height Reclamation
- **Diagnosis:** On mobile viewports (<640px), the header previously rendered two stacked rows permanently: Row 1 contained the brand logo, profile, saved button, and hamburger menu; Row 2 contained a 62%-width horizontal destination scroll strip alongside a cramped 38%-width search bar. Together with safe-area padding and the FilterBar, this consumed ~140px of vertical space, leaving insufficient visible map area on phones.
- **Fix:** Replaced the stacked mobile header with progressive disclosure:
  - **Single Compact Header Row:** Logo, destination dropdown button (e.g. `[ Crete ▾ ]` showing the active destination with a 44px tap target), search icon button, saved places button, and menu hamburger button.
  - **Expandable Search Mode:** Tapping the search icon smoothly expands a full-width search input with auto-focus and clear/cancel controls, eliminating cramped text fields.
  - **Height Savings:** Reclaims ~44px of vertical viewport height for the interactive map.

### E. Map Controls & Touch Target Sizing (WCAG 2.5.5)
- **Diagnosis:** The map overlay contained 4 persistent theme buttons horizontally (`Terroir`, `Voyager`, `Night`, `Satellite`) and a vertical stack of 5 utility buttons (`+`, `-`, `Reset`, `Locate`, `Pin Density`), several of which were sized at 32×32px (`w-8 h-8`), falling short of the recommended 44×44px touch target standard.
- **Fix:**
  - On mobile (`<sm`), collapsed the 4 theme buttons into a single `Map Style` button (`Layers` icon + label), opening a compact dropdown menu on tap.
  - On mobile, hid redundant `+` and `-` zoom buttons (pinch-to-zoom is native to touch screens).
  - Enlarged touch targets for remaining utility controls (`Reset View`, `Locate Me`, `Pin Density`) to `w-11 h-11` (44×44px minimum) on mobile.

### F. Network Search Debouncing
- **Diagnosis:** Typing into the search bar triggered `refresh()` in `useProducers.ts` on every keystroke, generating redundant remote queries against the database before the user finished typing.
- **Fix:** Debounced the remote query parameter by 250ms in `useProducers.ts`. Immediate client-side filtering via `filterProducers` continues to run with zero perceptible latency.

---

## 3. Verification & Quality Gates

The following test suites and preflight verification scripts were run:
- **Marker Diffing & Isolation Tests:** Verified in `src/components/Map/MapCanvas.test.ts` (100% pass).
- **Search Debounce Tests:** Verified in `src/hooks/useProducers.test.ts` (100% pass).
- **Positioning & Regional Boundaries:** Verified in `src/data/terroirRegions.test.ts` and `src/components/phase8PublicPositioning.test.ts` (100% pass).
- **Quality Gate (`npm run check`):**
  - TypeScript compilation (`tsc --noEmit` & `tsc -p tsconfig.server.json --noEmit`)
  - ESLint code quality checks
  - Prettier formatting validation
  - Vitest frontend test suites
  - Server test suites
  - Firestore Security Rules emulator tests
  - Production Vite build and SEO landing page verification
- **Mobile Preflight:** `npm run mobile:preflight -- all`.
- **Python Audit Tools:** `npm run test:python`.
- **Git Diff Hygiene:** `git diff --check`.

---

## 4. Corrective Pass Additions

Following initial verification, a targeted corrective pass completed the following items:
1. **Mobile FilterBar Progressive Disclosure:**
   - Replaced permanent 9-category horizontal chip strip on `< sm` with a compact `Categories & Filters` trigger button showing active category icon/label and total active filter count badge.
   - Preserved rich desktop chip strip on `sm+`.
   - Exposed category grid and secondary filter controls inside an accessible animated expandable mobile panel (`min-h-[44px]` touch targets, zero horizontal overflow).
   - Ensured `Reset` button displays only when filters or search queries are active.
2. **Same-ID In-Place Marker Updates & Stale Click-Handler Resolution:**
   - Introduced lightweight marker signatures (`id`, `coordinates`, `name`, `village`, `region`, `effectiveCategory`, `rating`).
   - For existing markers with unchanged ID, updates `LatLng` if coordinates change and updates icon HTML if display data changes, preserving current selection state.
   - Refactored click handlers to resolve the current `Producer` object from `producersMapRef.current` at click time instead of permanently closing over stale objects.
3. **Mobile Search Font (16px):**
   - Updated mobile search input to `text-base sm:text-xs` (16px on mobile) to eliminate iOS Safari viewport auto-zoom upon focus.
4. **Consistent Map Motion & Reduced-Motion Preference:**
   - Created `getMapMotionPreference`, `flyOrSetView`, and `fitBoundsWithMotion` helpers.
   - Applied consistently across producer selection, destination switching, reset destination view, locate me, and region fit/focus.
   - Automatically zeroes animation and uses instant `setView` when `prefers-reduced-motion: reduce` is active.
   - Keeps mobile camera animations short and snappy (0.5s duration).
