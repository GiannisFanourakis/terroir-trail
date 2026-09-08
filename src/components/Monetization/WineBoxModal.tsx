import React, { useState } from 'react';
import { UserProfile } from '../../types/auth';
import { CuratedWineBox, WineBoxOrder } from '../../types/monetization';
import { CURATED_WINE_BOXES, SHIPPING_RATES } from '../../data/wineBoxes';
import { 
  X, Wine, Plane, ShieldCheck, CheckCircle2, 
  ArrowRight, Package, Truck, Sparkles, MapPin, Mail, User 
} from 'lucide-react';

interface WineBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onOrderBox: (order: WineBoxOrder) => Promise<void> | void;
  onOpenAuth: () => void;
}

export const WineBoxModal: React.FC<WineBoxModalProps> = ({
  isOpen,
  onClose,
  user,
  onOrderBox,
  onOpenAuth,
}) => {
  if (!isOpen) return null;

  const [selectedBoxId, setSelectedBoxId] = useState<string>(CURATED_WINE_BOXES[0].id);
  const [shippingCountryCode, setShippingCountryCode] = useState<string>('DE');
  const [name, setName] = useState<string>(user?.name || '');
  const [email, setEmail] = useState<string>(user?.email || '');
  const [phone, setPhone] = useState<string>('+49 ');
  const [address, setAddress] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [postalCode, setPostalCode] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmedOrder, setConfirmedOrder] = useState<WineBoxOrder | null>(null);

  const selectedBox = CURATED_WINE_BOXES.find((b) => b.id === selectedBoxId) || CURATED_WINE_BOXES[0];
  const shippingRate = SHIPPING_RATES[shippingCountryCode] || SHIPPING_RATES.DE;
  const isVip = !!user?.hasExplorerPass;
  const vipDiscount = isVip ? 15 : 0;
  const totalEur = Math.max(0, selectedBox.priceEur + shippingRate.costEur - vipDiscount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.includes('@') || !address.trim()) {
      return;
    }
    setIsSubmitting(true);
    try {
      const order: WineBoxOrder = {
        id: `winebox_${Date.now()}`,
        boxId: selectedBox.id,
        boxName: selectedBox.name,
        bottlesCount: selectedBox.bottlesCount,
        priceEur: selectedBox.priceEur,
        shippingCountry: shippingRate.country,
        shippingCostEur: shippingRate.costEur,
        totalEur,
        recipientName: name.trim(),
        recipientEmail: email.trim(),
        recipientPhone: phone.trim(),
        shippingAddress: address.trim(),
        city: city.trim(),
        postalCode: postalCode.trim(),
        status: 'submitted',
        createdAt: new Date().toISOString(),
      };

      await onOrderBox(order);
      setConfirmedOrder(order);
    } catch (e) {
      console.error('Wine box order failed:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setConfirmedOrder(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl bg-stone-950 text-stone-100 rounded-3xl shadow-2xl border border-white/15 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-stone-900 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xl font-bold">
              ✈️
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-serif-title text-base sm:text-lg font-bold text-white leading-tight">
                  Ship Authentic Cretan Wines Home
                </h2>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  Direct Estate Cellar
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                Certified shockproof, climate-controlled door-to-door delivery across EU, UK & US
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
          {confirmedOrder ? (
            /* Order Confirmation */
            <div className="py-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto text-2xl shadow-xl">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="font-serif-title text-xl font-bold text-white">
                  Wine Box Order Confirmed!
                </h3>
                <p className="text-xs text-stone-400 max-w-sm mx-auto">
                  Your curated <span className="text-amber-300 font-bold">{confirmedOrder.boxName}</span> will be packed in certified shockproof packaging in Heraklion and dispatched to <span className="text-white font-bold">{confirmedOrder.shippingCountry}</span>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-900 border border-white/10 text-left space-y-2 max-w-md mx-auto">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-stone-400">Collection:</span>
                  <span className="font-bold text-white text-right">{confirmedOrder.boxName} ({confirmedOrder.bottlesCount} Bottles)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Destination:</span>
                  <span className="font-bold text-amber-300">{confirmedOrder.city}, {confirmedOrder.shippingCountry}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Total Charged:</span>
                  <span className="font-bold text-emerald-400 text-sm">€{confirmedOrder.totalEur} (Inc. shipping & import customs)</span>
                </div>
                <div className="flex items-center justify-between pt-1 text-[10px] text-stone-500 border-t border-white/5">
                  <span>Order Reference: <code className="text-stone-400">{confirmedOrder.id}</code></span>
                  <span className="text-emerald-400 font-bold uppercase">STATUS: PROCESSING</span>
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
            /* Order Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* 1. Box Selection */}
              <div>
                <label className="block text-stone-400 text-[11px] font-semibold mb-1.5">
                  1. Choose Your Curated Greek Wine Box
                </label>
                <div className="space-y-2">
                  {CURATED_WINE_BOXES.map((box) => {
                    const isSelected = selectedBoxId === box.id;
                    return (
                      <button
                        key={box.id}
                        type="button"
                        onClick={() => setSelectedBoxId(box.id)}
                        className={`w-full text-left p-3.5 rounded-2xl border transition cursor-pointer flex flex-col gap-2 ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500/60 ring-1 ring-amber-500/40 shadow-lg'
                            : 'bg-stone-900 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs">{box.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-800 text-amber-300 font-bold">
                              {box.bottlesCount} Bottles
                            </span>
                          </div>
                          <span className="font-serif-title font-bold text-sm text-white bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                            €{box.priceEur}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400 leading-relaxed">
                          {box.tagline}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {box.includes.map((inc, i) => (
                            <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-stone-800/80 text-stone-300">
                              ✓ {inc}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Destination Country */}
              <div className="p-3.5 rounded-2xl bg-stone-900 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Plane className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="font-bold text-white text-xs block">Select Delivery Country</span>
                    <span className="text-[10px] text-stone-400">Estimated delivery: {shippingRate.days}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={shippingCountryCode}
                    onChange={(e) => setShippingCountryCode(e.target.value)}
                    className="bg-stone-950 border border-white/15 text-white text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    {Object.entries(SHIPPING_RATES).map(([code, rate]) => (
                      <option key={code} value={code}>
                        {rate.country} (+€{rate.costEur})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 3. Delivery Address Form */}
              <div className="space-y-2.5 pt-1 border-t border-white/10">
                <span className="text-stone-400 text-[11px] font-semibold block">
                  3. Shipping & Recipient Details
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Recipient Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-stone-900 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email for Tracking Updates"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-stone-900 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>

                <input
                  type="text"
                  placeholder="Street Address & Apt / House Number"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-stone-900 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
                  required
                />

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-stone-900 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Postal / ZIP Code"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full bg-stone-900 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </div>

              {/* Price Summary Bar */}
              <div className="p-3.5 rounded-2xl bg-stone-900/90 border border-white/10 space-y-2 text-xs">
                <div className="flex items-center justify-between text-stone-400">
                  <span>Wine Box ({selectedBox.bottlesCount} Bottles):</span>
                  <span className="font-semibold text-stone-200">€{selectedBox.priceEur}</span>
                </div>
                <div className="flex items-center justify-between text-stone-400">
                  <span>Certified Insulated Transport ({shippingRate.country}):</span>
                  <span className="font-semibold text-stone-200">€{shippingRate.costEur}</span>
                </div>
                {isVip ? (
                  <div className="flex items-center justify-between text-amber-300 font-bold pt-1.5 border-t border-white/5">
                    <span>👑 VIP Passholder Voucher:</span>
                    <span>-€15.00</span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] flex items-center justify-between text-amber-200">
                    <span>💡 VIP Pass members save €15 on this order</span>
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
                  <span className="font-bold text-stone-300">Total:</span>
                  <div className="text-right">
                    <span className="font-serif-title text-lg font-bold text-emerald-400">
                      €{totalEur}
                    </span>
                    <span className="text-[10px] text-stone-500 block">All taxes & duty included</span>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-xl shadow-amber-500/20 transition transform active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Preparing Dispatch Order...</span>
                ) : (
                  <>
                    <span>Confirm International Wine Box Order (€{totalEur})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-stone-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Certified temperature-controlled transport · 100% Bottle Breakage Guarantee</span>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
