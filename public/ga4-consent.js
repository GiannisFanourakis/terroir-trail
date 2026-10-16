/* global window, document */
/* TerroirTrail optional Google Analytics: no third-party request before consent. */
(function () {
  'use strict';

  var KEY = 'terroir_ga4_consent_v1';
  var MEASUREMENT_ID = 'G-LVZHD0ZFHG';
  var consent = null;
  var gaLoaded = false;
  var lastTrackedPath = null;

  try {
    var stored = window.localStorage.getItem(KEY);
    if (stored === 'accepted' || stored === 'rejected') consent = stored;
  } catch (_) {
    // Storage may be disabled; keep the visitor's selection in memory only.
  }

  function persist(value) {
    consent = value;
    try {
      window.localStorage.setItem(KEY, value);
    } catch (_) {
      /* optional */
    }
  }

  function cleanPath() {
    // Intentionally omit query strings and fragments: they can contain private data.
    return window.location.pathname || '/';
  }

  function recordPageView() {
    if (consent !== 'accepted' || !gaLoaded) return;
    var path = cleanPath();
    if (lastTrackedPath === path) return;
    lastTrackedPath = path;
    window.gtag('event', 'page_view', {
      send_to: MEASUREMENT_ID,
      page_title: document.title,
      page_path: path,
      page_location: window.location.origin + path,
    });
  }

  function schedulePageView() {
    window.setTimeout(recordPageView, 0);
  }

  function enableAnalytics() {
    if (consent !== 'accepted' || gaLoaded) return;
    gaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('consent', 'default', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
    window.gtag('config', MEASUREMENT_ID, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });

    var script = document.createElement('script');
    script.async = true;
    script.src =
      'https://www.googletagmanager.com/gtag/js?id=' + MEASUREMENT_ID;
    script.onerror = function () {
      // Consent stays stored, but do not claim successful delivery.
      gaLoaded = false;
    };
    document.head.appendChild(script);
    recordPageView();
  }

  function deleteAnalyticsCookies() {
    var cookies = document.cookie ? document.cookie.split(';') : [];
    var hostname = window.location.hostname;
    var suffixes = [''];
    var parts = hostname.split('.');
    for (var i = 1; i < parts.length - 1; i++) {
      suffixes.push(parts.slice(i).join('.'));
    }
    cookies.forEach(function (part) {
      var name = part.trim().split('=')[0];
      if (!/^_ga(?:_|$)|^_gid$|^_gat(?:_|$)/.test(name)) return;
      suffixes.forEach(function (domain) {
        var domainPart = domain ? '; domain=' + domain : '';
        document.cookie =
          name + '=; Max-Age=0; path=/' + domainPart + '; SameSite=Lax';
      });
    });
  }

  function choose(value) {
    var wasLoaded = gaLoaded;
    persist(value);
    if (value === 'accepted') {
      enableAnalytics();
      updateUi();
    } else {
      if (wasLoaded && typeof window.gtag === 'function') {
        window.gtag('consent', 'update', { analytics_storage: 'denied' });
      }
      deleteAnalyticsCookies();
      if (wasLoaded) {
        // Remove a previously loaded Google library by starting a clean document.
        window.location.reload();
        return;
      }
      updateUi();
    }
  }

  function make(tag, text, className) {
    var element = document.createElement(tag);
    if (text) element.textContent = text;
    if (className) element.className = className;
    return element;
  }

  var banner;
  var preferencesButton;

  function updateUi() {
    if (banner) banner.hidden = consent !== null;
    if (preferencesButton) {
      preferencesButton.textContent =
        consent === 'accepted' ? 'Analytics: on · Change' : 'Privacy choices';
    }
  }

  function buildUi() {
    if (!document.body || document.getElementById('tt-ga4-consent-ui')) return;
    var style = make('style');
    style.textContent = [
      '#tt-ga4-consent-ui{font-family:system-ui,sans-serif;color:#fafaf9}',
      '#tt-ga4-consent-ui button{font:inherit;cursor:pointer}',
      '#tt-ga4-consent-ui .tt-ga4-settings{position:fixed;bottom:12px;left:12px;z-index:9995;background:#292524;color:#fafaf9;border:1px solid #a8a29e;border-radius:18px;padding:7px 12px;font-size:12px;box-shadow:0 2px 10px #0005}',
      '#tt-ga4-consent-ui .tt-ga4-panel{position:fixed;bottom:55px;left:12px;right:12px;max-width:520px;margin:auto;z-index:9996;background:#1c1917;color:#fafaf9;border:1px solid #a8a29e;border-radius:14px;padding:18px;box-shadow:0 6px 30px #0008;font-size:14px;line-height:1.5}',
      '#tt-ga4-consent-ui .tt-ga4-panel[hidden]{display:none}',
      '#tt-ga4-consent-ui .tt-ga4-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}',
      '#tt-ga4-consent-ui .tt-ga4-actions button{padding:9px 13px;border-radius:8px;flex:1;min-width:135px;border:1px solid #d6d3d1;font-weight:600}',
      '#tt-ga4-consent-ui .tt-ga4-accept{background:#fafaf9;color:#1c1917}',
      '#tt-ga4-consent-ui .tt-ga4-reject{background:transparent;color:#fafaf9}',
      '#tt-ga4-consent-ui a{color:#bae6fd;text-decoration:underline}',
      '@media(max-width:480px){#tt-ga4-consent-ui .tt-ga4-panel{bottom:52px;padding:14px}}',
    ].join('');
    document.head.appendChild(style);

    var root = make('div');
    root.id = 'tt-ga4-consent-ui';
    preferencesButton = make('button', 'Privacy choices', 'tt-ga4-settings');
    preferencesButton.type = 'button';
    preferencesButton.addEventListener('click', function () {
      if (banner) banner.hidden = false;
      preferencesButton.setAttribute('aria-expanded', 'true');
    });
    preferencesButton.setAttribute('aria-controls', 'tt-ga4-banner');

    banner = make('aside', '', 'tt-ga4-panel');
    banner.id = 'tt-ga4-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Optional analytics choices');
    banner.appendChild(make('strong', 'Help us improve TerroirTrail'));
    banner.appendChild(
      make(
        'p',
        'Optional Google Analytics helps us understand visits. Google is only contacted for analytics after you accept. You can reject or change your choice at any time.'
      )
    );
    var policy = make('a', 'Read our privacy policy');
    policy.href = '/privacy.html';
    banner.appendChild(policy);
    var actions = make('div', '', 'tt-ga4-actions');
    var reject = make('button', 'Reject analytics', 'tt-ga4-reject');
    reject.type = 'button';
    reject.addEventListener('click', function () {
      choose('rejected');
    });
    var accept = make('button', 'Accept analytics', 'tt-ga4-accept');
    accept.type = 'button';
    accept.addEventListener('click', function () {
      choose('accepted');
    });
    actions.appendChild(reject);
    actions.appendChild(accept);
    banner.appendChild(actions);
    root.appendChild(banner);
    root.appendChild(preferencesButton);
    document.body.appendChild(root);
    updateUi();
  }

  function observeNavigation() {
    ['pushState', 'replaceState'].forEach(function (method) {
      var original = window.history[method];
      if (typeof original !== 'function') return;
      window.history[method] = function () {
        var result = original.apply(this, arguments);
        schedulePageView();
        return result;
      };
    });
    window.addEventListener('popstate', schedulePageView);
    window.addEventListener('hashchange', schedulePageView);
  }

  function initialize() {
    buildUi();
    observeNavigation();
    if (consent === 'accepted') enableAnalytics();
  }

  // Deliberately defer third-party loading, regardless of DOM readiness.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
