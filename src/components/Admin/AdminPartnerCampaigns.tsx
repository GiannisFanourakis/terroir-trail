import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  CalendarClock,
  CheckCircle2,
  Edit3,
  Eye,
  Megaphone,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  RotateCcw,
  Send,
  ShieldCheck,
  StopCircle,
  XCircle,
} from 'lucide-react';
import {
  createAdminPartnerCampaign,
  fetchAdminCommercialState,
  setAdminCommercialPartnerStatus,
  transitionAdminPartnerCampaign,
  updateAdminPartnerCampaign,
  type AdminCommercialState,
  type CampaignDraftInput,
  type CommercialCampaignStatus,
  type CommercialCampaignType,
  type CommercialPlacement,
  type CommercialPartnerCampaign,
} from '../../services/commercialPartnerApi';
import { producerService } from '../../services/producerService';
import type { Producer } from '../../types/terroir';

const EMPTY_DRAFT: CampaignDraftInput = {
  producerId: '',
  campaignType: 'regional_featured',
  headline: '',
  message: '',
  startsAt: null,
  endsAt: null,
  placements: ['region_discovery'],
};

const label = (value: string) =>
  value.replaceAll('_', ' ').replace(/w/g, (letter) => letter.toUpperCase());

const statusClass = (status: string) => {
  if (status === 'active') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';
  if (status === 'scheduled' || status === 'approved') return 'border-sky-500/30 bg-sky-500/10 text-sky-300';
  if (status === 'pending' || status === 'awaiting_review' || status === 'paused') {
    return 'border-amber-500/30 bg-amber-500/10 text-amber-300';
  }
  if (status === 'rejected' || status === 'ended') return 'border-rose-500/30 bg-rose-500/10 text-rose-300';
  return 'border-white/10 bg-white/5 text-stone-300';
};

const toIso = (value: string | null | undefined) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

const toLocalInput = (value: string | null | undefined) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

