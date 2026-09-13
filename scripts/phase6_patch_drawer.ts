import fs from 'node:fs';
import path from 'node:path';

const target = path.resolve('src/components/Drawer/ProducerDetailDrawer.tsx');
let source = fs.readFileSync(target, 'utf8');

function replaceExactly(label: string, before: string, after: string) {
  const occurrences = source.split(before).length - 1;
  if (occurrences !== 1) {
    throw new Error(`${label}: expected exactly one match, found ${occurrences}. Refusing to patch.`);
  }
  source = source.replace(before, after);
}

replaceExactly(
  'route safety import',
  "import { getCategoryFallbackImage } from '../../utils/imageFallbacks';",
  "import { getCategoryFallbackImage } from '../../utils/imageFallbacks';\nimport { getProducerRoadAccessWarning } from '../../utils/routeSafety';"
);

replaceExactly(
  'synthetic road access descriptions',
  `  const getRoadAccessDetails = (access?: Producer['roadAccess']) => {
    if (!access) return undefined;
    switch (access) {
      case 'paved':
        return {
          title: 'Smooth Asphalt (Standard Car)',
          desc: '100% paved road directly to the courtyard. Ideal for all standard economy rental cars.',
          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        };
      case 'gravel_ok':
        return {
          title: 'Compact Gravel Section',
          desc: 'Manageable unpaved country track for the last 500m. Drive slowly; standard cars can pass.',
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        };
      case '4x4_required':
        return {
          title: 'High Mountain Dirt Track (4x4 Recommended)',
          desc: 'Steep rocky mountain dirt road. Requires high clearance vehicle or 4x4.',
          color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
        };
      default:
        return undefined;
    }
  };`,
  `  const getRoadAccessDetails = (p: Producer) => {
    if (p.roadAccessStatus !== 'verified' || !p.roadAccess) return undefined;

    const labels: Record<NonNullable<Producer['roadAccess']>, { title: string; color: string }> = {
      paved: {
        title: 'Paved road access',
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      },
      narrow_paved: {
        title: 'Narrow paved road access',
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      },
      gravel_ok: {
        title: 'Passable gravel road access',
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      },
      unpaved_passable: {
        title: 'Passable unpaved road access',
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      },
      high_clearance_recommended: {
        title: 'High-clearance vehicle recommended',
        color: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      },
      '4x4_required': {
        title: '4x4 access required',
        color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      },
    };

    return {
      ...labels[p.roadAccess],
      desc: p.roadAccessNotes,
      sourceUrl: p.roadAccessSourceUrl,
    };
  };`
);

replaceExactly(
  'road access state',
  `  const road = getRoadAccessDetails(producer.roadAccess);
  const term = getCategoryTerminology(producer.category, producer.name);`,
  `  const road = getRoadAccessDetails(producer);
  const roadWarning = getProducerRoadAccessWarning(producer);
  const roadAccessBlocksDirections =
    producer.roadAccessStatus === 'current_access_uncertain' ||
    producer.roadAccess === 'high_clearance_recommended' ||
    producer.roadAccess === '4x4_required';
  const hasVerifiedStandardRoad =
    producer.roadAccessStatus === 'verified' &&
    (producer.roadAccess === 'paved' ||
      producer.roadAccess === 'narrow_paved' ||
      producer.roadAccess === 'gravel_ok');
  const term = getCategoryTerminology(producer.category, producer.name);`
);

