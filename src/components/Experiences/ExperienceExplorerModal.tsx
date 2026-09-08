import React, { useState, useMemo } from 'react';
import { ALL_EXPERIENCES } from '../../data/experiences';
import { CRETAN_PRODUCERS } from '../../data/producers';
import { TastingExperience } from '../../types/booking';
import { Producer, ProducerCategory, Destination } from '../../types/terroir';
import { 
  X, Search, Sparkles, Clock, MapPin, Check, Wine, 
  Beer, Flame, Disc, Flower2, SlidersHorizontal, ArrowRight,
  Filter, Tag
} from 'lucide-react';

interface ExperienceExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookExperience: (experience: TastingExperience) => void;
  onSelectProducer?: (producer: Producer) => void;
}

type PriceFilter = 'all' | 'under20' | '20to40' | 'over40';
type DurationFilter = 'all' | 'under60' | '60to90' | 'over90';
type SortOption = 'featured' | 'price_asc' | 'price_desc' | 'duration_asc' | 'duration_desc';

const CATEGORY_CONFIG: Record<
  ProducerCategory | 'all', 
  { label: string; icon: React.FC<{ className?: string }>; color: string }
> = {
  all: { label: 'All Experiences', icon: Sparkles, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  winery: { label: 'Wineries', icon: Wine, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
  brewery: { label: 'Breweries', icon: Beer, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  olive_mill: { label: 'Olive Mills', icon: Disc, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  cheese_dairy: { label: 'Cheese Dairies', icon: Disc, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
  kazani: { label: 'Distilleries', icon: Flame, color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
  apiary: { label: 'Apiaries', icon: Flower2, color: 'text-amber-300 bg-amber-400/10 border-amber-400/30' },
};

const DESTINATIONS: { id: Destination | 'all'; label: string }[] = [
  { id: 'all', label: 'All Greece' },
  { id: 'crete', label: 'Crete' },
  { id: 'santorini', label: 'Santorini' },
  { id: 'peloponnese', label: 'Peloponnese' },
  { id: 'northern_greece', label: 'Northern Greece' },
];

export const ExperienceExplorerModal: React.FC<ExperienceExplorerModalProps> = ({
  isOpen,
  onClose,
  onBookExperience,
  onSelectProducer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProducerCategory | 'all'>('all');
  const [selectedDestination, setSelectedDestination] = useState<Destination | 'all'>('all');
  const [selectedPrice, setSelectedPrice] = useState<PriceFilter>('all');
  const [selectedDuration, setSelectedDuration] = useState<DurationFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [showFilters, setShowFilters] = useState(false);

  // Map producerId to actual producer object for quick access
  const producerMap = useMemo(() => {
    const map = new Map<string, Producer>();
    CRETAN_PRODUCERS.forEach((p) => map.set(p.id, p));
    return map;
  }, []);

  // Filter and sort experiences
  const filteredExperiences = useMemo(() => {
    return ALL_EXPERIENCES.filter((exp) => {
      // Category filter
      if (selectedCategory !== 'all' && exp.category !== selectedCategory) {
        return false;
      }

      // Destination filter
      if (selectedDestination !== 'all' && exp.destination !== selectedDestination) {
        // If exp has no destination specified (e.g. general masterclass), allow only if 'all'
        if (exp.destination !== selectedDestination) return false;
      }

      // Price filter
      if (selectedPrice === 'under20' && exp.pricePerPerson >= 20) return false;
      if (selectedPrice === '20to40' && (exp.pricePerPerson < 20 || exp.pricePerPerson > 40)) return false;
      if (selectedPrice === 'over40' && exp.pricePerPerson <= 40) return false;

      // Duration filter
      if (selectedDuration === 'under60' && exp.durationMinutes >= 60) return false;
      if (selectedDuration === '60to90' && (exp.durationMinutes < 60 || exp.durationMinutes > 90)) return false;
      if (selectedDuration === 'over90' && exp.durationMinutes <= 90) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = exp.title.toLowerCase().includes(q);
        const matchesDesc = exp.description.toLowerCase().includes(q);
        const matchesProducer = exp.producerName?.toLowerCase().includes(q) || false;
        const matchesLocation = exp.location?.toLowerCase().includes(q) || false;
        const matchesBadge = exp.badge?.toLowerCase().includes(q) || false;
        const matchesIncludes = exp.includes.some((inc) => inc.toLowerCase().includes(q));

        if (!matchesTitle && !matchesDesc && !matchesProducer && !matchesLocation && !matchesBadge && !matchesIncludes) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.pricePerPerson - b.pricePerPerson;
      if (sortBy === 'price_desc') return b.pricePerPerson - a.pricePerPerson;
      if (sortBy === 'duration_asc') return a.durationMinutes - b.durationMinutes;
      if (sortBy === 'duration_desc') return b.durationMinutes - a.durationMinutes;
      return 0; // featured default
    });
  }, [searchQuery, selectedCategory, selectedDestination, selectedPrice, selectedDuration, sortBy]);

  // Counts by category
  const countsByCategory = useMemo(() => {
    const counts: Record<string, number> = { all: ALL_EXPERIENCES.length };
    ALL_EXPERIENCES.forEach((e) => {
      const cat = e.category || 'winery';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-stone-950 text-stone-100 rounded-3xl shadow-2xl border border-white/15 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-8 py-4 bg-stone-900 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-title text-lg sm:text-xl font-bold text-white">
                  Terroir & Tasting Experiences
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {ALL_EXPERIENCES.length} Curated
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Cellar flights, granite stone-milling, amphora workshops & craft tank-pulls
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition border border-white/10 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Main Filter Controls */}
        <div className="p-4 sm:p-5 bg-stone-900/60 border-b border-white/10 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by variety (Assyrtiko, Vidiano), producer, village, or craft..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-950 border border-white/15 text-white placeholder-stone-400 text-sm focus:outline-none focus:border-amber-400/60 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Destination Selector */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {DESTINATIONS.map((dest) => (
                <button
                  key={dest.id}
                  onClick={() => setSelectedDestination(dest.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer border ${
                    selectedDestination === dest.id
                      ? 'bg-amber-500 text-stone-950 font-bold border-amber-400 shadow-sm'
                      : 'bg-stone-900 text-stone-300 border-white/10 hover:border-white/20'
                  }`}
                >
                  {dest.label}
                </button>
              ))}
            </div>

            {/* Toggle advanced filters & sort */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition border cursor-pointer shrink-0 ${
                showFilters || selectedPrice !== 'all' || selectedDuration !== 'all' || sortBy !== 'featured'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-stone-900 text-stone-400 border-white/10 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters & Sort</span>
            </button>
          </div>

          {/* Advanced Filters Panel (Collapsible) */}
          {showFilters && (
            <div className="p-3.5 rounded-2xl bg-stone-950 border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs animate-in slide-in-from-top-2 duration-150">
              {/* Price Filter */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                  Price Per Person
                </label>
                <select
                  value={selectedPrice}
                  onChange={(e) => setSelectedPrice(e.target.value as PriceFilter)}
                  className="w-full px-3 py-1.5 rounded-xl bg-stone-900 border border-white/15 text-stone-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="all">Any Price</option>
                  <option value="under20">Under €20</option>
                  <option value="20to40">€20 – €40</option>
                  <option value="over40">Over €40</option>
                </select>
              </div>

              {/* Duration Filter */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                  Duration
                </label>
                <select
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(e.target.value as DurationFilter)}
                  className="w-full px-3 py-1.5 rounded-xl bg-stone-900 border border-white/15 text-stone-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="all">Any Duration</option>
                  <option value="under60">Under 60 mins</option>
                  <option value="60to90">60 – 90 mins</option>
                  <option value="over90">90+ mins</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                  Sort Order
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full px-3 py-1.5 rounded-xl bg-stone-900 border border-white/15 text-stone-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="featured">Featured Curations</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="duration_asc">Duration: Shortest First</option>
                  <option value="duration_desc">Duration: Longest First</option>
                </select>
              </div>
            </div>
          )}

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {(Object.keys(CATEGORY_CONFIG) as (ProducerCategory | 'all')[]).map((catKey) => {
              const cfg = CATEGORY_CONFIG[catKey];
              const Icon = cfg.icon;
              const count = countsByCategory[catKey] || 0;
              const isActive = selectedCategory === catKey;

              return (
                <button
                  key={catKey}
                  onClick={() => setSelectedCategory(catKey)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer border ${
                    isActive
                      ? 'bg-white text-stone-950 font-bold border-white shadow-md'
                      : 'bg-stone-900/80 text-stone-400 border-white/5 hover:border-white/15 hover:text-stone-200'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-stone-950' : 'text-stone-400'}`} />
                  <span>{cfg.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-stone-900/20 text-stone-950 font-bold' : 'bg-stone-800 text-stone-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Experience Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-400 px-1">
            <span>
              Showing <strong className="text-white">{filteredExperiences.length}</strong> experiences
            </span>
            {(selectedCategory !== 'all' || selectedDestination !== 'all' || searchQuery || selectedPrice !== 'all' || selectedDuration !== 'all') && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedDestination('all');
                  setSelectedPrice('all');
                  setSelectedDuration('all');
                  setSearchQuery('');
                  setSortBy('featured');
                }}
                className="text-amber-400 hover:text-amber-300 underline cursor-pointer"
              >
                Reset all filters
              </button>
            )}
          </div>

          {filteredExperiences.length === 0 ? (
            <div className="text-center py-16 px-4 bg-stone-900/40 rounded-3xl border border-white/5 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                <Filter className="w-6 h-6" />
              </div>
              <h3 className="font-serif-title text-base font-bold text-white">No experiences match your filter</h3>
              <p className="text-xs text-stone-400 max-w-sm mx-auto">
                Try clearing your search term or adjusting category and price filters to discover other terroir flights.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedDestination('all');
                  setSelectedPrice('all');
                  setSelectedDuration('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs hover:bg-amber-400 transition cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredExperiences.map((exp) => {
                const producer = exp.producerId ? producerMap.get(exp.producerId) : undefined;
                const catCfg = CATEGORY_CONFIG[exp.category || 'winery'];
                const CatIcon = catCfg?.icon || Wine;

                return (
                  <div
                    key={exp.id}
                    className="p-5 rounded-3xl bg-stone-900/70 border border-white/10 hover:border-amber-500/40 transition flex flex-col justify-between group shadow-sm hover:shadow-md"
                  >
                    <div className="space-y-3">
                      {/* Top Badges & Meta */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {exp.badge && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                              <Tag className="w-2.5 h-2.5" />
                              {exp.badge}
                            </span>
                          )}
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border flex items-center gap-1 ${catCfg?.color || 'text-stone-400 border-white/10'}`}>
                            <CatIcon className="w-2.5 h-2.5" />
                            {catCfg?.label || 'Tasting'}
                          </span>
                        </div>

                        {/* Price badge */}
                        <div className="text-right shrink-0">
                          <span className="font-mono text-base font-bold text-amber-300">
                            €{exp.pricePerPerson}
                          </span>
                          <span className="text-[10px] text-stone-400 block -mt-1">/ person</span>
                        </div>
                      </div>

                      {/* Title & Producer info */}
                      <div>
                        <h3 className="font-serif-title font-bold text-base text-white group-hover:text-amber-200 transition-colors leading-snug">
                          {exp.title}
                        </h3>

                        {exp.producerName && (
                          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-stone-300">
                            {producer && onSelectProducer ? (
                              <button
                                onClick={() => onSelectProducer(producer)}
                                className="font-medium text-amber-400/90 hover:text-amber-300 hover:underline transition text-left cursor-pointer flex items-center gap-1"
                              >
                                <span>{exp.producerName}</span>
                              </button>
                            ) : (
                              <span className="font-medium text-amber-400/90">{exp.producerName}</span>
                            )}
                            {exp.location && (
                              <>
                                <span className="text-stone-500">•</span>
                                <span className="text-stone-400 flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-stone-500 shrink-0" />
                                  <span>{exp.location}</span>
                                </span>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-xs text-stone-300 leading-relaxed line-clamp-3">
                        {exp.description}
                      </p>

                      {/* Inclusions checklist */}
                      <div className="pt-2 border-t border-white/5 space-y-1">
                        {exp.includes.map((inc, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-[11px] text-stone-400">
                            <Check className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                            <span className="leading-tight">{inc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-xs text-stone-400 font-medium">
                        <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{exp.durationMinutes} mins</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {producer && onSelectProducer && (
                          <button
                            type="button"
                            onClick={() => onSelectProducer(producer)}
                            className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white font-semibold text-xs transition cursor-pointer"
                          >
                            View Estate
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onBookExperience(exp)}
                          className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-sm transition active:scale-95 flex items-center gap-1 cursor-pointer"
                        >
                          <span>Book Tasting</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-stone-900 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Instant booking confirmation • Direct estate calendar integration</span>
          </div>
          <span className="text-[11px] text-stone-400">
            Explorer Pass holders enjoy complimentary private flight upgrades
          </span>
        </div>
      </div>
    </div>
  );
};
