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
    expect(authModal).toContain('Submit claim for review');
    expect(authModal).toContain('Host permissions come only from listings explicitly approved and assigned by TerroirTrail.');
  });

  it('persists only claimant-supplied evidence for a pending ownership claim', () => {
    const authHook = read('src/hooks/useAuth.ts');

    expect(authHook).not.toContain("producerCategory: 'winery'");
    expect(authHook).not.toContain("legalEntityType: 'private_company_ike'");
    expect(authHook).not.toContain("accessType: 'standard_courier_van'");
    expect(authHook).not.toContain("pickupTimeWindow: '09:00 - 15:00'");
    expect(authHook).not.toContain('maxDailyParcels: 10');
    expect(authHook).not.toContain("dispatchLeadTime: 'next_day'");
    expect(authHook).toContain('if (!termsAccepted)');
    expect(authHook).toContain("status: 'pending_verification'");
    expect(authHook).toContain('isVatVerified: false');
  });

  it('keeps Partner subscription post-claim while unrelated commerce remains quarantined', () => {
    const portal = read('src/components/Portal/ProducerPortalModal.tsx');
    const partnerPanel = read('src/components/Portal/ProducerPromotionPanel.tsx');
    const drawer = read('src/components/Drawer/ProducerDetailDrawer.tsx');

    expect(portal).toContain("type PortalTab = 'overview' | 'promotions' | 'notice' | 'content' | 'photos' | 'account';");
    expect(portal).toContain('Admin approval is still required before Host Portal controls');
    expect(portal).toContain('including the optional Partner subscription');
    expect(portal).toContain('TerroirTrail Partner — €199/year');
    expect(portal).toContain('View Partner subscription');
    expect(partnerPanel).toContain('Annual Partner subscription for approved Hosts');
    expect(partnerPanel).toContain('Subscribe — €199/year');
    expect(portal).toContain('Visitor Information');
    expect(portal).toContain('Listing Content');
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
