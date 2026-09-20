import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const rootDir = process.cwd();

export function loadProductionCatalogueEnv(): void {
  for (const file of ['.env.production.local', '.env.production', '.env.local', '.env']) {
    const filePath = path.resolve(rootDir, file);
    if (fs.existsSync(filePath)) dotenv.config({ path: filePath, override: false });
  }
}

export async function fetchActiveProducerRows(): Promise<any[]> {
  loadProductionCatalogueEnv();

  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      'Supabase public URL/key are unavailable. Live catalogue synchronization requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or SUPABASE_URL / SUPABASE_ANON_KEY).'
    );
  }

  const supabase = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const { data, error } = await supabase
    .from('producers')
    .select('*')
    .eq('is_active', true)
    .order('id', { ascending: true });

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error('The active public.producers catalogue returned no rows.');
  }

  return data;
}
