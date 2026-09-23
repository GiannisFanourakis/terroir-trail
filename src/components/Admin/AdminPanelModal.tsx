import React, { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database,
  ImageOff,
  MapPin,
  RefreshCw,
  Route,
  ShieldCheck,
  Store,
  UserCog,
  UserPlus,
  Users,
  UserX,
  X,
  XCircle,
} from 'lucide-react';
import {
  approveProducerClaim,
  changeAdminAuthority,
  fetchAdminDashboardMetrics,
  fetchPendingProducerClaims,
  rejectProducerClaim,
  type AccountCapabilities,
  type AdminDashboardMetrics,
  type PendingProducerClaim,
} from '../../services/adminApi';
import { producerService, type DataProvenance } from '../../services/producerService';
import {
  buildAdminCatalogueMetrics,
  type AdminCatalogueMetrics,
} from '../../utils/adminCatalogueMetrics';
import { ProducerOwnershipAdmin } from './ProducerOwnershipAdmin';
import { AdminIntentBaseline } from './AdminIntentBaseline';
import { AdminRegionalIntelligence } from './AdminRegionalIntelligence';
import { AdminPartnerCampaigns } from './AdminPartnerCampaigns';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  capabilities: AccountCapabilities;
}

interface MetricCardProps {
  label: string;
  value: React.ReactNode;
  detail: string;
  icon: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, detail, icon }) => (
  <div className="rounded-xl border border-white/10 bg-stone-900/70 p-3 min-w-0">
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10px] uppercase tracking-wide font-bold text-stone-500">{label}</span>
      <span className="text-stone-500">{icon}</span>
    </div>
    <div className="mt-2 text-xl font-bold text-white">{value}</div>
    <div className="mt-1 text-[10px] leading-relaxed text-stone-500">{detail}</div>
  </div>
);

