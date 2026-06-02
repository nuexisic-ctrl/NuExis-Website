import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  X, Plus, Trash2, GripVertical, Upload, FileText,
  Loader2, AlertCircle, Image as ImageIcon, Link, ChevronDown,
  CheckCircle2, Youtube, FilePlus2, Star, Download
} from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { forceDownload } from '../lib/downloadHelper';
import toast from 'react-hot-toast';

// ── Types ─────────────────────────────────────────────────────────────────────
interface SpecRow { id: string; key: string; value: string; }
interface DocItem { id: string; name: string; url: string; file?: File; type: 'catalog' | 'datasheet' | 'brochure' | 'manual' | 'other'; }
interface ImageItem { id: string; url: string; file?: File; preview?: string; uploading?: boolean; }

interface ProductFormData {
  name: string;
  slug: string;
  heading: string;
  short_description: string;
  full_description: string;
  video_url: string;
  cover_image: string;
  images: ImageItem[];
  documents: DocItem[];
  specifications: SpecRow[];
}

export interface ProductData {
  id?: string;
  name: string;
  slug: string | null;
  heading: string | null;
  short_description: string | null;
  full_description: string | null;
  cover_image: string | null;
  video_url: string | null;
  images: string[];
  documents: { id: string; name: string; url: string; type: string }[];
  specifications: { id: string; key: string; value: string }[];
  category_id: string;
  created_at?: string;
}

interface AddProductModalProps {
  categoryId: string;
  categoryName: string;
  existingProduct?: ProductData | null;
  onClose: () => void;
  onSaved: (product: ProductData) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2);
const generateSlug = (n: string) =>
  n.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const sanitizeName = (name: string) => {
  return name.replace(/[^a-zA-Z0-9 _-]/g, '').trim() || 'unnamed';
};

