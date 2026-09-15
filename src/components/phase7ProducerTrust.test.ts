import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const read = (file: string) => readFileSync(file, 'utf8');

describe('Phase 7 producer claim trust boundaries', () => {
  it('does not present frontend identity signals as host verification', () => {
    const authModal = read('src/components/Auth/AuthModal.tsx');

    expect(authModal).not.toContain('Fast 1-Click Verification');
    expect(authModal).not.toContain('Verified Host Pro');
    expect(authModal).not.toContain('Artisan Producer Estate O.E. (Demo Entity)');
    expect(authModal).not.toContain('124 Wine Route, Dispatch Bay 2, 70100');
    expect(authModal).not.toContain('Claim Estate & Activate Host Portal');
    expect(authModal).toContain('Submit Claim for Review');
    expect(authModal).toContain('does not automatically prove estate ownership');
  });

  it('persists only claimant-supplied evidence for a pending ownership claim', () => {
    const authHook = read('src/hooks/useAuth.ts');

    expect(authHook).not.toContain("producerCategory: 'winery'");
    expect(authHook).not.toContain("legalEntityType: 'private_company_ike'");
    expect(authHook).not.toContain("accessType: 'standard_courier_van'");
    expect(authHook).not.toContain("pickupTimeWindow: '09:00 - 15:00'");
    expect(authHook).not.toContain('maxDailyParcels: 10');
    expect(authHook).not.toContain("dispatchLeadTime: 'next_day'");
    expect(authHook).not.toContain('termsAccepted: true');
    expect(authHook).toContain('termsAccepted: false');
    expect(authHook).toContain("status: 'pending_verification'");
    expect(authHook).toContain('isVatVerified: false');
  });

  it('keeps future host commercial workflows quarantined from the Phase 11 portal', () => {
    const portal = read('src/components/Portal/ProducerPortalModal.tsx');
    const drawer = read('src/components/Drawer/ProducerDetailDrawer.tsx');

    expect(portal).toContain("type PortalTab = 'overview' | 'notice' | 'photos' | 'account';");
    expect(portal).toContain('Visitor Notice');
    expect(portal).toContain('Protected TerroirTrail evidence');
    expect(portal).toContain('cannot be self-declared by a host');
    expect(portal).not.toContain('Reservations Queue');
    expect(portal).not.toContain('Host Pro Tier');
    expect(portal).not.toContain('Tasting Flights');
    expect(portal).not.toContain('Scan Guest Pass');
    expect(portal).not.toContain('1-Click Host Demo');
    expect(drawer).not.toContain('Manage hours, notices, tasting bookings & bottle shop');
  });
});
