import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  CalendarClock,
  Eye,
  ExternalLink,
  MapPin,
  Megaphone,
  MousePointerClick,
  RefreshCw,
  Route,
  Save,
} from 'lucide-react';
import {
  fetchHostCommercialState,
  type CommercialCampaignMetrics,
  type CommercialPartnerCampaign,
  type HostCommercialState,
} from '../../services/commercialPartnerApi';

interface ProducerCommercialPanelProps {
  producerId: string;
}

const statusClass = (status: string) => {
  if (status === 'active') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';
  if (status === 'scheduled' || status === 'approved') return 'border-sky-500/30 bg-sky-500/10 text-sky-300';
  if (status === 'paused' || status === 'pending' || status === 'awaiting_review') {
    return 'border-amber-500/30 bg-amber-500/10 text-amber-300';
  }
  if (status === 'rejected' || status === 'ended') return 'border-rose-500/30 bg-rose-500/10 text-rose-300';
  return 'border-white/10 bg-white/5 text-stone-300';
};

const formatStatus = (value: string) =>
  value.replaceAll('_', ' ').replace(/w/g, (letter) => letter.toUpperCase());

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

const metricFor = (
  campaign: CommercialPartnerCampaign,
  metrics: CommercialCampaignMetrics[]
): CommercialCampaignMetrics => {
  return metrics.find((metric) => metric.campaign_id === campaign.id) || {
    campaign_id: campaign.id,
    producer_id: campaign.producer_id,
    first_activity_day: null,
    last_activity_day: null,
    qualified_impressions: 0,
    opens: 0,
    saves: 0,
    trip_additions: 0,
    website_clicks: 0,
    phone_clicks: 0,
    email_clicks: 0,
    directions_clicks: 0,
  };
};

