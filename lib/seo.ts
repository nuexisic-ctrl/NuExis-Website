// ── Central SEO configuration & JSON-LD builders ───────────────────────────────

// Canonical production origin. Override with VITE_SITE_URL if deployed elsewhere.
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://nuexis.com').replace(/\/$/, '');

export const SITE_NAME = 'NuExis';
export const SITE_LEGAL_NAME = 'NuExis Inc.';

export const DEFAULT_TITLE = 'NuExis — Professional AV Solutions, Digital Signage & LED Displays';
export const DEFAULT_DESCRIPTION =
  'NuExis designs and supplies professional audio-visual technology: digital signage, interactive touch displays, active LED video walls, digital podiums, pro audio systems, and video conferencing solutions for enterprises across India.';

export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/NuExis Signage.webp`;

// Brand keyword variations (incl. common alternate spellings) to widen discovery.
export const BRAND_KEYWORDS = [
  'NuExis', 'Nuexis', 'NuExis Inc', 'NuExis India', 'NuExis AV',
  'Nuexis signage', 'New Exis', 'Nu Exis', 'Nuexes', 'Nuexsis',
  'AV solutions', 'audio visual solutions', 'digital signage',
  'interactive touch display', 'active LED video wall', 'LED display',
  'digital podium', 'pro audio system', 'video conferencing system',
  'conference room technology', 'professional AV India',
].join(', ');

export const ORG_CONTACT = {
  telephone: '+91-9625800589',
  email: 'support@nuexis.com',
  streetAddress: 'Kunwar Singh Nagar, Nangloi',
  addressLocality: 'Delhi',
  postalCode: '110041',
  addressCountry: 'IN',
};

export const ORG_SOCIAL = [
  'https://www.instagram.com/nuexis.inc/',
];

// Absolute URL helper.
export const abs = (path: string): string => {
  if (!path) return SITE_URL + '/';
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

// ── JSON-LD builders ────────────────────────────────────────────────────────────

export const buildOrganizationLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  legalName: SITE_LEGAL_NAME,
  url: `${SITE_URL}/`,
  logo: DEFAULT_OG_IMAGE,
  image: DEFAULT_OG_IMAGE,
  description: DEFAULT_DESCRIPTION,
  email: ORG_CONTACT.email,
  telephone: ORG_CONTACT.telephone,
  address: {
    '@type': 'PostalAddress',
    streetAddress: ORG_CONTACT.streetAddress,
    addressLocality: ORG_CONTACT.addressLocality,
    postalCode: ORG_CONTACT.postalCode,
    addressCountry: ORG_CONTACT.addressCountry,
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: ORG_CONTACT.telephone,
    email: ORG_CONTACT.email,
    contactType: 'customer support',
    areaServed: 'IN',
    availableLanguage: ['English', 'Hindi'],
  },
  sameAs: ORG_SOCIAL,
});

// WebSite schema with the Sitelinks Search Box action.
export const buildWebsiteLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: SITE_NAME,
  alternateName: ['NuExis Inc.', 'Nuexis'],
  url: `${SITE_URL}/`,
  publisher: { '@id': `${SITE_URL}/#organization` },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/sitemap?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
});

export const buildBreadcrumbLd = (items: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: abs(item.path),
  })),
});

export const buildProductLd = (opts: {
  name: string;
  description?: string | null;
  images?: string[];
  categoryName?: string;
  path: string;
  sku?: string;
}) => {
  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: opts.name,
    description: opts.description || `${opts.name} by ${SITE_NAME}.`,
    url: abs(opts.path),
    brand: { '@type': 'Brand', name: SITE_NAME },
    manufacturer: { '@id': `${SITE_URL}/#organization` },
  };
  if (opts.images && opts.images.length) ld.image = opts.images.map(abs);
  if (opts.categoryName) ld.category = opts.categoryName;
  if (opts.sku) ld.sku = opts.sku;
  return ld;
};

export const buildItemListLd = (
  items: { name: string; path: string }[],
  listName: string
) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: listName,
  numberOfItems: items.length,
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    url: abs(item.path),
  })),
});
