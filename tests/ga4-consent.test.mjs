import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const source = fs.readFileSync(
  path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    '..',
    'public',
    'ga4-consent.js'
  ),
  'utf8'
);

function browser(initialChoice) {
  const elements = [];
  const head = [];
  const body = [];
  const listeners = {};
  const values = new Map();
  if (initialChoice) values.set('terroir_ga4_consent_v1', initialChoice);
  let reloads = 0;
  const location = {
    origin: 'https://terroir-trail.web.app',
    hostname: 'terroir-trail.web.app',
    pathname: '/',
    search: '?private_token=never-send',
    reload() {
      reloads += 1;
    },
  };
  const document = {
    title: 'TerroirTrail',
    cookie: '_ga=prior; _gid=prior',
    readyState: 'complete',
    head: {
      appendChild(element) {
        head.push(element);
      },
    },
    body: {
      appendChild(element) {
        body.push(element);
      },
    },
    createElement(tag) {
      const item = {
        tagName: tag.toUpperCase(),
        children: [],
        attributes: {},
        textContent: '',
        hidden: false,
        appendChild(child) {
          this.children.push(child);
        },
        setAttribute(k, v) {
          this.attributes[k] = v;
        },
        addEventListener(type, fn) {
          this['on' + type] = fn;
        },
      };
      elements.push(item);
      return item;
    },
    getElementById(id) {
      return elements.find((e) => e.id === id) || null;
    },
    addEventListener(type, fn) {
      listeners[type] = fn;
    },
  };
  const window = {
    location,
    history: {
      pushState(_data, _title, url) {
        location.pathname = String(url).split('?')[0];
      },
      replaceState(_data, _title, url) {
        location.pathname = String(url).split('?')[0];
      },
    },
    localStorage: {
      getItem(k) {
        return values.get(k) ?? null;
      },
      setItem(k, v) {
        values.set(k, v);
      },
    },
    addEventListener(type, fn) {
      listeners[type] = fn;
    },
    setTimeout(fn) {
      fn();
    },
  };
  vm.runInNewContext(
    source,
    { window, document, Date, console: { log() {} } },
    { filename: 'ga4-consent.js' }
  );
  function click(text) {
    const el = elements.find(
      (e) => e.tagName === 'BUTTON' && e.textContent === text
    );
    assert.ok(el, 'Expected button: ' + text);
    el.onclick();
  }
  return {
    window,
    document,
    values,
    head,
    body,
    location,
    click,
    externalScripts() {
      return head.filter((e) => e.tagName === 'SCRIPT');
    },
    events() {
      return (window.dataLayer || []).filter((x) => x[0] === 'event');
    },
    reloads() {
      return reloads;
    },
  };
}

test('reject does not load Google tag, set analytics cookies or send page views', () => {
  const b = browser();
  assert.equal(b.externalScripts().length, 0);
  assert.equal(b.events().length, 0);
  b.click('Reject analytics');
  assert.equal(b.values.get('terroir_ga4_consent_v1'), 'rejected');
  assert.equal(b.externalScripts().length, 0);
  assert.equal(b.events().length, 0);
});

test('accept explicitly loads Google tag and sends one sanitized page view', () => {
  const b = browser();
  b.click('Accept analytics');
  assert.equal(b.externalScripts().length, 1);
  assert.match(
    b.externalScripts()[0].src,
    /^https:\/\/www.googletagmanager.com\/gtag\/js\?id=G-/
  );
  assert.equal(b.events().length, 1);
  const pv = b.events()[0];
  assert.equal(pv[1], 'page_view');
  assert.equal(pv[2].page_path, '/');
  assert.equal(pv[2].page_location, 'https://terroir-trail.web.app/');
  assert.equal(pv[2].page_location.includes('private_token'), false);
  const config = b.window.dataLayer.find((e) => e[0] === 'config');
  assert.equal(config[2].send_page_view, false);
});

test('SPA navigation records one page view per new path only', () => {
  const b = browser('accepted');
  assert.equal(b.events().length, 1);
  b.window.history.pushState(null, '', '/producers/example/?secret=yes');
  assert.equal(b.events().length, 2);
  assert.equal(b.events()[1][2].page_path, '/producers/example/');
  assert.equal(b.events()[1][2].page_location.includes('secret'), false);
  b.window.history.replaceState(null, '', '/producers/example/?secret=no');
  assert.equal(b.events().length, 2);
});

test('withdrawal denies future analytics and reloads to clear loaded script', () => {
  const b = browser('accepted');
  b.click('Analytics: on · Change');
  b.click('Reject analytics');
  assert.equal(b.values.get('terroir_ga4_consent_v1'), 'rejected');
  assert.equal(b.reloads(), 1);
  const consentUpdate = b.window.dataLayer.find(
    (e) => e[0] === 'consent' && e[1] === 'update'
  );
  assert.ok(consentUpdate);
  assert.equal(consentUpdate[2].analytics_storage, 'denied');
});

test('saved rejected choice never loads analytics on a later visit', () => {
  const b = browser('rejected');
  assert.equal(b.externalScripts().length, 0);
  assert.equal(b.events().length, 0);
});
