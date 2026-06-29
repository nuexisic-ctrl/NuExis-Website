import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { useCatalog } from '../context/CatalogContext';
import { useAuth } from '../context/AuthContext';
import Seo from './Seo';
import { buildBreadcrumbLd, abs } from '../lib/seo';
import { 
  Search, 
  Map, 
  Home, 
  Layers, 
  FileText, 
  Image as ImageIcon, 
  HelpCircle, 
  ChevronRight, 
  Settings, 
  Monitor, 
  Cpu
} from 'lucide-react';

interface SitemapLink {
  label: string;
  path: string;
  isExternal?: boolean;
}

interface SitemapSection {
  title: string;
  icon: React.ReactNode;
  links: SitemapLink[];
}

const SitemapPage: React.FC = () => {
  const { categories, products, softwares, galleryCategories } = useCatalog();
  const { isAdmin } = useAuth();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');

  // Sync search box when arriving via the sitelinks search box (?q=...)
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearch(q);
  }, [searchParams]);

  // 1. Static/Site Core Pages
  const coreLinks: SitemapLink[] = [
    { label: 'Home Page', path: '/' },
    { label: 'About Us', path: '/#about' },
    { label: 'Why Choose Us', path: '/#why-choose-us' },
    { label: 'Our Mission & Values', path: '/#mission' },
    { label: 'Client Testimonials', path: '/#testimonials' },
    { label: 'Frequently Asked Questions (FAQ)', path: '/#faq' },
    { label: 'Product Catalog Overview', path: '/categories' },
    { label: 'Multimedia Gallery', path: '/gallery' },
    { label: 'Technical Support & Helpdesk', path: '/support' },
  ];

  if (isAdmin) {
    coreLinks.push({ label: 'Administrator Management Panel', path: '/admin' });
  }

  // 2. Category Links
  const categoryLinks: SitemapLink[] = categories.map(cat => ({
    label: cat.name,
    path: `/category/${cat.slug}`
  }));

  // 3. Product Links
  const productLinks: SitemapLink[] = products.map(prod => {
    const cat = categories.find(c => c.id === prod.category_id);
    const catSlug = cat ? cat.slug : 'uncategorized';
    return {
      label: prod.name,
      path: `/product/${catSlug}/${prod.slug}`
    };
  });

  // 4. Software/Solutions Links
  const softwareLinks: SitemapLink[] = softwares.map(soft => ({
    label: soft.name,
    path: soft.forward_url || '#',
    isExternal: !soft.forward_url?.startsWith('/')
  }));

  // 5. Gallery Categories
  const galleryLinks: SitemapLink[] = galleryCategories.map(gCat => ({
    label: `Gallery - ${gCat.name}`,
    path: `/gallery`
  }));

  // Filter links based on search
  const filterLinks = (links: SitemapLink[]) => {
    return links.filter(l => 
      l.label.toLowerCase().includes(search.toLowerCase()) || 
      l.path.toLowerCase().includes(search.toLowerCase())
    );
  };

  const sections: SitemapSection[] = [
    {
      title: 'NuExis Core Pages',
      icon: <Home className="w-5 h-5 text-brand-blue" />,
      links: filterLinks(coreLinks)
    },
    {
      title: 'Solutions & Software Suites',
      icon: <Monitor className="w-5 h-5 text-indigo-500" />,
      links: filterLinks(softwareLinks)
    },
    {
      title: 'Product Categories',
      icon: <Layers className="w-5 h-5 text-emerald-500" />,
      links: filterLinks(categoryLinks)
    },
    {
      title: 'Individual Product Directory',
      icon: <Cpu className="w-5 h-5 text-cyan-500" />,
      links: filterLinks(productLinks)
    },
    {
      title: 'Gallery Sections',
      icon: <ImageIcon className="w-5 h-5 text-pink-500" />,
      links: filterLinks(galleryLinks)
    }
  ];

  // Check if any section has items remaining
  const totalMatches = sections.reduce((acc, curr) => acc + curr.links.length, 0);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 sm:pt-28 pb-16 sm:pb-20 transition-colors duration-300">
      <Seo
        title="Sitemap — Find Every Page, Product & Solution"
        description="Explore the complete NuExis sitemap: browse all product categories, individual products, software solutions, gallery sections, and support pages in one place."
        canonicalPath="/sitemap"
        keywords="NuExis sitemap, NuExis pages, NuExis products list, site navigation, NuExis directory"
        jsonLd={[
          buildBreadcrumbLd([
            { name: 'Home', path: '/' },
            { name: 'Sitemap', path: '/sitemap' },
          ]),
          {
            '@context': 'https://schema.org',
            '@type': 'SiteNavigationElement',
            name: ['Home', 'Product Catalog', 'Gallery', 'Support', 'Sitemap'],
            url: [
              abs('/'),
              abs('/categories'),
              abs('/gallery'),
              abs('/support'),
              abs('/sitemap'),
            ],
          },
        ]}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="text-center mb-10 sm:mb-14">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 bg-brand-blue/10 text-brand-blue text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full mb-4">
              <Map className="w-3.5 h-3.5" /> Navigation Hub
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
              HTML Sitemap
            </h1>
            <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto px-2">
              Browse through our complete structural hierarchy of categories, products, software utilities, and support links.
            </p>
          </motion.div>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="relative max-w-md mx-auto mt-8 px-2"
          >
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search sitemap links…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-5 py-3 rounded-2xl border border-gray-200 bg-white text-gray-800 shadow-sm text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all"
            />
          </motion.div>
        </div>

        {/* Sitemap Content Grid */}
        {totalMatches === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Map className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 font-medium text-sm sm:text-base">
              No matching pages or products found for "{search}"
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section, idx) => {
              if (section.links.length === 0) return null;

              return (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.4 }}
                  className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden p-6 flex flex-col hover:shadow-md transition-shadow"
                >
                  {/* Section Title */}
                  <div className="flex items-center gap-3 pb-4 mb-4 border-b border-black/5">
                    {section.icon}
                    <h3 className="text-base font-bold text-gray-900 leading-snug">
                      {section.title}
                    </h3>
                  </div>

                  {/* Links list */}
                  <ul className="space-y-3 flex-1">
                    {section.links.map(link => (
                      <li key={link.label}>
                        {link.isExternal ? (
                          <a
                            href={link.path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-start gap-1 text-sm font-medium text-gray-600 hover:text-brand-blue transition-colors py-0.5"
                          >
                            <ChevronRight className="w-4 h-4 mt-0.5 text-gray-400 group-hover:text-brand-blue transition-colors shrink-0" />
                            <span className="leading-snug break-words">
                              {link.label} <span className="text-[10px] text-gray-400 font-normal">(External Link)</span>
                            </span>
                          </a>
                        ) : (
                          <Link
                            to={link.path}
                            className="group flex items-start gap-1 text-sm font-medium text-gray-600 hover:text-brand-blue transition-colors py-0.5"
                          >
                            <ChevronRight className="w-4 h-4 mt-0.5 text-gray-400 group-hover:text-brand-blue transition-colors shrink-0" />
                            <span className="leading-snug break-words">
                              {link.label}
                            </span>
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default SitemapPage;
