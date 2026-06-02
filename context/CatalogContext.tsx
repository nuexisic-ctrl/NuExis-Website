import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Software, GalleryCategory, GalleryItem } from '../types';

import { 
  staticCategories, 
  staticProducts, 
  staticSoftwares, 
  staticGalleryCategories, 
  staticGalleryItems 
} from '../data/staticDb';

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
  const [categories] = useState<Category[]>(staticCategories);
  const [products] = useState<Product[]>(staticProducts);
  const [softwares] = useState<Software[]>(staticSoftwares);
  const [galleryCategories] = useState<GalleryCategory[]>(staticGalleryCategories);
  const [galleryItems] = useState<GalleryItem[]>(staticGalleryItems);
  const [loading] = useState(false);

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
      refreshCategories: async () => {},
      refreshProducts: async () => {},
      refreshSoftwares: async () => {},
      refreshGallery: async () => {},
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
