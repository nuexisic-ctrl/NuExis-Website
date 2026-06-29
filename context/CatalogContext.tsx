import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { Software, GalleryCategory, GalleryItem } from '../types';
import { supabase } from '../lib/supabaseClient';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  show_in_navbar: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string | null;
  heading: string | null;
  short_description: string | null;
  full_description: string | null;
  cover_image: string | null;
  images: string[];
  video_url: string | null;
  documents: { id: string; name: string; url: string; type: string }[];
  specifications: { id: string; key: string; value: string }[];
  category_id: string;
  created_at: string;
  updated_at: string | null;
}

export interface HeroSlideRecord {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  created_at: string;
}

export interface CarouselImage {
  id: string;
  name: string;
  image_url: string;
  created_at: string;
}

interface CatalogContextType {
  categories: Category[];
  products: Product[];
  softwares: Software[];
  galleryCategories: GalleryCategory[];
  galleryItems: GalleryItem[];
  heroSlides: HeroSlideRecord[];
  partnerLogos: CarouselImage[];
  pendingFiles: Record<string, File>;
  loading: boolean;
  
  getCategoryBySlug: (slug: string) => Category | undefined;
  getProductsByCategory: (categoryId: string) => Product[];
  getProductBySlug: (categoryId: string, productSlug: string) => Product | undefined;
  navCategories: Category[];
  
  resolveImageUrl: (url: string | null) => string;
  
  addCategory: (cat: Omit<Category, 'id' | 'created_at'>, file?: File | null) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Category>, file?: File | null) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;

  addProduct: (
    prod: Omit<Product, 'id' | 'created_at' | 'updated_at'>, 
    coverImage?: File | null, 
    galleryImages?: (File | string)[], 
    documents?: { id: string; name: string; file: File | null; url: string; type: string }[]
  ) => Promise<Product>;
  updateProduct: (
    id: string, 
    updates: Partial<Product>, 
    coverImage?: File | null, 
    galleryImages?: (File | string)[], 
    documents?: { id: string; name: string; file: File | null; url: string; type: string }[]
  ) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;

  addSoftware: (soft: Omit<Software, 'id' | 'created_at'>, file?: File | null) => Promise<Software>;
  updateSoftware: (id: string, updates: Partial<Software>, file?: File | null) => Promise<Software>;
  deleteSoftware: (id: string) => Promise<void>;

  addGalleryCategory: (name: string) => Promise<GalleryCategory>;
  updateGalleryCategory: (id: string, name: string) => Promise<GalleryCategory>;
  deleteGalleryCategory: (id: string) => Promise<void>;

  addGalleryItem: (item: Omit<GalleryItem, 'id' | 'created_at'>, file?: File | null) => Promise<GalleryItem>;
  updateGalleryItem: (id: string, updates: Partial<GalleryItem>, file?: File | null) => Promise<GalleryItem>;
  deleteGalleryItem: (id: string) => Promise<void>;

  addHeroSlide: (slide: Omit<HeroSlideRecord, 'id' | 'created_at'>, file?: File | null) => Promise<HeroSlideRecord>;
  updateHeroSlide: (id: string, updates: Partial<HeroSlideRecord>, file?: File | null) => Promise<HeroSlideRecord>;
  deleteHeroSlide: (id: string) => Promise<void>;

  addPartnerLogo: (logo: Omit<CarouselImage, 'id' | 'created_at'>, file?: File | null) => Promise<CarouselImage>;
  updatePartnerLogo: (id: string, updates: Partial<CarouselImage>, file?: File | null) => Promise<CarouselImage>;
  deletePartnerLogo: (id: string) => Promise<void>;

  refreshCategories: () => Promise<void>;
  refreshProducts: () => Promise<void>;
  refreshSoftwares: () => Promise<void>;
  refreshGallery: () => Promise<void>;
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

const sanitizeName = (name: string) => name.replace(/[^a-zA-Z0-9 _-]/g, '').trim() || 'unnamed';

