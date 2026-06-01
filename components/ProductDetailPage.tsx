import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCatalog } from '../context/CatalogContext';
import {
  ChevronRight, ChevronLeft, ChevronDown,
  Download, FileText, Youtube, X, ZoomIn,
  Package, Check, Loader2, ImageIcon, Lock
} from 'lucide-react';
import CatalogRequestModal from './CatalogRequestModal';

// ── Image Lightbox ────────────────────────────────────────────────────────────
const Lightbox: React.FC<{ images: string[]; initial: number; onClose: () => void }> = ({ images, initial, onClose }) => {
  const [idx, setIdx] = useState(initial);
  const prev = () => setIdx(i => (i - 1 + images.length) % images.length);
  const next = () => setIdx(i => (i + 1) % images.length);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}>
      <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white/60 hover:text-white p-2 z-10">
        <X className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {images.length > 1 && (
        <>
          <button onClick={e => { e.stopPropagation(); prev(); }}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white p-2 sm:p-3 bg-white/10 rounded-full z-10">
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button onClick={e => { e.stopPropagation(); next(); }}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white p-2 sm:p-3 bg-white/10 rounded-full z-10">
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      <motion.img key={idx} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} src={images[idx]}
        alt="" onClick={e => e.stopPropagation()}
        className="max-h-[82vh] max-w-[90vw] rounded-xl object-contain shadow-2xl" />

      {images.length > 1 && (
        <div className="absolute bottom-3 sm:bottom-4 flex items-center gap-1.5">
          {images.map((_, i) => (
            <button key={i} onClick={e => { e.stopPropagation(); setIdx(i); }}
              className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-5 bg-white' : 'w-1.5 bg-white/40'}`} />
          ))}
        </div>
      )}
    </motion.div>
  );
};

