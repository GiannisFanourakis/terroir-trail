import React, { useState } from 'react';
import { Ban, LockKeyhole, RefreshCw, Search, ShieldAlert, UnlockKeyhole, UserCheck } from 'lucide-react';
import {
  searchAdminAccounts,
  setAdminAccountDisabled,
  setAdminHostEditingFrozen,
  type AdminAccountSummary,
} from '../../services/adminApi';

export const AdminAccountManagement: React.FC = () => {
  const [query, setQuery] = useState('');
  const [accounts, setAccounts] = useState<AdminAccountSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionUid, setActionUid] = useState<string | null>(null);
  const [reasonByUid, setReasonByUid] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const runSearch = async () => {
    const cleanQuery = query.trim();
    if (cleanQuery.length < 2) {
      setError('Enter at least 2 characters from an email, name or account ID.');
      return;
    }
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const response = await searchAdminAccounts(cleanQuery);
      setAccounts(response.accounts);
    } catch (err) {
      setAccounts([]);
      setError(err instanceof Error ? err.message : 'Unable to search accounts.');
    } finally {
      setLoading(false);
    }
  };

  const requireReason = (uid: string) => {
    const reason = (reasonByUid[uid] || '').trim();
    if (reason.length < 3) {
      setError('Add a short operational reason before changing account access.');
      return null;
    }
    return reason;
  };

  const updateAccount = (uid: string, patch: Partial<AdminAccountSummary>) => {
    setAccounts(current => current.map(account => account.uid === uid ? { ...account, ...patch } : account));
  };

  const handleAccess = async (account: AdminAccountSummary) => {
    const reason = requireReason(account.uid);
    if (!reason) return;
    const nextDisabled = !account.disabled;
    const verb = nextDisabled ? 'disable login for' : 're-enable login for';
    if (!window.confirm(`Are you sure you want to ${verb} ${account.email || account.uid}?`)) return;

    setActionUid(account.uid);
    setError(null);
    setNotice(null);
    try {
      await setAdminAccountDisabled(account.uid, nextDisabled, reason);
      updateAccount(account.uid, { disabled: nextDisabled });
      setNotice(nextDisabled ? 'Account login disabled.' : 'Account login re-enabled.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to change account access.');
    } finally {
      setActionUid(null);
    }
  };

  const handleFreeze = async (account: AdminAccountSummary) => {
    const reason = requireReason(account.uid);
    if (!reason) return;
    const nextFrozen = !account.hostEditingFrozen;
    const verb = nextFrozen ? 'freeze Host editing for' : 'restore Host editing for';
    if (!window.confirm(`Are you sure you want to ${verb} ${account.email || account.uid}?`)) return;

    setActionUid(account.uid);
    setError(null);
    setNotice(null);
    try {
      await setAdminHostEditingFrozen(account.uid, nextFrozen, reason);
      updateAccount(account.uid, { hostEditingFrozen: nextFrozen });
      setNotice(nextFrozen ? 'Host editing frozen. The public listing remains online.' : 'Host editing restored.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to change Host editing status.');
    } finally {
      setActionUid(null);
    }
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-stone-900/50 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-white">Account access & disputes</h3>
          <p className="mt-1 text-[11px] text-stone-400 leading-relaxed">
            Search operational account status without exposing private favorites, Passport notes or journals. Disable login for a Traveler/Host, or freeze a disputed Host's editing rights while leaving the factual public producer listing online.
          </p>
        </div>
      </div>

      <form
        className="mt-4 flex flex-col sm:flex-row gap-2"
        onSubmit={event => { event.preventDefault(); void runSearch(); }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600" />
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search email, name or UID"
            className="w-full rounded-xl border border-white/10 bg-stone-950 pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-400/50"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-stone-800 px-4 py-2.5 text-xs font-bold text-stone-200 hover:text-white disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Search
        </button>
      </form>

      {(error || notice) && (
        <div
          role={error ? 'alert' : 'status'}
          aria-live="polite"
          className={`mt-3 rounded-xl border px-3 py-2 text-xs ${error ? 'border-rose-500/30 bg-rose-500/10 text-rose-200' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'}`}
        >
          {error || notice}
        </div>
      )}

      <div className="mt-4 space-y-3">
        {!loading && accounts.length === 0 && query.trim().length >= 2 && !error && (
          <div className="rounded-xl border border-white/10 bg-stone-950/60 px-4 py-5 text-center text-xs text-stone-500">
            No matching accounts found.
          </div>
        )}

        {accounts.map(account => {
          const busy = actionUid === account.uid;
          const isHost = account.producerIds.length > 0;
          return (
            <div key={account.uid} className="rounded-xl border border-white/10 bg-stone-950/70 p-4">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-white break-all">{account.displayName || account.email || account.uid}</span>
                    {account.isPlatformOwner && <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold uppercase text-amber-300">Platform Owner</span>}
                    {!account.isPlatformOwner && account.roles.includes('admin') && <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[9px] font-bold uppercase text-violet-300">Admin</span>}
                    {isHost && <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-300">Host</span>}
                    {account.disabled && <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[9px] font-bold uppercase text-rose-300">Login disabled</span>}
                    {account.hostEditingFrozen && <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 text-[9px] font-bold uppercase text-orange-300">Host edits frozen</span>}
                  </div>
                  <div className="mt-1 text-[10px] text-stone-500 break-all">{account.email || 'No email'} · UID {account.uid}</div>
                  {isHost && <div className="mt-1 text-[10px] text-stone-500">Listings: {account.producerIds.join(', ')}</div>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {account.canDisable && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void handleAccess(account)}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[11px] font-bold disabled:opacity-50 cursor-pointer ${account.disabled ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300' : 'border-rose-500/25 bg-rose-500/10 text-rose-300'}`}
                    >
                      {account.disabled ? <UserCheck className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                      {account.disabled ? 'Re-enable login' : 'Disable login'}
                    </button>
                  )}
                  {account.canFreezeHostEditing && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void handleFreeze(account)}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[11px] font-bold disabled:opacity-50 cursor-pointer ${account.hostEditingFrozen ? 'border-sky-500/25 bg-sky-500/10 text-sky-300' : 'border-orange-500/25 bg-orange-500/10 text-orange-300'}`}
                    >
                      {account.hostEditingFrozen ? <UnlockKeyhole className="w-3.5 h-3.5" /> : <LockKeyhole className="w-3.5 h-3.5" />}
                      {account.hostEditingFrozen ? 'Restore Host edits' : 'Freeze Host edits'}
                    </button>
                  )}
                </div>
              </div>

              {(account.canDisable || account.canFreezeHostEditing) && (
                <label className="mt-3 block text-[10px] font-semibold text-stone-500">
                  Reason required for the next action
                  <input
                    value={reasonByUid[account.uid] || ''}
                    onChange={event => setReasonByUid(current => ({ ...current, [account.uid]: event.target.value }))}
                    maxLength={1000}
                    placeholder="Example: Ownership dispute under review"
                    className="mt-1.5 w-full rounded-lg border border-white/10 bg-stone-900 px-3 py-2 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-400/50"
                  />
                </label>
              )}

              {!account.canDisable && !account.canFreezeHostEditing && (
                <p className="mt-3 text-[10px] text-stone-600">This account is protected at your current authority level.</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
