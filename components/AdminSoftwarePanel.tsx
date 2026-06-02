import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Loader2, Upload, Trash2, Pencil, Image as ImageIcon, Download } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { forceDownload } from '../lib/downloadHelper';
import toast from 'react-hot-toast';
import { Software } from '../types';

const uid = () => Math.random().toString(36).slice(2);

const SoftwareModal: React.FC<{
  existing?: Software | null;
  onClose: () => void;
  onDone: () => void;
}> = ({ existing, onClose, onDone }) => {
  const catalogContext = useCatalog();
  const isEdit = !!existing;
  const [name, setName] = useState(existing?.name ?? '');
  const [forwardUrl, setForwardUrl] = useState(existing?.forward_url ?? '#');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(existing?.image_url ?? '');
  const [imageFit, setImageFit] = useState<string>(existing?.image_fit ?? 'cover');
  const [uploading, setUploading] = useState(false);
  const imgRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Name is required.');
    if (!forwardUrl.trim()) return toast.error('Forward URL is required.');
    if (!isEdit && !imageFile && !imagePreview) return toast.error('Image is required.');

    setUploading(true);
    try {
      const payload = { name: name.trim(), forward_url: forwardUrl.trim(), image_url: imagePreview, image_fit: imageFit };

      if (isEdit && existing?.id) {
        await catalogContext.updateSoftware(existing.id, payload, imageFile);
        toast.success('Software updated!');
      } else {
        await catalogContext.addSoftware(payload, imageFile);
        toast.success('Software added!');
      }

      onDone();
      onClose();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save software.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <AnimatePresence>
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <motion.div initial={{ opacity: 0, scale: 0.94, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94 }} className="fixed inset-0 z-[61] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl relative z-[62]">
            <div className="px-7 py-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-bold">{isEdit ? 'Edit Software' : 'Add Software'}</h3>
                <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700 pointer-events-auto"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">Image</label>
                  <div onClick={() => imgRef.current?.click()} className="relative w-full h-36 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center cursor-pointer overflow-hidden group hover:border-brand-blue/60 transition-all pointer-events-auto">
                    {imagePreview ? (
                      <>
                        <img src={imagePreview.startsWith('blob:') ? imagePreview : catalogContext.resolveImageUrl(imagePreview)} className="w-full h-full" style={{ objectFit: imageFit as any }} alt="preview" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <span className="text-white text-sm font-semibold flex items-center gap-2"><Upload className="w-4 h-4" /> Change</span>
                          {existing?.image_url && (
                            <button type="button" onClick={(e) => { e.stopPropagation(); forceDownload(catalogContext.resolveImageUrl(existing.image_url), existing.name || 'image.png'); }} className="p-2 bg-white/20 hover:bg-white/40 rounded-lg backdrop-blur-sm text-white transition-colors" title="Download Image">
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </>
                    ) : (
                       <div className="flex flex-col items-center gap-2 text-gray-400">
                        <Upload className="w-5 h-5" />
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
                    placeholder="e.g. /images/software-dropdown/NuExis Signage.webp"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">Image Fit</label>
                  <select value={imageFit} onChange={e => setImageFit(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue pointer-events-auto bg-white">
                    <option value="cover">Cover (Fill box, crop edges)</option>
                    <option value="contain">Contain (Fit inside box completely)</option>
                    <option value="fill">Fill (Stretch to fit)</option>
                    <option value="scale-down">Scale Down (Original or Contain)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue pointer-events-auto" placeholder="Software Name" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">Forward Link</label>
                  <input type="text" value={forwardUrl} onChange={e => setForwardUrl(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue pointer-events-auto" placeholder="https://..." />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-50 rounded-xl font-semibold hover:bg-gray-100 pointer-events-auto">Cancel</button>
                  <button type="submit" disabled={uploading} className="flex-1 py-2.5 bg-brand-blue text-white rounded-xl font-semibold hover:bg-blue-700 flex items-center justify-center gap-2 pointer-events-auto">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : isEdit ? 'Update' : 'Add'}
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

const AdminSoftwarePanel: React.FC = () => {
  const catalogContext = useCatalog();
  const [softwares, setSoftwares] = useState<Software[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSoft, setEditingSoft] = useState<Software | null>(null);

  const fetchSoftwares = useCallback(() => {
    setLoading(true);
    setSoftwares(catalogContext.softwares);
    setLoading(false);
  }, [catalogContext.softwares]);

  useEffect(() => { fetchSoftwares(); }, [fetchSoftwares]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this software?')) return;
    try {
      await catalogContext.deleteSoftware(id);
      toast.success('Deleted successfully');
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Software Solutions</h2>
        <button onClick={() => { setEditingSoft(null); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue text-white rounded-xl hover:bg-blue-700 font-semibold text-sm">
          <Plus className="w-4 h-4" /> Add Software
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-brand-blue" /></div>
        ) : softwares.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <ImageIcon className="w-10 h-10 mb-3 opacity-50" />
            <p>No software added yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-black/5">
             <div className="grid grid-cols-[80px_1fr_1fr_auto] gap-4 px-6 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <span>Image</span><span>Name</span><span>Link</span><span>Actions</span>
             </div>
             {softwares.map(soft => (
               <div key={soft.id} className="grid grid-cols-[80px_1fr_1fr_auto] gap-4 px-6 py-4 items-center hover:bg-blue-50/30 transition-colors">
                 <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-black/5">
                   <img src={catalogContext.resolveImageUrl(soft.image_url)} alt={soft.name} className="w-full h-full object-cover" />
                 </div>
                 <span className="font-semibold text-gray-900">{soft.name}</span>
                 <a href={soft.forward_url} target="_blank" rel="noreferrer" className="text-sm text-brand-blue hover:underline truncate">{soft.forward_url}</a>
                 <div className="flex items-center gap-2">
                   <button onClick={() => forceDownload(catalogContext.resolveImageUrl(soft.image_url), soft.name || 'software.png')} className="p-2 text-gray-400 hover:text-brand-blue bg-white border border-gray-200 shadow-sm rounded-lg transition-colors" title="Download"><Download className="w-4 h-4" /></button>
                   <button onClick={() => { setEditingSoft(soft); setShowModal(true); }} className="p-2 text-gray-400 hover:text-brand-blue bg-white border border-gray-200 shadow-sm rounded-lg transition-colors" title="Edit"><Pencil className="w-4 h-4" /></button>
                   <button onClick={() => handleDelete(soft.id)} className="p-2 text-gray-400 hover:text-red-500 bg-white border border-gray-200 shadow-sm rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                 </div>
               </div>
             ))}
          </div>
        )}
      </div>

      {showModal && <SoftwareModal existing={editingSoft} onClose={() => setShowModal(false)} onDone={fetchSoftwares} />}
    </div>
  );
};

export default AdminSoftwarePanel;
