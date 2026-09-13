import fs from 'node:fs';
import path from 'node:path';

type FileState = { file: string; source: string; eol: '\n' | '\r\n' };

function read(file: string): FileState {
  const raw = fs.readFileSync(path.resolve(file), 'utf8');
  return { file, source: raw.replace(/\r\n/g, '\n'), eol: raw.includes('\r\n') ? '\r\n' : '\n' };
}

function write(state: FileState) {
  fs.writeFileSync(path.resolve(state.file), state.source.replace(/\n/g, state.eol));
}

function replaceOnce(state: FileState, label: string, before: string, after: string) {
  const count = state.source.split(before).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one match, found ${count}. Refusing to patch.`);
  state.source = state.source.replace(before, after);
}

function replaceBetween(state: FileState, label: string, start: string, end: string, replacement: string) {
  const startIndex = state.source.indexOf(start);
  const endIndex = state.source.indexOf(end, startIndex + start.length);
  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    throw new Error(`${label}: guarded markers not found. Refusing to patch.`);
  }
  if (state.source.indexOf(start, startIndex + 1) !== -1) {
    throw new Error(`${label}: start marker is not unique. Refusing to patch.`);
  }
  state.source = state.source.slice(0, startIndex) + replacement + state.source.slice(endIndex);
}

function regexOnce(state: FileState, label: string, pattern: RegExp, replacement: string) {
  const matches = [...state.source.matchAll(new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`))];
  if (matches.length !== 1) throw new Error(`${label}: expected exactly one regex match, found ${matches.length}. Refusing to patch.`);
  state.source = state.source.replace(pattern, replacement);
}

