# 🍇 TerroirTrail: Mediterranean Artisan Agritourism

> **Authentic Wineries, Local Craft Microbreweries, Traditional Rakokazana, Ancient Olive Mills & Mountain Dairies.**
> An interactive alternative agritourism & terroir web application for travelers exploring authentic Greece (Crete, Santorini, Peloponnese, Northern Greece).

![TerroirTrail Banner](https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=80)

---

## 🌟 Vision & Curated Scope

While mass tourism concentrates in coastal resort bubbles, discerning travelers, culinary explorers, and road-trippers rent cars and venture into the hinterlands seeking **authentic, independent, family-run craft makers**:

* 🍇 **Indigenous Boutique Wineries:** Single-vineyard Vidiano, Liatiko, Romeiko, Assyrtiko, Agiorgitiko, Xinomavro, and ancient clay amphora fermentations.
* 🍺 **Local Craft Microbreweries:** Independent unpasteurized craft ales, IPAs, and fresh lagers brewed with local mountain water, wild herbs, and volcanic rock filtration.
* 🏺 **Traditional Rakokazana:** Wood-fired copper stills producing small-batch Tsikoudia / Raki with live village mezedes.
* 🫒 **Artisan Olive Mills & Ancient Groves:** Cold-pressed Koroneiki and ancient Tsounati olive oil from centuries-old family estates.
* 🧀 **Mountain Shepherd Mitata & Dairies:** Raw-milk Graviera, Pichtogalo, and Anthotyros crafted in alpine huts and mountain valleys.
* 🍯 **Wild Herb Foragers & Apiaries:** Rare single-origin mountain thyme honeys and wild foraged Malotira (mountain tea) and Diktamos.

---

## 🏛️ Data Provenance & Verification

The information in TerroirTrail is curated from authentic viticultural, brewing, and agricultural registries across Greece:

1. **Wineries & Appellations:**
   * **Wines of Crete (`winesofcrete.gr`):** Certified member estates across Chania, Rethymno, Heraklion, and Lasithi (e.g. Manousakis, Dourakis, Lyrarakis, Silva Daskalaki, Paterianakis, Iliana Malihin).
   * **Wines of Greece & Regional Associations:** Peloponnese Winemakers Association (*ENOAP* - Nemea), Northern Greece Winemakers (*ENOABE* - Naoussa), and PDO Santorini volcanic viticulture registry (Vassaltis, Santo, Sigalas).
   * **PDO / PGI Designations:** Formally recognized native Greek grape varieties (Vidiano, Mandilaria, Vilana, Romeiko, Assyrtiko, Agiorgitiko, Xinomavro).

2. **Craft Microbreweries:**
   * Independent craft brewing registries in Greece:
     * **Cretan Brewery (Charma):** First independent microbrewery in Crete (Zounaki, Chania), featuring open-air taprooms and fresh unpasteurized tank beer.
     * **Solo Craft Brewery:** Internationally acclaimed craft brewer based in Heraklion, known for radical unfiltered ales (Fourtouna, Psaki).
     * **Lafkas Brewery:** Artisanal Greek-Belgian brewery in Chania brewing with local mountain water and Cretan raw ingredients.
     * **Santorini Brewing Company:** Legendary volcanic craft microbrewery in Mesa Gonia (Donkey Beer series).

3. **Traditional Distilleries & Olive Mills:**
   * Traditional village *kazanaris* distillation permits (custom autumn Tsikoudia distillation in Zaros, Spili, and Amari).
   * Certified organic single-estate olive oil producers (Biolea Astrikas traditional stone mill & hydraulic press, Anoskeli, Sitia PDO estates).

4. **Road Accessibility & GPS Coordinates:**
   * Verified decimal coordinates matched against OpenStreetMap and satellite imagery to ensure accurate rural navigation without getting stuck on rough mountain goat tracks.
   * Explicit road access categorization: *Smooth Asphalt (Standard Car)*, *Compact Gravel (Standard Car OK)*, or *High Mountain Dirt Track (4x4 Recommended)*.

---

## 🚀 Key Features

* 🗺️ **100% Free & Open Interactive Map:** Built with Leaflet, CartoDB Voyager, Dark Mode, and High-Resolution Satellite tiles. Zero Google Maps API keys or billing required, with 1-click external navigation links to Google Maps/Apple Maps.
* 🔍 **Multi-Dimensional Terroir Filters:**
  * **Macro Destinations:** All Terroir, Crete, Santorini, Peloponnese (Nemea), Northern Greece (Naoussa).
  * **Artisan Categories:** Wineries, Craft Microbreweries, Rakokazana, Olive Mills, Shepherd Dairies, Wild Honey & Herbs.
  * **Road Accessibility:** Paved Road (Rental car friendly), Gravel Road, 4x4 Required.
  * **Artisanal Ethos:** Certified Organic, Biodynamic, Indigenous Only, Amphora Fermentation, Wood-Fired, Raw Milk, Unpasteurized Craft Beer.
  * **On-Site Food:** Full Authentic Taverna, Tasting Board, Dakos & Bread, Brewery Taproom.
  * **Hospitality Toggles:** Dog-friendly, Walk-ins welcome, Campervan overnight friendly.
* ❤️ **Favorites & Trip Wishlist:** One-click heart save on sidebar cards, map popups, and drawer headers. Saved spots persist in browser `localStorage`.
* 📖 **Slide-Out Story Drawer:** Maker's personal history, grape/brew highlights, tasting packages, opening hours, road warnings, and contact info.
* 🧭 **Curated Day-Trip Loops:** Pre-planned 3-stop day routes across Chania, Heraklion, Santorini, and Rethymno with realistic driving times and distances.

---

## 🛠️ Tech Stack & Architecture

* **Frontend:** React 19, TypeScript, Vite
* **Styling:** Tailwind CSS v4, Lucide React icons
* **Mapping:** Leaflet + OpenStreetMap / CartoDB / Esri Satellite
* **State & Storage:** React Hooks (`useFavorites`, `useMemo`) + Browser `localStorage`

```
terroir-trail/
├── public/
├── src/
│   ├── types/
│   │   └── terroir.ts              # Producer, Category, FilterState, DayTripLoop
│   ├── hooks/
│   │   └── useFavorites.ts         # localStorage-persisted wishlist hook
│   ├── data/
│   │   ├── producers.ts            # Curated dataset of Greek artisans & microbreweries
│   │   └── loops.ts                # Curated 3-stop day-trip circuits
│   ├── components/
│   │   ├── Header/                 # Brand, destination tabs, search, wishlist button
│   │   ├── FilterBar/              # Categories, road access, ethos pills, quick toggles
│   │   ├── Map/                    # Leaflet map canvas, custom SVG markers, popup cards
│   │   ├── Sidebar/                # Producer cards list with sorting & heart buttons
│   │   ├── Drawer/                 # Detailed artisan drawer with tabs & directions
│   │   └── Loops/                  # Day-trip circuits modal
│   ├── styles/
│   │   └── index.css               # Tailwind CSS v4 & custom glassmorphism
│   ├── App.tsx                     # Master state orchestrator
│   └── main.tsx                    # Application entrypoint
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
MIT License. Dedicated to the independent farmers, winemakers, brewers, and shepherds preserving authentic Mediterranean terroir.
