import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';

const read = (file: string) => readFileSync(file, 'utf8');

describe('Phase 7 public prototype and direct-entry quarantine', () => {
  it('confirms Discovery Guides and route entry points are completely absent from App', () => {
    const app = read('src/App.tsx');

    expect(app).not.toContain('onOpenLoops');
    expect(app).not.toContain("type: 'loops'");
    expect(app).not.toContain('DayTripModal');
    expect(existsSync('src/components/Loops/DayTripModal.tsx')).toBe(false);
    expect(existsSync('src/components/Loops')).toBe(false);
    expect(existsSync('src/data/loops.ts')).toBe(false);
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

  it('keeps producer pass scanning out of the launch host portal while preserving future infrastructure', () => {
    const producerPortal = read('src/components/Portal/ProducerPortalModal.tsx');

    expect(producerPortal).not.toContain('Scan Guest Pass');
    expect(producerPortal).not.toContain('Scan VIP Pass');
    expect(producerPortal).not.toContain("import { HostQrScannerModal } from './HostQrScannerModal';");
    expect(producerPortal).not.toContain('<HostQrScannerModal');
    expect(producerPortal).not.toContain('<HostVerificationModal');

    expect(existsSync('src/components/Portal/HostQrScannerModal.tsx')).toBe(true);
    expect(existsSync('src/components/Monetization/HostVerificationModal.tsx')).toBe(true);
  });

  it('preserves dormant future components and modal branches without deletion', () => {
    const app = read('src/App.tsx');

    // Future components remain in tree
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
    expect(app).toContain("activeModal?.type === 'booking'");
    expect(app).toContain("activeModal?.type === 'pass'");
    expect(app).toContain("activeModal?.type === 'digital_pass'");
    expect(app).toContain("activeModal?.type === 'host_verify'");
    expect(app).toContain("activeModal?.type === 'chauffeur'");

    // Does not auto-trigger host verification from query strings
    expect(app).not.toContain('verify_pass');
    expect(app).not.toContain('verifyExplorerPass');
    expect(app).toContain('onPassVerified={(info) =>');
    expect(app).toContain("setActiveModal({ type: 'host_verify', guestInfo: info })");
  });
});
