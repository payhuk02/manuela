import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const SUPABASE_URL = envFile.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim();
const SUPABASE_KEY = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const UPDATES = [
  { key: "hero.slide2.eyebrow", value: "Expertise" },
  { key: "hero.slide2.title", value: "Droit des" },
  { key: "hero.slide2.accent", value: "affaires" },
  { key: "hero.slide3.eyebrow", value: "Protection" },
  { key: "hero.slide3.title", value: "Droit du" },
  { key: "hero.slide3.accent", value: "travail" },
  { key: "hero.slide4.eyebrow", value: "Assistance" },
  { key: "hero.slide4.title", value: "Dommage" },
  { key: "hero.slide4.accent", value: "corporel" },
  { key: "hero.slide5.eyebrow", value: "Accompagnement" },
  { key: "hero.slide5.title", value: "Droit de la" },
  { key: "hero.slide5.accent", value: "famille" },
  { key: "hero.slide6.eyebrow", value: "Défense" },
  { key: "hero.slide6.title", value: "Droit" },
  { key: "hero.slide6.accent", value: "administratif" },
  { key: "hero.slide7.eyebrow", value: "Protection" },
  { key: "hero.slide7.title", value: "Droit des" },
  { key: "hero.slide7.accent", value: "étrangers" },
  { key: "hero.slide8.eyebrow", value: "Investissement" },
  { key: "hero.slide8.title", value: "Droit" },
  { key: "hero.slide8.accent", value: "immobilier" },
  { key: "hero.slide9.eyebrow", value: "Afrique" },
  { key: "hero.slide9.title", value: "Droit" },
  { key: "hero.slide9.accent", value: "OHADA" }
];

async function run() {
  console.log("Deleting site_content keys to force defaults...");
  for (const { key } of UPDATES) {
    const { error } = await supabase.from('site_content').delete().eq('key', key);
    if (error) {
      console.error(`Error deleting ${key}:`, error);
    }
  }
  console.log("Done.");
}

run();
