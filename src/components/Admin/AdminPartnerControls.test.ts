import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('Phase 15 Block C Partner controls', () => {
  it('adds a Promotions section to the existing Host Portal without making Host commercial state authoritative', () => {
    const portal = readFileSync('src/components/Portal/ProducerPortalModal.tsx', 'utf8');
    const panel = readFileSync('src/components/Portal/ProducerCommercialPanel.tsx', 'utf8');

    expect(portal).toContain("'promotions'");
    expect(portal).toContain('Promotions');
    expect(portal).toContain('<ProducerCommercialPanel producerId={selectedProducer.id}');
    expect(panel).toContain('free organic discovery');
    expect(panel).toContain('do not prove a booking, visit or revenue outcome');
    expect(panel).toContain('Payment');
    expect(panel).not.toContain('isProTier');
  });

  it('keeps campaign mutation in Admin and requires factual review before approval', () => {
    const admin = readFileSync('src/components/Admin/AdminPartnerCampaigns.tsx', 'utf8');
    const panel = readFileSync('src/components/Admin/AdminPanelModal.tsx', 'utf8');

    expect(panel).toContain('<AdminPartnerCampaigns />');
    expect(admin).toContain('Activate pilot Partner');
    expect(admin).toContain('Submit review');
    expect(admin).toContain('Approve');
    expect(admin).toContain('Schedule');
    expect(admin).toContain('Pause');
    expect(admin).toContain('Preview');
    expect(admin).toContain('Confirm this campaign copy has been checked against the producer');
    expect(admin).toContain('does not override or contradict them');
    expect(admin).toContain('Payment does not change TerroirTrail verification');
    expect(admin).not.toContain('isProTier');
    expect(admin).not.toMatch(/CPM|CPC|bid|auction/i);
  });
});
