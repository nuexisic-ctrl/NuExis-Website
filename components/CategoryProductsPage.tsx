import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCatalog } from '../context/CatalogContext';
import {
  Search, Package, ChevronRight, ArrowRight,
  ImageIcon, Loader2, LayoutGrid, List,
  X, ChevronDown
} from 'lucide-react';
import Seo from './Seo';
import { buildBreadcrumbLd, buildItemListLd, SITE_NAME } from '../lib/seo';

// ───────────────────────────────────────────────────
// Product Card — GRID view
// ───────────────────────────────────────────────────
const GridCard: React.FC<{
  product: any;
  categorySlug: string | undefined;
  index: number;
}> = ({ product, categorySlug, index }) => {
  const { resolveImageUrl } = useCatalog();
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      <Link
        to={`/product/${categorySlug}/${product.slug}`}
        className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-black/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full"
      >
        {/* Image strip — constrained height so low-res images don't dominate */}
        <div className="relative bg-gray-100 overflow-hidden" style={{ height: '180px' }}>
          {product.cover_image || product.images?.[0] ? (
            <img
              src={resolveImageUrl(product.cover_image || product.images[0])}
              alt={product.name}
              className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <ImageIcon className="w-10 h-10" />
            </div>
          )}
          {product.specifications?.length > 0 && (
            <span className="absolute top-2.5 right-2.5 text-[10px] font-bold bg-white/90 text-gray-600 px-2 py-0.5 rounded-full shadow-sm border border-black/5">
              {product.specifications.length} specs
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-4">
          <h3 className="text-sm font-bold text-gray-900 group-hover:text-brand-blue transition-colors line-clamp-2 leading-snug mb-1.5">
            {product.name}
          </h3>
          {product.heading && (
            <p className="text-xs text-gray-500 font-medium mb-2 line-clamp-1">{product.heading}</p>
          )}
          {product.short_description && (
            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed flex-1">
              {product.short_description}
            </p>
          )}
          <div className="flex items-center justify-end mt-3 pt-3 border-t border-black/5">
            <span className="flex items-center gap-1 text-xs font-bold text-brand-blue group-hover:gap-2 transition-all">
              View Details <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// ───────────────────────────────────────────────────
// Product Card — LIST view (text-first, image small)
// ───────────────────────────────────────────────────
const ListCard: React.FC<{
  product: any;
  categorySlug: string | undefined;
  index: number;
}> = ({ product, categorySlug, index }) => {
  const { resolveImageUrl } = useCatalog();
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.035, duration: 0.28 }}
    >
      <Link
        to={`/product/${categorySlug}/${product.slug}`}
        className="group flex items-center gap-4 sm:gap-5 bg-white rounded-2xl border border-black/5 shadow-sm hover:shadow-lg hover:border-brand-blue/20 transition-all duration-300 p-3 sm:p-4 overflow-hidden"
      >
        {/* Thumbnail — small, doesn't dominate */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gray-50 overflow-hidden shrink-0 border border-black/5 flex items-center justify-center text-gray-300">
          {product.cover_image || product.images?.[0] ? (
            <img
              src={resolveImageUrl(product.cover_image || product.images[0])}
              alt={product.name}
              className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-400"
            />
          ) : (
            <Package className="w-8 h-8" />
          )}
        </div>

        {/* Content — primary focus */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-brand-blue transition-colors line-clamp-1">
            {product.name}
          </h3>
          {product.heading && (
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5 line-clamp-1">{product.heading}</p>
          )}
          {product.short_description && (
            <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed hidden sm:block">
              {product.short_description}
            </p>
          )}
          {product.specifications?.length > 0 && (
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {product.specifications.length} specifications
              </span>
            </div>
          )}
        </div>

        {/* Arrow */}
        <div className="w-8 h-8 rounded-full border border-gray-200 group-hover:border-brand-blue group-hover:bg-brand-blue flex items-center justify-center shrink-0 transition-all">
          <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-colors" />
        </div>
      </Link>
    </motion.div>
  );
};

// ───────────────────────────────────────────────────
// Main Page
// ───────────────────────────────────────────────────
const CategoryProductsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { categories, products, loading, getCategoryBySlug } = useCatalog();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    const saved = localStorage.getItem('catalogViewMode');
    return (saved === 'grid' || saved === 'list') ? saved : 'grid';
  });

  useEffect(() => {
    localStorage.setItem('catalogViewMode', viewMode);
  }, [viewMode]);

  const category = getCategoryBySlug(slug ?? '');
  const categoryProducts = useMemo(
    () => products.filter(p => p.category_id === category?.id),
    [products, category]
  );
  const filtered = useMemo(
    () => categoryProducts.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.short_description ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (p.heading ?? '').toLowerCase().includes(search.toLowerCase())
    ),
    [categoryProducts, search]
  );

  if (!loading && !category) return <Navigate to="/categories" replace />;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-16 sm:pb-20">

      {category && (
        <Seo
          title={`${category.name} — Products & Solutions`}
          description={`Explore ${categoryProducts.length} ${category.name} product${categoryProducts.length !== 1 ? 's' : ''} from ${SITE_NAME}. Professional ${category.name.toLowerCase()} solutions with specifications, documentation, and support.`}
          canonicalPath={`/category/${slug}`}
          keywords={`${category.name}, NuExis ${category.name}, ${category.name} price, ${category.name} India, ${categoryProducts.map(p => p.name).slice(0, 8).join(', ')}`}
          jsonLd={[
            buildBreadcrumbLd([
              { name: 'Home', path: '/' },
              { name: 'Categories', path: '/categories' },
              { name: category.name, path: `/category/${slug}` },
            ]),
            buildItemListLd(
              categoryProducts.map(p => ({ name: p.name, path: `/product/${slug}/${p.slug}` })),
              `${category.name} Products`
            ),
          ]}
        />
      )}

      {/* ── Category Banner — minimal text-focused ── */}
      <div className="bg-white border-b border-black/5 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-3 flex-wrap">
            <Link to="/" className="hover:text-brand-blue transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <Link to="/categories" className="hover:text-brand-blue transition-colors">Categories</Link>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <span className="text-gray-600 font-semibold">{category?.name ?? '…'}</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                {category?.name ?? ''}
              </h1>
              <p className="text-sm text-gray-400 mt-1.5">
                {categoryProducts.length} product{categoryProducts.length !== 1 ? 's' : ''} in this category
              </p>
            </div>

            {/* Category switcher — dropdown */}
            <div className="relative shrink-0">
              <select
                value={category?.id ?? ''}
                onChange={e => {
                  const chosen = categories.find(c => c.id === e.target.value);
                  if (chosen) navigate(`/category/${chosen.slug}`);
                }}
                className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Toolbar: search + view toggle ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search in this category…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Result count */}
          {search && (
            <span className="text-xs text-gray-400 hidden sm:block shrink-0">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </span>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* View toggle */}
          <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm gap-0.5">
            <button
              onClick={() => setViewMode('list')}
              title="List view"
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-brand-blue text-white shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              title="Grid view"
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-brand-blue text-white shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-7 h-7 animate-spin text-brand-blue" />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 sm:py-28">
            <Package className="w-10 h-10 sm:w-12 sm:h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-semibold text-base sm:text-lg mb-1">
              {search ? 'No products match your search' : 'No products in this category yet'}
            </p>
            {search && (
              <button onClick={() => setSearch('')} className="mt-3 text-sm text-brand-blue hover:underline">
                Clear search
              </button>
            )}
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            {viewMode === 'list' ? (
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col gap-2.5 sm:gap-3">
                {filtered.map((product, i) => (
                  <ListCard key={product.id} product={product} categorySlug={slug} index={i} />
                ))}
              </motion.div>
            ) : (
              <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {filtered.map((product, i) => (
                  <GridCard key={product.id} product={product} categorySlug={slug} index={i} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default CategoryProductsPage;
