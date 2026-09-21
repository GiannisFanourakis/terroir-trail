import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchAdminRegionalIntelligence,
  type AdminRegionalIntelligence as RegionalReport,
} from '../../services/adminApi';

const WINDOWS = [7, 30, 90, 180] as const;
type WindowDays = (typeof WINDOWS)[number];

const label = (value: string) => value.replaceAll('_', ' ');
const pct = (value: number, total: number) => total > 0 ? `${Math.round((value / total) * 100)}%` : '—';

const CoverageMetric: React.FC<{
  labelText: string;
  value: number;
  total: number;
  detail: string;
}> = ({ labelText, value, total, detail }) => (
  <div className="rounded-lg bg-stone-950/70 px-3 py-2.5">
    <div className="text-[9px] uppercase tracking-wide text-stone-500">{labelText}</div>
    <div className="mt-1 text-lg font-bold text-white">
      {value}/{total} <span className="text-xs text-stone-500">{pct(value, total)}</span>
    </div>
    <div className="mt-0.5 text-[9px] leading-relaxed text-stone-600">{detail}</div>
  </div>
);

export const AdminRegionalIntelligence: React.FC = () => {
  const [days, setDays] = useState<WindowDays>(30);
  const [report, setReport] = useState<RegionalReport | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setReport((await fetchAdminRegionalIntelligence(days)).report);
    } catch (err) {
      setReport(null);
      setError(err instanceof Error ? err.message : 'Regional intelligence is unavailable.');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (!report?.regions.length) {
      setSelectedDestination(null);
      return;
    }
    setSelectedDestination((current) =>
      current && report.regions.some((row) => row.destination === current)
        ? current
        : report.regions[0].destination
    );
  }, [report]);

  const region = useMemo(
    () => report?.regions.find((row) => row.destination === selectedDestination) ?? null,
    [report, selectedDestination]
  );

  return (
    <section className="rounded-xl border border-white/10 bg-stone-900/60 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white">Regional intelligence prototype</h3>
          <p className="text-[11px] text-stone-400 mt-1">
            Admin-only readiness and traveler-intent components. No composite quality score.
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
                  ? 'border-violet-400/50 bg-violet-400/10 text-violet-200'
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

        {report && (
          <>
            <div className="rounded-lg border border-sky-500/20 bg-sky-500/5 px-3 py-2 text-[10px] leading-relaxed text-sky-100">
              {report.coverage_note}
            </div>

            {report.regions.length > 0 ? (
              <>
                <label className="block text-[10px] text-stone-400 max-w-sm">
                  Region
                  <select
                    aria-label="Regional intelligence region"
                    value={selectedDestination || ''}
                    onChange={(event) => setSelectedDestination(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-stone-950 px-2.5 py-2 text-xs text-stone-200"
                  >
                    {report.regions.map((row) => (
                      <option key={row.destination} value={row.destination}>
                        {label(row.destination)} · {row.audited_producer_count} producers
                      </option>
                    ))}
                  </select>
                </label>

                {region && (
                  <div className="space-y-4">
                    <div>
                      <div className="text-base font-bold text-white">{label(region.destination)}</div>
                      <div className="text-[10px] text-stone-500 mt-0.5">
                        {region.audited_producer_count} audited catalogue producers · {region.category_count} categories · {days} day demand window
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] uppercase tracking-[0.14em] font-bold text-stone-400 mb-2">Supply & readiness</div>
                      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-2">
                        <CoverageMetric labelText="Verified location" value={region.verified_location_count} total={region.audited_producer_count} detail="Verified location or entrance." />
                        <CoverageMetric labelText="Booking policy" value={region.booking_policy_count} total={region.audited_producer_count} detail="Public evidence for booking requirement." />
                        <CoverageMetric labelText="Visitor hours" value={region.visitor_hours_count} total={region.audited_producer_count} detail="Structured visitor-hours evidence." />
                        <CoverageMetric labelText="Road review" value={region.road_access_review_count} total={region.audited_producer_count} detail="Reviewed road-access state, including confirmed unknown." />
                        <CoverageMetric labelText="Parking" value={region.parking_evidence_count} total={region.audited_producer_count} detail="Public parking evidence available." />
                        <CoverageMetric labelText="Languages" value={region.visitor_language_evidence_count} total={region.audited_producer_count} detail="Visitor-language evidence available." />
                        <CoverageMetric labelText="Fresh review" value={region.fresh_review_count} total={region.audited_producer_count} detail={`Visitability reviewed within ${report.freshness_days} days.`} />
                        <CoverageMetric labelText="Reviewed unknown" value={region.reviewed_unknown_count} total={region.audited_producer_count} detail="Current review found insufficient evidence for one or more fields." />
                        <CoverageMetric labelText="Direct contact" value={region.direct_contact_count} total={region.audited_producer_count} detail="Phone or producer-controlled website present." />
                      </div>
                    </div>

                    <div className="rounded-lg border border-white/5 bg-stone-950/45 p-3">
                      <div className="text-[10px] uppercase tracking-[0.14em] font-bold text-stone-400">Visitability states</div>
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-5 gap-2 text-[10px]">
                        <div><span className="text-stone-500">Public</span><div className="text-white font-bold">{region.public_visits_count}</div></div>
                        <div><span className="text-stone-500">Seasonal</span><div className="text-white font-bold">{region.seasonal_public_count}</div></div>
                        <div><span className="text-stone-500">Appointment</span><div className="text-white font-bold">{region.appointment_only_count}</div></div>
                        <div><span className="text-stone-500">Not confirmed</span><div className="text-white font-bold">{region.not_publicly_confirmed_count}</div></div>
                        <div><span className="text-stone-500">Access uncertain</span><div className="text-white font-bold">{region.current_access_uncertain_count}</div></div>
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] uppercase tracking-[0.14em] font-bold text-stone-400 mb-2">Traveler demand</div>
                      {!region.demand_sample_sufficient && (
                        <div className="mb-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-[10px] text-amber-100">
                          Early demand sample: {region.demand.producer_views} producer views. Category-demand comparisons remain withheld until {report.demand_minimum_views} regional producer views.
                        </div>
                      )}
                      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2">
                        {[
                          ['Region opens', region.demand.region_opens],
                          ['Map producer views', region.demand.region_producers_views],
                          ['Producer views', region.demand.producer_views],
                          ['Saves', region.demand.saves],
                          ['Trip adds', region.demand.trip_additions],
                          ['Direct actions', region.demand.direct_producer_actions],
                          ['Directions', region.demand.directions_clicks],
                        ].map(([name, value]) => (
                          <div key={String(name)} className="rounded-lg bg-stone-950/70 px-3 py-2.5">
                            <div className="text-[9px] uppercase text-stone-500">{name}</div>
                            <div className="mt-1 text-lg font-bold text-white">{Number(value)}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-lg border border-white/5 p-3">
                      <div className="text-xs font-bold text-stone-200">Category coverage</div>
                      <div className="mt-2 space-y-1.5">
                        {region.categories.map((row) => (
                          <div key={row.category} className="rounded bg-stone-950/60 px-2.5 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <div className="text-[10px] font-semibold text-stone-300">
                              {label(row.category)} · {row.producer_count} producers
                            </div>
                            <div className="text-[9px] text-stone-500">
                              {region.demand_sample_sufficient
                                ? `${row.producer_views} views · ${row.saves} saves · ${row.trip_additions} trip adds · ${row.direct_producer_actions + row.directions_clicks} actions`
                                : 'Demand comparison withheld at current sample'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-lg border border-white/5 p-3">
                      <div className="text-xs font-bold text-stone-200">Contextual travel utility</div>
                      {region.affiliate_sample_sufficient ? (
                        <div className="mt-1 text-[10px] text-stone-400">
                          {region.affiliates.impressions} impressions · {region.affiliates.clicks} clicks · {region.affiliates.ctr == null ? '—' : region.affiliates.ctr.toFixed(2) + '% CTR'}
                        </div>
                      ) : (
                        <div className="mt-1 text-[10px] text-stone-500">
                          {region.affiliates.impressions} destination-context impressions. Engagement is withheld as non-decision-grade until {report.affiliate_minimum_impressions} impressions.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-[11px] text-stone-500">No active regional catalogue data is available.</div>
            )}

            <div className="text-[9px] text-stone-600">
              Demand window {report.start_date} → {report.end_date} · analytics through {report.aggregate_data_through || '—'} · supply/readiness is current catalogue state.
            </div>
          </>
        )}
      </div>
    </section>
  );
};
