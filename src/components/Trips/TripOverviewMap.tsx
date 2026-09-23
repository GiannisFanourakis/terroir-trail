import React, { useEffect, useMemo, useRef } from 'react';
import type { Map as LeafletMap, Marker } from 'leaflet';
import type { Producer } from '../../types/terroir';
import type { TripItemRecordV1, TripProducerState } from '../../services/tripApi';
import { getTripDayLabel } from '../../utils/tripReadiness';

interface TripOverviewMapProps {
  items: TripItemRecordV1[];
  producers: Producer[];
  producerStates: Record<string, TripProducerState>;
  catalogueIsLive: boolean;
  startDate?: string | null;
  onSelectProducer: (producer: Producer) => void;
}

interface MappableStop {
  item: TripItemRecordV1;
  producer: Producer;
  index: number;
}

export const TripOverviewMap: React.FC<TripOverviewMapProps> = ({
  items,
  producers,
  producerStates,
  catalogueIsLive,
  startDate,
  onSelectProducer,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRefs = useRef<Marker[]>([]);

  const producerMap = useMemo(
    () => new Map(producers.map((producer) => [producer.id, producer])),
    [producers]
  );

  const mappableStops = useMemo<MappableStop[]>(() => {
    if (!catalogueIsLive) return [];

    return [...items]
      .sort((a, b) => a.position - b.position)
      .map((item, index) => ({
        item,
        producer: producerMap.get(item.producerId),
        index,
      }))
      .filter(
        (entry): entry is { item: TripItemRecordV1; producer: Producer; index: number } =>
          Boolean(
            entry.producer &&
              producerStates[entry.item.producerId] === 'active' &&
              (entry.producer.locationStatus === 'verified_entrance' ||
                entry.producer.locationStatus === 'verified_location') &&
              Number.isFinite(entry.producer.coordinates[0]) &&
              Number.isFinite(entry.producer.coordinates[1])
          )
      );
  }, [catalogueIsLive, items, producerMap, producerStates]);

  const withheldCount = Math.max(0, items.length - mappableStops.length);

  useEffect(() => {
    if (!catalogueIsLive || !containerRef.current || mappableStops.length === 0) {
      return undefined;
    }

    let cancelled = false;

    const mountMap = async () => {
      const leafletModule = await import('leaflet');
      if (cancelled || !containerRef.current) return;

      const L = leafletModule.default;
      mapRef.current?.remove();

      const map = L.map(containerRef.current, {
        zoomControl: true,
        attributionControl: true,
        scrollWheelZoom: false,
      });
      mapRef.current = map;

      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, USGS',
          maxZoom: 19,
        }
      ).addTo(map);

      const bounds = L.latLngBounds([]);
      const markers: Marker[] = [];

      for (const stop of mappableStops) {
        const dayBadge = stop.item.dayNumber ? `D${stop.item.dayNumber}` : '';
        const icon = L.divIcon({
          className: 'trip-overview-marker',
          html: `<div style="display:flex;align-items:center;justify-content:center;min-width:30px;height:30px;padding:0 6px;border-radius:999px;background:#f59e0b;color:#1c1917;font-weight:800;font-size:11px;border:2px solid rgba(255,255,255,.9);box-shadow:0 4px 14px rgba(0,0,0,.35);">${stop.index + 1}${dayBadge ? `<span style="font-size:8px;margin-left:3px;opacity:.75">${dayBadge}</span>` : ''}</div>`,
          iconSize: [42, 32],
          iconAnchor: [21, 16],
        });

        const marker = L.marker(stop.producer.coordinates, {
          icon,
          title: stop.producer.name,
          keyboard: true,
        }).addTo(map);

        marker.on('click', () => onSelectProducer(stop.producer));
        marker.bindTooltip(
          `${stop.index + 1}. ${stop.producer.name}${stop.item.dayNumber ? ` · ${getTripDayLabel(stop.item.dayNumber, startDate)}` : ''}`,
          { direction: 'top', offset: [0, -12] }
        );
        bounds.extend(stop.producer.coordinates);
        markers.push(marker);
      }

      markerRefs.current = markers;

      if (mappableStops.length === 1) {
        map.setView(mappableStops[0].producer.coordinates, 12, { animate: false });
      } else {
        map.fitBounds(bounds, {
          padding: [24, 24],
          maxZoom: 12,
          animate: false,
        });
      }

      window.setTimeout(() => map.invalidateSize(), 0);
    };

    void mountMap();

    return () => {
      cancelled = true;
      markerRefs.current.forEach((marker) => marker.remove());
      markerRefs.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [catalogueIsLive, mappableStops, onSelectProducer, startDate]);

  if (!catalogueIsLive) {
    return (
      <section className="rounded-2xl border border-white/10 bg-stone-900/50 p-4">
        <div className="text-xs font-bold text-white">Trip overview map</div>
        <p className="mt-1 text-[11px] leading-relaxed text-stone-400">
          The live catalogue is unavailable, so current producer locations are withheld rather than reconstructed from fallback data.
        </p>
      </section>
    );
  }

  if (mappableStops.length === 0) {
    return (
      <section className="rounded-2xl border border-white/10 bg-stone-900/50 p-4">
        <div className="text-xs font-bold text-white">Trip overview map</div>
        <p className="mt-1 text-[11px] leading-relaxed text-stone-400">
          No trip stop currently has a verified visitor location that can be plotted safely.
        </p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-stone-900/50">
      <div className="flex items-start justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div>
          <h3 className="text-xs font-bold text-white">Trip overview map</h3>
          <p className="mt-0.5 text-[10px] leading-relaxed text-stone-400">
            Numbered stops only. TerroirTrail does not infer routes, drive times, or road suitability from this map.
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-white/10 bg-stone-950 px-2 py-1 text-[10px] font-mono text-stone-400">
          {mappableStops.length} mapped
        </span>
      </div>

      <div
        ref={containerRef}
        className="h-56 w-full bg-stone-950"
        role="img"
        aria-label="Map of verified producer locations in this trip"
      />

      {withheldCount > 0 && (
        <div className="border-t border-white/10 px-4 py-2 text-[10px] text-stone-500">
          {withheldCount} planned {withheldCount === 1 ? 'stop is' : 'stops are'} not plotted because current location/state requirements are not met.
        </div>
      )}
    </section>
  );
};
