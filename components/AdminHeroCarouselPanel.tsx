import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Loader2, Upload, Trash2, Pencil, Image as ImageIcon, Download } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { forceDownload } from '../lib/downloadHelper';
import toast from 'react-hot-toast';

export interface HeroSlideRecord {
  id: string;
  title: string;
  subtitle: string;
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
  const path = `hero/${Date.now()}-${uid()}.${ext}`;
  const { error } = await supabase.storage.from('carousel-images').upload(path, file, { upsert: false });
  if (error) throw new Error(error.message);
  return getPublicUrl('carousel-images', path);
}

const HeroCarouselModal: React.FC<{
  existing?: HeroSlideRecord | null;
  onClose: () => void;
  onDone: () => void;
}> = ({ existing, onClose, onDone }) => {
  const isEdit = !!existing;
  const [title, setTitle] = useState(existing?.title ?? '');
  const [subtitle, setSubtitle] = useState(existing?.subtitle ?? '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(existing?.image_url ?? '');
  const [uploading, setUploading] = useState(false);
  const imgRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return toast.error('Title is required.');
    if (!subtitle.trim()) return toast.error('Subtitle is required.');
    if (!isEdit && !imageFile && !imagePreview) return toast.error('Image is required.');

    setUploading(true);
    try {
      let image_url = existing?.image_url ?? '';
      if (imageFile) {
        image_url = await uploadImage(imageFile);
      }

      const payload = { title: title.trim(), subtitle: subtitle.trim(), image_url };

      if (isEdit && existing?.id) {
        const { error } = await supabase.from('hero_carousel').update(payload).eq('id', existing.id);
        if (error) throw error;
        toast.success('Slide updated!');
      } else {
        const { error } = await supabase.from('hero_carousel').insert(payload);
        if (error) throw error;
        toast.success('Slide added!');
      }

      onDone();
      onClose();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save slide.');
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
                <h3 className="text-xl font-bold">{isEdit ? 'Edit Slide' : 'Add Slide'}</h3>
                <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700 pointer-events-auto"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">Image</label>
                  <div onClick={() => imgRef.current?.click()} className="relative w-full h-36 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center cursor-pointer overflow-hidden group hover:border-brand-blue/60 transition-all pointer-events-auto">
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} className="w-full h-full object-cover" alt="preview" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <span className="text-white text-sm font-semibold flex items-center gap-2"><Upload className="w-4 h-4" /> Change</span>
                          {existing?.image_url && (
                             <button type="button" onClick={(e) => { e.stopPropagation(); forceDownload(existing.image_url, existing.title || 'slide_image.png'); }} className="p-2 bg-white/20 hover:bg-white/40 rounded-lg backdrop-blur-sm text-white transition-colors" title="Download Image">
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
                    placeholder="e.g. /images/coursel/Professional AV solution.webp"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">Title</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue pointer-events-auto" placeholder="e.g. Pro AV Solutions" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">Subtitle</label>
                  <textarea value={subtitle} onChange={e => setSubtitle(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue pointer-events-auto" placeholder="e.g. Empower your meetings..." rows={3} />
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

const AdminHeroCarouselPanel: React.FC = () => {
  const [slides, setSlides] = useState<HeroSlideRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlideRecord | null>(null);

  const fetchSlides = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('hero_carousel').select('*').order('created_at', { ascending: true });
    if (data) setSlides(data as HeroSlideRecord[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchSlides(); }, [fetchSlides]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this slide?')) return;
    
    const { error } = await supabase.from('hero_carousel').delete().eq('id', id);
    if (error) {
       toast.error('Failed to delete');
    } else { 
       toast.success('Deleted successfully'); 
       fetchSlides(); 
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Landing Page Carousel</h2>
        <button onClick={() => { setEditingSlide(null); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue text-white rounded-xl hover:bg-blue-700 font-semibold text-sm">
          <Plus className="w-4 h-4" /> Add Slide
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-brand-blue" /></div>
        ) : slides.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <ImageIcon className="w-10 h-10 mb-3 opacity-50" />
            <p>No slides added yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-black/5">
             <div className="grid grid-cols-[120px_1fr_auto] gap-4 px-6 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <span>Image</span><span>Details</span><span>Actions</span>
             </div>
             {slides.map(slide => (
               <div key={slide.id} className="grid grid-cols-[120px_1fr_auto] gap-4 px-6 py-4 items-center hover:bg-blue-50/30 transition-colors">
                 <div className="w-24 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-black/5 flex items-center justify-center">
                   <img src={slide.image_url} alt={slide.title} className="w-full h-full object-cover" />
                 </div>
                 <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-gray-900 truncate">{slide.title}</span>
                    <span className="text-sm text-gray-500 truncate mt-0.5 max-w-sm">{slide.subtitle}</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <button onClick={() => forceDownload(slide.image_url, slide.title || 'slide_image.png')} className="p-2 text-gray-400 hover:text-brand-blue bg-white border border-gray-200 shadow-sm rounded-lg transition-colors" title="Download"><Download className="w-4 h-4" /></button>
                   <button onClick={() => { setEditingSlide(slide); setShowModal(true); }} className="p-2 text-gray-400 hover:text-brand-blue bg-white border border-gray-200 shadow-sm rounded-lg transition-colors" title="Edit"><Pencil className="w-4 h-4" /></button>
                   <button onClick={() => handleDelete(slide.id)} className="p-2 text-gray-400 hover:text-red-500 bg-white border border-gray-200 shadow-sm rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                 </div>
               </div>
             ))}
          </div>
        )}
      </div>

      {showModal && <HeroCarouselModal existing={editingSlide} onClose={() => setShowModal(false)} onDone={fetchSlides} />}
    </div>
  );
};

export default AdminHeroCarouselPanel;
