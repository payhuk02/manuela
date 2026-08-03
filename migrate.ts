import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('site_content')
    .upsert([
      { key: 'hero.s2.image', lang: 'fr', value: 'https://jnrhhnqqtwmnsfoljirw.supabase.co/storage/v1/object/public/site-images/logos/hero-slide2.image-1785503943712.webp' },
      { key: 'hero.s2.image', lang: 'en', value: 'https://jnrhhnqqtwmnsfoljirw.supabase.co/storage/v1/object/public/site-images/logos/hero-slide2.image-1785503943712.webp' }
    ], { onConflict: 'key,lang' });
  
  if (error) console.error(error);
  else console.log('Migration OK');
}

run();
