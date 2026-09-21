import React, { useCallback, useEffect, useState } from 'react';
import {
  fetchAdminIntentMetrics,
  type AdminIntentMetrics,
} from '../../services/adminApi';

const WINDOWS = [7, 30, 90, 180] as const;
type WindowDays = (typeof WINDOWS)[number];
type Row = { id: string; name: string; meta: string };

const label = (value: string) => value.replaceAll('_', ' ');
const format = (value: number) => String(value);

const CompactList: React.FC<{ title: string; rows: Row[] }> = ({ title, rows }) => (
  <div className="rounded-lg border border-white/5 p-3">
    <div className="text-xs font-bold text-stone-200 mb-2">{title}</div>
    <div className="space-y-1.5 text-[10px]">
      {rows.length ? rows.map((row) => (
        <div key={row.id} className="rounded bg-stone-950/60 px-2.5 py-2">
          <div className="text-stone-300 font-semibold truncate">{row.name}</div>
          <div className="text-stone-500 mt-0.5">{row.meta}</div>
        </div>
      )) : <div className="text-stone-500">No intent yet.</div>}
    </div>
  </div>
);

export const AdminIntentBaseline: React.FC = () => {
  const [days, setDays] = useState<WindowDays>(30);
  const [metrics, setMetrics] = useState<AdminIntentMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setMetrics((await fetchAdminIntentMetrics(days)).metrics);
    } catch (err) {
      setMetrics(null);
      setError(err instanceof Error ? err.message : 'Intent baseline is unavailable.');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { void load(); }, [load]);

  const totals = metrics?.totals;
  const funnel = totals ? [
    ['Views', totals.producer_views],
    ['Saves', totals.saves],
    ['Trip adds', totals.trip_additions],
    ['Direct contact', totals.direct_producer_actions],
    ['Directions', totals.directions_clicks],
    ['Passport stamps', totals.passport_stamps_added],
  ] as const : [];
  const affiliateCtr = totals?.affiliate_impressions
    ? ((totals.affiliate_clicks / totals.affiliate_impressions) * 100).toFixed(2)
    : '—';

  return (
    <section className="rounded-xl border border-white/10 bg-stone-900/60 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white">Intent baseline</h3>
          <p className="text-[11px] text-stone-400 mt-1">
            Aggregate first-party signals. Directional only — not proof of a visit, booking or purchase.
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
            {(totals?.producer_views || 0) < 100 && (
              <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-100">
                Early sample: fewer than 100 producer views. Treat rankings and ratios as directional.
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
              {funnel.map(([name, value]) => (
                <div key={name} className="rounded-lg bg-stone-950/70 px-3 py-2.5">
                  <div className="text-[9px] uppercase text-stone-500">{name}</div>
                  <div className="mt-1 text-lg font-bold text-white">{format(value)}</div>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-3">
              <CompactList
                title="Producer demand"
                rows={metrics.producers.slice(0, 8).map((row) => ({
                  id: row.producer_id,
                  name: row.producer_name,
                  meta: `${label(row.destination)} · ${label(row.category)} · ${format(row.producer_views)} views · ${format(row.saves)} saves · ${format(row.direct_producer_actions)} direct · ${format(row.directions_clicks)} directions · ${format(row.passport_stamps_added)} stamps`,
                }))}
              />
              <CompactList
                title="Regional demand"
                rows={metrics.regions.slice(0, 8).map((row) => ({
                  id: row.destination,
                  name: label(row.destination),
                  meta: `${format(row.producer_views)} views · ${format(row.saves)} saves · ${format(row.direct_producer_actions)} direct · ${format(row.directions_clicks)} directions`,
                }))}
              />
              <CompactList
                title="Category signals"
                rows={metrics.categories.slice(0, 8).map((row) => ({
                  id: row.category,
                  name: label(row.category),
                  meta: `${format(row.producer_views)} views · ${format(row.saves)} saves · ${format(row.direct_producer_actions + row.directions_clicks)} actions`,
                }))}
              />
              <CompactList
                title={`Affiliate baseline · ${format(totals?.affiliate_clicks || 0)}/${format(totals?.affiliate_impressions || 0)} · ${affiliateCtr}% CTR`}
                rows={metrics.affiliates.map((row) => ({
                  id: `${row.affiliate_campaign}-${row.source_surface}-${row.destination || 'all'}`,
                  name: row.campaign_label || label(row.affiliate_campaign),
                  meta: `${format(row.impressions)} impressions · ${row.ctr == null ? '—' : row.ctr.toFixed(2) + '% CTR'}`,
                }))}
              />
            </div>

            <div className="text-[9px] text-stone-600">
              {metrics.start_date} → {metrics.end_date} · data through {metrics.aggregate_data_through || '—'} · no traveler identities exposed.
            </div>
          </>
        )}
      </div>
    </section>
  );
};
