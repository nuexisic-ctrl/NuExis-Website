import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Loader2, Upload, Trash2, Pencil, Image as ImageIcon, LayoutGrid, ChevronRight, Download } from 'lucide-react';
import { forceDownload } from '../lib/downloadHelper';
import toast from 'react-hot-toast';
import { useCatalog } from '../context/CatalogContext';
import { GalleryItem, GalleryCategory } from '../types';

const uid = () => Math.random().toString(36).slice(2);

// ── Category Form Modal ───────────────────────────────────────────────────────
const CategoryModal: React.FC<{
  existing?: GalleryCategory | null;
  onClose: () => void;
  onDone: () => void;
}> = ({ existing, onClose, onDone }) => {
  const catalogContext = useCatalog();
  const [name, setName] = useState(existing?.name ?? '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Category name is required');
    setSaving(true);
    try {
      if (existing) {
        await catalogContext.updateGalleryCategory(existing.id, name.trim());
        toast.success('Category updated');
      } else {
        await catalogContext.addGalleryCategory(name.trim());
        toast.success('Category created');
      }
      onDone();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} className="fixed inset-0 z-[61] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 relative">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-xl font-bold">{existing ? 'Edit Category' : 'New Category'}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 pointer-events-auto"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">Category Name</label>
              <input autoFocus type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue" placeholder="e.g. Exhibitions" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-50 rounded-xl font-semibold hover:bg-gray-100">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-brand-blue text-white rounded-xl font-semibold flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// ── Image Form Modal ──────────────────────────────────────────────────────────
const ImageModal: React.FC<{
  categoryId: string;
  existing?: GalleryItem | null;
  onClose: () => void;
  onDone: () => void;
}> = ({ categoryId, existing, onClose, onDone }) => {
  const catalogContext = useCatalog();
  const [name, setName] = useState(existing?.name ?? '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(existing?.image_url ?? '');
  const [saving, setSaving] = useState(false);
  const imgRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Image name is required');
    if (!existing && !imageFile && !imagePreview) return toast.error('Image is required');
    setSaving(true);
    try {
      const payload = { category_id: categoryId, name: name.trim(), image_url: imagePreview };
      if (existing) {
        await catalogContext.updateGalleryItem(existing.id, payload, imageFile);
        toast.success('Image updated');
      } else {
        await catalogContext.addGalleryItem(payload, imageFile);
        toast.success('Image uploaded');
      }
      onDone();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} className="fixed inset-0 z-[61] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 relative">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-xl font-bold">{existing ? 'Edit Image' : 'Add Image'}</h3>
            <button type="button" onClick={onClose} className="text-gray-400"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div onClick={() => imgRef.current?.click()} className="relative w-full h-48 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center cursor-pointer overflow-hidden group hover:border-brand-blue/60 transition-all">
              {imagePreview ? (
                <>
                  <img src={imagePreview.startsWith('blob:') ? imagePreview : catalogContext.resolveImageUrl(imagePreview)} className="w-full h-full object-cover" alt="preview" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <span className="text-white text-sm font-semibold flex items-center gap-2"><Upload className="w-4 h-4" /> Change</span>
                    {existing?.image_url && (
                      <button type="button" onClick={(e) => { e.stopPropagation(); forceDownload(catalogContext.resolveImageUrl(existing.image_url), existing.name || 'image.jpg'); }} className="p-2 bg-white/20 hover:bg-white/40 rounded-lg backdrop-blur-sm text-white transition-colors" title="Download Image">
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <Upload className="w-6 h-6 mb-2" />
                  <span className="text-sm font-medium">Click to upload</span>
                </div>
              )}
              <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={e => {
                if (e.target.files?.[0]) {
                  setImageFile(e.target.files[0]);
                  setImagePreview(URL.createObjectURL(e.target.files[0]));
                }
              }} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">Or Direct Image URL / Path</label>
              <input
                type="text"
                value={imagePreview}
                onChange={(e) => {
                  setImageFile(null);
                  setImagePreview(e.target.value);
                }}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue pointer-events-auto text-sm text-gray-900"
                placeholder="e.g. /images/Products/A Type Standie/a-type-1.webp"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">Alt/Hover Text</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue" placeholder="e.g. Main Hall Display Setup" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-50 rounded-xl font-semibold hover:bg-gray-100">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-brand-blue text-white rounded-xl font-semibold flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// ── Main Panel ────────────────────────────────────────────────────────────────
const AdminGalleryPanel: React.FC = () => {
  const catalogContext = useCatalog();
  const { galleryCategories, galleryItems } = catalogContext;
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  
  // Modals
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editCat, setEditCat] = useState<GalleryCategory | null>(null);
  const [imgModalOpen, setImgModalOpen] = useState(false);
  const [editImg, setEditImg] = useState<GalleryItem | null>(null);

  const selectedCategory = galleryCategories.find(c => c.id === selectedCatId);
  const catItems = galleryItems.filter(i => i.category_id === selectedCatId);

  const handleDeleteCategory = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Delete this category and all its images?')) return;
    try {
      await catalogContext.deleteGalleryCategory(id);
      toast.success('Deleted');
      if (selectedCatId === id) setSelectedCatId(null);
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Delete this image?')) return;
    try {
      await catalogContext.deleteGalleryItem(id);
      toast.success('Deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar: Categories */}
      <div className="md:w-1/3">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Portfolios</h2>
          <button onClick={() => { setEditCat(null); setCatModalOpen(true); }} className="p-2 bg-brand-blue/10 text-brand-blue rounded-lg hover:bg-brand-blue/20 transition-colors">
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-2 group/list">
          {galleryCategories.map(cat => (
            <div key={cat.id} onClick={() => setSelectedCatId(cat.id)}
              className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border group/item ${selectedCatId === cat.id ? 'border-brand-blue bg-blue-50 shadow-sm' : 'border-black/5 bg-white hover:border-brand-blue/30'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${selectedCatId === cat.id ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-500'}`}><LayoutGrid className="w-4 h-4" /></div>
                <span className={`font-semibold ${selectedCatId === cat.id ? 'text-brand-blue' : 'text-gray-700'}`}>{cat.name}</span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); setEditCat(cat); setCatModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-brand-blue bg-white rounded shadow-sm border border-black/5"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={(e) => handleDeleteCategory(e, cat.id)} className="p-1.5 text-gray-400 hover:text-red-500 bg-white rounded shadow-sm border border-black/5"><Trash2 className="w-3.5 h-3.5" /></button>
                {selectedCatId !== cat.id && <ChevronRight className="w-4 h-4 text-gray-300 ml-1" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main: Images */}
      <div className="md:w-2/3">
        {!selectedCategory ? (
          <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex flex-col items-center justify-center mb-4"><ImageIcon className="w-8 h-8 text-gray-300" /></div>
            <h3 className="text-lg font-bold text-gray-500">Select a Category</h3>
            <p className="text-sm text-gray-400">Choose a gallery category from the left to manage images.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-black/5 p-6 min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold">{selectedCategory.name} Images</h3>
                <p className="text-sm text-gray-500">{catItems.length} photos in this category</p>
              </div>
              <button onClick={() => { setEditImg(null); setImgModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors">
                <Upload className="w-4 h-4" /> Add Photo
              </button>
            </div>
            {catItems.length === 0 ? (
              <div className="py-12 text-center text-gray-400">No photos yet. Click <span className="font-semibold text-gray-500">Add Photo</span> to begin.</div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {catItems.map(item => (
                  <div key={item.id} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-black/5">
                    <img src={catalogContext.resolveImageUrl(item.image_url)} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                      <p className="text-white text-xs font-semibold mb-2 truncate px-1">{item.name}</p>
                      <div className="flex gap-2">
                        <button onClick={() => forceDownload(catalogContext.resolveImageUrl(item.image_url), item.name || 'image.jpg')} className="flex-1 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white text-xs font-semibold flex justify-center items-center transition-colors" title="Download"><Download className="w-3.5 h-3.5" /></button>
                        <button onClick={() => { setEditImg(item); setImgModalOpen(true); }} className="flex-1 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white text-xs font-semibold flex justify-center items-center transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDeleteItem(item.id)} className="flex-1 py-2 bg-red-500/80 hover:bg-red-500 backdrop-blur-sm rounded-lg text-white text-xs font-semibold flex justify-center items-center transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
           </div>
        )}
      </div>

      {catModalOpen && <CategoryModal existing={editCat} onClose={() => setCatModalOpen(false)} onDone={() => {}} />}
      {imgModalOpen && selectedCatId && <ImageModal categoryId={selectedCatId} existing={editImg} onClose={() => setImgModalOpen(false)} onDone={() => {}} />}
    </div>
  );
};

export default AdminGalleryPanel;
