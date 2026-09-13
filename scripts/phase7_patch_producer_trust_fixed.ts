import fs from 'node:fs';
import path from 'node:path';

type State = { file: string; text: string; eol: '\n' | '\r\n' };
const load = (file: string): State => {
  const raw = fs.readFileSync(path.resolve(file), 'utf8');
  return { file, text: raw.replace(/\r\n/g, '\n'), eol: raw.includes('\r\n') ? '\r\n' : '\n' };
};
const save = (s: State) => fs.writeFileSync(path.resolve(s.file), s.text.replace(/\n/g, s.eol));
const once = (s: State, label: string, from: string, to: string) => {
  const n = s.text.split(from).length - 1;
  if (n !== 1) throw new Error(`${label}: expected 1 match, found ${n}. Refusing to patch.`);
  s.text = s.text.replace(from, to);
};
const regexOnce = (s: State, label: string, re: RegExp, to: string) => {
  const flags = re.flags.includes('g') ? re.flags : `${re.flags}g`;
  const n = [...s.text.matchAll(new RegExp(re.source, flags))].length;
  if (n !== 1) throw new Error(`${label}: expected 1 regex match, found ${n}. Refusing to patch.`);
  s.text = s.text.replace(re, to);
};
const hideTab = (s: State, tab: string) => {
  const marker = `onClick={() => setActiveTab('${tab}')}`;
  const i = s.text.indexOf(marker);
  if (i < 0 || s.text.indexOf(marker, i + 1) >= 0) throw new Error(`hide ${tab}: marker mismatch`);
  const token = 'className={`';
  const c = s.text.indexOf(token, i);
  if (c < 0 || c - i > 600) throw new Error(`hide ${tab}: nearby class not found`);
  const at = c + token.length;
  s.text = s.text.slice(0, at) + 'hidden ' + s.text.slice(at);
};

