import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  FileCheck2,
  Info,
  Mail,
  RefreshCw,
  Save,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { Producer } from '../../types/terroir';
import { ProducerRegistrationRecord } from '../../types/auth';
import { producerService } from '../../services/producerService';
import {
  fetchProducerRegistrationFromCloud,
  isFirebaseConfigured,
  saveProducerRegistrationToCloud,
} from '../../services/firebase';
import { checkVatAgainstVies, ViesCheckResult } from '../../services/viesService';
import { validateVatNumber } from '../../utils/vatValidator';
import { getEffectiveProducerCategory } from '../../utils/producerCategory';

interface ProducerRegistrationFormProps {
  initialProducerId?: string;
  userId?: string;
  producersList?: Producer[];
  onSaved?: (record: ProducerRegistrationRecord) => void;
  onCancel?: () => void;
}

const mapProducerCategoryToRegistration = (
  producer?: Pick<Producer, 'id' | 'category'> | null
): ProducerRegistrationRecord['producerCategory'] => {
  if (!producer) return 'other';
  const category = getEffectiveProducerCategory(producer);
  if (category === 'kazani') return 'distillery';
  if (category === 'olive_mill' || category === 'olive_oil_producer') return 'olive_oil';
  if (category === 'winery' || category === 'brewery' || category === 'cheese_dairy' || category === 'apiary' || category === 'farm') {
    return category;
  }
  return 'other';
};

const producerCountryCode = (producer?: Producer): string => {
  if (!producer) return '';
  const normalized = producer.country?.trim().toLowerCase();
  if (normalized === 'greece') return 'GR';
  if (normalized === 'italy') return 'IT';
  return '';
};

