import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  BarChart3,
  CalendarDays,
  Eye,
  ExternalLink,
  MapPinned,
  Megaphone,
  RefreshCw,
  Route,
} from 'lucide-react';
import {
  fetchHostCommercialState,
  type CommercialCampaignResult,
  type CommercialPartnerCampaign,
  type HostCommercialState,
} from '../../services/commercialPartnerApi';

interface ProducerPromotionPanelProps {
  producerId: string;
  isReadOnlyPreview?: boolean;
}

const formatValue = (value: number) => new Intl.NumberFormat('en-GB').format(value);

const formatDate = (value: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const label = (value: string) =>
  value
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());

const statusClass = (status: string) => {
  if (status === 'active') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';
  if (status === 'scheduled' || status === 'approved') return 'border-sky-500/30 bg-sky-500/10 text-sky-300';
  if (status === 'paused' || status === 'pending' || status === 'awaiting_review') return 'border-amber-500/30 bg-amber-500/10 text-amber-300';
  if (status === 'rejected' || status === 'ended' || status === 'expired') return 'border-rose-500/30 bg-rose-500/10 text-rose-300';
  return 'border-white/10 bg-stone-900 text-stone-400';
};

const ResultMetric: React.FC<{
  label: string;
  value: number;
  icon: React.ReactNode;
}> = ({ label: metricLabel, value, icon }) => (
  <div className="rounded-xl border border-white/10 bg-stone-950/65 p-3">
    <div className="flex items-center justify-between gap-2 text-stone-500">
      <span className="text-[9px] font-bold uppercase tracking-wide">{metricLabel}</span>
      {icon}
    </div>
    <div className="mt-1.5 text-lg font-bold text-white">{formatValue(value)}</div>
  </div>
);

