import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  MailCheck,
  RefreshCw,
  Repeat2,
  ShieldCheck,
  ShieldOff,
  UserCog,
  XCircle,
} from 'lucide-react';
import {
  fetchActiveProducerOwnerships,
  fetchPendingProducerClaims,
  reassignProducerOwnership,
  revokeProducerOwnership,
  type ActiveProducerOwnership,
  type PendingProducerClaim,
  type ProducerBusinessVerificationStatus,
  type ProducerContactVerificationStatus,
} from '../../services/adminApi';

interface ProducerOwnershipAdminProps {
  enabled: boolean;
  onChanged?: () => void;
}

const businessStatusLabel = (status?: ProducerBusinessVerificationStatus) => {
  switch (status) {
    case 'verified': return 'Verified';
    case 'needs_review': return 'Needs review';
    case 'failed': return 'Failed';
    case 'manual_required': return 'Manual review';
    case 'unavailable': return 'Unavailable';
    default: return 'Not checked';
  }
};

const contactStatusLabel = (status?: ProducerContactVerificationStatus) => {
  switch (status) {
    case 'verified': return 'Verified';
    case 'pending': return 'Email sent';
    case 'unavailable': return 'Unavailable';
    case 'not_started': return 'Not started';
    default: return 'Not started';
  }
};

const statusTone = (status?: string) => {
  if (status === 'verified') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';
  if (status === 'failed') return 'border-rose-500/30 bg-rose-500/10 text-rose-300';
  if (status === 'pending' || status === 'needs_review' || status === 'manual_required') {
    return 'border-amber-500/30 bg-amber-500/10 text-amber-300';
  }
  return 'border-white/10 bg-stone-950 text-stone-400';
};

const StatusIcon: React.FC<{ status?: string }> = ({ status }) => {
  if (status === 'verified') return <CheckCircle2 className="w-3.5 h-3.5" />;
  if (status === 'failed') return <XCircle className="w-3.5 h-3.5" />;
  if (status === 'pending') return <CircleDashed className="w-3.5 h-3.5" />;
  return <AlertTriangle className="w-3.5 h-3.5" />;
};

export const ProducerOwnershipAdmin: React.FC<ProducerOwnershipAdminProps> = ({
  enabled,
  onChanged,
}) => {
  const [ownerships, setOwnerships] = useState<ActiveProducerOwnership[]>([]);
  const [claims, setClaims] = useState<PendingProducerClaim[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyProducerId, setBusyProducerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [mode, setMode] = useState<{ producerId: string; action: 'revoke' | 'reassign' } | null>(null);
  const [reason, setReason] = useState('');
  const [targetEmail, setTargetEmail] = useState('');

  const loadData = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const [ownershipResponse, claimResponse] = await Promise.all([
        fetchActiveProducerOwnerships(),
        fetchPendingProducerClaims(),
      ]);
      setOwnerships(ownershipResponse.ownerships);
      setClaims(claimResponse.claims);
    } catch (err) {
      setOwnerships([]);
      setClaims([]);
      setError(err instanceof Error ? err.message : 'Unable to load producer administration data.');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

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
          ? {
              ...item,
              ownerUid: response.ownership.ownerUid,
              ownerEmail: response.ownership.ownerEmail,
              ownerDisplayName: undefined,
              assignedAt: response.ownership.occurredAt,
            }
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
    <div className="space-y-6">
      <section>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Producer verification evidence</h3>
            </div>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Automated checks support the decision; they never grant host access on their own.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadData()}
            disabled={loading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 bg-stone-900 text-stone-300 hover:text-white disabled:opacity-50 text-xs font-semibold cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {claims.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-stone-900/60 px-4 py-5 text-[11px] text-stone-500">
            No pending producer claims have verification evidence to review.
          </div>
        ) : (
          <div className="space-y-3">
            {claims.map(claim => (
              <article key={`verification-${claim.producerId}`} className="rounded-xl border border-white/10 bg-stone-900/70 p-3 sm:p-4">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-white">{claim.tradeBrandName}</h4>
                      {claim.verificationReadyForAdminReview && (
                        <span className="px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-[9px] uppercase font-bold tracking-wide">
                          Automated checks passed
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-[11px] text-stone-500">
                      {claim.legalBusinessName || 'Legal business name not supplied'}
                      {claim.vatNumber ? ` · ${claim.vatNumber}` : ' · No VAT supplied'}
                    </div>
                    {claim.businessVerificationRegistryName && (
                      <div className="mt-1 text-[10px] text-stone-500">
                        Registry: {claim.businessVerificationRegistryName}
                      </div>
                    )}
                    {claim.businessVerificationRegistryAddress && (
                      <div className="mt-0.5 text-[10px] text-stone-600">
                        {claim.businessVerificationRegistryAddress}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 min-w-[280px]">
                    <div className={`rounded-lg border px-3 py-2 ${statusTone(claim.businessVerificationStatus)}`}>
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wide">
                        <StatusIcon status={claim.businessVerificationStatus} />
                        Business
                      </div>
                      <div className="mt-1 text-xs font-semibold">
                        {businessStatusLabel(claim.businessVerificationStatus)}
                      </div>
                      <div className="mt-0.5 text-[9px] opacity-80">
                        {claim.businessVerificationProvider === 'vies' ? 'VIES' : 'Manual / national registry'}
                        {claim.businessVerificationNameMatch ? ` · name ${claim.businessVerificationNameMatch}` : ''}
                      </div>
                    </div>

                    <div className={`rounded-lg border px-3 py-2 ${statusTone(claim.contactVerificationStatus)}`}>
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wide">
                        <MailCheck className="w-3.5 h-3.5" />
                        Official contact
                      </div>
                      <div className="mt-1 text-xs font-semibold">
                        {contactStatusLabel(claim.contactVerificationStatus)}
                      </div>
                      <div className="mt-0.5 text-[9px] opacity-80 truncate" title={claim.officialEmail}>
                        {claim.officialEmail || 'No official email'}
                      </div>
                    </div>
                  </div>
                </div>

                {claim.businessVerificationReason && (
                  <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-[10px] text-amber-200">
                    {claim.businessVerificationReason}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

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
        </div>

        {(error || notice) && (
          <div className={`mb-3 rounded-xl border px-3 py-2 text-xs ${error ? 'border-rose-500/30 bg-rose-500/10 text-rose-200' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'}`}>
            {error || notice}
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border border-white/10 bg-stone-900/60 px-4 py-6 text-center text-sm text-stone-400">Loading producer administration…</div>
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
    </div>
  );
};
