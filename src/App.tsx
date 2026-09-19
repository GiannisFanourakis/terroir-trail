import React, { useState, useMemo, useEffect, Suspense, lazy } from 'react';
import { useProducers } from './hooks/useProducers';
import { Producer, FilterState, Destination } from './types/terroir';
import type { UserProfile } from './types/auth';
import type { ProducerOverride } from './types/booking';
import { Header } from './components/Header/Header';
import { FirstRunWelcome } from './components/Onboarding/FirstRunWelcome';
import { OfflineStatus } from './components/System/OfflineStatus';
import { FilterBar } from './components/FilterBar/FilterBar';
import { MapCanvas } from './components/Map/MapCanvas';
import { TERROIR_REGIONS } from './data/terroirRegionCatalogue';
import { withTerroirRegionStory } from './data/terroirRegionStories';
import { useFavorites } from './hooks/useFavorites';
import { useAuth } from './hooks/useAuth';
import { useAccountCapabilities } from './hooks/useAccountCapabilities';
import { useBookings } from './hooks/useBookings';
import { useProducerPortal } from './hooks/useProducerPortal';
import { SponsorBanner } from './components/Monetization/SponsorBanner';
import { ChauffeurBooking } from './types/monetization';
import type { VerifiedPassInfo } from './components/Monetization/HostVerificationModal';
import { readStorage, writeStorage, STORAGE_KEYS } from './services/browserStorage';
import { saveUserProfileToCloud } from './services/firebase';
import { filterProducers } from './utils/filterProducers';
import { producerService } from './services/producerService';
import { CountryScope, setActiveCountryScope } from './config/geography';
import { usePwaInstall } from './hooks/usePwaInstall';

// Performance optimization: lazy-load modals on demand to shrink initial bundle
const ProducerDetailDrawer = lazy(() =>
  import('./components/Drawer/ProducerDetailDrawerWithReviews').then(m => ({
    default: m.ProducerDetailDrawerWithReviews,
  }))
);
const TerroirRegionDrawer = lazy(() =>
  import('./components/Regions/TerroirRegionDrawer').then(m => ({
    default: m.TerroirRegionDrawer,
  }))
);
const AuthModal = lazy(() => import('./components/Auth/AuthModal').then(m => ({ default: m.AuthModal })));
const PassportModal = lazy(() => import('./components/Auth/PassportModal').then(m => ({ default: m.PassportModal })));
const AccountSettingsModal = lazy(() => import('./components/Auth/AccountSettingsModal').then(m => ({ default: m.AccountSettingsModal })));
const BookingModal = lazy(() => import('./components/Bookings/BookingModal').then(m => ({ default: m.BookingModal })));
const ProducerPortalModal = lazy(() => import('./components/Portal/ProducerPortalModal').then(m => ({ default: m.ProducerPortalModal })));
const AdminPanelModal = lazy(() => import('./components/Admin/AdminPanelModal').then(m => ({ default: m.AdminPanelModal })));
const MyBookingsModal = lazy(() => import('./components/Bookings/MyBookingsModal').then(m => ({ default: m.MyBookingsModal })));
const ExplorerPassModal = lazy(() => import('./components/Monetization/ExplorerPassModal').then(m => ({ default: m.ExplorerPassModal })));
const DigitalPassModal = lazy(() => import('./components/Monetization/DigitalPassModal').then(m => ({ default: m.DigitalPassModal })));
const HostVerificationModal = lazy(() => import('./components/Monetization/HostVerificationModal').then(m => ({ default: m.HostVerificationModal })));
const ChauffeurBookingModal = lazy(() => import('./components/Monetization/ChauffeurBookingModal').then(m => ({ default: m.ChauffeurBookingModal })));
const AboutFaqModal = lazy(() => import('./components/About/AboutFaqModal').then(m => ({ default: m.AboutFaqModal })));
const LegalModal = lazy(() => import('./components/Legal/LegalModal').then(m => ({ default: m.LegalModal })));