// Auth / claim UI: collect evidence, never claim that frontend checks prove ownership.
{
  const state = read('src/components/Auth/AuthModal.tsx');

  replaceOnce(
    state,
    'traveler launch copy',
    "travelerMode === 'login' ? 'Access your Terroir Passport, verified tasting notes, and bookings.' :",
    "travelerMode === 'login' ? 'Access your Terroir Passport, saved producers, and personal tasting notes.' :"
  );
  replaceOnce(
    state,
    'producer login launch copy',
    "producerMode === 'login' ? 'Manage your cellar reservations, operating hours, and direct shop links.' :",
    "producerMode === 'login' ? 'Access your verified estate profile and visitor notice tools.' :"
  );
  replaceOnce(
    state,
    'producer claim launch copy',
    "producerMode === 'claim' ? 'Verify your artisan estate to accept bookings, manage shop links, and setup logistics.' :",
    "producerMode === 'claim' ? 'Submit evidence that you represent this estate. TerroirTrail reviews every claim before host access is granted.' :"
  );
  replaceOnce(
    state,
    'traveler pass upsell copy',
    'Sign in to save stamps & notes. (Explorer Pass is an optional upgrade)',
    'Sign in to save stamps, favorites and personal notes across devices.'
  );

  replaceBetween(
    state,
    'producer Host Pro callout',
    '              {/* Producer Host Pro Benefit Callout */}',
    '              {/* 1. PRODUCER HOST SIGN IN */}',
    `              <div className="p-3 rounded-2xl bg-stone-900 border border-white/10 text-left space-y-1.5">\n                <div className="flex items-center gap-2 text-xs font-bold text-white">\n                  <ShieldCheck className="w-4 h-4 text-amber-400" />\n                  <span>Host access is reviewed</span>\n                </div>\n                <p className="text-[10px] text-stone-400 leading-relaxed">\n                  Signing in, using a business email, or entering a VAT number does not automatically prove estate ownership. New claims remain pending until TerroirTrail approves the evidence.\n                </p>\n              </div>\n\n`
  );

  replaceBetween(
    state,
    'instant Google ownership claim',
    '                  {/* Fast 1-Click Verification via Google / Apple */}',
    '                  <form onSubmit={handleProducerClaim} className="space-y-3">',
    `                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1.5">\n                    <div className="font-bold text-amber-300 flex items-center gap-1.5">\n                      <ShieldCheck className="w-3.5 h-3.5" />\n                      <span>Claim review</span>\n                    </div>\n                    <p className="text-[11px] text-stone-300 leading-relaxed">\n                      Submit the claim below. Your account stays a traveler account until TerroirTrail reviews the evidence and the trusted backend assigns this estate to you.\n                    </p>\n                  </div>\n\n                  <form onSubmit={handleProducerClaim} className="space-y-3">`
  );

  replaceBetween(
    state,
    'producer evidence construction',
    "    const countryCode = fiscalCountry ||",
    "    try {\n      setLocalLoading('form');",
    `    const countryCode = fiscalCountry || ((producer.country === 'Italy' || producer.destination === 'tuscany') ? 'IT' : 'GR');\n    const vatCheck = vatNumber.trim() ? validateVatNumber(vatNumber.trim(), countryCode) : null;\n\n    if (vatNumber.trim() && !vatCheck?.isValid) {\n      setLocalError(vatCheck?.error || \`Please enter a valid \${fiscalLabels.shortVatLabel} for \${fiscalLabels.countryName}.\`);\n      return;\n    }\n    if (vatNumber.trim() && !legalBusinessName.trim()) {\n      setLocalError('Please enter the registered business name when supplying a VAT / Tax ID.');\n      return;\n    }\n\n    const taxDetails: ProducerTaxDetails | undefined = vatNumber.trim() ? {\n      vatNumber: vatCheck?.formatted || vatNumber.trim(),\n      legalBusinessName: legalBusinessName.trim(),\n      taxOffice: taxOffice.trim() || undefined,\n      registeredAddress: registeredAddress.trim() || undefined,\n      dispatchContactPhone: dispatchContactPhone.trim() || undefined,\n      countryCode,\n      isVatVerified: false,\n    } : undefined;\n\n    try {\n      setLocalLoading('form');`
  );

  replaceOnce(state, 'claim fiscal heading', 'Fiscal & Shipping Registration', 'Optional Business Evidence');
  replaceOnce(state, 'claim VAT badge', '<span>{fiscalLabels.shortVatLabel} Verification</span>', '<span>{fiscalLabels.shortVatLabel} Format Check</span>');
  replaceOnce(
    state,
    'claim VAT explanatory copy',
    'Tax ID verifies genuine estate ownership, qualifies your estate for 0% commission B2B statements, and activates direct bottle & artisan box parcel shipping.',
    'Business details can support the ownership review, but a valid format does not by itself prove that you own or represent the estate.'
  );
  replaceOnce(
    state,
    'optional VAT label',
    '{fiscalLabels.fullVatLabel} <span className="text-rose-400">*</span>',
    '{fiscalLabels.fullVatLabel} <span className="text-stone-500">(optional evidence)</span>'
  );
  replaceOnce(state, 'business name placeholder', 'e.g. Artisan Producer Estate O.E. (Demo Entity)', 'Registered business name');
  replaceOnce(state, 'address label', 'Estate Dispatch Pickup Address (For Couriers & Invoices)', 'Registered Business Address (optional evidence)');
  replaceOnce(state, 'address placeholder', 'e.g. 124 Wine Route, Dispatch Bay 2, 70100', 'Registered business address');
  replaceOnce(state, 'claim submitting copy', 'Verifying & Claiming...', 'Submitting Claim...');
  replaceOnce(state, 'claim action copy', 'Claim Estate & Activate Host Portal', 'Submit Claim for Review');

  write(state);
}

