import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  Building2,
  ChevronDown,
  ChevronUp,
  Compass,
  HelpCircle,
  Mail,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { CATALOGUE_SUMMARY } from '../../data/catalogueSummary.generated';

interface AboutFaqModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'about' | 'faq' | 'contact';
  onOpenAuth?: (role?: 'traveler' | 'producer') => void;
  onOpenProducerPortal?: () => void;
  onOpenLegal?: (tab?: 'privacy' | 'terms' | 'licenses') => void;
}

type FaqCategory = 'about' | 'visiting' | 'passport' | 'producers';
type FaqAction = 'producer_portal' | 'auth_traveler';
type AboutTab = 'about' | 'faq' | 'contact';

interface FaqItem {
  id: string;
  category: FaqCategory;
  categoryLabel: string;
  question: string;
  answer: string;
  highlight?: string;
  actionText?: string;
  actionType?: FaqAction;
}

const CONTACT_EMAIL = 'terroirtrail@gmail.com';
const INSTAGRAM_URL = 'https://www.instagram.com/terroirtrail/';

const formatHumanList = (values: readonly string[]): string => {
  if (values.length <= 1) return values[0] ?? '';
  if (values.length === 2) return `${values[0]} and ${values[1]}`;
  return `${values.slice(0, -1).join(', ')}, and ${values[values.length - 1]}`;
};

const COUNTRY_SCOPE_TEXT = formatHumanList(CATALOGUE_SUMMARY.countryNames);
const CATEGORY_SCOPE_TEXT = formatHumanList(CATALOGUE_SUMMARY.categoryNames);

