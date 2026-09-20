import React from 'react';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { AboutFaqModal } from './AboutFaqModal';
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
});
