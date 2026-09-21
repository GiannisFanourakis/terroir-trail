import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchAdminIntentMetrics,
  type AdminIntentMetrics,
} from '../../services/adminApi';

const WINDOWS = [7, 30, 90, 180] as const;
type WindowDays = (typeof WINDOWS)[number];
type ProducerRow = AdminIntentMetrics['producers'][number];

const label = (value: string) => value.replaceAll('_', ' ');
const format = (value: number) => String(value);

export const trendChangeLabel = (
  current: number,
  previous: number,
  previousWindowDays: number
): string => {
  const delta = current - previous;
  if (delta === 0) return `No change vs prior ${previousWindowDays}d`;
  return `${delta > 0 ? '+' : ''}${delta} vs prior ${previousWindowDays}d`;
};

export const comparisonReady = (
  producerCount: number,
  producerViews: number,
  policy: AdminIntentMetrics['comparison_policy']
): boolean =>
  producerCount >= policy.minimum_active_producers &&
  producerViews >= policy.minimum_producer_views;

const InsightMetric: React.FC<{
  labelText: string;
  value: number;
  previous: number;
  days: number;
}> = ({ labelText, value, previous, days }) => (
  <div className="rounded-lg bg-stone-950/70 px-3 py-2.5">
    <div className="text-[9px] uppercase tracking-wide text-stone-500">{labelText}</div>
    <div className="mt-1 text-lg font-bold text-white">{format(value)}</div>
    <div className="mt-0.5 text-[9px] text-stone-600">
      {trendChangeLabel(value, previous, days)}
    </div>
  </div>
);

const ContextCard: React.FC<{
  title: string;
  producerCount: number;
  producerViews: number;
  selectedViews: number;
  policy: AdminIntentMetrics['comparison_policy'];
}> = ({ title, producerCount, producerViews, selectedViews, policy }) => {
  const ready = comparisonReady(producerCount, producerViews, policy);
  return (
    <div className="rounded-lg border border-white/5 bg-stone-950/50 p-3">
      <div className="text-xs font-bold text-stone-200">{title}</div>
      {ready ? (
        <>
          <div className="mt-2 text-[10px] text-stone-400">
            {format(producerViews)} views across {format(producerCount)} active producers in this window.
          </div>
          <div className="mt-1 text-[10px] text-stone-300">
            Average: {(producerViews / producerCount).toFixed(1)} views per active producer · selected producer: {format(selectedViews)}.
          </div>
          <div className="mt-1 text-[9px] text-stone-600">Context only — not a ranking or quality score.</div>
        </>
      ) : (
        <div className="mt-2 text-[10px] leading-relaxed text-stone-500">
          Comparison withheld: {format(producerCount)} active producers and {format(producerViews)} views.
          Requires at least {format(policy.minimum_active_producers)} active producers and {format(policy.minimum_producer_views)} views.
        </div>
      )}
    </div>
  );
};

