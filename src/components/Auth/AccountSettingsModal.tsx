import React, { useMemo, useState } from 'react';
import {
  Download,
  Loader2,
  MapPin,
  Save,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import type { TravelerInterest, UserProfile } from '../../types/auth';
import { deleteOwnAccount, exportOwnAccountData } from '../../services/accountSelfApi';
import { readStorage, removeStorage, STORAGE_KEYS } from '../../services/browserStorage';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSaveProfile: (updates: Pick<UserProfile, 'hometown' | 'interests'>) => Promise<void>;
  onAccountDeleted: () => Promise<void> | void;
}

const INTERESTS: Array<{ id: TravelerInterest; label: string }> = [
  { id: 'wine', label: 'Wine' },
  { id: 'cheese_dairy', label: 'Cheese & dairy' },
  { id: 'olive_oil', label: 'Olive oil' },
  { id: 'beer', label: 'Beer' },
  { id: 'spirits', label: 'Spirits & distilling' },
  { id: 'honey', label: 'Honey & apiaries' },
  { id: 'farms', label: 'Farms' },
  { id: 'herbs_botanicals', label: 'Herbs & botanicals' },
  { id: 'heritage_geoparks', label: 'Heritage & geoparks' },
  { id: 'local_food', label: 'Local food' },
];

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  onSaveProfile,
  onAccountDeleted,
}) => {
  const [hometown, setHometown] = useState(user.hometown || '');
  const [interests, setInterests] = useState<TravelerInterest[]>(user.interests || []);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const interestSet = useMemo(() => new Set(interests), [interests]);
  if (!isOpen) return null;

  const toggleInterest = (interest: TravelerInterest) => {
    setInterests(current => current.includes(interest)
      ? current.filter(item => item !== interest)
      : [...current, interest]);
  };

  const saveProfile = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await onSaveProfile({ hometown: hometown.trim() || undefined, interests });
      setMessage('Profile preferences saved.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to save account preferences.');
    } finally {
      setSaving(false);
    }
  };

  const exportData = async () => {
    setExporting(true);
    setError(null);
    setMessage(null);
    try {
      const serverData = await exportOwnAccountData();
      const favorites = readStorage<string[]>(
        `${STORAGE_KEYS.FAVORITES}:${user.id}`,
        [],
        { scope: 'AccountSettings', validator: value => Array.isArray(value) }
      );
      const exportPayload = {
        ...serverData,
        deviceData: {
          savedProducerIds: favorites,
        },
      };
      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `terroirtrail-account-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setMessage('Your TerroirTrail data export was prepared as JSON.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to export account data.');
    } finally {
      setExporting(false);
    }
  };

  const deleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return;
    setDeleting(true);
    setError(null);
    setMessage(null);
    try {
      await deleteOwnAccount();
      removeStorage(`${STORAGE_KEYS.USER_DATA_PREFIX}${user.id}`, { scope: 'AccountSettings' });
      removeStorage(`${STORAGE_KEYS.FAVORITES}:${user.id}`, { scope: 'AccountSettings' });
      removeStorage(STORAGE_KEYS.AUTH_USER, { scope: 'AccountSettings' });
      await onAccountDeleted();
      onClose();
    } catch (caught) {
      const typed = caught as Error & { code?: string };
      if (typed.code === 'recent_auth_required') {
        setError('For security, sign out and sign back in, then return here to delete the account. Account deletion requires a recent sign-in.');
      } else {
        setError(typed.message || 'Unable to delete this account.');
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md">
      <div role="dialog" aria-modal="true" aria-labelledby="account-settings-title" className="w-full max-w-2xl max-h-[94dvh] overflow-hidden rounded-3xl border border-white/15 bg-stone-950 text-stone-100 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-white/10 bg-stone-900/70">
          <div>
            <h2 id="account-settings-title" className="font-serif-title text-lg font-bold text-white">Account & privacy</h2>
            <p className="text-[11px] text-stone-500 mt-0.5">{user.email}</p>
          </div>
          <button type="button" onClick={onClose} className="w-9 h-9 rounded-xl border border-white/10 bg-stone-950 text-stone-400 hover:text-white flex items-center justify-center cursor-pointer" aria-label="Close account settings"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {error && <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200">{error}</div>}
          {message && <div role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-200">{message}</div>}

          <section className="rounded-2xl border border-white/10 bg-stone-900/60 p-4 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">Traveler profile</h3>
              <p className="text-[11px] text-stone-500 mt-1">Interests are optional and help personalize discovery. TerroirTrail does not require a traveler persona.</p>
            </div>
            <label className="block">
              <span className="text-xs font-semibold text-stone-300 inline-flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Hometown <span className="font-normal text-stone-600">(optional)</span></span>
              <input value={hometown} onChange={event => setHometown(event.target.value)} maxLength={120} placeholder="e.g. Athens" className="mt-1.5 w-full rounded-xl border border-white/10 bg-stone-950 px-3 py-2.5 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-400/60" />
            </label>
            <div>
              <div className="text-xs font-semibold text-stone-300 mb-2">Interests <span className="font-normal text-stone-600">(optional)</span></div>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map(interest => (
                  <button key={interest.id} type="button" aria-pressed={interestSet.has(interest.id)} onClick={() => toggleInterest(interest.id)} className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold cursor-pointer transition ${interestSet.has(interest.id) ? 'border-amber-400/50 bg-amber-500/15 text-amber-200' : 'border-white/10 bg-stone-950 text-stone-400 hover:text-white'}`}>{interest.label}</button>
                ))}
              </div>
            </div>
            <button type="button" onClick={() => void saveProfile()} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-stone-950 hover:bg-amber-400 disabled:opacity-50 cursor-pointer">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save preferences</button>
          </section>

          <section className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-sky-300 shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white">Export your data</h3>
                <p className="mt-1 text-[11px] text-stone-400 leading-relaxed">Download a JSON copy of your account profile, Passport data stored with your profile, bookings, producer assignments/claims where applicable, pass records, and saved producer IDs from this device.</p>
                <button type="button" onClick={() => void exportData()} disabled={exporting} className="mt-3 inline-flex items-center gap-2 rounded-xl border border-sky-500/25 bg-stone-950 px-3 py-2 text-xs font-semibold text-sky-200 hover:border-sky-400/50 disabled:opacity-50 cursor-pointer">{exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Export JSON</button>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-rose-500/25 bg-rose-500/5 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Trash2 className="w-5 h-5 text-rose-300 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-white">Delete account permanently</h3>
                <p className="mt-1 text-[11px] text-stone-400 leading-relaxed">This removes your Firebase identity and private account data. If you manage producer listings, those public listings remain on TerroirTrail but your ownership assignments are removed. Necessary audit records may be retained only in anonymized form.</p>
              </div>
            </div>
            <label className="block text-[11px] text-stone-400">Type <strong className="text-stone-200">DELETE</strong> to confirm<input value={deleteConfirm} onChange={event => setDeleteConfirm(event.target.value)} autoComplete="off" className="mt-1.5 w-full rounded-xl border border-rose-500/20 bg-stone-950 px-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-400/60" /></label>
            <button type="button" onClick={() => void deleteAccount()} disabled={deleting || deleteConfirm !== 'DELETE'} className="inline-flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/15 px-4 py-2.5 text-xs font-bold text-rose-200 hover:bg-rose-500/25 disabled:opacity-40 cursor-pointer">{deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Permanently delete my account</button>
          </section>
        </div>
      </div>
    </div>
  );
};
