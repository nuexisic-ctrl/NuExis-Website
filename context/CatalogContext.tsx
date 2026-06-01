import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Software, GalleryCategory, GalleryItem } from '../types';

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

interface CatalogContextType {
  categories: Category[];
  products: Product[];
  loading: boolean;
  getCategoryBySlug: (slug: string) => Category | undefined;
  getProductsByCategory: (categoryId: string) => Product[];
  getProductBySlug: (categoryId: string, productSlug: string) => Product | undefined;
  navCategories: Category[]; // show_in_navbar=true, max 9
  softwares: Software[];
  galleryCategories: GalleryCategory[];
  galleryItems: GalleryItem[];
  refreshCategories: () => Promise<void>;
  refreshProducts: () => Promise<void>;
  refreshSoftwares: () => Promise<void>;
  refreshGallery: () => Promise<void>;
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

export const CatalogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [softwares, setSoftwares] = useState<Software[]>([]);
  const [galleryCategories, setGalleryCategories] = useState<GalleryCategory[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Fetchers ────────────────────────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });
    if (data) setCategories(data as Category[]);
  }, []);

  const fetchProducts = useCallback(async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setProducts(data as Product[]);
  }, []);

  const fetchSoftwares = useCallback(async () => {
    const { data } = await supabase
      .from('softwares')
      .select('*')
      .order('created_at', { ascending: true });
    if (data) setSoftwares(data as Software[]);
  }, []);

  const fetchGallery = useCallback(async () => {
    const [catRes, itemRes] = await Promise.all([
      supabase.from('gallery_categories').select('*').order('created_at', { ascending: true }),
      supabase.from('gallery_items').select('*').order('created_at', { ascending: false })
    ]);
    if (catRes.data) setGalleryCategories(catRes.data as GalleryCategory[]);
    if (itemRes.data) setGalleryItems(itemRes.data as GalleryItem[]);
  }, []);

  // ── Initial load ────────────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    Promise.all([fetchCategories(), fetchProducts(), fetchSoftwares(), fetchGallery()]).finally(() => setLoading(false));
  }, [fetchCategories, fetchProducts, fetchSoftwares, fetchGallery]);

  // ── Real-time subscriptions ─────────────────────────────────────────────────
  useEffect(() => {
    // Categories channel
    const catChannel = supabase
      .channel('catalog_categories')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setCategories(prev => [...prev, payload.new as Category]);
          } else if (payload.eventType === 'UPDATE') {
            setCategories(prev => prev.map(c => c.id === payload.new.id ? payload.new as Category : c));
          } else if (payload.eventType === 'DELETE') {
            setCategories(prev => prev.filter(c => c.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Products channel
    const prodChannel = supabase
      .channel('catalog_products')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setProducts(prev => [payload.new as Product, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setProducts(prev => prev.map(p => p.id === payload.new.id ? payload.new as Product : p));
          } else if (payload.eventType === 'DELETE') {
            setProducts(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Softwares channel
    const softChannel = supabase
      .channel('catalog_softwares')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'softwares' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setSoftwares(prev => [...prev, payload.new as Software]);
          } else if (payload.eventType === 'UPDATE') {
            setSoftwares(prev => prev.map(s => s.id === payload.new.id ? payload.new as Software : s));
          } else if (payload.eventType === 'DELETE') {
            setSoftwares(prev => prev.filter(s => s.id !== payload.old.id));
          }
        }
      )
      .subscribe();

      // Gallery Categories channel
      const galCatChannel = supabase
      .channel('catalog_gallery_categories')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'gallery_categories' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setGalleryCategories(prev => [...prev, payload.new as GalleryCategory]);
          } else if (payload.eventType === 'UPDATE') {
            setGalleryCategories(prev => prev.map(s => s.id === payload.new.id ? payload.new as GalleryCategory : s));
          } else if (payload.eventType === 'DELETE') {
            setGalleryCategories(prev => prev.filter(s => s.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Gallery Items channel
    const galItemChannel = supabase
      .channel('catalog_gallery_items')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'gallery_items' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setGalleryItems(prev => [payload.new as GalleryItem, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setGalleryItems(prev => prev.map(s => s.id === payload.new.id ? payload.new as GalleryItem : s));
          } else if (payload.eventType === 'DELETE') {
            setGalleryItems(prev => prev.filter(s => s.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(catChannel);
      supabase.removeChannel(prodChannel);
      supabase.removeChannel(softChannel);
      supabase.removeChannel(galCatChannel);
      supabase.removeChannel(galItemChannel);
    };
  }, []);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const getCategoryBySlug = (slug: string) => categories.find(c => c.slug === slug);
  const getProductsByCategory = (categoryId: string) => products.filter(p => p.category_id === categoryId);
  const getProductBySlug = (categoryId: string, productSlug: string) =>
    products.find(p => p.category_id === categoryId && p.slug === productSlug);

  const navCategories = categories
    .filter(c => c.show_in_navbar)
    .slice(0, 9);

  return (
    <CatalogContext.Provider value={{
      categories,
      products,
      loading,
      getCategoryBySlug,
      getProductsByCategory,
      getProductBySlug,
      navCategories,
      softwares,
      galleryCategories,
      galleryItems,
      refreshCategories: fetchCategories,
      refreshProducts: fetchProducts,
      refreshSoftwares: fetchSoftwares,
      refreshGallery: fetchGallery,
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