export const ProducerCommercialPanel: React.FC<ProducerCommercialPanelProps> = ({
  producerId,
}) => {
  const [state, setState] = useState<HostCommercialState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchHostCommercialState();
      setState(result.state);
    } catch (err) {
      setState(null);
      setError(err instanceof Error ? err.message : 'Unable to load Partner information.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, producerId]);

  const partner = useMemo(
    () => state?.partners.find((item) => item.producer_id === producerId) || null,
    [state?.partners, producerId]
  );
  const subscriptions = useMemo(
    () => state?.subscriptions.filter((item) => item.producer_id === producerId) || [],
    [state?.subscriptions, producerId]
  );
  const campaigns = useMemo(
    () =>
      (state?.campaigns.filter((item) => item.producer_id === producerId) || [])
        .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)),
    [state?.campaigns, producerId]
  );
  const placementsByCampaign = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const row of state?.placements || []) {
      const existing = map.get(row.campaign_id) || [];
      existing.push(row.placement);
      map.set(row.campaign_id, existing);
    }
    return map;
  }, [state?.placements]);

  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-stone-400">
        <RefreshCw className="mx-auto mb-3 h-5 w-5 animate-spin text-amber-400" />
        Loading Partner visibility…
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl space-y-3">
        <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 p-4 text-xs text-rose-200">
          {error}
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-stone-900 px-3 py-2 text-xs font-bold text-stone-300 hover:text-white"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </button>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="max-w-2xl space-y-4">
        <div className="rounded-2xl border border-white/10 bg-stone-900/60 p-5">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Megaphone className="h-4 w-4 text-amber-400" />
            Partner visibility
          </div>
          <p className="mt-2 text-xs leading-relaxed text-stone-400">
            This listing is currently on TerroirTrail's free organic discovery layer. No paid Partner distribution is active for this producer.
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-stone-500">
            Free listing visibility, factual Host controls, visitability and road/access information do not depend on Partner status. The first Partner pilot is managed by TerroirTrail rather than self-serve purchasing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-4">
      <section className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Megaphone className="h-4 w-4 text-amber-300" />
              TerroirTrail Partner
            </div>
            <p className="mt-1 max-w-2xl text-[11px] leading-relaxed text-stone-400">
              Partner status enables approved, clearly labelled paid distribution. It does not change TerroirTrail verification, safety/access facts or organic ranking.
            </p>
          </div>
          <span className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusClass(partner.status)}`}>
            {formatStatus(partner.status)}
          </span>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-stone-950/60 p-3">
            <div className="text-[9px] font-bold uppercase tracking-wide text-stone-500">Relationship</div>
            <div className="mt-1 text-xs font-semibold text-stone-200">
              {partner.activation_source === 'admin_pilot' ? 'Managed pilot' : 'Stripe subscription'}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-stone-950/60 p-3">
            <div className="text-[9px] font-bold uppercase tracking-wide text-stone-500">Subscription</div>
            <div className="mt-1 text-xs font-semibold text-stone-200">
              {subscriptions[0] ? formatStatus(subscriptions[0].status) : 'Not connected'}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-stone-950/60 p-3">
            <div className="text-[9px] font-bold uppercase tracking-wide text-stone-500">Campaigns</div>
            <div className="mt-1 text-xs font-semibold text-stone-200">{campaigns.length}</div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-white">
              <BarChart3 className="h-4 w-4 text-emerald-400" />
              Promotion results
            </h3>
            <p className="mt-1 text-[10px] text-stone-500">
              Exposure and on-platform intent only. These figures do not prove a booking, visit or revenue outcome.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-stone-900 px-2.5 py-1.5 text-[10px] font-semibold text-stone-400 hover:text-white"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </button>
        </div>

        {campaigns.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-stone-900/50 px-4 py-8 text-center text-xs text-stone-500">
            No Partner campaigns have been created for this producer yet.
          </div>
        ) : (
          campaigns.map((campaign) => {
            const metric = metricFor(campaign, state?.campaignMetrics || []);
            const directActions =
              metric.website_clicks +
              metric.phone_clicks +
              metric.email_clicks +
              metric.directions_clicks;
            const lowVolume = metric.qualified_impressions < 100;
            const placementLabels = placementsByCampaign.get(campaign.id) || [];

            return (
              <article key={campaign.id} className="rounded-2xl border border-white/10 bg-stone-900/60 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{campaign.headline}</h4>
                      <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${statusClass(campaign.status)}`}>
                        {formatStatus(campaign.status)}
                      </span>
                      {lowVolume && (
                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-semibold text-stone-500">
                          Low-volume sample
                        </span>
                      )}
                    </div>
                    {campaign.message && (
                      <p className="mt-1 text-[11px] leading-relaxed text-stone-400">{campaign.message}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-1.5 text-[9px] text-stone-500">
                      {placementLabels.map((placement) => (
                        <span key={placement} className="rounded-md border border-white/10 bg-stone-950/60 px-1.5 py-0.5">
                          {formatStatus(placement)}
                        </span>
                      ))}
                      {(campaign.starts_at || campaign.ends_at) && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-stone-950/60 px-1.5 py-0.5">
                          <CalendarClock className="h-3 w-3" />
                          {formatDate(campaign.starts_at) || 'Open start'} – {formatDate(campaign.ends_at) || 'Open end'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
                  <ResultMetric icon={<Eye className="h-3.5 w-3.5" />} label="Qualified views" value={metric.qualified_impressions} />
                  <ResultMetric icon={<MousePointerClick className="h-3.5 w-3.5" />} label="Profile opens" value={metric.opens} />
                  <ResultMetric icon={<Save className="h-3.5 w-3.5" />} label="Saves" value={metric.saves} />
                  <ResultMetric icon={<MapPin className="h-3.5 w-3.5" />} label="Trip adds" value={metric.trip_additions} />
                  <ResultMetric icon={<ExternalLink className="h-3.5 w-3.5" />} label="Direct actions" value={directActions} />
                </div>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[9px] text-stone-600">
                  <span>Website {metric.website_clicks}</span>
                  <span>Phone {metric.phone_clicks}</span>
                  <span>Email {metric.email_clicks}</span>
                  <span className="inline-flex items-center gap-1"><Route className="h-3 w-3" /> Directions {metric.directions_clicks}</span>
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
};

const ResultMetric: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
}> = ({ icon, label, value }) => (
  <div className="rounded-xl border border-white/10 bg-stone-950/60 p-2.5">
    <div className="flex items-center gap-1.5 text-stone-500">
      {icon}
      <span className="text-[9px] font-semibold">{label}</span>
    </div>
    <div className="mt-1 text-base font-bold text-white">{value}</div>
  </div>
);
