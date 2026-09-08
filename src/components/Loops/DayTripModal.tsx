import React, { useState } from 'react';
import { CRETAN_DAY_TRIP_LOOPS } from '../../data/loops';
import { producerService } from '../../services/producerService';
import { DayTripLoop, Producer } from '../../types/terroir';
import { X, Clock, Compass, ArrowRight, CheckCircle2, Car, Sparkles, Lock, Crown } from 'lucide-react';
import { UserProfile } from '../../types/auth';

interface DayTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLoop: (loop: DayTripLoop) => void;
  onSelectProducer: (producer: Producer) => void;
  onBookChauffeur?: (loop: DayTripLoop) => void;
  user?: UserProfile | null;
  onOpenExplorerPass?: () => void;
}

export const DayTripModal: React.FC<DayTripModalProps> = ({
  isOpen,
  onClose,
  onSelectLoop,
  onSelectProducer,
  onBookChauffeur,
  user,
  onOpenExplorerPass,
}) => {
  const [activeLoopIndex, setActiveLoopIndex] = useState<number>(0);

  if (!isOpen) return null;

  const currentLoop = CRETAN_DAY_TRIP_LOOPS[activeLoopIndex];
  const getProducer = (id: string) => producerService.getCachedProducer(id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-3xl bg-stone-950 text-stone-100 rounded-3xl shadow-2xl border border-white/15 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-stone-900 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-title text-lg sm:text-xl font-bold text-white">
                Curated Cretan Day-Trip Circuits
              </h2>
              <p className="text-xs text-stone-400">
                Paced 3-stop routes connecting historic wineries, stone mills & village stills
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition border border-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-white/10 bg-stone-900/60 overflow-x-auto scrollbar-none px-4 pt-2 shrink-0">
          {CRETAN_DAY_TRIP_LOOPS.map((loop, idx) => {
            const isActive = idx === activeLoopIndex;
            return (
              <button
                key={loop.id}
                onClick={() => setActiveLoopIndex(idx)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
                  isActive
                    ? 'border-amber-400 text-amber-400 bg-white/5 rounded-t-xl'
                    : 'border-transparent text-stone-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{idx === 0 ? '🍇' : idx === 1 ? '🫒' : '⛰️'}</span>
                <span>{loop.region.toUpperCase()}</span>
                {loop.isVipOnly ? (
                  user?.hasExplorerPass ? (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold">
                      VIP
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.2 rounded bg-stone-800 text-stone-400 border border-white/10 font-semibold">
                      <Lock className="w-2.5 h-2.5" /> VIP
                    </span>
                  )
                ) : (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 font-bold">
                    FREE
                  </span>
                )}
                <span className="text-[11px] text-stone-500 font-normal">({loop.totalDuration})</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Circuit Info */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
              <span>{currentLoop.region.toUpperCase()}, CRETE</span>
              <span>•</span>
              <span className="text-stone-400 font-normal">{currentLoop.drivingDistance}</span>
              {currentLoop.isVipOnly && (
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold border border-amber-400/30">
                  {user?.hasExplorerPass ? '👑 VIP Circuit Unlocked' : '🔒 VIP Explorer Circuit'}
                </span>
              )}
            </div>

            <h3 className="font-serif-title text-xl sm:text-2xl font-bold text-white leading-snug">
              {currentLoop.title}
            </h3>
            <p className="text-xs text-stone-400 italic mb-2">
              {currentLoop.greekTitle}
            </p>
            <p className="text-sm text-stone-300 leading-relaxed">
              {currentLoop.description}
            </p>
          </div>

          {/* Freemium VIP Circuit Paywall Teaser */}
          {currentLoop.isVipOnly && !user?.hasExplorerPass && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-stone-900 to-amber-950/30 border border-amber-400/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0 text-base">
                  <Crown className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                    <span>VIP Member Itinerary</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400 text-stone-950 font-bold uppercase">Included with Pass</span>
                  </div>
                  <p className="text-xs text-stone-300 mt-0.5 leading-relaxed">
                    This circuit includes exclusive library barrel tastings, wood-fired kazani feasting, and free welcome pours at each stop.
                  </p>
                </div>
              </div>

              {onOpenExplorerPass && (
                <button
                  type="button"
                  onClick={onOpenExplorerPass}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/25 transition shrink-0 cursor-pointer"
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>Unlock VIP (€19.99)</span>
                </button>
              )}
            </div>
          )}

          {/* Highlights */}
          <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
            <h4 className="text-xs font-bold text-amber-300 mb-2 uppercase tracking-wide">
              Route Highlights
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

          {/* Chauffeur Experience Upsell */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-stone-900 to-amber-950/20 border border-amber-400/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0 text-lg">
                🚐
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-200">Taste Freely • Private Mercedes Chauffeur</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-semibold uppercase">VIP</span>
                </div>
                <p className="text-xs text-stone-300 mt-0.5 leading-relaxed">
                  Enjoy wine and raki pours without worrying about mountain curves, tight stone lanes, or zero-tolerance BAC limits.
                </p>
                <div className="text-[11px] text-stone-400 mt-1">
                  From <strong className="text-amber-300">€280/day</strong> for 7-Pax Mercedes V-Class • Includes chilled mineral water & pickup
                </div>
              </div>
            </div>

            {onBookChauffeur && (
              <button
                type="button"
                onClick={() => onBookChauffeur(currentLoop)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition shrink-0 cursor-pointer"
              >
                <Car className="w-3.5 h-3.5" />
                <span>Reserve Chauffeur</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 3-Stop Route Timeline */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
              Recommended Daily Schedule
            </h4>

            <div className="space-y-3">
              {currentLoop.stops.map((stop, index) => {
                const producer = getProducer(stop.producerId);
                if (!producer) return null;

                return (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center gap-3.5 p-3.5 rounded-2xl border border-white/10 bg-stone-900/80 hover:border-amber-400/50 transition group"
                  >
                    {/* Number Badge */}
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
                      <div className="flex items-baseline gap-2">
                        <span className="font-serif-title font-bold text-white text-sm group-hover:text-amber-400 transition-colors">
                          {producer.name}
                        </span>
                        <span className="text-[11px] text-stone-400">
                          ({producer.village})
                        </span>
                      </div>
                      <p className="text-xs text-stone-300 leading-snug mt-0.5">
                        {stop.activity}
                      </p>
                    </div>

                    {/* Action */}
                    <button
                      onClick={() => {
                        onClose();
                        onSelectProducer(producer);
                      }}
                      className="text-xs text-amber-400 hover:text-amber-300 font-bold px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition shrink-0"
                    >
                      View Story →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-900 border-t border-white/10 flex items-center justify-between shrink-0">
          <span className="text-xs text-stone-400">
            Total circuit duration: <strong className="text-amber-400">{currentLoop.totalDuration}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-400 hover:text-white transition"
            >
              Close
            </button>

            {currentLoop.isVipOnly && !user?.hasExplorerPass ? (
              <>
                <button
                  onClick={() => {
                    onSelectLoop(currentLoop);
                    onClose();
                  }}
                  className="px-4 py-2.5 text-xs font-semibold text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-750 rounded-2xl border border-white/10 transition"
                  title="Preview route waypoints without full VIP guide"
                >
                  Preview Circuit
                </button>
                {onOpenExplorerPass && (
                  <button
                    onClick={onOpenExplorerPass}
                    className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 rounded-2xl shadow-xl shadow-amber-500/20 transition transform active:scale-95 cursor-pointer"
                  >
                    <Crown className="w-3.5 h-3.5" />
                    <span>Unlock VIP (€19.99)</span>
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => {
                  onSelectLoop(currentLoop);
                  onClose();
                }}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-2xl shadow-xl shadow-amber-500/20 transition transform active:scale-95"
              >
                <span>Load Circuit on Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