export type ActiveModal =
  | { type: 'auth'; initialRole?: 'traveler' | 'producer' }
  | { type: 'passport' }
  | { type: 'account_settings' }
  | { type: 'booking'; producer?: Producer | null; experienceId?: string }
  | { type: 'portal' }
  | { type: 'admin' }
  | { type: 'my_bookings' }
  | { type: 'pass' }
  | { type: 'digital_pass' }
  | { type: 'host_verify'; guestInfo: VerifiedPassInfo }
  | { type: 'chauffeur'; producer?: Producer | null }
  | { type: 'about_faq'; initialTab?: 'about' | 'faq' }
  | { type: 'legal'; initialTab?: 'privacy' | 'terms' | 'producers' | 'licenses' }
  | null;

const applyApprovedListingOverride = (
  producer: Producer,
  override?: ProducerOverride
): Producer => {
  if (!override) return producer;
  return {
    ...producer,
    ...(override.tagLine !== undefined ? { tagLine: override.tagLine } : {}),
    ...(override.description !== undefined ? { description: override.description } : {}),
    ...(override.story !== undefined ? { story: override.story } : {}),
    ...(override.tastingHighlights !== undefined ? { tastingHighlights: override.tastingHighlights } : {}),
    ...(override.website !== undefined ? { website: override.website || undefined } : {}),
    ...(override.foodOption !== undefined ? { foodOption: override.foodOption || undefined } : {}),
    ...(override.dogFriendly !== undefined ? { dogFriendly: override.dogFriendly } : {}),
    ...(override.kidFriendly !== undefined ? { kidFriendly: override.kidFriendly } : {}),
    ...(override.walkIn !== undefined ? { walkInFriendly: override.walkIn } : {}),
    ...(override.campervanFriendly !== undefined ? { campervanFriendly: override.campervanFriendly } : {}),
  };
};

