import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCatalog } from '../context/CatalogContext';
import { Package, Layers, Search, ArrowRight } from 'lucide-react';

const CategoryListPage: React.FC = () => {
  const { categories, products, loading } = useCatalog();
  const [search, setSearch] = useState('');

  const getProductCount = (catId: string) => products.filter(p => p.category_id === catId).length;
  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-24 sm:pt-28 pb-16 sm:pb-20">
      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-flex items-center gap-2 bg-brand-blue/10 text-brand-blue text-xs sm:text-sm font-semibold px-3 py-1.5 sm:px-4 rounded-full mb-4">
            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Product Catalog
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-3 sm:mb-4 tracking-tight">
            All Categories
          </h1>
          <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto px-2">
            Browse our complete range of professional AV and display solutions.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="relative max-w-sm sm:max-w-md mx-auto mt-6 sm:mt-8"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 sm:pl-11 pr-5 py-3 sm:py-3.5 rounded-2xl border border-gray-200 bg-white text-gray-800 shadow-sm text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all"
          />
        </motion.div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-gray-100 animate-pulse aspect-[4/3]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 sm:py-24">
            <Package className="w-10 h-10 sm:w-12 sm:h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-semibold text-sm sm:text-base">
              {search ? 'No categories match your search' : 'No categories available'}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filtered.map((cat, i) => {
              const count = getProductCount(cat.id);
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.35 }}
                >
                  <Link
                    to={`/category/${cat.slug}`}
                    className="group block bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-black/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden">
                      {cat.image_url ? (
                        <img src={cat.image_url} alt={cat.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Layers className="w-8 h-8 sm:w-10 sm:h-10" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="p-3 sm:p-4 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-xs sm:text-sm md:text-base font-bold text-gray-900 group-hover:text-brand-blue transition-colors leading-snug line-clamp-2">
                          {cat.name}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                          {count === 0 ? 'No products' : `${count} product${count !== 1 ? 's' : ''}`}
                        </p>
                      </div>
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-100 group-hover:bg-brand-blue flex items-center justify-center shrink-0 transition-colors mt-0.5">
                        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryListPage;