export const ProducerPromotionPanel: React.FC<ProducerPromotionPanelProps> = ({
  producerId,
  isReadOnlyPreview = false,
}) => {
  const [state, setState] = useState<HostCommercialState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchHostCommercialState();
      setState(response.state);
    } catch (err) {
      setState(null);
      setError(err instanceof Error ? err.message : 'Unable to load Partner status.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, producerId]);

  const partner = state?.partners.find((item) => item.producer_id === producerId);
  const subscription = state?.subscriptions
    .filter((item) => item.producer_id === producerId)
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0];

  const campaigns = useMemo(
    () =>
      (state?.campaigns || [])
        .filter((campaign) => campaign.producer_id === producerId)
        .sort((a, b) => b.updated_at.localeCompare(a.updated_at)),
    [state?.campaigns, producerId]
  );

  const placementMap = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const placement of state?.placements || []) {
      const current = map.get(placement.campaign_id) || [];
      current.push(placement.placement);
      map.set(placement.campaign_id, current);
    }
    return map;
  }, [state?.placements]);

  const resultMap = useMemo(() => {
    const map = new Map<string, CommercialCampaignResult>();
    for (const result of state?.campaignResults || []) {
      map.set(result.campaign_id, result);
    }
    return map;
  }, [state?.campaignResults]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-stone-900/60 px-4 py-10 text-center text-sm text-stone-400">
        <RefreshCw className="mx-auto mb-3 h-5 w-5 animate-spin text-amber-400" />
        Loading Partner promotions…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-300" />
          <div className="min-w-0">
            <div className="text-sm font-bold text-white">Partner information unavailable</div>
            <p className="mt-1 text-xs text-stone-400">{error}</p>
            <button
              type="button"
              onClick={() => void load()}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-stone-950 px-3 py-2 text-xs font-bold text-stone-300 hover:text-white"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isReadOnlyPreview && (
        <div className="rounded-xl border border-sky-500/25 bg-sky-500/10 px-3 py-2 text-xs text-sky-200">
          Admin preview is read-only. Commercial Partner state can only be changed through trusted Admin controls.
        </div>
      )}

      <section className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Megaphone className="h-4 w-4 text-amber-400" />
              TerroirTrail Partner
            </div>
            <p className="mt-1 max-w-2xl text-[11px] leading-relaxed text-stone-400">
              Paid promotion is separate from your free listing, verified Host ownership, visitability, road/access facts and organic producer ordering.
            </p>
          </div>
          <span className={`w-fit rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide ${statusClass(partner?.status || 'not_active')}`}>
            {partner ? label(partner.status) : 'Not active'}
          </span>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-stone-950/50 px-3 py-2.5">
            <div className="text-[9px] font-bold uppercase tracking-wide text-stone-500">Relationship</div>
            <div className="mt-1 text-xs font-semibold text-stone-200">
              {partner
                ? partner.activation_source === 'admin_pilot'
                  ? 'Controlled Partner pilot'
                  : 'Partner subscription'
                : 'Free producer listing'}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-stone-950/50 px-3 py-2.5">
            <div className="text-[9px] font-bold uppercase tracking-wide text-stone-500">Billing</div>
            <div className="mt-1 text-xs font-semibold text-stone-200">
              {subscription ? `${label(subscription.status)} · ${subscription.plan_code}` : 'No subscription connected'}
            </div>
          </div>
        </div>
      </section>

      {!partner ? (
        <section className="rounded-2xl border border-white/10 bg-stone-900/60 p-5">
          <div className="text-sm font-bold text-white">No paid promotion is running.</div>
          <p className="mt-1 text-xs leading-relaxed text-stone-400">
            Your producer remains discoverable through the normal free TerroirTrail catalogue. Partner billing is not yet self-service in this build.
          </p>
        </section>
      ) : campaigns.length === 0 ? (
        <section className="rounded-2xl border border-white/10 bg-stone-900/60 p-5">
          <div className="text-sm font-bold text-white">No Partner campaigns yet.</div>
          <p className="mt-1 text-xs leading-relaxed text-stone-400">
            Partner status does not automatically place paid content. A campaign must be created, reviewed and explicitly activated by TerroirTrail Admin.
          </p>
        </section>
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign: CommercialPartnerCampaign) => {
            const result = resultMap.get(campaign.id);
            const impressions = result?.qualified_impressions || 0;
            const directActions =
              (result?.website_clicks || 0) +
              (result?.phone_clicks || 0) +
              (result?.email_clicks || 0) +
              (result?.directions_clicks || 0);
            const campaignPlacements = placementMap.get(campaign.id) || [];
            const lowVolume = impressions < 25;

            return (
              <section key={campaign.id} className="rounded-2xl border border-white/10 bg-stone-900/60 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${statusClass(campaign.status)}`}>
                        {label(campaign.status)}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wide text-stone-500">
                        {label(campaign.campaign_type)}
                      </span>
                    </div>
                    <h3 className="mt-2 text-sm font-bold text-white">{campaign.headline}</h3>
                    {campaign.message && (
                      <p className="mt-1 text-xs leading-relaxed text-stone-400">{campaign.message}</p>
                    )}
                  </div>
                  <div className="shrink-0 text-right text-[10px] text-stone-500">
                    {(campaign.starts_at || campaign.ends_at) && (
                      <div className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatDate(campaign.starts_at) || 'Open start'}
                        {' – '}
                        {formatDate(campaign.ends_at) || 'Open end'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {campaignPlacements.map((placement) => (
                    <span key={placement} className="rounded-lg border border-white/10 bg-stone-950/60 px-2 py-1 text-[9px] text-stone-400">
                      {label(placement)}
                    </span>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-5">
                  <ResultMetric label="Qualified views" value={impressions} icon={<Eye className="h-3.5 w-3.5" />} />
                  <ResultMetric label="Profile opens" value={result?.opens || 0} icon={<ExternalLink className="h-3.5 w-3.5" />} />
                  <ResultMetric label="Saves" value={result?.saves || 0} icon={<BarChart3 className="h-3.5 w-3.5" />} />
                  <ResultMetric label="Trip adds" value={result?.trip_additions || 0} icon={<MapPinned className="h-3.5 w-3.5" />} />
                  <ResultMetric label="Direct actions" value={directActions} icon={<Route className="h-3.5 w-3.5" />} />
                </div>

                <div className="mt-3 rounded-xl border border-white/10 bg-stone-950/45 px-3 py-2 text-[10px] leading-relaxed text-stone-500">
                  {lowVolume ? (
                    <span>
                      <strong className="text-amber-300">Early signal · low volume.</strong>{' '}
                      Results are not yet large enough for strong conclusions.
                    </span>
                  ) : (
                    <span>
                      Data through {formatDate(result?.data_through || null) || 'the latest aggregate'}.
                    </span>
                  )}
                  {' '}These are paid-distribution exposure and intent actions; they do not represent confirmed bookings, visits or revenue.
                </div>
              </section>
            );
          })}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-stone-900 px-3 py-2 text-xs font-semibold text-stone-300 hover:text-white"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh promotions
        </button>
      </div>
    </div>
  );
};