export const FAQ_DATA: FaqItem[] = [
  {
    id: 'what-is-terroirtrail',
    category: 'about',
    categoryLabel: 'About & Curation',
    question: 'What is TerroirTrail?',
    answer:
      'TerroirTrail is an independent, discovery-first agritourism and producer guide for culinary travelers, road-trippers, and slow travelers across Europe. It helps people discover wineries, breweries, cideries, distilleries, olive and other oil producers, dairies, apiaries, confectionery makers, herb and mushroom farms, and traditional farms, with direct producer contact and clear information about visiting, location, and access where those details are known.',
    highlight: 'Independent producer discovery built around useful, practical travel information.',
  },
  {
    id: 'why-terroirtrail',
    category: 'about',
    categoryLabel: 'About & Curation',
    question: 'Why does TerroirTrail exist?',
    answer:
      'Rural producer discovery is fragmented. Essential visiting details are often scattered across individual producer websites, business listings, maps, social media, and outdated tourism directories. TerroirTrail brings those signals into one curated discovery guide, organizing practical travel facts in one place without pretending that missing information is known.',
    highlight: 'Bringing scattered rural producer signals into one curated discovery guide.',
  },
  {
    id: 'categories-included',
    category: 'about',
    categoryLabel: 'About & Curation',
    question: 'What categories of producers are included?',
    answer: `The active catalogue currently spans ${CATALOGUE_SUMMARY.categories} producer categories: ${CATEGORY_SCOPE_TEXT}. The category total is generated from the same active catalogue used by discovery and SEO, so it changes automatically as publication scope changes.`,
    highlight: 'Every active category is presented under the same evidence-first research standard.',
  },
  {
    id: 'how-producers-selected',
    category: 'about',
    categoryLabel: 'About & Curation',
    question: 'How are listings researched and verified?',
    answer:
      'Every listing is researched from official producer websites, reliable business sources, and direct first-party evidence. TerroirTrail operates on the principle that "Unknown does not mean No." We never infer walk-ins from opening hours, booking requirements from contact forms, visitor access from a map pin, or rental-car-safe roads from a navigation line. When evidence is incomplete, we leave it unknown rather than guessing.',
    highlight: 'Unknown does not mean No: we never convert missing evidence into travel claims.',
  },
  {
    id: 'listing-partnership',
    category: 'about',
    categoryLabel: 'About & Curation',
    question: 'Does a TerroirTrail listing mean the producer is a partner?',
    answer:
      'No. Editorial inclusion, public visitability, and commercial partnership are separate things. A producer may be researched and published because it fits the catalogue and evidence standards. A public listing by itself does not indicate a commercial relationship: producers do not pay for inclusion, TerroirTrail does not represent them, and we do not take bookings on their behalf.',
    highlight: 'Published does not mean partnered.',
  },
  {
    id: 'coverage',
    category: 'about',
    categoryLabel: 'About & Curation',
    question: 'Where does TerroirTrail currently have coverage?',
    answer: `The active catalogue currently contains ${CATALOGUE_SUMMARY.producers} producer/project records across ${CATALOGUE_SUMMARY.destinations} destinations, ${CATALOGUE_SUMMARY.regions} named regions and ${CATALOGUE_SUMMARY.countries} European countries: ${COUNTRY_SCOPE_TEXT}. These figures are generated from the active public catalogue and update automatically when publication state changes.`,
    highlight: 'Coverage expands across Europe without weakening our evidence and publication standard.',
  },
  {
    id: 'visitability-states',
    category: 'visiting',
    categoryLabel: 'Visiting Producers',
    question: 'What visitability states does TerroirTrail show?',
    answer:
      'Each producer listing displays an independently verified visitability state: public visits, seasonal public access, appointment only, current access uncertain, or not publicly confirmed. TerroirTrail never collapses unknown states into negative states. A producer without published visitor information is not assumed to be closed to visitors; unconfirmed details simply remain clearly marked as uncertain.',
    highlight: 'Unknown states are never collapsed into negative assumptions.',
  },
  {
    id: 'booking-walkin-policies',
    category: 'visiting',
    categoryLabel: 'Visiting Producers',
    question: 'How do booking and walk-in policies work?',
    answer:
      'Booking requirements and walk-in policies are evaluated as separate facts. Booking guidance can independently be required, recommended, not required, or unknown. Walk-in policy can independently be accepted, not accepted, subject to availability, or unknown. We do not assume a contact form implies mandatory booking, nor that posted hours guarantee walk-in entry.',
    highlight: 'Booking rules and walk-in availability are verified independently.',
  },
  {
    id: 'road-access',
    category: 'visiting',
    categoryLabel: 'Visiting Producers',
    question: 'How does TerroirTrail handle rural road access?',
    answer:
      'TerroirTrail treats location and road access as separate facts. A verified map point does not automatically mean the final approach is suitable for a standard rental car. When access has been independently classified, the listing shows that information; when it has not, the platform fails closed and does not invent a positive road condition.',
    highlight: 'Location and road access are separate: road guidance fails closed.',
  },
  {
    id: 'direct-contact',
    category: 'visiting',
    categoryLabel: 'Visiting Producers',
    question: 'Do I need to contact a producer before visiting?',
    answer:
      'For current, time-sensitive arrangements—such as today’s opening hours, same-day tasting availability, prices, reservations, private tastings, or seasonal hours—travelers should use the producer’s official contact details shown on the listing. Cached research provides discovery guidance, but does not replace direct confirmation with the maker.',
    highlight: 'Use the producer’s official contact details for current visiting arrangements.',
  },
  {
    id: 'tasting-costs',
    category: 'visiting',
    categoryLabel: 'Visiting Producers',
    question: 'How much do tastings or visits cost?',
    answer:
      'TerroirTrail does not publish generic tasting-price ranges or estimated fee schedules. Prices, inclusions, and visiting terms vary by producer and can change seasonally. Always confirm current prices and arrangements directly with the producer.',
  },
  {
    id: 'family-accessibility',
    category: 'visiting',
    categoryLabel: 'Visiting Producers',
    question: 'Are producers family-friendly or accessible?',
    answer:
      'Facilities vary significantly across rural estates, farmhouses, and historic working sites. TerroirTrail does not assume family suitability, step-free access, parking availability, or other amenities simply because a producer is publicly visitable. Confirm any requirement that matters to your trip directly with the producer.',
  },
  {
    id: 'passport',
    category: 'passport',
    categoryLabel: 'Traveler Passport',
    question: 'What is the Terroir Passport?',
    answer:
      'The Terroir Passport is a personal travel journal inside your account. You can mark places as visited and keep private tasting or visit notes as you explore. Passport stamps are part of the core account experience and are not limited by a paid stamp tier.',
    highlight: 'Your personal European culinary travel journal.',
    actionText: 'Sign In / Create Account',
    actionType: 'auth_traveler',
  },
  {
    id: 'producer-join',
    category: 'producers',
    categoryLabel: 'For Producers',
    question: 'How can a producer be added to TerroirTrail?',
    answer:
      'If you run an independent, place-based producer in Europe that fits the TerroirTrail catalogue, email terroirtrail@gmail.com with your producer name, location, official website or public business page, and a short description of what you make. Every enquiry is reviewed independently against our evidence standards; contacting us does not automatically guarantee inclusion, verification, partnership, booking permission, or Host access.',
    highlight: 'Producer listing enquiries: terroirtrail@gmail.com',
  },
  {
    id: 'producer-claim',
    category: 'producers',
    categoryLabel: 'For Producers',
    question: 'I own or represent a listed producer. How can I manage the listing?',
    answer:
      'Use the Host Portal to sign in or submit a producer claim. Host privileges are granted only from trusted ownership records after review; they cannot be self-assigned by changing profile data or automatically verified.',
    highlight: 'Producer ownership is reviewed before host access is granted.',
    actionText: 'Open Host Portal',
    actionType: 'producer_portal',
  },
  {
    id: 'producer-corrections',
    category: 'producers',
    categoryLabel: 'For Producers',
    question: 'How can a producer correct or update information?',
    answer:
      'We welcome factual corrections and updated first-party evidence. Producers can submit updates to physical location, official contact details, visitor information, access notes, or production descriptions by emailing terroirtrail@gmail.com or through the Host Portal. We prioritize verified first-party corrections.',
    highlight: 'Factual corrections and first-party evidence updates are always welcomed.',
  },
  {
    id: 'bookings-commercial',
    category: 'producers',
    categoryLabel: 'For Producers',
    question: 'Does TerroirTrail sell bookings, paid passes, or charge commissions?',
    answer:
      'TerroirTrail remains discovery-first and does not charge booking commissions. After a producer claim is approved, the verified Host can optionally subscribe to TerroirTrail Partner for €199/year through Stripe to become eligible for clearly labelled, Admin-reviewed paid promotion. Partner payment never buys catalogue inclusion, verification, visitability, road/access facts or organic ranking. Public tasting Experiences, Explorer Pass sales and chauffeur checkout remain inactive, and display advertising remains disabled. Some outbound travel links may be affiliate links that can earn TerroirTrail a referral commission at no additional cost to the traveler.',
    highlight: 'Discovery-first: zero booking commissions; optional Partner promotion is separate from free listings and trust data.',
  },
];

