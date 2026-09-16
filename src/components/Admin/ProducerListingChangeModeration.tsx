import React, { useCallback, useEffect, useState } from 'react';
import { Check, CheckCircle2, Clock3, FilePenLine, RefreshCw, XCircle } from 'lucide-react';
import {
  approveProducerListingChange,
  fetchPendingProducerListingChanges,
  rejectProducerListingChange,
  type PendingProducerListingChange,
} from '../../services/adminApi';

interface ProducerListingChangeModerationProps {
  enabled: boolean;
  onChanged?: () => void;
}

const FIELD_LABELS: Record<string, string> = {
  tagLine: 'Tagline',
  description: 'Description',
  story: 'Story',
  tastingHighlights: 'Products / highlights',
  website: 'Website',
  foodOption: 'Food option',
  dogFriendly: 'Dog friendly',
  kidFriendly: 'Kid friendly',
  walkIn: 'Walk-ins accepted',
  campervanFriendly: 'Campervan friendly',
};

const displayValue = (value: unknown) => {
  if (Array.isArray(value)) return value.length ? value.join(' · ') : 'Clear all';
  if (value === null || value === '') return 'Clear value';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
};

export const ProducerListingChangeModeration: React.FC<ProducerListingChangeModerationProps> = ({ enabled, onChanged }) => {
  const [requests, setRequests] = useState<PendingProducerListingChange[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetchPendingProducerListingChanges();
      setRequests(response.requests);
    } catch (err) {
      setRequests([]);
      setError(err instanceof Error ? err.message : 'Unable to load producer listing changes.');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => { void loadRequests(); }, [loadRequests]);
  if (!enabled) return null;

  const handleApprove = async (item: PendingProducerListingChange) => {
    if (!window.confirm(`Approve these listing changes for ${item.producerName}?`)) return;
    setBusyId(item.id);
    setError(null);
    setNotice(null);
    try {
      await approveProducerListingChange(item.id);
      setRequests(current => current.filter(candidate => candidate.id !== item.id));
      setNotice(`${item.producerName} listing changes approved and published.`);
      onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Listing change approval failed.');
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (item: PendingProducerListingChange) => {
    const cleanReason = reason.trim();
    if (cleanReason.length < 3) {
      setError('Add a short reason before rejecting this request.');
      return;
    }
    if (!window.confirm(`Reject these listing changes from ${item.producerName}?`)) return;
    setBusyId(item.id);
    setError(null);
    setNotice(null);
    try {
      await rejectProducerListingChange(item.id, cleanReason);
      setRequests(current => current.filter(candidate => candidate.id !== item.id));
      setRejectingId(null);
      setReason('');
      setNotice(`${item.producerName} listing changes rejected.`);
      onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Listing change rejection failed.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <FilePenLine className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-bold text-white">Producer listing change review</h3>
            {!loading && requests.length > 0 && <span className="px-2 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-[9px] uppercase font-bold tracking-wide">{requests.length} pending</span>}
          </div>
          <p className="text-[11px] text-stone-400 mt-0.5">Review Host-proposed story, products, website and amenities before they replace the approved public listing content.</p>
        </div>
        <button type="button" onClick={() => void loadRequests()} disabled={loading} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 bg-stone-900 text-stone-300 disabled:opacity-50 text-xs font-semibold cursor-pointer">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {(error || notice) && <div role="status" className={`mb-3 rounded-xl border px-3 py-2 text-xs ${error ? 'border-rose-500/30 bg-rose-500/10 text-rose-200' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'}`}>{error || notice}</div>}

      {loading ? (
        <div className="rounded-xl border border-white/10 bg-stone-900/60 px-4 py-8 text-center text-sm text-stone-400">Loading listing changes…</div>
      ) : requests.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-stone-900/60 px-4 py-7 text-center">
          <CheckCircle2 className="w-7 h-7 text-emerald-400 mx-auto mb-2" />
          <div className="text-sm font-semibold text-stone-200">No listing changes awaiting review</div>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(item => {
            const busy = busyId === item.id;
            const rejecting = rejectingId === item.id;
            return (
              <article key={item.id} className="rounded-xl border border-white/10 bg-stone-900/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.producerName}</h4>
                    <div className="text-[10px] text-stone-500 mt-0.5">Listing ID: {item.producerId}</div>
                    {item.requesterEmail && <div className="text-[10px] text-stone-500">Host: {item.requesterEmail}</div>}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-300"><Clock3 className="w-3.5 h-3.5" />{new Date(item.submittedAt).toLocaleString()}</div>
                </div>

                <div className="mt-3 grid md:grid-cols-2 gap-2">
                  {Object.entries(item.changes).map(([field, value]) => (
                    <div key={field} className="rounded-lg border border-white/5 bg-stone-950/70 px-3 py-2">
                      <div className="text-[9px] uppercase tracking-wide font-bold text-stone-500">{FIELD_LABELS[field] || field}</div>
                      <div className="mt-1 text-xs text-stone-200 whitespace-pre-wrap break-words">{displayValue(value)}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex gap-2">
                  <button type="button" disabled={busy} onClick={() => void handleApprove(item)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 disabled:opacity-50 text-xs font-bold cursor-pointer"><Check className="w-3.5 h-3.5" />Approve & publish</button>
                  <button type="button" disabled={busy} onClick={() => { setRejectingId(rejecting ? null : item.id); setReason(''); setError(null); }} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300 disabled:opacity-50 text-xs font-bold cursor-pointer"><XCircle className="w-3.5 h-3.5" />Reject</button>
                </div>

                {rejecting && (
                  <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                    <textarea value={reason} onChange={event => setReason(event.target.value)} maxLength={500} rows={3} placeholder="Reason recorded for this request…" className="w-full rounded-lg border border-white/10 bg-stone-950 px-3 py-2 text-xs text-white" />
                    <div className="flex justify-end"><button type="button" disabled={busy || reason.trim().length < 3} onClick={() => void handleReject(item)} className="px-3 py-2 rounded-lg bg-rose-600 text-white disabled:opacity-40 text-xs font-bold cursor-pointer">Confirm rejection</button></div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
