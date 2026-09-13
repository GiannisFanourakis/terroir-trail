import fs from 'fs';
import path from 'path';
import { CRETAN_PRODUCERS } from '../src/data/producers';

function sqlStr(val: string | undefined | null): string {
  if (val === undefined || val === null) return 'NULL';
  return `'${val.replace(/'/g, "''")}'`;
}

function sqlBool(val: boolean | undefined | null): string {
  if (val === undefined || val === null) return 'NULL';
  return val ? 'TRUE' : 'FALSE';
}

function sqlNum(val: number | undefined | null): string {
  if (val === undefined || val === null) return 'NULL';
  return String(val);
}

function sqlTextArray(arr: string[] | undefined | null): string {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return 'ARRAY[]::TEXT[]';
  const items = arr.map((item) => `'${item.replace(/'/g, "''")}'`).join(', ');
  return `ARRAY[${items}]::TEXT[]`;
}

function sqlJson(obj: unknown): string {
  if (obj === undefined || obj === null) return 'NULL';
  return `'${JSON.stringify(obj).replace(/'/g, "''")}'::JSONB`;
}

const lines: string[] = [];
lines.push('-- =====================================================================');
lines.push('-- TERROIR TRAIL: Automated Supabase Seed Data');
lines.push(`-- Populates ${CRETAN_PRODUCERS.length} audited Crete producers/projects.`);
lines.push('-- Unknown values remain NULL.');
lines.push('-- Experiences are intentionally NOT seeded before explicit producer approval.');
lines.push('-- =====================================================================');
lines.push('');

lines.push('-- ---------------------------------------------------------------------');
lines.push('-- PRODUCERS SEED');
lines.push('-- ---------------------------------------------------------------------');
lines.push(`INSERT INTO public.producers (
  id, name, greek_name, category, destination, country, country_code, region, village, lat, lng,
  cover_image, gallery, tag_line, description, story, indigenous_varieties,
  tasting_highlights, opening_hours, best_season, phone, website,
  google_maps_url,
  road_access, road_access_status, road_access_source_url, road_access_notes,
  location_status, location_source_url, location_notes,
  visit_status, visit_source_url, visit_notes,
  ethos, food_option, dog_friendly, kid_friendly, walk_in_friendly,
  campervan_friendly, price_level, rating, review_count, vip_perks
) VALUES`);

const producerValues = CRETAN_PRODUCERS.map((p) => {
  const [lat, lng] = p.coordinates;
  return `(
  ${sqlStr(p.id)},
  ${sqlStr(p.name)},
  ${sqlStr(p.greekName)},
  ${sqlStr(p.category)},
  ${sqlStr(p.destination)},
  ${sqlStr(p.country || (p.destination === 'tuscany' ? 'Italy' : 'Greece'))},
  ${sqlStr(p.countryCode || (p.destination === 'tuscany' ? 'IT' : 'GR'))},
  ${sqlStr(p.region)},
  ${sqlStr(p.village)},
  ${sqlNum(lat)},
  ${sqlNum(lng)},
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
  ${sqlStr(p.roadAccessStatus)},
  ${sqlStr(p.roadAccessSourceUrl)},
  ${sqlStr(p.roadAccessNotes)},
  ${sqlStr(p.locationStatus)},
  ${sqlStr(p.locationSourceUrl)},
  ${sqlStr(p.locationNotes)},
  ${sqlStr(p.visitStatus)},
  ${sqlStr(p.visitSourceUrl)},
  ${sqlStr(p.visitNotes)},
  ${sqlTextArray(p.ethos)},
  ${sqlStr(p.foodOption)},
  ${sqlBool(p.dogFriendly)},
  ${sqlBool(p.kidFriendly)},
  ${sqlBool(p.walkInFriendly)},
  ${sqlBool(p.campervanFriendly)},
  ${sqlStr(p.priceLevel)},
  ${sqlNum(p.rating)},
  ${sqlNum(p.reviewCount)},
  ${sqlJson(p.vipPerks)}
)`;
});

lines.push(producerValues.join(',\n'));
lines.push('ON CONFLICT (id) DO UPDATE SET');
lines.push('  name = EXCLUDED.name,');
lines.push('  greek_name = EXCLUDED.greek_name,');
lines.push('  category = EXCLUDED.category,');
lines.push('  destination = EXCLUDED.destination,');
lines.push('  country = EXCLUDED.country,');
lines.push('  country_code = EXCLUDED.country_code,');
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
lines.push('  best_season = EXCLUDED.best_season,');
lines.push('  phone = EXCLUDED.phone,');
lines.push('  website = EXCLUDED.website,');
lines.push('  google_maps_url = EXCLUDED.google_maps_url,');
lines.push('  road_access = EXCLUDED.road_access,');
lines.push('  road_access_status = EXCLUDED.road_access_status,');
lines.push('  road_access_source_url = EXCLUDED.road_access_source_url,');
lines.push('  road_access_notes = EXCLUDED.road_access_notes,');
lines.push('  location_status = EXCLUDED.location_status,');
lines.push('  location_source_url = EXCLUDED.location_source_url,');
lines.push('  location_notes = EXCLUDED.location_notes,');
lines.push('  visit_status = EXCLUDED.visit_status,');
lines.push('  visit_source_url = EXCLUDED.visit_source_url,');
lines.push('  visit_notes = EXCLUDED.visit_notes,');
lines.push('  ethos = EXCLUDED.ethos,');
lines.push('  food_option = EXCLUDED.food_option,');
lines.push('  dog_friendly = EXCLUDED.dog_friendly,');
lines.push('  kid_friendly = EXCLUDED.kid_friendly,');
lines.push('  walk_in_friendly = EXCLUDED.walk_in_friendly,');
lines.push('  campervan_friendly = EXCLUDED.campervan_friendly,');
lines.push('  price_level = EXCLUDED.price_level,');
lines.push('  rating = EXCLUDED.rating,');
lines.push('  review_count = EXCLUDED.review_count,');
lines.push('  vip_perks = EXCLUDED.vip_perks,');
lines.push('  updated_at = NOW();');
lines.push('');

const targetFile = path.resolve(process.cwd(), 'supabase/seed.sql');
fs.writeFileSync(targetFile, lines.join('\n'), 'utf8');
console.log(
  `Successfully generated ${targetFile} with ${CRETAN_PRODUCERS.length} audited Crete producers/projects and no Experiences.`
);
