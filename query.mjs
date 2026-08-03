const url = process.env.VITE_SUPABASE_URL + '/rest/v1/site_content?select=*';
const key = process.env.VITE_SUPABASE_ANON_KEY;

fetch(url, {
  headers: {
    'apikey': key,
    'Authorization': 'Bearer ' + key
  }
})
.then(r => r.json())
.then(data => {
  const filtered = data.filter(d => d.key.includes('hero.s2') || d.key.includes('hero.slide2'));
  console.log("Filtered site content:");
  filtered.forEach(d => console.log(`${d.key}::${d.lang} = ${d.value}`));
})
.catch(console.error);
