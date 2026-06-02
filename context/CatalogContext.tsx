import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { Software, GalleryCategory, GalleryItem } from '../types';

import { 
  staticCategories, 
  staticProducts, 
  staticSoftwares, 
  staticGalleryCategories, 
  staticGalleryItems,
  staticHeroSlides,
  staticPartnerLogos
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
  navCategories: Category[]; // show_in_navbar=true, max 9
  
  // Image/Asset Resolver
  resolveImageUrl: (url: string | null) => string;
  
  // Category Mutations
  addCategory: (cat: Omit<Category, 'id' | 'created_at'>, file?: File | null) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Category>, file?: File | null) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;

  // Product Mutations
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

  // Software Mutations
  addSoftware: (soft: Omit<Software, 'id' | 'created_at'>, file?: File | null) => Promise<Software>;
  updateSoftware: (id: string, updates: Partial<Software>, file?: File | null) => Promise<Software>;
  deleteSoftware: (id: string) => Promise<void>;

  // Gallery Category Mutations
  addGalleryCategory: (name: string) => Promise<GalleryCategory>;
  updateGalleryCategory: (id: string, name: string) => Promise<GalleryCategory>;
  deleteGalleryCategory: (id: string) => Promise<void>;

  // Gallery Item Mutations
  addGalleryItem: (item: Omit<GalleryItem, 'id' | 'created_at'>, file?: File | null) => Promise<GalleryItem>;
  updateGalleryItem: (id: string, updates: Partial<GalleryItem>, file?: File | null) => Promise<GalleryItem>;
  deleteGalleryItem: (id: string) => Promise<void>;

  // Hero Slide Mutations
  addHeroSlide: (slide: Omit<HeroSlideRecord, 'id' | 'created_at'>, file?: File | null) => Promise<HeroSlideRecord>;
  updateHeroSlide: (id: string, updates: Partial<HeroSlideRecord>, file?: File | null) => Promise<HeroSlideRecord>;
  deleteHeroSlide: (id: string) => Promise<void>;

  // Partner Logo Mutations
  addPartnerLogo: (logo: Omit<CarouselImage, 'id' | 'created_at'>, file?: File | null) => Promise<CarouselImage>;
  updatePartnerLogo: (id: string, updates: Partial<CarouselImage>, file?: File | null) => Promise<CarouselImage>;
  deletePartnerLogo: (id: string) => Promise<void>;

  refreshCategories: () => Promise<void>;
  refreshProducts: () => Promise<void>;
  refreshSoftwares: () => Promise<void>;
  refreshGallery: () => Promise<void>;
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

// Helper to sanitize filenames & folder names
const sanitizeName = (name: string) => {
  return name.replace(/[^a-zA-Z0-9 _-]/g, '').trim() || 'unnamed';
};

const uid = () => Math.random().toString(36).slice(2);

