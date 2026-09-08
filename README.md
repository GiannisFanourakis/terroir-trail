# 🍇 TerroirTrail Crete

> **Authentic Wineries, Traditional Rakokazana, Ancient Olive Mills & Mountain Shepherd Mitata.**
> An interactive alternative agritourism & terroir map web application for travelers exploring authentic Crete.

![TerroirTrail Banner](https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=80)

---

## 🌟 Vision & Market

Crete welcomes over 5 million visitors annually, but mass tourism concentrates visitors in coastal resort bubbles. Meanwhile, thousands of discerning travelers, couples, and gastro-tourists rent cars and head inland seeking **authentic, independent, family-run craft makers**:

* 🍇 **Indigenous Boutique Wineries:** Single-vineyard Vidiano, Liatiko, Romeiko, and ancient clay amphora fermentations.
* 🏺 **Traditional Rakokazana:** Wood-fired copper stills producing small-batch Tsikoudia / Raki with live village mezedes.
* 🫒 **Artisan Olive Mills & Ancient Groves:** Cold-pressed Koroneiki and ancient Tsounati olive oil from centuries-old family estates.
* 🧀 **Mountain Shepherd Mitata & Dairies:** Raw-milk Graviera, Pichtogalo, and Mizithra crafted in dry-stone alpine huts at 1,200m elevation.
* 🍯 **Wild Herb Foragers & Apiaries:** Rare single-origin mountain thyme honeys and wild foraged Malotira (mountain tea) and Diktamos.

---

## 🚀 Key Features

* 🗺️ **Interactive Vector Map Canvas:** Centered on Crete with custom color-coded category pins, responsive zoom-to-bounds, and dual map styles (Voyager & Topographic Mountain Terrain).
* 🔍 **Multi-Dimensional Terroir Filters:**
  * **Regions:** Chania, Rethymno, Heraklion, Lasithi.
  * **Road Accessibility:** Paved Road (Rental car friendly), Gravel Road, 4x4 Required.
  * **Artisanal Ethos:** Certified Organic, Indigenous Varieties Only, Amphora Fermentation, Wood-Fired Still, Ancient Groves, Raw Milk.
  * **On-Site Food:** Full Authentic Taverna, Tasting Board, Dakos & Bread.
  * **Hospitality Toggles:** Dog-friendly, Walk-ins welcome, Campervan overnight friendly.
* 📖 **Slide-Out Story Drawer:** Unveils the maker's heritage, tasting highlights, opening hours, road difficulty warnings, and 1-click Google Maps navigation.
* 🧭 **Curated Day-Trip Loops:** Pre-planned 3-stop daily circuits across Heraklion, Chania, and Rethymno with time estimates and road distances.

---

## 🛠️ Modular Architecture

```
terroir-trail/
├── public/
├── src/
│   ├── types/
│   │   └── terroir.ts              # TypeScript models for Producer, Category, FilterState, DayTripLoop
│   ├── data/
│   │   ├── producers.ts            # Curated dataset of authentic Cretan makers across 4 prefectures
│   │   └── loops.ts                # Curated 3-stop Day-Trip itineraries
│   ├── components/
│   │   ├── Header/
│   │   │   └── Header.tsx          # Brand, region selector, live search, mobile toggles
│   │   ├── FilterBar/
│   │   │   └── FilterBar.tsx       # Category tabs, road access dropdowns, ethos chips, quick toggles
│   │   ├── Map/
│   │   │   └── MapCanvas.tsx       # Leaflet-based map with custom SVG pins, popups, and layer toggles
│   │   ├── Sidebar/
│   │   │   ├── ProducerList.tsx    # Filtered artisan list with sorting (Rating, Reviews, Name)
│   │   │   └── ProducerCard.tsx    # Rich card with badges, tags, and story CTA
│   │   ├── Drawer/
│   │   │   └── ProducerDetailDrawer.tsx # Slide-in maker profile, varieties, tastings, and navigation
│   │   └── Loops/
│   │       └── DayTripModal.tsx    # Curated day-trip routes modal
│   ├── styles/
│   │   └── index.css               # Tailwind CSS v4 & custom Leaflet styling
│   ├── App.tsx                     # Master layout & filtering state orchestrator
│   ├── main.tsx                    # React 19 entrypoint
│   └── vite-env.d.ts
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 💻 Getting Started Locally

```bash
# Clone the repository
git clone https://github.com/GiannisFanourakis/terroir-trail.git

# Enter the project directory
cd terroir-trail

# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build
```

---

## 📜 License
MIT License. Crafted with love for authentic Cretan agriculture & cultural heritage.
