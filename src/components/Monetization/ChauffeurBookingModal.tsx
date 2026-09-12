import React, { useState } from 'react';
import { UserProfile } from '../../types/auth';
import { ChauffeurBooking } from '../../types/monetization';
import { DayTripLoop, Producer } from '../../types/terroir';
import { CRETAN_PRODUCERS } from '../../data/producers';
import { producerService } from '../../services/producerService';
import { 
  X, ShieldCheck, Navigation, ExternalLink, 
  Copy, Check, Compass
} from 'lucide-react';

interface ChauffeurBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserProfile | null;
  initialCircuit?: DayTripLoop | null;
  initialProducer?: Producer | null;
  onBookChauffeur?: (booking: ChauffeurBooking) => Promise<void> | void;
  onOpenAuth?: () => void;
}

export const ChauffeurBookingModal: React.FC<ChauffeurBookingModalProps> = ({
  isOpen,
  onClose,
  initialCircuit,
  initialProducer,
}) => {
  if (!isOpen) return null;

  const [copiedItinerary, setCopiedItinerary] = useState<boolean>(false);

  // Compile stops for the active itinerary if provided
  const circuitStops = initialCircuit?.stops.map((stop, idx) => {
    const p = producerService.getCachedProducer(stop.producerId) || CRETAN_PRODUCERS.find((prod: Producer) => prod.id === stop.producerId);
    return {
      index: idx + 1,
      name: p?.name || stop.producerId,
      region: p?.region || initialCircuit.region,
      village: p?.village || '',
      activity: stop.activity,
      time: stop.suggestedTime,
    };
  }) || [];

  const handleCopyItinerary = async () => {
    try {
      let text = '';
      if (initialCircuit) {
        const stopsList = circuitStops
          .map((s) => `${s.index}. ${s.name} (${s.village ? `${s.village}, ` : ''}${s.region}) — ${s.activity} [${s.time}]`)
          .join('\n');
        text = `Terroir Trail Private Day Tour: ${initialCircuit.title}\nRegion: ${initialCircuit.region}\nEstimated Distance: ${initialCircuit.drivingDistance} (${initialCircuit.totalDuration})\n\nItinerary Stops:\n${stopsList}\n\nNotes for driver: Multi-stop artisan tasting route with luggage room for wine cases.`;
      } else if (initialProducer) {
        text = `Terroir Trail Private Transfer\nDestination: ${initialProducer.name}\nLocation: ${initialProducer.village ? `${initialProducer.village}, ` : ''}${initialProducer.region}\nCategory: ${initialProducer.category}\n\nNotes for driver: Private door-to-door transfer with flexible waiting time.`;
      } else {
        text = `Terroir Trail Private Chauffeur & Vineyard Tour\nRegion: Crete / Greece Wine Country\nRequested: Dedicated driver for winery, olive mill & artisan tasting stops.`;
      }

      await navigator.clipboard.writeText(text);
      setCopiedItinerary(true);
      setTimeout(() => setCopiedItinerary(false), 3500);
    } catch (err) {
      console.error('Failed to copy itinerary to clipboard:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl bg-stone-950 text-stone-100 rounded-3xl shadow-2xl border border-white/15 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-stone-900 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xl font-bold">
              🚐
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-serif-title text-base sm:text-lg font-bold text-white leading-tight">
                  Third-Party Transfer Options
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 font-bold border border-white/10">
                  External Referral
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                Independent driver and transfer marketplace links for winery, olive mill & island visits
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition border border-white/5 cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-4 text-xs">
          
          {/* Active Itinerary Banner */}
          {(initialCircuit || initialProducer) && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <Navigation className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-stone-400 text-[10px] uppercase font-bold tracking-wider block">
                      Target Itinerary for Your Driver
                    </span>
                    <span className="font-bold text-white text-sm">
                      {initialCircuit?.title || (initialProducer ? `${initialProducer.name} Estate Visit` : 'Crete Terroir Circuit')}
                    </span>
                    {initialCircuit && (
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        {initialCircuit.region} • {initialCircuit.drivingDistance} • ~{initialCircuit.totalDuration} total trip
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyItinerary}
                  className={`px-3 py-1.5 rounded-xl border text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                    copiedItinerary
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-stone-900/90 text-amber-300 border-amber-500/30 hover:bg-stone-800'
                  }`}
                  title="Copy itinerary stops to paste into driver notes on booking"
                >
                  {copiedItinerary ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied for Driver!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-amber-400" />
                      <span>Copy Stops for Notes</span>
                    </>
                  )}
                </button>
              </div>

              {/* Stops Pills */}
              {circuitStops.length > 0 && (
                <div className="pt-2 border-t border-amber-500/20 flex flex-wrap gap-1.5">
                  {circuitStops.map((stop) => (
                    <span
                      key={stop.index}
                      className="px-2 py-1 rounded-lg bg-stone-900/80 border border-white/10 text-[10px] text-stone-300 flex items-center gap-1"
                    >
                      <span className="font-bold text-amber-400">{stop.index}.</span>
                      <span className="truncate max-w-[140px] sm:max-w-[180px]">{stop.name}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Third-Party Transport Disclosure Banner */}
          <div className="p-3.5 rounded-2xl bg-stone-900/70 border border-amber-500/25 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                <span>Third-Party Transport Disclosure</span>
              </div>
              <p className="text-stone-400 text-[11px] leading-relaxed">
                TerroirTrail provides itinerary tools and links to independent transport marketplaces. Availability, licensing, insurance, prices, cancellation terms and booking confirmation are determined by the external provider.
              </p>
            </div>
          </div>

          {/* Two Transport Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            
            {/* Option 1: Welcome Pickups */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 border border-amber-500/30 flex flex-col justify-between hover:border-amber-500/50 transition shadow-lg">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
                      ⭐
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">Welcome Pickups</h3>
                      <span className="text-[10px] text-amber-400 font-semibold block">
                        Private Sedans & Minivans
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Recommended
                  </span>
                </div>

                <p className="text-stone-400 text-[11px] leading-relaxed">
                  Suitable for couples & small groups (1–8 guests). Request private sedans or minivans for wine route visits.
                </p>

                <div className="space-y-1.5 pt-1 border-t border-white/5 text-[11px] text-stone-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Upfront pricing shown on provider checkout</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Flight & hotel pickup coordination</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Cancellation terms subject to provider policy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Private air-conditioned vehicles</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-white/10">
                <a
                  href="https://tpx.lv/75XqHdHY"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Book on Welcome Pickups</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <span className="text-[10px] text-stone-500 text-center block mt-1.5">
                  External Booking Link • Provider Terms Apply
                </span>
              </div>
            </div>

            {/* Option 2: GetTransfer */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 border border-emerald-500/30 flex flex-col justify-between hover:border-emerald-500/50 transition shadow-lg">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                      🚐
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">GetTransfer</h3>
                      <span className="text-[10px] text-emerald-400 font-semibold block">
                        Marketplace Bids • Vans & Minibuses
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Best for Groups
                  </span>
                </div>

                <p className="text-stone-400 text-[11px] leading-relaxed">
                  Option for groups of 6–16+ guests or custom hourly hiring. Independent drivers and fleets submit bids on your custom itinerary.
                </p>

                <div className="space-y-1.5 pt-1 border-t border-white/5 text-[11px] text-stone-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Van & minibus options available from bidders</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Compare marketplace bids from independent carriers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Hourly hire options for multi-stop winery itineraries</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Luggage space for wine cases and tasting purchases</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-white/10">
                <a
                  href="https://gettransfer.tpx.lv/PB1EGU6f"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Compare Van Bids on GetTransfer</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <span className="text-[10px] text-stone-500 text-center block mt-1.5">
                  External Marketplace • Provider Terms Apply
                </span>
              </div>
            </div>

          </div>

          {/* Self-Guided Free Reminder */}
          <div className="p-3 rounded-2xl bg-stone-900/50 border border-white/10 flex items-center justify-between gap-3 text-stone-400 text-[11px]">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-stone-400 shrink-0" />
              <span>
                Prefer to drive yourself? All curated trails are free to explore with one-click Google Maps navigation. Please designate a sober driver if tasting.
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium whitespace-nowrap transition cursor-pointer shrink-0"
            >
              Back to Route
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