const formatCategory = (value: string) =>
  value
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatAuditEvent = (value: string) => formatCategory(value);

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
  const [dashboardMetrics, setDashboardMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [catalogueMetrics, setCatalogueMetrics] = useState<AdminCatalogueMetrics | null>(null);
  const [catalogueProvenance, setCatalogueProvenance] = useState<DataProvenance | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState<string | null>(null);

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

  const loadMetrics = useCallback(async () => {
    if (!capabilities.isAdmin) return;
    setMetricsLoading(true);
    setMetricsError(null);

    const [serverResult, catalogueResult] = await Promise.allSettled([
      fetchAdminDashboardMetrics(),
      producerService.getProducers({ limit: 1000 }),
    ]);

    const failures: string[] = [];
    if (serverResult.status === 'fulfilled') {
      setDashboardMetrics(serverResult.value.metrics);
    } else {
      setDashboardMetrics(null);
      failures.push(
        serverResult.reason instanceof Error
          ? serverResult.reason.message
          : 'Account metrics are unavailable.'
      );
    }

    if (catalogueResult.status === 'fulfilled') {
      setCatalogueMetrics(buildAdminCatalogueMetrics(catalogueResult.value));
      setCatalogueProvenance(producerService.getCacheProvenance());
    } else {
      setCatalogueMetrics(null);
      setCatalogueProvenance(null);
      failures.push('Catalogue health metrics are unavailable.');
    }

    if (failures.length > 0) setMetricsError(failures.join(' '));
    setMetricsLoading(false);
  }, [capabilities.isAdmin]);

  useEffect(() => {
    if (!isOpen) return;
    setNotice(null);
    void loadClaims();
    void loadMetrics();
  }, [isOpen, loadClaims, loadMetrics]);

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
      void loadMetrics();
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
      void loadMetrics();
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
      void loadMetrics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Admin authority change failed.');
    } finally {
      setAdminAction(null);
    }
  };

  const decisions30d =
    (dashboardMetrics?.requests.approved30d || 0) +
    (dashboardMetrics?.requests.rejected30d || 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-6xl max-h-[92dvh] overflow-hidden rounded-2xl border border-white/15 bg-stone-950 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-white/10">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <h2 className="text-base sm:text-lg font-bold text-white">TerroirTrail Administration</h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase">
                {capabilities.isPlatformOwner ? 'Platform Owner' : 'Admin'}
              </span>
            </div>
            <p className="text-[11px] text-stone-400 mt-1">Action-oriented operations, catalogue quality and trusted account controls.</p>
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
                <h3 className="text-sm font-bold text-white">Operations overview</h3>
                <p className="text-[11px] text-stone-400 mt-0.5">Metrics are derived from trusted Firebase account/admin data and the current producer catalogue.</p>
              </div>
              <button
                type="button"
                onClick={() => void loadMetrics()}
                disabled={metricsLoading}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 bg-stone-900 text-stone-300 hover:text-white disabled:opacity-50 text-xs font-semibold cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${metricsLoading ? 'animate-spin' : ''}`} />
                Refresh metrics
              </button>
            </div>

            {metricsError && (
              <div className="mb-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-200">
                {metricsError}
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2.5">
              <MetricCard
                label="Pending requests"
                value={dashboardMetrics?.requests.pending ?? '—'}
                detail="Producer/host claims requiring review"
                icon={<Clock3 className="w-4 h-4" />}
              />
              <MetricCard
                label="Needs verification"
                value={catalogueMetrics?.needsVerification ?? '—'}
                detail="Unverified location or missing audited Place ID"
                icon={<AlertTriangle className="w-4 h-4" />}
              />
              <MetricCard
                label="Catalogue producers"
                value={catalogueMetrics?.totalProducers ?? '—'}
                detail="Current live or audited fallback catalogue"
                icon={<Store className="w-4 h-4" />}
              />
              <MetricCard
                label="New users · 30d"
                value={dashboardMetrics?.accounts.new30d ?? '—'}
                detail={`${dashboardMetrics?.accounts.total ?? '—'} total Firebase accounts`}
                icon={<Users className="w-4 h-4" />}
              />
              <MetricCard
                label="Producer hosts"
                value={dashboardMetrics?.accounts.activeProducerHosts ?? '—'}
                detail="Unique accounts with active trusted ownership"
                icon={<UserCog className="w-4 h-4" />}
              />
              <MetricCard
                label="Decisions · 30d"
                value={dashboardMetrics ? decisions30d : '—'}
                detail="Producer claim approvals + rejections"
                icon={<CheckCircle2 className="w-4 h-4" />}
              />
            </div>
          </section>

          <section className="grid lg:grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/10 bg-stone-900/60 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock3 className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Request handling</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-stone-950/70 p-2.5"><div className="text-stone-500 text-[10px]">Oldest pending</div><div className="text-white font-bold mt-1">{dashboardMetrics?.requests.oldestPendingAgeDays == null ? '—' : `${dashboardMetrics.requests.oldestPendingAgeDays}d`}</div></div>
                <div className="rounded-lg bg-stone-950/70 p-2.5"><div className="text-stone-500 text-[10px]">Avg review · 30d</div><div className="text-white font-bold mt-1">{dashboardMetrics?.requests.averageReviewHours30d == null ? '—' : `${dashboardMetrics.requests.averageReviewHours30d}h`}</div></div>
                <div className="rounded-lg bg-stone-950/70 p-2.5"><div className="text-stone-500 text-[10px]">Approved · 30d</div><div className="text-emerald-300 font-bold mt-1">{dashboardMetrics?.requests.approved30d ?? '—'}</div></div>
                <div className="rounded-lg bg-stone-950/70 p-2.5"><div className="text-stone-500 text-[10px]">Rejected · 30d</div><div className="text-rose-300 font-bold mt-1">{dashboardMetrics?.requests.rejected30d ?? '—'}</div></div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-stone-900/60 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white">Accounts</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-stone-950/70 p-2.5"><div className="text-stone-500 text-[10px]">Total accounts</div><div className="text-white font-bold mt-1">{dashboardMetrics?.accounts.total ?? '—'}</div></div>
                <div className="rounded-lg bg-stone-950/70 p-2.5"><div className="text-stone-500 text-[10px]">Active admins</div><div className="text-white font-bold mt-1">{dashboardMetrics?.accounts.activeAdmins ?? '—'}</div></div>
                <div className="rounded-lg bg-stone-950/70 p-2.5"><div className="text-stone-500 text-[10px]">Producer hosts</div><div className="text-white font-bold mt-1">{dashboardMetrics?.accounts.activeProducerHosts ?? '—'}</div></div>
                <div className="rounded-lg bg-stone-950/70 p-2.5"><div className="text-stone-500 text-[10px]">Disabled accounts</div><div className="text-white font-bold mt-1">{dashboardMetrics?.accounts.disabled ?? '—'}</div></div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-stone-900/60 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">System & data health</h3>
              </div>
              <div className="space-y-2 text-[11px]">
                <div className="flex items-center justify-between gap-3 rounded-lg bg-stone-950/70 px-3 py-2"><span className="text-stone-400">Admin API</span><span className={dashboardMetrics ? 'text-emerald-300 font-bold' : 'text-amber-300 font-bold'}>{dashboardMetrics ? 'Operational' : 'Unavailable'}</span></div>
                <div className="flex items-center justify-between gap-3 rounded-lg bg-stone-950/70 px-3 py-2"><span className="text-stone-400">Catalogue source</span><span className="text-white font-bold">{catalogueProvenance === 'live' ? 'Live Supabase' : catalogueProvenance === 'fallback' ? 'Audited fallback' : '—'}</span></div>
                <div className="rounded-lg bg-stone-950/70 px-3 py-2"><div className="flex items-center justify-between gap-3"><span className="text-stone-400">First-party intent analytics</span><span className="text-emerald-300 font-bold">Active</span></div><p className="text-stone-600 mt-1">Organic, affiliate and paid Partner events remain separately attributed; no opaque producer-interest score is used.</p></div>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Database className="w-4 h-4 text-violet-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Catalogue quality</h3>
                <p className="text-[11px] text-stone-400 mt-0.5">Unknown states remain visible instead of being converted into positive or negative claims.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
              <MetricCard label="Location review" value={catalogueMetrics?.locationNeedsReview ?? '—'} detail="Unresolved or unreviewed map identity" icon={<MapPin className="w-4 h-4" />} />
              <MetricCard label="Visitability unconfirmed" value={catalogueMetrics?.visitabilityNotConfirmed ?? '—'} detail="Not public, uncertain or unreviewed" icon={<Store className="w-4 h-4" />} />
              <MetricCard label="Road access unconfirmed" value={catalogueMetrics?.roadAccessNotConfirmed ?? '—'} detail="No source-backed verified road classification" icon={<Route className="w-4 h-4" />} />
              <MetricCard label="Missing Place IDs" value={catalogueMetrics?.missingGooglePlaceIds ?? '—'} detail="No persistent manually audited Google identity" icon={<AlertTriangle className="w-4 h-4" />} />
              <MetricCard label="No bundled cover" value={catalogueMetrics?.missingBundledCoverImages ?? '—'} detail="May still have eligible live Google imagery" icon={<ImageOff className="w-4 h-4" />} />
            </div>
          </section>

          <AdminIntentBaseline />
          <AdminRegionalIntelligence />
          <AdminPartnerCampaigns />

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

          <ProducerOwnershipAdmin
            enabled={capabilities.canAssignProducerOwnership}
            onChanged={() => void loadMetrics()}
          />

          <section className="rounded-xl border border-white/10 bg-stone-900/60 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">Recent admin activity</h3>
              <p className="text-[11px] text-stone-400 mt-0.5">Latest trusted authority and producer-claim events.</p>
            </div>
            {dashboardMetrics?.audit.recent.length ? (
              <div className="divide-y divide-white/5">
                {dashboardMetrics.audit.recent.map((event, index) => (
                  <div key={`${event.eventType}-${event.occurredAt}-${index}`} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-stone-200">{formatAuditEvent(event.eventType)}</div>
                      <div className="text-[10px] text-stone-500 mt-0.5 truncate">{event.producerId ? `Producer: ${event.producerId}` : event.targetUid ? `Account: ${event.targetUid}` : 'Platform administration'}</div>
                    </div>
                    <time className="text-[10px] text-stone-500 shrink-0">{new Date(event.occurredAt).toLocaleString()}</time>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-6 text-[11px] text-stone-500">No admin audit activity is available yet.</div>
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