import { describe, expect, it, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { AuthModal } from './Auth/AuthModal';
import { ProducerPortalModal } from './Portal/ProducerPortalModal';
import { ProducerRegistrationForm } from './Portal/ProducerRegistrationForm';

// Mock Firebase service dependencies
vi.mock('../services/firebase', () => ({
  isFirebaseConfigured: true,
  fetchProducerRegistrationFromCloud: vi.fn(async () => null),
  saveProducerRegistrationToCloud: vi.fn(async () => {}),
}));

// Mock Supabase module
vi.mock('../services/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: null,
}));

describe('Production Demo & Fake UI Removal Suite', () => {
  describe('AuthModal — No Demo Login Surfaces', () => {
    it('production auth UI exposes no demo traveler buttons', () => {
      const html = renderToString(
        React.createElement(AuthModal, {
          isOpen: true,
          onClose: () => {},
          initialRole: 'traveler',
          onLogin: () => {},
          onSignup: () => {},
        })
      );

      // Must not contain the collapsible demo helper
      expect(html).not.toContain('Testing or evaluating without an account?');
      expect(html).not.toContain('Explorer · 4 Stamps');
      expect(html).not.toContain('Sommelier · 3 Stamps');
      expect(html).not.toContain('Craft Brewer · 3 Stamps');
      expect(html).not.toContain('Jane Doe');
      expect(html).not.toContain('Alex Miller');
    });

    it('production auth UI exposes no fake verified producer login', () => {
      const html = renderToString(
        React.createElement(AuthModal, {
          isOpen: true,
          onClose: () => {},
          initialRole: 'producer',
          onLogin: () => {},
          onSignup: () => {},
        })
      );

      // Must not contain demo estate host buttons
      expect(html).not.toContain('Fake Winery (Demo Estate)');
      expect(html).not.toContain('Valley Vineyard (Demo)');
      expect(html).not.toContain('Craft Brewing Co. (Demo)');
      expect(html).not.toContain('Tuscan Hillside (Demo)');
      expect(html).not.toContain('Organic Winery · Demo');
    });
  });

  describe('ProducerPortalModal — No Fake Host Previews', () => {
    it('producer portal modal exposes no instant demo preview buttons', () => {
      const html = renderToString(
        React.createElement(ProducerPortalModal, {
          isOpen: true,
          onClose: () => {},
          user: null, // Unauthenticated visitor
          producers: [],
          bookings: [],
          onUpdateBookingStatus: async () => {},
          onSaveProducerOverride: async () => {},
          getProducerOverride: () => undefined,
        })
      );

      expect(html).not.toContain('Instant Host Demo Preview');
      expect(html).not.toContain('Fake Winery (Demo)');
      expect(html).not.toContain('Valley Vineyard (Demo)');
      expect(html).not.toContain('Craft Brewing Co. (Demo)');
      expect(html).not.toContain('Tuscan Hillside (Demo)');
    });

    it('renders null when closed and mounts cleanly when opened without hook lifecycle errors', () => {
      const closedHtml = renderToString(
        React.createElement(ProducerPortalModal, {
          isOpen: false,
          onClose: () => {},
          user: null,
          producers: [],
          bookings: [],
          onUpdateBookingStatus: async () => {},
          onSaveProducerOverride: async () => {},
          getProducerOverride: () => undefined,
        })
      );
      expect(closedHtml).toBe('');

      const openHtml = renderToString(
        React.createElement(ProducerPortalModal, {
          isOpen: true,
          onClose: () => {},
          user: null,
          producers: [],
          bookings: [],
          onUpdateBookingStatus: async () => {},
          onSaveProducerOverride: async () => {},
          getProducerOverride: () => undefined,
        })
      );
      expect(openHtml).toContain('Producer &amp; Host Portal');
      expect(openHtml).toContain('Host access is granted only after verification and Admin approval.');
    });
  });

  describe('ProducerRegistrationForm — No Demo Autofill Presets', () => {
    it('registration form exposes no demo autofill preset buttons', () => {
      const html = renderToString(
        React.createElement(ProducerRegistrationForm, {
          producersList: [],
        })
      );

      expect(html).not.toContain('Demo Autofill');
      expect(html).not.toContain('Demo Producer (GR)');
      expect(html).not.toContain('Demo Brewery (GR)');
      expect(html).not.toContain('Demo Producer (IT)');
      // Genuine utility action "Clear Form" remains intact
      expect(html).toContain('Clear Form');
    });
  });
});
