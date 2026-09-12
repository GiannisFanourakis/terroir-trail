import React, { useState, useMemo } from 'react';
import { 
  X, Compass, Wine, Award, ShieldCheck, Heart, 
  Sparkles, CheckCircle2, ChevronDown, ChevronUp, Search, 
  Building2, Car, Globe, HelpCircle, BookOpen, Crown, 
  Users, ExternalLink, ArrowRight, Check
} from 'lucide-react';

interface AboutFaqModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'about' | 'faq';
  onOpenLoops?: () => void;
  onOpenExperiences?: () => void;
  onOpenAuth?: (role?: 'traveler' | 'producer') => void;
  onOpenExplorerPass?: () => void;
  onOpenProducerPortal?: () => void;
  onOpenLegal?: (tab?: 'privacy' | 'terms' | 'licenses') => void;
}

interface FaqItem {
  id: string;
  category: 'about' | 'tastings' | 'passport' | 'logistics' | 'producers';
  categoryLabel: string;
  question: string;
  answer: string;
  highlight?: string;
  actionText?: string;
  actionType?: 'loops' | 'experiences' | 'producer_portal' | 'explorer_pass' | 'auth' | 'auth_traveler';
}

const FAQ_DATA: FaqItem[] = [
  // 1. About & Curation
  {
    id: 'what-is-terroirtrail',
    category: 'about',
    categoryLabel: 'About & Curation',
    question: 'What is TerroirTrail and how is it different from Tripadvisor or Google Maps?',
    answer: 'TerroirTrail focuses on curated independent and small-scale producers. Listings are assembled from available producer information and may be updated as producers claim and verify their profiles. The platform highlights authentic hospitality, low-intervention methods, and estate-bottled craftsmanship rather than commercial mass-tourism stops.',
    highlight: 'Curated focus on independent makers and authentic agritourism.',
    actionText: 'View Explorer Pass',
    actionType: 'explorer_pass',
  },
  {
    id: 'how-producers-selected',
    category: 'about',
    categoryLabel: 'About & Curation',
    question: 'How do you choose which producers make it onto TerroirTrail?',
    answer: 'TerroirTrail focuses on curated independent and small-scale producers. Listings are assembled from available producer information and may be updated as producers claim and verify their profiles. We look for independent ownership, estate-grown or local sourcing, low-intervention agricultural practices, and authentic on-site hospitality.',
  },
  {
    id: 'regions-terroir-coverage',
    category: 'about',
    categoryLabel: 'About & Curation',
    question: 'Which regions and terroirs does TerroirTrail cover?',
    answer: 'TerroirTrail is a pan-Mediterranean and European agritourism discovery platform. We currently feature curated independent wine roads, olive mills, and craft farmsteads across Crete, Santorini, the Peloponnese (Nemea), Northern Greece, and Tuscany (Italy), with planned expansions across additional European regions.',
  },

  // 2. Tastings & Visiting
  {
    id: 'do-i-need-to-book',
    category: 'tastings',
    categoryLabel: 'Tastings & Visits',
    question: 'Do I need to book my tastings in advance?',
    answer: 'For most boutique estates, yes. Unlike commercial visitor centers with shifts of staff, independent producers and artisans are often actively in the vineyards, barrel cellar, or milking barns. TerroirTrail sends a reservation inquiry directly to the producer. Your visit is confirmed only after the host accepts it.',
    highlight: 'Direct reservation inquiries sent straight to the estate with zero booking markup.',
  },
  {
    id: 'tasting-costs',
    category: 'tastings',
    categoryLabel: 'Tastings & Visits',
    question: 'How much do tastings cost?',
    answer: 'Tasting flights typically range from €10 to €35 per person depending on the tier. A standard flight includes 4–5 estate wines with rusks and olive oil; reserve and premium flights include library vintages, barrel samples, and full artisanal sheep graviera pairings. TerroirTrail charges 0% commission on direct reservation inquiries.',
  },
  {
    id: 'children-and-accessibility',
    category: 'tastings',
    categoryLabel: 'Tastings & Visits',
    question: 'Are estates family-friendly and accessible?',
    answer: 'Yes! Most farmsteads, mountain dairies, and olive estates are wonderful for families, featuring shaded outdoor pergolas, farm animals, and gardens. Each producer card clearly displays accessibility and family-friendly badges. Non-alcoholic grape must juice, herbal infusions, and honey tastings are happily served to children and non-drinkers.',
  },
  {
    id: 'how-many-stops-per-day',
    category: 'tastings',
    categoryLabel: 'Tastings & Visits',
    question: 'How many estates can I visit in one day?',
    answer: 'We recommend 2 to 3 stops maximum per day to truly absorb the landscape, converse with the hosts, and enjoy a relaxed village taverna lunch. Our curated "Day-Trip Loops" (Circuits) are specifically calculated by driving elevation and route logistics so you never feel rushed.',
    actionText: 'View Curated Day-Trip Circuits',
    actionType: 'loops',
  },

  // 3. Terroir Passport & Explorer Pass
  {
    id: 'what-is-passport',
    category: 'passport',
    categoryLabel: 'Passport & Pass',
    question: 'What is the Terroir Digital Passport?',
    answer: 'The Terroir Passport is your personal agritourism journal. As you explore estates, you collect verified digital cellar stamps, log sommelier tasting notes (vintage, nose, palate, pairings), and unlock milestone badges—from "Crete Explorer" to "Master of Mountain Terroir". Your journal stays permanently saved in your traveler account.',
  },
  {
    id: 'what-is-vip-explorer-pass',
    category: 'passport',
    categoryLabel: 'Passport & Pass',
    question: 'What is the Explorer Pass?',
    answer: 'The Explorer Pass (€14.99 for 14 days or €29.99 for an annual pass) provides a digital pass entitlement with a server-verified QR code and cross-device account synchronization. Passholders can present their QR code where available during partner pilots for cellar-door privileges, and keep their verified visit record synced across devices.',
    highlight: 'Server-verified digital pass with QR verification and privileges where available during partner pilots.',
    actionText: 'View Explorer Pass',
    actionType: 'explorer_pass',
  },
  {
    id: 'do-i-need-account-for-vip-pass',
    category: 'passport',
    categoryLabel: 'Passport & Pass',
    question: 'Do I need an account to get the Explorer Pass? Does logging in automatically give me the pass?',
    answer: 'Accounts on TerroirTrail are free. Creating an account does not automatically grant you an Explorer Pass. Free accounts can explore the map directory, view producer details, and submit direct visit inquiries. An authenticated account is required to link an Explorer Pass so your server-verified QR pass and account entitlements can be synchronized across your devices.',
    highlight: 'Accounts are free. The Explorer Pass is an optional entitlement that links to your account.',
    actionText: 'Sign In / Free Account',
    actionType: 'auth_traveler',
  },

  // 4. Logistics & Delivery
  {
    id: 'chauffeur-service',
    category: 'logistics',
    categoryLabel: 'Artisan Delivery & Logistics',
    question: 'Can I hire a private chauffeur or book vehicle routes?',
    answer: 'Official private chauffeur partnerships and guided vehicle routes are currently in development as we establish agreements with certified passenger transport operators and luxury vehicle dealerships. In the meantime, each estate listing includes verified GPS coordinates and navigation links so travelers can easily plan their journey with a designated driver.',
  },
  {
    id: 'international-wine-shipping',
    category: 'logistics',
    categoryLabel: 'Chauffeurs & Delivery',
    question: 'Can I ship wine bottles back to my home country?',
    answer: 'International bottle shipping is not currently offered through TerroirTrail. Some producers may offer their own shipping or courier arrangements; check directly with each producer during your visit or contact them through their listed details.',
  },

  // 5. For Producers & Estate Hosts
  {
    id: 'how-to-join-as-producer',
    category: 'producers',
    categoryLabel: 'For Estate Hosts',
    question: 'I own a family winery, craft brewery, or farmstead. How can I join TerroirTrail?',
    answer: 'We warmly welcome independent producers who share our focus on authentic agritourism and craftsmanship. You can apply or claim an existing estate listing directly through our Host Portal. Producer applications and claimed listings are reviewed before activation.',
    highlight: 'Curated exclusively for independent agricultural producers and artisanal makers.',
    actionText: 'Open Host Portal',
    actionType: 'producer_portal',
  },
  {
    id: 'producer-commission-fee',
    category: 'producers',
    categoryLabel: 'For Estate Hosts',
    question: 'Does TerroirTrail charge a commission on tasting bookings?',
    answer: 'Zero booking commissions are charged on direct reservation requests. Independent producers retain all direct tasting and cellar door sales. Estate hosts set their own visiting terms, hours, and tasting prices.',
    highlight: '0% commission on direct reservation requests.',
  },
  {
    id: 'host-portal-features',
    category: 'producers',
    categoryLabel: 'For Estate Hosts',
    question: 'What tools and privileges are included in the Host Portal?',
    answer: 'The Host Portal provides estate hosts with tools to: (1) Manage incoming guest reservation inquiries at 0% commission; (2) Update seasonal opening hours and tasting flight menus; (3) Publish live Harvest & Vintage Bulletins; (4) Link direct online bottle shop sales; (5) Upgrade to Verified Host Pro (€199/yr pilot) with Pro Estate badge styling, direct bottle shop links, and planned pilot features including priority directory placement.',
    highlight: 'Host Pro pilot membership (€199/yr) includes Pro Estate badge styling, bottle shop links, and planned pilot features.',
    actionText: 'Open Host Portal',
    actionType: 'producer_portal',
  },
  {
    id: 'host-pro-tax-deductible',
    category: 'producers',
    categoryLabel: 'For Estate Hosts',
    question: 'Is the Verified Host Pro subscription tax-deductible?',
    answer: 'Business tax treatment depends on your jurisdiction and business circumstances. Billing and tax documentation will depend on the final Host Pro payment setup. Consult your accountant or tax adviser regarding tax treatment.',
    highlight: 'Tax and billing treatment depends on final payment setup. Consult your accountant or tax adviser.',
  },
  {
    id: 'how-payments-processed',
    category: 'producers',
    categoryLabel: 'Payments & Security',
    question: 'How are payments processed for Host Pro and Explorer Passes?',
    answer: 'Payments are handled securely by Stripe Checkout. Available payment methods are shown by Stripe during checkout. TerroirTrail does not store card details.',
    highlight: 'Secure checkout handled by Stripe Checkout.',
  },
];