replaceExactly(
  'road access card',
  `            {/* Road Warning Card */}
            {road && (
              <div className={\`p-4 rounded-2xl border \${road.color}\`}>
                <div className="flex items-center gap-2 font-bold text-xs mb-1">
                  <Car className="w-4 h-4 shrink-0" />
                  <span>{road.title}</span>
                </div>
                <p className="text-xs leading-relaxed opacity-90">
                  {road.desc}
                </p>
              </div>
            )}`,
  `            {/* Source-backed Road Access Card */}
            {road && (
              <div className={\`p-4 rounded-2xl border \${road.color}\`}>
                <div className="flex items-center gap-2 font-bold text-xs mb-1">
                  <Car className="w-4 h-4 shrink-0" />
                  <span>{road.title}</span>
                </div>
                {road.desc && (
                  <p className="text-xs leading-relaxed opacity-90">{road.desc}</p>
                )}
                {road.sourceUrl && (
                  <a
                    href={road.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-[11px] font-semibold underline underline-offset-2 opacity-90 hover:opacity-100"
                  >
                    Access source
                  </a>
                )}
              </div>
            )}

            {roadWarning && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                <div className="flex items-start gap-2">
                  <Car className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{roadWarning}</p>
                </div>
              </div>
            )}`
);

replaceExactly(
  'sticky navigation action',
  `        {/* Primary Action: Get Directions (Google Maps) - only if googleMapsUrl exists and location is not unresolved */}
        {producer.googleMapsUrl && producer.locationStatus !== 'unresolved' ? (
          <a
            href={producer.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-0 flex items-center justify-center gap-1.5 py-3 px-2.5 sm:px-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs rounded-2xl shadow-xl shadow-amber-500/20 transition transform active:scale-98 whitespace-nowrap"
          >
            <Navigation className="w-4 h-4 text-stone-950 shrink-0" />
            <span className="truncate">Directions</span>
          </a>
        ) : producer.locationStatus === 'unresolved' ? (
          <div className="flex-1 min-w-0 flex items-center justify-center gap-1.5 py-3 px-2.5 sm:px-3.5 bg-stone-800 text-stone-400 font-medium text-xs rounded-2xl border border-white/5 whitespace-nowrap" title="Exact navigation point still being verified">
            <MapPin className="w-4 h-4 text-amber-400/70 shrink-0" />
            <span className="truncate">Navigation Pending</span>
          </div>
        ) : null}`,
  `        {/* Primary location/navigation action. A map pin is not a road-safety promise. */}
        {producer.locationStatus === 'unresolved' ? (
          <div className="flex-1 min-w-0 flex items-center justify-center gap-1.5 py-3 px-2.5 sm:px-3.5 bg-stone-800 text-stone-400 font-medium text-xs rounded-2xl border border-white/5 whitespace-nowrap" title="Exact navigation point still being verified">
            <MapPin className="w-4 h-4 text-amber-400/70 shrink-0" />
            <span className="truncate">Navigation Pending</span>
          </div>
        ) : producer.googleMapsUrl && roadAccessBlocksDirections ? (
          <div
            className="flex-1 min-w-0 flex items-center justify-center gap-1.5 py-3 px-2.5 sm:px-3.5 bg-stone-800 text-amber-300 font-medium text-xs rounded-2xl border border-amber-500/20 whitespace-nowrap"
            title={roadWarning || 'Check access conditions before driving'}
          >
            <Car className="w-4 h-4 shrink-0" />
            <span className="truncate">Access Check Needed</span>
          </div>
        ) : producer.googleMapsUrl ? (
          <a
            href={producer.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-0 flex items-center justify-center gap-1.5 py-3 px-2.5 sm:px-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs rounded-2xl shadow-xl shadow-amber-500/20 transition transform active:scale-98 whitespace-nowrap"
            title={roadWarning}
          >
            {hasVerifiedStandardRoad ? (
              <Navigation className="w-4 h-4 text-stone-950 shrink-0" />
            ) : (
              <MapPin className="w-4 h-4 text-stone-950 shrink-0" />
            )}
            <span className="truncate">
              {hasVerifiedStandardRoad ? 'Directions' : 'Open Map'}
            </span>
          </a>
        ) : null}`
);

const banned = [
  '100% paved road directly to the courtyard',
  'last 500m',
  'Steep rocky mountain dirt road',
];
for (const text of banned) {
  if (source.includes(text)) {
    throw new Error(`Synthetic road copy still present after patch: ${text}`);
  }
}

fs.writeFileSync(target, source, 'utf8');
console.log('✓ ProducerDetailDrawer Phase 6 road-access safety patch applied');
