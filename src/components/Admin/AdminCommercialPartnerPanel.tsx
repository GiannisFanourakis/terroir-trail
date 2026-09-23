import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Edit2,
  Eye,
  Megaphone,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Send,
  ShieldCheck,
  StopCircle,
  XCircle,
} from 'lucide-react';
import {
  createCommercialCampaign,
  fetchAdminCommercialState,
  setCommercialPartnerStatus,
  transitionCommercialCampaign,
  updateCommercialCampaign,
  type AdminCommercialState,
  type CommercialCampaignStatus,
  type CommercialCampaignType,
  type CommercialPartnerCampaign,
  type CommercialPartnerStatus,
  type CommercialPlacement,
} from '../../services/commercialPartnerApi';
import { producerService } from '../../services/producerService';
import type { Producer } from '../../types/terroir';

const campaignTypes: Array<{ value: CommercialCampaignType; label: string }> = [
  { value: 'regional_featured', label: 'Regional featured' },
  { value: 'trip_contextual', label: 'My Trips contextual' },
  { value: 'seasonal_notice', label: 'Seasonal / temporary notice' },
];

const placementOptions: Array<{ value: CommercialPlacement; label: string }> = [
  { value: 'region_discovery', label: 'Region discovery' },
  { value: 'trip_preparation', label: 'My Trips preparation' },
];

const humanize = (value: string) =>
  value.replaceAll('_', ' ').replace(/w/g, (c) => c.toUpperCase());

const statusClass = (status: string) => {
  if (status === 'active') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';
  if (status === 'approved' || status === 'scheduled') return 'border-sky-500/30 bg-sky-500/10 text-sky-300';
  if (status === 'pending' || status === 'awaiting_review' || status === 'paused') return 'border-amber-500/30 bg-amber-500/10 text-amber-300';
  if (status === 'rejected' || status === 'ended' || status === 'withdrawn' || status === 'completed') return 'border-rose-500/30 bg-rose-500/10 text-rose-300';
  return 'border-white/10 bg-stone-950 text-stone-400';
};

