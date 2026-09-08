import fs from 'fs';
import path from 'path';
import { CRETAN_PRODUCERS } from '../src/data/producers';
import { ALL_EXPERIENCES } from '../src/data/experiences';

function sqlStr(val: string | undefined | null): string {
  if (val === undefined || val === null) return 'NULL';
  return `'${val.replace(/'/g, "''")}'`;
}

function sqlTextArray(arr: string[] | undefined | null): string {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return 'ARRAY[]::TEXT[]';
  const items = arr.map((item) => `'${item.replace(/'/g, "''")}'`).join(', ');
  return `ARRAY[${items}]::TEXT[]`;
}

function sqlJson(obj: any): string {
  if (!obj) return 'NULL';
  return `'${JSON.stringify(obj).replace(/'/g, "''")}'::JSONB`;
}

const lines: string[] = [];
lines.push('-- =====================================================================');
lines.push('-- TERROIR TRAIL: Automated Supabase Seed Data');
lines.push(`-- Populates ${CRETAN_PRODUCERS.length} Authentic Producers and ${ALL_EXPERIENCES.length} Enriched Experiences`);
lines.push('-- =====================================================================');
lines.push('');

// 1. Seed Producers
lines.push('-- ---------------------------------------------------------------------');
lines.push('-- 1. PRODUCERS SEED');
lines.push('-- ---------------------------------------------------------------------');
lines.push(`INSERT INTO public.producers (
  id, name, greek_name, category, destination, region, village, lat, lng,
  cover_image, gallery, tag_line, description, story, indigenous_varieties,
  tasting_highlights, opening_hours, best_season, phone, website,
  google_maps_url, road_access, ethos, food_option, dog_friendly,
  kid_friendly, walk_in_friendly, campervan_friendly, price_level,
  rating, review_count, vip_perks
) VALUES`);

const producerValues = CRETAN_PRODUCERS.map((p) => {
  const [lat, lng] = p.coordinates;
  return `(
  ${sqlStr(p.id)},
  ${sqlStr(p.name)},
  ${sqlStr(p.greekName)},
  ${sqlStr(p.category)},
  ${sqlStr(p.destination)},
  ${sqlStr(p.region)},
  ${sqlStr(p.village)},
  ${lat},
  ${lng},
  ${sqlStr(p.coverImage)},
  ${sqlTextArray(p.gallery)},
  ${sqlStr(p.tagLine)},
  ${sqlStr(p.description)},
  ${sqlStr(p.story)},
  ${sqlTextArray(p.indigenousVarieties)},
  ${sqlTextArray(p.tastingHighlights)},
  ${sqlStr(p.openingHours)},
  ${sqlStr(p.bestSeason)},
  ${sqlStr(p.phone)},
  ${sqlStr(p.website)},
  ${sqlStr(p.googleMapsUrl)},
  ${sqlStr(p.roadAccess)},
  ${sqlTextArray(p.ethos)},
  ${sqlStr(p.foodOption)},
  ${p.dogFriendly},
  ${p.kidFriendly},
  ${p.walkInFriendly},
  ${p.campervanFriendly},
  ${sqlStr(p.priceLevel)},
  ${p.rating},
  ${p.reviewCount},
  ${sqlJson(p.vipPerks)}
)`;
});

lines.push(producerValues.join(',\n'));
lines.push('ON CONFLICT (id) DO UPDATE SET');
lines.push('  name = EXCLUDED.name,');
lines.push('  greek_name = EXCLUDED.greek_name,');
lines.push('  category = EXCLUDED.category,');
lines.push('  destination = EXCLUDED.destination,');
lines.push('  region = EXCLUDED.region,');
lines.push('  village = EXCLUDED.village,');
lines.push('  lat = EXCLUDED.lat,');
lines.push('  lng = EXCLUDED.lng,');
lines.push('  cover_image = EXCLUDED.cover_image,');
lines.push('  gallery = EXCLUDED.gallery,');
lines.push('  tag_line = EXCLUDED.tag_line,');
lines.push('  description = EXCLUDED.description,');
lines.push('  story = EXCLUDED.story,');
lines.push('  indigenous_varieties = EXCLUDED.indigenous_varieties,');
lines.push('  tasting_highlights = EXCLUDED.tasting_highlights,');
lines.push('  opening_hours = EXCLUDED.opening_hours,');
lines.push('  phone = EXCLUDED.phone,');
lines.push('  website = EXCLUDED.website,');
lines.push('  updated_at = NOW();');
lines.push('');

// 2. Seed Experiences
lines.push('-- ---------------------------------------------------------------------');
lines.push('-- 2. EXPERIENCES SEED');
lines.push('-- ---------------------------------------------------------------------');
lines.push(`INSERT INTO public.experiences (
  id, producer_id, title, duration_minutes, price_per_person,
  description, includes, badge, producer_name, producer_greek_name,
  category, destination, location
) VALUES`);

const experienceValues = ALL_EXPERIENCES.map((e) => {
  return `(
  ${sqlStr(e.id)},
  ${sqlStr(e.producerId)},
  ${sqlStr(e.title)},
  ${e.durationMinutes},
  ${e.pricePerPerson},
  ${sqlStr(e.description)},
  ${sqlTextArray(e.includes)},
  ${sqlStr(e.badge)},
  ${sqlStr(e.producerName)},
  ${sqlStr(e.producerGreekName)},
  ${sqlStr(e.category)},
  ${sqlStr(e.destination)},
  ${sqlStr(e.location)}
)`;
});

lines.push(experienceValues.join(',\n'));
lines.push('ON CONFLICT (id) DO UPDATE SET');
lines.push('  title = EXCLUDED.title,');
lines.push('  duration_minutes = EXCLUDED.duration_minutes,');
lines.push('  price_per_person = EXCLUDED.price_per_person,');
lines.push('  description = EXCLUDED.description,');
lines.push('  includes = EXCLUDED.includes,');
lines.push('  badge = EXCLUDED.badge;');
lines.push('');

const targetFile = path.resolve(process.cwd(), 'supabase/seed.sql');
fs.writeFileSync(targetFile, lines.join('\n'), 'utf8');
console.log(`Successfully generated ${targetFile} with ${CRETAN_PRODUCERS.length} producers and ${ALL_EXPERIENCES.length} experiences.`);