// Claim persistence: submit only claimant-supplied evidence and never manufacture commercial/logistics fields.
{
  const state = read('src/hooks/useAuth.ts');
  replaceOnce(
    state,
    'registration record type import',
    "import { UserProfile, TravelerType, ProducerTaxDetails, HostClaimStatus } from '../types/auth';",
    "import { UserProfile, TravelerType, ProducerTaxDetails, ProducerRegistrationRecord, HostClaimStatus } from '../types/auth';"
  );

  replaceBetween(
    state,
    'minimal producer claim',
    '  // 6d. Real Claim & Register Estate Host with Fiscal / VAT Verification',
    '  // 6e. Update Producer Fiscal & Shipping Details (Local demo only)',
    `  // 6d. Submit an estate ownership claim for operator review.\n  // Authentication and client-side format checks are evidence inputs only; they never grant host authority.\n  const claimAndRegisterProducer = useCallback(async (\n    producerId: string,\n    producerName: string,\n    hostName: string,\n    email: string,\n    password?: string,\n    taxDetails?: ProducerTaxDetails\n  ) => {\n    setIsLoading(true);\n    setAuthError(null);\n    try {\n      if (!isFirebaseConfigured || !auth) {\n        throw new Error('FIREBASE_NOT_CONFIGURED');\n      }\n      if (!password) {\n        throw new Error('Password is required for producer registration.');\n      }\n\n      const cred = await createUserWithEmailAndPassword(auth, email, password);\n      await firebaseUpdateProfile(cred.user, { displayName: hostName });\n      const mapped = mapFirebaseUser(cred.user);\n      mapped.name = hostName;\n      mapped.email = email;\n      mapped.claimStatus = 'pending_verification';\n\n      const now = new Date().toISOString();\n      const claimRecord: ProducerRegistrationRecord = {\n        id: producerId,\n        producerId,\n        userId: cred.user.uid,\n        tradeBrandName: producerName,\n        isVatVerified: false,\n        representativeName: hostName,\n        officialEmail: email,\n        status: 'pending_verification',\n        submittedAt: now,\n        updatedAt: now,\n        // The lightweight claim UI does not currently collect explicit legal terms acceptance.\n        termsAccepted: false,\n        ...(taxDetails?.legalBusinessName ? { legalBusinessName: taxDetails.legalBusinessName } : {}),\n        ...(taxDetails?.vatNumber ? { vatNumber: taxDetails.vatNumber } : {}),\n        ...(taxDetails?.taxOffice ? { taxOffice: taxDetails.taxOffice } : {}),\n        ...(taxDetails?.registeredAddress ? { registeredAddress: taxDetails.registeredAddress } : {}),\n        ...(taxDetails?.dispatchContactPhone ? { contactPhone: taxDetails.dispatchContactPhone } : {}),\n        ...(taxDetails?.countryCode ? { countryCode: taxDetails.countryCode } : {}),\n      };\n\n      await saveProducerRegistrationToCloud(claimRecord);\n      await saveUserProfileToCloud(mapped);\n      saveUserData(mapped.id, mapped.visitedProducers, mapped.personalNotes, mapped);\n      setUser(mapped);\n      return mapped;\n    } catch (error: any) {\n      console.error('Producer registration error:', error);\n      const msg = formatAuthError(error);\n      setAuthError(msg);\n      throw error;\n    } finally {\n      setIsLoading(false);\n    }\n  }, []);\n\n`
  );

  write(state);
}