const toLocalInput = (value: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const fromLocalInput = (value: string) =>
  value ? new Date(value).toISOString() : null;

const partnerTransitions = (
  status: CommercialPartnerStatus | null
): CommercialPartnerStatus[] => {
  if (!status) return ['pending', 'active'];
  if (status === 'pending') return ['active', 'suspended', 'ended'];
  if (status === 'active') return ['suspended', 'ended'];
  if (status === 'suspended') return ['active', 'ended'];
  return ['pending'];
};

const campaignTransitions = (
  status: CommercialCampaignStatus
): CommercialCampaignStatus[] => {
  if (status === 'draft') return ['awaiting_review', 'withdrawn'];
  if (status === 'awaiting_review') return ['approved', 'rejected', 'draft', 'withdrawn'];
  if (status === 'approved') return ['scheduled', 'active', 'withdrawn'];
  if (status === 'scheduled') return ['active', 'paused', 'withdrawn'];
  if (status === 'active') return ['paused', 'completed', 'withdrawn'];
  if (status === 'paused') return ['active', 'completed', 'withdrawn'];
  if (status === 'rejected') return ['draft', 'withdrawn'];
  return [];
};

interface CampaignDraft {
  headline: string;
  message: string;
  startsAt: string;
  endsAt: string;
  placements: CommercialPlacement[];
}

export const AdminCommercialPartnerPanel: React.FC = () => {
  const [state, setState] = useState<AdminCommercialState | null>(null);
  const [producers, setProducers] = useState<Producer[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [partnerProducerId, setPartnerProducerId] = useState('');
  const [partnerReason, setPartnerReason] = useState('Controlled production pilot');

  const [campaignProducerId, setCampaignProducerId] = useState('');
  const [campaignType, setCampaignType] = useState<CommercialCampaignType>('regional_featured');
  const [headline, setHeadline] = useState('');
  const [message, setMessage] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [placements, setPlacements] = useState<CommercialPlacement[]>(['region_discovery']);

  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<CampaignDraft | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [commercialResult, producerResult] = await Promise.allSettled([
      fetchAdminCommercialState(),
      producerService.getProducers({ limit: 1000 }),
    ]);

    if (commercialResult.status === 'fulfilled') {
      setState(commercialResult.value.state);
    } else {
      setState(null);
      setError(
        commercialResult.reason instanceof Error
          ? commercialResult.reason.message
          : 'Commercial Partner state is unavailable.'
      );
    }

    if (producerResult.status === 'fulfilled') {
      const sorted = [...producerResult.value].sort((a, b) => a.name.localeCompare(b.name));
      setProducers(sorted);
      setPartnerProducerId((current) => current || sorted[0]?.id || '');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const producerMap = useMemo(
    () => new Map(producers.map((producer) => [producer.id, producer])),
    [producers]
  );

  const partnerMap = useMemo(
    () => new Map((state?.partners || []).map((partner) => [partner.producer_id, partner])),
    [state?.partners]
  );

  const eligibleCampaignProducers = useMemo(
    () =>
      (state?.partners || [])
        .filter((partner) => partner.status === 'active' || partner.status === 'pending')
        .map((partner) => producerMap.get(partner.producer_id))
        .filter((producer): producer is Producer => Boolean(producer))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [state?.partners, producerMap]
  );

  useEffect(() => {
    if (
      eligibleCampaignProducers.length &&
      !eligibleCampaignProducers.some((producer) => producer.id === campaignProducerId)
    ) {
      setCampaignProducerId(eligibleCampaignProducers[0].id);
    }
  }, [eligibleCampaignProducers, campaignProducerId]);

  const placementsFor = (campaignId: string) =>
    (state?.placements || [])
      .filter((placement) => placement.campaign_id === campaignId)
      .map((placement) => placement.placement);

  const run = async (key: string, action: () => Promise<unknown>, success: string) => {
    setBusy(key);
    setError(null);
    setNotice(null);
    try {
      await action();
      setNotice(success);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Commercial Partner action failed.');
    } finally {
      setBusy(null);
    }
  };

  const handlePartnerTransition = async (status: CommercialPartnerStatus) => {
    if (!partnerProducerId) return;
    const producer = producerMap.get(partnerProducerId);
    const cleanReason = partnerReason.trim();
    if (cleanReason.length < 3) {
      setError('Add a short audit reason before changing Partner status.');
      return;
    }
    await run(
      `partner:${partnerProducerId}`,
      () => setCommercialPartnerStatus(partnerProducerId, status, cleanReason),
      `${producer?.name || partnerProducerId}: Partner status is now ${humanize(status)}.`
    );
  };

  const togglePlacement = (
    value: CommercialPlacement,
    current: CommercialPlacement[],
    setter: (next: CommercialPlacement[]) => void
  ) => {
    if (current.includes(value)) {
      if (current.length === 1) return;
      setter(current.filter((item) => item !== value));
    } else {
      setter([...current, value]);
    }
  };

  const resetCampaignForm = () => {
    setHeadline('');
    setMessage('');
    setStartsAt('');
    setEndsAt('');
    setCampaignType('regional_featured');
    setPlacements(['region_discovery']);
  };

  const handleCreateCampaign = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!campaignProducerId) {
      setError('Choose an eligible Partner producer.');
      return;
    }
    if (!headline.trim()) {
      setError('Campaign headline is required.');
      return;
    }

    await run(
      'campaign:create',
      () =>
        createCommercialCampaign({
          producerId: campaignProducerId,
          campaignType,
          headline: headline.trim(),
          message: message.trim() || null,
          startsAt: fromLocalInput(startsAt),
          endsAt: fromLocalInput(endsAt),
          placements,
        }),
      'Campaign draft created.'
    );
    resetCampaignForm();
  };

  const beginEdit = (campaign: CommercialPartnerCampaign) => {
    setEditingId(campaign.id);
    setEditDraft({
      headline: campaign.headline,
      message: campaign.message || '',
      startsAt: toLocalInput(campaign.starts_at),
      endsAt: toLocalInput(campaign.ends_at),
      placements: placementsFor(campaign.id),
    });
  };

  const saveEdit = async (campaign: CommercialPartnerCampaign) => {
    if (!editDraft) return;
    await run(
      `campaign:${campaign.id}`,
      () =>
        updateCommercialCampaign(campaign.id, {
          headline: editDraft.headline.trim(),
          message: editDraft.message.trim() || null,
          startsAt: fromLocalInput(editDraft.startsAt),
          endsAt: fromLocalInput(editDraft.endsAt),
          placements: editDraft.placements,
        }),
      'Campaign draft updated.'
    );
    setEditingId(null);
    setEditDraft(null);
  };

  const handleCampaignTransition = async (
    campaign: CommercialPartnerCampaign,
    status: CommercialCampaignStatus
  ) => {
    const needsReviewNote = status === 'approved' || status === 'rejected';
    const reason = (reviewNotes[campaign.id] || '').trim();
    if (needsReviewNote && reason.length < 3) {
      setError('Add a short review note before approving or rejecting a campaign.');
      return;
    }

    await run(
      `campaign:${campaign.id}`,
      () => transitionCommercialCampaign(campaign.id, status, reason || undefined),
      `Campaign status is now ${humanize(status)}.`
    );
  };

  if (loading) {
    return (
      <section className="rounded-2xl border border-white/10 bg-stone-900/60 p-8 text-center text-sm text-stone-400">
        <RefreshCw className="mx-auto mb-3 h-5 w-5 animate-spin text-amber-400" />
        Loading Partner administration…
      </section>
    );
  }

  const selectedPartner = partnerMap.get(partnerProducerId) || null;
  const selectedSubscription = (state?.subscriptions || [])
    .filter((subscription) => subscription.producer_id === partnerProducerId)
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0];

  return (
    <section className="space-y-4 rounded-2xl border border-amber-500/20 bg-amber-500/[0.035] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Partner campaigns</h3>
          </div>
          <p className="mt-1 max-w-3xl text-[11px] leading-relaxed text-stone-400">
            Paid distribution is Admin-controlled and must remain separate from verification, visitability, road/access evidence and organic producer ordering.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading || busy !== null}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-stone-950 px-3 py-2 text-xs font-semibold text-stone-300 hover:text-white disabled:opacity-50"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          {error}
        </div>
      )}
      {notice && (
        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
          {notice}
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-stone-950/55 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Commercial relationship
          </div>
          <div className="mt-3 space-y-3">
            <select
              value={partnerProducerId}
              onChange={(event) => setPartnerProducerId(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-stone-950 px-3 py-2 text-xs text-white"
            >
              {producers.map((producer) => (
                <option key={producer.id} value={producer.id}>
                  {producer.name} · {producer.destination}
                </option>
              ))}
            </select>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-stone-900/60 px-3 py-2">
                <span className="text-[10px] text-stone-500">Partner status</span>
                <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${statusClass(selectedPartner?.status || 'not_active')}`}>
                  {selectedPartner ? humanize(selectedPartner.status) : 'Not Partner'}
                </span>
              </div>
              <div className="rounded-lg border border-white/10 bg-stone-900/60 px-3 py-2">
                <div className="text-[9px] uppercase tracking-wide text-stone-500">Entitlement source</div>
                <div className="mt-1 text-[10px] font-semibold text-stone-300">
                  {selectedPartner
                    ? selectedPartner.activation_source === 'admin_pilot'
                      ? 'Admin pilot'
                      : 'Stripe subscription'
                    : 'None'}
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-stone-900/60 px-3 py-2 sm:col-span-2">
                <div className="text-[9px] uppercase tracking-wide text-stone-500">Subscription state</div>
                <div className="mt-1 text-[10px] font-semibold text-stone-300">
                  {selectedSubscription
                    ? `${humanize(selectedSubscription.status)} · ${selectedSubscription.plan_code}`
                    : 'No Stripe subscription record'}
                </div>
              </div>
            </div>

            <input
              value={partnerReason}
              onChange={(event) => setPartnerReason(event.target.value)}
              maxLength={500}
              placeholder="Audit reason"
              className="w-full rounded-lg border border-white/10 bg-stone-950 px-3 py-2 text-xs text-white placeholder:text-stone-600"
            />

            <div className="flex flex-wrap gap-2">
              {partnerTransitions(selectedPartner?.status || null).map((status) => (
                <button
                  key={status}
                  type="button"
                  disabled={busy !== null}
                  onClick={() => void handlePartnerTransition(status)}
                  className="rounded-lg border border-white/10 bg-stone-900 px-3 py-2 text-[10px] font-bold text-stone-300 hover:border-amber-400/30 hover:text-white disabled:opacity-50"
                >
                  Set {humanize(status)}
                </button>
              ))}
            </div>
            <p className="text-[10px] leading-relaxed text-stone-500">
              Admin pilot status is commercial authority only. It never changes the producer's free listing or factual trust status.
            </p>
          </div>
        </div>

        <form onSubmit={handleCreateCampaign} className="rounded-xl border border-white/10 bg-stone-950/55 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <Plus className="h-4 w-4 text-amber-400" />
            Create campaign draft
          </div>

          {eligibleCampaignProducers.length === 0 ? (
            <p className="mt-3 text-xs text-stone-500">
              Create a pending or active Partner relationship before creating a campaign.
            </p>
          ) : (
            <div className="mt-3 space-y-2.5">
              <select
                value={campaignProducerId}
                onChange={(event) => setCampaignProducerId(event.target.value)}
                className="w-full rounded-lg border border-white/10 bg-stone-950 px-3 py-2 text-xs text-white"
              >
                {eligibleCampaignProducers.map((producer) => (
                  <option key={producer.id} value={producer.id}>{producer.name}</option>
                ))}
              </select>

              <select
                value={campaignType}
                onChange={(event) => setCampaignType(event.target.value as CommercialCampaignType)}
                className="w-full rounded-lg border border-white/10 bg-stone-950 px-3 py-2 text-xs text-white"
              >
                {campaignTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>

              <input
                value={headline}
                onChange={(event) => setHeadline(event.target.value)}
                maxLength={120}
                placeholder="Campaign headline"
                className="w-full rounded-lg border border-white/10 bg-stone-950 px-3 py-2 text-xs text-white placeholder:text-stone-600"
              />

              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Optional promotional message"
                className="w-full resize-none rounded-lg border border-white/10 bg-stone-950 px-3 py-2 text-xs text-white placeholder:text-stone-600"
              />

              <div className="grid gap-2 sm:grid-cols-2">
                <label className="text-[10px] text-stone-500">
                  Starts
                  <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-stone-950 px-2 py-2 text-xs text-white" />
                </label>
                <label className="text-[10px] text-stone-500">
                  Ends
                  <input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-stone-950 px-2 py-2 text-xs text-white" />
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                {placementOptions.map((option) => (
                  <label key={option.value} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-stone-900 px-2.5 py-1.5 text-[10px] text-stone-300">
                    <input
                      type="checkbox"
                      checked={placements.includes(option.value)}
                      onChange={() => togglePlacement(option.value, placements, setPlacements)}
                    />
                    {option.label}
                  </label>
                ))}
              </div>

              <button
                type="submit"
                disabled={busy !== null || !headline.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-stone-950 hover:bg-amber-400 disabled:opacity-50"
              >
                <Plus className="h-3.5 w-3.5" />
                Create draft
              </button>
            </div>
          )}
        </form>
      </div>

      {(state?.audit || []).length > 0 && (
        <div className="rounded-xl border border-white/10 bg-stone-950/55">
          <div className="border-b border-white/10 px-4 py-3">
            <div className="text-xs font-bold text-white">Recent commercial audit</div>
            <p className="mt-0.5 text-[10px] text-stone-500">
              Trusted Partner and campaign state changes. Billing events will join this trail when Stripe is connected.
            </p>
          </div>
          <div className="divide-y divide-white/5">
            {state!.audit.slice(0, 10).map((entry) => (
              <div key={entry.id} className="flex flex-col gap-1 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold text-stone-300">
                    {humanize(entry.event_type)} · {producerMap.get(entry.producer_id)?.name || entry.producer_id}
                  </div>
                  <div className="mt-0.5 text-[9px] text-stone-600">
                    {entry.from_status ? `${humanize(entry.from_status)} → ` : ''}{entry.to_status ? humanize(entry.to_status) : ''}
                    {entry.reason ? ` · ${entry.reason}` : ''}
                  </div>
                </div>
                <time className="text-[9px] text-stone-600">
                  {new Date(entry.occurred_at).toLocaleString()}
                </time>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {(state?.campaigns || []).length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-stone-950/45 px-4 py-8 text-center text-xs text-stone-500">
            No commercial campaigns exist yet.
          </div>
        ) : (
          state?.campaigns.map((campaign) => {
            const producer = producerMap.get(campaign.producer_id);
            const allowed = campaignTransitions(campaign.status);
            const isEditing = editingId === campaign.id && editDraft;
            const campaignPlacements = placementsFor(campaign.id);

            return (
              <article key={campaign.id} className="rounded-xl border border-white/10 bg-stone-950/55 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${statusClass(campaign.status)}`}>
                        {humanize(campaign.status)}
                      </span>
                      <span className="text-[9px] font-bold uppercase text-stone-500">{humanize(campaign.campaign_type)}</span>
                    </div>
                    <div className="mt-2 text-xs font-semibold text-stone-300">
                      {producer?.name || campaign.producer_id}
                    </div>
                  </div>

                  {(campaign.status === 'draft' || campaign.status === 'rejected') && (
                    <button
                      type="button"
                      onClick={() => isEditing ? (setEditingId(null), setEditDraft(null)) : beginEdit(campaign)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-stone-900 px-2.5 py-1.5 text-[10px] font-bold text-stone-300 hover:text-white"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      {isEditing ? 'Close edit' : 'Edit draft'}
                    </button>
                  )}
                </div>

                {isEditing && editDraft ? (
                  <div className="mt-3 space-y-2.5 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-3">
                    <input
                      value={editDraft.headline}
                      onChange={(e) => setEditDraft({ ...editDraft, headline: e.target.value })}
                      maxLength={120}
                      className="w-full rounded-lg border border-white/10 bg-stone-950 px-3 py-2 text-xs text-white"
                    />
                    <textarea
                      value={editDraft.message}
                      onChange={(e) => setEditDraft({ ...editDraft, message: e.target.value })}
                      maxLength={500}
                      rows={3}
                      className="w-full resize-none rounded-lg border border-white/10 bg-stone-950 px-3 py-2 text-xs text-white"
                    />
                    <div className="grid gap-2 sm:grid-cols-2">
                      <input type="datetime-local" value={editDraft.startsAt} onChange={(e) => setEditDraft({ ...editDraft, startsAt: e.target.value })} className="rounded-lg border border-white/10 bg-stone-950 px-2 py-2 text-xs text-white" />
                      <input type="datetime-local" value={editDraft.endsAt} onChange={(e) => setEditDraft({ ...editDraft, endsAt: e.target.value })} className="rounded-lg border border-white/10 bg-stone-950 px-2 py-2 text-xs text-white" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {placementOptions.map((option) => (
                        <label key={option.value} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-stone-900 px-2.5 py-1.5 text-[10px] text-stone-300">
                          <input
                            type="checkbox"
                            checked={editDraft.placements.includes(option.value)}
                            onChange={() =>
                              togglePlacement(
                                option.value,
                                editDraft.placements,
                                (next) => setEditDraft({ ...editDraft, placements: next })
                              )
                            }
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => void saveEdit(campaign)}
                      disabled={busy !== null || !editDraft.headline.trim()}
                      className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-stone-950 hover:bg-amber-400 disabled:opacity-50"
                    >
                      Save draft changes
                    </button>
                  </div>
                ) : (
                  <div className="mt-3 rounded-xl border border-amber-400/20 bg-amber-400/[0.05] p-3">
                    <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wide text-amber-300">
                      <Eye className="h-3.5 w-3.5" />
                      Paid placement preview
                    </div>
                    <div className="mt-2 text-sm font-bold text-white">{campaign.headline}</div>
                    {campaign.message && <p className="mt-1 text-xs leading-relaxed text-stone-400">{campaign.message}</p>}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {campaignPlacements.map((placement) => (
                        <span key={placement} className="rounded border border-white/10 bg-stone-900 px-2 py-1 text-[9px] text-stone-400">
                          {humanize(placement)}
                        </span>
                      ))}
                    </div>
                    {(campaign.starts_at || campaign.ends_at) && (
                      <div className="mt-2 inline-flex items-center gap-1 text-[10px] text-stone-500">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {campaign.starts_at ? new Date(campaign.starts_at).toLocaleString() : 'Open start'}
                        {' – '}
                        {campaign.ends_at ? new Date(campaign.ends_at).toLocaleString() : 'Open end'}
                      </div>
                    )}
                  </div>
                )}

                {(campaign.status === 'awaiting_review' || campaign.status === 'approved' || campaign.status === 'scheduled' || campaign.status === 'active' || campaign.status === 'paused') && (
                  <div className="mt-3 rounded-lg border border-white/10 bg-stone-900/55 px-3 py-2 text-[10px] leading-relaxed text-stone-500">
                    Before public activation, compare this promotional copy with the producer's current canonical visitor facts. Promotion must not imply safer access, verified availability, or editorial preference.
                  </div>
                )}

                {campaign.status === 'awaiting_review' && (
                  <textarea
                    value={reviewNotes[campaign.id] || ''}
                    onChange={(e) => setReviewNotes((current) => ({ ...current, [campaign.id]: e.target.value }))}
                    maxLength={500}
                    rows={2}
                    placeholder="Required review note for approve/reject"
                    className="mt-3 w-full resize-none rounded-lg border border-white/10 bg-stone-950 px-3 py-2 text-xs text-white placeholder:text-stone-600"
                  />
                )}

                {allowed.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {allowed.map((status) => {
                      const Icon =
                        status === 'active' ? Play :
                        status === 'paused' ? Pause :
                        status === 'awaiting_review' ? Send :
                        status === 'approved' ? CheckCircle2 :
                        status === 'rejected' ? XCircle :
                        status === 'completed' || status === 'withdrawn' ? StopCircle :
                        RefreshCw;
                      return (
                        <button
                          key={status}
                          type="button"
                          disabled={busy !== null || Boolean(isEditing)}
                          onClick={() => void handleCampaignTransition(campaign, status)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-stone-900 px-2.5 py-1.5 text-[10px] font-bold text-stone-300 hover:border-amber-400/25 hover:text-white disabled:opacity-50"
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {humanize(status)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </section>
  );
};
