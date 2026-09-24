import React from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { LegalModal } from './LegalModal';

describe('LegalModal and Legal Documentation Synchronization', () => {
  it('renders privacy tab with current product reality, affiliate disclosures, and in-app account deletion', () => {
    const html = renderToString(
      React.createElement(LegalModal, {
        isOpen: true,
        onClose: () => {},
        initialTab: 'privacy',
      })
    );

    expect(html).toContain('Privacy at the current launch stage');
    expect(html).toContain('live optional Explorer Pass purchases');
    expect(html).toContain('approved Host Partner billing');
    expect(html).toContain('Travelpayouts');
    expect(html).toContain('Explorer Pass holders enjoy an ad-free experience');
    expect(html).toContain('Account &amp; privacy');
    expect(html).toContain('permanently delete their account');
    expect(html).toContain('terroirtrail@gmail.com');
    expect(html).not.toContain('legal@terroirtrail.com');
    expect(html).not.toContain('There is not yet an in-app account deletion control');
    expect(html).toContain('24 Sep 2026');
  });

  it('renders terms tab with affiliate disclosures and no OTA status', () => {
    const html = renderToString(
      React.createElement(LegalModal, {
        isOpen: true,
        onClose: () => {},
        initialTab: 'terms',
      })
    );

    expect(html).toContain('Travel affiliate links');
    expect(html).toContain('Travelpayouts');
    expect(html).toContain('not an online travel agency');
    expect(html).toContain('Explorer Pass purchases');
    expect(html).toContain('18 or older');
    expect(html).toContain('withdrawal rights');
  });

  it('renders the independent listing and free-correction policy', () => {
    const html = renderToString(
      React.createElement(LegalModal, {
        isOpen: true,
        onClose: () => {},
        initialTab: 'producers',
      })
    );

    expect(html).toContain('without a commercial relationship or prior claim');
    expect(html).toContain('Corrections and legal/privacy requests are free');
    expect(html).toContain('does not automatically remove accurate');
  });

  it('renders licenses tab declaring proprietary software and open-source/geospatial third-party attributions', () => {
    const html = renderToString(
      React.createElement(LegalModal, {
        isOpen: true,
        onClose: () => {},
        initialTab: 'licenses',
      })
    );

    expect(html).toContain('TerroirTrail software');
    expect(html).toContain('proprietary works owned by TerroirTrail');
    expect(html).toContain('All Rights Reserved');
    expect(html).toContain('LICENSE.md');
    expect(html).not.toContain('The repository is distributed under the MIT License');
    expect(html).toContain('geoBoundaries (CC BY 4.0)');
    expect(html).toContain('OpenStreetMap (ODbL)');
  });

  it('validates repo legal files for proprietary licensing and valid contact email', () => {
    const licenseMd = readFileSync(resolve(process.cwd(), 'LICENSE.md'), 'utf8');
    const readmeMd = readFileSync(resolve(process.cwd(), 'README.md'), 'utf8');
    const privacyPolicyMd = readFileSync(resolve(process.cwd(), 'PRIVACY_POLICY.md'), 'utf8');
    const termsOfServiceMd = readFileSync(resolve(process.cwd(), 'TERMS_OF_SERVICE.md'), 'utf8');
    const privacyHtml = readFileSync(resolve(process.cwd(), 'public/privacy.html'), 'utf8');

    // Confirm no occurrences of legal@terroirtrail.com
    expect(licenseMd).not.toContain('legal@terroirtrail.com');
    expect(readmeMd).not.toContain('legal@terroirtrail.com');
    expect(privacyPolicyMd).not.toContain('legal@terroirtrail.com');
    expect(termsOfServiceMd).not.toContain('legal@terroirtrail.com');
    expect(privacyHtml).not.toContain('legal@terroirtrail.com');

    // Confirm authoritative contact email
    expect(licenseMd).toContain('terroirtrail@gmail.com');
    expect(privacyPolicyMd).toContain('terroirtrail@gmail.com');
    expect(termsOfServiceMd).toContain('terroirtrail@gmail.com');
    expect(privacyHtml).toContain('terroirtrail@gmail.com');

    // Confirm proprietary license in LICENSE.md and README.md
    expect(licenseMd).toContain('Proprietary Software');
    expect(readmeMd).toContain('Proprietary Works');
    expect(readmeMd).not.toContain('TerroirTrail is an open-source');
    expect(readmeMd).not.toContain('MIT. See [`LICENSE`](LICENSE)');

    // Confirm September 24, 2026 legal-hardening dates
    expect(privacyPolicyMd).toContain('September 24, 2026');
    expect(termsOfServiceMd).toContain('September 24, 2026');
    expect(privacyHtml).toContain('September 24, 2026');

    // Confirm operator disclosures are present in the public legal documents
    expect(privacyPolicyMd).toContain('Amazonon 31A, 71303 Heraklion');
    expect(privacyPolicyMd).toContain('170253478');
    expect(termsOfServiceMd).toContain('+30 6955962508');
    expect(privacyHtml).toContain('FANOURAKIS IOANNIS KONSTANTINOS');

    // Confirm Travelpayouts and in-app account deletion
    expect(privacyPolicyMd).toContain('Travelpayouts');
    expect(termsOfServiceMd).toContain('Travelpayouts');
    expect(privacyHtml).toContain('Travelpayouts');
    expect(privacyHtml).not.toContain('There is not yet an in-app account deletion control');
  });
});
