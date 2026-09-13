import fs from 'node:fs';
import path from 'node:path';

interface PatchTarget {
  file: string;
  transform: (source: string) => string;
}

function replaceExactly(source: string, label: string, before: string, after: string): string {
  const count = source.split(before).length - 1;
  if (count !== 1) {
    throw new Error(`${label}: expected exactly one match, found ${count}. Refusing to patch.`);
  }
  return source.replace(before, after);
}

function patchFile(target: PatchTarget) {
  const filePath = path.resolve(target.file);
  const original = fs.readFileSync(filePath, 'utf8');
  const eol = original.includes('\r\n') ? '\r\n' : '\n';
  const normalized = original.replace(/\r\n/g, '\n');
  const patched = target.transform(normalized);
  fs.writeFileSync(filePath, patched.replace(/\n/g, eol), 'utf8');
  console.log(`✓ ${target.file}`);
}

const targets: PatchTarget[] = [
  {
    file: 'src/App.tsx',
    transform(source) {
      source = replaceExactly(
        source,
        'header future/commercial callbacks',
        `        onOpenMyBookings={() => setActiveModal({ type: 'my_bookings' })}
        onOpenProducerPortal={() => setActiveModal({ type: 'portal' })}
        bookingsCount={userBookings.length}
        onOpenExplorerPass={() => setActiveModal({ type: 'pass' })}
        onOpenDigitalPass={() => setActiveModal({ type: 'digital_pass' })}`,
        `        onOpenProducerPortal={() => setActiveModal({ type: 'portal' })}`
      );

      source = replaceExactly(
        source,
        'public ad pass upsell',
        `              <GoogleAdSlot
                hasExplorerPass={!!user?.hasExplorerPass}
                onOpenExplorerPass={() => setActiveModal({ type: 'pass' })}
              />`,
        `              <GoogleAdSlot hasExplorerPass={!!user?.hasExplorerPass} />`
      );

      source = replaceExactly(
        source,
        'producer drawer future commercial props',
        `            customNotice={selectedProducer ? getOverride(selectedProducer.id)?.customNotice : undefined}
            isProTier={selectedProducer ? (getOverride(selectedProducer.id)?.isProTier ?? false) : false}
            directBottleShopUrl={selectedProducer ? getOverride(selectedProducer.id)?.directBottleShopUrl : undefined}
            hasExplorerPass={!!user?.hasExplorerPass}
            onOpenExplorerPass={() => setActiveModal({ type: 'pass' })}
            onOpenDigitalPass={() => setActiveModal({ type: 'digital_pass' })}`,
        `            customNotice={selectedProducer ? getOverride(selectedProducer.id)?.customNotice : undefined}`
      );

      source = replaceExactly(
        source,
        'route future callbacks',
        `            onBookChauffeur={(loop) => setActiveModal({ type: 'chauffeur', circuit: loop })}
            user={user}
            onOpenExplorerPass={() => setActiveModal({ type: 'pass' })}`,
        `            user={user}`
      );

      source = replaceExactly(
        source,
        'passport future pass callbacks',
        `            onOpenExplorerPass={() => setActiveModal({ type: 'pass' })}
            onOpenDigitalPass={() => setActiveModal({ type: 'digital_pass' })}`,
        ``
      );

      source = replaceExactly(
        source,
        'about future pass callback',
        `            onOpenExplorerPass={() => setActiveModal({ type: 'pass' })}
            onOpenProducerPortal={() => setActiveModal({ type: 'portal' })}`,
        `            onOpenProducerPortal={() => setActiveModal({ type: 'portal' })}`
      );

      return source;
    },
  },
  {
    file: 'src/components/Header/Header.tsx',
    transform(source) {
      return replaceExactly(
        source,
        'route tooltip promise',
        `title="Curated driving routes with turn-by-turn navigation"`,
        `title="Curated routes are under verification"`
      );
    },
  },
  {
    file: 'src/components/Auth/ProfileMenu.tsx',
    transform(source) {
      const start = source.indexOf('          {/* PRODUCER PASS: HOST PRO TIER */}');
      const end = source.indexOf('          {/* Terroir Passport Progress */}');
      if (start === -1 || end === -1 || end <= start) {
        throw new Error('Host Pro public block: expected guarded markers were not found. Refusing to patch.');
      }
      return source.slice(0, start) + source.slice(end);
    },
  },
  {
    file: 'src/components/Auth/PassportModal.tsx',
    transform(source) {
      source = replaceExactly(
        source,
        'passport import cleanup',
        `import { X, Award, CheckCircle2, Circle, MapPin, Edit3, Save, Compass, Crown, Sparkles, QrCode } from 'lucide-react';`,
        `import { X, Award, CheckCircle2, Circle, MapPin, Edit3, Save } from 'lucide-react';`
      );

      source = replaceExactly(
        source,
        'passport stamp paywall state',
        `  const FREE_STAMP_LIMIT = 3;
  const isVip = !!user.hasExplorerPass;
  const visitedCount = user.visitedProducers?.length ?? 0;
  const isFreeLimitReached = !isVip && visitedCount >= FREE_STAMP_LIMIT;`,
        `  const visitedCount = user.visitedProducers?.length ?? 0;`
      );

      source = replaceExactly(
        source,
        'passport stamp paywall action',
        `  const handleToggleStamp = (producerId: string) => {
    const isStamped = user.visitedProducers.includes(producerId);
    if (!isStamped && isFreeLimitReached) {
      if (onOpenExplorerPass) onOpenExplorerPass();
      return;
    }
    onToggleVisited(producerId);
  };`,
        `  const handleToggleStamp = (producerId: string) => {
    onToggleVisited(producerId);
  };`
      );

      source = replaceExactly(
        source,
        'passport tier badge',
        `                <span className={\`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider \${
                  isVip ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-stone-800 text-stone-400 border border-white/10'
                }\`}>
                  {isVip ? '👑 VIP MEMBER' : 'FREE TIER (3 STAMPS)'}
                </span>`,
        `                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-stone-800 text-stone-300 border border-white/10">
                  Explorer
                </span>`
      );

      source = replaceExactly(
        source,
        'passport stamp count copy',
        `                {visitedCount} of {producers.length} Artisans Stamped {isVip ? '(Unlimited)' : \`(\${Math.min(visitedCount, FREE_STAMP_LIMIT)}/3 Free Allowed)\`}`,
        `                {visitedCount} of {producers.length} places stamped`
      );

      const start = source.indexOf('          {/* VIP Explorer Pass Banner */}');
      const end = source.indexOf('          {/* Progress Bar */}');
      if (start === -1 || end === -1 || end <= start) {
        throw new Error('Passport VIP banner: expected guarded markers were not found. Refusing to patch.');
      }
      source = source.slice(0, start) + source.slice(end);

      return source;
    },
  },
  {
    file: 'src/components/Monetization/GoogleAdSlot.tsx',
    transform(source) {
      source = replaceExactly(
        source,
        'sponsor fallback import',
        `import { SponsorBanner } from './SponsorBanner';\n`,
        ``
      );
      source = replaceExactly(
        source,
        'unverified sponsor fallback',
        `  // If no slot ID is configured yet or on error, show the curated sponsor banner
  if (!client || !slot || adError) {
    return (
      <SponsorBanner
        hasExplorerPass={hasExplorerPass}
        onOpenExplorerPass={onOpenExplorerPass}
        className={className}
      />
    );
  }`,
        `  // Fail closed when no verified ad slot is configured or ad rendering fails.
  if (!client || !slot || adError) return null;`
      );
      source = replaceExactly(
        source,
        'ad public pass upsell',
        `        {onOpenExplorerPass && (
          <button
            type="button"
            onClick={onOpenExplorerPass}
            className="text-[10px] text-amber-400/80 hover:text-amber-300 transition hover:underline cursor-pointer"
          >
            Remove Ads with VIP Pass
          </button>
        )}`,
        ``
      );
      return source;
    },
  },
];

for (const target of targets) patchFile(target);

const banned: Array<[string, string]> = [
  ['src/components/Header/Header.tsx', 'Curated driving routes with turn-by-turn navigation'],
  ['src/components/Auth/ProfileMenu.tsx', '€199/yr'],
  ['src/components/Auth/PassportModal.tsx', 'FREE TIER (3 STAMPS)'],
  ['src/components/Auth/PassportModal.tsx', 'Complimentary pours, artisan meze'],
  ['src/components/Monetization/GoogleAdSlot.tsx', 'SponsorBanner'],
  ['src/components/Monetization/GoogleAdSlot.tsx', 'Remove Ads with VIP Pass'],
];

for (const [file, text] of banned) {
  if (fs.readFileSync(path.resolve(file), 'utf8').includes(text)) {
    throw new Error(`${file}: stale public claim remains after patch: ${text}`);
  }
}

console.log('✓ Phase 7 future/commercial public surfaces quarantined');
