import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';

const read = (file: string) => readFileSync(file, 'utf8');

describe('Phase 7 public prototype and direct-entry quarantine', () => {
  it('keeps the Phase 9 public route entry point safety-gated', () => {
    const app = read('src/App.tsx');
    const routes = read('src/components/Loops/DayTripModal.tsx');

    expect(app).toContain("onOpenLoops={() => setActiveModal({ type: 'loops' })}");
    expect(app).toContain("activeModal?.type === 'loops'");

    expect(routes).toContain("loop.verificationStatus === 'verified_stops'");
    expect(routes).toContain("loop.verificationStatus === 'verified'");
    expect(routes).toContain('evaluateRouteNavigation(currentLoop, producerCatalogue)');
    expect(routes).toContain('Multi-stop driving navigation withheld');
  });

  it('removes commercial query parameters, pass auto-verification, and stripe banners from App', () => {
    const app = read('src/App.tsx');

    expect(app).not.toContain('checkout_session_id');
    expect(app).not.toContain('verify_pass');
    expect(app).not.toContain("params.has('vip')");
    expect(app).not.toContain("params.get('producer') === 'upgraded'");
    expect(app).not.toContain('stripeNotification');
    expect(app).not.toContain('verifyExplorerPass');
    expect(app).not.toContain('refreshExplorerPass');
  });

  it('preserves legitimate producer discovery deep links in App', () => {
    const app = read('src/App.tsx');

    expect(app).toContain("const target = params.get('producer');");
    expect(app).toContain('setSelectedProducer(match);');
    expect(app).toContain('setIsDrawerOpen(true);');
  });

  it('documents the Discovery Guide model without weakening navigation quarantine', () => {
    const aboutFaq = read('src/components/About/AboutFaqModal.tsx');

    expect(aboutFaq).toContain('Browse Discovery Guides');
    expect(aboutFaq).toContain("actionType: 'loops'");
    expect(aboutFaq).toContain(
      'TerroirTrail publishes Discovery Guides when their stop identities, locations and visitor states have been reviewed.'
    );
    expect(aboutFaq).toContain('Three are currently published in Crete and three in Santorini.');
    expect(aboutFaq).toContain(
      'multi-stop turn-by-turn driving navigation remains withheld until the required road-access safety evidence is available.'
    );
    expect(aboutFaq).toContain(
      'A Discovery Guide is a verified stop collection, not a road-safety guarantee.'
    );
    expect(aboutFaq).toContain('Draft guides remain hidden.');
  });

  it('quarantines producer pass scanning behind the disabled future-host flag while preserving infrastructure', () => {
    const producerPortal = read('src/components/Portal/ProducerPortalModal.tsx');

    expect(producerPortal).toContain('const ENABLE_FUTURE_HOST_FEATURES = false;');
    expect(producerPortal).toMatch(
      /\{ENABLE_FUTURE_HOST_FEATURES\s*&&\s*isProducerAuthenticated\s*&&\s*\([\s\S]{0,1000}<span>Scan Guest Pass<\/span>[\s\S]{0,1000}\)\}/
    );

    expect(existsSync('src/components/Portal/HostQrScannerModal.tsx')).toBe(true);
    expect(producerPortal).toContain("import { HostQrScannerModal } from './HostQrScannerModal';");
    expect(producerPortal).toContain('const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);');
    expect(producerPortal).toContain('const handlePassVerified = (info: VerifiedPassInfo) => {');
    expect(producerPortal).toContain('<HostQrScannerModal');
    expect(producerPortal).toContain('onPassVerified={handlePassVerified}');
    expect(producerPortal).toContain('<HostVerificationModal');
  });

  it('preserves dormant future components and modal branches without deletion', () => {
    const app = read('src/App.tsx');

    // Future components remain in tree
    expect(existsSync('src/components/Loops/DayTripModal.tsx')).toBe(true);
    expect(existsSync('src/components/Bookings/BookingModal.tsx')).toBe(true);
    expect(existsSync('src/components/Bookings/MyBookingsModal.tsx')).toBe(true);
    expect(existsSync('src/components/Monetization/ExplorerPassModal.tsx')).toBe(true);
    expect(existsSync('src/components/Monetization/DigitalPassModal.tsx')).toBe(true);
    expect(existsSync('src/components/Monetization/ChauffeurBookingModal.tsx')).toBe(true);
    expect(existsSync('src/components/Monetization/HostVerificationModal.tsx')).toBe(true);
    expect(existsSync('src/services/explorerPass.ts')).toBe(true);
    expect(existsSync('server/services/passService.ts')).toBe(true);
    expect(existsSync('src/hooks/useBookings.ts')).toBe(true);

    // Dormant modal branches exist in App for future activation
    expect(app).toContain("activeModal?.type === 'loops'");
    expect(app).toContain("activeModal?.type === 'booking'");
    expect(app).toContain("activeModal?.type === 'pass'");
    expect(app).toContain("activeModal?.type === 'digital_pass'");
    expect(app).toContain("activeModal?.type === 'host_verify'");
    expect(app).toContain("activeModal?.type === 'chauffeur'");

    // Does not auto-trigger host verification from query strings
    expect(app).not.toContain('verify_pass');
    expect(app).not.toContain('verifyExplorerPass');
    expect(app).toContain("onPassVerified={(info) => setActiveModal({ type: 'host_verify', guestInfo: info })}");
  });
});
