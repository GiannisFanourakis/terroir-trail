import React, { useState, useMemo, useEffect, Suspense, lazy } from 'react';
import { useProducers } from './hooks/useProducers';
import { Producer, FilterState, Destination, DayTripLoop } from './types/terroir';
import { Header } from './components/Header/Header';
import { FilterBar } from './components/FilterBar/FilterBar';
import { MapCanvas } from './components/Map/MapCanvas';
import { ProducerList } from './components/Sidebar/ProducerList';
import { ProducerDetailDrawer } from './components/Drawer/ProducerDetailDrawer';
import { useFavorites } from './hooks/useFavorites';
import { useAuth } from './hooks/useAuth';
import { useBookings } from './hooks/useBookings';
import { useProducerPortal } from './hooks/useProducerPortal';
import { GoogleAdSlot } from './components/Monetization/GoogleAdSlot';
import { ChauffeurBooking } from './types/monetization';
import type { VerifiedPassInfo } from './components/Monetization/HostVerificationModal';
import { verifyExplorerPass } from './services/explorerPass';
import { List, MapPin } from 'lucide-react';

// Performance optimization: lazy-load modals on demand to shrink initial bundle
const DayTripModal = lazy(() => import('./components/Loops/DayTripModal').then(m => ({ default: m.DayTripModal })));
const AuthModal = lazy(() => import('./components/Auth/AuthModal').then(m => ({ default: m.AuthModal })));
const PassportModal = lazy(() => import('./components/Auth/PassportModal').then(m => ({ default: m.PassportModal })));
const BookingModal = lazy(() => import('./components/Bookings/BookingModal').then(m => ({ default: m.BookingModal })));
const ProducerPortalModal = lazy(() => import('./components/Portal/ProducerPortalModal').then(m => ({ default: m.ProducerPortalModal })));
const MyBookingsModal = lazy(() => import('./components/Bookings/MyBookingsModal').then(m => ({ default: m.MyBookingsModal })));
const ExplorerPassModal = lazy(() => import('./components/Monetization/ExplorerPassModal').then(m => ({ default: m.ExplorerPassModal })));
const DigitalPassModal = lazy(() => import('./components/Monetization/DigitalPassModal').then(m => ({ default: m.DigitalPassModal })));
const HostVerificationModal = lazy(() => import('./components/Monetization/HostVerificationModal').then(m => ({ default: m.HostVerificationModal })));
const ChauffeurBookingModal = lazy(() => import('./components/Monetization/ChauffeurBookingModal').then(m => ({ default: m.ChauffeurBookingModal })));
const AboutFaqModal = lazy(() => import('./components/About/AboutFaqModal').then(m => ({ default: m.AboutFaqModal })));
const LegalModal = lazy(() => import('./components/Legal/LegalModal').then(m => ({ default: m.LegalModal })));

export type ActiveModal =
  | { type: 'loops' }
  | { type: 'auth'; initialRole?: 'traveler' | 'producer' }
  | { type: 'passport' }
  | { type: 'booking'; producer?: Producer | null; experienceId?: string }
  | { type: 'portal' }
  | { type: 'my_bookings' }
  | { type: 'pass' }
  | { type: 'digital_pass' }
  | { type: 'host_verify'; guestInfo: VerifiedPassInfo }
  | { type: 'chauffeur'; circuit?: DayTripLoop | null; producer?: Producer | null }
  | { type: 'about_faq'; initialTab?: 'about' | 'faq' }
  | { type: 'legal'; initialTab?: 'privacy' | 'terms' | 'producers' | 'licenses' }
  | null;

