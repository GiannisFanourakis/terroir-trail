import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AlcoholContentNotice } from './AlcoholContentNotice';

describe('AlcoholContentNotice', () => {
  it('uses a destination-aware legal-age notice without collecting birth data', () => {
    const html = renderToString(
      React.createElement(AlcoholContentNotice, {
        producerName: 'Example Winery',
        onContinue: () => {},
        onBack: () => {},
      })
    );

    expect(html).toContain('Alcohol-related content');
    expect(html).toContain('Example Winery');
    expect(html).toContain('legal drinking age in the destination');
    expect(html).toContain('No date of birth is requested or stored');
    expect(html).toContain('Continue');
    expect(html).toContain('Back to discovery');
    expect(html).not.toContain('I am 18');
    expect(html).not.toContain('date of birth</label>');
  });
});