// Producer portal: keep trusted-host notice editing launch-visible, quarantine commercial/prototype workflows.
{
  const state = read('src/components/Portal/ProducerPortalModal.tsx');

  replaceOnce(
    state,
    'future host flag',
    "import { HostVerificationModal, VerifiedPassInfo } from '../Monetization/HostVerificationModal';",
    "import { HostVerificationModal, VerifiedPassInfo } from '../Monetization/HostVerificationModal';\n\nconst ENABLE_FUTURE_HOST_FEATURES = false;"
  );
  replaceOnce(
    state,
    'portal default tab',
    "const [activeTab, setActiveTab] = useState<'bookings' | 'notice' | 'experiences' | 'analytics' | 'pro' | 'shipping'>('bookings');",
    "const [activeTab, setActiveTab] = useState<'bookings' | 'notice' | 'experiences' | 'analytics' | 'pro' | 'shipping'>('notice');"
  );
  replaceOnce(
    state,
    'portal unauthenticated marketing',
    'Connect your estate profile to manage incoming guest tasting reservations, post live harvest notices, and configure direct artisan shop links with <strong className="text-emerald-400">0% platform commission</strong>.',
    'Claim an existing estate profile and submit evidence for review. Verified ownership is granted only after TerroirTrail approves the claim.'
  );
  replaceOnce(
    state,
    'portal Google demo error',
    'Google sign-in requires Firebase credentials. Check your .env file or use 1-Click Host Demo.',
    'Google sign-in requires Firebase credentials. Check your .env file.'
  );
  replaceOnce(
    state,
    'portal Apple demo error',
    'Apple Sign-In is not enabled yet in your Firebase project. To use it, enable Apple in Firebase Console ➔ Authentication ➔ Sign-in method, or sign in with Google or 1-Click Host Demo.',
    'Apple Sign-In is not enabled yet in your Firebase project. To use it, enable Apple in Firebase Console ➔ Authentication ➔ Sign-in method, or sign in with Google.'
  );
  replaceOnce(
    state,
    'portal reservation controls visibility',
    'className="flex items-center gap-2.5 shrink-0 self-end md:self-auto"',
    'className="hidden"'
  );
  replaceOnce(
    state,
    'portal KPI visibility',
    'className="grid grid-cols-2 sm:grid-cols-5 gap-2 px-5 sm:px-6 py-3 bg-stone-950 border-b border-white/10 text-xs"',
    'className="hidden"'
  );

  for (const tab of ['bookings', 'experiences', 'analytics', 'pro', 'shipping']) {
    regexOnce(
      state,
      `hide ${tab} tab`,
      new RegExp(`(onClick=\\{\\(\\) => setActiveTab\\('${tab}'\\)\\}\\}\\n\\s+className=\\{\\`)py-2\\.5`),
      '$1hidden py-2.5'
    );
  }

  state.source = state.source.replaceAll('{isProTier && (', '{ENABLE_FUTURE_HOST_FEATURES && isProTier && (');
  replaceOnce(state, 'notice tab label', '<span>📢 Live Bulletin & Hours</span>', '<span>📢 Visitor Notice</span>');
  replaceOnce(state, 'notice title', '<span>Live Harvest & Cellar Bulletin</span>', '<span>Visitor Notice</span>');
  replaceOnce(state, 'notice saved copy', 'Estate bulletin saved and broadcast to live map!', 'Visitor notice saved.');
  replaceOnce(state, 'notice button copy', 'Save & Broadcast to Live Map', 'Save Visitor Notice');
  replaceOnce(
    state,
    'hide direct store block',
    '                  {/* Direct Store E-Commerce URL */}\n                  <div>',
    '                  {/* Direct Store E-Commerce URL — future feature */}\n                  <div className="hidden">'
  );
  replaceOnce(
    state,
    'hide unsupported visitor access summary',
    '                  {/* Estate Visiting Guidelines */}\n                  <div className="p-4 rounded-2xl bg-stone-900 border border-white/10 space-y-2">',
    '                  {/* Estate Visiting Guidelines — future source-backed profile controls */}\n                  <div className="hidden">'
  );

  write(state);
}

// Verified-host drawer language must describe only the launch-visible host tool.
{
  const state = read('src/components/Drawer/ProducerDetailDrawer.tsx');
  replaceOnce(
    state,
    'verified host drawer copy',
    'Manage hours, notices, tasting bookings & bottle shop',
    'Manage your estate visitor notice and reviewed profile access'
  );
  write(state);
}

// Operator approval regression: ownership approval must preserve independent VAT state.
{
  const state = read('server/tests/approveProducerRegistration.spec.ts');
  replaceOnce(
    state,
    'VAT approval expectation',
    'expect(updatedReg.isVatVerified).toBe(true);',
    'expect(updatedReg.isVatVerified).toBe(false);'
  );
  write(state);
}

console.log('✓ Phase 7 producer claim trust and Host Portal quarantine patch applied');
