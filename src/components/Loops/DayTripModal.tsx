import React, { useState } from 'react';
import { CRETAN_DAY_TRIP_LOOPS } from '../../data/loops';
import { CRETAN_PRODUCERS } from '../../data/producers';
import { DayTripLoop, Producer } from '../../types/terroir';
import { X, Clock, Navigation, MapPin, Compass, ArrowRight, CheckCircle2 } from 'lucide-react';

interface DayTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLoop: (loop: DayTripLoop) => void;
  onSelectProducer: (producer: Producer) => void;
}

export const DayTripModal: React.FC<DayTripModalProps> = ({
  isOpen,
  onClose,
  onSelectLoop,
  onSelectProducer,
}) => {
  const [activeLoopIndex, setActiveLoopIndex] = useState<number>(0);

  if (!isOpen) return null;

  const currentLoop = CRETAN_DAY_TRIP_LOOPS[activeLoopIndex];

  // Helper to find producer details by ID
  const getProducer = (id: string) => CRETAN_PRODUCERS.find((p) => p.id === id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-stone-950 text-white border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-title text-lg sm:text-xl font-bold">
                Curated Cretan Day-Trip Loops
              </h2>
              <p className="text-xs text-stone-400">
                Balanced 3-stop day routes connecting indigenous makers & scenic roads
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Loop Tab Selector */}
        <div className="flex border-b border-stone-200 bg-stone-50 overflow-x-auto scrollbar-none px-4 pt-2 shrink-0">
          {CRETAN_DAY_TRIP_LOOPS.map((loop, idx) => {
            const isActive = idx === activeLoopIndex;
            return (
              <button
                key={loop.id}
                onClick={() => setActiveLoopIndex(idx)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
                  isActive
                    ? 'border-amber-600 text-stone-950 bg-white shadow-xs rounded-t-xl'
                    : 'border-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-100/60'
                }`}
              >
                <span>{idx === 0 ? '🍇' : idx === 1 ? '🫒' : '⛰️'}</span>
                <span>{loop.region.toUpperCase()}</span>
                <span className="text-[11px] text-stone-400 font-normal">({loop.totalDuration})</span>
              </button>
            );
          })}
        </div>

        {/* Loop Details Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Loop Title & Overview */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
              <span>{currentLoop.region.toUpperCase()}, CRETE</span>
              <span>•</span>
              <span className="text-stone-500 font-normal">{currentLoop.drivingDistance}</span>
            </div>

            <h3 className="font-serif-title text-xl sm:text-2xl font-bold text-stone-900 leading-snug">
              {currentLoop.title}
            </h3>
            <p className="text-xs font-medium text-stone-400 italic mb-2">
              {currentLoop.greekTitle}
            </p>
            <p className="text-sm text-stone-600 leading-relaxed">
              {currentLoop.description}
            </p>
          </div>

          {/* Key Highlights */}
          <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200/80">
            <h4 className="text-xs font-bold text-amber-900 mb-2 uppercase tracking-wide">
              Route Highlights
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-amber-950">
              {currentLoop.highlightPointers.map((h, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sequential 3-Stop Timeline */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
              Recommended Daily Itinerary
            </h4>

            <div className="space-y-4">
              {currentLoop.stops.map((stop, index) => {
                const producer = getProducer(stop.producerId);
                if (!producer) return null;

                return (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 rounded-2xl border border-stone-200 hover:border-amber-300 bg-white hover:shadow-sm transition"
                  >
                    {/* Stop Number Badge */}
                    <div className="flex items-center gap-3 sm:w-44 shrink-0">
                      <div className="w-7 h-7 rounded-full bg-stone-900 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-800">
                          Stop {index + 1}
                        </div>
                        <div className="text-[11px] text-stone-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-stone-400" />
                          <span>{stop.suggestedTime}</span>
                        </div>
                      </div>
                    </div>

                    {/* Producer Card Summary in Timeline */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="font-serif-title font-bold text-stone-900 text-sm">
                          {producer.name}
                        </span>
                        <span className="text-[11px] text-stone-500">
                          ({producer.village})
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 leading-snug mt-0.5">
                        {stop.activity}
                      </p>
                    </div>

                    {/* Action to preview producer */}
                    <button
                      onClick={() => {
                        onClose();
                        onSelectProducer(producer);
                      }}
                      className="text-xs text-amber-700 hover:text-amber-800 font-semibold px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 transition shrink-0"
                    >
                      View Story →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-stone-500">
            Total circuit duration: <strong>{currentLoop.totalDuration}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onSelectLoop(currentLoop);
                onClose();
              }}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl shadow-md transition"
            >
              <span>Explore Loop on Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
