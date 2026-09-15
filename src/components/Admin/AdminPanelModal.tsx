import React, { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  UserCog,
  UserPlus,
  UserX,
  X,
  XCircle,
} from 'lucide-react';
import {
  approveProducerClaim,
  changeAdminAuthority,
  fetchPendingProducerClaims,
  rejectProducerClaim,
  type AccountCapabilities,
  type PendingProducerClaim,
} from '../../services/adminApi';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  capabilities: AccountCapabilities;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  capabilities,
}) => {
  const [claims, setClaims] = useState<PendingProducerClaim[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminAction, setAdminAction] = useState<'grant' | 'revoke' | null>(null);

  const loadClaims = useCallback(async () => {
    if (!capabilities.canReviewProducerClaims) return;
    setLoading(true);
    setError(null);
    try {
      const { claims: pending } = await fetchPendingProducerClaims();
      setClaims(pending);
    } catch (err) {
      setClaims([]);
      setError(err instanceof Error ? err.message : 'Unable to load producer requests.');
    } finally {
      setLoading(false);
    }
  }, [capabilities.canReviewProducerClaims]);

  useEffect(() => {
    if (!isOpen) return;
    setNotice(null);
    void loadClaims();
  }, [isOpen, loadClaims]);

  if (!isOpen) return null;

  const handleApprove = async (claim: PendingProducerClaim) => {
    if (!window.confirm(`Approve ${claim.tradeBrandName} and assign this listing to the applicant account?`)) return;
    setActionId(claim.producerId);
    setError(null);
    setNotice(null);
    try {
      await approveProducerClaim(claim.producerId);
      setClaims((current) => current.filter((item) => item.producerId !== claim.producerId));
      setNotice(`${claim.tradeBrandName} was approved.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Approval failed.');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (claim: PendingProducerClaim) => {
    const cleanReason = rejectionReason.trim();
    if (cleanReason.length < 3) {
      setError('Add a short reason before rejecting this request.');
      return;
    }
    if (!window.confirm(`Reject the request from ${claim.tradeBrandName}?`)) return;

    setActionId(claim.producerId);
    setError(null);
    setNotice(null);
    try {
      await rejectProducerClaim(claim.producerId, cleanReason);
      setClaims((current) => current.filter((item) => item.producerId !== claim.producerId));
      setRejectingId(null);
      setRejectionReason('');
      setNotice(`${claim.tradeBrandName} was rejected.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rejection failed.');
    } finally {
      setActionId(null);
    }
  };

  const handleAdminChange = async (action: 'grant' | 'revoke') => {
    const email = adminEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      setError('Enter the email address of an existing TerroirTrail account.');
      return;
    }
    const verb = action === 'grant' ? 'make this account an Admin' : 'revoke Admin access from this account';
    if (!window.confirm(`Are you sure you want to ${verb}?`)) return;

    setAdminAction(action);
    setError(null);
    setNotice(null);
    try {
      await changeAdminAuthority(action, email);
      setNotice(action === 'grant' ? `Admin access granted to ${email}.` : `Admin access revoked from ${email}.`);
      setAdminEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Admin authority change failed.');
    } finally {
      setAdminAction(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-5xl max-h-[92dvh] overflow-hidden rounded-2xl border border-white/15 bg-stone-950 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-white/10">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <h2 className="text-base sm:text-lg font-bold text-white">TerroirTrail Administration</h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase">
                {capabilities.isPlatformOwner ? 'Platform Owner' : 'Admin'}
              </span>
            </div>
            <p className="text-[11px] text-stone-400 mt-1">Trusted account actions are verified on the server and recorded in the admin audit trail.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 shrink-0 rounded-xl border border-white/10 bg-stone-900 text-stone-400 hover:text-white hover:border-white/25 flex items-center justify-center cursor-pointer"
            aria-label="Close administration"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {(error || notice) && (
            <div
              role="status"
              className={`rounded-xl border px-3 py-2 text-xs ${error ? 'border-rose-500/30 bg-rose-500/10 text-rose-200' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'}`}
            >
              {error || notice}
            </div>
          )}

          <section>
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Producer & host requests</h3>
                <p className="text-[11px] text-stone-400 mt-0.5">Approve only when listing ownership is sufficiently supported. Approval grants host authority for that listing.</p>
              </div>
              <button
                type="button"
                onClick={() => void loadClaims()}
                disabled={loading}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 bg-stone-900 text-stone-300 hover:text-white disabled:opacity-50 text-xs font-semibold cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="rounded-xl border border-white/10 bg-stone-900/60 px-4 py-8 text-center text-sm text-stone-400">Loading pending requests…</div>
            ) : claims.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-stone-900/60 px-4 py-8 text-center">
                <CheckCircle2 className="w-7 h-7 text-emerald-400 mx-auto mb-2" />
                <div className="text-sm font-semibold text-stone-200">No pending producer requests</div>
                <div className="text-[11px] text-stone-500 mt-1">New host claims will appear here.</div>
              </div>
            ) : (
              <div className="space-y-3">
                {claims.map((claim) => {
                  const busy = actionId === claim.producerId;
                  const rejecting = rejectingId === claim.producerId;
                  return (
                    <article key={claim.producerId} className="rounded-xl border border-white/10 bg-stone-900/70 p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-white">{claim.tradeBrandName}</h4>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-[11px] text-stone-400">
                            {claim.producerCategory && <span>{claim.producerCategory.replaceAll('_', ' ')}</span>}
                            {claim.countryCode && <span>{claim.countryCode}</span>}
                            {claim.submittedAt && <span>Submitted {new Date(claim.submittedAt).toLocaleDateString()}</span>}
                          </div>
                          <div className="mt-2 text-xs text-stone-300">
                            {claim.representativeName && <span className="font-semibold">{claim.representativeName}{claim.representativeRole ? ` · ${claim.representativeRole}` : ''}</span>}
                            {claim.officialEmail && <span className="block text-stone-400 mt-0.5">{claim.officialEmail}</span>}
                          </div>
                          {claim.notesFromProducer && (
                            <p className="mt-2 text-[11px] leading-relaxed text-stone-400 border-l-2 border-white/10 pl-2">{claim.notesFromProducer}</p>
                          )}
                        </div>

                        <div className="flex gap-2 shrink-0">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void handleApprove(claim)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-50 text-xs font-bold cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => {
                              setRejectingId(rejecting ? null : claim.producerId);
                              setRejectionReason('');
                              setError(null);
                            }}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-300 hover:bg-rose-500/20 disabled:opacity-50 text-xs font-bold cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </div>
                      </div>

                      {rejecting && (
                        <div className="mt-3 pt-3 border-t border-white/10 flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={rejectionReason}
                            onChange={(event) => setRejectionReason(event.target.value)}
                            maxLength={500}
                            placeholder="Reason for rejection (stored in audit record)"
                            className="flex-1 min-w-0 rounded-lg border border-white/10 bg-stone-950 px-3 py-2 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-rose-400/60"
                          />
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void handleReject(claim)}
                            className="px-3 py-2 rounded-lg bg-rose-500 text-white text-xs font-bold hover:bg-rose-400 disabled:opacity-50 cursor-pointer"
                          >
                            Confirm rejection
                          </button>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {capabilities.canManageAdmins && (
            <section className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
              <div className="flex items-center gap-2 mb-1">
                <UserCog className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Admin management</h3>
                <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-400 text-stone-950">Owner only</span>
              </div>
              <p className="text-[11px] text-stone-400 mb-3">Grant or revoke Admin access for an existing TerroirTrail account. Other Admins cannot create Admins.</p>

              <div className="flex flex-col md:flex-row gap-2">
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(event) => setAdminEmail(event.target.value)}
                  placeholder="account@example.com"
                  className="flex-1 min-w-0 rounded-lg border border-white/10 bg-stone-950 px-3 py-2 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-400/60"
                />
                <button
                  type="button"
                  disabled={adminAction !== null}
                  onClick={() => void handleAdminChange('grant')}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500 text-stone-950 text-xs font-bold hover:bg-amber-400 disabled:opacity-50 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Make Admin
                </button>
                <button
                  type="button"
                  disabled={adminAction !== null}
                  onClick={() => void handleAdminChange('revoke')}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs font-bold hover:bg-rose-500/20 disabled:opacity-50 cursor-pointer"
                >
                  <UserX className="w-3.5 h-3.5" />
                  Revoke Admin
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
