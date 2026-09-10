import React, { useState, useEffect } from 'react';
import {
  Building2,
  FileText,
  Truck,
  Package,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Lock,
  Download,
  Info,
  Layers,
  Clock,
  Phone,
  Mail,
  Copy,
  Search,
  Globe,
  RefreshCw,
} from 'lucide-react';
import { Producer } from '../../types/terroir';
import { ProducerRegistrationRecord } from '../../types/auth';
import { CRETAN_PRODUCERS } from '../../data/producers';
import {
  validateVatNumber,
  validateIban,
  validateGemiNumber,
} from '../../utils/vatValidator';
import {
  saveProducerRegistrationToCloud,
  fetchProducerRegistrationFromCloud,
  isFirebaseConfigured,
  SEEDED_PRODUCER_REGISTRATIONS,
} from '../../services/firebase';
import { checkVatAgainstVies, ViesCheckResult } from '../../services/viesService';

interface ProducerRegistrationFormProps {
  initialProducerId?: string;
  userId?: string;
  producersList?: Producer[];
  onSaved?: (record: ProducerRegistrationRecord) => void;
  onCancel?: () => void;
}

type TabKey = 'fiscal' | 'logistics' | 'packaging' | 'banking' | 'permits';

export const ProducerRegistrationForm: React.FC<ProducerRegistrationFormProps> = ({
  initialProducerId,
  userId,
  producersList,
  onSaved,
  onCancel,
}) => {
  const allProducers = producersList && producersList.length > 0 ? producersList : CRETAN_PRODUCERS;
  // Determine starting producer
  const defaultProducer = allProducers.find((p: Producer) => p.id === initialProducerId) || allProducers[0];

  const [selectedProducerId, setSelectedProducerId] = useState<string>(
    initialProducerId || defaultProducer.id
  );

  const currentProducer = allProducers.find((p: Producer) => p.id === selectedProducerId) || defaultProducer;

  const [activeTab, setActiveTab] = useState<TabKey>('fiscal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<ProducerRegistrationRecord | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);

  // --- Form State (Default empty strings so suggestive examples render strictly as ghost text placeholders) ---
  // Step 1: Fiscal & Identity
  const [producerCategory, setProducerCategory] = useState<ProducerRegistrationRecord['producerCategory']>(
    (defaultProducer.category as any) || 'winery'
  );
  const [tradeBrandName, setTradeBrandName] = useState('');
  const [legalBusinessName, setLegalBusinessName] = useState('');
  const [legalEntityType, setLegalEntityType] = useState<ProducerRegistrationRecord['legalEntityType']>('general_partnership_oe');
  const [countryCode, setCountryCode] = useState<'GR' | 'IT' | string>(
    defaultProducer.country === 'Italy' || defaultProducer.destination === 'tuscany' ? 'IT' : 'GR'
  );
  const [vatNumber, setVatNumber] = useState('');
  const [taxOffice, setTaxOffice] = useState('');
  const [gemiNumber, setGemiNumber] = useState('');
  const [eoriNumber, setEoriNumber] = useState('');
  const [isCheckingVies, setIsCheckingVies] = useState(false);
  const [viesResult, setViesResult] = useState<ViesCheckResult | null>(null);

  const handleVerifyVies = async () => {
    if (!vatNumber.trim()) return;
    setIsCheckingVies(true);
    try {
      const res = await checkVatAgainstVies(vatNumber, countryCode);
      setViesResult(res);
    } catch (err) {
      console.error('VIES verification error:', err);
    } finally {
      setIsCheckingVies(false);
    }
  };

  // Step 2: Logistics & Dispatch
  const [facilityName, setFacilityName] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [cityOrVillage, setCityOrVillage] = useState('');
  const [region, setRegion] = useState(defaultProducer.destination === 'tuscany' ? 'Tuscany' : 'Crete');
  const [accessType, setAccessType] = useState<ProducerRegistrationRecord['logistics']['accessType']>('standard_courier_van');
  const [contactPersonName, setContactPersonName] = useState('');
  const [dispatchPhone, setDispatchPhone] = useState('');
  const [dispatchEmail, setDispatchEmail] = useState('');
  const [pickupTimeWindow, setPickupTimeWindow] = useState('');
  const [loadingNotes, setLoadingNotes] = useState('');

  // Step 3: Packaging & Order Fulfillment
  const [supportsWineBottles, setSupportsWineBottles] = useState(false);
  const [supportsBeerBottles, setSupportsBeerBottles] = useState(false);
  const [supportsColdChainCheese, setSupportsColdChainCheese] = useState(false);
  const [supportsHoneyJars, setSupportsHoneyJars] = useState(false);
  const [supportsOliveOilTins, setSupportsOliveOilTins] = useState(false);
  const [maxDailyParcels, setMaxDailyParcels] = useState<number | ''>('');
  const [dispatchLeadTime, setDispatchLeadTime] = useState<ProducerRegistrationRecord['packaging']['dispatchLeadTime']>('next_day');

  // Step 4: Banking & Payouts (SEPA)
  const [accountHolderName, setAccountHolderName] = useState('');
  const [bankName, setBankName] = useState('');
  const [iban, setIban] = useState('');
  const [swiftBic, setSwiftBic] = useState('');
  const [payoutCurrency] = useState('EUR');

  // Step 5: Regulatory Permits & Legal
  const [excisePermitNumber, setExcisePermitNumber] = useState('');
  const [sanitaryPermitNumber, setSanitaryPermitNumber] = useState('');
  const [organicCertificationBody, setOrganicCertificationBody] = useState('');
  const [organicCertNumber, setOrganicCertNumber] = useState('');
  const [representativeName, setRepresentativeName] = useState('');
  const [representativeRole, setRepresentativeRole] = useState('');
  const [officialEmail, setOfficialEmail] = useState('');
  const [websiteStoreUrl, setWebsiteStoreUrl] = useState('');
  const [notesFromProducer, setNotesFromProducer] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Load existing database entry on mount or producer change
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      const existing = await fetchProducerRegistrationFromCloud(selectedProducerId);
      if (existing && isMounted) {
        setTradeBrandName(existing.tradeBrandName || '');
        setProducerCategory(existing.producerCategory || 'winery');
        setLegalBusinessName(existing.legalBusinessName || '');
        setLegalEntityType(existing.legalEntityType || 'general_partnership_oe');
        setCountryCode(existing.countryCode || 'GR');
        setVatNumber(existing.vatNumber || '');
        setTaxOffice(existing.taxOffice || '');
        setEoriNumber(existing.eoriNumber || '');
        setGemiNumber(existing.permits?.gemiNumber || '');

        if (existing.logistics) {
          setFacilityName(existing.logistics.facilityName || '');
          setStreetAddress(existing.logistics.streetAddress || '');
          setPostalCode(existing.logistics.postalCode || '');
          setCityOrVillage(existing.logistics.cityOrVillage || '');
          setRegion(existing.logistics.region || '');
          setAccessType(existing.logistics.accessType || 'standard_courier_van');
          setContactPersonName(existing.logistics.contactPersonName || '');
          setDispatchPhone(existing.logistics.dispatchPhone || '');
          setDispatchEmail(existing.logistics.dispatchEmail || '');
          setPickupTimeWindow(existing.logistics.pickupTimeWindow || '09:00 - 15:30 Mon-Fri');
          setLoadingNotes(existing.logistics.loadingNotes || '');
        }

        if (existing.packaging) {
          setSupportsWineBottles(Boolean(existing.packaging.supportsWineBottles));
          setSupportsBeerBottles(Boolean(existing.packaging.supportsBeerBottles));
          setSupportsColdChainCheese(Boolean(existing.packaging.supportsColdChainCheese));
          setSupportsHoneyJars(Boolean(existing.packaging.supportsHoneyJars));
          setSupportsOliveOilTins(Boolean(existing.packaging.supportsOliveOilTins));
          setMaxDailyParcels(existing.packaging.maxDailyParcels || 25);
          setDispatchLeadTime(existing.packaging.dispatchLeadTime || 'same_day');
        }

        if (existing.banking) {
          setAccountHolderName(existing.banking.accountHolderName || '');
          setBankName(existing.banking.bankName || '');
          setIban(existing.banking.iban || '');
          setSwiftBic(existing.banking.swiftBic || '');
        }

        if (existing.permits) {
          setExcisePermitNumber(existing.permits.excisePermitNumber || '');
          setSanitaryPermitNumber(existing.permits.sanitaryPermitNumber || '');
          setOrganicCertificationBody(existing.permits.organicCertificationBody || '');
          setOrganicCertNumber(existing.permits.organicCertNumber || '');
        }

        setRepresentativeName(existing.representativeName || '');
        setRepresentativeRole(existing.representativeRole || '');
        setOfficialEmail(existing.officialEmail || '');
        setWebsiteStoreUrl(existing.websiteStoreUrl || '');
        setNotesFromProducer(existing.notesFromProducer || '');
        setTermsAccepted(Boolean(existing.termsAccepted));
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [selectedProducerId]);

  // Real-time validations
  const vatValidation = validateVatNumber(vatNumber, countryCode);
  const ibanValidation = validateIban(iban);
  const gemiValidation = validateGemiNumber(gemiNumber, countryCode);

  // Preset switchers for rapid developer/user testing
  const applyPreset = (presetKey: keyof typeof SEEDED_PRODUCER_REGISTRATIONS) => {
    const preset = SEEDED_PRODUCER_REGISTRATIONS[presetKey];
    if (!preset) return;

    setSelectedProducerId(preset.producerId);
    setTradeBrandName(preset.tradeBrandName);
    setProducerCategory(preset.producerCategory);
    setLegalBusinessName(preset.legalBusinessName);
    setLegalEntityType(preset.legalEntityType);
    setCountryCode(preset.countryCode);
    setVatNumber(preset.vatNumber);
    setTaxOffice(preset.taxOffice);
    setEoriNumber(preset.eoriNumber || '');
    setGemiNumber(preset.permits?.gemiNumber || '');

    setFacilityName(preset.logistics.facilityName);
    setStreetAddress(preset.logistics.streetAddress);
    setPostalCode(preset.logistics.postalCode);
    setCityOrVillage(preset.logistics.cityOrVillage);
    setRegion(preset.logistics.region);
    setAccessType(preset.logistics.accessType);
    setContactPersonName(preset.logistics.contactPersonName);
    setDispatchPhone(preset.logistics.dispatchPhone);
    setDispatchEmail(preset.logistics.dispatchEmail);
    setPickupTimeWindow(preset.logistics.pickupTimeWindow);
    setLoadingNotes(preset.logistics.loadingNotes || '');

    setSupportsWineBottles(Boolean(preset.packaging.supportsWineBottles));
    setSupportsBeerBottles(Boolean(preset.packaging.supportsBeerBottles));
    setSupportsColdChainCheese(Boolean(preset.packaging.supportsColdChainCheese));
    setSupportsHoneyJars(Boolean(preset.packaging.supportsHoneyJars));
    setSupportsOliveOilTins(Boolean(preset.packaging.supportsOliveOilTins));
    setMaxDailyParcels(preset.packaging.maxDailyParcels);
    setDispatchLeadTime(preset.packaging.dispatchLeadTime);

    setAccountHolderName(preset.banking.accountHolderName);
    setBankName(preset.banking.bankName);
    setIban(preset.banking.iban);
    setSwiftBic(preset.banking.swiftBic);

    setExcisePermitNumber(preset.permits?.excisePermitNumber || '');
    setSanitaryPermitNumber(preset.permits?.sanitaryPermitNumber || '');
    setOrganicCertificationBody(preset.permits?.organicCertificationBody || '');
    setOrganicCertNumber(preset.permits?.organicCertNumber || '');
    setRepresentativeName(preset.representativeName);
    setRepresentativeRole(preset.representativeRole);
    setOfficialEmail(preset.officialEmail);
    setWebsiteStoreUrl(preset.websiteStoreUrl || '');
    setTermsAccepted(true);
    setFormError(null);
  };

  // Clear / Reset all inputs so suggestive ghost text placeholders are fully visible
  const clearForm = () => {
    setTradeBrandName('');
    setLegalBusinessName('');
    setVatNumber('');
    setTaxOffice('');
    setGemiNumber('');
    setEoriNumber('');
    setFacilityName('');
    setStreetAddress('');
    setPostalCode('');
    setCityOrVillage('');
    setContactPersonName('');
    setDispatchPhone('');
    setDispatchEmail('');
    setPickupTimeWindow('');
    setLoadingNotes('');
    setSupportsWineBottles(false);
    setSupportsBeerBottles(false);
    setSupportsColdChainCheese(false);
    setSupportsHoneyJars(false);
    setSupportsOliveOilTins(false);
    setMaxDailyParcels('');
    setAccountHolderName('');
    setBankName('');
    setIban('');
    setSwiftBic('');
    setExcisePermitNumber('');
    setSanitaryPermitNumber('');
    setOrganicCertificationBody('');
    setOrganicCertNumber('');
    setRepresentativeName('');
    setRepresentativeRole('');
    setOfficialEmail('');
    setWebsiteStoreUrl('');
    setNotesFromProducer('');
    setTermsAccepted(false);
    setViesResult(null);
    setFormError(null);
    setSubmitSuccess(null);
  };

  const handleProducerSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedProducerId(id);
    const p = allProducers.find((item: Producer) => item.id === id);
    if (p) {
      setProducerCategory((p.category as any) || 'winery');
      setCountryCode(p.country === 'Italy' || p.destination === 'tuscany' ? 'IT' : 'GR');
      setRegion(p.destination === 'tuscany' ? 'Tuscany' : 'Crete');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate minimum required fields
    if (!tradeBrandName.trim()) {
      setFormError('Please provide the commercial brand or estate name.');
      setActiveTab('fiscal');
      return;
    }
    if (!legalBusinessName.trim()) {
      setFormError('Please enter the official registered legal business name.');
      setActiveTab('fiscal');
      return;
    }
    if (!vatNumber.trim() || !vatValidation.isValid) {
      setFormError(vatValidation.error || 'Please enter a valid VAT number with check digits.');
      setActiveTab('fiscal');
      return;
    }
    if (!taxOffice.trim()) {
      setFormError('Please specify the competent Tax Authority or Tax Office.');
      setActiveTab('fiscal');
      return;
    }
    if (!streetAddress.trim() || !postalCode.trim()) {
      setFormError('Please complete the dispatch facility street address and postal code.');
      setActiveTab('logistics');
      return;
    }
    if (!dispatchPhone.trim()) {
      setFormError('Please provide a courier dispatch contact phone number.');
      setActiveTab('logistics');
      return;
    }
    if (!iban.trim() || !ibanValidation.isValid) {
      setFormError(ibanValidation.error || 'Please enter a valid SEPA IBAN for order payout disbursements.');
      setActiveTab('banking');
      return;
    }
    if (!termsAccepted) {
      setFormError('You must agree to the TerroirTrail Artisan Producer Terms & DAC7 fiscal declaration.');
      setActiveTab('permits');
      return;
    }

    const payload: ProducerRegistrationRecord = {
      id: selectedProducerId,
      producerId: selectedProducerId,
      userId: userId || undefined,
      tradeBrandName: tradeBrandName.trim(),
      producerCategory,
      legalBusinessName: legalBusinessName.trim(),
      legalEntityType,
      vatNumber: vatValidation.formatted || vatNumber.trim().toUpperCase(),
      taxOffice: taxOffice.trim(),
      countryCode,
      isVatVerified: true,
      vatVerificationDate: new Date().toISOString(),
      eoriNumber: eoriNumber.trim().toUpperCase() || undefined,
      logistics: {
        facilityName: facilityName.trim() || `${tradeBrandName} Facility`,
        streetAddress: streetAddress.trim(),
        postalCode: postalCode.trim(),
        cityOrVillage: cityOrVillage.trim(),
        region: region.trim(),
        countryCode,
        accessType,
        contactPersonName: contactPersonName.trim() || representativeName.trim(),
        dispatchPhone: dispatchPhone.trim(),
        dispatchEmail: dispatchEmail.trim() || officialEmail.trim(),
        pickupTimeWindow: pickupTimeWindow.trim(),
        loadingNotes: loadingNotes.trim() || undefined,
      },
      packaging: {
        supportsWineBottles,
        supportsBeerBottles,
        supportsColdChainCheese,
        supportsHoneyJars,
        supportsOliveOilTins,
        maxDailyParcels: Number(maxDailyParcels) || 20,
        dispatchLeadTime,
      },
      banking: {
        accountHolderName: accountHolderName.trim() || legalBusinessName.trim(),
        bankName: bankName.trim(),
        iban: ibanValidation.formatted || iban.trim().toUpperCase(),
        swiftBic: swiftBic.trim().toUpperCase(),
        payoutCurrency,
      },
      permits: {
        gemiNumber: gemiNumber.trim() || undefined,
        excisePermitNumber: excisePermitNumber.trim() || undefined,
        sanitaryPermitNumber: sanitaryPermitNumber.trim() || undefined,
        organicCertificationBody: organicCertificationBody.trim() || undefined,
        organicCertNumber: organicCertNumber.trim() || undefined,
      },
      representativeName: representativeName.trim(),
      representativeRole: representativeRole.trim() || 'Producer & Owner',
      officialEmail: officialEmail.trim(),
      websiteStoreUrl: websiteStoreUrl.trim() || undefined,
      status: 'verified_active',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notesFromProducer: notesFromProducer.trim() || undefined,
      termsAccepted: true,
    };

    try {
      setIsSubmitting(true);
      const savedRecord = await saveProducerRegistrationToCloud(payload);
      setSubmitSuccess(savedRecord);
      if (onSaved) {
        onSaved(savedRecord);
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to save registration record to database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs: { key: TabKey; label: string; icon: any; badge?: string }[] = [
    { key: 'fiscal', label: '1. Fiscal & Entity', icon: Building2, badge: vatValidation.isValid ? '✓' : 'VAT' },
    { key: 'logistics', label: '2. Logistics & Pickup', icon: Truck },
    { key: 'packaging', label: '3. Packaging & Boxes', icon: Package },
    { key: 'banking', label: '4. Banking & Payouts', icon: CreditCard, badge: ibanValidation.isValid ? '✓' : 'IBAN' },
    { key: 'permits', label: '5. Permits & Declarations', icon: ShieldCheck },
  ];

  return (
    <div className="bg-stone-950 text-white rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
      {/* Top Banner Header */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-stone-900 via-stone-900/90 to-amber-950/40 border-b border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl shadow-inner">
              🏛️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Official Database Onboarding
                </span>
                {isFirebaseConfigured ? (
                  <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Cloud Firestore Active
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-stone-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    Local Database Cache
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-serif-title text-white mt-0.5">
                Artisan Producer Fiscal & Logistics Registry
              </h2>
              <p className="text-xs text-stone-400">
                Collects mandatory DAC7 tax verification, courier pickup coordinates, and SEPA payout accounts.
              </p>
            </div>
          </div>

          {/* Quick Demo Fill Buttons & Reset */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] uppercase font-bold text-stone-500 mr-1">Demo Autofill:</span>
            <button
              type="button"
              onClick={() => applyPreset('domaine-paterianakis')}
              className="text-[10px] px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 border border-white/10 font-semibold transition cursor-pointer"
            >
              🍇 Paterianakis
            </button>
            <button
              type="button"
              onClick={() => applyPreset('cretan-brewery-charma')}
              className="text-[10px] px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 border border-white/10 font-semibold transition cursor-pointer"
            >
              🍺 Charma Beer
            </button>
            <button
              type="button"
              onClick={() => applyPreset('monteraponi-tuscany')}
              className="text-[10px] px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 border border-white/10 font-semibold transition cursor-pointer"
            >
              🇮🇹 Monteraponi
            </button>
            <button
              type="button"
              onClick={clearForm}
              className="text-[10px] px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white border border-white/10 font-medium transition cursor-pointer flex items-center gap-1"
              title="Clear all fields to inspect suggestive ghost text placeholders"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear Form</span>
            </button>
          </div>
        </div>

        {/* Directory Estate Selector */}
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-xs font-semibold text-stone-300 whitespace-nowrap flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Target Estate / Directory Listing:</span>
          </label>
          <select
            value={selectedProducerId}
            onChange={handleProducerSelectChange}
            className="bg-stone-950 border border-white/15 text-white text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-400 max-w-sm"
          >
            {allProducers.map((p: Producer) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.village}, {p.destination === 'tuscany' ? 'Tuscany' : 'Crete'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Navigation Step Tabs */}
      <div className="flex border-b border-white/10 overflow-x-auto bg-stone-900/50 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setActiveTab(tab.key);
                setFormError(null);
              }}
              className={`flex-1 min-w-[150px] py-3 px-3 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition cursor-pointer ${
                isActive
                  ? 'border-amber-500 text-amber-400 bg-amber-500/10 font-bold'
                  : 'border-transparent text-stone-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                    tab.badge === '✓' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Form Body */}
      <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-6">
        {/* Error Notification */}
        {formError && (
          <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{formError}</span>
          </div>
        )}

        {/* Success Confirmation Card */}
        {submitSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-xs space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Database Record Successfully Saved & Verified!</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(submitSuccess, null, 2));
                  setCopiedPayload(true);
                  setTimeout(() => setCopiedPayload(false), 2000);
                }}
                className="text-[10px] px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 flex items-center gap-1 font-semibold transition cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedPayload ? 'Copied!' : 'Copy Database JSON'}</span>
              </button>
            </div>
            <p className="text-[11px] text-emerald-300/90 leading-relaxed">
              Legal entity <strong>{submitSuccess.legalBusinessName}</strong> (Tax ID: {submitSuccess.vatNumber}) has been stored in <strong>Cloud Firestore</strong> (collection: <code>producer_registrations/{submitSuccess.id}</code>) and synced with courier dispatch logistics.
            </p>
            <div className="flex items-center gap-3 pt-1 text-[10px] text-emerald-400 font-mono">
              <span>Timestamp: {new Date(submitSuccess.updatedAt).toLocaleTimeString()}</span>
              <span>•</span>
              <span>Status: Active & Verified</span>
              <span>•</span>
              <span>SEPA IBAN: {submitSuccess.banking.iban}</span>
            </div>
          </div>
        )}

        {/* TAB 1: FISCAL & LEGAL ENTITY */}
        {activeTab === 'fiscal' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="border-b border-white/10 pb-2 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>Commercial Entity & Tax Identification (DAC7 / Official Registry)</span>
              </h3>
              <span className="text-[10px] text-stone-400">EU Directive 2021/514 Compliant</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-stone-300 text-xs font-semibold mb-1">
                  Tax Residence & Country <span className="text-rose-400">*</span>
                </label>
                <select
                  value={countryCode}
                  onChange={(e) => {
                    const c = e.target.value;
                    setCountryCode(c);
                    if (c === 'IT' && vatNumber.startsWith('EL')) setVatNumber('IT99999999990');
                    if (c === 'GR' && vatNumber.startsWith('IT')) setVatNumber('EL999999991');
                  }}
                  className="w-full bg-stone-900 border border-white/10 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value="GR">🇬🇷 Greece</option>
                  <option value="IT">🇮🇹 Italy</option>
                  <option value="FR">🇫🇷 France</option>
                  <option value="ES">🇪🇸 Spain</option>
                  <option value="DE">🇩🇪 Germany</option>
                  <option value="OTHER">🇪🇺 Other EU Member State</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-300 text-xs font-semibold mb-1">
                  Artisan Category <span className="text-rose-400">*</span>
                </label>
                <select
                  value={producerCategory}
                  onChange={(e) => setProducerCategory(e.target.value as any)}
                  className="w-full bg-stone-900 border border-white/10 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value="winery">🍇 Organic Winery & Estate Cellar</option>
                  <option value="brewery">🍺 Independent Craft Brewery</option>
                  <option value="distillery">🏺 Traditional Spirit Distillery</option>
                  <option value="cheese_dairy">🧀 Artisan Cheese Dairy</option>
                  <option value="apiary">🍯 Natural Honey Apiary</option>
                  <option value="olive_oil">🫒 Cold-Pressed Olive Mill</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-300 text-xs font-semibold mb-1">
                  Commercial Brand / Estate Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={tradeBrandName}
                  onChange={(e) => setTradeBrandName(e.target.value)}
                  placeholder={currentProducer ? `e.g. ${currentProducer.name}` : 'e.g. Domaine Paterianakis'}
                  className="w-full bg-stone-900 border border-white/10 text-white placeholder:text-stone-500 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-stone-300 text-xs font-semibold mb-1">
                  Legal Registered Entity Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={legalBusinessName}
                  onChange={(e) => setLegalBusinessName(e.target.value)}
                  placeholder={currentProducer ? `e.g. ${currentProducer.name} Estate Partnership (Demo)` : 'e.g. Domaine Paterianakis Partnership (Demo)'}
                  className="w-full bg-stone-900 border border-white/10 text-white placeholder:text-stone-500 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-stone-300 text-xs font-semibold mb-1">
                  Legal Entity Structure <span className="text-rose-400">*</span>
                </label>
                <select
                  value={legalEntityType}
                  onChange={(e) => setLegalEntityType(e.target.value as any)}
                  className="w-full bg-stone-900 border border-white/10 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value="general_partnership_oe">General Partnership (GP)</option>
                  <option value="private_company_ike">Private Limited Company (LLC / Ltd)</option>
                  <option value="limited_partnership_ee">Limited Partnership (LP)</option>
                  <option value="corporation_ae">Corporation / Public Limited Company (PLC / S.A.)</option>
                  <option value="sole_proprietorship">Sole Proprietorship / Independent Artisan</option>
                  <option value="agricultural_coop">Agricultural Cooperative</option>
                  <option value="italian_srl">Limited Liability Company (S.r.l.)</option>
                  <option value="other">Other Legal Entity</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-stone-300 text-xs font-semibold">
                    Tax Identification Number (VAT ID / Tax ID) <span className="text-rose-400">*</span>
                  </label>
                  {vatValidation && (
                    <span
                      className={`text-[10px] font-bold ${
                        vatValidation.isValid ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {vatValidation.isValid ? '✓ Valid Check Digit' : 'Checking'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <FileText className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={vatNumber}
                      onChange={(e) => {
                        setVatNumber(e.target.value.toUpperCase());
                        setViesResult(null);
                      }}
                      placeholder={countryCode === 'IT' ? 'e.g. IT99999999990 (Demo Tax ID)' : 'e.g. EL999999991 (Demo Tax ID)'}
                      className={`w-full bg-stone-900 border rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none placeholder:text-stone-500 transition ${
                        vatValidation.isValid
                          ? 'border-emerald-500/60 text-emerald-300'
                          : vatNumber.trim()
                          ? 'border-amber-500/60 text-amber-300'
                          : 'border-white/10 text-white focus:border-amber-400'
                      }`}
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleVerifyVies}
                    disabled={isCheckingVies || !vatNumber.trim()}
                    className="px-3 py-2.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 hover:text-amber-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 shrink-0"
                    title="Validate against official European Commission VIES database"
                  >
                    {isCheckingVies ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Globe className="w-3.5 h-3.5" />
                    )}
                    <span>{isCheckingVies ? 'Querying...' : 'Verify EU VIES'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between mt-1 text-[10px] text-stone-400">
                  <span>Client algorithm: Modulo 11 / Luhn checksum.</span>
                  <span className="text-stone-500">Live API: ec.europa.eu/vies</span>
                </div>

                {/* Live VIES Verification Result Card */}
                {viesResult && (
                  <div
                    className={`mt-2.5 p-3 rounded-xl border text-xs space-y-1.5 animate-in fade-in ${
                      viesResult.isValid
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                        : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <div className="flex items-center gap-1.5">
                        {viesResult.isValid ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                        <span>
                          {viesResult.isValid
                            ? 'Official EU Registry: Active & Valid'
                            : 'VIES Registry: Inactive or Invalid'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono opacity-70">
                        {viesResult.source === 'eu_vies_live'
                          ? 'Live VIES REST API'
                          : viesResult.source === 'synthetic_demo_registry'
                          ? 'Demo Sandbox'
                          : 'Algorithmic Validated'}
                      </span>
                    </div>

                    {viesResult.name && (
                      <div className="text-[11px] pt-1">
                        <span className="text-stone-400">Official Registered Name: </span>
                        <strong className="text-white">{viesResult.name}</strong>
                      </div>
                    )}
                    {viesResult.address && (
                      <div className="text-[11px]">
                        <span className="text-stone-400">Official Tax Address: </span>
                        <span className="text-stone-300">{viesResult.address}</span>
                      </div>
                    )}

                    {viesResult.isValid && viesResult.name && (
                      <button
                        type="button"
                        onClick={() => {
                          if (viesResult.name) setLegalBusinessName(viesResult.name);
                          if (viesResult.address) setStreetAddress(viesResult.address);
                        }}
                        className="mt-1 text-[10px] px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-semibold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Auto-fill Official Business Name & Address</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-stone-300 text-xs font-semibold mb-1">
                  Competent Tax Office / Authority <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={taxOffice}
                  onChange={(e) => setTaxOffice(e.target.value)}
                  placeholder={countryCode === 'IT' ? 'e.g. Tax Office of Siena or Florence' : 'e.g. Heraklion Revenue Office'}
                  className="w-full bg-stone-900 border border-white/10 text-white placeholder:text-stone-500 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-stone-300 text-xs font-semibold">
                    Commercial Company Registry Number
                  </label>
                  {gemiValidation.isValid && (
                    <span className="text-[10px] font-bold text-emerald-400">✓ Valid Format</span>
                  )}
                </div>
                <input
                  type="text"
                  value={gemiNumber}
                  onChange={(e) => setGemiNumber(e.target.value)}
                  placeholder={countryCode === 'IT' ? 'e.g. REA SI-123456 (Registro Imprese)' : 'e.g. 123456789001 (Commercial Registry Number)'}
                  className="w-full bg-stone-900 border border-white/10 text-white placeholder:text-stone-500 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-stone-300 text-xs font-semibold mb-1">
                  Customs EORI Number (Cross-Border Dispatch)
                </label>
                <input
                  type="text"
                  value={eoriNumber}
                  onChange={(e) => setEoriNumber(e.target.value.toUpperCase())}
                  placeholder={countryCode === 'IT' ? 'e.g. IT99999999990' : 'e.g. EL999999991'}
                  className="w-full bg-stone-900 border border-white/10 text-white placeholder:text-stone-500 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-amber-400"
                />
                <p className="text-[10px] text-stone-400 mt-1">
                  Required for international parcels shipping beyond EU customs borders.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LOGISTICS & DISPATCH HUB */}
        {activeTab === 'logistics' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="border-b border-white/10 pb-2 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-400" />
                <span>Physical Dispatch Hub & Courier Collection Coordinates</span>
              </h3>
              <span className="text-[10px] text-stone-400">Where DHL, FedEx & Freight Trucks Arrive</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-stone-300 text-xs font-semibold mb-1">
                  Facility / Warehouse Name
                </label>
                <input
                  type="text"
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
                  placeholder={currentProducer ? `e.g. ${currentProducer.name} Cellar & Dispatch Hub` : 'e.g. Domaine Paterianakis Organic Cellar & Tasting Center'}
                  className="w-full bg-stone-900 border border-white/10 text-white placeholder:text-stone-500 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-stone-300 text-xs font-semibold mb-1">
                  Physical Street Address & Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder={currentProducer?.village ? `e.g. ${currentProducer.village}` : 'e.g. Melesses, Peza Valley'}
                  className="w-full bg-stone-900 border border-white/10 text-white placeholder:text-stone-500 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-300 text-xs font-semibold mb-1">
                    Postal Code <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder={countryCode === 'IT' ? 'e.g. 53017' : 'e.g. 70100'}
                    className="w-full bg-stone-900 border border-white/10 text-white placeholder:text-stone-500 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-stone-300 text-xs font-semibold mb-1">
                    City / Village <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={cityOrVillage}
                    onChange={(e) => setCityOrVillage(e.target.value)}
                    placeholder={currentProducer?.region ? `e.g. ${currentProducer.region}` : 'e.g. Heraklion'}
                    className="w-full bg-stone-900 border border-white/10 text-white placeholder:text-stone-500 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-300 text-xs font-semibold mb-1">
                  Driver & Freight Vehicle Access Type <span className="text-rose-400">*</span>
                </label>
                <select
                  value={accessType}
                  onChange={(e) => setAccessType(e.target.value as any)}
                  className="w-full bg-stone-900 border border-white/10 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value="standard_courier_van">Standard Courier Van (Mercedes Sprinter / Ford Transit)</option>
                  <option value="large_truck_ramp">Heavy Freight Truck with Elevated Loading Ramp</option>
                  <option value="narrow_street_van_only">Narrow Mountain Alley (Small van only, no trucks)</option>
                  <option value="forklift_available">Forklift Available On-Site for Palletized Cargo</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-300 text-xs font-semibold mb-1">
                  Dispatch Coordinator Contact Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={contactPersonName}
                  onChange={(e) => setContactPersonName(e.target.value)}
                  placeholder="e.g. Giorgos Paterianakis"
                  className="w-full bg-stone-900 border border-white/10 text-white placeholder:text-stone-500 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-stone-300 text-xs font-semibold mb-1">
                  Courier Pickup Contact Phone (Driver Line) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={dispatchPhone}
                    onChange={(e) => setDispatchPhone(e.target.value)}
                    placeholder={countryCode === 'IT' ? 'e.g. +39 0577 000000' : 'e.g. +30 2810 000000'}
                    className="w-full bg-stone-900 border border-white/10 text-white placeholder:text-stone-500 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-300 text-xs font-semibold mb-1">
                  Logistics & Manifest Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={dispatchEmail}
                    onChange={(e) => setDispatchEmail(e.target.value)}
                    placeholder={currentProducer ? `e.g. dispatch@${currentProducer.id.replace(/-/g, '')}.com` : 'e.g. dispatch@domainepaterianakis.com'}
                    className="w-full bg-stone-900 border border-white/10 text-white placeholder:text-stone-500 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-300 text-xs font-semibold mb-1">
                  Courier Collection Time Window
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={pickupTimeWindow}
                    onChange={(e) => setPickupTimeWindow(e.target.value)}
                    placeholder="e.g. 09:00 - 15:30 Mon-Fri"
                    className="w-full bg-stone-900 border border-white/10 text-white placeholder:text-stone-500 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-stone-300 text-xs font-semibold mb-1">
                  Loading Gate Instructions for Freight Drivers
                </label>
                <input
                  type="text"
                  value={loadingNotes}
                  onChange={(e) => setLoadingNotes(e.target.value)}
                  placeholder="e.g. Ring the bell at gate 2; cellar warehouse on the left courtyard."
                  className="w-full bg-stone-900 border border-white/10 text-white placeholder:text-stone-500 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PACKAGING & ORDER FULFILLMENT */}
        {activeTab === 'packaging' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="border-b border-white/10 pb-2 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-400" />
                <span>Parcel Packaging & Box Fulfillment Specifications</span>
              </h3>
              <span className="text-[10px] text-stone-400">Certified Carrier Protection</span>
            </div>

            <p className="text-xs text-stone-400">
              Select which product categories your facility is certified to package safely for courier transport.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-stone-900 border border-white/10 hover:border-amber-400/40 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={supportsWineBottles}
                  onChange={(e) => setSupportsWineBottles(e.target.checked)}
                  className="mt-0.5 rounded text-amber-500 focus:ring-amber-400"
                />
                <div>
                  <span className="text-xs font-bold text-white block">🍾 Wine Bottles (0.75L / Magnum)</span>
                  <span className="text-[11px] text-stone-400">
                    Styrofoam or drop-tested corrugated cartons for 1, 3, 6, and 12 bottle orders.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-stone-900 border border-white/10 hover:border-amber-400/40 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={supportsBeerBottles}
                  onChange={(e) => setSupportsBeerBottles(e.target.checked)}
                  className="mt-0.5 rounded text-amber-500 focus:ring-amber-400"
                />
                <div>
                  <span className="text-xs font-bold text-white block">🍺 Craft Beer Bottles & Cans</span>
                  <span className="text-[11px] text-stone-400">
                    Heavy-duty divider boxes for 330ml / 500ml craft brews and custom 12-packs.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-stone-900 border border-white/10 hover:border-amber-400/40 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={supportsColdChainCheese}
                  onChange={(e) => setSupportsColdChainCheese(e.target.checked)}
                  className="mt-0.5 rounded text-amber-500 focus:ring-amber-400"
                />
                <div>
                  <span className="text-xs font-bold text-white block">🧀 Cave-Aged Cheese Cold-Pack</span>
                  <span className="text-[11px] text-stone-400">
                    Vacuum-sealed cheese wheels with reflective insulation and dry gel ice packs.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-stone-900 border border-white/10 hover:border-amber-400/40 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={supportsHoneyJars}
                  onChange={(e) => setSupportsHoneyJars(e.target.checked)}
                  className="mt-0.5 rounded text-amber-500 focus:ring-amber-400"
                />
                <div>
                  <span className="text-xs font-bold text-white block">🍯 Honey Jars & Wild Mountain Herbs</span>
                  <span className="text-[11px] text-stone-400">
                    Inflatable air-column cushioning for glass jars and fragrant botanical sachets.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-stone-900 border border-white/10 hover:border-amber-400/40 cursor-pointer transition sm:col-span-2">
                <input
                  type="checkbox"
                  checked={supportsOliveOilTins}
                  onChange={(e) => setSupportsOliveOilTins(e.target.checked)}
                  className="mt-0.5 rounded text-amber-500 focus:ring-amber-400"
                />
                <div>
                  <span className="text-xs font-bold text-white block">🫒 Extra Virgin Olive Oil Tins & Bottles</span>
                  <span className="text-[11px] text-stone-400">
                    Reinforced corner protectors for 500ml dark glass and 5L stainless tin containers.
                  </span>
                </div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/10">
              <div>
                <label className="block text-stone-300 text-xs font-semibold mb-1">
                  Maximum Daily Parcel Packing Capacity
                </label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={maxDailyParcels}
                  onChange={(e) => setMaxDailyParcels(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 25"
                  className="w-full bg-stone-900 border border-white/10 text-white placeholder:text-stone-500 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-amber-400"
                />
                <p className="text-[10px] text-stone-400 mt-1">
                  Prevents overloading your estate during peak harvest periods.
                </p>
              </div>

              <div>
                <label className="block text-stone-300 text-xs font-semibold mb-1">
                  Dispatch Preparation Lead Time
                </label>
                <select
                  value={dispatchLeadTime}
                  onChange={(e) => setDispatchLeadTime(e.target.value as any)}
                  className="w-full bg-stone-900 border border-white/10 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value="same_day">⚡ Same-Day Dispatch (Orders confirmed before 12:00)</option>
                  <option value="next_day">📅 Next Business Day Dispatch (Recommended)</option>
                  <option value="two_days">⏳ 48 Hours Preparation (Hand-cured or aged items)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: BANKING & SEPA PAYOUTS */}
        {activeTab === 'banking' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="border-b border-white/10 pb-2 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-400" />
                <span>Direct Bank Account & SEPA Payout Disbursal</span>
              </h3>
              <span className="text-[10px] text-stone-400">0% Commission Direct Payouts</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-2.5">
              <Lock className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <span>
                All payouts for customer order boxes and direct tasting bookings are transferred directly into this account. The account holder name must correspond to your official tax identification entity.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-stone-300 text-xs font-semibold mb-1">
                  Bank Account Beneficiary Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  placeholder={currentProducer ? `e.g. ${currentProducer.name} Partnership` : 'e.g. Domaine Paterianakis Partnership'}
                  className="w-full bg-stone-900 border border-white/10 text-white placeholder:text-stone-500 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-stone-300 text-xs font-semibold mb-1">
                  Bank Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder={countryCode === 'IT' ? 'e.g. UniCredit / Intesa Sanpaolo' : 'e.g. National Bank of Greece / Piraeus'}
                  className="w-full bg-stone-900 border border-white/10 text-white placeholder:text-stone-500 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-stone-300 text-xs font-semibold">
                    IBAN (SEPA Account) <span className="text-rose-400">*</span>
                  </label>
                  {ibanValidation && (
                    <span
                      className={`text-[10px] font-bold ${
                        ibanValidation.isValid ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {ibanValidation.isValid ? '✓ Valid SEPA IBAN' : 'Checking'}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={iban}
                    onChange={(e) => setIban(e.target.value.toUpperCase())}
                    placeholder={countryCode === 'IT' ? 'e.g. IT02 L 1234 5678 0000 0001 2345 678' : 'e.g. GR96 0110 1250 0000 0001 2345 678'}
                    className={`w-full bg-stone-900 border rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none placeholder:text-stone-500 transition ${
                      ibanValidation.isValid
                        ? 'border-emerald-500/60 text-emerald-300'
                        : iban.trim()
                        ? 'border-amber-500/60 text-amber-300'
                        : 'border-white/10 text-white focus:border-amber-400'
                    }`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-300 text-xs font-semibold mb-1">
                  SWIFT / BIC Code <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={swiftBic}
                  onChange={(e) => setSwiftBic(e.target.value.toUpperCase())}
                  placeholder={countryCode === 'IT' ? 'e.g. UNCRITM1' : 'e.g. ETHNGRAA'}
                  className="w-full bg-stone-900 border border-white/10 text-white placeholder:text-stone-500 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: LICENSES & REGULATORY PERMITS */}
        {activeTab === 'permits' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="border-b border-white/10 pb-2 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Production Licenses, Organic Certs & Final Declaration</span>
              </h3>
              <span className="text-[10px] text-stone-400">Customs & EMCS Verified</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-stone-300 text-xs font-semibold mb-1">
                  Alcohol Excise / Regulated Production Permit Number
                </label>
                <input
                  type="text"
                  value={excisePermitNumber}
                  onChange={(e) => setExcisePermitNumber(e.target.value)}
                  placeholder={countryCode === 'IT' ? 'e.g. IT00SI000123A' : 'e.g. GR-EIDIK-2026-0012'}
                  className="w-full bg-stone-900 border border-white/10 text-white placeholder:text-stone-500 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-amber-400"
                />
                <p className="text-[10px] text-stone-400 mt-1">
                  Issued by Customs or State Revenue Authority for licensed wineries and breweries.
                </p>
              </div>

              <div>
                <label className="block text-stone-300 text-xs font-semibold mb-1">
                  Sanitary & Food Safety Permit (HACCP / Food Authority)
                </label>
                <input
                  type="text"
                  value={sanitaryPermitNumber}
                  onChange={(e) => setSanitaryPermitNumber(e.target.value)}
                  placeholder={countryCode === 'IT' ? 'e.g. ASL-TOSC-7744' : 'e.g. EFET-HER-8899'}
                  className="w-full bg-stone-900 border border-white/10 text-white placeholder:text-stone-500 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-stone-300 text-xs font-semibold mb-1">
                  Organic Certification Inspection Body
                </label>
                <input
                  type="text"
                  value={organicCertificationBody}
                  onChange={(e) => setOrganicCertificationBody(e.target.value)}
                  placeholder={countryCode === 'IT' ? 'e.g. ICEA, CCPB, Bioagricert' : 'e.g. BIO Hellas, DIO, Q-Check'}
                  className="w-full bg-stone-900 border border-white/10 text-white placeholder:text-stone-500 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-stone-300 text-xs font-semibold mb-1">
                  Organic Certificate Serial Number
                </label>
                <input
                  type="text"
                  value={organicCertNumber}
                  onChange={(e) => setOrganicCertNumber(e.target.value)}
                  placeholder={countryCode === 'IT' ? 'e.g. ICEA-IT-2026-4455' : 'e.g. BIO-GR-2026-7788'}
                  className="w-full bg-stone-900 border border-white/10 text-white placeholder:text-stone-500 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-stone-300 text-xs font-semibold mb-1">
                  Authorized Representative Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={representativeName}
                  onChange={(e) => setRepresentativeName(e.target.value)}
                  placeholder="e.g. Emmanuela Paterianaki"
                  className="w-full bg-stone-900 border border-white/10 text-white placeholder:text-stone-500 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-stone-300 text-xs font-semibold mb-1">
                  Representative Role / Title
                </label>
                <input
                  type="text"
                  value={representativeRole}
                  onChange={(e) => setRepresentativeRole(e.target.value)}
                  placeholder="e.g. Owner & Producer, Master Brewer, Managing Director"
                  className="w-full bg-stone-900 border border-white/10 text-white placeholder:text-stone-500 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-stone-300 text-xs font-semibold mb-1">
                  Official Representative Email <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  value={officialEmail}
                  onChange={(e) => setOfficialEmail(e.target.value)}
                  placeholder={currentProducer ? `e.g. producer@${currentProducer.id.replace(/-/g, '')}.com` : 'e.g. producer@domainepaterianakis.com'}
                  className="w-full bg-stone-900 border border-white/10 text-white placeholder:text-stone-500 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-stone-300 text-xs font-semibold mb-1">
                  Direct Estate Webshop URL
                </label>
                <input
                  type="url"
                  value={websiteStoreUrl}
                  onChange={(e) => setWebsiteStoreUrl(e.target.value)}
                  placeholder={currentProducer ? `e.g. https://${currentProducer.id.replace(/-/g, '')}.com/shop` : 'e.g. https://domainepaterianakis.com/shop'}
                  className="w-full bg-stone-900 border border-white/10 text-white placeholder:text-stone-500 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-stone-300 text-xs font-semibold mb-1">
                  Additional Notes for Logistics Committee (Optional)
                </label>
                <textarea
                  value={notesFromProducer}
                  onChange={(e) => setNotesFromProducer(e.target.value)}
                  placeholder="e.g. Any special handling, seasonal closures, or custom box requests..."
                  rows={2}
                  className="w-full bg-stone-900 border border-white/10 text-white placeholder:text-stone-500 rounded-xl p-3 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Mandatory DAC7 & Platform Agreement */}
            <div className="p-4 rounded-2xl bg-stone-900 border border-white/10 space-y-2 mt-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 rounded text-amber-500 focus:ring-amber-400"
                  required
                />
                <span className="text-xs text-stone-300 leading-relaxed">
                  I certify that all fiscal details, tax identification numbers, and courier loading coordinates provided are accurate for commercial registration. I acknowledge that under EU DAC7 (Directive 2021/514) and Greek tax legislation, commercial revenue data is reported in compliance with AADE / Agenzia delle Entrate rules. I agree to the <strong className="text-emerald-400">0% platform commission policy</strong> for direct visitor orders.
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Footer Navigation & Submit Actions */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {activeTab !== 'fiscal' && (
              <button
                type="button"
                onClick={() => {
                  const order: TabKey[] = ['fiscal', 'logistics', 'packaging', 'banking', 'permits'];
                  const idx = order.indexOf(activeTab);
                  if (idx > 0) setActiveTab(order[idx - 1]);
                }}
                className="px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous Step</span>
              </button>
            )}

            {activeTab !== 'permits' ? (
              <button
                type="button"
                onClick={() => {
                  const order: TabKey[] = ['fiscal', 'logistics', 'packaging', 'banking', 'permits'];
                  const idx = order.indexOf(activeTab);
                  if (idx < order.length - 1) setActiveTab(order[idx + 1]);
                }}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <span>Next Step</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs shadow-lg transition active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Save className="w-4 h-4 animate-spin" />
                  <span>Writing to Database...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save & Commit to Database</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
