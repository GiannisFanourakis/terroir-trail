import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Producer, Destination } from '../../types/terroir';
import {
  Plus, Minus, Navigation, Maximize2, Layers, MapPin,
  Star, ArrowRight, ExternalLink, X, Compass, ChevronRight, Heart, AlertCircle, Mountain
} from 'lucide-react';
import { getCategoryFallbackImage } from '../../utils/imageFallbacks';
import { getEffectiveProducerCategory } from '../../utils/producerCategory';
import { resolveProducerCover } from '../../utils/producerMediaResolver';
import { getUserCoordinates } from '../../services/geolocation';
import { TERROIR_REGIONS } from '../../data/terroirRegionCatalogue';
import {
  getActiveCountryScope,
  getCountryLayer,
  getDestinationCountry,
} from '../../config/geography';
import type { CountryScope } from '../../config/geography';
import { getProducerCategoryIconMarkup } from '../Common/ProducerCategoryIcon';
import type { SourceSurface } from '../../services/intentAnalytics';

interface MapCanvasProps {
  producers: Producer[];
  selectedProducer: Producer | null;
  onSelectProducer: (producer: Producer | null) => void;
  onOpenDrawer: (producer: Producer) => void;
  selectedDestination: Destination | 'all';
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string, sourceSurface?: SourceSurface) => void;
  onExploreCountry?: (country: Exclude<CountryScope, 'all'>) => void;
  onExploreRegion?: (destination: Destination) => void;
}

export interface MapMotionOptions {
  desktopDuration?: number;
  mobileDuration?: number;
}

export const getMapMotionPreference = (options?: MapMotionOptions) => {
  const isReduced =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  if (isReduced) {
    return {
      animate: false,
      duration: 0,
      isReduced: true,
      isMobile,
    };
  }

  const duration = isMobile
    ? (options?.mobileDuration ?? 0.5)
    : (options?.desktopDuration ?? 1.0);

  return {
    animate: true,
    duration,
    isReduced: false,
    isMobile,
  };
};

export const flyOrSetView = (
  map: L.Map,
  target: L.LatLngExpression,
  zoom?: number,
  options?: MapMotionOptions & L.ZoomPanOptions
) => {
  const motion = getMapMotionPreference(options);
  const targetZoom = zoom ?? map.getZoom();

  if (motion.isReduced) {
    map.setView(target, targetZoom, { animate: false });
  } else {
    map.flyTo(target, targetZoom, {
      duration: motion.duration,
      easeLinearity: 0.25,
      ...options,
    });
  }
};

export const fitBoundsWithMotion = (
  map: L.Map,
  bounds: L.LatLngBoundsExpression,
  options?: L.FitBoundsOptions & MapMotionOptions
) => {
  const motion = getMapMotionPreference(options);
  const isMobile = motion.isMobile;

  map.fitBounds(bounds, {
    padding: isMobile ? [18, 18] : [44, 44],
    animate: !motion.isReduced,
    duration: motion.isReduced ? 0 : motion.duration,
    ...options,
  });
};

export const getAutomaticDestinationZoom = (targetZoom: number): number =>
  Math.min(targetZoom, 10);

export const getProducerMarkerSignature = (producer: Producer): string => {
  const [lat, lng] = producer.coordinates;
  const effectiveCat = getEffectiveProducerCategory(producer);
  return `${producer.id}|${lat},${lng}|${producer.name}|${producer.village || ''}|${producer.region}|${effectiveCat}|${producer.rating ?? ''}`;
};

export interface ProducerMapCluster {
  key: string;
  producers: Producer[];
  center: [number, number];
}

export interface AdaptiveMapRenderStrategy {
  clusterMaxZoom: number;
  clusterCellSize: number;
  viewportPadding: number;
  maxIndividualMarkers: number;
}

export const MOBILE_MAP_RENDER_STRATEGY: AdaptiveMapRenderStrategy = {
  clusterMaxZoom: 10,
  clusterCellSize: 72,
  viewportPadding: 0.2,
  maxIndividualMarkers: 120,
};

export const DESKTOP_MAP_RENDER_STRATEGY: AdaptiveMapRenderStrategy = {
  clusterMaxZoom: 11,
  clusterCellSize: 88,
  viewportPadding: 0.14,
  maxIndividualMarkers: 220,
};

export const getAdaptiveMapRenderStrategy = (
  viewportWidth: number
): AdaptiveMapRenderStrategy =>
  viewportWidth < 768 ? MOBILE_MAP_RENDER_STRATEGY : DESKTOP_MAP_RENDER_STRATEGY;

export const shouldClusterProducerMarkers = (
  zoom: number,
  visibleProducerCount: number,
  strategy: AdaptiveMapRenderStrategy
): boolean =>
  zoom <= strategy.clusterMaxZoom ||
  visibleProducerCount > strategy.maxIndividualMarkers;

