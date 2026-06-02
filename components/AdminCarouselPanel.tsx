import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Loader2, Upload, Trash2, Pencil, Image as ImageIcon, Download } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { forceDownload } from '../lib/downloadHelper';
import toast from 'react-hot-toast';

// Inline type
export interface CarouselImage {
  id: string;
  name: string;
  image_url: string;
  created_at: string;
}

const uid = () => Math.random().toString(36).slice(2);
function getPublicUrl(bucket: string, path: string) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `logos/${Date.now()}-${uid()}.${ext}`;
  const { error } = await supabase.storage.from('carousel-images').upload(path, file, { upsert: false });
  if (error) throw new Error(error.message);
  return getPublicUrl('carousel-images', path);
}

const CarouselModal: React.FC<{
  existing?: CarouselImage | null;
  onClose: () => void;
  onDone: () => void;
}> = ({ existing, onClose, onDone }) => {
  const isEdit = !!existing;
  const [name, setName] = useState(existing?.name ?? '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(existing?.image_url ?? '');
  const [uploading, setUploading] = useState(false);
  const imgRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Name is required.');
    if (!isEdit && !imageFile && !imagePreview) return toast.error('Image is required.');

    setUploading(true);
    try {
      let image_url = existing?.image_url ?? '';
      if (imageFile) {
        image_url = await uploadImage(imageFile);
      }

      const payload = { name: name.trim(), image_url };

      if (isEdit && existing?.id) {
        const { error } = await supabase.from('carousel_images').update(payload).eq('id', existing.id);
        if (error) throw error;
        toast.success('Carousel image updated!');
      } else {
        const { error } = await supabase.from('carousel_images').insert(payload);
        if (error) throw error;
        toast.success('Carousel image added!');
      }

      onDone();
      onClose();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save carousel image.');
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
                <h3 className="text-xl font-bold">{isEdit ? 'Edit Logo' : 'Add Logo'}</h3>
                <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700 pointer-events-auto"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">Image / Logo (Transparent PNG recommended)</label>
                  <div onClick={() => imgRef.current?.click()} className="relative w-full h-36 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center cursor-pointer overflow-hidden group hover:border-brand-blue/60 transition-all pointer-events-auto">
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} className="w-full h-full object-contain p-4" alt="preview" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <span className="text-white text-sm font-semibold flex items-center gap-2"><Upload className="w-4 h-4" /> Change</span>
                          {existing?.image_url && (
                             <button type="button" onClick={(e) => { e.stopPropagation(); forceDownload(existing.image_url, existing.name || 'image.png'); }} className="p-2 bg-white/20 hover:bg-white/40 rounded-lg backdrop-blur-sm text-white transition-colors" title="Download Image">
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
                    placeholder="e.g. /images/Logos/partner-logo.png"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">Company Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue pointer-events-auto" placeholder="e.g. ACMA Mobility Foundation" />
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

const AdminCarouselPanel: React.FC = () => {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingImg, setEditingImg] = useState<CarouselImage | null>(null);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    // Order by created_at ascending so they appear in inserted order
    const { data } = await supabase.from('carousel_images').select('*').order('created_at', { ascending: true });
    if (data) setImages(data as CarouselImage[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!confirm('Are you sure you want to delete this logo?')) return;
    
    // Optionally remove from storage or just from DB. Keeping it simple: remove from DB.
    // Real-world, you'd extract the path from 'imageUrl' and delete from storage bucket.
    const { error } = await supabase.from('carousel_images').delete().eq('id', id);
    if (error) {
       toast.error('Failed to delete');
    } else { 
       toast.success('Deleted successfully'); 
       fetchImages(); 
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Carousel Uploads</h2>
        <button onClick={() => { setEditingImg(null); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue text-white rounded-xl hover:bg-blue-700 font-semibold text-sm">
          <Plus className="w-4 h-4" /> Add Logo
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-brand-blue" /></div>
        ) : images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <ImageIcon className="w-10 h-10 mb-3 opacity-50" />
            <p>No logos added yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-black/5">
             <div className="grid grid-cols-[100px_1fr_auto] gap-4 px-6 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <span>Preview</span><span>Name / Alt text</span><span>Actions</span>
             </div>
             {images.map(img => (
               <div key={img.id} className="grid grid-cols-[100px_1fr_auto] gap-4 px-6 py-4 items-center hover:bg-blue-50/30 transition-colors">
                 <div className="w-20 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-black/5 flex items-center justify-center p-2">
                   <img src={img.image_url} alt={img.name} className="w-full h-full object-contain" />
                 </div>
                 <span className="font-semibold text-gray-900">{img.name}</span>
                 <div className="flex items-center gap-2">
                   <button onClick={() => forceDownload(img.image_url, img.name || 'image.png')} className="p-2 text-gray-400 hover:text-brand-blue bg-white border border-gray-200 shadow-sm rounded-lg transition-colors" title="Download"><Download className="w-4 h-4" /></button>
                   <button onClick={() => { setEditingImg(img); setShowModal(true); }} className="p-2 text-gray-400 hover:text-brand-blue bg-white border border-gray-200 shadow-sm rounded-lg transition-colors" title="Edit"><Pencil className="w-4 h-4" /></button>
                   <button onClick={() => handleDelete(img.id, img.image_url)} className="p-2 text-gray-400 hover:text-red-500 bg-white border border-gray-200 shadow-sm rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                 </div>
               </div>
             ))}
          </div>
        )}
      </div>

      {showModal && <CarouselModal existing={editingImg} onClose={() => setShowModal(false)} onDone={fetchImages} />}
    </div>
  );
};

export default AdminCarouselPanel;
