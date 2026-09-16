import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { AboutFaqModal } from './AboutFaqModal';

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
    expect(html).toContain('https://www.instagram.com/terroirtrail/');
    expect(html).toContain('@TERROIRTRAIL');
    expect(html).toContain('/terroirtrail-instagram-qr.svg');
  });
});