export const AboutFaqModal: React.FC<AboutFaqModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'about',
  onOpenLoops,
  onOpenExperiences,
  onOpenAuth,
  onOpenExplorerPass,
  onOpenProducerPortal,
  onOpenLegal,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'about' | 'faq'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  // Categories list
  const categories = [
    { id: 'all', label: 'All Questions' },
    { id: 'about', label: '🌍 About & Curation' },
    { id: 'tastings', label: '🍷 Tastings & Visits' },
    { id: 'passport', label: '🎖️ Passport & Pass' },
    { id: 'logistics', label: '📦 Delivery & Logistics' },
    { id: 'producers', label: '🏛️ For Estate Hosts' },
  ];

  // Filtered FAQs
  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((faq) => {
      const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        faq.question.toLowerCase().includes(q) || 
        faq.answer.toLowerCase().includes(q) ||
        faq.categoryLabel.toLowerCase().includes(q) ||
        (faq.highlight && faq.highlight.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const toggleAccordion = (id: string) => {
    setExpandedFaqId((prev) => (prev === id ? null : id));
  };

  const handleAction = (type?: string) => {
    onClose();
    if (type === 'loops' && onOpenLoops) onOpenLoops();
    if (type === 'experiences' && onOpenExperiences) onOpenExperiences();
    if (type === 'explorer_pass' && onOpenExplorerPass) onOpenExplorerPass();
    if (type === 'producer_portal' && onOpenProducerPortal) onOpenProducerPortal();
    if (type === 'auth' && onOpenAuth) onOpenAuth('producer');
    if (type === 'auth_traveler' && onOpenAuth) onOpenAuth('traveler');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-4xl bg-stone-950 text-stone-100 rounded-3xl shadow-2xl border border-white/15 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* ========================================================= */}
        {/* MODAL HEADER WITH TABS & CLOSE BUTTON                      */}
        {/* ========================================================= */}
        <div className="px-5 sm:px-6 py-4 bg-stone-900 border-b border-white/10 shrink-0 flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 shrink-0 flex items-center justify-center">
              <img src="/logo.png" alt="TerroirTrail" className="w-full h-full object-contain drop-shadow-md" />
            </div>
            <div>
              <h2 className="font-serif-title text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Terroir<span className="text-amber-400 font-sans font-light">Trail</span>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-400 font-bold border border-amber-400/30">
                  Guide & Story
                </span>
              </h2>
              <p className="text-[11px] text-stone-400 hidden sm:block">
                Celebrating independent wineries, craft breweries, rakokazana & mountain dairies
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1 p-1 bg-stone-950 rounded-2xl border border-white/10">
            <button
              onClick={() => setActiveTab('about')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                activeTab === 'about'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>About Us</span>
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                activeTab === 'faq'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>FAQ</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition border border-white/5 cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ========================================================= */}
        {/* MODAL BODY (SCROLLABLE CONTENT)                            */}
        {/* ========================================================= */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-8 text-stone-200">
          
          {/* ========================================================= */}
          {/* TAB 1: ABOUT US & STORY                                   */}
          {/* ========================================================= */}
          {activeTab === 'about' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              
              {/* Hero Banner */}
              <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-stone-900 to-stone-950 p-6 sm:p-8">
                <div className="max-w-2xl space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>The Mediterranean Terroir Revolution</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold font-serif-title text-white tracking-tight leading-snug">
                    Reconnecting Conscious Travelers with Real Earth, Living Wine & True Artisans.
                  </h1>
                  <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                    TerroirTrail was founded on a simple conviction: the true soul of the Mediterranean is not found in industrial cruise ports or mass-bus tasting factories. It lives high on limestone slopes in ungrafted pre-phylloxera vineyards, inside smoky village copper stills during autumn rakokazana, and in wild mountain dairies where shepherds craft raw milk graviera by hand.
                  </p>
                </div>

                {/* Key Metrics Pill Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-6 mt-6 border-t border-white/10">
                  <div className="p-3 rounded-2xl bg-stone-950/60 border border-white/10 text-center">
                    <div className="text-amber-400 text-lg sm:text-xl font-mono font-bold">58+</div>
                    <div className="text-[10px] text-stone-400 uppercase font-semibold tracking-wider">Featured Producers</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-stone-950/60 border border-white/10 text-center">
                    <div className="text-emerald-400 text-lg sm:text-xl font-mono font-bold">0%</div>
                    <div className="text-[10px] text-stone-400 uppercase font-semibold tracking-wider">Booking Commission</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-stone-950/60 border border-white/10 text-center">
                    <div className="text-rose-400 text-lg sm:text-xl font-mono font-bold">30+</div>
                    <div className="text-[10px] text-stone-400 uppercase font-semibold tracking-wider">Native Cultivars</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-stone-950/60 border border-white/10 text-center">
                    <div className="text-sky-400 text-lg sm:text-xl font-mono font-bold">Artisan</div>
                    <div className="text-[10px] text-stone-400 uppercase font-semibold tracking-wider">Independent Makers & Artisans</div>
                  </div>
                </div>
              </div>

              {/* The Four Pillars of TerroirTrail */}
              <div className="space-y-4">
                <div className="text-center sm:text-left">
                  <h3 className="text-lg sm:text-xl font-bold font-serif-title text-white">
                    The Four Pillars of TerroirTrail
                  </h3>
                  <p className="text-xs text-stone-400">
                    How we curate, protect, and celebrate genuine agritourism
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Pillar 1 */}
                  <div className="p-5 rounded-2xl bg-stone-900 border border-white/10 hover:border-amber-500/40 transition space-y-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-white text-sm">1. Focused Independent Curation</h4>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      TerroirTrail focuses on curated independent and small-scale producers. Listings are assembled from available producer information and may be updated as producers claim and verify their profiles.
                    </p>
                  </div>

                  {/* Pillar 2 */}
                  <div className="p-5 rounded-2xl bg-stone-900 border border-white/10 hover:border-amber-500/40 transition space-y-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                      <Compass className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-white text-sm">2. Smart Day-Trip Circuits</h4>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      Instead of disconnected pins on a generic map, we curate seamless scenic circuits pairing mountain wineries with coastal craft breweries, ancient olive groves, and authentic village tavernas.
                    </p>
                  </div>

                  {/* Pillar 3 */}
                  <div className="p-5 rounded-2xl bg-stone-900 border border-white/10 hover:border-amber-500/40 transition space-y-2.5">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                      <Award className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-white text-sm">3. The Digital Terroir Passport</h4>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      Transform wine and agritourism into an inspiring personal voyage. Collect verified digital cellar stamps, save professional sommelier tasting journals, and track your discovery of rare indigenous grape varieties.
                    </p>
                  </div>

                  {/* Pillar 4 */}
                  <div className="p-5 rounded-2xl bg-stone-900 border border-white/10 hover:border-amber-500/40 transition space-y-2.5">
                    <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-white text-sm">4. Host Portal & 0% Commission</h4>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      Middlemen booking platforms extract up to 30% of artisan revenue. TerroirTrail charges 0% booking commission on direct reservation inquiries. Through the Host Portal, producers manage inquiries, update opening hours, and publish harvest bulletins.
                    </p>
                  </div>

                </div>
              </div>

              {/* The Terroir Manifesto */}
              <div className="p-6 rounded-3xl bg-stone-900/70 border border-white/10 space-y-4">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <Wine className="w-4 h-4" />
                  <span>The Mediterranean Terroir Manifesto</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <div className="font-bold text-white text-sm flex items-center gap-1.5">
                      <span className="text-amber-400">🍇</span> Ancient Varieties
                    </div>
                    <p className="text-stone-300 leading-relaxed">
                      We champion endangered indigenous cultivars: Vidiano, Liatiko, Romeiko, Assyrtiko, Mandilaria, Agiorgitiko, and Sangiovese. These grapes tell 4,000-year stories that cannot be replicated anywhere else on earth.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="font-bold text-white text-sm flex items-center gap-1.5">
                      <span className="text-emerald-400">🌿</span> Living Soils
                    </div>
                    <p className="text-stone-300 leading-relaxed">
                      Healthy vines require living soil microbiology. We spotlight estates practicing certified organic, biodynamic, dry-farmed, and regenerative viticulture that nourishes the earth for future generations.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="font-bold text-white text-sm flex items-center gap-1.5">
                      <span className="text-sky-400">🤝</span> Direct Human Connection
                    </div>
                    <p className="text-stone-300 leading-relaxed">
                      Wine and food taste infinitely better when you pour a glass across the table from the farmer who pruned the winter vines. We build direct bridges between mindful travelers and rural families.
                    </p>
                  </div>
                </div>
              </div>

              {/* Removing the Fence: From Greece to Europe */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/20 border border-amber-500/20 space-y-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-amber-400" />
                  <h4 className="font-bold text-white text-sm">Expanding European Terroir</h4>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  From the sun-drenched terraced vineyards of Crete and the volcanic caldera of Santorini, to the rolling hills and ancient olive groves of Tuscany, Italy, TerroirTrail connects you directly with the soul of Mediterranean and European agritourism. With ongoing expansions across Portugal, Spain, France, and Slovenia, TerroirTrail is the definitive international home for independent artisanal discovery.
                </p>
              </div>

              {/* Call to Action Bar */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <div className="text-xs text-stone-300 text-center sm:text-left">
                  <span className="font-bold text-white">Ready to begin your journey?</span>
                  <span className="hidden sm:inline"> Discover authentic artisan estates or explore our FAQ.</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('faq')}
                    className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-850 text-stone-200 border border-white/15 text-xs font-bold transition cursor-pointer"
                  >
                    Read FAQ
                  </button>
                  {onOpenLoops && (
                    <button
                      onClick={() => handleAction('loops')}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-md transition transform active:scale-95 cursor-pointer flex items-center gap-1"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Explore Circuits</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: FREQUENTLY ASKED QUESTIONS (FAQ)                    */}
          {/* ========================================================= */}
          {activeTab === 'faq' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Search & Category Filter */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search questions (e.g., booking, Explorer Pass, Host Portal, tax deduction, Stripe)..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-900 border border-white/15 text-white placeholder-stone-400 text-xs focus:outline-none focus:border-amber-400/80 transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white text-xs cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                        selectedCategory === cat.id
                          ? 'bg-amber-500 text-stone-950 shadow-sm'
                          : 'bg-stone-900 hover:bg-stone-850 text-stone-300 border border-white/10'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* FAQ Accordion List */}
              <div className="space-y-2.5">
                {filteredFaqs.length === 0 ? (
                  <div className="p-8 text-center bg-stone-900/50 rounded-2xl border border-white/10 space-y-2">
                    <HelpCircle className="w-8 h-8 text-stone-500 mx-auto" />
                    <p className="text-sm font-bold text-white">No matching questions found</p>
                    <p className="text-xs text-stone-400">
                      Try searching with different keywords or switch back to "All Questions".
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                      }}
                      className="mt-2 px-3 py-1.5 rounded-xl bg-stone-800 text-amber-300 text-xs font-bold"
                    >
                      Reset Filter
                    </button>
                  </div>
                ) : (
                  filteredFaqs.map((faq) => {
                    const isExpanded = expandedFaqId === faq.id;
                    return (
                      <div
                        key={faq.id}
                        className={`rounded-2xl border transition-all duration-150 overflow-hidden ${
                          isExpanded
                            ? 'bg-stone-900 border-amber-500/40 shadow-lg'
                            : 'bg-stone-900/60 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <button
                          onClick={() => toggleAccordion(faq.id)}
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
                          <div className="px-4 pb-4 pt-1 text-xs text-stone-300 space-y-3 border-t border-white/5 animate-in fade-in duration-150">
                            <p className="leading-relaxed">{faq.answer}</p>
                            
                            {faq.highlight && (
                              <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[11px] font-medium">
                                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                                <span>{faq.highlight}</span>
                              </div>
                            )}

                            {faq.actionText && (
                              <div className="pt-1">
                                <button
                                  onClick={() => handleAction(faq.actionType)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-bold transition border border-white/10 cursor-pointer"
                                >
                                  <span>{faq.actionText}</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Still have questions? Card */}
              <div className="p-5 rounded-2xl bg-stone-900 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div>
                  <h4 className="text-xs font-bold text-white">Still have questions or need personalized advice?</h4>
                  <p className="text-[11px] text-stone-400">
                    Our team of sommeliers and local agritourism specialists is always happy to help.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href="mailto:terroirtrail@gmail.com"
                    className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 border border-white/15 text-xs font-bold transition"
                  >
                    Email Concierge
                  </a>
                  {onOpenProducerPortal ? (
                    <button
                      onClick={() => handleAction('producer_portal')}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-sm transition cursor-pointer"
                    >
                      Host Portal
                    </button>
                  ) : onOpenAuth ? (
                    <button
                      onClick={() => handleAction('auth')}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-sm transition cursor-pointer"
                    >
                      Host Portal
                    </button>
                  ) : null}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer Legal Strip */}
        <div className="px-5 sm:px-6 py-2.5 bg-stone-900 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-stone-500 shrink-0">
          <span>Copyright © 2026 TerroirTrail · Fair-Trade Discovery</span>
          {onOpenLegal && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLegal('privacy');
                }}
                className="hover:text-amber-400 underline transition cursor-pointer text-stone-400"
              >
                Privacy Notice (GDPR)
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLegal('terms');
                }}
                className="hover:text-amber-400 underline transition cursor-pointer text-stone-400"
              >
                Terms of Service
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLegal('licenses');
                }}
                className="hover:text-amber-400 underline transition cursor-pointer text-stone-400"
              >
                Licenses
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
