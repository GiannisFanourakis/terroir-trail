import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Producer, Category, Destination } from '../../types/terroir';
import { 
  Plus, Minus, Navigation, Maximize2, Layers, MapPin, 
  Star, ArrowRight, ExternalLink, X, Compass, ChevronRight, Heart 
} from 'lucide-react';

interface MapCanvasProps {
  producers: Producer[];
  selectedProducer: Producer | null;
  onSelectProducer: (producer: Producer | null) => void;
  onOpenDrawer: (producer: Producer) => void;
  selectedDestination: Destination | 'all';
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  viewMode?: 'map' | 'list';
}

export const MapCanvas: React.FC<MapCanvasProps> = ({
  producers,
  selectedProducer,
  onSelectProducer,
  onOpenDrawer,
  selectedDestination,
  isFavorite,
  onToggleFavorite,
  viewMode,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  type MapTheme = 'topo' | 'voyager' | 'dark' | 'satellite';
  const [mapTheme, setMapTheme] = useState<MapTheme>('topo');

  // Centers per destination
  const DESTINATION_CENTERS: Record<Destination | 'all', { coords: [number, number]; zoom: number }> = {
    all: { coords: [37.9838, 24.2272], zoom: 7 }, // Greece overview
    crete: { coords: [35.2401, 24.8093], zoom: 9 },
    santorini: { coords: [36.3932, 25.4615], zoom: 12 },
    peloponnese: { coords: [37.8280, 22.6580], zoom: 10 },
    northern_greece: { coords: [40.6650, 22.0450], zoom: 10 },
    tuscany: { coords: [43.4671, 11.3447], zoom: 10 },
  };

  const CARTO_API_KEY = (import.meta.env.VITE_CARTO_API_KEY as string) || '';

  const TILE_CONFIGS: Record<MapTheme, { url: string; attribution: string; maxZoom: number; subdomains?: string }> = {
    topo: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, USGS',
      maxZoom: 19,
    },
    voyager: CARTO_API_KEY
      ? {
          url: `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${CARTO_API_KEY}`,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 19,
        }
      : {
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          subdomains: 'abc',
          maxZoom: 19,
        },
    dark: CARTO_API_KEY
      ? {
          url: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=${CARTO_API_KEY}`,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 19,
        }
      : {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
          attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
          maxZoom: 18,
        },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Source: Esri, Maxar, Earthstar Geographics',
      maxZoom: 18,
    },
  };

  // Helper to generate modern badge pin HTML
  const getMarkerHtml = (producer: Producer, isSelected: boolean) => {
    let icon = '🍇';
    let iconBg = 'bg-rose-500/25 text-rose-200 border-rose-500/50';

    switch (producer.category) {
      case 'winery':
        icon = '🍇';
        iconBg = 'bg-rose-500/25 text-rose-200 border-rose-500/50';
        break;
      case 'brewery':
        icon = '🍺';
        iconBg = 'bg-amber-400/30 text-amber-300 border-amber-400/60';
        break;
      case 'kazani':
        icon = '🏺';
        iconBg = 'bg-amber-600/25 text-amber-200 border-amber-600/50';
        break;
      case 'olive_mill':
        icon = '🫒';
        iconBg = 'bg-emerald-500/25 text-emerald-200 border-emerald-500/50';
        break;
      case 'cheese_dairy':
        icon = '🧀';
        iconBg = 'bg-yellow-500/25 text-yellow-200 border-yellow-500/50';
        break;
      case 'apiary':
        icon = '🍯';
        iconBg = 'bg-orange-500/25 text-orange-200 border-orange-500/50';
        break;
    }

    return `
      <div class="modern-map-pin ${isSelected ? 'active-pin' : ''}">
        <div class="pin-icon-circle ${iconBg} border">
          ${icon}
        </div>
        <div class="flex flex-col text-left">
          <span class="pin-text-label">${producer.name}</span>
          <span class="text-[9px] opacity-75 font-mono">★ ${producer.rating} · ${producer.village}</span>
        </div>
      </div>
    `;
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initial = DESTINATION_CENTERS[selectedDestination];

    const map = L.map(mapContainerRef.current, {
      center: initial.coords,
      zoom: initial.zoom,
      minZoom: 6,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: true,
    });

    tileLayerRef.current = L.tileLayer(TILE_CONFIGS[mapTheme].url, {
      attribution: TILE_CONFIGS[mapTheme].attribution,
      maxZoom: TILE_CONFIGS[mapTheme].maxZoom,
      subdomains: TILE_CONFIGS[mapTheme].subdomains || 'abc',
    }).addTo(map);

    map.on('click', (e) => {
      const target = e.originalEvent.target as HTMLElement;
      if (target.classList.contains('leaflet-container')) {
        onSelectProducer(null);
      }
    });

    mapInstanceRef.current = map;

    // Invalidate size on container resize (prevents grey tiles on window resize or split screen)
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      ro = new ResizeObserver(() => {
        map.invalidateSize();
      });
      ro.observe(mapContainerRef.current);
    }

    const handleWindowResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleWindowResize);

    // Multiple staggered invalidations to ensure smooth rendering after CSS layouts settle
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (ro) ro.disconnect();
      window.removeEventListener('resize', handleWindowResize);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Re-invalidate size whenever viewMode switches to 'map'
  useEffect(() => {
    if (viewMode === 'map' && mapInstanceRef.current) {
      const map = mapInstanceRef.current;
      setTimeout(() => map.invalidateSize(), 50);
      setTimeout(() => map.invalidateSize(), 200);
    }
  }, [viewMode]);

  // Update Tile Layer Theme
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    tileLayerRef.current = L.tileLayer(TILE_CONFIGS[mapTheme].url, {
      attribution: TILE_CONFIGS[mapTheme].attribution,
      maxZoom: TILE_CONFIGS[mapTheme].maxZoom,
      subdomains: TILE_CONFIGS[mapTheme].subdomains || 'abc',
    }).addTo(mapInstanceRef.current);
  }, [mapTheme]);

  // Sync Destination Viewport
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || selectedProducer) return;

    const target = DESTINATION_CENTERS[selectedDestination];
    map.flyTo(target.coords, target.zoom, { duration: 1.2 });
  }, [selectedDestination]);

  // Sync Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove old markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    if (producers.length === 0) return;

    const bounds = L.latLngBounds([]);

    producers.forEach((producer) => {
      const isSelected = selectedProducer?.id === producer.id;

      const customIcon = L.divIcon({
        html: getMarkerHtml(producer, isSelected),
        className: 'custom-leaflet-pin-wrapper',
        iconSize: [160, 40],
        iconAnchor: [80, 20],
      });

      const marker = L.marker(producer.coordinates, {
        icon: customIcon,
        riseOnHover: true,
      });

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectProducer(producer);
      });

      marker.addTo(map);
      markersRef.current[producer.id] = marker;
      bounds.extend(producer.coordinates);
    });
  }, [producers, selectedProducer]);

  // Smooth Camera Fly-To on Producer Select
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedProducer) return;

    const [lat, lng] = selectedProducer.coordinates;
    const targetLat = window.innerWidth < 768 ? lat - 0.015 : lat;

    map.flyTo([targetLat, lng], 13, {
      duration: 1.1,
      easeLinearity: 0.2,
    });
  }, [selectedProducer]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  const handleResetView = () => {
    onSelectProducer(null);
    const target = DESTINATION_CENTERS[selectedDestination];
    mapInstanceRef.current?.flyTo(target.coords, target.zoom, { duration: 1 });
  };

  const handleLocateMe = () => {
    if (!mapInstanceRef.current || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        mapInstanceRef.current?.flyTo([latitude, longitude], 13);
        L.circleMarker([latitude, longitude], {
          radius: 9,
          fillColor: '#38bdf8',
          color: '#ffffff',
          weight: 3,
          opacity: 1,
          fillOpacity: 1,
        })
          .addTo(mapInstanceRef.current!)
          .bindPopup('Your Current Location')
          .openPopup();
      },
      (err) => console.warn('Geo error:', err)
    );
  };

  const formatCategoryName = (category: Category) => {
    switch (category) {
      case 'winery': return 'Winery';
      case 'brewery': return 'Microbrewery';
      case 'kazani': return 'Rakokazano';
      case 'olive_mill': return 'Olive Mill';
      case 'cheese_dairy': return 'Mountain Dairy';
      case 'apiary': return 'Honey & Herbs';
    }
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Modern Controls */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex flex-col items-end gap-2">
        
        {/* Layer Theme Selector Pill */}
        <div className="glass-panel p-1 rounded-2xl flex items-center shadow-2xl">
          <button
            onClick={() => setMapTheme('topo')}
            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-semibold rounded-xl transition-all ${
              mapTheme === 'topo'
                ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                : 'text-stone-300 hover:text-white hover:bg-white/5'
            }`}
            title="Topographic terrain & vineyard elevation contours (Free, no API key required)"
          >
            Terroir
          </button>
          <button
            onClick={() => setMapTheme('voyager')}
            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-semibold rounded-xl transition-all ${
              mapTheme === 'voyager'
                ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                : 'text-stone-300 hover:text-white hover:bg-white/5'
            }`}
            title={CARTO_API_KEY ? "CARTO Voyager Basemap" : "OpenStreetMap Standard (Free, no API key required)"}
          >
            {CARTO_API_KEY ? 'Voyager' : 'Streets'}
          </button>
          <button
            onClick={() => setMapTheme('dark')}
            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-semibold rounded-xl transition-all ${
              mapTheme === 'dark'
                ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                : 'text-stone-300 hover:text-white hover:bg-white/5'
            }`}
            title={CARTO_API_KEY ? "CARTO Dark Matter" : "Esri Dark Canvas (Free, no API key required)"}
          >
            Night
          </button>
          <button
            onClick={() => setMapTheme('satellite')}
            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-semibold rounded-xl transition-all ${
              mapTheme === 'satellite'
                ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                : 'text-stone-300 hover:text-white hover:bg-white/5'
            }`}
            title="High-resolution aerial satellite imagery"
          >
            Satellite
          </button>
        </div>

        {/* Floating Quick Action Group */}
        <div className="flex flex-col gap-1 glass-panel p-1 rounded-2xl shadow-2xl">
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-stone-200 hover:text-white hover:bg-white/10 transition"
            title="Zoom In"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <button
            onClick={handleZoomOut}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-stone-200 hover:text-white hover:bg-white/10 transition"
            title="Zoom Out"
          >
            <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <div className="h-[1px] bg-white/10 my-0.5" />

          <button
            onClick={handleResetView}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-stone-200 hover:text-amber-400 hover:bg-white/10 transition group"
            title="Reset Destination View"
          >
            <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
          </button>

          <button
            onClick={handleLocateMe}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-stone-200 hover:text-sky-400 hover:bg-white/10 transition group"
            title="My Location"
          >
            <Navigation className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
          </button>
        </div>

      </div>

      {/* Floating Bottom Quick-Card (Airbnb / Apple Maps 2026 Style) */}
      {selectedProducer && (
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 w-[95%] sm:w-[480px] max-w-lg animate-in slide-in-from-bottom-6 duration-300">
          <div className="glass-panel p-2.5 sm:p-3.5 rounded-2xl sm:rounded-3xl shadow-2xl border border-white/15 text-stone-100 flex gap-2.5 sm:gap-3.5 items-center relative overflow-hidden">
            
            <div className="absolute -right-10 -bottom-10 w-36 h-36 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative h-20 w-22 sm:h-24 sm:w-32 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 bg-stone-900 border border-white/10">
              <img
                src={selectedProducer.coverImage}
                alt={selectedProducer.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 left-1 bg-black/70 backdrop-blur-md text-amber-400 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400" />
                <span>{selectedProducer.rating}</span>
              </span>
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
              <div>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-amber-400 truncate">
                    {formatCategoryName(selectedProducer.category)} · {selectedProducer.region}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(selectedProducer.id);
                      }}
                      className={`p-1 rounded-full transition ${
                        isFavorite(selectedProducer.id) ? 'text-rose-500 scale-110' : 'text-stone-400 hover:text-white'
                      }`}
                      title={isFavorite(selectedProducer.id) ? 'Remove from wishlist' : 'Save to wishlist'}
                    >
                      <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFavorite(selectedProducer.id) ? 'fill-rose-500' : ''}`} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProducer(null);
                      }}
                      className="text-stone-400 hover:text-white p-1"
                    >
                      <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-serif-title font-bold text-sm sm:text-base text-white truncate leading-tight mt-0.5">
                  {selectedProducer.name}
                </h3>
                <p className="text-[11px] sm:text-xs text-stone-400 truncate mt-0.5">
                  {selectedProducer.tagLine}
                </p>
              </div>

              <div className="flex items-center justify-between gap-2 mt-1.5 pt-1.5 sm:mt-2 sm:pt-2 border-t border-white/10">
                <div className="hidden sm:flex items-center gap-1">
                  {selectedProducer.indigenousVarieties.slice(0, 2).map((v, idx) => (
                    <span
                      key={idx}
                      className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-md bg-white/10 text-stone-300 font-medium"
                    >
                      {v}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => onOpenDrawer(selectedProducer)}
                  className="flex items-center gap-1 text-[11px] sm:text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl shadow transition active:scale-95 shrink-0 ml-auto"
                >
                  <span>Explore Story</span>
                  <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Floating Category Legend in Bottom-Left */}
      <div className="absolute bottom-5 left-4 z-10 hidden xl:flex items-center gap-3 bg-stone-900/90 backdrop-blur-md text-white text-[11px] px-3.5 py-2 rounded-2xl shadow-xl border border-stone-700">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
          <span>Winery</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
          <span>Microbrewery</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
          <span>Rakokazano</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>Olive Mill</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
          <span>Dairy</span>
        </div>
      </div>
    </div>
  );
};
