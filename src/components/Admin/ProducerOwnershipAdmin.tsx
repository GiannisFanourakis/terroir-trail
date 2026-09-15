import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Repeat2, ShieldOff, UserCog } from 'lucide-react';
import {
  fetchActiveProducerOwnerships,
  reassignProducerOwnership,
  revokeProducerOwnership,
  type ActiveProducerOwnership,
} from '../../services/adminApi';

interface ProducerOwnershipAdminProps {
  enabled: boolean;
  onChanged?: () => void;
}

export const ProducerOwnershipAdmin: React.FC<ProducerOwnershipAdminProps> = ({
  enabled,
  onChanged,
}) => {
  const [ownerships, setOwnerships] = useState<ActiveProducerOwnership[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyProducerId, setBusyProducerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [mode, setMode] = useState<{ producerId: string; action: 'revoke' | 'reassign' } | null>(null);
  const [reason, setReason] = useState('');
  const [targetEmail, setTargetEmail] = useState('');

  const loadOwnerships = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetchActiveProducerOwnerships();
      setOwnerships(response.ownerships);
    } catch (err) {
      setOwnerships([]);
      setError(err instanceof Error ? err.message : 'Unable to load active producer ownership.');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void loadOwnerships();
  }, [loadOwnerships]);

  if (!enabled) return null;

  const resetAction = () => {
    setMode(null);
    setReason('');
    setTargetEmail('');
  };

  const handleRevoke = async (ownership: ActiveProducerOwnership) => {
    const rationale = reason.trim();
    if (rationale.length < 3) {
      setError('Add a short reason before revoking producer ownership.');
      return;
    }
    if (!window.confirm(`Revoke host authority for ${ownership.producerName}?`)) return;

    setBusyProducerId(ownership.producerId);
    setError(null);
    setNotice(null);
    try {
      await revokeProducerOwnership(ownership.producerId, rationale);
      setOwnerships(current => current.filter(item => item.producerId !== ownership.producerId));
      setNotice(`${ownership.producerName} no longer has an active assigned host.`);
      resetAction();
      onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ownership revoke failed.');
    } finally {
      setBusyProducerId(null);
    }
  };

  const handleReassign = async (ownership: ActiveProducerOwnership) => {
    const email = targetEmail.trim().toLowerCase();
    const rationale = reason.trim();
    if (!email || !email.includes('@')) {
      setError('Enter the email address of an existing TerroirTrail account.');
      return;
    }
    if (rationale.length < 3) {
      setError('Add a short reason before reassigning producer ownership.');
      return;
    }
    if (!window.confirm(`Reassign ${ownership.producerName} to ${email}?`)) return;

    setBusyProducerId(ownership.producerId);
    setError(null);
    setNotice(null);
    try {
      const response = await reassignProducerOwnership(ownership.producerId, email, rationale);
      setOwnerships(current => current.map(item =>
        item.producerId === ownership.producerId
          ? { ...item, ownerUid: response.ownership.ownerUid, ownerEmail: response.ownership.ownerEmail, ownerDisplayName: undefined, assignedAt: response.ownership.occurredAt }
          : item
      ));
      setNotice(`${ownership.producerName} was reassigned to ${email}.`);
      resetAction();
      onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ownership reassignment failed.');
    } finally {
      setBusyProducerId(null);
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <UserCog className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white">Producer ownership</h3>
          </div>
          <p className="text-[11px] text-stone-400 mt-0.5">
            Trusted host assignments only. Revoke or reassign authority when ownership changes or a listing is disputed.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadOwnerships()}
          disabled={loading}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 bg-stone-900 text-stone-300 hover:text-white disabled:opacity-50 text-xs font-semibold cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {(error || notice) && (
        <div className={`mb-3 rounded-xl border px-3 py-2 text-xs ${error ? 'border-rose-500/30 bg-rose-500/10 text-rose-200' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'}`}>
          {error || notice}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-white/10 bg-stone-900/60 px-4 py-6 text-center text-sm text-stone-400">Loading active ownership…</div>
      ) : ownerships.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-stone-900/60 px-4 py-6 text-center">
          <UserCog className="w-7 h-7 text-stone-500 mx-auto mb-2" />
          <div className="text-sm font-semibold text-stone-200">No active producer ownership yet</div>
          <div className="text-[11px] text-stone-500 mt-1">Approved producer/host accounts will appear here automatically.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {ownerships.map(ownership => {
            const busy = busyProducerId === ownership.producerId;
            const activeMode = mode?.producerId === ownership.producerId ? mode.action : null;
            return (
              <article key={ownership.producerId} className="rounded-xl border border-white/10 bg-stone-900/70 p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white">{ownership.producerName}</h4>
                    <div className="mt-1 text-[11px] text-stone-400">
                      <span>{ownership.ownerDisplayName || 'Assigned host'}</span>
                      {ownership.ownerEmail && <span className="block text-stone-500 mt-0.5">{ownership.ownerEmail}</span>}
                    </div>
                    <div className="mt-1 text-[10px] text-stone-600">Producer ID: {ownership.producerId}</div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        setMode(activeMode === 'reassign' ? null : { producerId: ownership.producerId, action: 'reassign' });
                        setReason('');
                        setTargetEmail('');
                        setError(null);
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-sky-500/25 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20 disabled:opacity-50 text-xs font-bold cursor-pointer"
                    >
                      <Repeat2 className="w-3.5 h-3.5" />
                      Reassign
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        setMode(activeMode === 'revoke' ? null : { producerId: ownership.producerId, action: 'revoke' });
                        setReason('');
                        setTargetEmail('');
                        setError(null);
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-rose-500/25 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 disabled:opacity-50 text-xs font-bold cursor-pointer"
                    >
                      <ShieldOff className="w-3.5 h-3.5" />
                      Revoke
                    </button>
                  </div>
                </div>

                {activeMode && (
                  <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                    {activeMode === 'reassign' && (
                      <input
                        type="email"
                        value={targetEmail}
                        onChange={event => setTargetEmail(event.target.value)}
                        placeholder="New host account email"
                        className="w-full rounded-lg border border-white/10 bg-stone-950 px-3 py-2 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-sky-400/60"
                      />
                    )}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={reason}
                        onChange={event => setReason(event.target.value)}
                        maxLength={500}
                        placeholder="Reason (stored in the admin audit trail)"
                        className="flex-1 min-w-0 rounded-lg border border-white/10 bg-stone-950 px-3 py-2 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-white/30"
                      />
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void (activeMode === 'reassign' ? handleReassign(ownership) : handleRevoke(ownership))}
                        className={`px-3 py-2 rounded-lg text-xs font-bold disabled:opacity-50 cursor-pointer ${activeMode === 'reassign' ? 'bg-sky-500 text-stone-950 hover:bg-sky-400' : 'bg-rose-500 text-white hover:bg-rose-400'}`}
                      >
                        {activeMode === 'reassign' ? 'Confirm reassignment' : 'Confirm revoke'}
                      </button>
                    </div>
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
