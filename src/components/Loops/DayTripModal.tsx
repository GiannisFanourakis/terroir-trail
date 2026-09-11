import React, { useState } from 'react';
import { CURATED_ROUTES, getGoogleMapsRouteUrl } from '../../data/loops';
import { producerService } from '../../services/producerService';
import { DayTripLoop, Producer } from '../../types/terroir';
import { X, Clock, Compass, ArrowRight, CheckCircle2, Car, ExternalLink, MapPin, Navigation, Wifi } from 'lucide-react';
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
  onBookChauffeur,
  user,
  onOpenExplorerPass,
  producers = [],
  loops = CURATED_ROUTES,
}) => {
  const [activeLoopIndex, setActiveLoopIndex] = useState<number>(0);

  if (!isOpen) return null;

  const currentLoop = loops[activeLoopIndex] || loops[0];
  
  // Resolve producer lookup
  const getProducer = (id: string): Producer | undefined => {
    return producers.find((p) => p.id === id) || producerService.getCachedProducer(id);
  };

  // Google Maps Universal Directions URL for the entire route
  const googleMapsUrl = getGoogleMapsRouteUrl(
    currentLoop,
    producers.length > 0 ? producers : producerService.getCachedProducers()
  );

  const handleOpenGoogleMaps = () => {
    if (googleMapsUrl) {
      window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-3xl bg-stone-950 text-stone-100 rounded-3xl shadow-2xl border border-white/15 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-stone-900 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-title text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>Curated Terroir Routes</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Self-Guided
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                Paced day routes connecting artisan cellars, stone mills & village stills with turn-by-turn navigation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition border border-white/5 cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Route Selector Tabs */}
        <div className="flex border-b border-white/10 bg-stone-900/60 overflow-x-auto scrollbar-none px-3 sm:px-4 pt-2 shrink-0">
          {loops.map((loop, idx) => {
            const isActive = idx === activeLoopIndex;
            return (
              <button
                key={loop.id}
                onClick={() => setActiveLoopIndex(idx)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition cursor-pointer ${
                  isActive
                    ? 'border-amber-400 text-amber-400 bg-white/5 rounded-t-xl font-bold'
                    : 'border-transparent text-stone-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{getDestinationFlag(loop.destination)}</span>
                <span>{loop.region.toUpperCase()}</span>

                <span className="text-[11px] text-stone-500 font-normal">({loop.totalDuration})</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          
          {/* Active Route Overview */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <span>{currentLoop.region.toUpperCase()}, {currentLoop.destination.replace('_', ' ').toUpperCase()}</span>
              <span>•</span>
              <span className="text-stone-300 font-normal">{currentLoop.drivingDistance}</span>
              <span>•</span>
              <span className="text-stone-300 font-normal">{currentLoop.totalDuration} total</span>
            </div>

            <h3 className="font-serif-title text-xl sm:text-2xl font-bold text-white leading-snug">
              {currentLoop.title}
            </h3>
            <p className="text-xs text-stone-400 italic">
              {currentLoop.greekTitle}
            </p>
            <p className="text-sm text-stone-300 leading-relaxed">
              {currentLoop.description}
            </p>
          </div>

          {/* Quick Action Buttons: Google Maps Turn-by-Turn + In-App Terroir Map */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-stone-900 to-amber-950/25 border border-amber-400/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ready to Explore?</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Turn-by-Turn Navigation
                </span>
              </div>
              <p className="text-xs text-stone-300">
                Launch all {currentLoop.stops.length} stops directly in Google Maps for seamless driving directions.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={handleOpenGoogleMaps}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition transform active:scale-95 cursor-pointer"
                title="Open this route in Google Maps app or browser"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Route Highlights */}
          <div className="p-4 bg-stone-900/80 rounded-2xl border border-white/10">
            <h4 className="text-xs font-bold text-amber-300 mb-2.5 uppercase tracking-wide flex items-center gap-1.5">
              <span>Trail Highlights</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-stone-200">
              {currentLoop.highlightPointers.map((h, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{h}</span>
                </div>
              ))}
            </div>
          </div>



          {/* 3-Stop Route Timeline */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Recommended Daily Itinerary ({currentLoop.stops.length} Stops)
              </h4>
              <span className="text-[11px] text-stone-500">All stops have on-site parking</span>
            </div>

            <div className="space-y-3">
              {currentLoop.stops.map((stop, index) => {
                const producer = getProducer(stop.producerId);
                if (!producer) return null;

                const singleProducerMapsUrl = producer.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${producer.coordinates[0]},${producer.coordinates[1]}`;

                return (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center gap-3.5 p-3.5 rounded-2xl border border-white/10 bg-stone-900/80 hover:border-amber-400/50 transition group"
                  >
                    {/* Number & Time Badge */}
                    <div className="flex items-center gap-3 sm:w-44 shrink-0">
                      <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center shrink-0 shadow-md">
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">
                          Stop {index + 1}
                        </div>
                        <div className="text-[11px] text-stone-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>{stop.suggestedTime}</span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-serif-title font-bold text-white text-sm group-hover:text-amber-400 transition-colors">
                          {producer.name}
                        </span>
                        <span className="text-[11px] text-stone-400">
                          ({producer.village})
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-stone-300 capitalize">
                          {producer.category.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-stone-300 leading-snug mt-1">
                        {stop.activity}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <a
                        href={singleProducerMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-stone-300 hover:text-white font-medium px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-750 border border-white/10 transition flex items-center gap-1"
                        title="Directions to this stop"
                      >
                        <Navigation className="w-3 h-3 text-amber-400" />
                        <span>Directions</span>
                      </a>
                      <button
                        onClick={() => {
                          onClose();
                          onSelectProducer(producer);
                        }}
                        className="text-xs text-amber-400 hover:text-amber-300 font-bold px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition shrink-0 cursor-pointer"
                      >
                        Details →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Optional Chauffeur Inquiries (Decoupled & Non-intrusive) */}
          <div className="p-3.5 rounded-2xl bg-stone-900/60 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Car className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-stone-200 flex items-center gap-1.5">
                  <span>Self-Guided or Private Chauffeur?</span>
                  <span className="text-[10px] text-stone-400 font-normal">• Optional</span>
                </div>
                <p className="text-stone-400 text-[11px] leading-relaxed">
                  All stops are accessible on paved roads. Prefer a dedicated driver to taste freely without driving?
                </p>
              </div>
            </div>

            {onBookChauffeur && (
              <button
                type="button"
                onClick={() => onBookChauffeur(currentLoop)}
                className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-amber-300 hover:text-amber-200 border border-amber-500/30 text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
              >
                <span>Inquire Chauffeur</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Rural Route Connectivity Tip (Yesim eSIM Partner) */}
          <div className="p-3.5 rounded-2xl bg-stone-900/60 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0">
                <Wifi className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-stone-200 flex items-center gap-1.5">
                  <span>Reliable GPS on Rural Backroads</span>
                  <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/25">Partner</span>
                </div>
                <p className="text-stone-400 text-[11px] leading-relaxed">
                  Navigating mountain wine trails? Activate a high-speed travel eSIM with Yesim for reliable navigation without roaming fees.
                </p>
              </div>
            </div>

            <a
              href="https://yesim.tpx.lv/xKgaRoiL"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-cyan-300 hover:text-cyan-200 border border-cyan-500/30 text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
            >
              <span>Get Travel eSIM</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-900 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-stone-400">
            Total circuit: <strong className="text-amber-400">{currentLoop.totalDuration}</strong> • <span className="text-stone-300">{currentLoop.drivingDistance}</span>
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-400 hover:text-white transition cursor-pointer"
            >
              Close
            </button>

            <button
              onClick={() => {
                onSelectLoop(currentLoop);
                onClose();
              }}
              className="px-4 py-2.5 text-xs font-semibold text-stone-200 hover:text-white bg-stone-800 hover:bg-stone-750 rounded-2xl border border-white/10 transition cursor-pointer flex items-center gap-1.5"
              title="Filter and center on-screen map on this circuit"
            >
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Show on Terroir Map</span>
            </button>

            <button
              onClick={handleOpenGoogleMaps}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-2xl shadow-xl shadow-amber-500/20 transition transform active:scale-95 cursor-pointer"
              title="Launch Google Maps driving navigation"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
