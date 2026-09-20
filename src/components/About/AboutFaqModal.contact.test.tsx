import React from 'react';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { AboutFaqModal, FAQ_DATA } from './AboutFaqModal';
import { CATALOGUE_SUMMARY } from '../../data/catalogueSummary.generated';

const INSTAGRAM_URL = 'https://www.instagram.com/terroirtrail/';
const INSTAGRAM_QR_SHA256 = 'ac21f4dff0991a18b326e0be493bbe5b5bc75cf62e93f9803497a8a1a7979cbd';

describe('AboutFaqModal public copy and contact channels', () => {
  it('exposes Contact as a first-class tab with the real Gmail and Instagram paths', () => {
    const html = renderToString(
      React.createElement(AboutFaqModal, {
        isOpen: true,
        onClose: () => {},
        initialTab: 'contact',
      })
    );

    expect(html).toContain('Contact');
    expect(html).toContain('Contact TerroirTrail');
    expect(html).toContain('mailto:terroirtrail@gmail.com');
    expect(html).toContain('terroirtrail@gmail.com');
    expect(html).not.toContain('gian.fanourakis@gmail.com');
    expect(html).toContain(INSTAGRAM_URL);
    expect(html).toContain('@TERROIRTRAIL');
    expect(html).toContain('/terroirtrail-instagram-qr.svg');
  });

  it('uses current public-facing About copy instead of the old internal QA language', () => {
    const html = renderToString(
      React.createElement(AboutFaqModal, {
        isOpen: true,
        onClose: () => {},
        initialTab: 'about',
      })
    );

    expect(html).toContain('Independent Producer &amp; Agritourism Guide');
    expect(html).toContain('Discover independent makers and the places behind what they make.');
    expect(html).toContain('Across Europe');
    expect(html).toContain(String(CATALOGUE_SUMMARY.producers));
    expect(html).toContain(String(CATALOGUE_SUMMARY.countries));
    expect(html).toContain(String(CATALOGUE_SUMMARY.destinations));
    expect(html).toContain(String(CATALOGUE_SUMMARY.categories));
    for (const country of CATALOGUE_SUMMARY.countryNames) {
      expect(html).toContain(country);
    }
    expect(html).not.toContain('Across Greece and into Italy');
    expect(html).not.toContain('Find real makers without turning missing evidence into travel promises.');
    expect(html).not.toContain('reference-quality');
  });

  it('ships the verified Instagram QR asset used by the contact tab', () => {
    const qrAsset = readFileSync(
      resolve(process.cwd(), 'public/terroirtrail-instagram-qr.svg')
    );

    expect(createHash('sha256').update(qrAsset).digest('hex')).toBe(INSTAGRAM_QR_SHA256);
  });

  it('renders comprehensive FAQ content answering visiting, road access, partnership, and producer questions', () => {
    const html = renderToString(
      React.createElement(AboutFaqModal, {
        isOpen: true,
        onClose: () => {},
        initialTab: 'faq',
      })
    );

    // Questions rendered in accordion triggers
    expect(html).toContain('What is TerroirTrail?');
    expect(html).toContain('Why does TerroirTrail exist?');
    expect(html).toContain('What categories of producers are included?');
    expect(html).toContain('How are listings researched and verified?');
    expect(html).toContain('Does a TerroirTrail listing mean the producer is a partner?');
    expect(html).toContain('Where does TerroirTrail currently have coverage?');
    expect(html).toContain('What visitability states does TerroirTrail show?');
    expect(html).toContain('How do booking and walk-in policies work?');
    expect(html).toContain('How does TerroirTrail handle rural road access?');
    expect(html).toContain('Do I need to contact a producer before visiting?');
    expect(html).toContain('How much do tastings or visits cost?');
    expect(html).toContain('Are producers family-friendly or accessible?');
    expect(html).toContain('What is the Terroir Passport?');
    expect(html).toContain('How can a producer be added to TerroirTrail?');
    expect(html).toContain('How can a producer correct or update information?');
    expect(html).toContain('Does TerroirTrail sell bookings, paid passes, or charge commissions?');

    // Key principles and invariants in FAQ_DATA
    const allFaqText = FAQ_DATA.map((f) => `${f.question} ${f.answer} ${f.highlight ?? ''}`).join(' ');
    expect(allFaqText).toContain('Published does not mean partnered.');
    expect(allFaqText).toContain('Unknown does not mean No');
    expect(allFaqText).toContain('Location and road access are separate');
    expect(allFaqText).toContain('fails closed');
  });

  it('asserts dynamic catalogue invariants and evidence-first rules across About and FAQ', () => {
    const aboutHtml = renderToString(
      React.createElement(AboutFaqModal, {
        isOpen: true,
        onClose: () => {},
        initialTab: 'about',
      })
    );

    // Dynamic scope invariants
    expect(CATALOGUE_SUMMARY.producers).toBeGreaterThan(0);
    expect(CATALOGUE_SUMMARY.countries).toBe(CATALOGUE_SUMMARY.countryNames.length);
    expect(CATALOGUE_SUMMARY.categories).toBe(CATALOGUE_SUMMARY.categoryNames.length);

    expect(aboutHtml).toContain(String(CATALOGUE_SUMMARY.producers));
    expect(aboutHtml).toContain(String(CATALOGUE_SUMMARY.destinations));
    expect(aboutHtml).toContain(String(CATALOGUE_SUMMARY.countries));
    expect(aboutHtml).toContain(String(CATALOGUE_SUMMARY.categories));

    const allFaqText = FAQ_DATA.map((f) => `${f.question} ${f.answer} ${f.highlight ?? ''}`).join(' ');
    expect(allFaqText).toContain(String(CATALOGUE_SUMMARY.producers));
    expect(allFaqText).toContain(String(CATALOGUE_SUMMARY.destinations));
    expect(allFaqText).toContain(String(CATALOGUE_SUMMARY.countries));
    expect(allFaqText).toContain(String(CATALOGUE_SUMMARY.categories));

    for (const category of CATALOGUE_SUMMARY.categoryNames) {
      expect(aboutHtml).toContain(category);
      expect(allFaqText).toContain(category);
    }

    for (const country of CATALOGUE_SUMMARY.countryNames) {
      expect(aboutHtml).toContain(country);
      expect(allFaqText).toContain(country);
    }

    // No stale regional phrasing
    expect(aboutHtml).not.toContain('Across Greece and into Italy');
    expect(allFaqText).not.toContain('Across Greece and into Italy');

    // Unknown does not mean No rule is upheld
    expect(aboutHtml).toContain('Evidence-first standard: Unknown does not mean No');
    expect(aboutHtml).toContain('Opening hours → walk-ins accepted');
    expect(aboutHtml).toContain('Contact form → booking required');
    expect(aboutHtml).toContain('Route on a map → rental-car-safe road');
    expect(aboutHtml).toContain('Shop access → factory or production-site access');
  });
});
