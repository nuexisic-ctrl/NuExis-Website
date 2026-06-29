import { useEffect } from 'react';
import {
  SITE_NAME,
  SITE_URL,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  abs,
} from '../lib/seo';

interface SeoProps {
  /** Page title. Site name is appended automatically unless `rawTitle` is set. */
  title?: string;
  rawTitle?: boolean;
  description?: string;
  /** Path (e.g. "/category/active-led") used for canonical + og:url. */
  canonicalPath?: string;
  keywords?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  noindex?: boolean;
  /** One or more JSON-LD objects to inject into <head>. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const upsertMeta = (selector: string, attr: 'name' | 'property', key: string, content: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

const upsertLink = (rel: string, href: string) => {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
};

const Seo: React.FC<SeoProps> = ({
  title,
  rawTitle = false,
  description = DEFAULT_DESCRIPTION,
  canonicalPath = '/',
  keywords,
  image = DEFAULT_OG_IMAGE,
  type = 'website',
  noindex = false,
  jsonLd,
}) => {
  useEffect(() => {
    const fullTitle = title
      ? rawTitle
        ? title
        : `${title} | ${SITE_NAME}`
      : `${SITE_NAME} — Professional AV Solutions, Digital Signage & LED Displays`;
    const url = abs(canonicalPath);
    const ogImage = abs(image);

    document.title = fullTitle;

    upsertMeta('meta[name="description"]', 'name', 'description', description);
    if (keywords) upsertMeta('meta[name="keywords"]', 'name', 'keywords', keywords);
    upsertMeta('meta[name="robots"]', 'name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');

    // Open Graph
    upsertMeta('meta[property="og:type"]', 'property', 'og:type', type);
    upsertMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', description);
    upsertMeta('meta[property="og:url"]', 'property', 'og:url', url);
    upsertMeta('meta[property="og:image"]', 'property', 'og:image', ogImage);
    upsertMeta('meta[property="og:site_name"]', 'property', 'og:site_name', SITE_NAME);

    // Twitter
    upsertMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
    upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    upsertMeta('meta[name="twitter:image"]', 'name', 'twitter:image', ogImage);

    upsertLink('canonical', url);

    // JSON-LD — remove previously injected page-level scripts, then add fresh ones.
    const existing = document.head.querySelectorAll('script[data-seo-jsonld="page"]');
    existing.forEach((n) => n.remove());

    if (jsonLd) {
      const blocks = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      blocks.forEach((block) => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-seo-jsonld', 'page');
        script.textContent = JSON.stringify(block);
        document.head.appendChild(script);
      });
    }

    return () => {
      const stale = document.head.querySelectorAll('script[data-seo-jsonld="page"]');
      stale.forEach((n) => n.remove());
    };
  }, [title, rawTitle, description, canonicalPath, keywords, image, type, noindex, jsonLd]);

  return null;
};

export default Seo;
