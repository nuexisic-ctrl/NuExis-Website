import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Plus, ChevronRight, X, Loader2, Upload,
  ChevronLeft, FolderOpen, AlertCircle, Search,
  Pencil, Trash2, MoreHorizontal, Image as ImageIcon,
  ToggleLeft, ToggleRight, Eye, EyeOff, Download
} from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { forceDownload } from '../lib/downloadHelper';
import toast from 'react-hot-toast';
import AddProductModal, { ProductData } from './AddProductModal';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  show_in_navbar: boolean;
  created_at: string;
  productCount: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const generateSlug = (n: string) =>
  n.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const uid = () => Math.random().toString(36).slice(2);

// ── Category Modal (Add / Edit) ────────────────────────────────────────────────
const CategoryModal: React.FC<{
  existing?: Category | null;
  onClose: () => void;
  onDone: (cat: Category) => void;
}> = ({ existing, onClose, onDone }) => {
  const catalogContext = useCatalog();
  const isEdit = !!existing;
  const [name, setName] = useState(existing?.name ?? '');
  const [slug, setSlug] = useState(existing?.slug ?? '');
  const [autoSlug, setAutoSlug] = useState(!existing);
  const [showInNavbar, setShowInNavbar] = useState(existing?.show_in_navbar ?? true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(existing?.image_url ?? '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imgRef = useRef<HTMLInputElement>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    if (autoSlug) setSlug(generateSlug(val));
  };

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Category name is required.'); return; }
    if (!slug.trim()) { setError('Slug is required.'); return; }
    if (!isEdit && !imageFile && !imagePreview) { setError('Category image is required.'); return; }
    setError(null); setUploading(true);

    try {
      const payload = { name: name.trim(), slug: slug.trim(), image_url: imagePreview, show_in_navbar: showInNavbar };

      let saved: Category;
      if (isEdit && existing?.id) {
        saved = await catalogContext.updateCategory(existing.id, payload, imageFile) as Category;
      } else {
        saved = await catalogContext.addCategory(payload, imageFile) as Category;
      }

      onDone(saved);
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save category.');
    } finally { setUploading(false); }
  };

  return (
    <AnimatePresence>
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94 }} transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="fixed inset-0 z-[61] flex items-center justify-center p-4" onClick={e => e.stopPropagation()}
        >
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-brand-blue to-blue-400" />
            <div className="px-7 pt-6 pb-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{isEdit ? 'Edit Category' : 'New Category'}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{isEdit ? 'Update category details' : 'Add a category to the catalog'}</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Image upload */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                    Category Image <span className="text-red-500">*</span>
                  </label>
                  <div
                    onClick={() => imgRef.current?.click()}
                    className="relative w-full h-36 rounded-xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-brand-blue/60 bg-gray-50 cursor-pointer flex items-center justify-center transition-all group"
                  >
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                          <span className="text-white text-sm font-semibold flex items-center gap-2"><Upload className="w-4 h-4" /> Change Image</span>
                          {existing?.image_url && (
                             <button type="button" onClick={(e) => { e.stopPropagation(); forceDownload(existing.image_url!, existing.name + '.jpg'); }} className="mt-2 p-2 bg-white/20 hover:bg-white/40 rounded-lg backdrop-blur-sm text-white transition-colors flex items-center gap-2" title="Download Image">
                               <Download className="w-4 h-4" /> <span className="text-sm font-semibold">Download</span>
                             </button>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-brand-blue/10 group-hover:text-brand-blue transition-colors">
                          <Upload className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium">Click to upload image</span>
                      </div>
                    )}
                    <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Category Name</label>
                  <input autoFocus type="text" value={name} onChange={e => handleNameChange(e.target.value)} placeholder="e.g. LED Video Walls"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue transition-all" />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">URL Slug</label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center flex-1 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden focus-within:ring-2 focus-within:ring-brand-blue/40">
                      <span className="px-3 text-sm text-gray-400 border-r border-gray-200 shrink-0">/category/</span>
                      <input type="text" value={slug} onChange={e => { setAutoSlug(false); setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')); }}
                        className="flex-1 px-3 py-3 text-sm bg-transparent focus:outline-none font-mono text-gray-800" />
                    </div>
                    <button type="button" onClick={() => { setAutoSlug(true); setSlug(generateSlug(name)); }}
                      className="px-3 py-2.5 text-xs text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors whitespace-nowrap">↺ Auto</button>
                  </div>
                </div>

                {/* Show in Navbar */}
                <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2.5">
                    {showInNavbar ? <Eye className="w-4 h-4 text-brand-blue" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Show in Navigation</p>
                      <p className="text-xs text-gray-400">{showInNavbar ? 'Visible in the header Product menu' : 'Hidden from header navigation'}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setShowInNavbar(!showInNavbar)} className="transition-colors">
                    {showInNavbar
                      ? <ToggleRight className="w-9 h-9 text-brand-blue" />
                      : <ToggleLeft className="w-9 h-9 text-gray-300" />}
                  </button>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Buttons */}
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
                  <button type="submit" disabled={uploading || !name.trim()}
                    className="flex-1 py-2.5 rounded-xl bg-brand-blue text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {isEdit ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
};

