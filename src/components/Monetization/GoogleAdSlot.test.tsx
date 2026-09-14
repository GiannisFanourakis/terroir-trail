import { afterEach, describe, expect, it, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { GoogleAdSlot } from './GoogleAdSlot';
import { runtimeConfig } from '../../config/runtimeConfig';

describe('GoogleAdSlot - Monetization and Ad Gating Integrity', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('proves central runtime gate is false by default in launch configuration', () => {
    expect(runtimeConfig.advertising.enabled).toBe(false);
  });

  it('a. returns null when runtime advertising gate is false, even if valid client and slot are provided', () => {
    expect(runtimeConfig.advertising.enabled).toBe(false);

    const html = renderToString(
      React.createElement(GoogleAdSlot, {
        client: 'ca-pub-1234567890123456',
        slot: '9876543210',
      })
    );

    expect(html).toBe('');
  });

  it('mounts in DOM container when disabled without injecting scripts, calling adsbygoogle, or rendering ad markup', () => {
    expect(runtimeConfig.advertising.enabled).toBe(false);

    const prevWindow = (globalThis as any).window;
    const prevDocument = (globalThis as any).document;
    const prevActEnv = (globalThis as any).IS_REACT_ACT_ENVIRONMENT;

    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

    const appendedScripts: any[] = [];
    const mockHead = {
      appendChild: vi.fn((node: any) => {
        appendedScripts.push(node);
        return node;
      }),
      removeChild: vi.fn((node: any) => node),
      childNodes: [],
    };

    class MockElement {
      nodeType = 1;
      tagName: string;
      nodeName: string;
      namespaceURI = 'http://www.w3.org/1999/xhtml';
      style: Record<string, string> = {};
      childNodes: any[] = [];
      children: any[] = [];
      ownerDocument: any;
      innerHTML = '';

      constructor(tag: string, doc: any) {
        this.tagName = tag.toUpperCase();
        this.nodeName = tag.toUpperCase();
        this.ownerDocument = doc;
      }

      setAttribute(k: string, v: string) {
        (this as any)[k] = v;
      }
      getAttribute(k: string) {
        return (this as any)[k] ?? null;
      }
      appendChild(c: any) {
        this.childNodes.push(c);
        this.children.push(c);
        return c;
      }
      removeChild(c: any) {
        const idx = this.childNodes.indexOf(c);
        if (idx > -1) this.childNodes.splice(idx, 1);
        const cidx = this.children.indexOf(c);
        if (cidx > -1) this.children.splice(cidx, 1);
        return c;
      }
      addEventListener() {}
      removeEventListener() {}
    }

    const mockDoc: any = {
      nodeType: 9,
      head: mockHead,
      body: { appendChild: vi.fn((c: any) => c) },
      defaultView: null,
      createElement: vi.fn((tag: string) => new MockElement(tag, mockDoc)),
      createComment: vi.fn(() => ({ nodeType: 8 })),
      createTextNode: vi.fn((text: string) => ({ nodeType: 3, textContent: text })),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      querySelector: vi.fn(() => null),
      querySelectorAll: vi.fn(() => []),
      activeElement: null,
    };

    const container = new MockElement('div', mockDoc);

    const adsbygooglePushSpy = vi.fn();
    const mockWindow: any = {
      HTMLIFrameElement: class HTMLIFrameElement {},
      document: mockDoc,
      adsbygoogle: {
        push: adsbygooglePushSpy,
      },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    mockDoc.defaultView = mockWindow;

    (globalThis as any).window = mockWindow;
    (globalThis as any).document = mockDoc;
    (globalThis as any).HTMLIFrameElement = mockWindow.HTMLIFrameElement;

    let root: any;
    try {
      root = createRoot(container as unknown as HTMLElement);

      // Mount the component in the DOM container with valid client + slot props
      act(() => {
        root.render(
          React.createElement(GoogleAdSlot, {
            client: 'ca-pub-1234567890123456',
            slot: '9876543210',
          })
        );
      });

      // Assertions proving fail-closed DOM execution
      expect(mockHead.appendChild).not.toHaveBeenCalled();
      expect(appendedScripts.length).toBe(0);
      expect(mockDoc.querySelector('script[src*="pagead2.googlesyndication.com"]')).toBeNull();
      expect(adsbygooglePushSpy).not.toHaveBeenCalled();
      expect(container.childNodes.length).toBe(0);
      expect(container.innerHTML).toBe('');
    } finally {
      if (root) {
        act(() => {
          root.unmount();
        });
      }
      (globalThis as any).window = prevWindow;
      (globalThis as any).document = prevDocument;
      (globalThis as any).IS_REACT_ACT_ENVIRONMENT = prevActEnv;
      delete (globalThis as any).HTMLIFrameElement;
    }
  });

  describe('when central runtime advertising gate is explicitly enabled via runtimeConfig', () => {
    it('b. returns null when client ID is missing', () => {
      vi.spyOn(runtimeConfig, 'advertising', 'get').mockReturnValue({
        enabled: true,
        client: '',
        slot: '9876543210',
      });

      const html = renderToString(
        React.createElement(GoogleAdSlot, {
          client: '',
          slot: '9876543210',
        })
      );

      expect(html).toBe('');
    });

    it('c. returns null when slot ID is missing', () => {
      vi.spyOn(runtimeConfig, 'advertising', 'get').mockReturnValue({
        enabled: true,
        client: 'ca-pub-1234567890123456',
        slot: '',
      });

      const html = renderToString(
        React.createElement(GoogleAdSlot, {
          client: 'ca-pub-1234567890123456',
          slot: '',
        })
      );

      expect(html).toBe('');
    });

    it('d. returns null when IDs are present, but user has an active Explorer Pass', () => {
      vi.spyOn(runtimeConfig, 'advertising', 'get').mockReturnValue({
        enabled: true,
        client: 'ca-pub-1234567890123456',
        slot: '9876543210',
      });

      const html = renderToString(
        React.createElement(GoogleAdSlot, {
          client: 'ca-pub-1234567890123456',
          slot: '9876543210',
          hasExplorerPass: true,
        })
      );

      expect(html).toBe('');
    });

    it('e. renders ad container and ins tag when runtime gate is true with valid client, slot, and no pass', () => {
      vi.spyOn(runtimeConfig, 'advertising', 'get').mockReturnValue({
        enabled: true,
        client: 'ca-pub-1234567890123456',
        slot: '9876543210',
      });

      const html = renderToString(
        React.createElement(GoogleAdSlot, {
          client: 'ca-pub-1234567890123456',
          slot: '9876543210',
          format: 'auto',
          hasExplorerPass: false,
        })
      );

      expect(html).toContain('Advertisement');
      expect(html).toContain('adsbygoogle');
      expect(html).toContain('data-ad-client="ca-pub-1234567890123456"');
      expect(html).toContain('data-ad-slot="9876543210"');
      expect(html).toContain('data-ad-format="auto"');
    });
  });
});