// ── Section Header ─────────────────────────────────────────────────────────────
const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; subtitle?: string }> = ({ icon, title, subtitle }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="w-8 h-8 rounded-lg bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div>
      <h4 className="text-sm font-bold text-gray-900">{title}</h4>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

// ── Image Upload Zone ──────────────────────────────────────────────────────────
const ImageUploadZone: React.FC<{
  images: ImageItem[];
  coverImage: string;
  onChange: (images: ImageItem[]) => void;
  onCoverChange: (url: string) => void;
}> = ({ images, coverImage, onChange, onCoverChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draggingOver, setDraggingOver] = useState(false);

  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const newItems: ImageItem[] = Array.from(files)
      .filter(f => f.type.startsWith('image/'))
      .map(f => ({ id: uid(), url: '', file: f, preview: URL.createObjectURL(f) }));
    onChange([...images, ...newItems]);
  }, [images, onChange]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDraggingOver(false);
    addFiles(e.dataTransfer.files);
  };

  const removeImage = (id: string) => {
    const img = images.find(i => i.id === id);
    if (img?.preview) URL.revokeObjectURL(img.preview);
    const remaining = images.filter(i => i.id !== id);
    onChange(remaining);
    // If removed was the cover, reset cover
    if (coverImage === (img?.url || img?.preview)) {
      onCoverChange(remaining[0]?.url || remaining[0]?.preview || '');
    }
  };

  return (
    <div className="space-y-3">
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setDraggingOver(true); }}
        onDragLeave={() => setDraggingOver(false)}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
          draggingOver ? 'border-brand-blue bg-brand-blue/5 scale-[1.01]' : 'border-gray-200 hover:border-brand-blue/60 hover:bg-gray-50'
        }`}
      >
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => addFiles(e.target.files)} />
        <div className="flex flex-col items-center gap-2">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${draggingOver ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-400'}`}>
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">Drop images here or <span className="text-brand-blue">browse</span></p>
            <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WebP — upload multiple. Click ⭐ to set cover image.</p>
          </div>
        </div>
      </div>

      {/* Direct URL / Relative Path Input */}
      <div className="flex gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-200 items-center">
        <input
          type="text"
          placeholder="Or enter direct image path (e.g. /images/Products/Information Kiosk/1.webp)"
          id="direct-image-url-input"
          className="flex-1 px-4 py-2 border border-gray-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const btn = document.getElementById('add-direct-url-btn');
              if (btn) btn.click();
            }
          }}
        />
        <button
          type="button"
          id="add-direct-url-btn"
          onClick={() => {
            const input = document.getElementById('direct-image-url-input') as HTMLInputElement;
            if (input && input.value.trim()) {
              const val = input.value.trim();
              const newItem = { id: uid(), url: val, preview: val };
              onChange([...images, newItem]);
              if (!coverImage) {
                onCoverChange(val);
              }
              input.value = '';
            }
          }}
          className="px-4 py-2 bg-brand-blue text-white rounded-xl text-xs font-semibold hover:bg-blue-600 transition-colors whitespace-nowrap"
        >
          Add Path
        </button>
      </div>

      {images.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 mb-2 flex items-center gap-1.5">
            <GripVertical className="w-3.5 h-3.5" /> Drag to reorder · Click ⭐ to set as cover
          </p>
          <Reorder.Group axis="x" values={images} onReorder={onChange} className="flex flex-wrap gap-2">
            {images.map((img, idx) => {
              const src = img.preview || img.url;
              const isCover = coverImage === src || coverImage === img.url;
              return (
                <Reorder.Item key={img.id} value={img} className="relative group">
                  <div
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 cursor-grab active:cursor-grabbing transition-all ${isCover ? 'border-amber-400 shadow-md shadow-amber-200' : 'border-gray-200'}`}
                    onClick={() => onCoverChange(src)}
                    title="Set as cover image"
                  >
                    <img src={src} alt={`img ${idx + 1}`} className="w-full h-full object-cover" />
                    {isCover && (
                      <div className="absolute top-1 left-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center shadow">
                        <Star className="w-3 h-3 text-white fill-white" />
                      </div>
                    )}
                    {img.uploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); removeImage(img.id); }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); forceDownload(src, 'product-image.jpg'); }}
                    className="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-brand-blue text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    title="Download"
                  >
                    <Download className="w-2.5 h-2.5" />
                  </button>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        </div>
      )}
    </div>
  );
};

// ── Specs Editor ───────────────────────────────────────────────────────────────
const SpecsEditor: React.FC<{ specs: SpecRow[]; onChange: (specs: SpecRow[]) => void }> = ({ specs, onChange }) => {
  const add = () => onChange([...specs, { id: uid(), key: '', value: '' }]);
  const remove = (id: string) => onChange(specs.filter(s => s.id !== id));
  const update = (id: string, field: 'key' | 'value', val: string) =>
    onChange(specs.map(s => s.id === id ? { ...s, [field]: val } : s));

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {specs.map((spec, i) => (
          <motion.div key={spec.id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="flex items-center gap-2 group">
            <span className="w-5 text-xs text-gray-300 font-mono text-right shrink-0">{i + 1}</span>
            <input type="text" value={spec.key} onChange={e => update(spec.id, 'key', e.target.value)} placeholder="e.g. Display Size"
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all" />
            <span className="text-gray-300 font-bold">→</span>
            <input type="text" value={spec.value} onChange={e => update(spec.id, 'value', e.target.value)} placeholder='e.g. 55"'
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all" />
            <button type="button" onClick={() => remove(spec.id)} className="w-7 h-7 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
      {specs.length === 0 && (
        <div className="text-center py-6 text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
          No specifications yet — click <span className="font-semibold text-gray-600">Add Row</span> to start
        </div>
      )}
      <button type="button" onClick={add} className="flex items-center gap-2 text-sm font-medium text-brand-blue hover:text-blue-700 transition-colors mt-1">
        <Plus className="w-4 h-4" /> Add Row
      </button>
    </div>
  );
};

// ── Documents Section ──────────────────────────────────────────────────────────
const DOC_TYPES = ['catalog', 'datasheet', 'brochure', 'manual', 'other'] as const;

const DocumentsSection: React.FC<{
  docs: DocItem[]; onChange: (docs: DocItem[]) => void;
  uploadingDoc: boolean; onUpload: (file: File) => Promise<void>;
}> = ({ docs, onChange, uploadingDoc, onUpload }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const update = (id: string, field: keyof DocItem, val: string) =>
    onChange(docs.map(d => d.id === id ? { ...d, [field]: val } : d));
  const remove = (id: string) => onChange(docs.filter(d => d.id !== id));

  return (
    <div className="space-y-3">
      {docs.map(doc => (
        <motion.div key={doc.id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200 group">
          <FileText className="w-4 h-4 text-gray-400 shrink-0" />
          <input type="text" value={doc.name} onChange={e => update(doc.id, 'name', e.target.value)} placeholder="Document name"
            className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none" />
          <select value={doc.type} onChange={e => update(doc.id, 'type', e.target.value as DocItem['type'])}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-600 focus:outline-none capitalize">
            {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <button type="button" onClick={() => forceDownload(doc.url, `${doc.name}.pdf`)} className="text-brand-blue hover:text-blue-700" title="Download">
            <Download className="w-4 h-4" />
          </button>
          <a href={doc.url} target="_blank" rel="noreferrer" className="text-brand-blue hover:text-blue-700" title="Open Link">
            <Link className="w-4 h-4" />
          </a>
          <button type="button" onClick={() => remove(doc.id)} className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      ))}
      <input ref={inputRef} type="file" accept="application/pdf" className="hidden"
        onChange={async e => { const f = e.target.files?.[0]; if (f) { await onUpload(f); e.target.value = ''; } }} />
      <button type="button" onClick={() => inputRef.current?.click()} disabled={uploadingDoc}
        className="flex items-center gap-2 text-sm font-medium text-brand-blue hover:text-blue-700 transition-colors disabled:opacity-60">
        {uploadingDoc ? <Loader2 className="w-4 h-4 animate-spin" /> : <FilePlus2 className="w-4 h-4" />}
        Upload PDF Document
      </button>
    </div>
  );
};

// ── Main Modal ────────────────────────────────────────────────────────────────
const AddProductModal: React.FC<AddProductModalProps> = ({ categoryId, categoryName, existingProduct, onClose, onSaved }) => {
  const catalogContext = useCatalog();
  const isEditing = !!existingProduct?.id;

  const [form, setForm] = useState<ProductFormData>(() => {
    if (existingProduct) {
      return {
        name: existingProduct.name,
        slug: existingProduct.slug ?? '',
        heading: existingProduct.heading ?? '',
        short_description: existingProduct.short_description ?? '',
        full_description: existingProduct.full_description ?? '',
        video_url: existingProduct.video_url ?? '',
        cover_image: existingProduct.cover_image ?? existingProduct.images?.[0] ?? '',
        images: (existingProduct.images ?? []).map(url => ({ id: uid(), url, preview: url })),
        documents: (existingProduct.documents ?? []).map(d => ({ ...d, id: d.id || uid() })) as DocItem[],
        specifications: (existingProduct.specifications ?? []).map(s => ({ ...s, id: s.id || uid() })) as SpecRow[],
      };
    }
    return { name: '', slug: '', heading: '', short_description: '', full_description: '', video_url: '', cover_image: '', images: [], documents: [], specifications: [] };
  });

  const [autoSlug, setAutoSlug] = useState(!existingProduct?.slug);
  const [saving, setSaving] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'basic' | 'media' | 'docs' | 'specs'>('basic');

  useEffect(() => { document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = ''; }; }, []);

  const setField = <K extends keyof ProductFormData>(key: K, val: ProductFormData[K]) =>
    setForm(f => ({ ...f, [key]: val }));

  const handleNameChange = (val: string) => {
    setField('name', val);
    if (autoSlug) setField('slug', generateSlug(val));
  };

  const handleDocUpload = async (file: File) => {
    setUploadingDoc(true);
    try {
      const ext = file.name.split('.').pop() || 'pdf';
      const path = `/images/products/${sanitizeName(categoryName)}/${sanitizeName(form.name || 'product')}/media/${sanitizeName(file.name.replace(/\.[^/.]+$/, ''))}.${ext}`;
      
      setForm(f => ({
        ...f,
        documents: [
          ...f.documents,
          {
            id: uid(),
            name: file.name.replace(/\.[^/.]+$/, ''),
            url: path,
            file: file,
            type: 'catalog'
          }
        ]
      }));
      toast.success('Document added locally');
    } catch { 
      toast.error('Document add failed'); 
    } finally { 
      setUploadingDoc(false); 
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Product name is required.'); return; }
    if (!form.slug.trim()) { setError('Product slug is required.'); return; }
    setError(null); setSaving(true);

    try {
      let coverImageFile: File | null = null;
      if (form.cover_image && form.cover_image.startsWith('blob:')) {
        const matched = form.images.find(img => img.preview === form.cover_image);
        if (matched?.file) {
          coverImageFile = matched.file;
        }
      }

      const galleryImages: (File | string)[] = form.images.map(img => {
        if (img.file) return img.file;
        return img.url;
      });

      const docFiles = form.documents.map(d => ({
        id: d.id,
        name: d.name,
        file: d.file || null,
        url: d.url,
        type: d.type
      }));

      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        heading: form.heading.trim() || null,
        short_description: form.short_description.trim() || null,
        full_description: form.full_description.trim() || null,
        video_url: form.video_url.trim() || null,
        cover_image: form.cover_image, // context mutation will map this to path
        images: [],
        documents: [],
        specifications: form.specifications.filter(s => s.key.trim()),
        category_id: categoryId
      };

      let saved: ProductData;
      if (isEditing && existingProduct?.id) {
        saved = await catalogContext.updateProduct(existingProduct.id, payload, coverImageFile, galleryImages, docFiles) as ProductData;
      } else {
        saved = await catalogContext.addProduct(payload, coverImageFile, galleryImages, docFiles) as ProductData;
      }

      toast.success(isEditing ? 'Product updated!' : 'Product created!');
      onSaved(saved);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to save product.';
      setError(msg); toast.error(msg);
    } finally { setSaving(false); }
  };

  const SECTIONS = [
    { id: 'basic', label: 'Basic Info' }, { id: 'media', label: 'Media' },
    { id: 'docs', label: 'Documents' }, { id: 'specs', label: 'Specifications' },
  ] as const;

  return (
    <AnimatePresence>
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 340, damping: 30 }}
          className="fixed inset-0 z-[61] flex items-center justify-center p-4"
          onClick={e => e.stopPropagation()}
        >
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
            <div className="h-1 w-full bg-gradient-to-r from-brand-blue via-blue-400 to-cyan-400 shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between px-7 pt-5 pb-4 border-b border-gray-100 shrink-0">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{isEditing ? 'Edit Product' : 'Add Product'}</h3>
                <p className="text-sm text-gray-400 mt-0.5">Category: <span className="font-medium text-gray-600">{categoryName}</span></p>
              </div>
              <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"><X className="w-5 h-5" /></button>
            </div>

            {/* Tabs */}
            <div className="flex gap-0.5 px-7 pt-3 shrink-0">
              {SECTIONS.map(s => (
                <button key={s.id} type="button" onClick={() => setActiveSection(s.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeSection === s.id ? 'bg-brand-blue text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
                  {s.label}
                </button>
              ))}
            </div>

            {/* Form Body */}
            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-7 py-5">
                <AnimatePresence mode="wait">

                  {activeSection === 'basic' && (
                    <motion.div key="basic" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                      <SectionHeader icon={<FileText className="w-4 h-4" />} title="Basic Information" />

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Product Name <span className="text-red-500">*</span></label>
                        <input type="text" value={form.name} onChange={e => handleNameChange(e.target.value)} placeholder="e.g. NX-DS550 Digital Signage Display"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue transition-all" />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">URL Slug <span className="text-red-500">*</span></label>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center flex-1 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden focus-within:ring-2 focus-within:ring-brand-blue/40 focus-within:border-brand-blue transition-all">
                            <span className="px-3 text-sm text-gray-400 border-r border-gray-200 shrink-0">/product/</span>
                            <input type="text" value={form.slug} onChange={e => { setAutoSlug(false); setField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')); }}
                              placeholder="product-slug" className="flex-1 px-3 py-3 text-sm text-gray-900 bg-transparent focus:outline-none font-mono" />
                          </div>
                          <button type="button" onClick={() => { setAutoSlug(true); setField('slug', generateSlug(form.name)); }}
                            className="px-3 py-2.5 text-xs text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors whitespace-nowrap">↺ Auto</button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Heading / Title</label>
                        <input type="text" value={form.heading} onChange={e => setField('heading', e.target.value)} placeholder="e.g. Professional 4K Digital Signage Solution"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue transition-all" />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Short Description</label>
                        <textarea value={form.short_description} onChange={e => setField('short_description', e.target.value)}
                          placeholder="2–3 lines visible on product cards…" rows={3}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue transition-all resize-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Full Description</label>
                        <textarea value={form.full_description} onChange={e => setField('full_description', e.target.value)}
                          placeholder="Detailed product overview…" rows={6}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue transition-all resize-y" />
                      </div>
                    </motion.div>
                  )}

                  {activeSection === 'media' && (
                    <motion.div key="media" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                      <div>
                        <SectionHeader icon={<ImageIcon className="w-4 h-4" />} title="Product Images" subtitle="Upload images. Click ⭐ to set the cover image shown on cards." />
                        <ImageUploadZone images={form.images} coverImage={form.cover_image}
                          onChange={imgs => setField('images', imgs)}
                          onCoverChange={url => setField('cover_image', url)} />
                      </div>
                      <div className="border-t border-gray-100 pt-5">
                        <SectionHeader icon={<Youtube className="w-4 h-4" />} title="Product Video" subtitle="Optional YouTube or video URL" />
                        <div className="flex items-center gap-2">
                          <div className="flex-1 relative">
                            <Link className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="url" value={form.video_url} onChange={e => setField('video_url', e.target.value)} placeholder="https://youtube.com/watch?v=..."
                              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue transition-all" />
                          </div>
                        </div>
                        {form.video_url && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-2 text-sm text-gray-600">
                            <Youtube className="w-4 h-4 text-red-500 shrink-0" />
                            <span className="truncate">{form.video_url}</span>
                            <button type="button" onClick={() => setField('video_url', '')} className="ml-auto text-gray-300 hover:text-gray-600"><X className="w-4 h-4" /></button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {activeSection === 'docs' && (
                    <motion.div key="docs" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                      <SectionHeader icon={<FileText className="w-4 h-4" />} title="Documents" subtitle="Catalogs, datasheets, brochures — PDF only" />
                      <DocumentsSection docs={form.documents} onChange={docs => setField('documents', docs)} uploadingDoc={uploadingDoc} onUpload={handleDocUpload} />
                    </motion.div>
                  )}

                  {activeSection === 'specs' && (
                    <motion.div key="specs" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                      <SectionHeader icon={<ChevronDown className="w-4 h-4" />} title="Specifications" subtitle='Add technical key-value pairs (e.g. Resolution → 4K)' />
                      <SpecsEditor specs={form.specifications} onChange={specs => setField('specifications', specs)} />
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="px-7 py-4 border-t border-gray-100 bg-gray-50/80 shrink-0">
                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-3">
                      <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                    </motion.div>
                  )}
                  {uploadProgress && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl px-4 py-3 text-sm mb-3">
                      <Loader2 className="w-4 h-4 shrink-0 animate-spin" /> {uploadProgress}
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {SECTIONS.map(s => (
                      <button key={s.id} type="button" onClick={() => setActiveSection(s.id)} title={s.label}
                        className={`transition-all rounded-full ${activeSection === s.id ? 'w-6 h-2.5 bg-brand-blue' : 'w-2.5 h-2.5 bg-gray-200 hover:bg-gray-300'}`} />
                    ))}
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors">Cancel</button>
                    <button type="submit" disabled={saving || !form.name.trim() || !form.slug.trim()}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-blue text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-md shadow-brand-blue/25">
                      {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><CheckCircle2 className="w-4 h-4" /> {isEditing ? 'Update' : 'Save Product'}</>}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
};

export default AddProductModal;
