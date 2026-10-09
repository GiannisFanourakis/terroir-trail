import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fetchPublishedProducerOverrides } from '../../scripts/publishedProducerListings';

test('public listing sync decodes grouped products and follows every page', async () => {
  const urls: string[] = [];
  const request = async (input: any) => {
    urls.push(String(input));
    return new Response(JSON.stringify(urls.length === 1 ? {
      documents: [{ name: 'projects/test/databases/(default)/documents/producer_overrides/estate-a',
        fields: {
          producerId: { stringValue: 'estate-a' },
          additionalCategories: { arrayValue: { values: [{ stringValue: 'olive_mill' }] } },
          productSections: { arrayValue: { values: [{ mapValue: { fields: {
            category: { stringValue: 'olive_mill' },
            specialties: { arrayValue: { values: [{ stringValue: 'Estate oil' }] } },
          } } }] } },
        },
      }], nextPageToken: 'page-2',
    } : { documents: [] }), { status: 200 });
  };
  const rows = await fetchPublishedProducerOverrides('test', request as typeof fetch);
  assert.deepEqual(rows['estate-a'].productSections, [{ category: 'olive_mill', specialties: ['Estate oil'] }]);
  assert.equal(urls.length, 2);
  assert.match(urls[1], /pageToken=page-2/);
  assert.ok(urls.every(url => url.includes('/producer_overrides')));
});

test('public listing sync fails on HTTP errors or repeated pagination instead of publishing a partial snapshot', async () => {
  await assert.rejects(fetchPublishedProducerOverrides('test', (async () => new Response('', { status: 403 })) as typeof fetch), /HTTP 403/);
  await assert.rejects(fetchPublishedProducerOverrides('test',
    (async () => new Response(JSON.stringify({ nextPageToken: 'same' }), { status: 200 })) as typeof fetch), /Repeated page/);
});
