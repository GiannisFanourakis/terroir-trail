import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';

const read = (file: string) => readFileSync(file, 'utf8');

describe('Phase 7 public prototype and direct-entry quarantine', () => {
  it('does not wire public route callbacks from App', () => {
    const app = read('src/App.tsx');

    expect(app).not.toContain("onOpenLoops={() => setActiveModal({ type: 'loops' })}");
    expect(app).not.toContain('onOpenLoops=');
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

  it('removes actionable route CTA from AboutFaqModal while retaining verification safety explanation', () => {
    const aboutFaq = read('src/components/About/AboutFaqModal.tsx');

    expect(aboutFaq).not.toContain('View Route Verification Status');
    expect(aboutFaq).not.toContain("actionType: 'loops'");
    expect(aboutFaq).toContain(
      'Curated driving routes are not currently published as a public route feature while their stops and access conditions are being re-verified.'
    );
    expect(aboutFaq).toContain('Curated routes are currently under verification.');
    expect(aboutFaq).toContain(
      'No draft route is silently converted into turn-by-turn navigation.'
    );
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
