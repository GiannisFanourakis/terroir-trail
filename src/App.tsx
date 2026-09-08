import React, { useState, useMemo } from 'react';
import { CRETAN_PRODUCERS } from './data/producers';
import { Producer, FilterState, Destination, DayTripLoop } from './types/terroir';
import { Header } from './components/Header/Header';
import { FilterBar } from './components/FilterBar/FilterBar';
import { MapCanvas } from './components/Map/MapCanvas';
import { ProducerList } from './components/Sidebar/ProducerList';
import { ProducerDetailDrawer } from './components/Drawer/ProducerDetailDrawer';
import { DayTripModal } from './components/Loops/DayTripModal';
import { useFavorites } from './hooks/useFavorites';

export const App: React.FC = () => {
  const [selectedProducer, setSelectedProducer] = useState<Producer | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isLoopsModalOpen, setIsLoopsModalOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  const { favorites, toggleFavorite, isFavorite } = useFavorites();

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

  // Filter Handler
  const handleFilterChange = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  // Filter & Search Logic
  const filteredProducers = useMemo(() => {
    return CRETAN_PRODUCERS.filter((producer) => {
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
        const matchesDescription = producer.description.toLowerCase().includes(q);
        const matchesVariety = producer.indigenousVarieties.some((v) =>
          v.toLowerCase().includes(q)
        );

        if (!matchesName && !matchesGreekName && !matchesVillage && !matchesRegion && !matchesDescription && !matchesVariety) {
          return false;
        }
      }

      return true;
    });
  }, [filters, isFavorite]);

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
    const firstProducer = CRETAN_PRODUCERS.find((p) => p.id === loop.stops[0]?.producerId);
    if (firstProducer) {
      setSelectedProducer(firstProducer);
      setIsDrawerOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-stone-950 font-sans text-stone-100">
      {/* 1. Header Bar */}
      <Header
        selectedDestination={filters.destination}
        onSelectDestination={(dest: Destination | 'all') => handleFilterChange('destination', dest)}
        searchQuery={filters.searchQuery}
        onSearchChange={(query: string) => handleFilterChange('searchQuery', query)}
        onOpenLoops={() => setIsLoopsModalOpen(true)}
        totalFilteredCount={filteredProducers.length}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode((prev) => (prev === 'map' ? 'list' : 'map'))}
        savedCount={favorites.length}
        favoritesOnly={filters.favoritesOnly}
        onToggleFavoritesOnly={() => handleFilterChange('favoritesOnly', !filters.favoritesOnly)}
      />

      {/* 2. Interactive Filter Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        totalFiltered={filteredProducers.length}
        totalCount={CRETAN_PRODUCERS.length}
      />

      {/* 3. Main Workspace: Sidebar List + Leaflet Map Canvas */}
      <main className="relative flex-1 flex overflow-hidden">
        {/* Desktop Sidebar / Mobile List View */}
        <div
          className={`${
            viewMode === 'list' ? 'flex' : 'hidden'
          } md:flex h-full shrink-0 z-10`}
        >
          <ProducerList
            producers={filteredProducers}
            selectedProducer={selectedProducer}
            onSelectProducer={(p) => {
              setSelectedProducer(p);
              setIsDrawerOpen(true);
              if (window.innerWidth < 768) {
                setViewMode('map');
              }
            }}
            onResetFilters={handleResetFilters}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
          />
        </div>

        {/* The Interactive Map */}
        <div
          className={`flex-1 h-full w-full relative ${
            viewMode === 'map' ? 'block' : 'hidden md:block'
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
          />
        </div>

        {/* 4. Slide-Out Detailed Producer Drawer */}
        {isDrawerOpen && (
          <ProducerDetailDrawer
            producer={selectedProducer}
            onClose={() => setIsDrawerOpen(false)}
            isFavorite={selectedProducer ? isFavorite(selectedProducer.id) : false}
            onToggleFavorite={toggleFavorite}
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
      />
    </div>
  );
};