// ── Spec Table ────────────────────────────────────────────────────────────────
const SpecTable: React.FC<{ specs: { id: string; key: string; value: string }[] }> = ({ specs }) => {
  const [expanded, setExpanded] = useState(true);
  const visible = expanded ? specs : specs.slice(0, 6);

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-black/5 shadow-sm overflow-hidden">
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-black/5 flex items-center justify-between">
        <h3 className="text-sm sm:text-base font-bold text-gray-900">Specifications</h3>
        {specs.length > 6 && (
          <button onClick={() => setExpanded(!expanded)} className="text-xs sm:text-sm text-brand-blue hover:underline flex items-center gap-1">
            {expanded ? 'Show less' : `Show all ${specs.length}`}
            <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>
      <div className="divide-y divide-black/4">
        {visible.map((spec, i) => (
          <div key={spec.id} className={`flex items-start px-4 sm:px-6 py-2.5 sm:py-3 gap-2 sm:gap-4 ${i % 2 === 0 ? 'bg-gray-50/50' : ''}`}>
            {/* On mobile: stack key/value; on sm+ keep side-by-side */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-0.5 sm:gap-4 w-full">
              <span className="sm:w-1/3 lg:w-48 shrink-0 text-xs sm:text-sm font-semibold text-gray-600">{spec.key}</span>
              <span className="text-xs sm:text-sm text-gray-800 flex-1 break-words">{spec.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const ProductDetailPage: React.FC = () => {
  const { categorySlug, productSlug } = useParams<{ categorySlug: string; productSlug: string }>();
  const { getCategoryBySlug, getProductBySlug, loading } = useCatalog();

  const category = getCategoryBySlug(categorySlug ?? '');
  const product = getProductBySlug(category?.id ?? '', productSlug ?? '');

  const [activeImg, setActiveImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedCatalog, setSelectedCatalog] = useState<{ id: string; name: string } | null>(null);

  const allImages = product ? [
    ...(product.cover_image && !product.images.includes(product.cover_image) ? [product.cover_image] : []),
    ...product.images,
  ].filter(Boolean) : [];

  const uniqueImages = Array.from(new Set(allImages));

  if (loading) {
    return (
      <div className="min-h-screen pt-24 sm:pt-28 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  if (!product || !category) return <Navigate to="/categories" replace />;

  const openLightbox = (idx: number) => { setLightboxIdx(idx); setLightboxOpen(true); };

  const getYoutubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match?.[1] ?? null;
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-16 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ── Breadcrumb ── */}
          <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-400 mb-5 sm:mb-8 flex-wrap">
            <Link to="/" className="hover:text-brand-blue transition-colors shrink-0">Home</Link>
            <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <Link to="/categories" className="hover:text-brand-blue transition-colors shrink-0">Categories</Link>
            <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <Link to={`/category/${categorySlug}`} className="hover:text-brand-blue transition-colors shrink-0 hidden sm:inline">{category.name}</Link>
            <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 hidden sm:inline" />
            <span className="text-gray-700 font-semibold truncate max-w-[140px] sm:max-w-[200px]">{product.name}</span>
          </nav>

          {/* ── Top Grid: Gallery + Info ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 mb-8 sm:mb-12">

            {/* ── Image Gallery ── */}
            <div className="space-y-2 sm:space-y-3">
              {/* Main Image */}
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-[4/3] bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-black/5 shadow-sm group cursor-zoom-in"
                onClick={() => openLightbox(activeImg)}>
                {uniqueImages.length > 0 ? (
                  <img src={uniqueImages[activeImg]} alt={product.name} className="w-full h-full object-contain p-3 sm:p-4" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-200">
                    <ImageIcon className="w-12 h-12 sm:w-16 sm:h-16" />
                  </div>
                )}
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 bg-black/30 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </motion.div>

              {/* Thumbnails */}
              {uniqueImages.length > 1 && (
                <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {uniqueImages.map((img, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className={`w-12 h-12 sm:w-16 sm:h-16 shrink-0 rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all ${
                        i === activeImg ? 'border-brand-blue shadow-md shadow-brand-blue/20' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Product Info ── */}
            <div>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <span className="inline-flex items-center gap-1.5 bg-brand-blue/10 text-brand-blue text-[10px] sm:text-xs font-semibold px-2.5 py-1 sm:px-3 rounded-full mb-3">
                  <Package className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {category.name}
                </span>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-2">
                  {product.name}
                </h1>
                {product.heading && (
                  <p className="text-base sm:text-lg text-gray-500 font-medium mb-3 sm:mb-4">{product.heading}</p>
                )}
                {product.short_description && (
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4 sm:mb-6">{product.short_description}</p>
                )}

                {/* Key specs preview */}
                {product.specifications?.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200 mb-4 sm:mb-6 space-y-1.5 sm:space-y-2">
                    {product.specifications.slice(0, 4).map(spec => (
                      <div key={spec.id} className="flex items-start gap-2 text-xs sm:text-sm">
                        <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-brand-blue shrink-0 mt-0.5" />
                        <span className="text-gray-500 font-medium shrink-0">{spec.key}:</span>
                        <span className="text-gray-800 font-semibold">{spec.value}</span>
                      </div>
                    ))}
                    {product.specifications.length > 4 && (
                      <p className="text-[10px] sm:text-xs text-gray-400 pt-1">
                        +{product.specifications.length - 4} more specifications below
                      </p>
                    )}
                  </div>
                )}

                {/* Documents */}
                {product.documents?.length > 0 && (
                  <div className="space-y-2 sm:space-y-2.5">
                    <h4 className="text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider">Downloads</h4>
                    {product.documents.map((doc, idx) => {
                      const isCatalog = doc.type === 'catalog';
                      return isCatalog ? (
                        <button key={doc.id || idx} onClick={() => { setSelectedCatalog(doc); setRequestModalOpen(true); }}
                          className="w-full relative flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 bg-white border border-gray-200 rounded-xl hover:border-brand-blue hover:bg-brand-blue/5 transition-all group overflow-hidden text-left">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-100 text-gray-400 rounded-lg flex items-center justify-center shrink-0">
                            <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </div>
                          <div className="flex-1 min-w-0 pr-8">
                            <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate group-hover:text-brand-blue transition-colors">
                              {doc.name}
                            </p>
                            <p className="text-[10px] sm:text-xs text-brand-blue font-medium mt-0.5">Request Access to view</p>
                          </div>
                          <div className="absolute right-3 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-blue" />
                          </div>
                        </button>
                      ) : (
                        <a key={doc.id || idx} href={doc.url} target="_blank" rel="noreferrer"
                          className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 bg-white border border-gray-200 rounded-xl hover:border-brand-blue hover:bg-brand-blue/5 transition-all group">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-red-50 text-red-600 rounded-lg flex items-center justify-center shrink-0">
                            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate group-hover:text-brand-blue transition-colors">
                              {doc.name}
                            </p>
                            <p className="text-[10px] sm:text-xs text-gray-400 capitalize">{doc.type}</p>
                          </div>
                          <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-300 group-hover:text-brand-blue transition-colors shrink-0" />
                        </a>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          {/* ── Full Description ── */}
          {product.full_description && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white rounded-xl sm:rounded-2xl border border-black/5 shadow-sm p-5 sm:p-7 mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Product Overview</h2>
              <div className="text-xs sm:text-sm leading-relaxed text-gray-600 whitespace-pre-line">
                {product.full_description}
              </div>
            </motion.div>
          )}

          {/* ── Specifications Table ── */}
          {product.specifications?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-6 sm:mb-8">
              <SpecTable specs={product.specifications} />
            </motion.div>
          )}

          {/* ── Video ── */}
          {product.video_url && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-white rounded-xl sm:rounded-2xl border border-black/5 shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <Youtube className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" /> Product Video
              </h2>
              {getYoutubeId(product.video_url) ? (
                <div className="aspect-video rounded-xl overflow-hidden bg-gray-900">
                  <iframe
                    src={`https://www.youtube.com/embed/${getYoutubeId(product.video_url)}`}
                    title="Product Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen className="w-full h-full border-0" />
                </div>
              ) : (
                <a href={product.video_url} target="_blank" rel="noreferrer"
                  className="text-brand-blue hover:underline text-sm break-all">{product.video_url}</a>
              )}
            </motion.div>
          )}

          {/* ── Back link ── */}
          <Link to={`/category/${categorySlug}`}
            className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 hover:text-brand-blue transition-colors">
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Back to {category.name}
          </Link>
        </div>
      </div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightboxOpen && uniqueImages.length > 0 && (
          <Lightbox images={uniqueImages} initial={lightboxIdx} onClose={() => setLightboxOpen(false)} />
        )}
      </AnimatePresence>

      {/* ── Catalog Request Modal ── */}
      {selectedCatalog && (
        <CatalogRequestModal
          isOpen={requestModalOpen}
          onClose={() => setRequestModalOpen(false)}
          product={{ id: product.id!, name: product.name, slug: product.slug }}
          document={{ id: selectedCatalog.id, name: selectedCatalog.name }}
        />
      )}
    </>
  );
};

export default ProductDetailPage;
