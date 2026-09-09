import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Scale, ExternalLink, Mail, CheckCircle2, Globe, Heart } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'terms' | 'licenses';
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'privacy',
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'licenses'>(initialTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-3xl bg-stone-950 text-stone-100 rounded-3xl shadow-2xl border border-white/15 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-stone-900 border-b border-white/10 shrink-0 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif-title text-base sm:text-lg font-bold text-white">
                Legal Notice & Transparency
              </h2>
              <p className="text-[11px] text-stone-400">
                TerroirTrail Privacy Notice, Terms of Service & Open-Source Licenses
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="hidden sm:flex items-center gap-1 p-1 bg-stone-950 rounded-2xl border border-white/10 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('privacy')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'privacy'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Privacy (GDPR)</span>
            </button>
            <button
              onClick={() => setActiveTab('terms')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'terms'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Terms of Service</span>
            </button>
            <button
              onClick={() => setActiveTab('licenses')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'licenses'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Licenses</span>
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

        {/* Mobile Tab Selector */}
        <div className="sm:hidden flex border-b border-white/10 bg-stone-900/60 p-1.5 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 py-1.5 rounded-lg text-center ${
              activeTab === 'privacy' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400'
            }`}
          >
            Privacy
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex-1 py-1.5 rounded-lg text-center ${
              activeTab === 'terms' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400'
            }`}
          >
            Terms
          </button>
          <button
            onClick={() => setActiveTab('licenses')}
            className={`flex-1 py-1.5 rounded-lg text-center ${
              activeTab === 'licenses' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400'
            }`}
          >
            Licenses
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-xs text-stone-300 leading-relaxed">
          
          {/* ========================================================= */}
          {/* TAB 1: PRIVACY NOTICE (GDPR)                              */}
          {/* ========================================================= */}
          {activeTab === 'privacy' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="font-bold text-white text-sm">GDPR Compliance & Zero-Data-Selling Guarantee</h3>
                  <p className="text-stone-300 text-[11px] leading-relaxed">
                    TerroirTrail complies strictly with the European Union General Data Protection Regulation (EU 2016/679). We do not sell, rent, or trade your personal data to data brokers or advertising networks.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-white text-sm mb-1.5">1. Data Controller</h4>
                  <p>
                    TerroirTrail is operated as an independent Mediterranean agritourism platform. For any inquiries regarding personal data processing, privacy rights, or data deletion requests, contact our Data Protection Officer at: <a href="mailto:privacy@terroirtrail.com" className="text-amber-400 underline font-mono">privacy@terroirtrail.com</a>.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-white text-sm mb-1.5">2. Information We Collect</h4>
                  <ul className="list-disc pl-5 space-y-1 text-stone-300">
                    <li><strong className="text-white">Account Information:</strong> Name, email address, avatar photo, and authentication identifiers provided during Google OAuth, Apple Sign In, or email signup.</li>
                    <li><strong className="text-white">Tasting Bookings:</strong> Traveler name, contact email, phone number, party size, and tasting preferences shared with the specific host you book.</li>
                    <li><strong className="text-white">Terroir Passport:</strong> Digital stamp check-ins, personal tasting notes, and bookmarked favorite estates saved to your user profile.</li>
                    <li><strong className="text-white">Producer & Host Data:</strong> Winery/estate business name, physical location, opening hours, contact details, and tasting flight offerings.</li>
                    <li><strong className="text-white">Geospatial Coordinates:</strong> Real-time latitude/longitude provided only when you click "Locate Me" to center the map. We never track your background location.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-white text-sm mb-1.5">3. Lawful Basis for Processing (GDPR Art. 6)</h4>
                  <p>
                    We process your information on the basis of: (a) <em>Contractual Performance</em> to honor tasting reservations and deliveries; (b) <em>Explicit Consent</em> for accounts and tasting notes; and (c) <em>Legitimate Interests</em> to prevent fraud and ensure platform stability.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-white text-sm mb-1.5">4. Sub-processors & Infrastructure</h4>
                  <p className="mb-2">
                    We rely exclusively on certified, enterprise-grade cloud providers:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                    <div className="p-3 rounded-xl bg-stone-900 border border-white/10">
                      <div className="font-bold text-white">Supabase Inc.</div>
                      <div className="text-stone-400">Database & storage in EU/Frankfurt data centers (SOC2 / ISO 27001).</div>
                    </div>
                    <div className="p-3 rounded-xl bg-stone-900 border border-white/10">
                      <div className="font-bold text-white">Google & Apple OAuth</div>
                      <div className="text-stone-400">Encrypted token authentication for seamless single sign-on.</div>
                    </div>
                    <div className="p-3 rounded-xl bg-stone-900 border border-white/10">
                      <div className="font-bold text-white">CartoDB & OSM</div>
                      <div className="text-stone-400">OpenStreetMap basemap tiles delivered with zero tracking cookies.</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-white text-sm mb-1.5">5. Your Legal Rights</h4>
                  <p>
                    Under the GDPR, you have the right to access, rectify, or erase your personal data ("Right to be Forgotten"), restrict processing, and receive your tasting journal in a portable JSON format. You can delete your account at any time.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: TERMS OF SERVICE                                    */}
          {/* ========================================================= */}
          {activeTab === 'terms' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              <div className="p-4 rounded-2xl bg-stone-900 border border-white/10 flex items-start gap-3">
                <FileText className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="font-bold text-white text-sm">Platform Terms & Agritourism Code of Conduct</h3>
                  <p className="text-stone-400 text-[11px] leading-relaxed">
                    TerroirTrail connects travelers with independent family producers. We do not charge commission on tastings, and visits take place directly between visitors and independent estate hosts.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-white text-sm mb-1.5">1. Nature of the Service</h4>
                  <p>
                    TerroirTrail facilitates direct discovery and reservations between conscious travelers and registered agricultural producers. TerroirTrail is not a winery, brewery, distillery, or transport carrier. All tasting flights, cellar visits, and meals are provided directly by independent hosts.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-white text-sm mb-1.5">2. Legal Age & Responsible Drinking</h4>
                  <p>
                    You must be at least <strong className="text-amber-400">18 years of age</strong> (or legal drinking age in the host country) to reserve tastings or consume alcoholic beverages. Driving under the influence of alcohol is illegal and dangerous. Visitors exploring rural mountain roads are strongly urged to designate a sober driver or book a private certified chauffeur.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-white text-sm mb-1.5">3. 0% Commission & Booking Courtesy</h4>
                  <p>
                    TerroirTrail takes <strong className="text-emerald-400">0% commission</strong> from winemakers and farmers. In return, visitors agree to treat estate hosts with respect and courtesy. If your schedule changes, please cancel your reservation at least 24 hours in advance via "My Bookings" so the artisan can release your table.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-white text-sm mb-1.5">4. Producer Obligations</h4>
                  <p>
                    Estate owners agree to provide truthful descriptions, adhere to local health and viticultural standards, and maintain authentic hospitality for all guests.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-white text-sm mb-1.5">5. Limitation of Liability & Governing Law</h4>
                  <p>
                    TerroirTrail is not liable for road conditions on mountain tracks, personal injury during estate visits, or individual allergic reactions. These terms are governed by the laws of the Hellenic Republic and the European Union.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: LICENSES & ATTRIBUTIONS                            */}
          {/* ========================================================= */}
          {activeTab === 'licenses' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              <div className="p-4 rounded-2xl bg-stone-900 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Scale className="w-4 h-4 text-amber-400" />
                  <span>TerroirTrail Copyright Notice</span>
                </div>
                <p className="text-[11px] text-stone-300">
                  Copyright &copy; 2026 TerroirTrail. All rights reserved. The TerroirTrail brand, logos, application code, and curated databases are proprietary intellectual property.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-white text-sm">Open-Source Software & Font Attributions</h4>
                <p className="text-[11px] text-stone-400">
                  TerroirTrail is built with gratitude upon the following open-source frameworks and typography:
                </p>

                <div className="space-y-2">
                  {[
                    { name: 'React & React-DOM', author: 'Meta Platforms, Inc.', license: 'MIT License' },
                    { name: 'Vite', author: 'Evan You & Vite Contributors', license: 'MIT License' },
                    { name: 'Tailwind CSS', author: 'Tailwind Labs, Inc.', license: 'MIT License' },
                    { name: 'Leaflet', author: 'Vladimir Agafonkin', license: 'BSD 2-Clause License' },
                    { name: 'Lucide React', author: 'Lucide Contributors', license: 'ISC License' },
                    { name: 'Supabase JS', author: 'Supabase, Inc.', license: 'MIT / Apache 2.0' },
                    { name: 'Firebase Web SDK', author: 'Google LLC', license: 'Apache 2.0' },
                    { name: 'Plus Jakarta Sans', author: 'Gumpita Rahayu / Tokotype', license: 'SIL Open Font License 1.1' },
                    { name: 'Playfair Display', author: 'Claus Eggers Sørensen', license: 'SIL Open Font License 1.1' },
                  ].map((lib) => (
                    <div key={lib.name} className="p-3 rounded-xl bg-stone-900/60 border border-white/10 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">{lib.name}</div>
                        <div className="text-[10px] text-stone-400">{lib.author}</div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-800 text-amber-300 font-semibold border border-white/10">
                        {lib.license}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-3.5 rounded-xl bg-stone-900 border border-white/10 text-[11px] text-stone-400 space-y-1">
                  <div className="font-bold text-white">Geospatial Data Credits:</div>
                  <div>* OpenStreetMap: &copy; OpenStreetMap contributors (ODbL).</div>
                  <div>* CARTO Basemaps: &copy; CARTO &copy; OpenStreetMap.</div>
                  <div>* Esri World Topo: Tiles &copy; Esri, DeLorme, NAVTEQ, USGS.</div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-900 border-t border-white/10 shrink-0 flex items-center justify-between text-[11px] text-stone-400">
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>TerroirTrail Legal Operations · Athens, Greece & European Union</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
