import React, { useState } from 'react';
import { UserProfile } from '../../types/auth';
import { ChauffeurBooking } from '../../types/monetization';
import { DayTripLoop, Producer } from '../../types/terroir';
import { 
  X, Car, ShieldCheck, MapPin, Calendar, Users, 
  CheckCircle2, ArrowRight, Phone, Mail, Clock, Sparkles, Navigation 
} from 'lucide-react';

interface ChauffeurBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  initialCircuit?: DayTripLoop | null;
  initialProducer?: Producer | null;
  onBookChauffeur: (booking: ChauffeurBooking) => Promise<void> | void;
  onOpenAuth: () => void;
}

export const ChauffeurBookingModal: React.FC<ChauffeurBookingModalProps> = ({
  isOpen,
  onClose,
  user,
  initialCircuit,
  initialProducer,
  onBookChauffeur,
  onOpenAuth,
}) => {
  if (!isOpen) return null;

  const [vehicleType, setVehicleType] = useState<'mercedes_van' | 'luxury_sedan'>('mercedes_van');
  
  const tomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [date, setDate] = useState<string>(tomorrow());
  const [pickupCity, setPickupCity] = useState<string>('Chania');
  const [pickupHotel, setPickupHotel] = useState<string>('');
  const [guestsCount, setGuestsCount] = useState<number>(4);
  const [name, setName] = useState<string>(user?.name || '');
  const [email, setEmail] = useState<string>(user?.email || '');
  const [phone, setPhone] = useState<string>('+30 ');
  const [specialRequests, setSpecialRequests] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = useState<ChauffeurBooking | null>(null);

  const vehicleDetails = {
    mercedes_van: {
      name: 'Mercedes-Benz V-Class Chauffeur Van',
      capacity: 'Up to 7 Guests',
      priceEur: 280,
      badge: 'Best for Groups & Tastings',
      desc: 'Tinted privacy glass, climate control, bottled Cretan spring water & spacious luggage room for wine cases.',
    },
    luxury_sedan: {
      name: 'Mercedes-Benz E-Class Luxury Sedan',
      capacity: 'Up to 3 Guests',
      priceEur: 220,
      badge: 'Ideal for Couples',
      desc: 'Leather luxury interior, smooth mountain suspension, professional English-speaking private driver.',
    },
  };

  const currentVehicle = vehicleDetails[vehicleType];
  const isVip = !!user?.hasExplorerPass;
  const vipDiscount = isVip ? 30 : 0;
  const finalPriceEur = Math.max(0, currentVehicle.priceEur - vipDiscount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user && !name.trim()) {
      onOpenAuth();
      return;
    }
    setIsSubmitting(true);
    try {
      const newBooking: ChauffeurBooking = {
        id: `chauf_${Date.now()}`,
        circuitId: initialCircuit?.id,
        circuitTitle: initialCircuit?.title || (initialProducer ? `${initialProducer.name} Tasting Route` : 'Custom Crete Wine Trail'),
        producerId: initialProducer?.id,
        producerName: initialProducer?.name,
        userId: user?.id || `anon_${Date.now()}`,
        userName: name.trim(),
        userEmail: email.trim(),
        userPhone: phone.trim(),
        pickupLocation: `${pickupHotel ? pickupHotel + ', ' : ''}${pickupCity}`,
        date,
        vehicleType,
        vehicleName: currentVehicle.name,
        durationHours: 8,
        guestsCount,
        totalPrice: finalPriceEur,
        specialRequests: specialRequests.trim() || undefined,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      };

      await onBookChauffeur(newBooking);
      setConfirmedBooking(newBooking);
    } catch (e) {
      console.error('Chauffeur booking failed:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setConfirmedBooking(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-xl bg-stone-950 text-stone-100 rounded-3xl shadow-2xl border border-white/15 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-stone-900 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xl font-bold">
              🚐
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-serif-title text-base sm:text-lg font-bold text-white leading-tight">
                  Private Chauffeur & Mercedes Van
                </h2>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  Zero Stress Tastings
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                Door-to-door designated driver across Crete mountain vineyards
              </p>
            </div>
          </div>

          <button
            onClick={resetAndClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition border border-white/5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 min-h-0 text-xs">
          {confirmedBooking ? (
            /* Confirmation */
            <div className="py-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto text-2xl shadow-xl">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="font-serif-title text-xl font-bold text-white">
                  Chauffeur Van Reserved!
                </h3>
                <p className="text-xs text-stone-400 max-w-sm mx-auto">
                  Your dedicated private Mercedes chauffeur has been reserved for <span className="text-amber-300 font-bold">{confirmedBooking.date}</span>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-900 border border-white/10 text-left space-y-2.5 max-w-md mx-auto">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-stone-400">Circuit / Route:</span>
                  <span className="font-bold text-white text-right">{confirmedBooking.circuitTitle}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Vehicle:</span>
                  <span className="font-bold text-amber-300">{confirmedBooking.vehicleName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Pickup Location:</span>
                  <span className="font-bold text-white">{confirmedBooking.pickupLocation}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Day Rate (8 Hours):</span>
                  <span className="font-bold text-emerald-400 text-sm">€{confirmedBooking.totalPrice} (€{Math.round(confirmedBooking.totalPrice / confirmedBooking.guestsCount)}/person)</span>
                </div>
                <div className="flex items-center justify-between pt-1 text-[10px] text-stone-500 border-t border-white/5">
                  <span>Dispatch ID: <code className="text-stone-400">{confirmedBooking.id}</code></span>
                  <span className="text-emerald-400 font-bold uppercase">STATUS: CONFIRMED</span>
                </div>
              </div>

              <button
                onClick={resetAndClose}
                className="w-full max-w-md py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-xl transition active:scale-98 cursor-pointer mx-auto block"
              >
                Done
              </button>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Route Banner */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5">
                <Navigation className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-stone-400 text-[10px] uppercase font-bold tracking-wider block">
                    Assigned Itinerary
                  </span>
                  <span className="font-bold text-white text-xs">
                    {initialCircuit?.title || (initialProducer ? `${initialProducer.name} & Surrounding Estates` : 'Custom Crete Wine & Brewery Circuit')}
                  </span>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Your driver waits at each estate while you taste, explore vineyards, and enjoy lunch without rushing.
                  </p>
                </div>
              </div>

              {/* 1. Vehicle Selection */}
              <div>
                <label className="block text-stone-400 text-[11px] font-semibold mb-1.5">
                  1. Choose Vehicle Class (Full 8-Hour Day Tour)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(['mercedes_van', 'luxury_sedan'] as const).map((type) => {
                    const v = vehicleDetails[type];
                    const isSelected = vehicleType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setVehicleType(type)}
                        className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between gap-2 ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500/60 ring-1 ring-amber-500/40 shadow-lg'
                            : 'bg-stone-900 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-white text-xs">{v.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-bold">
                              {v.capacity}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-400 leading-relaxed">
                            {v.desc}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-white/10">
                          <span className="text-[10px] text-emerald-400 font-semibold">{v.badge}</span>
                          <span className="font-serif-title font-bold text-base text-white">€{v.priceEur}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Date & Pickup City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-stone-400 text-[11px] font-semibold mb-1">
                    2. Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      value={date}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-stone-900 border border-white/10 text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-400 text-[11px] font-semibold mb-1">
                    3. Pickup Region
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={pickupCity}
                      onChange={(e) => setPickupCity(e.target.value)}
                      className="w-full bg-stone-900 border border-white/10 text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      {['Chania', 'Heraklion', 'Rethymno', 'Agios Nikolaos / Elounda', 'Kissamos'].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-stone-400 text-[11px] font-semibold mb-1">
                  4. Hotel / Villa Pickup Address
                </label>
                <input
                  type="text"
                  value={pickupHotel}
                  onChange={(e) => setPickupHotel(e.target.value)}
                  placeholder="e.g., Domes Noruz Chania, or Villa in Platanias"
                  className="w-full bg-stone-900 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              {/* 5. Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Lead Passenger Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-stone-900 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
                  required
                />
                <input
                  type="tel"
                  placeholder="+30 Mobile Phone for Driver"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-stone-900 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              {/* Fare Summary & VIP Discount Bar */}
              <div className="p-3.5 rounded-2xl bg-stone-900/90 border border-white/10 space-y-2 text-xs">
                <div className="flex items-center justify-between text-stone-400">
                  <span>Full Day Dedicated Chauffeur (8h):</span>
                  <span className="font-semibold text-stone-200">€{currentVehicle.priceEur}</span>
                </div>
                {isVip ? (
                  <div className="flex items-center justify-between text-amber-300 font-bold pt-1.5 border-t border-white/5">
                    <span>👑 VIP Member Voucher Discount:</span>
                    <span>-€30.00</span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] flex items-center justify-between text-amber-200">
                    <span>💡 Terroir Explorer VIPs save €30 on chauffeur rides</span>
                    <button
                      type="button"
                      onClick={onOpenAuth}
                      className="font-bold underline cursor-pointer text-amber-300 hover:text-amber-200"
                    >
                      Upgrade
                    </button>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1.5 border-t border-white/10">
                  <span className="font-bold text-stone-300">Total Day Fare:</span>
                  <div className="text-right">
                    <span className="font-serif-title text-lg font-bold text-emerald-400">
                      €{finalPriceEur}
                    </span>
                    <span className="text-[10px] text-stone-500 block">Includes fuel, tolls, cold mineral water & wait time</span>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-xl shadow-amber-500/20 transition transform active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isSubmitting ? (
                  <span>Reserving Chauffeur Van...</span>
                ) : (
                  <>
                    <span>Book Private Driver (€{finalPriceEur} Full Day)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-stone-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Fully licensed Greek tourist transport operator · Free cancellation up to 24h prior</span>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
