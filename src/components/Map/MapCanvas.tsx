import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Producer, Category } from '../../types/terroir';
import { Layers, Maximize2, Navigation, Compass } from 'lucide-react';

interface MapCanvasProps {
  producers: Producer[];
  selectedProducer: Producer | null;
  onSelectProducer: (producer: Producer) => void;
  selectedRegion: string;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({
  producers,
  selectedProducer,
  onSelectProducer,
  selectedRegion,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  
  const [mapStyle, setMapStyle] = useState<'voyager' | 'topo'>('voyager');

  // Center of Crete
  const CRETE_CENTER: [number, number] = [35.2401, 24.8093];
  const CRETE_DEFAULT_ZOOM = 9;

  // Tile layer configurations
  const TILE_LAYERS = {
    voyager: {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    },
    topo: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, METI, swisstopo, MapmyIndia',
      maxZoom: 18,
    }
  };

  // Helper to get marker styling based on category
  const getMarkerHtml = (category: Category, isSelected: boolean) => {
    let iconEmoji = '🍇';
    let bgGradient = 'from-rose-600 to-rose-800';
    let borderColor = '#991b1b';

    switch (category) {
      case 'winery':
        iconEmoji = '🍇';
        bgGradient = 'from-rose-600 to-rose-800';
        borderColor = '#991b1b';
        break;
      case 'kazani':
        iconEmoji = '🏺';
        bgGradient = 'from-amber-600 to-amber-800';
        borderColor = '#b45309';
        break;
      case 'olive_mill':
        iconEmoji = '🫒';
        bgGradient = 'from-emerald-600 to-emerald-800';
        borderColor = '#15803d';
        break;
      case 'cheese_dairy':
        iconEmoji = '🧀';
        bgGradient = 'from-yellow-600 to-amber-700';
        borderColor = '#a16207';
        break;
      case 'apiary':
        iconEmoji = '🍯';
        bgGradient = 'from-orange-500 to-amber-600';
        borderColor = '#c2410c';
        break;
    }

    const selectedRing = isSelected
      ? 'ring-4 ring-amber-400 ring-offset-2 scale-125 z-50 animate-pulse'
      : 'hover:scale-115';

    return `
      <div class="custom-terroir-pin ${isSelected ? 'selected' : ''}" style="width: 36px; height: 36px;">
        <div class="w-9 h-9 rounded-full bg-gradient-to-br ${bgGradient} flex items-center justify-center text-base border-2 border-white shadow-md transition-transform duration-200 ${selectedRing}">
          ${iconEmoji}
        </div>
      </div>
    `;
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: CRETE_CENTER,
      zoom: CRETE_DEFAULT_ZOOM,
      minZoom: 8,
      maxZoom: 18,
      zoomControl: false,
    });

    // Add zoom control on the bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initial tile layer
    tileLayerRef.current = L.tileLayer(TILE_LAYERS[mapStyle].url, {
      attribution: TILE_LAYERS[mapStyle].attribution,
      maxZoom: TILE_LAYERS[mapStyle].maxZoom,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle tile layer style change
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    tileLayerRef.current = L.tileLayer(TILE_LAYERS[mapStyle].url, {
      attribution: TILE_LAYERS[mapStyle].attribution,
      maxZoom: TILE_LAYERS[mapStyle].maxZoom,
    }).addTo(mapInstanceRef.current);
  }, [mapStyle]);

  // Update Markers when producers or selection changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    if (producers.length === 0) return;

    const bounds = L.latLngBounds([]);