// 1. Claim UI: evidence submission, never instant host verification.
{
  const s = load('src/components/Auth/AuthModal.tsx');
  const pairs: Array<[string, string, string]> = [
    ['traveler copy', "Access your Terroir Passport, verified tasting notes, and bookings.", "Access your Terroir Passport, saved producers, and personal tasting notes."],
    ['producer login copy', "Manage your cellar reservations, operating hours, and direct shop links.", "Access your verified estate profile and visitor notice tools."],
    ['producer claim copy', "Verify your artisan estate to accept bookings, manage shop links, and setup logistics.", "Submit evidence that you represent this estate. TerroirTrail reviews every claim before host access is granted."],
    ['traveler upsell', 'Sign in to save stamps & notes. (Explorer Pass is an optional upgrade)', 'Sign in to save stamps, favorites and personal notes across devices.'],
    ['fiscal heading', 'Fiscal & Shipping Registration', 'Optional Business Evidence'],
    ['VAT badge', '<span>{fiscalLabels.shortVatLabel} Verification</span>', '<span>{fiscalLabels.shortVatLabel} Format Check</span>'],
    ['VAT explanation', 'Tax ID verifies genuine estate ownership, qualifies your estate for 0% commission B2B statements, and activates direct bottle & artisan box parcel shipping.', 'Business details can support the ownership review, but a valid format does not by itself prove that you own or represent the estate.'],
    ['VAT optional label', '{fiscalLabels.fullVatLabel} <span className="text-rose-400">*</span>', '{fiscalLabels.fullVatLabel} <span className="text-stone-500">(optional evidence)</span>'],
    ['business placeholder', 'e.g. Artisan Producer Estate O.E. (Demo Entity)', 'Registered business name'],
    ['address label', 'Estate Dispatch Pickup Address (For Couriers & Invoices)', 'Registered Business Address (optional evidence)'],
    ['address placeholder', 'e.g. 124 Wine Route, Dispatch Bay 2, 70100', 'Registered business address'],
    ['submit progress', 'Verifying & Claiming...', 'Submitting Claim...'],
    ['submit action', 'Claim Estate & Activate Host Portal', 'Submit Claim for Review'],
  ];
  for (const [label, from, to] of pairs) once(s, label, from, to);

  regexOnce(
    s,
    'Host Pro callout',
    /\s*\{\/\* Producer Host Pro Benefit Callout \*\/\}[\s\S]*?(?=\s*\{\/\* 1\. PRODUCER HOST SIGN IN \*\/\})/,
    `\n              <div className="p-3 rounded-2xl bg-stone-900 border border-white/10 text-left space-y-1.5">\n                <div className="flex items-center gap-2 text-xs font-bold text-white">\n                  <ShieldCheck className="w-4 h-4 text-amber-400" />\n                  <span>Host access is reviewed</span>\n                </div>\n                <p className="text-[10px] text-stone-400 leading-relaxed">Signing in, using a business email, or entering a VAT number does not automatically prove estate ownership. New claims remain pending until TerroirTrail approves the evidence.</p>\n              </div>\n`
  );
  regexOnce(
    s,
    'one-click claim block',
    /\s*\{\/\* Fast 1-Click Verification via Google \/ Apple \*\/\}[\s\S]*?(?=\s*<form onSubmit=\{handleProducerClaim\})/,
    `\n                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1.5">\n                    <div className="font-bold text-amber-300 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /><span>Claim review</span></div>\n                    <p className="text-[11px] text-stone-300 leading-relaxed">Submit the claim below. Your account stays a traveler account until TerroirTrail reviews the evidence and the trusted backend assigns this estate to you.</p>\n                  </div>\n`
  );
  regexOnce(
    s,
    'claim evidence construction',
    /    const countryCode = fiscalCountry \|\|[\s\S]*?(?=    try \{\n      setLocalLoading\('form'\);)/,
    `    const countryCode = fiscalCountry || ((producer.country === 'Italy' || producer.destination === 'tuscany') ? 'IT' : 'GR');\n    const vatCheck = vatNumber.trim() ? validateVatNumber(vatNumber.trim(), countryCode) : null;\n\n    if (vatNumber.trim() && !vatCheck?.isValid) {\n      setLocalError(vatCheck?.error || \`Please enter a valid \${fiscalLabels.shortVatLabel} for \${fiscalLabels.countryName}.\`);\n      return;\n    }\n    if (vatNumber.trim() && !legalBusinessName.trim()) {\n      setLocalError('Please enter the registered business name when supplying a VAT / Tax ID.');\n      return;\n    }\n\n    const taxDetails: ProducerTaxDetails | undefined = vatNumber.trim() ? {\n      vatNumber: vatCheck?.formatted || vatNumber.trim(),\n      legalBusinessName: legalBusinessName.trim(),\n      taxOffice: taxOffice.trim() || undefined,\n      registeredAddress: registeredAddress.trim() || undefined,\n      dispatchContactPhone: dispatchContactPhone.trim() || undefined,\n      countryCode,\n      isVatVerified: false,\n    } : undefined;\n\n`
  );
  save(s);
}

// 2. Pending claim persistence: only supplied evidence, no fake commercial/logistics defaults.
{
  const s = load('src/hooks/useAuth.ts');
  once(s, 'claim record import', "import { UserProfile, TravelerType, ProducerTaxDetails, HostClaimStatus } from '../types/auth';", "import { UserProfile, TravelerType, ProducerTaxDetails, ProducerRegistrationRecord, HostClaimStatus } from '../types/auth';");
  regexOnce(
    s,
    'claim persistence block',
    /  \/\/ 6d\. Real Claim & Register Estate Host with Fiscal \/ VAT Verification[\s\S]*?(?=  \/\/ 6e\. Update Producer Fiscal & Shipping Details \(Local demo only\))/,
    `  // 6d. Submit an estate ownership claim for operator review.\n  // Authentication and client-side format checks are evidence inputs only; they never grant host authority.\n  const claimAndRegisterProducer = useCallback(async (\n    producerId: string, producerName: string, hostName: string, email: string, password?: string, taxDetails?: ProducerTaxDetails\n  ) => {\n    setIsLoading(true);\n    setAuthError(null);\n    try {\n      if (!isFirebaseConfigured || !auth) throw new Error('FIREBASE_NOT_CONFIGURED');\n      if (!password) throw new Error('Password is required for producer registration.');\n      const cred = await createUserWithEmailAndPassword(auth, email, password);\n      await firebaseUpdateProfile(cred.user, { displayName: hostName });\n      const mapped = mapFirebaseUser(cred.user);\n      mapped.name = hostName;\n      mapped.email = email;\n      mapped.claimStatus = 'pending_verification';\n      const now = new Date().toISOString();\n      const claimRecord: ProducerRegistrationRecord = {\n        id: producerId, producerId, userId: cred.user.uid, tradeBrandName: producerName,\n        isVatVerified: false, representativeName: hostName, officialEmail: email,\n        status: 'pending_verification', submittedAt: now, updatedAt: now, termsAccepted: false,\n        ...(taxDetails?.legalBusinessName ? { legalBusinessName: taxDetails.legalBusinessName } : {}),\n        ...(taxDetails?.vatNumber ? { vatNumber: taxDetails.vatNumber } : {}),\n        ...(taxDetails?.taxOffice ? { taxOffice: taxDetails.taxOffice } : {}),\n        ...(taxDetails?.registeredAddress ? { registeredAddress: taxDetails.registeredAddress } : {}),\n        ...(taxDetails?.dispatchContactPhone ? { contactPhone: taxDetails.dispatchContactPhone } : {}),\n        ...(taxDetails?.countryCode ? { countryCode: taxDetails.countryCode } : {}),\n      };\n      await saveProducerRegistrationToCloud(claimRecord);\n      await saveUserProfileToCloud(mapped);\n      saveUserData(mapped.id, mapped.visitedProducers, mapped.personalNotes, mapped);\n      setUser(mapped);\n      return mapped;\n    } catch (error: any) {\n      console.error('Producer registration error:', error);\n      const msg = formatAuthError(error);\n      setAuthError(msg);\n      throw error;\n    } finally { setIsLoading(false); }\n  }, []);\n\n`
  );
  save(s);
}

// 3. Host Portal launch surface: Visitor Notice only; future commercial workflows stay dormant.
{
  const s = load('src/components/Portal/ProducerPortalModal.tsx');
  const pairs: Array<[string, string, string]> = [
    ['feature flag', "import { HostVerificationModal, VerifiedPassInfo } from '../Monetization/HostVerificationModal';", "import { HostVerificationModal, VerifiedPassInfo } from '../Monetization/HostVerificationModal';\n\nconst ENABLE_FUTURE_HOST_FEATURES = false;"],
    ['default tab', ">('bookings');", ">('notice');"],
    ['portal marketing', 'Connect your estate profile to manage incoming guest tasting reservations, post live harvest notices, and configure direct artisan shop links with <strong className="text-emerald-400">0% platform commission</strong>.', 'Claim an existing estate profile and submit evidence for review. Verified ownership is granted only after TerroirTrail approves the claim.'],
    ['Google demo error', 'Google sign-in requires Firebase credentials. Check your .env file or use 1-Click Host Demo.', 'Google sign-in requires Firebase credentials. Check your .env file.'],
    ['Apple demo error', 'Apple Sign-In is not enabled yet in your Firebase project. To use it, enable Apple in Firebase Console ➔ Authentication ➔ Sign-in method, or sign in with Google or 1-Click Host Demo.', 'Apple Sign-In is not enabled yet in your Firebase project. To use it, enable Apple in Firebase Console ➔ Authentication ➔ Sign-in method, or sign in with Google.'],
    ['reservation controls', 'className="flex items-center gap-2.5 shrink-0 self-end md:self-auto"', 'className="hidden"'],
    ['KPI strip', 'className="grid grid-cols-2 sm:grid-cols-5 gap-2 px-5 sm:px-6 py-3 bg-stone-950 border-b border-white/10 text-xs"', 'className="hidden"'],
    ['notice tab', '<span>📢 Live Bulletin & Hours</span>', '<span>📢 Visitor Notice</span>'],
    ['notice heading', '<span>Live Harvest & Cellar Bulletin</span>', '<span>Visitor Notice</span>'],
    ['notice saved', 'Estate bulletin saved and broadcast to live map!', 'Visitor notice saved.'],
    ['notice button', 'Save & Broadcast to Live Map', 'Save Visitor Notice'],
    ['direct shop hidden', '                  {/* Direct Store E-Commerce URL */}\n                  <div>', '                  {/* Direct Store E-Commerce URL — future feature */}\n                  <div className="hidden">'],
    ['access summary hidden', '                  {/* Estate Visiting Guidelines */}\n                  <div className="p-4 rounded-2xl bg-stone-900 border border-white/10 space-y-2">', '                  {/* Estate Visiting Guidelines — future source-backed profile controls */}\n                  <div className="hidden">'],
  ];
  for (const [label, from, to] of pairs) once(s, label, from, to);
  for (const tab of ['bookings', 'experiences', 'analytics', 'pro', 'shipping']) hideTab(s, tab);
  if (!s.text.includes('{isProTier && (')) throw new Error('Host Pro condition not found');
  s.text = s.text.replaceAll('{isProTier && (', '{ENABLE_FUTURE_HOST_FEATURES && isProTier && (');

  regexOnce(
    s,
    'optional registration record handling',
    /                    onSaved=\{\(record\) => \{[\s\S]*?                    \}\}\n(?=                  \/>)/,
    `                    onSaved={(record) => {\n                      const registrationAddress = record.registeredAddress || (record.logistics ? [record.logistics.streetAddress, record.logistics.cityOrVillage, record.logistics.postalCode].filter(Boolean).join(', ') : '');\n                      const registrationPhone = record.contactPhone || record.logistics?.dispatchPhone || '';\n                      setTaxVatNumber(record.vatNumber || '');\n                      setTaxLegalName(record.legalBusinessName || '');\n                      setTaxOffice(record.taxOffice || '');\n                      setTaxAddress(registrationAddress);\n                      setTaxPhone(registrationPhone);\n                      setTaxEori(record.eoriNumber || '');\n                      if (onUpdateProducerTaxDetails && record.vatNumber && record.legalBusinessName && record.countryCode) {\n                        onUpdateProducerTaxDetails({\n                          vatNumber: record.vatNumber, legalBusinessName: record.legalBusinessName, taxOffice: record.taxOffice,\n                          registeredAddress: registrationAddress || undefined, dispatchContactPhone: registrationPhone || undefined,\n                          countryCode: record.countryCode, isVatVerified: record.isVatVerified, vatVerificationDate: record.vatVerificationDate,\n                          eoriNumber: record.eoriNumber, gemiNumber: record.permits?.gemiNumber, iban: record.banking?.iban, registrationRecord: record,\n                        });\n                      }\n                    }}\n`
  );
  save(s);
}

// 4. Dormant full registration form remains compilable against optional claim fields.
{
  const s = load('src/components/Portal/ProducerRegistrationForm.tsx');
  once(s, 'logistics type', "useState<ProducerRegistrationRecord['logistics']['accessType']>('standard_courier_van')", "useState<NonNullable<ProducerRegistrationRecord['logistics']>['accessType']>('standard_courier_van')");
  once(s, 'packaging type', "useState<ProducerRegistrationRecord['packaging']['dispatchLeadTime']>('next_day')", "useState<NonNullable<ProducerRegistrationRecord['packaging']>['dispatchLeadTime']>('next_day')");
  once(s, 'future form demo placeholder', 'placeholder="e.g. Artisan Heritage Estate O.E. (Demo Entity)"', 'placeholder="Registered business name"');
  once(s, 'optional banking summary', '<span>SEPA IBAN: {submitSuccess.banking.iban}</span>', '<span>SEPA IBAN: {submitSuccess.banking?.iban || \'Not supplied\'}</span>');
  save(s);
}

// 5. Verified-host copy and VAT-approval regression test.
{
  const s = load('src/components/Drawer/ProducerDetailDrawer.tsx');
  once(s, 'drawer host copy', 'Manage hours, notices, tasting bookings & bottle shop', 'Manage your estate visitor notice and reviewed profile access');
  save(s);
}
{
  const s = load('server/tests/approveProducerRegistration.spec.ts');
  once(s, 'VAT approval expectation', 'expect(updatedReg.isVatVerified).toBe(true);', 'expect(updatedReg.isVatVerified).toBe(false);');
  save(s);
}

console.log('✓ Phase 7 producer claim trust and Host Portal quarantine patch applied');
