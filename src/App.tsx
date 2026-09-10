import React, { useState, useMemo } from 'react';
import { useProducers } from './hooks/useProducers';
import { Producer, FilterState, Destination, DayTripLoop } from './types/terroir';
import { Header } from './components/Header/Header';
import { FilterBar } from './components/FilterBar/FilterBar';
import { MapCanvas } from './components/Map/MapCanvas';
import { ProducerList } from './components/Sidebar/ProducerList';
import { ProducerDetailDrawer } from './components/Drawer/ProducerDetailDrawer';
import { DayTripModal } from './components/Loops/DayTripModal';
import { useFavorites } from './hooks/useFavorites';
import { useAuth } from './hooks/useAuth';
import { useBookings } from './hooks/useBookings';
import { useProducerPortal } from './hooks/useProducerPortal';
import { AuthModal } from './components/Auth/AuthModal';
import { PassportModal } from './components/Auth/PassportModal';
import { BookingModal } from './components/Bookings/BookingModal';
import { ProducerPortalModal } from './components/Portal/ProducerPortalModal';
import { MyBookingsModal } from './components/Bookings/MyBookingsModal';
import { ExplorerPassModal } from './components/Monetization/ExplorerPassModal';
import { ChauffeurBookingModal } from './components/Monetization/ChauffeurBookingModal';
import { WineBoxModal } from './components/Monetization/WineBoxModal';
import { ExperienceExplorerModal } from './components/Experiences/ExperienceExplorerModal';
import { AboutFaqModal } from './components/About/AboutFaqModal';
import { LegalModal } from './components/Legal/LegalModal';
import { CRETAN_DAY_TRIP_LOOPS } from './data/loops';
import { ChauffeurBooking, WineBoxOrder } from './types/monetization';
import { List, MapPin } from 'lucide-react';