export const AboutFaqModal: React.FC<AboutFaqModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'about',
  onOpenAuth,
  onOpenProducerPortal,
  onOpenLegal,
}) => {
  const [activeTab, setActiveTab] = useState<AboutTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | FaqCategory>('all');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  const categories: Array<{ id: 'all' | FaqCategory; label: string }> = [
    { id: 'all', label: 'All Questions' },
    { id: 'about', label: 'About & Curation' },
    { id: 'visiting', label: 'Visiting Producers' },
    { id: 'passport', label: 'Traveler Passport' },
    { id: 'producers', label: 'For Producers' },
  ];

  const filteredFaqs = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return FAQ_DATA.filter((faq) => {
      const categoryMatches = selectedCategory === 'all' || faq.category === selectedCategory;
      const searchMatches =
        !query ||
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.categoryLabel.toLowerCase().includes(query) ||
        faq.highlight?.toLowerCase().includes(query);
      return categoryMatches && searchMatches;
    });
  }, [searchQuery, selectedCategory]);

  if (!isOpen) return null;

  const handleAction = (action?: FaqAction) => {
    if (!action) return;
    onClose();
    if (action === 'producer_portal') {
      if (onOpenProducerPortal) onOpenProducerPortal();
      else onOpenAuth?.('producer');
    }
    if (action === 'auth_traveler') onOpenAuth?.('traveler');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-4xl bg-stone-950 text-stone-100 rounded-3xl shadow-2xl border border-white/15 overflow-hidden flex flex-col max-h-[92vh]">
        <div className="px-3 sm:px-6 py-4 bg-stone-900 border-b border-white/10 shrink-0 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <img src="/logo.png" alt="TerroirTrail" className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow-md shrink-0" />
            <div className="min-w-0">
              <h2 className="font-serif-title text-sm sm:text-lg font-bold text-white">
                Terroir<span className="text-amber-400 font-sans font-light">Trail</span>
              </h2>
              <p className="text-[11px] text-stone-400 hidden sm:block truncate">
                Independent Producer & Agritourism Guide
              </p>
            </div>
          </div>

          <div className="order-3 flex w-full min-w-0 max-w-full items-center justify-center gap-0.5 overflow-x-auto p-1 bg-stone-950 rounded-2xl border border-white/10 sm:order-none sm:w-auto sm:gap-1 sm:overflow-visible">
            <TabButton active={activeTab === 'about'} onClick={() => setActiveTab('about')} icon={<BookOpen className="w-3.5 h-3.5" />} label="About" />
            <TabButton active={activeTab === 'faq'} onClick={() => setActiveTab('faq')} icon={<HelpCircle className="w-3.5 h-3.5" />} label="FAQ" />
            <TabButton active={activeTab === 'contact'} onClick={() => setActiveTab('contact')} icon={<Mail className="w-3.5 h-3.5" />} label="Contact" />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition border border-white/5 cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-8 text-stone-200">
          {activeTab === 'about' ? (
            <div className="space-y-7 animate-in fade-in duration-200">
              <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-stone-900 to-stone-950 p-6 sm:p-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Independent discovery</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold font-serif-title text-white tracking-tight leading-snug max-w-3xl">
                  Discover independent makers and the places behind what they make.
                </h1>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-3xl">
                  TerroirTrail is an independent discovery guide connecting culinary travelers, road-trippers, and slow travelers with authentic place-based producers across Europe. It helps you find wineries, breweries, cideries, distilleries, olive and other oil mills, dairies, apiaries, confectionery makers, herb and mushroom farms, and traditional farms — with direct producer contact, clear visiting guidance, and practical road-access notes before you make a rural trip.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-5 border-t border-white/10">
                  <Metric value={String(CATALOGUE_SUMMARY.producers)} label="Active listings" />
                  <Metric value={String(CATALOGUE_SUMMARY.countries)} label="Countries" />
                  <Metric value={String(CATALOGUE_SUMMARY.destinations)} label="Destinations" />
                  <Metric value={String(CATALOGUE_SUMMARY.categories)} label="Producer categories" />
                </div>
              </div>

              <div className="p-5 sm:p-6 rounded-2xl bg-stone-900 border border-white/10 space-y-2.5">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <Compass className="w-4 h-4" />
                  <span>Why TerroirTrail exists</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  Rural producer discovery is fragmented. Useful travel information is often scattered between individual producer websites, business listings, maps, social media, and outdated tourism pages. TerroirTrail brings those signals into one curated discovery experience — giving travelers practical, source-backed facts without pretending that missing information is known.
                </p>
              </div>

              <div className="p-5 sm:p-6 rounded-2xl bg-stone-900 border border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-stone-900 to-stone-950 space-y-4">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Evidence-first standard: Unknown does not mean No</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  TerroirTrail never converts an absence of evidence into an assumption or an unsupported travel promise. When visitor or access conditions have not been verified from first-party sources, they stay clearly marked as unconfirmed. TerroirTrail deliberately does not infer:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-300">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-950/60 border border-white/5">
                    <span className="text-amber-400 font-bold">✕</span>
                    <span>Opening hours → walk-ins accepted</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-950/60 border border-white/5">
                    <span className="text-amber-400 font-bold">✕</span>
                    <span>Contact form → booking required</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-950/60 border border-white/5">
                    <span className="text-amber-400 font-bold">✕</span>
                    <span>Booking button → every visit requires booking</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-950/60 border border-white/5">
                    <span className="text-amber-400 font-bold">✕</span>
                    <span>Map point → public visitor access</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-950/60 border border-white/5">
                    <span className="text-amber-400 font-bold">✕</span>
                    <span>Cars or photos → parking available</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-950/60 border border-white/5">
                    <span className="text-amber-400 font-bold">✕</span>
                    <span>Route on a map → rental-car-safe road</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-950/60 border border-white/5 sm:col-span-2">
                    <span className="text-amber-400 font-bold">✕</span>
                    <span>Shop access → factory or production-site access</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Principle
                  icon={<MapPin className="w-5 h-5" />}
                  title="Location & road access are separate"
                  text="TerroirTrail treats location and road access as separate facts. A verified map point does not automatically mean the final approach is suitable for a standard rental car. When access has been independently classified, the listing shows that information; when it has not, the platform fails closed and does not invent a positive road condition."
                />
                <Principle
                  icon={<ShieldCheck className="w-5 h-5" />}
                  title="Published does not mean partnered"
                  text="A public TerroirTrail listing is an editorial discovery record. It does not mean the producer paid for inclusion, is a commercial partner, accepts bookings through TerroirTrail, or has any commercial relationship with the platform. Editorial inclusion and commercial partnership are separate."
                />
                <Principle
                  icon={<Building2 className="w-5 h-5" />}
                  title="Direct producer connection"
                  text="Official contact details make it easy to reach makers directly to confirm today's opening hours, tasting fees, and same-day visiting arrangements before traveling."
                />
                <Principle
                  icon={<Award className="w-5 h-5" />}
                  title="Your travel journal"
                  text="Signed-in travelers can save places, collect digital passport stamps, and keep private tasting or trip notes as they explore European gastronomic regions."
                />
              </div>

              <div className="p-5 rounded-2xl bg-stone-900 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>Across Europe</span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  The active catalogue currently spans {CATALOGUE_SUMMARY.countries} countries — {COUNTRY_SCOPE_TEXT} — across {CATALOGUE_SUMMARY.categories} producer categories: {CATEGORY_SCOPE_TEXT}. Coverage is driven by published, verified active records rather than a fixed country list, updating automatically as the catalogue changes.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <p className="text-xs text-stone-300 text-center sm:text-left">
                  Have questions about visiting producers, road access, or the traveler passport?
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab('faq')}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-md transition active:scale-95 cursor-pointer"
                  >
                    Read FAQ
                  </button>
                </div>
              </div>
            </div>
          ) : activeTab === 'faq' ? (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search visiting, road access, passport, producer claims..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-900 border border-white/15 text-white placeholder-stone-500 text-xs focus:outline-none focus:border-amber-400/80 transition"
                  />
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition cursor-pointer ${
                        selectedCategory === category.id
                          ? 'bg-amber-500 text-stone-950'
                          : 'bg-stone-900 text-stone-400 border border-white/10 hover:text-white'
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5">
                {filteredFaqs.length === 0 ? (
                  <div className="p-8 text-center bg-stone-900/50 rounded-2xl border border-white/10 space-y-2">
                    <HelpCircle className="w-8 h-8 text-stone-500 mx-auto" />
                    <p className="text-sm font-bold text-white">No matching questions found</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-stone-800 text-amber-300 text-xs font-bold cursor-pointer"
                    >
                      Reset filters
                    </button>
                  </div>
                ) : (
                  filteredFaqs.map((faq) => {
                    const isExpanded = expandedFaqId === faq.id;
                    return (
                      <div
                        key={faq.id}
                        className={`rounded-2xl border transition-all overflow-hidden ${
                          isExpanded
                            ? 'bg-stone-900 border-amber-500/40 shadow-lg'
                            : 'bg-stone-900/60 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                          className="w-full p-4 text-left flex items-start justify-between gap-3 cursor-pointer"
                        >
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90 font-mono">
                              {faq.categoryLabel}
                            </span>
                            <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                              {faq.question}
                            </h4>
                          </div>
                          <div className="p-1 rounded-lg bg-stone-800 text-stone-300 shrink-0 mt-0.5">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="px-4 pb-4 pt-3 text-xs text-stone-300 space-y-3 border-t border-white/5">
                            <p className="leading-relaxed">{faq.answer}</p>
                            {faq.highlight && (
                              <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[11px] font-medium">
                                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                                <span>{faq.highlight}</span>
                              </div>
                            )}
                            {faq.actionText && (
                              <button
                                type="button"
                                onClick={() => handleAction(faq.actionType)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-bold transition border border-white/10 cursor-pointer"
                              >
                                <span>{faq.actionText}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-5 rounded-2xl bg-stone-900 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div>
                  <h4 className="text-sm font-bold text-white">Still have a question?</h4>
                  <p className="mt-1 text-[11px] text-stone-400">Email us or find TerroirTrail on Instagram.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('contact')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Contact us
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-stone-900 to-stone-950 p-6 sm:p-8">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                  <Mail className="w-4 h-4" />
                  <span>Get in touch</span>
                </div>
                <h1 className="mt-3 text-2xl sm:text-3xl font-bold font-serif-title text-white">Contact TerroirTrail</h1>
                <p className="mt-3 max-w-2xl text-xs sm:text-sm text-stone-300 leading-relaxed">
                  Questions, listing corrections, producer enquiries or collaboration ideas are welcome. For current visit times, prices or same-day arrangements, contact the producer directly through the official details on its listing. A published listing does not by itself imply a commercial partnership with TerroirTrail.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-4">
                <div className="space-y-4">
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="group block p-5 rounded-2xl bg-stone-900 border border-white/10 hover:border-amber-500/40 transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase tracking-wider text-stone-500 font-bold">Email</div>
                        <div className="mt-1 text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition break-all">{CONTACT_EMAIL}</div>
                        <div className="mt-1 text-[11px] text-stone-400">Questions, corrections, producer enquiries and collaborations.</div>
                      </div>
                    </div>
                  </a>

                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="group block p-5 rounded-2xl bg-stone-900 border border-white/10 hover:border-amber-500/40 transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 text-base font-black">
                        @
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-stone-500 font-bold">Instagram</div>
                        <div className="mt-1 text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition">@TERROIRTRAIL</div>
                        <div className="mt-1 text-[11px] text-stone-400">Follow the project and message us on Instagram.</div>
                      </div>
                    </div>
                  </a>

                  <a
                    href={`mailto:${CONTACT_EMAIL}?subject=Producer%20listing%20enquiry%20%E2%80%94%20TerroirTrail`}
                    className="group block p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-stone-900 border border-amber-500/25 hover:border-amber-400/50 transition"
                  >
                    <div className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">For producers</div>
                    <div className="mt-1 text-base font-bold text-white group-hover:text-amber-300 transition">Are you a producer who belongs on TerroirTrail?</div>
                    <p className="mt-2 text-[11px] leading-relaxed text-stone-400">
                      Tell us who you are, where you are based and what you make. We review every listing independently.
                    </p>
                    <div className="mt-3 text-xs font-bold text-amber-300">{CONTACT_EMAIL}</div>
                    <div className="mt-1 text-[10px] text-stone-500">An enquiry does not automatically imply inclusion or a commercial partnership.</div>
                  </a>

                  {(onOpenProducerPortal || onOpenAuth) && (
                    <div className="p-5 rounded-2xl bg-stone-900 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-bold text-white">Are you a listed producer?</div>
                        <p className="mt-1 text-[11px] text-stone-400">Use the Host Portal to claim or manage your producer presence.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAction('producer_portal')}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-sm transition cursor-pointer shrink-0"
                      >
                        Host Portal
                      </button>
                    </div>
                  )}
                </div>

                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="group p-4 rounded-2xl bg-stone-900 border border-white/10 text-center self-start"
                  aria-label="Open TerroirTrail on Instagram"
                >
                  <div className="rounded-2xl bg-white p-3 shadow-lg transition group-hover:scale-[1.01]">
                    <img
                      src="/terroirtrail-instagram-qr.svg"
                      alt="QR code for TerroirTrail on Instagram"
                      className="w-full h-auto"
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-bold text-stone-200 group-hover:text-amber-300 transition">
                    <span className="text-sm font-black">@</span>
                    @TERROIRTRAIL
                  </div>
                  <div className="mt-1 text-[10px] text-stone-500">Scan to open Instagram</div>
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="px-5 sm:px-6 py-2.5 bg-stone-900 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-stone-500 shrink-0">
          <span>Copyright © 2026 TerroirTrail · Independent agritourism discovery</span>
          {onOpenLegal && (
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => { onClose(); onOpenLegal('privacy'); }} className="hover:text-amber-400 underline transition cursor-pointer text-stone-400">Privacy</button>
              <span>·</span>
              <button type="button" onClick={() => { onClose(); onOpenLegal('terms'); }} className="hover:text-amber-400 underline transition cursor-pointer text-stone-400">Terms</button>
              <span>·</span>
              <button type="button" onClick={() => { onClose(); onOpenLegal('licenses'); }} className="hover:text-amber-400 underline transition cursor-pointer text-stone-400">Licenses</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({
  active,
  onClick,
  icon,
  label,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold rounded-xl transition cursor-pointer ${
      active ? 'bg-amber-500 text-stone-950 shadow-md' : 'text-stone-400 hover:text-white'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const Metric: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="p-3 rounded-2xl bg-stone-950/60 border border-white/10 text-center">
    <div className="text-amber-400 text-sm sm:text-base font-mono font-bold break-words">{value}</div>
    <div className="text-[9px] text-stone-400 uppercase font-semibold tracking-wider mt-1">{label}</div>
  </div>
);

const Principle: React.FC<{ icon: React.ReactNode; title: string; text: string }> = ({ icon, title, text }) => (
  <div className="p-5 rounded-2xl bg-stone-900 border border-white/10 space-y-2.5">
    <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
      {icon}
    </div>
    <h3 className="font-bold text-white text-sm">{title}</h3>
    <p className="text-xs text-stone-300 leading-relaxed">{text}</p>
  </div>
);
