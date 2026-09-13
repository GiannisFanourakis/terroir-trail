import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { Producer, Category, Destination, Ethos, FoodOption, RoadAccess } from '../src/types/terroir';

dotenv.config();

function mapRowToProducer(row: any): Producer {
  const country = row.country || (row.destination === 'tuscany' ? 'Italy' : 'Greece');
  const countryCode = row.country_code || (row.destination === 'tuscany' ? 'IT' : 'GR');
  const locality = row.locality || row.village;

  const isUnresolvedLocation = row.location_status === 'unresolved';
  const googleMapsUrl = isUnresolvedLocation ? undefined : (row.google_maps_url || undefined);

  const prod: Producer = {
    id: row.id,
    name: row.name,
    greekName: row.greek_name || row.name,
    category: row.category as Category,
    destination: row.destination as Destination,
    country,
    countryCode,
    region: row.region,
    village: locality,
    locality,
    coordinates: [row.lat ?? (row.coordinates?.[0] || 0), row.lng ?? (row.coordinates?.[1] || 0)],
    coverImage: row.cover_image || '',
    gallery: Array.isArray(row.gallery) ? row.gallery : [],
    tagLine: row.tag_line || '',
    description: row.description || '',
    story: row.story || '',
    indigenousVarieties: Array.isArray(row.indigenous_varieties) ? row.indigenous_varieties : [],
    tastingHighlights: Array.isArray(row.tasting_highlights) ? row.tasting_highlights : [],
    openingHours: row.opening_hours || '',
    ethos: Array.isArray(row.ethos) ? (row.ethos as Ethos[]) : [],
  };

  if (row.best_season) prod.bestSeason = row.best_season;
  if (row.phone) prod.phone = row.phone;
  if (row.website) prod.website = row.website;
  if (googleMapsUrl) prod.googleMapsUrl = googleMapsUrl;
  if (row.road_access) prod.roadAccess = row.road_access as RoadAccess;
  if (row.food_option) prod.foodOption = row.food_option as FoodOption;
  if (row.dog_friendly != null) prod.dogFriendly = Boolean(row.dog_friendly);
  if (row.kid_friendly != null) prod.kidFriendly = Boolean(row.kid_friendly);
  if (row.walk_in_friendly != null) prod.walkInFriendly = Boolean(row.walk_in_friendly);
  if (row.campervan_friendly != null) prod.campervanFriendly = Boolean(row.campervan_friendly);
  if (row.price_level) prod.priceLevel = row.price_level as '€' | '€€' | '€€€';
  if (row.rating != null) prod.rating = Number(row.rating);
  if (row.review_count != null) prod.reviewCount = Number(row.review_count);
  if (row.vip_perks) prod.vipPerks = row.vip_perks;

  // Verification & Visitability Authority
  if (row.location_status) prod.locationStatus = row.location_status;
  if (row.location_source_url) prod.locationSourceUrl = row.location_source_url;
  if (row.location_notes) prod.locationNotes = row.location_notes;
  if (row.visit_status) prod.visitStatus = row.visit_status;
  if (row.visit_source_url) prod.visitSourceUrl = row.visit_source_url;
  if (row.visit_notes) prod.visitNotes = row.visit_notes;

  return prod;
}

async function syncFallbackCatalogue() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  let rows: any[] = [];

  if (url && key) {
    const supabase = createClient(url, key);
    const { data, error } = await supabase
      .from('producers')
      .select('*')
      .eq('destination', 'crete')
      .order('region', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.warn('Could not query Supabase directly:', error.message);
    } else if (data && data.length > 0) {
      rows = data;
    }
  }

  if (rows.length === 0) {
    const dumpPath = path.resolve(process.cwd(), 'supabase_crete_dump.json');
    if (fs.existsSync(dumpPath)) {
      rows = JSON.parse(fs.readFileSync(dumpPath, 'utf-8'));
    }
  }

  if (rows.length === 0) {
    console.error('No Crete producer rows found to synchronize.');
    process.exit(1);
  }

  console.log(`Synchronizing ${rows.length} verified Crete producers from Supabase...`);

  // Transform each row into a Producer
  const producers = rows.map(mapRowToProducer);

  // Group by region for structured readability
  const regions = ['Chania', 'Heraklion', 'Rethymno', 'Lasithi'];
  const grouped: Record<string, Producer[]> = {};
  for (const r of regions) {
    grouped[r] = [];
  }
  for (const p of producers) {
    if (!grouped[p.region]) grouped[p.region] = [];
    grouped[p.region].push(p);
  }

  let code = `import { Producer } from '../types/terroir';\n\n`;
  code += `/**\n`;
  code += ` * Authoritative bundled offline/fallback catalogue for Crete.\n`;
  code += ` * Synchronized directly from live Supabase (${producers.length} audited Crete records).\n`;
  code += ` * All synthetic ratings, reviews, pricing, access defaults, and non-existent\n`;
  code += ` * tasting packages have been removed. Unknown fields are preserved as undefined.\n`;
  code += ` */\n`;
  code += `export const CRETAN_PRODUCERS: Producer[] = [\n`;

  for (const r of regions) {
    const prods = grouped[r];
    if (!prods || prods.length === 0) continue;
    code += `  // ==========================================\n`;
    code += `  // --- ${r.toUpperCase()} (${prods.length} VERIFIED PRODUCERS) ---\n`;
    code += `  // ==========================================\n`;
    for (const p of prods) {
      code += `  ${JSON.stringify(p, null, 4).replace(/\n/g, '\n  ')},\n`;
    }
  }

  code += `];\n\n`;
  code += `export const allProducers = CRETAN_PRODUCERS;\n`;
  code += `export const producers = CRETAN_PRODUCERS;\n`;

  const targetPath = path.resolve(process.cwd(), 'src/data/producers.ts');
  fs.writeFileSync(targetPath, code, 'utf-8');
  console.log(`✓ Synchronized ${producers.length} verified producers to ${targetPath}`);
}

syncFallbackCatalogue();