export const App: React.FC = () => {
  const [selectedProducer, setSelectedProducer] = useState<Producer | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  const closeModal = () => setActiveModal(null);

  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const {
    user,
    isAuthenticated,
    isFirebaseConfigured,
    isLoading: isAuthLoading,
    authError,
    loginWithGoogle,
    loginWithApple,
    loginWithEmail,
    signupWithEmail,
    sendPasswordResetLink,
    loginAsDemo,
    loginAsDemoProducer,
    loginAsProducer,
    claimAndRegisterProducer,
    updateProducerTaxDetails,
    logout,
    toggleVisited,
    isVisited,
    saveTastingNote,
    getTastingNote,
    refreshExplorerPass,
  } = useAuth();

  // Listen for Stripe Checkout redirects (?vip=success or ?producer=upgraded) or QR Pass Verifications (?verify_pass=...)
  const [stripeNotification, setStripeNotification] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('checkout_session_id');
    const verifyPassId = params.get('verify_pass');
    let cancelled = false;
    if (verifyPassId) {
      setStripeNotification('Checking Explorer pass…');
      void verifyExplorerPass(verifyPassId).then(info => {
        if (cancelled) return;
        setStripeNotification(null);
        setActiveModal({ type: 'host_verify', guestInfo: info });
      }).catch(error => { if (!cancelled) setStripeNotification(error.message); });
    } else if (sessionId && user?.id) {
      setStripeNotification('Confirming your payment…');
      void refreshExplorerPass(sessionId).then(pass => {
        if (cancelled) return;
        setStripeNotification(pass ? 'Your payment is verified and your Explorer pass is active.' : 'No active pass was found.');
        if (pass) window.history.replaceState({}, document.title, window.location.pathname);
      }).catch(error => { if (!cancelled) setStripeNotification(error.message); });
    } else if (sessionId) {
      setStripeNotification('Sign in to the account used at checkout to retrieve your pass.');
    } else if (params.has('vip') || params.get('producer') === 'upgraded') {
      setStripeNotification('A return link does not confirm payment. Sign in to check your purchase status.');
    }
    return () => { cancelled = true; };
  }, [refreshExplorerPass, user?.id]);

  const handleConfirmChauffeurBooking = (booking: ChauffeurBooking) => {
    try {
      const existing = JSON.parse(localStorage.getItem('terroir_chauffeur_bookings') || '[]');
      localStorage.setItem('terroir_chauffeur_bookings', JSON.stringify([booking, ...existing]));
    } catch (e) {
      console.error('Error saving chauffeur booking:', e);
    }
  };

  const {
    travelerBookings,
    userBookings,
    hostBookings,
    bookTasting,
    cancelBooking,
    setHostStatus,
  } = useBookings({
    userId: user?.id,
    trustedProducerId: user?.isProducer ? user.claimedProducerId : undefined,
  });

  const {
    getOverride,
    updateOverride,
  } = useProducerPortal();

  const initialFilters: FilterState = {
    category: 'all',
    destination: 'all',
    roadAccess: 'all',
    ethos: 'all',
    foodOption: 'all',
    searchQuery: '',
    dogFriendlyOnly: false,
    walkInOnly: false,
    campervanOnly: false,
    favoritesOnly: false,
  };

  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const { producers } = useProducers({
    destination: filters.destination,
    category: filters.category,
    searchQuery: filters.searchQuery,
  });

  // Filter Handler
  const handleFilterChange = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  // Filter & Search Logic
  const filteredProducers = useMemo(() => {
    return producers.filter((producer) => {
      // Category filter
      if (filters.category !== 'all' && producer.category !== filters.category) {
        return false;
      }

      // Destination filter (Macro-Region: Crete, Santorini, Peloponnese, etc.)
      if (filters.destination !== 'all' && producer.destination !== filters.destination) {
        return false;
      }

      // Road Access filter
      if (filters.roadAccess !== 'all' && producer.roadAccess !== filters.roadAccess) {
        return false;
      }

      // Ethos filter
      if (filters.ethos !== 'all' && !producer.ethos.includes(filters.ethos)) {
        return false;
      }

      // Food Option filter
      if (filters.foodOption !== 'all' && producer.foodOption !== filters.foodOption) {
        return false;
      }

      // Dog friendly
      if (filters.dogFriendlyOnly && !producer.dogFriendly) {
        return false;
      }

      // Walk-in friendly
      if (filters.walkInOnly && !producer.walkInFriendly) {
        return false;
      }

      // Campervan friendly
      if (filters.campervanOnly && !producer.campervanFriendly) {
        return false;
      }

      // Favorites only
      if (filters.favoritesOnly && !isFavorite(producer.id)) {
        return false;
      }

      // Search Query filter (matches name, greek name, region, village, varieties)
      if (filters.searchQuery.trim() !== '') {
        const q = filters.searchQuery.toLowerCase().trim();
        const matchesName = producer.name.toLowerCase().includes(q);
        const matchesGreekName = producer.greekName.toLowerCase().includes(q);
        const matchesRegion = producer.region.toLowerCase().includes(q);
        const matchesVillage = producer.village.toLowerCase().includes(q);
        const matchesVarieties = producer.indigenousVarieties.some((v) =>
          v.toLowerCase().includes(q)
        );
        const matchesTagline = producer.tagLine.toLowerCase().includes(q);

        return (
          matchesName ||
          matchesGreekName ||
          matchesRegion ||
          matchesVillage ||
          matchesVarieties ||
          matchesTagline
        );
      }

      return true;
    });
  }, [producers, filters, isFavorite]);

  // Deep Link handler: ?producer=<id>
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const target = params.get('producer');
    if (target && producers.length > 0) {
      const match = producers.find(
        (p) =>
          p.id.toLowerCase() === target.toLowerCase() ||
          p.id.toLowerCase().includes(target.toLowerCase())
      );
      if (match) {
        setSelectedProducer(match);
        setIsDrawerOpen(true);
      }
    }
  }, [producers]);

  // Load a curated loop
  const handleSelectLoop = (loop: DayTripLoop) => {
    setFilters((prev) => ({
      ...prev,
      destination: loop.destination,
      category: 'all',
      roadAccess: 'all',
      searchQuery: '',
    }));

    const firstProducer = producers.find((p) => p.id === loop.stops[0]?.producerId);
    if (firstProducer) {
      setSelectedProducer(firstProducer);
      setIsDrawerOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full overflow-hidden bg-stone-950 font-sans text-stone-100">
      {/* 1. Header Bar */}
      <Header
        selectedDestination={filters.destination}
        onSelectDestination={(dest: Destination | 'all') => handleFilterChange('destination', dest)}
        searchQuery={filters.searchQuery}
        onSearchChange={(query: string) => handleFilterChange('searchQuery', query)}
        onOpenLoops={() => setActiveModal({ type: 'loops' })}
        totalFilteredCount={filteredProducers.length}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode((prev) => (prev === 'map' ? 'list' : 'map'))}
        savedCount={favorites.length}
        favoritesOnly={filters.favoritesOnly}
        onToggleFavoritesOnly={() => handleFilterChange('favoritesOnly', !filters.favoritesOnly)}
        user={user}
        onOpenAuth={(role) => setActiveModal({ type: 'auth', initialRole: role || 'traveler' })}
        onOpenPassport={() => setActiveModal({ type: 'passport' })}
        onLogout={logout}
        totalProducersCount={producers.length}
        onOpenMyBookings={() => setActiveModal({ type: 'my_bookings' })}
        onOpenProducerPortal={() => setActiveModal({ type: 'portal' })}
        bookingsCount={userBookings.length}
        onOpenExplorerPass={() => setActiveModal({ type: 'pass' })}
        onOpenDigitalPass={() => setActiveModal({ type: 'digital_pass' })}
        onOpenAbout={() => setActiveModal({ type: 'about_faq', initialTab: 'about' })}
        onOpenFaq={() => setActiveModal({ type: 'about_faq', initialTab: 'faq' })}
        onOpenLegal={(tab) => setActiveModal({ type: 'legal', initialTab: tab || 'privacy' })}
      />

      {/* Stripe Checkout VIP/Producer Success Banner */}
      {stripeNotification && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-stone-950 px-4 py-2 text-xs font-bold flex items-center justify-between shadow-lg animate-in slide-in-from-top duration-300 z-50">
          <div className="flex items-center gap-2 mx-auto">
            <span>{stripeNotification}</span>
          </div>
          <button
            type="button"
            onClick={() => setStripeNotification(null)}
            className="text-stone-950 hover:text-stone-800 text-sm font-bold ml-2 cursor-pointer"
            aria-label="Dismiss banner"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Interactive Filter Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        totalFiltered={filteredProducers.length}
        totalCount={producers.length}
        onOpenLoops={() => setActiveModal({ type: 'loops' })}
      />

      {/* 3. Main Workspace: Sidebar List + Leaflet Map Canvas */}
      <main className="relative flex-1 flex overflow-hidden min-h-0">
        {/* Desktop Sidebar / Mobile List View */}
        <div
          className={`${
            viewMode === 'list' ? 'flex' : 'hidden'
          } lg:flex h-full shrink-0 z-10 w-full lg:w-auto`}
        >
          <ProducerList
            producers={filteredProducers}
            selectedProducer={selectedProducer}
            onSelectProducer={(p) => {
              setSelectedProducer(p);
              setIsDrawerOpen(true);
            }}
            onResetFilters={handleResetFilters}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
          />
        </div>

        {/* The Interactive Map */}
        <div
          className={`flex-1 h-full w-full relative ${
            viewMode === 'map' ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* Sponsor / Travel Partner Ad Banner (Top Middle) */}
          <div className="absolute top-2.5 left-0 right-0 z-20 pointer-events-none flex justify-center px-3">
            <div className="pointer-events-auto w-full max-w-2xl">
              <GoogleAdSlot
                hasExplorerPass={!!user?.hasExplorerPass}
                onOpenExplorerPass={() => setActiveModal({ type: 'pass' })}
              />
            </div>
          </div>

          <MapCanvas
            producers={filteredProducers}
            selectedProducer={selectedProducer}
            onSelectProducer={(producer) => {
              setSelectedProducer(producer);
            }}
            onOpenDrawer={(producer) => {
              setSelectedProducer(producer);
              setIsDrawerOpen(true);
            }}
            selectedDestination={filters.destination}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
            viewMode={viewMode}
          />
        </div>

        {/* Floating Map/List View Switcher on < lg screens */}
        {(!selectedProducer || viewMode === 'list') && (
          <div 
            className="lg:hidden absolute left-1/2 -translate-x-1/2 z-30 pointer-events-auto transition-all animate-in fade-in duration-200"
            style={{ bottom: 'max(1.25rem, calc(1.25rem + env(safe-area-inset-bottom, 0px)))' }}
          >
            <button
              onClick={() => setViewMode((prev) => (prev === 'map' ? 'list' : 'map'))}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900/95 text-stone-100 border border-white/20 shadow-2xl backdrop-blur-xl font-bold text-xs hover:bg-stone-800 hover:text-white active:scale-95 transition-all cursor-pointer select-none"
            >
              {viewMode === 'map' ? (
                <>
                  <List className="w-4 h-4 text-amber-400" />
                  <span>Show List ({filteredProducers.length})</span>
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>Show Map</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* 4. Slide-Out Detailed Producer Drawer */}
        {isDrawerOpen && (
          <ProducerDetailDrawer
            producer={selectedProducer}
            onClose={() => setIsDrawerOpen(false)}
            user={user}
            onOpenProducerPortal={() => setActiveModal({ type: 'portal' })}
            isFavorite={selectedProducer ? isFavorite(selectedProducer.id) : false}
            onToggleFavorite={toggleFavorite}
            isVisited={selectedProducer ? isVisited(selectedProducer.id) : false}
            onToggleVisited={toggleVisited}
            tastingNote={selectedProducer ? getTastingNote(selectedProducer.id) : ''}
            onSaveTastingNote={saveTastingNote}
            isAuthenticated={isAuthenticated}
            onOpenAuth={(role) => setActiveModal({ type: 'auth', initialRole: role || 'traveler' })}
            onOpenBooking={(producer, experienceId) => {
              setActiveModal({ type: 'booking', producer, experienceId });
            }}
            customNotice={selectedProducer ? getOverride(selectedProducer.id)?.customNotice : undefined}
            isProTier={selectedProducer ? (getOverride(selectedProducer.id)?.isProTier ?? false) : false}
            directBottleShopUrl={selectedProducer ? getOverride(selectedProducer.id)?.directBottleShopUrl : undefined}
            hasExplorerPass={!!user?.hasExplorerPass}
            onOpenExplorerPass={() => setActiveModal({ type: 'pass' })}
            onOpenDigitalPass={() => setActiveModal({ type: 'digital_pass' })}
          />
        )}
      </main>

      {/* Lazy-Loaded Modals Suspense Boundary */}
      <Suspense fallback={null}>
        {/* Curated Terroir Routes Modal */}
        {activeModal?.type === 'loops' && (
          <DayTripModal
            isOpen
            onClose={closeModal}
            onSelectLoop={handleSelectLoop}
            onSelectProducer={(producer) => {
              setSelectedProducer(producer);
              setIsDrawerOpen(true);
              closeModal();
            }}
            onBookChauffeur={(loop) => setActiveModal({ type: 'chauffeur', circuit: loop })}
            user={user}
            onOpenExplorerPass={() => setActiveModal({ type: 'pass' })}
            producers={producers}
          />
        )}

        {/* Explorer Auth & Profile Modal */}
        {activeModal?.type === 'auth' && (
          <AuthModal
            isOpen
            onClose={closeModal}
            initialRole={activeModal.initialRole || 'traveler'}
            producers={producers}
            onLoginAsDemo={loginAsDemo}
            onLoginAsDemoProducer={loginAsDemoProducer}
            onLogin={loginWithEmail}
            onSignup={(name, email, password, travelerType) => signupWithEmail(name, email, password, travelerType)}
            onLoginAsProducer={loginAsProducer}
            onClaimProducer={claimAndRegisterProducer}
            onResetPassword={sendPasswordResetLink}
            onLoginWithGoogle={loginWithGoogle}
            onLoginWithApple={loginWithApple}
            onOpenPrivacyNotice={() => setActiveModal({ type: 'legal', initialTab: 'privacy' })}
            onOpenTerms={() => setActiveModal({ type: 'legal', initialTab: 'terms' })}
            onOpenLicenses={() => setActiveModal({ type: 'legal', initialTab: 'licenses' })}
            isLoading={isAuthLoading}
            authError={authError}
            isFirebaseConfigured={isFirebaseConfigured}
          />
        )}

        {/* Terroir Passport Stamps Modal */}
        {activeModal?.type === 'passport' && (
          <PassportModal
            isOpen
            onClose={closeModal}
            user={user}
            producers={producers}
            onToggleVisited={toggleVisited}
            onSaveTastingNote={saveTastingNote}
            onSelectProducer={(producer) => {
              setSelectedProducer(producer);
              setIsDrawerOpen(true);
              closeModal();
            }}
            onOpenExplorerPass={() => setActiveModal({ type: 'pass' })}
            onOpenDigitalPass={() => setActiveModal({ type: 'digital_pass' })}
          />
        )}

        {/* Tasting Reservation Modal */}
        {activeModal?.type === 'booking' && (
          <BookingModal
            isOpen
            onClose={closeModal}
            producer={activeModal.producer || selectedProducer}
            user={user}
            initialExperienceId={activeModal.experienceId}
            onBookTasting={bookTasting}
            onOpenAuth={() => setActiveModal({ type: 'auth', initialRole: 'traveler' })}
          />
        )}

        {/* Host & Winery/Brewery Management Portal */}
        {activeModal?.type === 'portal' && (
          <ProducerPortalModal
            isOpen
            onClose={closeModal}
            user={user}
            onOpenAuth={(role) => setActiveModal({ type: 'auth', initialRole: role || 'producer' })}
            onLoginAsDemoProducer={loginAsDemoProducer}
            onLoginWithGoogle={loginWithGoogle}
            onLoginWithApple={loginWithApple}
            producers={producers}
            bookings={hostBookings}
            onUpdateBookingStatus={setHostStatus}
            onSaveProducerOverride={updateOverride}
            getProducerOverride={getOverride}
            onUpdateProducerTaxDetails={updateProducerTaxDetails}
            onSelectProducerForDrawer={(producer) => {
              setSelectedProducer(producer);
              setIsDrawerOpen(true);
              closeModal();
            }}
            onPassVerified={(info) => setActiveModal({ type: 'host_verify', guestInfo: info })}
          />
        )}

        {/* Explorer My Bookings & Visits Modal */}
        {activeModal?.type === 'my_bookings' && (
          <MyBookingsModal
            isOpen
            onClose={closeModal}
            bookings={travelerBookings}
            producers={producers}
            onCancelBooking={cancelBooking}
            onSelectProducer={(producer) => {
              setSelectedProducer(producer);
              setIsDrawerOpen(true);
              closeModal();
            }}
          />
        )}

        {/* VIP Terroir Holiday Pass Modal */}
        {activeModal?.type === 'pass' && (
          <ExplorerPassModal
            isOpen
            onClose={closeModal}
            user={user}
            onOpenAuth={() => setActiveModal({ type: 'auth', initialRole: 'traveler' })}
            onOpenDigitalPass={() => setActiveModal({ type: 'digital_pass' })}
          />
        )}

        {/* Digital VIP Explorer Pass & Offline QR Modal */}
        {activeModal?.type === 'digital_pass' && (
          <DigitalPassModal
            isOpen
            onClose={closeModal}
            user={user}
            onOpenExplorerPass={() => setActiveModal({ type: 'pass' })}
          />
        )}

        {/* Host Cellar Door Pass Verification Modal */}
        {activeModal?.type === 'host_verify' && (
          <HostVerificationModal
            isOpen
            onClose={closeModal}
            guestInfo={activeModal.guestInfo}
          />
        )}

        {/* Optional Private Chauffeur & Mercedes Van Booking Modal */}
        {activeModal?.type === 'chauffeur' && (
          <ChauffeurBookingModal
            isOpen
            onClose={closeModal}
            initialCircuit={activeModal.circuit}
            initialProducer={activeModal.producer}
            user={user}
            onOpenAuth={() => setActiveModal({ type: 'auth', initialRole: 'traveler' })}
            onBookChauffeur={handleConfirmChauffeurBooking}
          />
        )}

        {/* About Us & Frequently Asked Questions Modal */}
        {activeModal?.type === 'about_faq' && (
          <AboutFaqModal
            isOpen
            onClose={closeModal}
            initialTab={activeModal.initialTab || 'about'}
            onOpenLoops={() => setActiveModal({ type: 'loops' })}
            onOpenAuth={(role) => setActiveModal({ type: 'auth', initialRole: role || 'traveler' })}
            onOpenExplorerPass={() => setActiveModal({ type: 'pass' })}
            onOpenProducerPortal={() => setActiveModal({ type: 'portal' })}
            onOpenLegal={(tab) => setActiveModal({ type: 'legal', initialTab: tab })}
          />
        )}

        {/* Legal Notice, GDPR Privacy Policy & Open Source Licenses Modal */}
        {activeModal?.type === 'legal' && (
          <LegalModal
            isOpen
            onClose={closeModal}
            initialTab={activeModal.initialTab || 'privacy'}
          />
        )}
      </Suspense>
    </div>
  );
};
