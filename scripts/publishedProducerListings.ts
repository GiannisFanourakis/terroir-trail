import type { ProducerOverride } from '../src/types/booking';
import { loadProductionCatalogueEnv } from './liveCatalogueSource';

type FirestoreValue = {
  stringValue?: string; timestampValue?: string; booleanValue?: boolean;
  integerValue?: string; doubleValue?: number; nullValue?: unknown;
  arrayValue?: { values?: FirestoreValue[] };
  mapValue?: { fields?: Record<string, FirestoreValue> };
};

export const decodePublicFirestoreValue = (value: FirestoreValue): unknown => {
  if ('stringValue' in value) return value.stringValue;
  if ('timestampValue' in value) return value.timestampValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('arrayValue' in value) return (value.arrayValue?.values || []).map(decodePublicFirestoreValue);
  if ('mapValue' in value) return Object.fromEntries(Object.entries(value.mapValue?.fields || {}).map(([key, child]) => [key, decodePublicFirestoreValue(child)]));
  return null;
};

/** Fetch only publicly readable, approved listing edits; no account or pending-request collections. */
export async function fetchPublishedProducerOverrides(
  projectId?: string, request: typeof fetch = fetch
): Promise<Record<string, ProducerOverride>> {
  loadProductionCatalogueEnv();
  projectId ||= process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
  if (!projectId) return {};
  const overrides: Record<string, ProducerOverride> = {};
  let pageToken = '';
  const seen = new Set<string>();
  for (let page = 0; page < 100; page += 1) {
    const url = new URL(`https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/producer_overrides`);
    url.searchParams.set('pageSize', '300');
    if (pageToken) url.searchParams.set('pageToken', pageToken);
    const response = await request(url, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`Approved public listing sync failed (HTTP ${response.status}).`);
    const data = await response.json() as {
      documents?: { name: string; fields?: Record<string, FirestoreValue> }[];
      nextPageToken?: string;
    };
    for (const doc of data.documents || []) {
      const id = doc.name.split('/').at(-1)!;
      const value = Object.fromEntries(Object.entries(doc.fields || {}).map(([key, item]) => [key, decodePublicFirestoreValue(item)]));
      if (value.producerId === id) overrides[id] = value as unknown as ProducerOverride;
    }
    pageToken = data.nextPageToken || '';
    if (!pageToken) return overrides;
    if (seen.has(pageToken)) throw new Error('Repeated page in approved public listing sync.');
    seen.add(pageToken);
  }
  throw new Error('Approved public listing sync exceeded its page limit.');
}