export const CatalogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>(staticCategories);
  const [products, setProducts] = useState<Product[]>(staticProducts);
  const [softwares, setSoftwares] = useState<Software[]>(staticSoftwares);
  const [galleryCategories, setGalleryCategories] = useState<GalleryCategory[]>(staticGalleryCategories);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(staticGalleryItems);
  const [heroSlides, setHeroSlides] = useState<HeroSlideRecord[]>(staticHeroSlides);
  const [partnerLogos, setPartnerLogos] = useState<CarouselImage[]>(staticPartnerLogos);
  const [pendingFiles, setPendingFiles] = useState<Record<string, File>>({});
  const [loading] = useState(false);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const getCategoryBySlug = (slug: string) => categories.find(c => c.slug === slug);
  const getProductsByCategory = (categoryId: string) => products.filter(p => p.category_id === categoryId);
  const getProductBySlug = (categoryId: string, productSlug: string) =>
    products.find(p => p.category_id === categoryId && p.slug === productSlug);

  const navCategories = categories
    .filter(c => c.show_in_navbar)
    .slice(0, 9);

  // Resolves image relative path to a local blob url if it's in pendingFiles
  const resolveImageUrl = useCallback((url: string | null): string => {
    if (!url) return '';
    if (pendingFiles[url]) {
      return URL.createObjectURL(pendingFiles[url]);
    }
    return url;
  }, [pendingFiles]);

  const registerPendingFile = (path: string, file: File) => {
    setPendingFiles(prev => ({
      ...prev,
      [path]: file
    }));
  };

  // ── Category Mutations ──────────────────────────────────────────────────────
  const addCategory = async (cat: Omit<Category, 'id' | 'created_at'>, file?: File | null) => {
    const id = uid();
    const created_at = new Date().toISOString();
    let image_url = cat.image_url;

    if (file) {
      const ext = file.name.split('.').pop() || 'jpg';
      image_url = `/images/products/${sanitizeName(cat.name)}/images/cover_image.${ext}`;
      registerPendingFile(image_url, file);
    }

    const newCat: Category = {
      ...cat,
      id,
      image_url,
      created_at
    };

    setCategories(prev => [...prev, newCat]);
    return newCat;
  };

  const updateCategory = async (id: string, updates: Partial<Category>, file?: File | null) => {
    let image_url = updates.image_url !== undefined ? updates.image_url : null;
    const catName = updates.name || categories.find(c => c.id === id)?.name || 'category';

    if (file) {
      const ext = file.name.split('.').pop() || 'jpg';
      image_url = `/images/products/${sanitizeName(catName)}/images/cover_image.${ext}`;
      registerPendingFile(image_url, file);
    }

    setCategories(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          ...updates,
          ...(file ? { image_url } : {})
        };
      }
      return c;
    }));

    return {
      id,
      ...categories.find(c => c.id === id),
      ...updates,
      ...(file ? { image_url } : {})
    } as Category;
  };

  const deleteCategory = async (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    // Cascade delete associated products
    setProducts(prev => prev.filter(p => p.category_id !== id));
  };

  // ── Product Mutations ───────────────────────────────────────────────────────
  const addProduct = async (
    prod: Omit<Product, 'id' | 'created_at' | 'updated_at'>, 
    coverImage?: File | null, 
    galleryImages?: (File | string)[], 
    documents?: { id: string; name: string; file: File | null; url: string; type: string }[]
  ) => {
    const id = uid();
    const created_at = new Date().toISOString();
    const cat = categories.find(c => c.id === prod.category_id);
    const catName = cat ? cat.name : 'Uncategorized';
    
    let cover_image = prod.cover_image;
    if (coverImage) {
      const ext = coverImage.name.split('.').pop() || 'jpg';
      cover_image = `/images/products/${sanitizeName(catName)}/${sanitizeName(prod.name)}/images/cover_image.${ext}`;
      registerPendingFile(cover_image, coverImage);
    }

    const images: string[] = [];
    if (galleryImages) {
      galleryImages.forEach((img, idx) => {
        if (img instanceof File) {
          const ext = img.name.split('.').pop() || 'jpg';
          const path = `/images/products/${sanitizeName(catName)}/${sanitizeName(prod.name)}/images/gallery_image_${idx + 1}.${ext}`;
          registerPendingFile(path, img);
          images.push(path);
          if (img === coverImage) {
            cover_image = path;
          }
        } else {
          images.push(img);
        }
      });
    }

    const docItems: { id: string; name: string; url: string; type: string }[] = [];
    if (documents) {
      documents.forEach(doc => {
        if (doc.file) {
          const ext = doc.file.name.split('.').pop() || 'pdf';
          const path = `/images/products/${sanitizeName(catName)}/${sanitizeName(prod.name)}/media/${sanitizeName(doc.name)}.${ext}`;
          registerPendingFile(path, doc.file);
          docItems.push({ id: doc.id, name: doc.name, url: path, type: doc.type });
        } else {
          docItems.push({ id: doc.id, name: doc.name, url: doc.url, type: doc.type });
        }
      });
    }

    const newProd: Product = {
      ...prod,
      id,
      cover_image,
      images,
      documents: docItems,
      created_at,
      updated_at: created_at
    };

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

    let cover_image = updates.cover_image !== undefined ? updates.cover_image : (existing?.cover_image ?? null);
    if (coverImage) {
      const ext = coverImage.name.split('.').pop() || 'jpg';
      cover_image = `/images/products/${sanitizeName(catName)}/${sanitizeName(prodName)}/images/cover_image.${ext}`;
      registerPendingFile(cover_image, coverImage);
    }

    const images: string[] = [];
    if (galleryImages) {
      galleryImages.forEach((img, idx) => {
        if (img instanceof File) {
          const ext = img.name.split('.').pop() || 'jpg';
          const path = `/images/products/${sanitizeName(catName)}/${sanitizeName(prodName)}/images/gallery_image_${idx + 1}.${ext}`;
          registerPendingFile(path, img);
          images.push(path);
          if (img === coverImage) {
            cover_image = path;
          }
        } else {
          images.push(img);
        }
      });
    } else if (existing?.images) {
      images.push(...existing.images);
    }

    const docItems: { id: string; name: string; url: string; type: string }[] = [];
    if (documents) {
      documents.forEach(doc => {
        if (doc.file) {
          const ext = doc.file.name.split('.').pop() || 'pdf';
          const path = `/images/products/${sanitizeName(catName)}/${sanitizeName(prodName)}/media/${sanitizeName(doc.name)}.${ext}`;
          registerPendingFile(path, doc.file);
          docItems.push({ id: doc.id, name: doc.name, url: path, type: doc.type });
        } else {
          docItems.push({ id: doc.id, name: doc.name, url: doc.url, type: doc.type });
        }
      });
    } else if (existing?.documents) {
      docItems.push(...existing.documents);
    }

    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          ...updates,
          cover_image,
          images,
          documents: docItems,
          updated_at: new Date().toISOString()
        };
      }
      return p;
    }));

    return {
      id,
      ...existing,
      ...updates,
      cover_image,
      images,
      documents: docItems,
      updated_at: new Date().toISOString()
    } as Product;
  };

  const deleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // ── Software Mutations ─────────────────────────────────────────────────────
  const addSoftware = async (soft: Omit<Software, 'id' | 'created_at'>, file?: File | null) => {
    const id = uid();
    const created_at = new Date().toISOString();
    let image_url = soft.image_url;

    if (file) {
      const ext = file.name.split('.').pop() || 'jpg';
      image_url = `/images/software/${sanitizeName(soft.name)}.${ext}`;
      registerPendingFile(image_url, file);
    }

    const newSoft: Software = {
      ...soft,
      id,
      image_url,
      created_at
    };

    setSoftwares(prev => [...prev, newSoft]);
    return newSoft;
  };

  const updateSoftware = async (id: string, updates: Partial<Software>, file?: File | null) => {
    let image_url = updates.image_url !== undefined ? updates.image_url : '';
    const softName = updates.name || softwares.find(s => s.id === id)?.name || 'software';

    if (file) {
      const ext = file.name.split('.').pop() || 'jpg';
      image_url = `/images/software/${sanitizeName(softName)}.${ext}`;
      registerPendingFile(image_url, file);
    }

    setSoftwares(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          ...updates,
          ...(file ? { image_url } : {})
        };
      }
      return s;
    }));

    return {
      id,
      ...softwares.find(s => s.id === id),
      ...updates,
      ...(file ? { image_url } : {})
    } as Software;
  };

  const deleteSoftware = async (id: string) => {
    setSoftwares(prev => prev.filter(s => s.id !== id));
  };

  // ── Gallery Category Mutations ──────────────────────────────────────────────
  const addGalleryCategory = async (name: string) => {
    const id = uid();
    const created_at = new Date().toISOString();
    const newCat: GalleryCategory = {
      id,
      name,
      created_at
    };
    setGalleryCategories(prev => [...prev, newCat]);
    return newCat;
  };

  const updateGalleryCategory = async (id: string, name: string) => {
    setGalleryCategories(prev => prev.map(c => c.id === id ? { ...c, name } : c));
    return { id, name, created_at: new Date().toISOString() };
  };

  const deleteGalleryCategory = async (id: string) => {
    setGalleryCategories(prev => prev.filter(c => c.id !== id));
    // Cascade delete gallery items
    setGalleryItems(prev => prev.filter(i => i.category_id !== id));
  };

  // ── Gallery Item Mutations ──────────────────────────────────────────────────
  const addGalleryItem = async (item: Omit<GalleryItem, 'id' | 'created_at'>, file?: File | null) => {
    const id = uid();
    const created_at = new Date().toISOString();
    let image_url = item.image_url;
    const cat = galleryCategories.find(c => c.id === item.category_id);
    const catName = cat ? cat.name : 'uncategorized';

    if (file) {
      const ext = file.name.split('.').pop() || 'jpg';
      image_url = `/images/gallery/${sanitizeName(catName)}/${sanitizeName(item.name)}.${ext}`;
      registerPendingFile(image_url, file);
    }

    const newItem: GalleryItem = {
      ...item,
      id,
      image_url,
      created_at
    };

    setGalleryItems(prev => [...prev, newItem]);
    return newItem;
  };

  const updateGalleryItem = async (id: string, updates: Partial<GalleryItem>, file?: File | null) => {
    const existing = galleryItems.find(i => i.id === id);
    const itemName = updates.name || existing?.name || 'gallery_item';
    const categoryId = updates.category_id || existing?.category_id || '';
    const cat = galleryCategories.find(c => c.id === categoryId);
    const catName = cat ? cat.name : 'uncategorized';

    let image_url = updates.image_url !== undefined ? updates.image_url : (existing?.image_url ?? '');
    if (file) {
      const ext = file.name.split('.').pop() || 'jpg';
      image_url = `/images/gallery/${sanitizeName(catName)}/${sanitizeName(itemName)}.${ext}`;
      registerPendingFile(image_url, file);
    }

    setGalleryItems(prev => prev.map(i => {
      if (i.id === id) {
        return {
          ...i,
          ...updates,
          image_url
        };
      }
      return i;
    }));

    return {
      id,
      ...existing,
      ...updates,
      image_url
    } as GalleryItem;
  };

  const deleteGalleryItem = async (id: string) => {
    setGalleryItems(prev => prev.filter(i => i.id !== id));
  };

  // ── Hero Slide Mutations ────────────────────────────────────────────────────
  const addHeroSlide = async (slide: Omit<HeroSlideRecord, 'id' | 'created_at'>, file?: File | null) => {
    const id = uid();
    const created_at = new Date().toISOString();
    let image_url = slide.image_url;

    if (file) {
      const ext = file.name.split('.').pop() || 'jpg';
      image_url = `/images/carousels/hero/${sanitizeName(slide.title)}.${ext}`;
      registerPendingFile(image_url, file);
    }

    const newSlide: HeroSlideRecord = {
      ...slide,
      id,
      image_url,
      created_at
    };

    setHeroSlides(prev => [...prev, newSlide]);
    return newSlide;
  };

  const updateHeroSlide = async (id: string, updates: Partial<HeroSlideRecord>, file?: File | null) => {
    const existing = heroSlides.find(s => s.id === id);
    const slideTitle = updates.title || existing?.title || 'slide';
    let image_url = updates.image_url !== undefined ? updates.image_url : (existing?.image_url ?? '');

    if (file) {
      const ext = file.name.split('.').pop() || 'jpg';
      image_url = `/images/carousels/hero/${sanitizeName(slideTitle)}.${ext}`;
      registerPendingFile(image_url, file);
    }

    setHeroSlides(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          ...updates,
          image_url
        };
      }
      return s;
    }));

    return {
      id,
      ...existing,
      ...updates,
      image_url
    } as HeroSlideRecord;
  };

  const deleteHeroSlide = async (id: string) => {
    setHeroSlides(prev => prev.filter(s => s.id !== id));
  };

  // ── Partner Logo Mutations ──────────────────────────────────────────────────
  const addPartnerLogo = async (logo: Omit<CarouselImage, 'id' | 'created_at'>, file?: File | null) => {
    const id = uid();
    const created_at = new Date().toISOString();
    let image_url = logo.image_url;

    if (file) {
      const ext = file.name.split('.').pop() || 'png';
      image_url = `/images/carousels/logos/${sanitizeName(logo.name)}.${ext}`;
      registerPendingFile(image_url, file);
    }

    const newLogo: CarouselImage = {
      ...logo,
      id,
      image_url,
      created_at
    };

    setPartnerLogos(prev => [...prev, newLogo]);
    return newLogo;
  };

  const updatePartnerLogo = async (id: string, updates: Partial<CarouselImage>, file?: File | null) => {
    const existing = partnerLogos.find(l => l.id === id);
    const logoName = updates.name || existing?.name || 'logo';
    let image_url = updates.image_url !== undefined ? updates.image_url : (existing?.image_url ?? '');

    if (file) {
      const ext = file.name.split('.').pop() || 'png';
      image_url = `/images/carousels/logos/${sanitizeName(logoName)}.${ext}`;
      registerPendingFile(image_url, file);
    }

    setPartnerLogos(prev => prev.map(l => {
      if (l.id === id) {
        return {
          ...l,
          ...updates,
          image_url
        };
      }
      return l;
    }));

    return {
      id,
      ...existing,
      ...updates,
      image_url
    } as CarouselImage;
  };

  const deletePartnerLogo = async (id: string) => {
    setPartnerLogos(prev => prev.filter(l => l.id !== id));
  };

  return (
    <CatalogContext.Provider value={{
      categories,
      products,
      softwares,
      galleryCategories,
      galleryItems,
      heroSlides,
      partnerLogos,
      pendingFiles,
      loading,
      getCategoryBySlug,
      getProductsByCategory,
      getProductBySlug,
      navCategories,
      resolveImageUrl,
      addCategory,
      updateCategory,
      deleteCategory,
      addProduct,
      updateProduct,
      deleteProduct,
      addSoftware,
      updateSoftware,
      deleteSoftware,
      addGalleryCategory,
      updateGalleryCategory,
      deleteGalleryCategory,
      addGalleryItem,
      updateGalleryItem,
      deleteGalleryItem,
      addHeroSlide,
      updateHeroSlide,
      deleteHeroSlide,
      addPartnerLogo,
      updatePartnerLogo,
      deletePartnerLogo,
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

