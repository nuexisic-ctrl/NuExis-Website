// Build-time SEO generator: writes public/sitemap.xml + public/robots.txt
// Pulls live categories & products from Supabase so every product URL is indexable.
import { createClient } from '@supabase/supabase-js';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PUBLIC = resolve(ROOT, 'public');

// ── Load env (.env then .env.local) without extra deps ──────────────────────────
const env = { ...process.env };
for (const file of ['.env', '.env.local']) {
  const p = resolve(ROOT, file);
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m && env[m[1]] === undefined) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const SITE_URL = (env.VITE_SITE_URL || 'https://nuexis.com').replace(/\/$/, '');
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_KEY = env.VITE_SUPABASE_ANON_KEY;

const today = new Date().toISOString().split('T')[0];
const xmlEscape = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

// Static routes always present.
const staticRoutes = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/categories', priority: '0.9', changefreq: 'weekly' },
  { loc: '/gallery', priority: '0.7', changefreq: 'monthly' },
  { loc: '/support', priority: '0.7', changefreq: 'monthly' },
  { loc: '/sitemap', priority: '0.4', changefreq: 'monthly' },
];

async function fetchDynamicRoutes() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn('[seo] Supabase env missing — generating sitemap with static routes only.');
    return [];
  }
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const routes = [];

    const { data: categories, error: catErr } = await supabase
      .from('categories')
      .select('id, slug');
    if (catErr) throw catErr;

    const catById = new Map();
    (categories || []).forEach((c) => {
      catById.set(c.id, c.slug);
      routes.push({ loc: `/category/${c.slug}`, priority: '0.8', changefreq: 'weekly' });
    });

    const { data: products, error: prodErr } = await supabase
      .from('products')
      .select('slug, category_id, updated_at');
    if (prodErr) throw prodErr;

    (products || []).forEach((p) => {
      const catSlug = catById.get(p.category_id);
      if (!catSlug || !p.slug) return;
      routes.push({
        loc: `/product/${catSlug}/${p.slug}`,
        priority: '0.7',
        changefreq: 'weekly',
        lastmod: p.updated_at ? new Date(p.updated_at).toISOString().split('T')[0] : today,
      });
    });

    console.log(`[seo] Fetched ${categories?.length || 0} categories and ${products?.length || 0} products.`);
    return routes;
  } catch (err) {
    console.warn('[seo] Failed to fetch from Supabase:', err.message);
    return [];
  }
}

function buildSitemap(routes) {
  const urls = routes
    .map((r) => {
      const loc = xmlEscape(`${SITE_URL}${r.loc}`);
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${r.lastmod || today}</lastmod>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function buildRobots() {
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    '',
  ].join('\n');
}

const dynamic = await fetchDynamicRoutes();
const all = [...staticRoutes, ...dynamic];

writeFileSync(resolve(PUBLIC, 'sitemap.xml'), buildSitemap(all), 'utf8');
writeFileSync(resolve(PUBLIC, 'robots.txt'), buildRobots(), 'utf8');

console.log(`[seo] Wrote sitemap.xml (${all.length} URLs) and robots.txt to public/.`);
