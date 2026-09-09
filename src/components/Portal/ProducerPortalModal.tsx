import React, { useState, useEffect } from 'react';
import { Producer } from '../../types/terroir';
import { TastingBooking, ProducerOverride } from '../../types/booking';
import { UserProfile } from '../../types/auth';
import { 
  X, Check, AlertCircle, Clock, Calendar, Users, Phone, Mail, 
  Sparkles, CheckCircle2, XCircle, Building2, ChevronDown, Save, Send, 
  Crown, Globe, ExternalLink, ShieldCheck, ArrowRight, LogIn
} from 'lucide-react';

interface ProducerPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onOpenAuth?: (role?: 'producer') => void;
  onLoginAsDemoProducer?: (key: 'paterianakis' | 'manousakis' | 'charma' | 'monteraponi') => void;
  producers: Producer[];
  bookings: TastingBooking[];
  onUpdateBookingStatus: (bookingId: string, status: TastingBooking['status']) => Promise<void>;
  onSaveProducerOverride: (override: ProducerOverride) => Promise<void>;
  getProducerOverride: (producerId: string) => ProducerOverride | undefined;
}

export const ProducerPortalModal: React.FC<ProducerPortalModalProps> = ({
  isOpen,
  onClose,
  user,
  onOpenAuth,
  onLoginAsDemoProducer,
  producers,
  bookings,
  onUpdateBookingStatus,
  onSaveProducerOverride,
  getProducerOverride,
}) => {
  if (!isOpen) return null;

  const isProducerAuthenticated = Boolean(user && user.isProducer && user.claimedProducerId);

  // Initialize selected producer to the authenticated user's claimed estate
  const [selectedProducerId, setSelectedProducerId] = useState<string>(() => {
    if (user?.claimedProducerId) {
      const match = producers.find((p) => p.id === user.claimedProducerId);
      if (match) return match.id;
    }
    return producers[0]?.id || 'domaine-paterianakis';
  });

  const [activeTab, setActiveTab] = useState<'bookings' | 'notice' | 'plan' | 'metrics'>('bookings');

  // Sync selected producer whenever user profile changes
  useEffect(() => {
    if (user?.claimedProducerId) {
      setSelectedProducerId(user.claimedProducerId);
    }
  }, [user?.claimedProducerId]);

  const selectedProducer =
    producers.find((p) => p.id === selectedProducerId) ||
    producers.find((p) => p.id === user?.claimedProducerId) ||
    producers[0];

  const currentOverride = selectedProducer ? getProducerOverride(selectedProducer.id) : undefined;
  const [customNotice, setCustomNotice] = useState<string>(
    currentOverride?.customNotice || ''
  );
  const [isAcceptingBookings, setIsAcceptingBookings] = useState<boolean>(
    currentOverride ? currentOverride.isAcceptingBookings : true
  );
  const [isProTier, setIsProTier] = useState<boolean>(
    currentOverride ? Boolean(currentOverride.isProTier) : false
  );
  const [directBottleShopUrl, setDirectBottleShopUrl] = useState<string>(
    currentOverride?.directBottleShopUrl || ''
  );
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Sync state when selected producer changes
  useEffect(() => {
    if (selectedProducer) {
      const ov = getProducerOverride(selectedProducer.id);
      setCustomNotice(ov?.customNotice || '');
      setIsAcceptingBookings(ov ? ov.isAcceptingBookings : true);
      setIsProTier(ov ? Boolean(ov.isProTier) : false);
      setDirectBottleShopUrl(ov?.directBottleShopUrl || '');
      setSaveSuccess(false);
    }
  }, [selectedProducerId, getProducerOverride]);

  const handleSelectProducer = (id: string) => {
    setSelectedProducerId(id);
  };

  const estateBookings = selectedProducer ? bookings.filter((b) => b.producerId === selectedProducer.id) : [];
  const pendingBookings = estateBookings.filter((b) => b.status === 'pending');
  const confirmedBookings = estateBookings.filter((b) => b.status === 'confirmed');

  const totalGuests = confirmedBookings.reduce((sum, b) => sum + b.guestsCount, 0);
  const estimatedRevenue = confirmedBookings.reduce((sum, b) => sum + b.totalEstimated, 0);

  const handleSaveNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProducer) return;
    await onSaveProducerOverride({
      producerId: selectedProducer.id,
      customNotice: customNotice.trim(),
      isAcceptingBookings,
      isProTier,
      directBottleShopUrl: directBottleShopUrl.trim(),
      updatedAt: new Date().toISOString(),
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl bg-stone-950 text-stone-100 rounded-3xl shadow-2xl border border-white/15 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-stone-900 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-md ring-1 ring-white/20 bg-stone-950 p-0.5 shrink-0 flex items-center justify-center">
              <img src="/logo.png" alt="TerroirTrail" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-title text-base sm:text-lg font-bold text-white leading-tight">
                  {isProducerAuthenticated && selectedProducer
                    ? `${selectedProducer.name} — Host Dashboard`
                    : 'Producer & Host Portal'}
                </h2>
                {isProducerAuthenticated && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Verified Host
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-400">
                {isProducerAuthenticated && user
                  ? `Logged in as ${user.name} (${user.email}) · ${selectedProducer?.village || ''}, ${selectedProducer?.region || ''}`
                  : 'Manage tasting reservations, estate hours & announcements'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition border border-white/5 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ========================================================= */}
        {/* GATE: IF NOT LOGGED IN AS A PRODUCER                      */}
        {/* ========================================================= */}
        {!isProducerAuthenticated ? (
          <div className="p-6 sm:p-10 text-center space-y-5 my-auto">
            <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/20 mx-auto bg-stone-900 p-1">
              <img src="/logo.png" alt="TerroirTrail" className="w-full h-full object-contain" />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="text-lg sm:text-xl font-bold text-white font-serif-title">
                Producer & Estate Host Sign In Required
              </h3>
              <p className="text-xs text-stone-400 max-w-md mx-auto leading-relaxed">
                This dashboard is strictly reserved for verified winery, brewery, distillery and farm hosts. Log in to manage reservations, adjust hours, and post live harvest bulletins.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5 max-w-sm mx-auto">
              <button
                onClick={() => {
                  onClose();
                  if (onOpenAuth) onOpenAuth('producer');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Producer Sign In / Register</span>
              </button>

              {onLoginAsDemoProducer && (
                <button
                  onClick={() => {
                    onLoginAsDemoProducer('paterianakis');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-850 text-stone-300 border border-white/10 hover:border-amber-400/40 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>⚡ 1-Click Host Demo</span>
                </button>
              )}
            </div>

            <div className="pt-4 flex items-center justify-center gap-2 text-[11px] text-stone-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Are you a registered producer on TerroirTrail? Access is linked directly to your estate profile.</span>
            </div>
          </div>
        ) : (
          <>
            {/* Authenticated Producer Estate Bar */}
            <div className="px-5 py-3 bg-stone-900/60 border-b border-white/10 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-stone-400 text-[11px] font-semibold shrink-0">Managing Estate:</span>
                
                {/* If user is demo host, allow testing other estates */}
                {user?.id.startsWith('producer_') ? (
                  <div className="relative flex-1">
                    <select
                      value={selectedProducerId}
                      onChange={(e) => handleSelectProducer(e.target.value)}
                      className="w-full bg-stone-950 border border-amber-500/30 text-amber-300 font-bold rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-amber-400 transition cursor-pointer pr-8 truncate"
                    >
                      {producers.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.village}, {p.region})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <span className="font-bold text-white truncate bg-stone-900 px-3 py-1.5 rounded-xl border border-white/10">
                    {selectedProducer?.name} ({selectedProducer?.village}, {selectedProducer?.region})
                  </span>
                )}
              </div>

              {/* Quick Metrics Badges */}
              <div className="hidden sm:flex items-center gap-2 text-[10px]">
                <span className="px-2 py-1 rounded-lg bg-amber-500/15 text-amber-300 font-bold border border-amber-500/25">
                  {pendingBookings.length} Pending
                </span>
                <span className="px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/25">
                  {confirmedBookings.length} Confirmed
                </span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10 bg-stone-950 px-5 pt-2 text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`py-2 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'bookings'
                ? 'border-amber-400 text-amber-400 font-bold'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            <span>📋 Bookings & Requests</span>
            {pendingBookings.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-stone-950 text-[9px] font-bold flex items-center justify-center">
                {pendingBookings.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('notice')}
            className={`py-2 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'notice'
                ? 'border-amber-400 text-amber-400 font-bold'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            <span>📢 Estate Announcement</span>
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`py-2 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'metrics'
                ? 'border-amber-400 text-amber-400 font-bold'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            <span>📊 Estate Stats</span>
          </button>
          <button
            onClick={() => setActiveTab('plan')}
            className={`py-2 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'plan'
                ? 'border-amber-400 text-amber-400 font-bold'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Host Pro Tier</span>
            {isProTier && (
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-400 text-stone-950 font-bold">
                ACTIVE
              </span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto flex-1 min-h-0 space-y-4 text-xs">
          
          {/* TAB 1: Bookings */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              {estateBookings.length === 0 ? (
                <div className="py-12 text-center text-stone-500 space-y-2">
                  <Calendar className="w-10 h-10 mx-auto text-stone-600 stroke-[1.5]" />
                  <p className="text-sm font-medium">No tasting bookings recorded yet for this estate.</p>
                  <p className="text-[11px] text-stone-500">
                    When travelers book visits through TerroirTrail, requests will appear here in real-time.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {estateBookings.map((b) => (
                    <div
                      key={b.id}
                      className={`p-4 rounded-2xl border transition ${
                        b.status === 'pending'
                          ? 'bg-stone-900 border-amber-500/40 shadow-lg shadow-amber-500/5'
                          : b.status === 'confirmed'
                          ? 'bg-stone-900/90 border-emerald-500/30'
                          : 'bg-stone-950/60 border-white/5 opacity-60'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-white/10">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{b.userName}</span>
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                b.status === 'pending'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : b.status === 'confirmed'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              }`}
                            >
                              {b.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-stone-400 text-[11px] mt-0.5">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-amber-400" />
                              {b.date} at {b.timeSlot}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-amber-400" />
                              {b.guestsCount} {b.guestsCount === 1 ? 'Guest' : 'Guests'}
                            </span>
                          </div>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="text-emerald-400 font-bold text-sm">
                            €{b.totalEstimated}
                          </span>
                          <div className="text-[10px] text-stone-400">{b.experienceTitle}</div>
                        </div>
                      </div>

                      {/* Guest Details & Special Requests */}
                      <div className="pt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div className="flex items-center gap-1.5 text-stone-300">
                          <Mail className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                          <a href={`mailto:${b.userEmail}`} className="hover:text-amber-400 underline truncate">
                            {b.userEmail}
                          </a>
                        </div>
                        {b.userPhone && (
                          <div className="flex items-center gap-1.5 text-stone-300">
                            <Phone className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                            <a href={`tel:${b.userPhone}`} className="hover:text-amber-400 underline">
                              {b.userPhone}
                            </a>
                          </div>
                        )}
                      </div>

                      {b.specialRequests && (
                        <div className="mt-2 p-2 rounded-xl bg-stone-950/80 border border-white/5 text-[11px] text-stone-300">
                          <span className="font-semibold text-amber-300">Note: </span>
                          <span>{b.specialRequests}</span>
                        </div>
                      )}

                      {/* Actions: Approve / Decline */}
                      {b.status === 'pending' && (
                        <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-end gap-2">
                          <button
                            onClick={() => onUpdateBookingStatus(b.id, 'cancelled')}
                            className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition cursor-pointer"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => onUpdateBookingStatus(b.id, 'confirmed')}
                            className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Confirm Reservation</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Notice & Announcement */}
          {activeTab === 'notice' && (
            <form onSubmit={handleSaveNotice} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                <p className="font-bold mb-0.5">📢 Live Estate Bulletin</p>
                <p className="text-[11px] text-amber-200/80 leading-relaxed">
                  Post live harvest updates, barrel room closures, or special seasonal tastings directly to travelers viewing your estate on the map.
                </p>
              </div>

              {saveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Announcement saved and synced to live Cloud server!</span>
                </div>
              )}

              <div>
                <label className="block text-stone-400 text-[11px] font-semibold mb-1">
                  Estate Notice (Displayed prominently on {selectedProducer.name}'s page)
                </label>
                <textarea
                  value={customNotice}
                  onChange={(e) => setCustomNotice(e.target.value)}
                  placeholder="e.g., Grape harvest underway! Walk-ins welcome for fresh grape must & barrel tastings this weekend."
                  rows={3}
                  className="w-full bg-stone-900 border border-white/10 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-amber-400 transition"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-900 border border-white/10">
                <div>
                  <span className="font-bold text-white text-xs block">
                    Accept Online Tasting Reservations
                  </span>
                  <span className="text-[11px] text-stone-400">
                    Allow travelers to book tasting flights directly from TerroirTrail
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAcceptingBookings((prev) => !prev)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                    isAcceptingBookings
                      ? 'bg-emerald-500 text-stone-950'
                      : 'bg-stone-800 text-stone-400 border border-white/10'
                  }`}
                >
                  {isAcceptingBookings ? 'Enabled' : 'Paused'}
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-lg transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save & Publish Live Notice</span>
              </button>
            </form>
          )}

          {/* TAB 3: Metrics */}
          {activeTab === 'metrics' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-stone-900 border border-white/10">
                  <span className="text-stone-400 text-[10px] uppercase tracking-wider font-semibold block mb-1">
                    Confirmed Guests
                  </span>
                  <span className="text-2xl font-bold text-amber-400 font-serif-title">
                    {totalGuests}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-stone-900 border border-white/10">
                  <span className="text-stone-400 text-[10px] uppercase tracking-wider font-semibold block mb-1">
                    Est. Tasting Value
                  </span>
                  <span className="text-2xl font-bold text-emerald-400 font-serif-title">
                    €{estimatedRevenue}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-stone-900 border border-white/10 col-span-2 sm:col-span-1">
                  <span className="text-stone-400 text-[10px] uppercase tracking-wider font-semibold block mb-1">
                    Total Bookings
                  </span>
                  <span className="text-2xl font-bold text-white font-serif-title">
                    {estateBookings.length}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-stone-900 border border-white/10 space-y-2">
                <span className="font-bold text-white text-xs block">Estate Host Tips</span>
                <ul className="text-[11px] text-stone-400 space-y-1.5 list-disc list-inside leading-relaxed">
                  <li>Confirming requests within 2 hours increases traveler show-up rates by 80%.</li>
                  <li>Mentioning road conditions (e.g. standard asphalt vs gravel track) helps travelers choose the right rental vehicle.</li>
                  <li>Highlighting local Cretan cheeses (Graviera, Mizithra) paired with your native wines creates unforgettable experiences.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 4: Plan & Subscription */}
          {activeTab === 'plan' && (
            <div className="space-y-4">
              {saveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Host Pro settings saved and synced to cloud!</span>
                </div>
              )}

              {/* Plan Comparison Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Free Partner */}
                <div className={`p-4 rounded-2xl border transition ${
                  !isProTier
                    ? 'bg-stone-900/90 border-white/20'
                    : 'bg-stone-950/60 border-white/5 opacity-60'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-xs">Standard Partner</span>
                    <span className="text-[10px] text-stone-400">Free Forever</span>
                  </div>
                  <ul className="text-[11px] text-stone-400 space-y-1.5 list-disc list-inside">
                    <li>Standard map marker & directory page</li>
                    <li>Online tasting requests</li>
                    <li>12% platform booking commission</li>
                  </ul>
                  {!isProTier && (
                    <span className="mt-3 block text-center py-1.5 rounded-xl bg-stone-800 text-stone-300 text-[11px] font-bold">
                      Current Plan
                    </span>
                  )}
                </div>

                {/* Terroir Pro */}
                <div className={`p-4 rounded-2xl border transition relative overflow-hidden ${
                  isProTier
                    ? 'bg-gradient-to-br from-amber-500/20 via-stone-900 to-stone-900 border-amber-400 shadow-xl shadow-amber-500/10'
                    : 'bg-stone-900/90 border-amber-500/30'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Crown className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-white text-xs">Verified Terroir Pro</span>
                    </div>
                    <span className="font-serif-title text-amber-300 font-bold text-sm">€39<span className="text-[10px] text-stone-400">/mo</span></span>
                  </div>
                  <ul className="text-[11px] text-stone-300 space-y-1.5 list-disc list-inside">
                    <li><strong className="text-amber-300">Gold Glowing Badge</strong> on interactive map</li>
                    <li><strong className="text-amber-300">0% Commission</strong> on tasting reservations</li>
                    <li><strong className="text-amber-300">Direct Online Shop Link</strong> on your drawer</li>
                    <li>Top featured ranking in curated Day Circuits</li>
                  </ul>

                  <button
                    type="button"
                    onClick={() => {
                      setIsProTier(!isProTier);
                    }}
                    className={`w-full mt-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      isProTier
                        ? 'bg-emerald-500 text-stone-950 shadow-md'
                        : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-lg'
                    }`}
                  >
                    <Crown className="w-3.5 h-3.5" />
                    <span>{isProTier ? '✓ Pro Tier Active (Click to Pause)' : 'Upgrade to Host Pro (€39/mo)'}</span>
                  </button>
                </div>
              </div>

              {/* Pro Customization Settings */}
              <form onSubmit={handleSaveNotice} className="p-4 rounded-2xl bg-stone-900 border border-white/10 space-y-3">
                <span className="font-bold text-white text-xs block">
                  Pro Estate Settings & Direct E-Commerce
                </span>

                <div>
                  <label className="block text-stone-400 text-[11px] font-semibold mb-1">
                    Direct Online Bottle Shop URL
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={directBottleShopUrl}
                      onChange={(e) => setDirectBottleShopUrl(e.target.value)}
                      placeholder="https://shop.manousakiswinery.com"
                      className="w-full bg-stone-950 border border-white/10 text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-amber-400 transition"
                    />
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1">
                    Adds a direct "Buy Bottles Direct" button on your estate profile for travelers to order wine after their visit.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Plan & Store Link</span>
                </button>
              </form>

              {/* Pro Visitor Demographics Analytics */}
              <div className="p-4 rounded-2xl bg-stone-900 border border-white/10 space-y-2">
                <span className="font-bold text-white text-xs block">
                  Pro Visitor Demographic Insights (Last 30 Days)
                </span>
                <div className="grid grid-cols-4 gap-2 text-center pt-1">
                  <div className="p-2 rounded-xl bg-stone-950/80 border border-white/5">
                    <span className="text-base block">🇩🇪</span>
                    <span className="font-bold text-white text-xs block">42%</span>
                    <span className="text-[9px] text-stone-400">Germany</span>
                  </div>
                  <div className="p-2 rounded-xl bg-stone-950/80 border border-white/5">
                    <span className="text-base block">🇬🇧</span>
                    <span className="font-bold text-white text-xs block">28%</span>
                    <span className="text-[9px] text-stone-400">UK</span>
                  </div>
                  <div className="p-2 rounded-xl bg-stone-950/80 border border-white/5">
                    <span className="text-base block">🇺🇸</span>
                    <span className="font-bold text-white text-xs block">18%</span>
                    <span className="text-[9px] text-stone-400">USA</span>
                  </div>
                  <div className="p-2 rounded-xl bg-stone-950/80 border border-white/5">
                    <span className="text-base block">🇫🇷</span>
                    <span className="font-bold text-white text-xs block">12%</span>
                    <span className="text-[9px] text-stone-400">France</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
        </>
      )}

      </div>
    </div>
  );
};