export const AdminIntentBaseline: React.FC = () => {
  const [days, setDays] = useState<WindowDays>(30);
  const [metrics, setMetrics] = useState<AdminIntentMetrics | null>(null);
  const [selectedProducerId, setSelectedProducerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setMetrics((await fetchAdminIntentMetrics(days)).metrics);
    } catch (err) {
      setMetrics(null);
      setError(err instanceof Error ? err.message : 'Producer insights are unavailable.');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (!metrics?.producers.length) {
      setSelectedProducerId(null);
      return;
    }
    setSelectedProducerId((current) =>
      current && metrics.producers.some((row) => row.producer_id === current)
        ? current
        : metrics.producers[0].producer_id
    );
  }, [metrics]);

  const selectedProducer = useMemo<ProducerRow | null>(
    () => metrics?.producers.find((row) => row.producer_id === selectedProducerId) ?? null,
    [metrics, selectedProducerId]
  );

  const totals = metrics?.totals;
  const affiliateCtr = totals?.affiliate_impressions
    ? ((totals.affiliate_clicks / totals.affiliate_impressions) * 100).toFixed(2)
    : '—';

  const regionContext = selectedProducer
    ? metrics?.regions.find((row) => row.destination === selectedProducer.destination) ?? null
    : null;
  const categoryContext = selectedProducer
    ? metrics?.categories.find((row) => row.category === selectedProducer.category) ?? null
    : null;

  return (
    <section className="rounded-xl border border-white/10 bg-stone-900/60 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white">Producer insights prototype</h3>
          <p className="text-[11px] text-stone-400 mt-1">
            Admin-only first-party intent signals. Directional only — a click or save is not proof of a visit, booking or purchase.
          </p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {WINDOWS.map((window) => (
            <button
              key={window}
              type="button"
              onClick={() => setDays(window)}
              className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold ${
                days === window
                  ? 'border-cyan-400/50 bg-cyan-400/10 text-cyan-200'
                  : 'border-white/10 bg-stone-950 text-stone-400'
              }`}
            >
              {window}d
            </button>
          ))}
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="px-2 py-1.5 rounded-lg border border-white/10 bg-stone-950 text-[10px] font-bold text-stone-400 disabled:opacity-50"
          >
            {loading ? 'Loading' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {error && <div className="text-[11px] text-rose-200">{error}</div>}

        {metrics && (
          <>
            {(totals?.producer_views || 0) < metrics.comparison_policy.minimum_producer_views && (
              <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-100">
                Early sample: {format(totals?.producer_views || 0)} producer views in this window. Use counts descriptively; comparative context remains withheld until the minimum sample is reached.
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2">
              {[
                ['Views', totals?.producer_views || 0],
                ['Saves', totals?.saves || 0],
                ['Trip adds', totals?.trip_additions || 0],
                ['Website', totals?.website_clicks || 0],
                ['Phone', totals?.phone_clicks || 0],
                ['Email', totals?.email_clicks || 0],
                ['Directions', totals?.directions_clicks || 0],
              ].map(([name, value]) => (
                <div key={String(name)} className="rounded-lg bg-stone-950/70 px-3 py-2.5">
                  <div className="text-[9px] uppercase text-stone-500">{name}</div>
                  <div className="mt-1 text-lg font-bold text-white">{format(Number(value))}</div>
                </div>
              ))}
            </div>

            {metrics.producers.length > 0 ? (
              <div className="rounded-xl border border-white/10 bg-stone-950/35 p-3 sm:p-4 space-y-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-cyan-300">Internal producer view</div>
                    <div className="mt-1 text-[10px] text-stone-500">
                      Select a producer to inspect operationally useful signals without exposing traveler identities or private trip/tasting-note contents.
                    </div>
                  </div>
                  <label className="text-[10px] text-stone-400 min-w-0 md:w-80">
                    Producer
                    <select
                      aria-label="Producer insights producer"
                      value={selectedProducerId || ''}
                      onChange={(event) => setSelectedProducerId(event.target.value)}
                      className="mt-1 w-full rounded-lg border border-white/10 bg-stone-950 px-2.5 py-2 text-xs text-stone-200"
                    >
                      {metrics.producers.map((producer) => (
                        <option key={producer.producer_id} value={producer.producer_id}>
                          {producer.producer_name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {selectedProducer && (
                  <>
                    <div>
                      <div className="text-sm font-bold text-white">{selectedProducer.producer_name}</div>
                      <div className="text-[10px] text-stone-500 mt-0.5">
                        {label(selectedProducer.destination)} · {label(selectedProducer.category)} · {days} day window
                      </div>
                    </div>

                    {selectedProducer.producer_views < 10 && (
                      <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-[10px] text-amber-100">
                        Very small producer sample ({format(selectedProducer.producer_views)} views). Counts are factual, but changes should not be interpreted as stable demand trends yet.
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2">
                      <InsightMetric labelText="Profile views" value={selectedProducer.producer_views} previous={selectedProducer.previous.producer_views} days={metrics.comparison_policy.previous_window_days} />
                      <InsightMetric labelText="Saves" value={selectedProducer.saves} previous={selectedProducer.previous.saves} days={metrics.comparison_policy.previous_window_days} />
                      <InsightMetric labelText="Trip adds" value={selectedProducer.trip_additions} previous={selectedProducer.previous.trip_additions} days={metrics.comparison_policy.previous_window_days} />
                      <InsightMetric labelText="Website clicks" value={selectedProducer.website_clicks} previous={selectedProducer.previous.website_clicks} days={metrics.comparison_policy.previous_window_days} />
                      <InsightMetric labelText="Phone actions" value={selectedProducer.phone_clicks} previous={selectedProducer.previous.phone_clicks} days={metrics.comparison_policy.previous_window_days} />
                      <InsightMetric labelText="Email actions" value={selectedProducer.email_clicks} previous={selectedProducer.previous.email_clicks} days={metrics.comparison_policy.previous_window_days} />
                      <InsightMetric labelText="Directions" value={selectedProducer.directions_clicks} previous={selectedProducer.previous.directions_clicks} days={metrics.comparison_policy.previous_window_days} />
                    </div>

                    <div className="grid md:grid-cols-2 gap-2">
                      {regionContext && (
                        <ContextCard
                          title={`Region context · ${label(selectedProducer.destination)}`}
                          producerCount={regionContext.producer_count}
                          producerViews={regionContext.producer_views}
                          selectedViews={selectedProducer.producer_views}
                          policy={metrics.comparison_policy}
                        />
                      )}
                      {categoryContext && (
                        <ContextCard
                          title={`Category context · ${label(selectedProducer.category)}`}
                          producerCount={categoryContext.producer_count}
                          producerViews={categoryContext.producer_views}
                          selectedViews={selectedProducer.producer_views}
                          policy={metrics.comparison_policy}
                        />
                      )}
                    </div>

                    <div className="rounded-lg border border-white/5 bg-stone-950/45 px-3 py-2 text-[9px] leading-relaxed text-stone-500">
                      Definitions: profile views are producer-detail views; saves are successful save actions; trip adds are successful additions to My Trips; website, phone, email and directions are outbound intent actions. These signals do not establish that a booking, visit or purchase occurred. Producer payment or partnership status does not affect these metrics or producer ordering.
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-white/5 bg-stone-950/50 px-3 py-6 text-center text-[11px] text-stone-500">
                No producer intent has been recorded in this window.
              </div>
            )}

            <div className="rounded-lg border border-white/5 p-3">
              <div className="text-xs font-bold text-stone-200">
                Affiliate experiment snapshot · {format(totals?.affiliate_clicks || 0)}/{format(totals?.affiliate_impressions || 0)} · {affiliateCtr}% CTR
              </div>
              <div className="mt-2 grid gap-1.5 md:grid-cols-2">
                {metrics.affiliates.length ? metrics.affiliates.map((row) => (
                  <div key={`${row.affiliate_campaign}-${row.source_surface}-${row.destination || 'all'}`} className="rounded bg-stone-950/60 px-2.5 py-2">
                    <div className="text-[10px] text-stone-300 font-semibold truncate">
                      {row.campaign_label || label(row.affiliate_campaign)}
                    </div>
                    <div className="text-[9px] text-stone-500 mt-0.5">
                      {label(row.source_surface)} · {format(row.impressions)} impressions · {row.ctr == null ? '—' : row.ctr.toFixed(2) + '% CTR'}
                    </div>
                  </div>
                )) : <div className="text-[10px] text-stone-500">No affiliate intent yet.</div>}
              </div>
            </div>

            <div className="text-[9px] text-stone-600">
              {metrics.start_date} → {metrics.end_date} · data through {metrics.aggregate_data_through || '—'} · previous-window comparison uses the immediately preceding {metrics.comparison_policy.previous_window_days} days · no traveler identities exposed.
            </div>
          </>
        )}
      </div>
    </section>
  );
};
