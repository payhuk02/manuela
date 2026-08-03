const url = process.env.VITE_SUPABASE_URL + '/rest/v1/site_content';
const key = process.env.VITE_SUPABASE_ANON_KEY;

const payload = [
  { key: 'hero.s2.image', lang: 'fr', value: 'https://jnrhhnqqtwmnsfoljirw.supabase.co/storage/v1/object/public/site-images/logos/hero-slide2.image-1785503943712.webp' },
  { key: 'hero.s2.image', lang: 'en', value: 'https://jnrhhnqqtwmnsfoljirw.supabase.co/storage/v1/object/public/site-images/logos/hero-slide2.image-1785503943712.webp' }
];

fetch(url, {
  method: 'POST',
  headers: {
    'apikey': key,
    'Authorization': 'Bearer ' + key,
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates'
  },
  body: JSON.stringify(payload)
})
.then(async r => {
  if (!r.ok) {
    console.error(await r.text());
    throw new Error(r.statusText);
  }
  console.log("Migration successful");
})
.catch(console.error);