export const AdminPartnerCampaigns: React.FC = () => {
  const [state, setState] = useState<AdminCommercialState | null>(null);
  const [producers, setProducers] = useState<Producer[]>([]);
  const [selectedProducerId, setSelectedProducerId] = useState('');
  const [draft, setDraft] = useState<CampaignDraftInput>(EMPTY_DRAFT);
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
  const [previewCampaignId, setPreviewCampaignId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

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
      setError(commercialResult.reason instanceof Error
        ? commercialResult.reason.message
        : 'Unable to load commercial Partner state.');
    }

    if (producerResult.status === 'fulfilled') {
      const sorted = [...producerResult.value].sort((a, b) => a.name.localeCompare(b.name));
      setProducers(sorted);
      setSelectedProducerId((current) => current || sorted[0]?.id || '');
    } else {
      setProducers([]);
      setError((current) => current || 'Unable to load the producer catalogue.');
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setDraft((current) => ({
      ...current,
      producerId: selectedProducerId,
    }));
    setEditingCampaignId(null);
    setPreviewCampaignId(null);
  }, [selectedProducerId]);

  const selectedProducer = useMemo(
    () => producers.find((producer) => producer.id === selectedProducerId) || null,
    [producers, selectedProducerId]
  );
  const partner = useMemo(
    () => state?.partners.find((item) => item.producer_id === selectedProducerId) || null,
    [state?.partners, selectedProducerId]
  );
  const subscriptions = useMemo(
    () => state?.subscriptions.filter((item) => item.producer_id === selectedProducerId) || [],
    [state?.subscriptions, selectedProducerId]
  );
  const campaigns = useMemo(
    () =>
      (state?.campaigns.filter((item) => item.producer_id === selectedProducerId) || [])
        .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)),
    [state?.campaigns, selectedProducerId]
  );
  const audit = useMemo(
    () =>
      (state?.audit.filter((item) => item.producer_id === selectedProducerId) || [])
        .slice(0, 25),
    [state?.audit, selectedProducerId]
  );

  const metricsByCampaign = useMemo(
    () => new Map((state?.campaignMetrics || []).map((metric) => [metric.campaign_id, metric])),
    [state?.campaignMetrics]
  );
  const placementsByCampaign = useMemo(() => {
    const map = new Map<string, CommercialPlacement[]>();
    for (const item of state?.placements || []) {
      const list = map.get(item.campaign_id) || [];
      list.push(item.placement);
      map.set(item.campaign_id, list);
    }
    return map;
  }, [state?.placements]);

  const resetDraft = () => {
    setEditingCampaignId(null);
    setDraft({
      ...EMPTY_DRAFT,
      producerId: selectedProducerId,
    });
  };

  const run = async (key: string, action: () => Promise<unknown>, success: string) => {
    setBusyKey(key);
    setError(null);
    setNotice(null);
    try {
      await action();
      setNotice(success);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Partner operation failed.');
    } finally {
      setBusyKey(null);
    }
  };

  const changePartner = async (status: 'pending' | 'active' | 'suspended' | 'ended') => {
    if (!selectedProducer) return;
    const verb = status === 'active'
      ? 'activate Partner distribution'
      : status === 'suspended'
        ? 'suspend paid distribution'
        : status === 'ended'
          ? 'end the commercial relationship'
          : 'reopen this producer as a pending Partner';
    if (!window.confirm(`${verb} for ${selectedProducer.name}? The free listing and trust/safety facts will remain unchanged.`)) return;

    await run(
      `partner:${status}`,
      () => setAdminCommercialPartnerStatus(
        selectedProducer.id,
        status,
        'Admin commercial control',
        'admin_pilot'
      ),
      `Partner state changed to ${status}.`
    );
  };

  const togglePlacement = (placement: CommercialPlacement) => {
    setDraft((current) => {
      const exists = current.placements.includes(placement);
      const placements = exists
        ? current.placements.filter((value) => value !== placement)
        : [...current.placements, placement];
      return { ...current, placements };
    });
  };

  const saveDraft = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedProducerId || partner?.status !== 'active') {
      setError('Activate the producer as a Partner before creating a campaign.');
      return;
    }
    if (!draft.headline.trim()) {
      setError('Campaign headline is required.');
      return;
    }
    if (!draft.placements.length) {
      setError('Choose at least one placement.');
      return;
    }

    const input = {
      ...draft,
      producerId: selectedProducerId,
      startsAt: toIso(draft.startsAt),
      endsAt: toIso(draft.endsAt),
    };

    if (editingCampaignId) {
      await run(
        `campaign-edit:${editingCampaignId}`,
        () => updateAdminPartnerCampaign(editingCampaignId, {
          headline: input.headline,
          message: input.message,
          startsAt: input.startsAt,
          endsAt: input.endsAt,
          placements: input.placements,
        }),
        'Campaign draft updated.'
      );
    } else {
      await run(
        'campaign-create',
        () => createAdminPartnerCampaign(input),
        'Campaign draft created.'
      );
    }
    resetDraft();
  };

  const beginEdit = (campaign: CommercialPartnerCampaign) => {
    setEditingCampaignId(campaign.id);
    setDraft({
      producerId: campaign.producer_id,
      campaignType: campaign.campaign_type,
      headline: campaign.headline,
      message: campaign.message || '',
      startsAt: toLocalInput(campaign.starts_at),
      endsAt: toLocalInput(campaign.ends_at),
      placements: placementsByCampaign.get(campaign.id) || ['region_discovery'],
    });
  };

  const transition = async (
    campaign: CommercialPartnerCampaign,
    status: CommercialCampaignStatus,
    reason?: string
  ) => {
    let cleanReason = reason || '';

    if (status === 'approved') {
      const reviewed = window.confirm(
        'Confirm this campaign copy has been checked against the producer’s current canonical visitability, booking/access and safety facts, and does not override or contradict them.'
      );
      if (!reviewed) return;
      cleanReason = 'Admin reviewed campaign copy against canonical visitability, booking/access and safety facts.';
    }

    if (status === 'rejected') {
      cleanReason = window.prompt('Reason for rejecting this campaign?')?.trim() || '';
      if (cleanReason.length < 3) {
        setError('A short rejection reason is required.');
        return;
      }
    }
    if (status === 'withdrawn' && !window.confirm('Withdraw this campaign? It will no longer be eligible for distribution.')) return;
    if (status === 'completed' && !window.confirm('Mark this campaign completed?')) return;

    await run(
      `campaign-status:${campaign.id}:${status}`,
      () => transitionAdminPartnerCampaign(campaign.id, status, cleanReason || undefined),
      `Campaign moved to ${label(status)}.`
    );
  };

  const renderActions = (campaign: CommercialPartnerCampaign) => {
    const busy = busyKey?.includes(campaign.id);
    const button = (
      text: string,
      icon: React.ReactNode,
      onClick: () => void,
      className = ''
    ) => (
      <button
        type="button"
        disabled={busy}
        onClick={onClick}
        className={`inline-flex items-center gap-1 rounded-lg border border-white/10 bg-stone-950 px-2.5 py-1.5 text-[10px] font-bold text-stone-300 hover:text-white disabled:opacity-50 ${className}`}
      >
        {icon}
        {text}
      </button>
    );

    switch (campaign.status) {
      case 'draft':
        return (
          <>
            {button('Edit', <Edit3 className="h-3 w-3" />, () => beginEdit(campaign))}
            {button('Submit review', <Send className="h-3 w-3" />, () => void transition(campaign, 'awaiting_review'))}
            {button('Withdraw', <XCircle className="h-3 w-3" />, () => void transition(campaign, 'withdrawn'))}
          </>
        );
      case 'awaiting_review':
        return (
          <>
            {button('Approve', <CheckCircle2 className="h-3 w-3" />, () => void transition(campaign, 'approved'), 'text-emerald-300')}
            {button('Reject', <XCircle className="h-3 w-3" />, () => void transition(campaign, 'rejected'), 'text-rose-300')}
            {button('Back to draft', <RotateCcw className="h-3 w-3" />, () => void transition(campaign, 'draft'))}
          </>
        );
      case 'approved': {
        const futureStart = Boolean(campaign.starts_at && Date.parse(campaign.starts_at) > Date.now());
        return (
          <>
            {futureStart
              ? button('Schedule', <CalendarClock className="h-3 w-3" />, () => void transition(campaign, 'scheduled'), 'text-sky-300')
              : button('Activate', <PlayCircle className="h-3 w-3" />, () => void transition(campaign, 'active'), 'text-emerald-300')}
            {button('Withdraw', <XCircle className="h-3 w-3" />, () => void transition(campaign, 'withdrawn'))}
          </>
        );
      }
      case 'scheduled':
        return button('Withdraw', <XCircle className="h-3 w-3" />, () => void transition(campaign, 'withdrawn'));
      case 'active':
        return (
          <>
            {button('Pause', <PauseCircle className="h-3 w-3" />, () => void transition(campaign, 'paused'))}
            {button('Complete', <StopCircle className="h-3 w-3" />, () => void transition(campaign, 'completed'))}
            {button('Withdraw', <XCircle className="h-3 w-3" />, () => void transition(campaign, 'withdrawn'))}
          </>
        );
      case 'paused':
        return (
          <>
            {button('Resume', <PlayCircle className="h-3 w-3" />, () => void transition(campaign, 'active'), 'text-emerald-300')}
            {button('Complete', <StopCircle className="h-3 w-3" />, () => void transition(campaign, 'completed'))}
            {button('Withdraw', <XCircle className="h-3 w-3" />, () => void transition(campaign, 'withdrawn'))}
          </>
        );
      case 'rejected':
        return (
          <>
            {button('Edit to draft', <Edit3 className="h-3 w-3" />, () => beginEdit(campaign))}
            {button('Withdraw', <XCircle className="h-3 w-3" />, () => void transition(campaign, 'withdrawn'))}
          </>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <section className="rounded-xl border border-white/10 bg-stone-900/60 px-4 py-8 text-center text-sm text-stone-400">
        <RefreshCw className="mx-auto mb-2 h-5 w-5 animate-spin text-amber-400" />
        Loading Partner operations…
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-white">
            <Megaphone className="h-4 w-4 text-amber-400" />
            Partner campaigns
          </h3>
          <p className="mt-1 max-w-3xl text-[11px] leading-relaxed text-stone-400">
            Commercial distribution is separate from Host ownership, verification, visitability and organic ranking. Only Admin-approved campaign state can reach public paid placements.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex items-center gap-1.5 self-start rounded-lg border border-white/10 bg-stone-900 px-2.5 py-1.5 text-xs font-semibold text-stone-300 hover:text-white"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {(error || notice) && (
        <div className={`rounded-xl border px-3 py-2 text-xs ${
          error
            ? 'border-rose-500/30 bg-rose-500/10 text-rose-200'
            : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
        }`}>
          {error || notice}
        </div>
      )}

      <div className="rounded-xl border border-white/10 bg-stone-900/60 p-4">
        <label className="text-[10px] font-bold uppercase tracking-wide text-stone-500" htmlFor="partner-admin-producer">
          Producer
        </label>
        <select
          id="partner-admin-producer"
          value={selectedProducerId}
          onChange={(event) => setSelectedProducerId(event.target.value)}
          className="mt-2 w-full rounded-xl border border-white/10 bg-stone-950 px-3 py-2.5 text-xs font-semibold text-white"
        >
          {producers.map((producer) => (
            <option key={producer.id} value={producer.id}>
              {producer.name} · {label(producer.destination)}
            </option>
          ))}
        </select>

        {selectedProducer && (
          <div className="mt-3 flex flex-col gap-3 rounded-xl border border-white/10 bg-stone-950/60 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-white">{selectedProducer.name}</span>
                <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${statusClass(partner?.status || 'free')}`}>
                  {partner ? `Partner · ${label(partner.status)}` : 'Free listing'}
                </span>
              </div>
              <p className="mt-1 text-[10px] text-stone-500">
                {partner?.activation_source === 'admin_pilot'
                  ? 'Managed pilot relationship; Stripe is not the current authority.'
                  : partner
                    ? 'Commercial relationship recorded in the trusted Partner layer.'
                    : 'No commercial relationship. Organic discovery remains unaffected.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {!partner && (
                <button
                  type="button"
                  disabled={Boolean(busyKey)}
                  onClick={() => void changePartner('active')}
                  className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-bold text-emerald-300 disabled:opacity-50"
                >
                  Activate pilot Partner
                </button>
              )}
              {partner?.status === 'pending' && (
                <button type="button" onClick={() => void changePartner('active')} className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-bold text-emerald-300">Activate</button>
              )}
              {partner?.status === 'active' && (
                <button type="button" onClick={() => void changePartner('suspended')} className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-[10px] font-bold text-amber-300">Suspend</button>
              )}
              {partner?.status === 'suspended' && (
                <button type="button" onClick={() => void changePartner('active')} className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-bold text-emerald-300">Reactivate</button>
              )}
              {partner?.status === 'ended' && (
                <button type="button" onClick={() => void changePartner('pending')} className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-[10px] font-bold text-sky-300">Reopen pending</button>
              )}
              {partner && partner.status !== 'ended' && (
                <button type="button" onClick={() => void changePartner('ended')} className="rounded-lg border border-rose-500/25 bg-rose-500/10 px-3 py-1.5 text-[10px] font-bold text-rose-300">End relationship</button>
              )}
            </div>
          </div>
        )}

        {subscriptions.length > 0 && (
          <div className="mt-2 text-[10px] text-stone-500">
            Subscription: <span className="font-semibold text-stone-300">{label(subscriptions[0].status)}</span>
          </div>
        )}
      </div>

      {partner?.status === 'active' && (
        <form onSubmit={saveDraft} className="rounded-xl border border-white/10 bg-stone-900/60 p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-white">{editingCampaignId ? 'Edit campaign draft' : 'Create campaign draft'}</h4>
              <p className="mt-0.5 text-[10px] text-stone-500">Canonical destination/category are server-derived from the producer and cannot be changed here.</p>
            </div>
            {editingCampaignId && (
              <button type="button" onClick={resetDraft} className="text-[10px] font-semibold text-stone-400 hover:text-white">Cancel edit</button>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-[10px] font-semibold text-stone-400">
              Campaign type
              <select
                value={draft.campaignType}
                disabled={Boolean(editingCampaignId)}
                onChange={(event) => setDraft((current) => ({ ...current, campaignType: event.target.value as CommercialCampaignType }))}
                className="mt-1 w-full rounded-lg border border-white/10 bg-stone-950 px-2.5 py-2 text-xs text-white disabled:opacity-50"
              >
                <option value="regional_featured">Regional featured</option>
                <option value="trip_contextual">Trip contextual</option>
                <option value="seasonal_notice">Seasonal / open-day notice</option>
              </select>
            </label>

            <label className="text-[10px] font-semibold text-stone-400">
              Headline
              <input
                value={draft.headline}
                maxLength={120}
                onChange={(event) => setDraft((current) => ({ ...current, headline: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-white/10 bg-stone-950 px-2.5 py-2 text-xs text-white"
                placeholder="e.g. Harvest visits this week"
              />
            </label>
          </div>

          <label className="block text-[10px] font-semibold text-stone-400">
            Commercial message
            <textarea
              value={draft.message || ''}
              maxLength={500}
              rows={3}
              onChange={(event) => setDraft((current) => ({ ...current, message: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-white/10 bg-stone-950 px-2.5 py-2 text-xs text-white"
              placeholder="Keep this factual. Campaign copy never overrides canonical visitability information."
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-[10px] font-semibold text-stone-400">
              Start
              <input
                type="datetime-local"
                value={draft.startsAt || ''}
                onChange={(event) => setDraft((current) => ({ ...current, startsAt: event.target.value || null }))}
                className="mt-1 w-full rounded-lg border border-white/10 bg-stone-950 px-2.5 py-2 text-xs text-white"
              />
            </label>
            <label className="text-[10px] font-semibold text-stone-400">
              End
              <input
                type="datetime-local"
                value={draft.endsAt || ''}
                onChange={(event) => setDraft((current) => ({ ...current, endsAt: event.target.value || null }))}
                className="mt-1 w-full rounded-lg border border-white/10 bg-stone-950 px-2.5 py-2 text-xs text-white"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            {(['region_discovery', 'trip_preparation'] as CommercialPlacement[]).map((placement) => (
              <label key={placement} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-stone-950 px-2.5 py-2 text-[10px] text-stone-300">
                <input
                  type="checkbox"
                  checked={draft.placements.includes(placement)}
                  onChange={() => togglePlacement(placement)}
                />
                {label(placement)}
              </label>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={Boolean(busyKey)}
              className="rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-bold text-stone-950 hover:bg-amber-400 disabled:opacity-50"
            >
              {editingCampaignId ? 'Save draft' : 'Create draft'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {campaigns.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-stone-900/50 px-4 py-7 text-center text-xs text-stone-500">
            No campaigns for this producer.
          </div>
        ) : campaigns.map((campaign) => {
          const metric = metricsByCampaign.get(campaign.id);
          const directActions = metric
            ? metric.website_clicks + metric.phone_clicks + metric.email_clicks + metric.directions_clicks
            : 0;

          return (
            <article key={campaign.id} className="rounded-xl border border-white/10 bg-stone-900/60 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-xs font-bold text-white">{campaign.headline}</h4>
                    <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${statusClass(campaign.status)}`}>
                      {label(campaign.status)}
                    </span>
                    <span className="rounded-full border border-white/10 bg-stone-950 px-2 py-0.5 text-[9px] text-stone-500">
                      {label(campaign.campaign_type)}
                    </span>
                  </div>
                  {campaign.message && <p className="mt-1 text-[11px] leading-relaxed text-stone-400">{campaign.message}</p>}
                  <div className="mt-2 flex flex-wrap gap-1.5 text-[9px] text-stone-500">
                    {(placementsByCampaign.get(campaign.id) || []).map((placement) => (
                      <span key={placement} className="rounded-md border border-white/10 bg-stone-950 px-1.5 py-0.5">{label(placement)}</span>
                    ))}
                    {campaign.starts_at && <span>Starts {new Date(campaign.starts_at).toLocaleString()}</span>}
                    {campaign.ends_at && <span>Ends {new Date(campaign.ends_at).toLocaleString()}</span>}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPreviewCampaignId(previewCampaignId === campaign.id ? null : campaign.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-stone-950 px-2.5 py-1.5 text-[10px] font-bold text-stone-300 hover:text-white"
                  >
                    <Eye className="h-3 w-3" />
                    Preview
                  </button>
                  {renderActions(campaign)}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                <AdminMetric label="Qualified views" value={metric?.qualified_impressions || 0} />
                <AdminMetric label="Opens" value={metric?.opens || 0} />
                <AdminMetric label="Saves" value={metric?.saves || 0} />
                <AdminMetric label="Trip adds" value={metric?.trip_additions || 0} />
                <AdminMetric label="Direct actions" value={directActions} />
              </div>

              {previewCampaignId === campaign.id && selectedProducer && (
                <div className="mt-3 rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-md border border-amber-400/25 bg-amber-400/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-amber-300">Featured Partner</span>
                    <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-stone-500">Paid placement · Preview</span>
                  </div>
                  <div className="text-sm font-bold text-white">{selectedProducer.name}</div>
                  <div className="mt-2 rounded-xl border border-white/10 bg-black/15 p-3">
                    <div className="text-xs font-bold text-stone-100">{campaign.headline}</div>
                    {campaign.message && <p className="mt-1 text-[11px] leading-relaxed text-stone-400">{campaign.message}</p>}
                  </div>
                  <p className="mt-2 text-[9px] leading-relaxed text-stone-500">
                    This producer paid for this clearly labelled placement. Payment does not change TerroirTrail verification, visitability, road/access facts, or organic producer ordering.
                  </p>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-stone-900/60 p-4">
          <h4 className="flex items-center gap-2 text-xs font-bold text-white">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Commercial guardrails
          </h4>
          <ul className="mt-2 space-y-1 text-[10px] leading-relaxed text-stone-500">
            <li>• Paid status never changes organic ordering, verification or access/safety facts.</li>
            <li>• Scheduled/active state requires an active Partner relationship.</li>
            <li>• Scheduled campaigns auto-start and campaigns auto-complete at their stored window.</li>
            <li>• Results are exposure/intent signals, not bookings, visits or revenue.</li>
          </ul>
        </div>

        <div className="rounded-xl border border-white/10 bg-stone-900/60 p-4">
          <h4 className="flex items-center gap-2 text-xs font-bold text-white">
            <BarChart3 className="h-3.5 w-3.5 text-sky-400" />
            Recent commercial audit
          </h4>
          {audit.length === 0 ? (
            <p className="mt-2 text-[10px] text-stone-500">No commercial audit entries for this producer.</p>
          ) : (
            <div className="mt-2 max-h-44 space-y-1.5 overflow-y-auto">
              {audit.map((entry) => (
                <div key={entry.id} className="rounded-lg border border-white/5 bg-stone-950/60 px-2.5 py-2 text-[9px] text-stone-500">
                  <div className="font-semibold text-stone-300">{label(entry.event_type)}</div>
                  <div className="mt-0.5">
                    {entry.from_status ? `${label(entry.from_status)} → ${label(entry.to_status || '')}` : label(entry.to_status || '')}
                    {' · '}
                    {new Date(entry.occurred_at).toLocaleString()}
                  </div>
                  {entry.reason && <div className="mt-0.5 text-stone-600">{entry.reason}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const AdminMetric: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="rounded-lg border border-white/10 bg-stone-950/60 px-2.5 py-2">
    <div className="text-[9px] text-stone-500">{label}</div>
    <div className="mt-0.5 text-sm font-bold text-white">{value}</div>
  </div>
);