const SUPABASE_STORAGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/assets`;

async function uploadFile(file: File, path: string): Promise<string> {
  const { error } = await supabase.storage.from('assets').upload(path, file, { upsert: true });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  return `${SUPABASE_STORAGE_URL}/${path}`;
}

export const CatalogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [softwares, setSoftwares] = useState<Software[]>([]);
  const [galleryCategories, setGalleryCategories] = useState<GalleryCategory[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlideRecord[]>([]);
  const [partnerLogos, setPartnerLogos] = useState<CarouselImage[]>([]);
  const [pendingFiles] = useState<Record<string, File>>({});
  const [loading, setLoading] = useState(true);

  // ── Data Fetching ───────────────────────────────────────────────────────────
  const refreshCategories = useCallback(async () => {
    const { data } = await supabase.from('categories').select('*').order('created_at');
    if (data) setCategories(data);
  }, []);

  const refreshProducts = useCallback(async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data.map(p => ({ ...p, images: p.images || [], documents: p.documents || [], specifications: p.specifications || [] })));
  }, []);

  const refreshSoftwares = useCallback(async () => {
    const { data } = await supabase.from('softwares').select('*').order('created_at');
    if (data) setSoftwares(data);
  }, []);

  const refreshGallery = useCallback(async () => {
    const { data: cats } = await supabase.from('gallery_categories').select('*').order('created_at');
    if (cats) setGalleryCategories(cats);
    const { data: items } = await supabase.from('gallery_items').select('*').order('created_at');
    if (items) setGalleryItems(items);
  }, []);

  const refreshHeroSlides = useCallback(async () => {
    const { data } = await supabase.from('hero_slides').select('*').order('created_at');
    if (data) setHeroSlides(data);
  }, []);

  const refreshPartnerLogos = useCallback(async () => {
    const { data } = await supabase.from('partner_logos').select('*').order('created_at');
    if (data) setPartnerLogos(data);
  }, []);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([
        refreshCategories(),
        refreshProducts(),
        refreshSoftwares(),
        refreshGallery(),
        refreshHeroSlides(),
        refreshPartnerLogos(),
      ]);
      setLoading(false);
    };
    loadAll();
  }, [refreshCategories, refreshProducts, refreshSoftwares, refreshGallery, refreshHeroSlides, refreshPartnerLogos]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const getCategoryBySlug = (slug: string) => categories.find(c => c.slug === slug);
  const getProductsByCategory = (categoryId: string) => products.filter(p => p.category_id === categoryId);
  const getProductBySlug = (categoryId: string, productSlug: string) =>
    products.find(p => p.category_id === categoryId && p.slug === productSlug);

  const navCategories = categories.filter(c => c.show_in_navbar).slice(0, 9);

  const resolveImageUrl = useCallback((url: string | null): string => {
    if (!url) return '';
    return url;
  }, []);

  // ── Category Mutations ──────────────────────────────────────────────────────
  const addCategory = async (cat: Omit<Category, 'id' | 'created_at'>, file?: File | null) => {
    let image_url = cat.image_url;
    if (file) {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `categories/${sanitizeName(cat.name)}/cover.${ext}`;
      image_url = await uploadFile(file, path);
    }
    const { data, error } = await supabase.from('categories').insert({ ...cat, image_url }).select().single();
    if (error) throw new Error(error.message);
    setCategories(prev => [...prev, data]);
    return data;
  };

  const updateCategory = async (id: string, updates: Partial<Category>, file?: File | null) => {
    let image_url = updates.image_url;
    if (file) {
      const catName = updates.name || categories.find(c => c.id === id)?.name || 'category';
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `categories/${sanitizeName(catName)}/cover.${ext}`;
      image_url = await uploadFile(file, path);
    }
    const payload = file ? { ...updates, image_url } : updates;
    const { data, error } = await supabase.from('categories').update(payload).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    setCategories(prev => prev.map(c => c.id === id ? data : c));
    return data;
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw new Error(error.message);
    setCategories(prev => prev.filter(c => c.id !== id));
    setProducts(prev => prev.filter(p => p.category_id !== id));
  };

  // ── Product Mutations ───────────────────────────────────────────────────────
  const addProduct = async (
    prod: Omit<Product, 'id' | 'created_at' | 'updated_at'>,
    coverImage?: File | null,
    galleryImages?: (File | string)[],
    documents?: { id: string; name: string; file: File | null; url: string; type: string }[]
  ) => {
    const cat = categories.find(c => c.id === prod.category_id);
    const catName = cat ? cat.name : 'Uncategorized';
    const basePath = `products/${sanitizeName(catName)}/${sanitizeName(prod.name)}`;

    let cover_image = prod.cover_image;
    if (coverImage) {
      const ext = coverImage.name.split('.').pop() || 'jpg';
      cover_image = await uploadFile(coverImage, `${basePath}/cover.${ext}`);
    }

    const images: string[] = [];
    if (galleryImages) {
      for (let i = 0; i < galleryImages.length; i++) {
        const img = galleryImages[i];
        if (img instanceof File) {
          const ext = img.name.split('.').pop() || 'jpg';
          const url = await uploadFile(img, `${basePath}/gallery_${i + 1}.${ext}`);
          images.push(url);
          if (img === coverImage) cover_image = url;
        } else {
          images.push(img);
        }
      }
    }

    const docItems: { id: string; name: string; url: string; type: string }[] = [];
    if (documents) {
      for (const doc of documents) {
        if (doc.file) {
          const ext = doc.file.name.split('.').pop() || 'pdf';
          const url = await uploadFile(doc.file, `${basePath}/docs/${sanitizeName(doc.name)}.${ext}`);
          docItems.push({ id: doc.id, name: doc.name, url, type: doc.type });
        } else {
          docItems.push({ id: doc.id, name: doc.name, url: doc.url, type: doc.type });
        }
      }
    }

    const { data, error } = await supabase.from('products').insert({
      ...prod, cover_image, images, documents: docItems
    }).select().single();
    if (error) throw new Error(error.message);
    const newProd = { ...data, images: data.images || [], documents: data.documents || [], specifications: data.specifications || [] };
    setProducts(prev => [newProd, ...prev]);
    return newProd;
  };

  const updateProduct = async (
    id: string,
    updates: Partial<Product>,
    coverImage?: File | null,
    galleryImages?: (File | string)[],
    documents?: { id: string; name: string; file: File | null; url: string; type: string }[]
  ) => {
    const existing = products.find(p => p.id === id);
    const prodName = updates.name || existing?.name || 'product';
    const categoryId = updates.category_id || existing?.category_id || '';
    const cat = categories.find(c => c.id === categoryId);
    const catName = cat ? cat.name : 'Uncategorized';
    const basePath = `products/${sanitizeName(catName)}/${sanitizeName(prodName)}`;

    let cover_image = updates.cover_image !== undefined ? updates.cover_image : existing?.cover_image ?? null;
    if (coverImage) {
      const ext = coverImage.name.split('.').pop() || 'jpg';
      cover_image = await uploadFile(coverImage, `${basePath}/cover.${ext}`);
    }

    const images: string[] = [];
    if (galleryImages) {
      for (let i = 0; i < galleryImages.length; i++) {
        const img = galleryImages[i];
        if (img instanceof File) {
          const ext = img.name.split('.').pop() || 'jpg';
          const url = await uploadFile(img, `${basePath}/gallery_${i + 1}.${ext}`);
          images.push(url);
          if (img === coverImage) cover_image = url;
        } else {
          images.push(img);
        }
      }
    } else if (existing?.images) {
      images.push(...existing.images);
    }

    const docItems: { id: string; name: string; url: string; type: string }[] = [];
    if (documents) {
      for (const doc of documents) {
        if (doc.file) {
          const ext = doc.file.name.split('.').pop() || 'pdf';
          const url = await uploadFile(doc.file, `${basePath}/docs/${sanitizeName(doc.name)}.${ext}`);
          docItems.push({ id: doc.id, name: doc.name, url, type: doc.type });
        } else {
          docItems.push({ id: doc.id, name: doc.name, url: doc.url, type: doc.type });
        }
      }
    } else if (existing?.documents) {
      docItems.push(...existing.documents);
    }

    const payload = { ...updates, cover_image, images, documents: docItems, updated_at: new Date().toISOString() };
    const { data, error } = await supabase.from('products').update(payload).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    const updated = { ...data, images: data.images || [], documents: data.documents || [], specifications: data.specifications || [] };
    setProducts(prev => prev.map(p => p.id === id ? updated : p));
    return updated;
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw new Error(error.message);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // ── Software Mutations ─────────────────────────────────────────────────────
  const addSoftware = async (soft: Omit<Software, 'id' | 'created_at'>, file?: File | null) => {
    let image_url = soft.image_url;
    if (file) {
      const ext = file.name.split('.').pop() || 'jpg';
      image_url = await uploadFile(file, `software/${sanitizeName(soft.name)}.${ext}`);
    }
    const { data, error } = await supabase.from('softwares').insert({ ...soft, image_url }).select().single();
    if (error) throw new Error(error.message);
    setSoftwares(prev => [...prev, data]);
    return data;
  };

  const updateSoftware = async (id: string, updates: Partial<Software>, file?: File | null) => {
    let image_url = updates.image_url;
    if (file) {
      const softName = updates.name || softwares.find(s => s.id === id)?.name || 'software';
      const ext = file.name.split('.').pop() || 'jpg';
      image_url = await uploadFile(file, `software/${sanitizeName(softName)}.${ext}`);
    }
    const payload = file ? { ...updates, image_url } : updates;
    const { data, error } = await supabase.from('softwares').update(payload).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    setSoftwares(prev => prev.map(s => s.id === id ? data : s));
    return data;
  };

  const deleteSoftware = async (id: string) => {
    const { error } = await supabase.from('softwares').delete().eq('id', id);
    if (error) throw new Error(error.message);
    setSoftwares(prev => prev.filter(s => s.id !== id));
  };

  // ── Gallery Category Mutations ──────────────────────────────────────────────
  const addGalleryCategory = async (name: string) => {
    const { data, error } = await supabase.from('gallery_categories').insert({ name }).select().single();
    if (error) throw new Error(error.message);
    setGalleryCategories(prev => [...prev, data]);
    return data;
  };

  const updateGalleryCategory = async (id: string, name: string) => {
    const { data, error } = await supabase.from('gallery_categories').update({ name }).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    setGalleryCategories(prev => prev.map(c => c.id === id ? data : c));
    return data;
  };

  const deleteGalleryCategory = async (id: string) => {
    const { error } = await supabase.from('gallery_categories').delete().eq('id', id);
    if (error) throw new Error(error.message);
    setGalleryCategories(prev => prev.filter(c => c.id !== id));
    setGalleryItems(prev => prev.filter(i => i.category_id !== id));
  };

  // ── Gallery Item Mutations ──────────────────────────────────────────────────
  const addGalleryItem = async (item: Omit<GalleryItem, 'id' | 'created_at'>, file?: File | null) => {
    let image_url = item.image_url;
    if (file) {
      const cat = galleryCategories.find(c => c.id === item.category_id);
      const catName = cat ? cat.name : 'uncategorized';
      const ext = file.name.split('.').pop() || 'jpg';
      image_url = await uploadFile(file, `gallery/${sanitizeName(catName)}/${sanitizeName(item.name)}.${ext}`);
    }
    const { data, error } = await supabase.from('gallery_items').insert({ ...item, image_url }).select().single();
    if (error) throw new Error(error.message);
    setGalleryItems(prev => [...prev, data]);
    return data;
  };

  const updateGalleryItem = async (id: string, updates: Partial<GalleryItem>, file?: File | null) => {
    let image_url = updates.image_url;
    if (file) {
      const existing = galleryItems.find(i => i.id === id);
      const itemName = updates.name || existing?.name || 'item';
      const categoryId = updates.category_id || existing?.category_id || '';
      const cat = galleryCategories.find(c => c.id === categoryId);
      const catName = cat ? cat.name : 'uncategorized';
      const ext = file.name.split('.').pop() || 'jpg';
      image_url = await uploadFile(file, `gallery/${sanitizeName(catName)}/${sanitizeName(itemName)}.${ext}`);
    }
    const payload = file ? { ...updates, image_url } : updates;
    const { data, error } = await supabase.from('gallery_items').update(payload).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    setGalleryItems(prev => prev.map(i => i.id === id ? data : i));
    return data;
  };

  const deleteGalleryItem = async (id: string) => {
    const { error } = await supabase.from('gallery_items').delete().eq('id', id);
    if (error) throw new Error(error.message);
    setGalleryItems(prev => prev.filter(i => i.id !== id));
  };

  // ── Hero Slide Mutations ────────────────────────────────────────────────────
  const addHeroSlide = async (slide: Omit<HeroSlideRecord, 'id' | 'created_at'>, file?: File | null) => {
    let image_url = slide.image_url;
    if (file) {
      const ext = file.name.split('.').pop() || 'jpg';
      image_url = await uploadFile(file, `hero/${sanitizeName(slide.title)}.${ext}`);
    }
    const { data, error } = await supabase.from('hero_slides').insert({ ...slide, image_url }).select().single();
    if (error) throw new Error(error.message);
    setHeroSlides(prev => [...prev, data]);
    return data;
  };

  const updateHeroSlide = async (id: string, updates: Partial<HeroSlideRecord>, file?: File | null) => {
    let image_url = updates.image_url;
    if (file) {
      const existing = heroSlides.find(s => s.id === id);
      const title = updates.title || existing?.title || 'slide';
      const ext = file.name.split('.').pop() || 'jpg';
      image_url = await uploadFile(file, `hero/${sanitizeName(title)}.${ext}`);
    }
    const payload = file ? { ...updates, image_url } : updates;
    const { data, error } = await supabase.from('hero_slides').update(payload).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    setHeroSlides(prev => prev.map(s => s.id === id ? data : s));
    return data;
  };

  const deleteHeroSlide = async (id: string) => {
    const { error } = await supabase.from('hero_slides').delete().eq('id', id);
    if (error) throw new Error(error.message);
    setHeroSlides(prev => prev.filter(s => s.id !== id));
  };

  // ── Partner Logo Mutations ──────────────────────────────────────────────────
  const addPartnerLogo = async (logo: Omit<CarouselImage, 'id' | 'created_at'>, file?: File | null) => {
    let image_url = logo.image_url;
    if (file) {
      const ext = file.name.split('.').pop() || 'png';
      image_url = await uploadFile(file, `logos/${sanitizeName(logo.name)}.${ext}`);
    }
    const { data, error } = await supabase.from('partner_logos').insert({ ...logo, image_url }).select().single();
    if (error) throw new Error(error.message);
    setPartnerLogos(prev => [...prev, data]);
    return data;
  };

  const updatePartnerLogo = async (id: string, updates: Partial<CarouselImage>, file?: File | null) => {
    let image_url = updates.image_url;
    if (file) {
      const existing = partnerLogos.find(l => l.id === id);
      const logoName = updates.name || existing?.name || 'logo';
      const ext = file.name.split('.').pop() || 'png';
      image_url = await uploadFile(file, `logos/${sanitizeName(logoName)}.${ext}`);
    }
    const payload = file ? { ...updates, image_url } : updates;
    const { data, error } = await supabase.from('partner_logos').update(payload).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    setPartnerLogos(prev => prev.map(l => l.id === id ? data : l));
    return data;
  };

  const deletePartnerLogo = async (id: string) => {
    const { error } = await supabase.from('partner_logos').delete().eq('id', id);
    if (error) throw new Error(error.message);
    setPartnerLogos(prev => prev.filter(l => l.id !== id));
  };

  return (
    <CatalogContext.Provider value={{
      categories, products, softwares, galleryCategories, galleryItems, heroSlides, partnerLogos,
      pendingFiles, loading,
      getCategoryBySlug, getProductsByCategory, getProductBySlug, navCategories, resolveImageUrl,
      addCategory, updateCategory, deleteCategory,
      addProduct, updateProduct, deleteProduct,
      addSoftware, updateSoftware, deleteSoftware,
      addGalleryCategory, updateGalleryCategory, deleteGalleryCategory,
      addGalleryItem, updateGalleryItem, deleteGalleryItem,
      addHeroSlide, updateHeroSlide, deleteHeroSlide,
      addPartnerLogo, updatePartnerLogo, deletePartnerLogo,
      refreshCategories, refreshProducts, refreshSoftwares, refreshGallery,
    }}>
      {children}
    </CatalogContext.Provider>
  );
};

export const useCatalog = (): CatalogContextType => {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used within a CatalogProvider');
  return ctx;
};