// ── Category Detail ────────────────────────────────────────────────────────────
const CategoryDetail: React.FC<{
  category: Category;
  onBack: () => void;
  onCategoryUpdated: (cat: Category) => void;
}> = ({ category, onBack, onCategoryUpdated }) => {
  const catalogContext = useCatalog();
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const prods = catalogContext.getProductsByCategory(category.id);
    setProducts(prods);
    setLoading(false);
  }, [category.id, catalogContext.products]);

  React.useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleProductSaved = (product: ProductData) => {
    setShowAddProduct(false); setEditingProduct(null);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    setDeletingId(productId);
    try {
      await catalogContext.deleteProduct(productId);
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete product');
    } finally {
      setDeletingId(null); setOpenMenuId(null);
    }
  };

  return (
    <>
      <motion.div key="detail" initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -28 }} transition={{ duration: 0.22 }}>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <button onClick={onBack} className="flex items-center gap-1 text-brand-blue hover:underline font-medium"><ChevronLeft className="w-4 h-4" /> Products</button>
          <span className="text-gray-400">/</span>
          <span className="text-gray-700 font-semibold">{category.name}</span>
        </div>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          {category.image_url && (
            <div className="w-14 h-14 rounded-xl overflow-hidden border border-black/5 shrink-0">
              <img src={category.image_url} alt={category.name} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{products.length} product{products.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => setShowAddProduct(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-brand-blue/25">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>

        {/* Product Table */}
        <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
          <div className="hidden sm:grid grid-cols-[48px_2fr_1fr_120px_56px] gap-4 px-6 py-3 bg-gray-50 border-b border-black/5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span></span><span>Product Name</span><span>Specifications</span><span>Added</span><span></span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-brand-blue" /></div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-300 flex items-center justify-center mb-4"><Package className="w-7 h-7" /></div>
              <h3 className="text-base font-bold text-gray-800 mb-1">No products yet</h3>
              <p className="text-sm text-gray-400">Click <span className="font-semibold text-gray-600">"+ Add Product"</span> to add the first product.</p>
            </div>
          ) : (
            <div className="divide-y divide-black/5">
              {products.map((product, i) => (
                <motion.div key={product.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="grid grid-cols-[48px_1fr_auto] sm:grid-cols-[48px_2fr_1fr_120px_56px] gap-4 px-6 py-3.5 items-center hover:bg-blue-50/30 transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center text-gray-300">
                    {product.cover_image || product.images?.[0]
                      ? <img src={product.cover_image || product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                      : <ImageIcon className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-brand-blue transition-colors">{product.name}</p>
                    <p className="text-xs text-gray-400 font-mono truncate mt-0.5">{product.slug || '—'}</p>
                  </div>
                  <div className="hidden sm:block">
                    {product.specifications?.length > 0
                      ? <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">{product.specifications.length} specs</span>
                      : <span className="text-xs text-gray-300">—</span>}
                  </div>
                  <span className="hidden sm:block text-xs text-gray-400">{formatDate(product.created_at!)}</span>
                  <div className="relative flex items-center justify-end">
                    <button onClick={() => setOpenMenuId(openMenuId === product.id ? null : product.id)}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                    <AnimatePresence>
                      {openMenuId === product.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                          <motion.div initial={{ opacity: 0, scale: 0.92, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92 }}
                            className="absolute right-0 top-8 z-20 w-36 bg-white rounded-xl shadow-xl border border-black/8 py-1 overflow-hidden">
                            <button onClick={() => { setEditingProduct(product); setOpenMenuId(null); }}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-brand-blue transition-colors">
                              <Pencil className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button onClick={() => handleDelete(product.id!)} disabled={deletingId === product.id}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60">
                              {deletingId === product.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />} Delete
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {(showAddProduct || editingProduct) && (
          <AddProductModal categoryId={category.id} categoryName={category.name}
            existingProduct={editingProduct}
            onClose={() => { setShowAddProduct(false); setEditingProduct(null); }}
            onSaved={handleProductSaved} />
        )}
      </AnimatePresence>
    </>
  );
};

// ── Categories List ────────────────────────────────────────────────────────────
const CategoriesView: React.FC<{
  categories: Category[];
  loading: boolean;
  onSelectCategory: (cat: Category) => void;
  onAddCategory: () => void;
  onEditCategory: (cat: Category) => void;
  onDeleteCategory: (id: string) => void;
}> = ({ categories, loading, onSelectCategory, onAddCategory, onEditCategory, onDeleteCategory }) => {
  const [search, setSearch] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const filtered = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div key="list" initial={{ opacity: 0, x: -28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 28 }} transition={{ duration: 0.22 }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 bg-brand-blue/10 text-brand-blue text-sm font-semibold px-3.5 py-1.5 rounded-full">
            <FolderOpen className="w-4 h-4" /> {categories.length} {categories.length === 1 ? 'Category' : 'Categories'}
          </span>
          <span className="text-sm text-gray-400 hidden sm:block">Manage your product catalog</span>
        </div>
        <button onClick={onAddCategory}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-brand-blue/20 shrink-0">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search categories…" value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all shadow-sm" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        <div className="hidden sm:grid grid-cols-[64px_2fr_80px_120px_130px_48px] gap-4 px-6 py-3 bg-gray-50 border-b border-black/5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <span>Image</span><span>Category</span><span>Navbar</span><span>Products</span><span>Created</span><span></span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-brand-blue" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FolderOpen className="w-10 h-10 text-gray-200 mb-3" />
            <p className="text-sm font-semibold text-gray-400">{search ? 'No categories match your search' : 'No categories yet'}</p>
          </div>
        ) : (
          <div className="divide-y divide-black/5">
            {filtered.map((cat, i) => (
              <motion.div key={cat.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.035 }}
                className="grid grid-cols-[64px_1fr_auto] sm:grid-cols-[64px_2fr_80px_120px_130px_48px] gap-4 px-6 py-3 items-center hover:bg-blue-50/30 transition-colors group">
                {/* Thumbnail */}
                <div onClick={() => onSelectCategory(cat)} className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border border-black/5 flex items-center justify-center text-gray-300 cursor-pointer shrink-0">
                  {cat.image_url ? <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5" />}
                </div>

                {/* Name */}
                <button onClick={() => onSelectCategory(cat)} className="text-left flex items-center gap-3 min-w-0">
                  <span className="text-sm font-semibold text-gray-900 group-hover:text-brand-blue transition-colors truncate">{cat.name}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-brand-blue group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
                </button>

                {/* Navbar badge */}
                <div className="hidden sm:flex">
                  {cat.show_in_navbar
                    ? <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-green-50 text-green-700"><Eye className="w-3 h-3" /> Shown</span>
                    : <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-400"><EyeOff className="w-3 h-3" /> Hidden</span>}
                </div>

                {/* Count */}
                <div className="hidden sm:block">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${cat.productCount > 0 ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {cat.productCount} {cat.productCount === 1 ? 'product' : 'products'}
                  </span>
                </div>

                {/* Date */}
                <span className="hidden sm:block text-xs text-gray-400">{formatDate(cat.created_at)}</span>

                {/* Actions */}
                <div className="relative flex items-center justify-end">
                  <button onClick={() => setOpenMenuId(openMenuId === cat.id ? null : cat.id)}
                    className="p-1.5 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                  <AnimatePresence>
                    {openMenuId === cat.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                        <motion.div initial={{ opacity: 0, scale: 0.92, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92 }}
                          className="absolute right-0 top-8 z-20 w-36 bg-white rounded-xl shadow-xl border border-black/8 py-1 overflow-hidden">
                          <button onClick={() => { onEditCategory(cat); setOpenMenuId(null); }}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-brand-blue transition-colors">
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button onClick={() => { onDeleteCategory(cat.id); setOpenMenuId(null); }}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {!loading && filtered.length > 0 && (
        <p className="text-xs text-gray-400 mt-3 px-1">Showing {filtered.length} of {categories.length} categories</p>
      )}
    </motion.div>
  );
};

// ── Root Panel ────────────────────────────────────────────────────────────────
const AdminProductsPanel: React.FC = () => {
  const catalogContext = useCatalog();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Category | null>(null);
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  const fetchCategories = useCallback(() => {
    setLoading(true);
    const countMap: Record<string, number> = {};
    catalogContext.products.forEach(p => { if (p.category_id) countMap[p.category_id] = (countMap[p.category_id] || 0) + 1; });
    setCategories(catalogContext.categories.map(c => ({ ...c, productCount: countMap[c.id] || 0 } as Category)));
    setLoading(false);
  }, [catalogContext.categories, catalogContext.products]);

  React.useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleCategoryDone = (cat: Category) => {
    if (editingCat && selected?.id === cat.id) setSelected(cat);
    setEditingCat(null);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category and all its products? This cannot be undone.')) return;
    try {
      await catalogContext.deleteCategory(id);
      toast.success('Category deleted');
    } catch {
      toast.error('Failed to delete category');
    }
  };

  return (
    <div>
      <AnimatePresence mode="wait">
        {selected ? (
          <CategoryDetail key="detail" category={selected} onBack={() => setSelected(null)}
            onCategoryUpdated={cat => setCategories(prev => prev.map(c => c.id === cat.id ? cat : c))} />
        ) : (
          <CategoriesView key="list" categories={categories} loading={loading}
            onSelectCategory={setSelected}
            onAddCategory={() => { setEditingCat(null); setShowCatModal(true); }}
            onEditCategory={cat => { setEditingCat(cat); setShowCatModal(true); }}
            onDeleteCategory={handleDeleteCategory} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCatModal && (
          <CategoryModal existing={editingCat} onClose={() => { setShowCatModal(false); setEditingCat(null); }} onDone={handleCategoryDone} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProductsPanel;