    producers.forEach((producer) => {
      const isSelected = selectedProducer?.id === producer.id;
      
      const customIcon = L.divIcon({
        html: getMarkerHtml(producer.category, isSelected),
        className: 'custom-leaflet-div-icon',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -20],
      });

      const marker = L.marker(producer.coordinates, { icon: customIcon });

      // Build popup content
      const popupHtml = `
        <div class="p-3 max-w-[240px] font-sans">
          <div class="h-24 -mx-3 -mt-3 mb-2 overflow-hidden relative">
            <img src="${producer.coverImage}" alt="${producer.name}" class="w-full h-full object-cover" />
            <span class="absolute bottom-1 right-1 bg-black/70 text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded">
              ★ ${producer.rating}
            </span>
          </div>
          <h4 class="font-bold text-stone-900 text-sm leading-snug">${producer.name}</h4>
          <p class="text-[11px] text-stone-500 mb-1.5">${producer.village}, ${producer.region.toUpperCase()}</p>
          <p class="text-xs text-stone-600 line-clamp-2 mb-2">${producer.tagLine}</p>
          <div class="flex items-center justify-between text-[11px] pt-1.5 border-t border-stone-100">
            <span class="font-semibold text-stone-700">${producer.priceLevel}</span>
            <span class="text-amber-700 font-semibold cursor-pointer">View Story →</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        closeButton: false,
        offset: [0, -10],
      });

      marker.on('click', () => {
        onSelectProducer(producer);
      });

      marker.addTo(map);
      markersRef.current[producer.id] = marker;
      bounds.extend(producer.coordinates);
    });

    // Auto fit to filtered bounds if no specific producer is selected
    if (!selectedProducer && bounds.isValid() && producers.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 11 });
    }
  }, [producers, selectedProducer]);

  // Center on selected producer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedProducer) return;

    map.flyTo(selectedProducer.coordinates, 13, {
      duration: 1.2,
      easeLinearity: 0.25,
    });

    // Open its popup
    const marker = markersRef.current[selectedProducer.id];
    if (marker) {
      marker.openPopup();
    }
  }, [selectedProducer]);

  // Controls actions
  const handleResetView = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo(CRETE_CENTER, CRETE_DEFAULT_ZOOM, { duration: 1 });
  };

  const handleLocateMe = () => {
    if (!mapInstanceRef.current || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        mapInstanceRef.current?.flyTo([latitude, longitude], 12);
        L.circleMarker([latitude, longitude], {
          radius: 8,
          fillColor: '#3b82f6',
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9,
        })
          .addTo(mapInstanceRef.current!)
          .bindPopup('You are here!')
          .openPopup();
      },
      (err) => {
        console.warn('Geolocation error:', err);
      }
    );
  };

  return (
    <div className="relative w-full h-full">
      {/* The Leaflet DOM Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Map Controls on Top-Right */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        {/* Style Toggle (Voyager vs Topo) */}
        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-stone-200/80 p-1 flex items-center">
          <button
            onClick={() => setMapStyle('voyager')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
              mapStyle === 'voyager'
                ? 'bg-stone-900 text-amber-400 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
            title="Clean Street & Road Map"
          >
            Voyager
          </button>
          <button
            onClick={() => setMapStyle('topo')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
              mapStyle === 'topo'
                ? 'bg-stone-900 text-amber-400 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
            title="Topographic Elevation Terrain"
          >
            Mountain Topo
          </button>
        </div>

        {/* Center Crete Button */}
        <button
          onClick={handleResetView}
          className="bg-white/95 backdrop-blur-md hover:bg-stone-50 border border-stone-200/80 text-stone-700 hover:text-stone-900 p-2.5 rounded-xl shadow-md transition flex items-center justify-center group"
          title="Reset to View All Crete"
        >
          <Maximize2 className="w-4 h-4 text-stone-600 group-hover:scale-110 transition-transform" />
        </button>

        {/* Locate Me */}
        <button
          onClick={handleLocateMe}
          className="bg-white/95 backdrop-blur-md hover:bg-stone-50 border border-stone-200/80 text-stone-700 hover:text-stone-900 p-2.5 rounded-xl shadow-md transition flex items-center justify-center group"
          title="Locate my position on Crete"
        >
          <Navigation className="w-4 h-4 text-stone-600 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Floating Legend / Terroir Pill in Bottom-Left */}
      <div className="absolute bottom-5 left-4 z-10 hidden sm:flex items-center gap-3 bg-stone-900/90 backdrop-blur-md text-white text-[11px] px-3.5 py-2 rounded-2xl shadow-xl border border-stone-700">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
          <span>Winery</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
          <span>Rakokazano</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
          <span>Olive Mill</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
          <span>Mitato Dairy</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
          <span>Honey/Herbs</span>
        </div>
      </div>
    </div>
  );
};