export const App: React.FC = () => {
  const [selectedProducer, setSelectedProducer] = useState<Producer | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isLoopsModalOpen, setIsLoopsModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isPassportModalOpen, setIsPassportModalOpen] = useState<boolean>(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [isPortalModalOpen, setIsPortalModalOpen] = useState<boolean>(false);
  const [isMyBookingsModalOpen, setIsMyBookingsModalOpen] = useState<boolean>(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState<boolean>(false);
  const [isChauffeurModalOpen, setIsChauffeurModalOpen] = useState<boolean>(false);
  const [isWineBoxModalOpen, setIsWineBoxModalOpen] = useState<boolean>(false);
  const [wineBoxCategory, setWineBoxCategory] = useState<'all' | 'wine' | 'beer' | 'olive_oil' | 'honey' | 'cheese'>('all');
  const [isExperiencesModalOpen, setIsExperiencesModalOpen] = useState<boolean>(false);
  const [isAboutFaqModalOpen, setIsAboutFaqModalOpen] = useState<boolean>(false);
  const [aboutFaqInitialTab, setAboutFaqInitialTab] = useState<'about' | 'faq'>('about');
  const [isLegalModalOpen, setIsLegalModalOpen] = useState<boolean>(false);
  const [legalInitialTab, setLegalInitialTab] = useState<'privacy' | 'terms' | 'producers' | 'licenses'>('privacy');

  const handleOpenLegal = (tab: 'privacy' | 'terms' | 'producers' | 'licenses' = 'privacy') => {
    setLegalInitialTab(tab);
    setIsLegalModalOpen(true);
  };
  const [bookingTargetExperienceId, setBookingTargetExperienceId] = useState<string | undefined>(undefined);
  const [chauffeurTargetCircuit, setChauffeurTargetCircuit] = useState<DayTripLoop | null>(null);
  const [bookingTargetProducer, setBookingTargetProducer] = useState<Producer | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [authInitialRole, setAuthInitialRole] = useState<'traveler' | 'producer'>('traveler');

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
    activateExplorerPass,
  } = useAuth();

  const handleConfirmChauffeurBooking = (booking: ChauffeurBooking) => {
    try {
      const existing = JSON.parse(localStorage.getItem('terroir_chauffeur_bookings') || '[]');
      localStorage.setItem('terroir_chauffeur_bookings', JSON.stringify([booking, ...existing]));
    } catch (e) {
      console.error('Error saving chauffeur booking:', e);
    }
  };

  const handleConfirmWineOrder = (order: WineBoxOrder) => {
    try {
      const existing = JSON.parse(localStorage.getItem('terroir_wine_orders') || '[]');
      localStorage.setItem('terroir_wine_orders', JSON.stringify([order, ...existing]));
    } catch (e) {
      console.error('Error saving wine order:', e);
    }
  };

  const {
    bookings,
    userBookings,
    bookTasting,
    setStatus,
  } = useBookings(user?.id);

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

  const { producers, isLive } = useProducers({
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

      // Toggles
      if (filters.dogFriendlyOnly && !producer.dogFriendly) return false;
      if (filters.walkInOnly && !producer.walkInFriendly) return false;
      if (filters.campervanOnly && !producer.campervanFriendly) return false;
      if (filters.favoritesOnly && !isFavorite(producer.id)) return false;

      // Search Query
      if (filters.searchQuery.trim() !== '') {
        const q = filters.searchQuery.toLowerCase().trim();
        const matchesName = producer.name.toLowerCase().includes(q);
        const matchesGreekName = producer.greekName.toLowerCase().includes(q);
        const matchesVillage = producer.village.toLowerCase().includes(q);
        const matchesRegion = producer.region.toLowerCase().includes(q);
        const matchesCountry = (producer.country || '').toLowerCase().includes(q);
        const matchesDescription = producer.description.toLowerCase().includes(q);
        const matchesVariety = producer.indigenousVarieties.some((v) =>
          v.toLowerCase().includes(q)
        );

        if (!matchesName && !matchesGreekName && !matchesVillage && !matchesRegion && !matchesCountry && !matchesDescription && !matchesVariety) {
          return false;
        }
      }

      return true;
    });
  }, [producers, filters, isFavorite]);

  // Load a curated loop
  const handleSelectLoop = (loop: DayTripLoop) => {
    // Filter to this destination
    setFilters((prev) => ({
      ...prev,
      destination: loop.destination,
      category: 'all',
      roadAccess: 'all',
      searchQuery: '',
    }));

    // Find and select the first producer in the loop
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
        onOpenLoops={() => setIsLoopsModalOpen(true)}
        onOpenExperiences={() => setIsExperiencesModalOpen(true)}
        totalFilteredCount={filteredProducers.length}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode((prev) => (prev === 'map' ? 'list' : 'map'))}
        savedCount={favorites.length}
        favoritesOnly={filters.favoritesOnly}
        onToggleFavoritesOnly={() => handleFilterChange('favoritesOnly', !filters.favoritesOnly)}
        user={user}
        onOpenAuth={(role) => {
          setAuthInitialRole(role || 'traveler');
          setIsAuthModalOpen(true);
        }}
        onOpenPassport={() => setIsPassportModalOpen(true)}
        onLogout={logout}
        totalProducersCount={producers.length}
        onOpenMyBookings={() => setIsMyBookingsModalOpen(true)}
        onOpenProducerPortal={() => setIsPortalModalOpen(true)}
        bookingsCount={userBookings.length}
        onOpenExplorerPass={() => setIsPassModalOpen(true)}
        onOpenWineBoxes={() => {
          setWineBoxCategory('all');
          setIsWineBoxModalOpen(true);
        }}
        onOpenAbout={() => {
          setAboutFaqInitialTab('about');
          setIsAboutFaqModalOpen(true);
        }}
        onOpenFaq={() => {
          setAboutFaqInitialTab('faq');
          setIsAboutFaqModalOpen(true);
        }}
        onOpenLegal={handleOpenLegal}
      />

      {/* 2. Interactive Filter Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        totalFiltered={filteredProducers.length}
        totalCount={producers.length}
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
        <div className="lg:hidden absolute bottom-5 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
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

        {/* 4. Slide-Out Detailed Producer Drawer */}
        {isDrawerOpen && (
          <ProducerDetailDrawer
            producer={selectedProducer}
            onClose={() => setIsDrawerOpen(false)}
            user={user}
            onOpenProducerPortal={() => setIsPortalModalOpen(true)}
            isFavorite={selectedProducer ? isFavorite(selectedProducer.id) : false}
            onToggleFavorite={toggleFavorite}
            isVisited={selectedProducer ? isVisited(selectedProducer.id) : false}
            onToggleVisited={toggleVisited}
            tastingNote={selectedProducer ? getTastingNote(selectedProducer.id) : ''}
            onSaveTastingNote={saveTastingNote}
            isAuthenticated={isAuthenticated}
            onOpenAuth={(role) => {
              setAuthInitialRole(role || 'traveler');
              setIsAuthModalOpen(true);
            }}
            onOpenBooking={(producer, experienceId) => {
              setBookingTargetProducer(producer);
              setBookingTargetExperienceId(experienceId);
              setIsBookingModalOpen(true);
            }}
            customNotice={selectedProducer ? getOverride(selectedProducer.id)?.customNotice : undefined}
            isProTier={selectedProducer ? (getOverride(selectedProducer.id)?.isProTier ?? false) : false}
            directBottleShopUrl={selectedProducer ? getOverride(selectedProducer.id)?.directBottleShopUrl : undefined}
            onOpenWineBoxes={(category) => {
              setWineBoxCategory(category || 'all');
              setIsWineBoxModalOpen(true);
            }}
            hasExplorerPass={!!user?.hasExplorerPass}
            onOpenExplorerPass={() => setIsPassModalOpen(true)}
          />
        )}
      </main>

      {/* 5. Day-Trip Loops Modal */}
      <DayTripModal
        isOpen={isLoopsModalOpen}
        onClose={() => setIsLoopsModalOpen(false)}
        onSelectLoop={handleSelectLoop}
        onSelectProducer={(producer) => {
          setSelectedProducer(producer);
          setIsDrawerOpen(true);
        }}
        onBookChauffeur={(loop) => {
          setChauffeurTargetCircuit(loop);
          setIsChauffeurModalOpen(true);
        }}
        user={user}
        onOpenExplorerPass={() => setIsPassModalOpen(true)}
      />

      {/* 6. Explorer Auth & Profile Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialRole={authInitialRole}
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
        onOpenPrivacyNotice={() => handleOpenLegal('privacy')}
        onOpenTerms={() => handleOpenLegal('terms')}
        onOpenLicenses={() => handleOpenLegal('licenses')}
        isLoading={isAuthLoading}
        authError={authError}
        isFirebaseConfigured={isFirebaseConfigured}
      />

      {/* 7. Terroir Passport Stamps Modal */}
      <PassportModal
        isOpen={isPassportModalOpen}
        onClose={() => setIsPassportModalOpen(false)}
        user={user}
        producers={producers}
        onToggleVisited={toggleVisited}
        onSaveTastingNote={saveTastingNote}
        onSelectProducer={(producer) => {
          setSelectedProducer(producer);
          setIsDrawerOpen(true);
        }}
        onOpenExplorerPass={() => setIsPassModalOpen(true)}
      />

      {/* 8. Tasting Reservation Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setBookingTargetExperienceId(undefined);
        }}
        producer={bookingTargetProducer}
        user={user}
        initialExperienceId={bookingTargetExperienceId}
        onBookTasting={bookTasting}
        onOpenAuth={() => {
          setAuthInitialRole('traveler');
          setIsAuthModalOpen(true);
        }}
      />

      {/* 9. Host & Winery/Brewery Management Portal */}
      <ProducerPortalModal
        isOpen={isPortalModalOpen}
        onClose={() => setIsPortalModalOpen(false)}
        user={user}
        onOpenAuth={(role) => {
          setAuthInitialRole(role || 'producer');
          setIsAuthModalOpen(true);
        }}
        onLoginAsDemoProducer={loginAsDemoProducer}
        onLoginWithGoogle={loginWithGoogle}
        onLoginWithApple={loginWithApple}
        producers={producers}
        bookings={bookings}
        onUpdateBookingStatus={setStatus}
        onSaveProducerOverride={updateOverride}
        getProducerOverride={getOverride}
        onUpdateProducerTaxDetails={updateProducerTaxDetails}
        onSelectProducerForDrawer={(producer) => {
          setSelectedProducer(producer);
          setIsDrawerOpen(true);
        }}
      />

      {/* 10. Explorer My Bookings & Visits Modal */}
      <MyBookingsModal
        isOpen={isMyBookingsModalOpen}
        onClose={() => setIsMyBookingsModalOpen(false)}
        bookings={userBookings}
        producers={producers}
        onCancelBooking={(id) => setStatus(id, 'cancelled')}
        onSelectProducer={(producer) => {
          setSelectedProducer(producer);
          setIsDrawerOpen(true);
        }}
      />

      {/* 11. VIP Terroir Holiday Pass Modal (€14.99 B2C Pass) */}
      <ExplorerPassModal
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onActivatePass={(days = 14) => activateExplorerPass(days)}
      />

      {/* 12. Private Chauffeur & Mercedes Van Booking Modal */}
      <ChauffeurBookingModal
        isOpen={isChauffeurModalOpen}
        onClose={() => setIsChauffeurModalOpen(false)}
        initialCircuit={chauffeurTargetCircuit}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onBookChauffeur={handleConfirmChauffeurBooking}
      />

      {/* 13. Taste of the Trail - International Artisan Delivery Modal */}
      <WineBoxModal
        isOpen={isWineBoxModalOpen}
        onClose={() => setIsWineBoxModalOpen(false)}
        initialCategory={wineBoxCategory}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOrderBox={handleConfirmWineOrder}
      />

      {/* 14. 135+ Curated Terroir & Tasting Experiences Explorer Modal */}
      <ExperienceExplorerModal
        isOpen={isExperiencesModalOpen}
        onClose={() => setIsExperiencesModalOpen(false)}
        onBookExperience={(exp) => {
          const producer = producers.find((p) => p.id === exp.producerId) || producers[0];
          setBookingTargetProducer(producer);
          setBookingTargetExperienceId(exp.id);
          setIsExperiencesModalOpen(false);
          setIsBookingModalOpen(true);
        }}
        onSelectProducer={(prod) => {
          setSelectedProducer(prod);
          setIsDrawerOpen(true);
          setIsExperiencesModalOpen(false);
        }}
      />

      {/* 15. About Us & Frequently Asked Questions Modal */}
      <AboutFaqModal
        isOpen={isAboutFaqModalOpen}
        onClose={() => setIsAboutFaqModalOpen(false)}
        initialTab={aboutFaqInitialTab}
        onOpenLoops={() => setIsLoopsModalOpen(true)}
        onOpenExperiences={() => setIsExperiencesModalOpen(true)}
        onOpenAuth={(role) => {
          setAuthInitialRole(role || 'traveler');
          setIsAuthModalOpen(true);
        }}
        onOpenExplorerPass={() => setIsPassModalOpen(true)}
        onOpenProducerPortal={() => setIsPortalModalOpen(true)}
        onOpenLegal={handleOpenLegal}
      />

      {/* 16. Legal Notice, GDPR Privacy Policy & Open Source Licenses Modal */}
      <LegalModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        initialTab={legalInitialTab}
      />
    </div>
  );
};
