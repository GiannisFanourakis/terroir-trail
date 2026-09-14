import React, { useMemo, useRef, useState } from 'react';
import { CURATED_ROUTES } from '../../data/loops';
import { producerService } from '../../services/producerService';
import { DayTripLoop, Producer } from '../../types/terroir';
import { evaluateRouteNavigation, getProducerRoadAccessWarning } from '../../utils/routeSafety';
import {
  X,
  Clock,
  Compass,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Navigation,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { UserProfile } from '../../types/auth';

interface DayTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLoop: (loop: DayTripLoop) => void;
  onSelectProducer: (producer: Producer) => void;
  onBookChauffeur?: (loop: DayTripLoop) => void;
  user?: UserProfile | null;
  onOpenExplorerPass?: () => void;
  producers?: Producer[];
  loops?: DayTripLoop[];
}

export const DayTripModal: React.FC<DayTripModalProps> = ({
  isOpen,
  onClose,
  onSelectLoop,
  onSelectProducer,
  producers = [],
  loops = CURATED_ROUTES,
}) => {
  const [activeLoopIndex, setActiveLoopIndex] = useState<number>(0);
  const tabsRef = useRef<HTMLDivElement>(null);

  const producerCatalogue = useMemo(() => {
    // The App producer list can be narrowed by destination/search filters.
    // Curated route validation needs the accumulated authoritative catalogue,
    // so merge cached records with the current UI subset rather than replacing
    // the catalogue with that subset.
    const merged = new Map(
      producerService.getCachedProducers().map((producer) => [producer.id, producer])
    );

    producers.forEach((producer) => merged.set(producer.id, producer));

    return Array.from(merged.values());
  }, [producers]);

  // Draft routes remain hidden. A route with verified stop identities and
  // locations may be published as a guide before its road-access audit is
  // complete, but multi-stop driving navigation remains fail-closed.
  const publishedLoops = useMemo(
    () =>
      loops.filter(
        (loop) =>
          loop.verificationStatus === 'verified_stops' ||
          loop.verificationStatus === 'verified'
      ),
    [loops]
  );

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsRef.current) {
      const offset = direction === 'left' ? -220 : 220;
      tabsRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  if (!isOpen) return null;

  if (publishedLoops.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
        <div className="relative w-full max-w-xl bg-stone-950 text-stone-100 rounded-3xl shadow-2xl border border-white/15 overflow-hidden">
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-stone-900 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif-title text-lg sm:text-xl font-bold text-white">Curated Routes Under Verification</h2>
                <p className="text-xs text-stone-400">Safety-first rural navigation audit in progress</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition border border-white/5 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-sm text-stone-200 leading-relaxed">
              TerroirTrail is re-verifying every route stop, arrival point and road condition before offering multi-stop driving navigation again.
            </p>
            <div className="p-4 rounded-2xl bg-stone-900 border border-white/10 text-xs text-stone-300 leading-relaxed">
              Producer discovery remains available. Individual producer pages still show verified locations and direct producer contact, while unknown road conditions remain explicitly unknown.
            </div>
            <p className="text-[11px] text-stone-500">
              No draft route, missing stop or unverified rural access road will be silently converted into turn-by-turn directions.
            </p>
          </div>

          <div className="p-4 bg-stone-900 border-t border-white/10 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition cursor-pointer"
            >
              Back to Producer Map
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentLoop = publishedLoops[activeLoopIndex] || publishedLoops[0];
  const routeEvaluation = evaluateRouteNavigation(currentLoop, producerCatalogue);

  const getProducer = (id: string): Producer | undefined => {
    return producerCatalogue.find((producer) => producer.id === id);
  };

  const handleOpenGoogleMaps = () => {
    if (routeEvaluation.isSafe && routeEvaluation.url) {
      window.open(routeEvaluation.url, '_blank', 'noopener,noreferrer');
    }
  };

  const getDestinationFlag = (dest: string) => {
    switch (dest) {
      case 'crete': return '🌿';
      case 'santorini': return '🌋';
      case 'peloponnese': return '🏛️';
      case 'northern_greece': return '🏔️';
      case 'tuscany': return '🇮🇹';
      default: return '🍇';
    }
  };

  const neutralDrivingDistance = currentLoop.drivingDistance.replace(/\s*\([^)]*\)\s*$/, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-3xl bg-stone-950 text-stone-100 rounded-3xl shadow-2xl border border-white/15 overflow-hidden flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-stone-900 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-title text-lg sm:text-xl font-bold text-white">Curated Terroir Routes</h2>
              <p className="text-xs text-stone-400">Verified stop locations can be explored before driving access is fully audited</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition border border-white/5 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="relative flex items-center border-b border-white/10 bg-stone-900/90 px-2 shrink-0">
          <button
            type="button"
            onClick={() => scrollTabs('left')}
            className="p-1.5 rounded-lg text-stone-400 hover:text-amber-400 hover:bg-white/5 transition shrink-0 cursor-pointer"
            aria-label="Scroll routes left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div ref={tabsRef} className="flex-1 flex overflow-x-auto scroll-smooth py-2 px-1 gap-1.5">
            {publishedLoops.map((loop, idx) => {
              const isActive = idx === activeLoopIndex;
              return (
                <button
                  key={loop.id}
                  onClick={() => setActiveLoopIndex(idx)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                      : 'text-stone-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <span>{getDestinationFlag(loop.destination)}</span>
                  <span>{loop.region}</span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => scrollTabs('right')}
            className="p-1.5 rounded-lg text-stone-400 hover:text-amber-400 hover:bg-white/5 transition shrink-0 cursor-pointer"
            aria-label="Scroll routes right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <span>{currentLoop.region.toUpperCase()}</span>
              <span>•</span>
              <span className="text-stone-300 font-normal">{neutralDrivingDistance}</span>
              <span>•</span>
              <span className="text-stone-300 font-normal">{currentLoop.totalDuration}</span>
            </div>
            <h3 className="font-serif-title text-xl sm:text-2xl font-bold text-white leading-snug">{currentLoop.title}</h3>
            <p className="text-sm text-stone-300 leading-relaxed">{currentLoop.description}</p>
            {currentLoop.verificationStatus === 'verified_stops' && (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/25 bg-sky-500/10 px-2.5 py-1 text-[10px] font-semibold text-sky-300">
                <CheckCircle2 className="w-3 h-3" />
                Stop locations verified · driving access audit pending
              </div>
            )}
          </div>

          {routeEvaluation.isSafe ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Route navigation verified
                </div>
                <p className="text-xs text-stone-300 mt-1">Every stop has a verified location and road-access classification suitable for this route.</p>
              </div>
              <button
                type="button"
                onClick={handleOpenGoogleMaps}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-2 cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                Open in Google Maps
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/25 space-y-2">
              <div className="text-xs font-bold text-orange-300 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                Driving navigation withheld
              </div>
              <p className="text-xs text-stone-300">This route can be explored stop by stop, but multi-stop turn-by-turn navigation stays disabled until every stop passes the access audit.</p>
              <ul className="text-[11px] text-stone-400 space-y-1 list-disc pl-4">
                {routeEvaluation.issues.slice(0, 5).map((issue, index) => (
                  <li key={`${issue.code}-${issue.producerId || 'route'}-${index}`}>{issue.message}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="p-4 bg-stone-900/80 rounded-2xl border border-white/10">
            <h4 className="text-xs font-bold text-amber-300 mb-2.5 uppercase tracking-wide">Trail Highlights</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-stone-200">
              {currentLoop.highlightPointers.map((highlight, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">Route Stops ({currentLoop.stops.length})</h4>
            <div className="space-y-3">
              {currentLoop.stops.map((stop, index) => {
                const producer = getProducer(stop.producerId);
                if (!producer) {
                  return (
                    <div key={stop.producerId} className="p-3.5 rounded-2xl border border-orange-500/20 bg-orange-500/5 text-xs text-orange-200">
                      Stop {index + 1} is no longer present in the verified producer catalogue. Navigation is disabled.
                    </div>
                  );
                }

                const roadWarning = getProducerRoadAccessWarning(producer);
                const hasVerifiedLocation =
                  producer.locationStatus === 'verified_location' ||
                  producer.locationStatus === 'verified_entrance';

                return (
                  <div key={stop.producerId} className="flex flex-col sm:flex-row sm:items-center gap-3.5 p-3.5 rounded-2xl border border-white/10 bg-stone-900/80">
                    <div className="flex items-center gap-3 sm:w-44 shrink-0">
                      <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center">{index + 1}</div>
                      <div>
                        <div className="text-xs font-bold text-white">Stop {index + 1}</div>
                        <div className="text-[11px] text-stone-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          {stop.suggestedTime}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="font-serif-title font-bold text-white text-sm">{producer.name}</div>
                      <div className="text-[11px] text-stone-400">{producer.village}</div>
                      <p className="text-[11px] text-stone-300 leading-relaxed">{stop.activity}</p>
                      {roadWarning && (
                        <p className="text-[10px] text-orange-300/90 leading-relaxed flex items-start gap-1">
                          <ShieldAlert className="w-3 h-3 shrink-0 mt-0.5" />
                          <span>{roadWarning}</span>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {hasVerifiedLocation && producer.googleMapsUrl && (
                        <a
                          href={producer.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-stone-300 hover:text-white font-medium px-2.5 py-1.5 rounded-xl bg-stone-800 border border-white/10 transition flex items-center gap-1"
                          title={
                            routeEvaluation.isSafe
                              ? 'Open verified driving location'
                              : 'Open verified stop location — road access is not yet fully verified'
                          }
                        >
                          <Navigation className="w-3 h-3 text-amber-400" />
                          {routeEvaluation.isSafe ? 'Directions' : 'Open location'}
                        </a>
                      )}
                      <button
                        onClick={() => {
                          onClose();
                          onSelectProducer(producer);
                        }}
                        className="text-xs text-amber-400 hover:text-amber-300 font-bold px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 transition cursor-pointer"
                      >
                        Details →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 bg-stone-900 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-stone-400">Stop locations may be opened individually; multi-stop driving navigation requires verified road access.</span>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-stone-400 hover:text-white transition cursor-pointer">Close</button>
            <button
              onClick={() => {
                onSelectLoop(currentLoop);
                onClose();
              }}
              className="px-4 py-2.5 text-xs font-semibold text-stone-200 hover:text-white bg-stone-800 rounded-2xl border border-white/10 transition cursor-pointer flex items-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              Start with first stop
            </button>
            {routeEvaluation.isSafe && routeEvaluation.url && (
              <button
                onClick={handleOpenGoogleMaps}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-2xl transition cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                Open in Google Maps
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