export const ProducerRegistrationForm: React.FC<ProducerRegistrationFormProps> = ({
  initialProducerId,
  userId,
  producersList,
  onSaved,
  onCancel,
}) => {
  const allProducers = producersList !== undefined ? producersList : producerService.getCachedProducers();
  const initialProducer = allProducers.find(producer => producer.id === initialProducerId) || allProducers[0];

  const [selectedProducerId, setSelectedProducerId] = useState(initialProducerId || initialProducer?.id || '');
  const selectedProducer = useMemo(
    () => allProducers.find(producer => producer.id === selectedProducerId),
    [allProducers, selectedProducerId]
  );

  const [tradeBrandName, setTradeBrandName] = useState(initialProducer?.name || '');
  const [representativeName, setRepresentativeName] = useState('');
  const [representativeRole, setRepresentativeRole] = useState('');
  const [officialEmail, setOfficialEmail] = useState('');
  const [countryCode, setCountryCode] = useState(producerCountryCode(initialProducer));
  const [legalBusinessName, setLegalBusinessName] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [notesFromProducer, setNotesFromProducer] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [viesResult, setViesResult] = useState<ViesCheckResult | null>(null);
  const [isCheckingVies, setIsCheckingVies] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<ProducerRegistrationRecord | null>(null);
  const [existingSubmittedAt, setExistingSubmittedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedProducerId && allProducers.length > 0) {
      setSelectedProducerId(initialProducerId || allProducers[0].id);
    }
  }, [allProducers, initialProducerId, selectedProducerId]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!selectedProducerId) return;
      const producer = allProducers.find(item => item.id === selectedProducerId);
      const existing = await fetchProducerRegistrationFromCloud(selectedProducerId);
      if (!active) return;

      setTradeBrandName(existing?.tradeBrandName || producer?.name || '');
      setRepresentativeName(existing?.representativeName || '');
      setRepresentativeRole(existing?.representativeRole || '');
      setOfficialEmail(existing?.officialEmail || '');
      setCountryCode(existing?.countryCode || producerCountryCode(producer));
      setLegalBusinessName(existing?.legalBusinessName || '');
      setVatNumber(existing?.vatNumber || '');
      setNotesFromProducer(existing?.notesFromProducer || '');
      setTermsAccepted(Boolean(existing?.termsAccepted));
      setExistingSubmittedAt(existing?.submittedAt || null);
      setViesResult(null);
      setFormError(null);
      setSubmitSuccess(null);
    };
    void load();
    return () => {
      active = false;
    };
  }, [allProducers, selectedProducerId]);

  const normalizedCountryCode = countryCode.trim().toUpperCase();
  const vatValidation = vatNumber.trim()
    ? validateVatNumber(vatNumber, normalizedCountryCode)
    : null;

  const handleVerifyVies = async () => {
    if (!vatNumber.trim() || !normalizedCountryCode) return;
    setIsCheckingVies(true);
    setFormError(null);
    try {
      setViesResult(await checkVatAgainstVies(vatNumber, normalizedCountryCode));
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'VIES verification is temporarily unavailable. You can still submit the claim for manual review.');
    } finally {
      setIsCheckingVies(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    setSubmitSuccess(null);

    if (!selectedProducerId || !selectedProducer) {
      setFormError('Choose the producer listing you represent.');
      return;
    }
    if (!tradeBrandName.trim()) {
      setFormError('Producer or business name is required.');
      return;
    }
    if (!representativeName.trim()) {
      setFormError('Your name is required so TerroirTrail can verify who is making this claim.');
      return;
    }
    if (!officialEmail.trim() || !/^\S+@\S+\.\S+$/.test(officialEmail.trim())) {
      setFormError('Enter a valid official contact email for the producer.');
      return;
    }
    if (!normalizedCountryCode || !/^[A-Z]{2}$/.test(normalizedCountryCode)) {
      setFormError('Enter the producer country as a two-letter country code, for example GR or IT.');
      return;
    }
    if (vatNumber.trim() && vatValidation && !vatValidation.isValid) {
      setFormError(vatValidation.error || 'The VAT number format is not valid. You may leave VAT blank if it does not apply and submit other business evidence for manual review.');
      return;
    }
    if (!termsAccepted) {
      setFormError('You must accept the TerroirTrail Producer Terms before submitting the claim.');
      return;
    }

    const now = new Date().toISOString();
    const payload: ProducerRegistrationRecord = {
      id: selectedProducerId,
      producerId: selectedProducerId,
      userId: userId || undefined,
      tradeBrandName: tradeBrandName.trim(),
      producerCategory: mapProducerCategoryToRegistration(selectedProducer),
      representativeName: representativeName.trim(),
      representativeRole: representativeRole.trim() || undefined,
      officialEmail: officialEmail.trim().toLowerCase(),
      countryCode: normalizedCountryCode,
      legalBusinessName: legalBusinessName.trim() || undefined,
      vatNumber: vatNumber.trim()
        ? (vatValidation?.formatted || vatNumber.trim().toUpperCase())
        : undefined,
      isVatVerified: false,
      status: 'pending_verification',
      submittedAt: existingSubmittedAt || now,
      updatedAt: now,
      notesFromProducer: notesFromProducer.trim() || undefined,
      termsAccepted: true,
    };

    try {
      setIsSubmitting(true);
      const saved = await saveProducerRegistrationToCloud(payload);
      setSubmitSuccess(saved);
      onSaved?.(saved);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to submit the producer claim.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-stone-950 text-white shadow-2xl overflow-hidden">
      <div className="border-b border-white/10 bg-stone-900/70 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-300 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold font-serif-title">Claim a producer listing</h2>
              <span className="rounded-full border border-white/10 bg-stone-950 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-stone-400">
                Ownership verification
              </span>
            </div>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-stone-400">
              We only collect what is needed to verify that you legitimately represent this producer. Banking, courier, packaging and payout details are not required to claim a listing and will only be requested later if you opt into a relevant commercial service.
            </p>
            <div className="mt-2 text-[10px] text-stone-500">
              {isFirebaseConfigured ? 'Secure cloud submission enabled' : 'Local development mode'}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
        {formError && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-xs text-rose-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{formError}</span>
          </div>
        )}
        {submitSuccess && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-xs text-emerald-200 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            <span>Claim submitted. TerroirTrail will verify the business/contact evidence before assigning Host Portal access.</span>
          </div>
        )}

        <section className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-stone-100">
            <Building2 className="w-4 h-4 text-amber-400" />
            Producer listing
          </div>
          {allProducers.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-stone-900 p-3 text-xs text-stone-400">No producer listings are currently available to claim.</div>
          ) : (
            <select
              value={selectedProducerId}
              onChange={event => setSelectedProducerId(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-stone-900 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400/60"
            >
              {allProducers.map(producer => (
                <option key={producer.id} value={producer.id}>{producer.name} · {producer.village}, {producer.region}</option>
              ))}
            </select>
          )}

          <label className="block">
            <span className="text-xs font-semibold text-stone-300">Producer / business name</span>
            <input
              value={tradeBrandName}
              onChange={event => setTradeBrandName(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-stone-900 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400/60"
              required
            />
          </label>
        </section>

        <section className="grid sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-semibold text-stone-300 inline-flex items-center gap-1.5"><UserRound className="w-3.5 h-3.5" /> Your name</span>
            <input
              value={representativeName}
              onChange={event => setRepresentativeName(event.target.value)}
              placeholder="Representative name"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-stone-900 px-3 py-2.5 text-sm text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-400/60"
              required
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-stone-300">Role at the producer <span className="font-normal text-stone-600">(optional)</span></span>
            <input
              value={representativeRole}
              onChange={event => setRepresentativeRole(event.target.value)}
              placeholder="Owner, manager, family member…"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-stone-900 px-3 py-2.5 text-sm text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-400/60"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-semibold text-stone-300 inline-flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Official producer email</span>
            <input
              type="email"
              value={officialEmail}
              onChange={event => setOfficialEmail(event.target.value)}
              placeholder="name@producer-domain.example"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-stone-900 px-3 py-2.5 text-sm text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-400/60"
              required
            />
            <span className="mt-1 block text-[10px] text-stone-500">Where possible, use an address controlled by the producer rather than a personal account. We may send a verification link here.</span>
          </label>
        </section>

        <section className="space-y-3 rounded-2xl border border-white/10 bg-stone-900/50 p-4">
          <div className="flex items-start gap-2">
            <FileCheck2 className="w-4 h-4 text-sky-300 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-stone-100">Business evidence</h3>
              <p className="text-[11px] text-stone-500 mt-0.5">VAT/business registration evidence is helpful where applicable, but a VAT number is not mandatory for every small producer. Claims without one go to manual review.</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-[120px_1fr] gap-3">
            <label className="block">
              <span className="text-xs font-semibold text-stone-300">Country code</span>
              <input
                value={countryCode}
                onChange={event => { setCountryCode(event.target.value.toUpperCase().slice(0, 2)); setViesResult(null); }}
                placeholder="GR"
                maxLength={2}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-stone-950 px-3 py-2.5 text-sm uppercase text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-400/60"
                required
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-stone-300">Registered business name <span className="font-normal text-stone-600">(optional)</span></span>
              <input
                value={legalBusinessName}
                onChange={event => setLegalBusinessName(event.target.value)}
                placeholder="Name shown on official business records"
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-stone-950 px-3 py-2.5 text-sm text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-400/60"
              />
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300">VAT number <span className="font-normal text-stone-600">(optional, where applicable)</span></label>
            <div className="mt-1.5 flex flex-col sm:flex-row gap-2">
              <input
                value={vatNumber}
                onChange={event => { setVatNumber(event.target.value); setViesResult(null); }}
                placeholder="VAT / tax registration number"
                className="flex-1 rounded-xl border border-white/10 bg-stone-950 px-3 py-2.5 text-sm text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-400/60"
              />
              <button
                type="button"
                onClick={() => void handleVerifyVies()}
                disabled={!vatNumber.trim() || !normalizedCountryCode || isCheckingVies}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-stone-950 px-3 py-2.5 text-xs font-semibold text-stone-300 hover:text-white disabled:opacity-40 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingVies ? 'animate-spin' : ''}`} />
                Check VIES
              </button>
            </div>
            {vatValidation && !vatValidation.isValid && <div className="mt-1 text-[10px] text-amber-300">{vatValidation.error}</div>}
            {viesResult && (
              <div className={`mt-2 rounded-lg border px-3 py-2 text-[10px] ${viesResult.isValid ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200' : 'border-amber-500/25 bg-amber-500/10 text-amber-200'}`}>
                {viesResult.isValid ? 'VIES returned a valid VAT registration. Final Host access still requires TerroirTrail approval.' : (viesResult.userError || 'VIES did not confirm this VAT registration. You may still submit for manual review.')}
              </div>
            )}
          </div>

          <label className="block">
            <span className="text-xs font-semibold text-stone-300">Additional verification note <span className="font-normal text-stone-600">(optional)</span></span>
            <textarea
              rows={3}
              maxLength={800}
              value={notesFromProducer}
              onChange={event => setNotesFromProducer(event.target.value)}
              placeholder="For example: official registry name, cooperative membership, or how TerroirTrail can verify your relationship to the listing."
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-stone-950 px-3 py-2.5 text-sm text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-400/60"
            />
          </label>
        </section>

        <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3 flex items-start gap-2 text-[11px] text-stone-400">
          <Info className="w-4 h-4 text-sky-300 mt-0.5 shrink-0" />
          <span>Submitting a claim does not make the account a Host automatically. TerroirTrail verifies the evidence and explicitly assigns approved producer listings to the account.</span>
        </div>

        <label className="flex items-start gap-2 rounded-xl border border-white/10 bg-stone-900/50 p-3 cursor-pointer">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={event => setTermsAccepted(event.target.checked)}
            className="mt-0.5"
          />
          <span className="text-xs leading-relaxed text-stone-300">I confirm that I am authorized to represent this producer and agree to the TerroirTrail Producer Terms. I understand that inaccurate ownership claims may be rejected or revoked.</span>
        </label>

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
          <div className="text-[10px] text-stone-600">No banking or payout details are collected in this claim.</div>
          <div className="flex gap-2 justify-end">
            {onCancel && (
              <button type="button" onClick={onCancel} className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-stone-400 hover:text-white cursor-pointer">Cancel</button>
            )}
            <button
              type="submit"
              disabled={isSubmitting || !selectedProducerId}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-stone-950 hover:bg-amber-400 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Submitting…' : 'Submit claim for verification'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