export const App: React.FC = () => {
  const [selectedProducer, setSelectedProducer] = useState<Producer | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isRegionGuideOpen, setIsRegionGuideOpen] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [adminPortalPreviewProducerId, setAdminPortalPreviewProducerId] = useState<string | null>(null);
  const [showFirstRunWelcome, setShowFirstRunWelcome] = useState<boolean>(() =>
    !readStorage<boolean>(STORAGE_KEYS.FIRST_RUN_WELCOME, false, {
      scope: 'Onboarding',
      validator: (value) => typeof value === 'boolean',
    })
  );
  const pwaInstall = usePwaInstall();

  const closeModal = () => {
    setActiveModal(null);
    setAdminPortalPreviewProducerId(null);
  };

  const completeFirstRunWelcome = () => {
    writeStorage(STORAGE_KEYS.FIRST_RUN_WELCOME, true, {
      scope: 'Onboarding',
    });
    setShowFirstRunWelcome(false);
  };

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
    loginAsProducer,
    claimAndRegisterProducer,
    updateProducerTaxDetails,
    logout,
    toggleVisited,
    isVisited,
    saveTastingNote,
    getTastingNote,
  } = useAuth();

  // The existing entitlement is shared by both Explorer/Holiday and Annual plans.
  // explorerPassPlan identifies the plan; hasExplorerPass remains the active/expiry-aware gate.
  const hasAdFreeTravelerPass = Boolean(user?.hasExplorerPass);

  const { capabilities: accountCapabilities } = useAccountCapabilities(user?.id);
  const { favorites, toggleFavorite, isFavorite } = useFavorites(user?.id);

  const handleConfirmChauffeurBooking = (booking: ChauffeurBooking) => {
    const existing = readStorage<ChauffeurBooking[]>(STORAGE_KEYS.CHAUFFEUR_BOOKINGS, [], {
      scope: 'App',
      validator: (data) => Array.isArray(data),
    });
    writeStorage(STORAGE_KEYS.CHAUFFEUR_BOOKINGS, [booking, ...existing], { scope: 'App' });
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
    trustedProducerIds: accountCapabilities?.producerIds || [],
  });

  const {
    overrides,
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

  const {
    producers,
    loading: catalogueLoading,
    error: catalogueError,
    isLive: catalogueIsLive,
  } = useProducers({
    destination: filters.destination,
    category: filters.category,
    searchQuery: filters.searchQuery,
  });

  const publicProducers = useMemo(
    () => producers.map(producer => applyApprovedListingOverride(producer, overrides[producer.id])),
    [producers, overrides]
  );

  const publicSelectedProducer = useMemo(
    () => selectedProducer
      ? applyApprovedListingOverride(selectedProducer, overrides[selectedProducer.id])
      : null,
    [selectedProducer, overrides]
  );

  const selectedTerroirRegion = useMemo(() => {
    if (filters.destination === 'all') return null;
    const region = TERROIR_REGIONS.find((candidate) => candidate.destination === filters.destination);
    return region ? withTerroirRegionStory(region) : null;
  }, [filters.destination]);

  const regionGuideProducers = useMemo(
    () => selectedTerroirRegion
      ? publicProducers.filter((producer) => producer.destination === selectedTerroirRegion.destination)
      : [],
    [publicProducers, selectedTerroirRegion]
  );

  const regionGuideCategoryCount = useMemo(
    () => new Set(regionGuideProducers.map((producer) => producer.category)).size,
    [regionGuideProducers]
  );

  const adminPortalPreviewProducer = useMemo(
    () => adminPortalPreviewProducerId
      ? producers.find((producer) => producer.id === adminPortalPreviewProducerId) || null
      : null,
    [adminPortalPreviewProducerId, producers]
  );

  const producerPortalUser = useMemo<UserProfile | null>(() => {
    if (!adminPortalPreviewProducer || !user) return user;

    return {
      ...user,
      name: 'Preview Host',
      email: 'producer-preview@terroirtrail.local',
      role: 'producer',
      isProducer: true,
      producerIds: [adminPortalPreviewProducer.id],
      claimedProducerId: adminPortalPreviewProducer.id,
      producerName: adminPortalPreviewProducer.name,
      claimStatus: 'verified_host',
    };
  }, [adminPortalPreviewProducer, user]);

  const handleOpenProducerPortal = (producer?: Producer | null) => {
    const previewTarget = producer || selectedProducer || producers[0] || null;
    if (accountCapabilities?.isAdmin && !accountCapabilities.canManageOwnedListings && previewTarget) {
      setAdminPortalPreviewProducerId(previewTarget.id);
    } else {
      setAdminPortalPreviewProducerId(null);
    }
    setActiveModal({ type: 'portal' });
  };

  const handleFilterChange = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    if (key === 'destination') {
      setIsRegionGuideOpen(false);
    }
  };

  const handleResetFilters = () => {
    setActiveCountryScope('all');
    setFilters(initialFilters);
    setIsRegionGuideOpen(false);
  };

  const handleExploreRegion = (destination: Destination) => {
    const hasStory = TERROIR_REGIONS.some((region) => region.destination === destination);
    setFilters((prev) => ({
      ...prev,
      destination,
      searchQuery: '',
      favoritesOnly: false,
    }));
    setSelectedProducer(null);
    setIsDrawerOpen(false);
    setIsRegionGuideOpen(hasStory);
  };

  const handleExploreCountry = (country: Exclude<CountryScope, 'all'>) => {
    setActiveCountryScope(country);
    setFilters((prev) => ({
      ...prev,
      destination: 'all',
      searchQuery: '',
      favoritesOnly: false,
    }));
    setSelectedProducer(null);
    setIsDrawerOpen(false);
    setIsRegionGuideOpen(false);
  };

  const filteredProducers = useMemo(() => {
    return filterProducers(publicProducers, filters, isFavorite);
  }, [publicProducers, filters, isFavorite]);

  useEffect(() => {
    if (filters.destination === 'all' && isRegionGuideOpen) {
      setIsRegionGuideOpen(false);
    }
  }, [filters.destination, isRegionGuideOpen]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const target = params.get('producer');
    if (target && publicProducers.length > 0) {
      const match = publicProducers.find(
        (p) =>
          p.id.toLowerCase() === target.toLowerCase() ||
          p.id.toLowerCase().includes(target.toLowerCase())
      );
      if (match) {
        setSelectedProducer(match);
        setIsRegionGuideOpen(false);
        setIsDrawerOpen(true);
      }
    }
  }, [publicProducers]);

  return (
    <div className="flex flex-col h-[100dvh] w-full overflow-hidden bg-stone-950 font-sans text-stone-100">
      <OfflineStatus />
      <Header
        selectedDestination={filters.destination}
        onSelectDestination={(dest: Destination | 'all') => handleFilterChange('destination', dest)}
        searchQuery={filters.searchQuery}
        onSearchChange={(query: string) => handleFilterChange('searchQuery', query)}
        totalFilteredCount={filteredProducers.length}
        savedCount={favorites.length}
        favoritesOnly={filters.favoritesOnly}
        onToggleFavoritesOnly={() => handleFilterChange('favoritesOnly', !filters.favoritesOnly)}
        user={user}
        onOpenAuth={(role) => setActiveModal({ type: 'auth', initialRole: role || 'traveler' })}
        onOpenPassport={() => setActiveModal({ type: 'passport' })}
        onOpenAccountSettings={user ? () => setActiveModal({ type: 'account_settings' }) : undefined}
        onLogout={logout}
        totalProducersCount={producers.length}
        onOpenProducerPortal={() => handleOpenProducerPortal()}
        isAdmin={Boolean(accountCapabilities?.isAdmin)}
        isPlatformOwner={Boolean(accountCapabilities?.isPlatformOwner)}
        onOpenAdmin={accountCapabilities?.isAdmin ? () => setActiveModal({ type: 'admin' }) : undefined}
        onOpenAbout={() => setActiveModal({ type: 'about_faq', initialTab: 'about' })}
        onOpenFaq={() => setActiveModal({ type: 'about_faq', initialTab: 'faq' })}
        onOpenLegal={(tab) => setActiveModal({ type: 'legal', initialTab: tab || 'privacy' })}
        pwaInstall={pwaInstall}
      />

      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        totalFiltered={filteredProducers.length}
        totalCount={producers.length}
      />

      {(catalogueLoading || catalogueError || !catalogueIsLive) && (
        <div
          role="status"
          aria-live="polite"
          className={`px-3 sm:px-6 py-1.5 text-[11px] border-b shrink-0 ${
            catalogueError
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-200'
              : 'bg-stone-900 border-white/10 text-stone-400'
          }`}
        >
          {catalogueLoading
            ? 'Refreshing producer catalogue…'
            : catalogueError || 'Offline catalogue active — showing the audited bundled regional catalogue.'}
        </div>
      )}

      <main className="relative flex-1 flex overflow-hidden min-h-0">
        <div className="flex-1 h-full w-full relative">
          <div className={`absolute top-2.5 left-0 right-0 z-20 pointer-events-none justify-center px-3 ${selectedProducer ? 'hidden sm:flex' : 'flex'}`}>
            <div className="pointer-events-auto w-full max-w-2xl">
              <SponsorBanner hasExplorerPass={hasAdFreeTravelerPass} />
            </div>
          </div>

          <MapCanvas
            producers={filteredProducers}
            selectedProducer={publicSelectedProducer}
            onSelectProducer={(producer) => {
              setSelectedProducer(producer);
              if (producer) setIsRegionGuideOpen(false);
            }}
            onOpenDrawer={(producer) => {
              setSelectedProducer(producer);
              setIsRegionGuideOpen(false);
              setIsDrawerOpen(true);
            }}
            selectedDestination={filters.destination}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
            onExploreCountry={handleExploreCountry}
            onExploreRegion={handleExploreRegion}
          />

          {selectedTerroirRegion && (
            <Suspense
              fallback={(
                <div
                  role="status"
                  aria-live="polite"
                  className="absolute right-3 top-16 z-20 rounded-xl border border-white/10 bg-stone-900/95 px-3 py-2 text-[11px] font-semibold text-stone-300 shadow-xl"
                >
                  Loading region guide…
                </div>
              )}
            >
              <TerroirRegionDrawer
                region={selectedTerroirRegion}
                producerCount={regionGuideProducers.length}
                categoryCount={regionGuideCategoryCount}
                isOpen={isRegionGuideOpen}
                onClose={() => setIsRegionGuideOpen(false)}
                onShowProducers={() => setIsRegionGuideOpen(false)}
              />
            </Suspense>
          )}
        </div>

        {isDrawerOpen && (
          <Suspense
            fallback={(
              <div
                role="status"
                aria-live="polite"
                className="fixed inset-x-3 bottom-4 z-[65] rounded-2xl border border-white/10 bg-stone-900/95 px-4 py-3 text-center text-xs font-semibold text-stone-200 shadow-2xl sm:left-auto sm:right-5 sm:w-72"
              >
                Loading producer…
              </div>
            )}
          >
            <ProducerDetailDrawer
              producer={publicSelectedProducer}
              onClose={() => setIsDrawerOpen(false)}
              user={user}
              onOpenProducerPortal={() => handleOpenProducerPortal(selectedProducer)}
              isFavorite={selectedProducer ? isFavorite(selectedProducer.id) : false}
              onToggleFavorite={toggleFavorite}
              isVisited={selectedProducer ? isVisited(selectedProducer.id) : false}
              onToggleVisited={toggleVisited}
              tastingNote={selectedProducer ? getTastingNote(selectedProducer.id) : ''}
              onSaveTastingNote={saveTastingNote}
              isAuthenticated={isAuthenticated}
              onOpenAuth={(role) => setActiveModal({ type: 'auth', initialRole: role || 'traveler' })}
              customNotice={selectedProducer ? getOverride(selectedProducer.id)?.customNotice : undefined}
              producerOverride={selectedProducer ? getOverride(selectedProducer.id) : undefined}
            />
          </Suspense>
        )}
      </main>

      <Suspense fallback={(
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm" role="status" aria-live="polite">
          <div className="rounded-2xl border border-white/10 bg-stone-900 px-4 py-3 text-xs font-semibold text-stone-200 shadow-2xl">Loading…</div>
        </div>
      )}>

        {activeModal?.type === 'auth' && (
          <AuthModal
            isOpen
            onClose={closeModal}
            initialRole={activeModal.initialRole || 'traveler'}
            producers={producers}
            onLogin={loginWithEmail}
            onSignup={signupWithEmail}
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

        {activeModal?.type === 'passport' && (
          <PassportModal
            isOpen
            onClose={closeModal}
            user={user}
            producers={publicProducers}
            onToggleVisited={toggleVisited}
            onSaveTastingNote={saveTastingNote}
            onSelectProducer={(producer) => {
              setSelectedProducer(producer);
              setIsRegionGuideOpen(false);
              setIsDrawerOpen(true);
              closeModal();
            }}
          />
        )}

        {activeModal?.type === 'account_settings' && user && (
          <AccountSettingsModal
            isOpen
            onClose={closeModal}
            user={user}
            onSaveProfile={async (updates) => {
              await saveUserProfileToCloud({ id: user.id, ...updates });
            }}
            onAccountDeleted={logout}
          />
        )}

        {activeModal?.type === 'booking' && (
          <BookingModal
            isOpen
            onClose={closeModal}
            producer={activeModal.producer || publicSelectedProducer}
            user={user}
            initialExperienceId={activeModal.experienceId}
            onBookTasting={bookTasting}
            onOpenAuth={() => setActiveModal({ type: 'auth', initialRole: 'traveler' })}
          />
        )}

        {activeModal?.type === 'portal' && (
          <>
            {adminPortalPreviewProducer && (
              <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[70] pointer-events-none max-w-[calc(100%-2rem)] rounded-full border border-sky-400/30 bg-sky-950/95 px-3 py-1.5 text-[10px] sm:text-xs font-bold text-sky-200 shadow-xl backdrop-blur-md text-center">
                Admin preview · {adminPortalPreviewProducer.name} · UI only — producer writes are disabled
              </div>
            )}
            <ProducerPortalModal
              isOpen
              onClose={closeModal}
              user={producerPortalUser}
              trustedProducerIds={adminPortalPreviewProducer ? [adminPortalPreviewProducer.id] : (accountCapabilities?.producerIds || [])}
              isReadOnlyPreview={Boolean(adminPortalPreviewProducer)}
              onOpenAuth={(role) => setActiveModal({ type: 'auth', initialRole: role || 'producer' })}
              onLoginWithGoogle={loginWithGoogle}
              onLoginWithApple={loginWithApple}
              producers={producers}
              bookings={adminPortalPreviewProducer ? [] : hostBookings}
              onUpdateBookingStatus={adminPortalPreviewProducer ? async () => undefined : setHostStatus}
              onSaveProducerOverride={adminPortalPreviewProducer ? async () => undefined : updateOverride}
              getProducerOverride={getOverride}
              onUpdateProducerTaxDetails={adminPortalPreviewProducer ? async () => undefined : updateProducerTaxDetails}
              onSelectProducerForDrawer={(producer) => {
                setSelectedProducer(producer);
                setIsRegionGuideOpen(false);
                setIsDrawerOpen(true);
                closeModal();
              }}
              onPassVerified={(info) => setActiveModal({ type: 'host_verify', guestInfo: info })}
            />
          </>
        )}

        {activeModal?.type === 'admin' && accountCapabilities?.isAdmin && (
          <AdminPanelModal
            isOpen
            onClose={closeModal}
            capabilities={accountCapabilities}
          />
        )}

        {activeModal?.type === 'my_bookings' && (
          <MyBookingsModal
            isOpen
            onClose={closeModal}
            bookings={travelerBookings}
            producers={publicProducers}
            onCancelBooking={cancelBooking}
            onSelectProducer={(producer) => {
              setSelectedProducer(producer);
              setIsRegionGuideOpen(false);
              setIsDrawerOpen(true);
              closeModal();
            }}
          />
        )}

        {activeModal?.type === 'pass' && (
          <ExplorerPassModal
            isOpen
            onClose={closeModal}
            user={user}
            onOpenAuth={() => setActiveModal({ type: 'auth', initialRole: 'traveler' })}
            onOpenDigitalPass={() => setActiveModal({ type: 'digital_pass' })}
          />
        )}

        {activeModal?.type === 'digital_pass' && (
          <DigitalPassModal
            isOpen
            onClose={closeModal}
            user={user}
            onOpenExplorerPass={() => setActiveModal({ type: 'pass' })}
          />
        )}

        {activeModal?.type === 'host_verify' && (
          <HostVerificationModal
            isOpen
            onClose={closeModal}
            guestInfo={activeModal.guestInfo}
          />
        )}

        {activeModal?.type === 'chauffeur' && (
          <ChauffeurBookingModal
            isOpen
            onClose={closeModal}
            initialProducer={activeModal.producer}
            user={user}
            onOpenAuth={() => setActiveModal({ type: 'auth', initialRole: 'traveler' })}
            onBookChauffeur={handleConfirmChauffeurBooking}
          />
        )}

        {activeModal?.type === 'about_faq' && (
          <AboutFaqModal
            isOpen
            onClose={closeModal}
            initialTab={activeModal.initialTab || 'about'}
            onOpenAuth={(role) => setActiveModal({ type: 'auth', initialRole: role || 'traveler' })}
            onOpenProducerPortal={() => handleOpenProducerPortal()}
            onOpenLegal={(tab) => setActiveModal({ type: 'legal', initialTab: tab })}
          />
        )}

        {activeModal?.type === 'legal' && (
          <LegalModal
            isOpen
            onClose={closeModal}
            initialTab={activeModal.initialTab || 'privacy'}
          />
        )}
      </Suspense>
      {showFirstRunWelcome && (
        <FirstRunWelcome
          pwaInstall={pwaInstall}
          onComplete={completeFirstRunWelcome}
        />
      )}
    </div>
  );
};