export const clusterProducersByGrid = (
  producers: Producer[],
  project: (coordinates: [number, number]) => { x: number; y: number },
  cellSize = MOBILE_MAP_RENDER_STRATEGY.clusterCellSize
): ProducerMapCluster[] => {
  const buckets = new Map<string, Producer[]>();

  producers.forEach((producer) => {
    const point = project(producer.coordinates);
    const key = `${Math.floor(point.x / cellSize)}:${Math.floor(point.y / cellSize)}`;
    const bucket = buckets.get(key);
    if (bucket) bucket.push(producer);
    else buckets.set(key, [producer]);
  });

  return Array.from(buckets.entries()).map(([key, bucket]) => {
    const center = bucket.reduce(
      (acc, producer) => {
        acc[0] += producer.coordinates[0];
        acc[1] += producer.coordinates[1];
        return acc;
      },
      [0, 0] as [number, number]
    );

    center[0] /= bucket.length;
    center[1] /= bucket.length;

    return { key, producers: bucket, center };
  });
};

export type ProducerMarkerRenderMode = 'compact' | 'detailed';

const isMobileMapViewport = () =>
  typeof window !== 'undefined' && window.innerWidth < 768;

export const MapCanvas: React.FC<MapCanvasProps> = ({
  producers,
  selectedProducer,
  onSelectProducer,
  onOpenDrawer,
  selectedDestination,
  isFavorite,
  onToggleFavorite,
  onExploreRegion,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const markerSignaturesRef = useRef<{ [id: string]: string }>({});
  const markerRenderModesRef = useRef<{ [id: string]: ProducerMarkerRenderMode }>({});
  const clusterMarkersRef = useRef<{ [id: string]: L.Marker }>({});
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  type MapTheme = 'topo' | 'voyager' | 'dark' | 'satellite';
  const [mapTheme, setMapTheme] = useState<MapTheme>('topo');
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState<boolean>(false);

  const onSelectProducerRef = useRef(onSelectProducer);
  useEffect(() => {
    onSelectProducerRef.current = onSelectProducer;
  });

  const selectedProducerIdRef = useRef<string | null>(selectedProducer?.id ?? null);
  const producersMapRef = useRef<Map<string, Producer>>(new Map());

  type PinDisplayMode = 'adaptive' | 'compact' | 'expanded';
  const [pinDisplayMode, setPinDisplayMode] = useState<PinDisplayMode>('adaptive');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [activeRegionId, setActiveRegionId] = useState<string | null>(null);

  const DESTINATION_CENTERS: Record<Destination | 'all', { coords: [number, number]; zoom: number }> = {
    all: { coords: [47.0, 10.0], zoom: 4 },
    crete: { coords: [35.2401, 24.8093], zoom: 9 },
    santorini: { coords: [36.3932, 25.4615], zoom: 12 },
    peloponnese: { coords: [37.8280, 22.6580], zoom: 10 },
    thessaly: { coords: [39.592714, 22.056567], zoom: 9 },
    northern_greece: { coords: [40.6650, 22.0450], zoom: 10 },
    tuscany: { coords: [43.4671, 11.3447], zoom: 10 },
    piedmont: { coords: [45.0500, 7.9000], zoom: 9 },
    puglia: { coords: [41.0, 16.7], zoom: 8 },
    sicily: { coords: [37.5, 14.25], zoom: 8 },
    south_tyrol: { coords: [46.65, 11.43], zoom: 9 },
    provence: { coords: [44.05, 5.97], zoom: 8 },
    catalonia: { coords: [41.7, 1.8], zoom: 8 },
    alentejo: { coords: [38.5, -7.9], zoom: 8 },
    istria: { coords: [45.15, 13.9], zoom: 9 },
    pomurska: { coords: [46.67, 16.2], zoom: 10 },
    southeast_slovenia: { coords: [45.72, 14.97], zoom: 9 },
    central_slovenia: { coords: [46.05, 14.52], zoom: 9 },
    goriska: { coords: [46.1, 13.76], zoom: 9 },
    trondelag: { coords: [63.7, 11.25], zoom: 7 },
    more_og_romsdal: { coords: [62.7, 7.35], zoom: 8 },
    buskerud: { coords: [60.03, 9.31], zoom: 8 },
    vestland: { coords: [60.84, 6.44], zoom: 7 },
  };

  // Country scope is stored separately from Destination so the navigation can
  // scale Europe -> country -> NUTS-backed terroir region without changing
  // persisted producer destination values.
  const countryScope = selectedDestination === 'all'
    ? getActiveCountryScope()
    : getDestinationCountry(selectedDestination);
  const activeCountryLayer = getCountryLayer(countryScope);
  const currentMapTarget = selectedDestination === 'all'
    ? { coords: activeCountryLayer.center, zoom: activeCountryLayer.zoom }
    : DESTINATION_CENTERS[selectedDestination];

  const selectedDestinationRegion =
    selectedDestination === 'all'
      ? null
      : TERROIR_REGIONS.find((r) => r.destination === selectedDestination) || null;
  const activeTerroirRegion = activeRegionId
    ? TERROIR_REGIONS.find((r) => r.id === activeRegionId) || null
    : null;

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

  const getMarkerHtml = (
    producer: Producer,
    isSelected: boolean,
    renderMode: ProducerMarkerRenderMode = 'detailed'
  ) => {
    const effectiveCategory = getEffectiveProducerCategory(producer);
    const icon = getProducerCategoryIconMarkup(effectiveCategory);
    let iconBg = 'bg-stone-500/20 text-stone-200 border-white/20';

    switch (effectiveCategory) {
      case 'winery':
        iconBg = 'bg-rose-500/20 text-rose-200 border-rose-500/45';
        break;
      case 'brewery':
        iconBg = 'bg-amber-400/20 text-amber-200 border-amber-400/50';
        break;
      case 'distillery':
        iconBg = 'bg-amber-600/20 text-amber-200 border-amber-600/45';
        break;
      case 'cidery':
        iconBg = 'bg-lime-600/20 text-lime-200 border-lime-600/45';
        break;
      case 'confectionery':
        iconBg = 'bg-amber-700/20 text-amber-200 border-amber-700/45';
        break;
      case 'oil_mill':
        iconBg = 'bg-yellow-600/20 text-yellow-200 border-yellow-600/45';
        break;
      case 'herb_farm':
        iconBg = 'bg-green-600/20 text-green-200 border-green-600/45';
        break;
      case 'mushroom_farm':
        iconBg = 'bg-stone-600/20 text-stone-200 border-stone-500/45';
        break;
      case 'olive_mill':
      case 'olive_oil_producer':
        iconBg = 'bg-emerald-500/20 text-emerald-200 border-emerald-500/45';
        break;
      case 'cheese_dairy':
        iconBg = 'bg-yellow-500/20 text-yellow-200 border-yellow-500/45';
        break;
      case 'apiary':
        iconBg = 'bg-orange-500/20 text-orange-200 border-orange-500/45';
        break;
      case 'farm':
        iconBg = 'bg-emerald-500/20 text-emerald-200 border-emerald-500/45';
        break;
    }

    const shortVillage = producer.village
      ? producer.village.split('(')[0].split(',')[0].trim()
      : producer.region;

    if (renderMode === 'compact' && !isSelected) {
      return `
        <div class="modern-map-pin" title="${producer.name}">
          <div class="pin-icon-circle ${iconBg} border">
            ${icon}
          </div>
        </div>
      `;
    }

    return `
      <div class="modern-map-pin ${isSelected ? 'active-pin' : ''}">
        <div class="pin-icon-circle ${iconBg} border">
          ${icon}
        </div>
        <div class="pin-text-container">
          <span class="pin-text-label" title="${producer.name}">${producer.name}</span>
          <span class="pin-text-sub">${producer.rating != null ? `Rating ${producer.rating} · ` : ''}${shortVillage}</span>
        </div>
      </div>
    `;
  };

  const resolveProducerMarkerRenderMode = (zoom: number): ProducerMarkerRenderMode =>
    pinDisplayMode === 'compact'
      ? 'compact'
      : pinDisplayMode === 'expanded'
      ? 'detailed'
      : zoom < 12
      ? 'compact'
      : 'detailed';

  const getProducerMarkerIcon = (
    producer: Producer,
    isSelected: boolean,
    renderMode: ProducerMarkerRenderMode
  ) => {
    const useCompactIcon = renderMode === 'compact' && !isSelected;

    if (useCompactIcon) {
      return L.divIcon({
        html: getMarkerHtml(producer, false, 'compact'),
        className: 'custom-leaflet-pin-wrapper',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });
    }

    return L.divIcon({
      html: getMarkerHtml(producer, isSelected),
      className: 'custom-leaflet-pin-wrapper',
      iconSize: [180, 42],
      iconAnchor: [90, 21],
    });
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initial = currentMapTarget;

    const mobileMap = isMobileMapViewport();
    const map = L.map(mapContainerRef.current, {
      center: initial.coords,
      zoom: initial.zoom,
      minZoom: 4,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: true,
      preferCanvas: true,
      // Keep Leaflet's zoom transform on mobile so existing tiles scale smoothly
      // while the next zoom level loads. Disabling it exposed the dark map
      // background between tile redraws.
      zoomAnimation: true,
      // Avoid opacity cross-fades on mobile; they can make the map appear to
      // darken briefly during zoom even when tiles are already available.
      fadeAnimation: !mobileMap,
      markerZoomAnimation: !mobileMap,
    });

    tileLayerRef.current = L.tileLayer(TILE_CONFIGS[mapTheme].url, {
      attribution: TILE_CONFIGS[mapTheme].attribution,
      maxZoom: TILE_CONFIGS[mapTheme].maxZoom,
      subdomains: TILE_CONFIGS[mapTheme].subdomains || 'abc',
      // Marker virtualization handles the expensive producer layer work.
      // Keep tile updates responsive during zoom so the base map never blanks/refills.
      updateWhenIdle: false,
      updateWhenZooming: true,
      keepBuffer: 2,
    }).addTo(map);

    map.on('click', (e) => {
      const target = e.originalEvent.target as HTMLElement;
      if (target.classList.contains('leaflet-container')) {
        onSelectProducerRef.current(null);
        setActiveRegionId(null);
      }
    });

    mapInstanceRef.current = map;

    let resizeRaf: number | null = null;
    const scheduleInvalidate = () => {
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        mapInstanceRef.current?.invalidateSize();
        resizeRaf = null;
      });
    };

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      ro = new ResizeObserver(scheduleInvalidate);
      ro.observe(mapContainerRef.current);
    }

    window.addEventListener('resize', scheduleInvalidate);
    const t1 = setTimeout(() => map.invalidateSize(), 150);

    return () => {
      clearTimeout(t1);
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      if (ro) ro.disconnect();
      window.removeEventListener('resize', scheduleInvalidate);
      Object.values(markersRef.current).forEach((m) => m.remove());
      Object.values(clusterMarkersRef.current).forEach((m) => m.remove());
      markersRef.current = {};
      markerSignaturesRef.current = {};
      markerRenderModesRef.current = {};
      clusterMarkersRef.current = {};
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    const mobileMap = isMobileMapViewport();
    tileLayerRef.current = L.tileLayer(TILE_CONFIGS[mapTheme].url, {
      attribution: TILE_CONFIGS[mapTheme].attribution,
      maxZoom: TILE_CONFIGS[mapTheme].maxZoom,
      subdomains: TILE_CONFIGS[mapTheme].subdomains || 'abc',
      // Marker virtualization handles the expensive producer layer work.
      // Keep tile updates responsive during zoom so the base map never blanks/refills.
      updateWhenIdle: false,
      updateWhenZooming: true,
      keepBuffer: 2,
    }).addTo(mapInstanceRef.current);
  }, [mapTheme]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || selectedProducer) return;

    const countryTarget = getCountryLayer(countryScope);
    const target = selectedDestination === 'all'
      ? { coords: countryTarget.center, zoom: countryTarget.zoom }
      : DESTINATION_CENTERS[selectedDestination];
    const targetZoom = getAutomaticDestinationZoom(target.zoom);
    const motion = getMapMotionPreference({ mobileDuration: 0.3, desktopDuration: 0.45 });
    map.setView(target.coords, targetZoom, {
      animate: !motion.isReduced,
    });
  }, [selectedDestination, countryScope]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapContainerRef.current) return;

    const applyPinMode = () => {
      if (!mapContainerRef.current || !mapInstanceRef.current) return;
      const currentZoom = mapInstanceRef.current.getZoom();
      const isCompact =
        pinDisplayMode === 'compact'
          ? true
          : pinDisplayMode === 'expanded'
          ? false
          : currentZoom < 12;

      mapContainerRef.current.classList.toggle('map-zoomed-out', isCompact);
      mapContainerRef.current.classList.toggle('map-zoomed-in', !isCompact);
    };

    applyPinMode();
    map.on('zoomend', applyPinMode);

    return () => {
      map.off('zoomend', applyPinMode);
    };
  }, [pinDisplayMode]);

  useEffect(() => {
    // Geography filters are the sole trigger for the regional Explore overview.
    // No auxiliary terroir-region marker or label is rendered on the map.
    setActiveRegionId(selectedDestinationRegion?.id ?? null);
  }, [selectedDestinationRegion]);

  // Effect 1: Producer marker diffing + adaptive render virtualization.
  // Desktop and mobile both render only markers near the current viewport.
  // Low zooms and unusually dense views collapse into lightweight grid clusters.
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    producersMapRef.current = new Map(producers.map((p) => [p.id, p]));

    const validProducers = producers.filter((p) => p.locationStatus !== 'unresolved');
    const validIds = new Set(validProducers.map((p) => p.id));

    Object.keys(markersRef.current).forEach((id) => {
      if (!validIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
        delete markerSignaturesRef.current[id];
        delete markerRenderModesRef.current[id];
      }
    });

    const clearClusters = () => {
      Object.values(clusterMarkersRef.current).forEach((marker) => marker.remove());
      clusterMarkersRef.current = {};
    };

    const ensureProducerMarker = (
      producer: Producer,
      requestedRenderMode: ProducerMarkerRenderMode
    ) => {
      const newSignature = getProducerMarkerSignature(producer);
      const existingMarker = markersRef.current[producer.id];
      const isSelected = selectedProducerIdRef.current === producer.id;
      const renderMode: ProducerMarkerRenderMode = isSelected
        ? 'detailed'
        : requestedRenderMode;

      if (existingMarker) {
        const oldSignature = markerSignaturesRef.current[producer.id];
        const oldRenderMode = markerRenderModesRef.current[producer.id];
        if (oldSignature !== newSignature || oldRenderMode !== renderMode) {
          const currentLatLng = existingMarker.getLatLng();
          const [newLat, newLng] = producer.coordinates;
          if (currentLatLng.lat !== newLat || currentLatLng.lng !== newLng) {
            existingMarker.setLatLng(producer.coordinates);
          }

          existingMarker.setIcon(
            getProducerMarkerIcon(producer, isSelected, renderMode)
          );
          markerSignaturesRef.current[producer.id] = newSignature;
          markerRenderModesRef.current[producer.id] = renderMode;
        }

        if (!map.hasLayer(existingMarker)) existingMarker.addTo(map);
        return existingMarker;
      }

      const marker = L.marker(producer.coordinates, {
        icon: getProducerMarkerIcon(producer, isSelected, renderMode),
        riseOnHover: true,
        keyboard: true,
        title: `${producer.name} — ${producer.village}, ${producer.region}`,
        zIndexOffset: isSelected ? 1000 : 0,
      });

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        setActiveRegionId(null);
        const currentProducer = producersMapRef.current.get(producer.id) || producer;
        onSelectProducerRef.current(currentProducer);
      });

      marker.addTo(map);
      const markerElement = marker.getElement();
      if (markerElement) {
        markerElement.setAttribute('role', 'button');
        markerElement.setAttribute(
          'aria-label',
          `Open ${producer.name}, ${producer.village}, ${producer.region}`
        );
        markerElement.setAttribute('aria-haspopup', 'dialog');

        const handleMarkerKeyDown = (event: KeyboardEvent) => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          setActiveRegionId(null);
          const currentProducer =
            producersMapRef.current.get(producer.id) || producer;
          onSelectProducerRef.current(currentProducer);
        };
        markerElement.addEventListener('keydown', handleMarkerKeyDown);
        marker.once('remove', () => {
          markerElement.removeEventListener('keydown', handleMarkerKeyDown);
        });
      }
      markersRef.current[producer.id] = marker;
      markerSignaturesRef.current[producer.id] = newSignature;
      markerRenderModesRef.current[producer.id] = renderMode;
      return marker;
    };

    let renderRaf: number | null = null;

    const renderMarkers = () => {
      if (renderRaf != null) cancelAnimationFrame(renderRaf);
      renderRaf = requestAnimationFrame(() => {
        renderRaf = null;
        if (!mapInstanceRef.current) return;

        const zoom = map.getZoom();
        const viewportWidth =
          mapContainerRef.current?.clientWidth ||
          (typeof window !== 'undefined' ? window.innerWidth : 1024);
        const strategy = getAdaptiveMapRenderStrategy(viewportWidth);

        const visibleBounds = map.getBounds().pad(strategy.viewportPadding);
        const visibleProducers = validProducers.filter((producer) =>
          visibleBounds.contains(producer.coordinates)
        );

        const visibleIds = new Set(visibleProducers.map((producer) => producer.id));
        Object.entries(markersRef.current).forEach(([id, marker]) => {
          if (!visibleIds.has(id) && map.hasLayer(marker)) {
            map.removeLayer(marker);
          }
        });

        const shouldCluster = shouldClusterProducerMarkers(
          zoom,
          visibleProducers.length,
          strategy
        );

        const markerRenderMode = resolveProducerMarkerRenderMode(zoom);

        if (!shouldCluster) {
          clearClusters();
          visibleProducers.forEach((producer) =>
            ensureProducerMarker(producer, markerRenderMode)
          );
          return;
        }

        clearClusters();
        Object.values(markersRef.current).forEach((marker) => {
          if (map.hasLayer(marker)) map.removeLayer(marker);
        });

        const clusters = clusterProducersByGrid(
          visibleProducers,
          (coordinates) => map.project(coordinates, zoom),
          strategy.clusterCellSize
        );

        clusters.forEach((cluster) => {
          if (cluster.producers.length === 1) {
            ensureProducerMarker(cluster.producers[0], markerRenderMode);
            return;
          }

          const clusterMarker = L.marker(cluster.center, {
            icon: L.divIcon({
              html: `
                <div style="
                  width:42px;height:42px;border-radius:9999px;
                  display:flex;align-items:center;justify-content:center;
                  background:rgba(245,158,11,.94);color:#1c1917;
                  border:2px solid rgba(255,255,255,.88);
                  box-shadow:0 4px 14px rgba(0,0,0,.30);
                  font-weight:800;font-size:13px;
                ">${cluster.producers.length}</div>
              `,
              className: 'terroir-map-cluster',
              iconSize: [42, 42],
              iconAnchor: [21, 21],
            }),
            keyboard: false,
            riseOnHover: false,
            title: `${cluster.producers.length} producers`,
          });

          clusterMarker.on('click', (event) => {
            L.DomEvent.stopPropagation(event);
            const nextZoom = Math.min(18, Math.max(strategy.clusterMaxZoom + 1, zoom + 1));
            const motion = getMapMotionPreference({ mobileDuration: 0.25, desktopDuration: 0.35 });
            map.setView(cluster.center, nextZoom, { animate: !motion.isReduced });
          });

          clusterMarker.addTo(map);
          clusterMarkersRef.current[cluster.key] = clusterMarker;
        });
      });
    };

    const scheduleRender = () => renderMarkers();

    renderMarkers();
    map.on('moveend', scheduleRender);
    map.on('zoomend', scheduleRender);
    map.on('resize', scheduleRender);

    return () => {
      if (renderRaf != null) cancelAnimationFrame(renderRaf);
      map.off('moveend', scheduleRender);
      map.off('zoomend', scheduleRender);
      map.off('resize', scheduleRender);
      clearClusters();
    };
  }, [producers, pinDisplayMode]);

  // Effect 2: Marker selection isolation - depends ONLY on [selectedProducer]
  // Zero marker recreation when selecting or deselecting a producer
  useEffect(() => {
    const prevId = selectedProducerIdRef.current;
    const newId = selectedProducer?.id ?? null;
    selectedProducerIdRef.current = newId;

    if (prevId && prevId !== newId) {
      const prevMarker = markersRef.current[prevId];
      const prevProducer = producersMapRef.current.get(prevId);
      if (prevMarker && prevProducer) {
        const previousRenderMode = resolveProducerMarkerRenderMode(
          mapInstanceRef.current?.getZoom() ?? 12
        );
        prevMarker.setIcon(
          getProducerMarkerIcon(prevProducer, false, previousRenderMode)
        );
        markerRenderModesRef.current[prevId] = previousRenderMode;
        prevMarker.setZIndexOffset(0);
      }
    }

    if (newId) {
      const nextMarker = markersRef.current[newId];
      if (nextMarker && selectedProducer) {
        nextMarker.setIcon(
          getProducerMarkerIcon(selectedProducer, true, 'detailed')
        );
        markerRenderModesRef.current[newId] = 'detailed';
        nextMarker.setZIndexOffset(1000);
      }
    }
  }, [selectedProducer, pinDisplayMode]);

  // Keep producer selection spatially stable. A marker click should not yank the
  // traveler into a fixed zoom; only pan when the producer sits outside a
  // comfortable inner viewport, preserving the user's current zoom level.
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedProducer || selectedProducer.locationStatus === 'unresolved') return;

    setActiveRegionId(null);
    const [lat, lng] = selectedProducer.coordinates;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    const comfortableBounds = map.getBounds().pad(-0.15);
    if (comfortableBounds.contains([lat, lng])) return;

    const motion = getMapMotionPreference({ mobileDuration: 0.3, desktopDuration: 0.4 });
    map.panTo([lat, lng], {
      animate: !motion.isReduced,
      duration: motion.duration,
      easeLinearity: 0.35,
    });
  }, [selectedProducer]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  const handleResetView = () => {
    onSelectProducer(null);
    setActiveRegionId(null);
    const countryTarget = getCountryLayer(countryScope);
    const target = selectedDestination === 'all'
      ? { coords: countryTarget.center, zoom: countryTarget.zoom }
      : DESTINATION_CENTERS[selectedDestination];
    if (mapInstanceRef.current) {
      flyOrSetView(mapInstanceRef.current, target.coords, target.zoom, { mobileDuration: 0.5, desktopDuration: 1.0 });
    }
  };

  const handleExploreCurrentRegion = () => {
    if (!activeTerroirRegion || !mapInstanceRef.current) return;
    onSelectProducer(null);
    setActiveRegionId(activeTerroirRegion.id);
    // onExploreRegion changes the destination, whose map effect performs the
    // single gentle recenter. Avoid a second fitBounds move here.
    onExploreRegion?.(activeTerroirRegion.destination);
  };

  const handleLocateMe = async () => {
    if (!mapInstanceRef.current || isLocating) return;
    setIsLocating(true);
    setLocationError(null);
    try {
      const coords = await getUserCoordinates();
      setActiveRegionId(null);
      flyOrSetView(mapInstanceRef.current, [coords.latitude, coords.longitude], 13, {
        mobileDuration: 0.5,
        desktopDuration: 0.8,
      });
      L.circleMarker([coords.latitude, coords.longitude], {
        radius: 9,
        fillColor: '#38bdf8',
        color: '#ffffff',
        weight: 3,
        opacity: 1,
        fillOpacity: 1,
      })
        .addTo(mapInstanceRef.current)
        .bindPopup('Your Current Location')
        .openPopup();
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : 'Unable to determine location.';
      setLocationError(msg);
      setTimeout(() => setLocationError(null), 7000);
    } finally {
      setIsLocating(false);
    }
  };

  const formatCategoryName = (producer: Producer) => {
    switch (getEffectiveProducerCategory(producer)) {
      case 'winery': return 'Winery';
      case 'brewery': return 'Brewery';
      case 'distillery': return 'Distillery';
      case 'cidery': return 'Cidery';
      case 'confectionery': return 'Confectionery Producer';
      case 'oil_mill': return 'Oil Mill';
      case 'herb_farm': return 'Herb Farm';
      case 'mushroom_farm': return 'Mushroom Farm';
      case 'olive_mill': return 'Olive Mill';
      case 'olive_oil_producer': return 'Olive Oil Producer';
      case 'cheese_dairy': return 'Dairy';
      case 'apiary': return 'Apiary / Honey';
      case 'farm': return 'Farm';
      default: return 'Producer';
    }
  };

  const selectedResolvedCover = selectedProducer
    ? resolveProducerCover(selectedProducer)
    : null;
  const currentRegionMatchingProducers = activeTerroirRegion
    ? producers.filter((producer) => producer.destination === activeTerroirRegion.destination)
    : [];
  const currentRegionCategoryCount = new Set(
    currentRegionMatchingProducers.map((producer) => getEffectiveProducerCategory(producer))
  ).size;

  return (
    <div className="relative w-full h-full select-none overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full z-0" role="region" aria-label="Interactive producer map" />
      <div aria-live="polite" className="sr-only">
        {producers.length} producer{producers.length === 1 ? '' : 's'} currently available on the interactive map. Use search and filters to narrow the map, then tab to a marker and press Enter to open its preview.
      </div>

      <div className="absolute top-16 right-3 sm:top-4 sm:right-4 z-20 flex flex-col items-end gap-2">
        {locationError && (
          <div className="glass-panel px-3 py-2 rounded-xl border border-rose-500/50 bg-stone-950/95 text-rose-200 text-xs flex items-center justify-between gap-2 shadow-2xl max-w-xs animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{locationError}</span>
            </div>
            <button
              onClick={() => setLocationError(null)}
              className="p-1 text-rose-400 hover:text-white rounded-lg hover:bg-white/10 shrink-0"
              title="Dismiss"
              aria-label="Dismiss location error"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Compact map-style control: one button, then a stacked menu. */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsThemeMenuOpen((prev) => !prev)}
            aria-expanded={isThemeMenuOpen}
            aria-haspopup="menu"
            aria-label="Select map style"
            title="Map style"
            className={`flex items-center justify-center gap-1.5 rounded-2xl glass-panel text-stone-200 font-semibold shadow-2xl cursor-pointer transition hover:text-white hover:bg-stone-900/95 w-11 h-11 sm:w-10 sm:h-10 ${isThemeMenuOpen ? 'ring-1 ring-amber-500/50 bg-stone-950/95' : ''}`}
          >
            <Layers className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="sr-only">
              {mapTheme === 'topo'
                ? 'Terroir'
                : mapTheme === 'voyager'
                ? (CARTO_API_KEY ? 'Voyager' : 'Streets')
                : mapTheme === 'dark'
                ? 'Night'
                : 'Satellite'}
            </span>
          </button>

          {isThemeMenuOpen && (
            <div
              role="menu"
              aria-label="Map style"
              className="absolute right-0 top-full mt-2 sm:right-full sm:top-0 sm:mt-0 sm:mr-2 glass-panel p-2 rounded-2xl shadow-2xl z-30 min-w-[154px] border border-white/10 bg-stone-950/95 backdrop-blur-xl"
            >
              <div className="px-2 pb-1.5 text-[10px] uppercase tracking-wider font-bold text-stone-500">
                Map style
              </div>
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={mapTheme === 'topo'}
                  onClick={() => { setMapTheme('topo'); setIsThemeMenuOpen(false); }}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl text-left transition min-h-[40px] ${mapTheme === 'topo' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-300 hover:text-white hover:bg-white/10'}`}
                  title="Topographic terrain and elevation context"
                >
                  Terroir
                </button>
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={mapTheme === 'voyager'}
                  onClick={() => { setMapTheme('voyager'); setIsThemeMenuOpen(false); }}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl text-left transition min-h-[40px] ${mapTheme === 'voyager' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-300 hover:text-white hover:bg-white/10'}`}
                  title={CARTO_API_KEY ? 'CARTO Voyager basemap' : 'OpenStreetMap streets'}
                >
                  {CARTO_API_KEY ? 'Voyager' : 'Streets'}
                </button>
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={mapTheme === 'dark'}
                  onClick={() => { setMapTheme('dark'); setIsThemeMenuOpen(false); }}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl text-left transition min-h-[40px] ${mapTheme === 'dark' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-300 hover:text-white hover:bg-white/10'}`}
                  title={CARTO_API_KEY ? 'CARTO Dark Matter' : 'Esri Dark Canvas'}
                >
                  Night
                </button>
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={mapTheme === 'satellite'}
                  onClick={() => { setMapTheme('satellite'); setIsThemeMenuOpen(false); }}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl text-left transition min-h-[40px] ${mapTheme === 'satellite' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-300 hover:text-white hover:bg-white/10'}`}
                  title="High-resolution aerial satellite imagery"
                >
                  Satellite
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1 glass-panel p-1 rounded-2xl shadow-2xl">
          <button
            onClick={handleZoomIn}
            className="hidden sm:flex w-9 h-9 rounded-xl items-center justify-center text-stone-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Zoom In"
            aria-label="Zoom in"
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            onClick={handleZoomOut}
            className="hidden sm:flex w-9 h-9 rounded-xl items-center justify-center text-stone-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <Minus className="w-4 h-4" />
          </button>

          <div className="hidden sm:block h-[1px] bg-white/10 my-0.5" />

          <button
            onClick={handleResetView}
            className="w-11 h-11 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-stone-200 hover:text-amber-400 hover:bg-white/10 transition group cursor-pointer"
            title="Reset Geography View"
            aria-label="Reset geography view"
          >
            <Maximize2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>

          <button
            onClick={handleLocateMe}
            disabled={isLocating}
            className={`w-11 h-11 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-stone-200 hover:text-sky-400 hover:bg-white/10 transition group cursor-pointer ${
              isLocating ? 'animate-pulse text-sky-400 bg-white/10' : ''
            }`}
            title={isLocating ? 'Locating...' : 'My Location'}
            aria-label={isLocating ? 'Locating your position' : 'Locate me'}
          >
            <Navigation className={`w-4 h-4 group-hover:scale-110 transition-transform ${isLocating ? 'animate-spin' : ''}`} />
          </button>

          <div className="h-[1px] bg-white/10 my-0.5" />

          <button
            onClick={() => {
              setPinDisplayMode((prev) =>
                prev === 'adaptive' ? 'compact' : prev === 'compact' ? 'expanded' : 'adaptive'
              );
            }}
            className={`w-11 h-11 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition group relative cursor-pointer ${
              pinDisplayMode !== 'adaptive'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'text-stone-200 hover:text-amber-400 hover:bg-white/10'
            }`}
            aria-label="Change map pin density"
            title={`Map Pin Density: ${
              pinDisplayMode === 'adaptive'
                ? 'Smart Auto (Zoom-Adaptive: Pins ↔ Bounding Boxes)'
                : pinDisplayMode === 'compact'
                ? 'Compact Pins Only (Uncluttered)'
                : 'Full Bounding Boxes (Always show name & rating)'
            }`}
          >
            <MapPin className="w-4 h-4 group-hover:scale-110 transition-transform" />
            {pinDisplayMode !== 'adaptive' && (
              <span className="absolute top-1 right-1 sm:-top-0.5 sm:-right-0.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-stone-900" />
            )}
          </button>
        </div>
      </div>

      {activeTerroirRegion && !selectedProducer && (
        <section
          className="absolute left-3 sm:left-4 bottom-20 sm:bottom-5 z-30 w-[calc(100%-1.5rem)] sm:w-[360px] max-w-sm glass-panel rounded-3xl border border-amber-400/30 bg-stone-950/92 backdrop-blur-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
          aria-label={`${activeTerroirRegion.name} terroir region`}
        >
          <div className="relative p-4 sm:p-5">
            <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
            <div className="relative flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-2xl border border-amber-400/25 bg-amber-400/10 flex items-center justify-center shrink-0">
                  <Mountain className="w-4.5 h-4.5 text-amber-300" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[9px] uppercase tracking-[0.18em] font-bold text-amber-400">
                    {activeTerroirRegion.eyebrow}
                  </span>
                  <h2 className="font-serif-title text-xl font-bold text-white leading-tight">
                    {activeTerroirRegion.name}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setActiveRegionId(null)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition"
                aria-label={`Close ${activeTerroirRegion.name} region overview`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="relative mt-3 text-xs sm:text-[13px] leading-relaxed text-stone-300">
              {activeTerroirRegion.summary}
            </p>

            <div className="relative mt-3 flex flex-wrap gap-1.5">
              {activeTerroirRegion.highlights.map((highlight) => (
                <span
                  key={highlight}
                  className="px-2 py-1 rounded-lg bg-white/7 border border-white/10 text-[10px] font-medium text-stone-300"
                >
                  {highlight}
                </span>
              ))}
            </div>

            <div className="relative mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-wider font-bold text-stone-500">TerroirTrail catalogue</div>
                <div className="text-xs text-stone-300">
                  {currentRegionMatchingProducers.length} matching producer{currentRegionMatchingProducers.length === 1 ? '' : 's'}
                  {currentRegionCategoryCount > 0 ? ` · ${currentRegionCategoryCount} categor${currentRegionCategoryCount === 1 ? 'y' : 'ies'}` : ''}
                </div>
              </div>
              <button
                onClick={handleExploreCurrentRegion}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-lg transition active:scale-95"
              >
                Explore {activeTerroirRegion.name}
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>

            <div className="relative mt-2 text-[9px] text-stone-500 flex items-center gap-2 flex-wrap">
              {activeTerroirRegion.sources.slice(0, 2).map((source, idx) => (
                <React.Fragment key={source.url}>
                  {idx > 0 && <span aria-hidden="true">·</span>}
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-stone-300 underline underline-offset-2"
                  >
                    {source.label.split('—')[0].trim()}
                  </a>
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>
      )}

      {selectedProducer && (
        <div
          className="absolute left-1/2 -translate-x-1/2 z-30 w-[95%] sm:w-[520px] md:w-[560px] max-w-[calc(100%-2rem)] animate-in slide-in-from-bottom-6 duration-300 bottom-[calc(3rem+env(safe-area-inset-bottom,0px))] sm:bottom-5 md:bottom-6"
        >
          <div className="glass-panel p-2.5 sm:p-3.5 md:p-4 rounded-2xl sm:rounded-3xl shadow-2xl border border-white/15 text-stone-100 flex gap-2.5 sm:gap-3.5 md:gap-4 items-center relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-36 h-36 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

            {selectedResolvedCover &&
              selectedResolvedCover.source !== 'category_fallback' && (
                <div className="relative h-20 w-22 sm:h-24 sm:w-32 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 bg-stone-900 border border-white/10">
                  <img
                    src={selectedResolvedCover.url}
                    alt={selectedProducer.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  {selectedProducer.rating != null && (
                    <span className="absolute top-1 left-1 bg-black/70 backdrop-blur-md text-amber-400 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 z-20">
                      <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400" aria-hidden="true" />
                      <span>{selectedProducer.rating}</span>
                    </span>
                  )}
                </div>
              )}

            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
              <div>
                <div className="flex items-center justify-between gap-1">
                  <div className="min-w-0">
                    <span className="block text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-amber-400 truncate">
                      {formatCategoryName(selectedProducer)} · {selectedProducer.region}
                    </span>
                    {selectedProducer.publicPointType === 'producer_shop' && (
                      <span className="block text-[9px] text-sky-300 font-semibold mt-0.5">
                        Public point: Producer Shop
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(selectedProducer.id, 'map_quick_card');
                      }}
                      className={`w-10 h-10 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition ${
                        isFavorite(selectedProducer.id) ? 'text-rose-500 scale-110' : 'text-stone-400 hover:text-white'
                      }`}
                      title={isFavorite(selectedProducer.id) ? 'Remove from saved places' : 'Save place'}
                      aria-label={isFavorite(selectedProducer.id) ? `Remove ${selectedProducer.name} from saved places` : `Save ${selectedProducer.name}`}
                    >
                      <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFavorite(selectedProducer.id) ? 'fill-rose-500' : ''}`} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProducer(null);
                      }}
                      className="w-10 h-10 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-stone-400 hover:text-white hover:bg-white/5 transition"
                      aria-label="Close producer preview"
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
                  className="flex min-h-[40px] md:min-h-[44px] items-center gap-1.5 text-[11px] sm:text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 px-3 md:px-4 py-2 rounded-xl shadow transition active:scale-95 shrink-0 ml-auto"
                >
                  <span>Explore Story</span>
                  <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
