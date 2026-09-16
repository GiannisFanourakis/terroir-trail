import React from 'react';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { AboutFaqModal } from './AboutFaqModal';

const INSTAGRAM_URL = 'https://www.instagram.com/terroirtrail/';
const INSTAGRAM_QR_SHA256 = '81d5995c27b342aaf430d3b995a570b6b754bff59385a8bcbc80d475effe7af5';

describe('AboutFaqModal contact channels', () => {
  it('publishes the real TerroirTrail Gmail and Instagram contact paths', () => {
    const html = renderToString(
      React.createElement(AboutFaqModal, {
        isOpen: true,
        onClose: () => {},
        initialTab: 'faq',
      })
    );

    expect(html).toContain('Contact TerroirTrail');
    expect(html).toContain('mailto:gian.fanourakis@gmail.com');
    expect(html).toContain('gian.fanourakis@gmail.com');
    expect(html).toContain(INSTAGRAM_URL);
    expect(html).toContain('@TERROIRTRAIL');
    expect(html).toContain('/terroirtrail-instagram-qr.svg');
  });

  it('ships the verified Instagram QR asset used by the contact block', () => {
    const qrAsset = readFileSync(
      resolve(process.cwd(), 'public/terroirtrail-instagram-qr.svg')
    );

    // This digest pins the QR generated for INSTAGRAM_URL so a missing, malformed,
    // or accidentally replaced QR fails the regression test instead of silently shipping.
    expect(createHash('sha256').update(qrAsset).digest('hex')).toBe(INSTAGRAM_QR_SHA256);
  });
});
