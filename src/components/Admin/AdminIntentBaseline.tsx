import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, AlertTriangle, RefreshCw } from 'lucide-react';
import {
  fetchAdminIntentMetrics,
  type AdminIntentMetrics,
} from '../../services/adminApi';

const WINDOWS = [7, 30, 90, 180] as const;
type WindowDays = (typeof WINDOWS)[number];

const label = (value: string) =>
  value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

const n = (value: number) => new Intl.NumberFormat().format(value);

export const AdminIntentBaseline: React.FC = () => {
  const [days, setDays] = useState<WindowDays>(30);
  const [metrics, setMetrics] = useState<AdminIntentMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAdminIntentMetrics(days);
      setMetrics(result.metrics);
    } catch (err) {
      setMetrics(null);
      setError(err instanceof Error ? err.message : 'Intent baseline is unavailable.');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { void load(); }, [load]);

  const totals = metrics?.totals;
  const affiliateCtr = totals?.affiliate_impressions
    ? (totals.affiliate_clicks / totals.affiliate_impressions) * 100
    : null;
  const lowVolume = (totals?.producer_views || 0) < 100;
  const funnel = useMemo(() => totals ? [
    ['Views', totals.producer_views],
    ['Saves', totals.saves],
    ['Trip adds', totals.trip_additions],
    ['Direct contact', totals.direct_producer_actions],
    ['Directions', totals.directions_clicks],
    ['Passport stamps', totals.passport_stamps_added],
  ] as const : [], [totals]);

  return (
    <section className="rounded-xl border border-white/10 bg-stone-900/60 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Intent baseline</h3>
          </div>
          <p className="text-[11px] text-stone-400 mt-1">
            Aggregate first-party demand signals. Directional only — not proof of a visit, booking or purchase.
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {WINDOWS.map((window) => (
            <button
              key={window}
              type="button"
              onClick={() => setDays(window)}
              className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer ${
                days === window
                  ? 'border-cyan-400/50 bg-cyan-400/10 text-cyan-200'
                  : 'border-white/10 bg-stone-950 text-stone-400 hover:text-white'
              }`}
            >
              {window}d
            </button>
          ))}
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="w-8 h-8 rounded-lg border border-white/10 bg-stone-950 text-stone-400 hover:text-white disabled:opacity-50 flex items-center justify-center cursor-pointer"
            aria-label="Refresh intent baseline"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {error && (
          <div className="rounded-lg border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-200">
            {error}
          </div>
        )}

        {metrics && (
          <>
            {lowVolume && (
              <div className="flex gap-2 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-100">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Early sample: fewer than 100 producer views in this window. Treat rankings and conversion ratios as directional.
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
              {funnel.map(([name, value]) => (
                <div key={name} className="rounded-lg bg-stone-950/70 px-3 py-2.5">
                  <div className="text-[9px] uppercase tracking-wide text-stone-500">{name}</div>
                  <div className="mt-1 text-lg font-bold text-white">{n(value)}</div>
                </div>
              ))}
            </div>

            <div className="grid xl:grid-cols-2 gap-3">
              <div className="rounded-lg border border-white/5 overflow-hidden">
                <div className="px-3 py-2 bg-stone-950/60 text-xs font-bold text-stone-200">Producer demand</div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-[10px]">
                    <thead className="text-stone-500 uppercase">
                      <tr><th className="text-left px-3 py-2">Producer</th><th className="text-right px-2">Views</th><th className="text-right px-2">Saves</th><th className="text-right px-2">Direct</th><th className="text-right px-2">Directions</th><th className="text-right px-3">Stamps</th></tr>
                    </thead>
                    <tbody>
                      {metrics.producers.slice(0, 8).map((row) => (
                        <tr key={row.producer_id} className="border-t border-white/5">
                          <td className="px-3 py-2 text-stone-200"><div className="font-semibold">{row.producer_name}</div><div className="text-stone-600">{label(row.destination)} · {label(row.category)}</div></td>
                          <td className="px-2 text-right">{n(row.producer_views)}</td>
                          <td className="px-2 text-right">{n(row.saves)}</td>
                          <td className="px-2 text-right">{n(row.direct_producer_actions)}</td>
                          <td className="px-2 text-right">{n(row.directions_clicks)}</td>
                          <td className="px-3 text-right">{n(row.passport_stamps_added)}</td>
                        </tr>
                      ))}
                      {!metrics.producers.length && <tr><td colSpan={6} className="px-3 py-5 text-stone-500">No producer intent yet.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-lg border border-white/5 overflow-hidden">
                <div className="px-3 py-2 bg-stone-950/60 text-xs font-bold text-stone-200">Regional demand</div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[440px] text-[10px]">
                    <thead className="text-stone-500 uppercase">
                      <tr><th className="text-left px-3 py-2">Destination</th><th className="text-right px-2">Views</th><th className="text-right px-2">Saves</th><th className="text-right px-2">Direct</th><th className="text-right px-3">Directions</th></tr>
                    </thead>
                    <tbody>
                      {metrics.regions.slice(0, 8).map((row) => (
                        <tr key={row.destination} className="border-t border-white/5">
                          <td className="px-3 py-2 text-stone-200 font-semibold">{label(row.destination)}</td>
                          <td className="px-2 text-right">{n(row.producer_views)}</td>
                          <td className="px-2 text-right">{n(row.saves)}</td>
                          <td className="px-2 text-right">{n(row.direct_producer_actions)}</td>
                          <td className="px-3 text-right">{n(row.directions_clicks)}</td>
                        </tr>
                      ))}
                      {!metrics.regions.length && <tr><td colSpan={5} className="px-3 py-5 text-stone-500">No regional intent yet.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-3">
              <div className="rounded-lg border border-white/5 p-3">
                <div className="text-xs font-bold text-stone-200 mb-2">Category signals</div>
                <div className="space-y-1.5 text-[10px]">
                  {metrics.categories.slice(0, 8).map((row) => (
                    <div key={row.category} className="grid grid-cols-[1fr_auto_auto_auto] gap-3 rounded bg-stone-950/60 px-2.5 py-2">
                      <span className="text-stone-300 font-semibold">{label(row.category)}</span>
                      <span className="text-stone-500">{n(row.producer_views)} views</span>
                      <span className="text-stone-500">{n(row.saves)} saves</span>
                      <span className="text-stone-500">{n(row.direct_producer_actions + row.directions_clicks)} actions</span>
                    </div>
                  ))}
                  {!metrics.categories.length && <div className="text-stone-500">No category intent yet.</div>}
                </div>
              </div>

              <div className="rounded-lg border border-white/5 p-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="text-xs font-bold text-stone-200">Affiliate baseline</div>
                  <div className="text-[10px] text-stone-500">
                    {n(totals?.affiliate_clicks || 0)} / {n(totals?.affiliate_impressions || 0)} · {affiliateCtr == null ? '—' : affiliateCtr.toFixed(2) + '% CTR'}
                  </div>
                </div>
                <div className="space-y-1.5 text-[10px]">
                  {metrics.affiliates.map((row) => (
                    <div key={`${row.affiliate_campaign}-${row.source_surface}-${row.destination || 'all'}`} className="grid grid-cols-[1fr_auto_auto] gap-3 rounded bg-stone-950/60 px-2.5 py-2">
                      <span className="text-stone-300 font-semibold truncate">{row.campaign_label || label(row.affiliate_campaign)}</span>
                      <span className="text-stone-500">{n(row.impressions)} imp.</span>
                      <span className="text-stone-500">{row.ctr == null ? '—' : row.ctr.toFixed(2) + '%'}</span>
                    </div>
                  ))}
                  {!metrics.affiliates.length && <div className="text-stone-500">No affiliate intent yet.</div>}
                </div>
              </div>
            </div>

            <div className="text-[9px] text-stone-600">
              Window {metrics.start_date} → {metrics.end_date}. Aggregate data through {metrics.aggregate_data_through || '—'}. No traveler identities are exposed.
            </div>
          </>
        )}
      </div>
    </section>
  );
};
