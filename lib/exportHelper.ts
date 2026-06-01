import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { supabase } from './supabaseClient';
import toast from 'react-hot-toast';

// Helper to fetch file blob
async function fetchBlob(url: string): Promise<Blob | null> {
  if (!url) return null;
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.blob();
  } catch (error) {
    console.error(`Failed to fetch blob for ${url}`, error);
    return null;
  }
}

// Sanitize folder names
const sanitizeName = (name: string) => {
  return name.replace(/[^a-zA-Z0-9 _-]/g, '').trim() || 'unnamed';
};

export const exportAppData = async (onProgress: (msg: string) => void) => {
  const zip = new JSZip();

  try {
    onProgress('Fetching Categories...');
    const { data: categories } = await supabase.from('categories').select('*');
    
    onProgress('Fetching Products...');
    const { data: products } = await supabase.from('products').select('*');

    onProgress('Fetching Software...');
    const { data: softwares } = await supabase.from('softwares').select('*');

    onProgress('Fetching Gallery...');
    const { data: galleryCategories } = await supabase.from('gallery_categories').select('*');
    const { data: galleryItems } = await supabase.from('gallery_items').select('*');

    onProgress('Fetching Carousels...');
    const { data: carouselImages } = await supabase.from('carousel_images').select('*');
    const { data: heroCarousel } = await supabase.from('hero_carousel').select('*');

    // 1. Process Products
    if (categories && products) {
      const productsFolder = zip.folder('products');
      if (productsFolder) {
        for (const category of categories) {
          const categoryFolder = productsFolder.folder(sanitizeName(category.name));
          if (!categoryFolder) continue;

          const catProducts = products.filter(p => p.category_id === category.id);
          for (const product of catProducts) {
            const productFolder = categoryFolder.folder(sanitizeName(product.name));
            if (!productFolder) continue;

            // Product Data
            productFolder.file('data.json', JSON.stringify(product, null, 2));

            // Images
            const imagesFolder = productFolder.folder('images');
            if (imagesFolder) {
              if (product.cover_image) {
                const blob = await fetchBlob(product.cover_image);
                if (blob) imagesFolder.file(`cover_image.jpg`, blob);
              }
              if (product.images && Array.isArray(product.images)) {
                for (let i = 0; i < product.images.length; i++) {
                  const url = product.images[i];
                  const blob = await fetchBlob(url);
                  if (blob) imagesFolder.file(`gallery_image_${i + 1}.jpg`, blob);
                }
              }
            }

            // Documents (Media)
            if (product.documents && Array.isArray(product.documents)) {
              const mediaFolder = productFolder.folder('media');
              if (mediaFolder) {
                for (let i = 0; i < product.documents.length; i++) {
                  const doc = product.documents[i];
                  const blob = await fetchBlob(doc.url);
                  if (blob) mediaFolder.file(`${sanitizeName(doc.name || `doc_${i}`)}.pdf`, blob);
                }
              }
            }
          }
        }
      }
    }

    // 2. Process Software
    if (softwares) {
      const softwareFolder = zip.folder('software');
      if (softwareFolder) {
        softwareFolder.file('data.json', JSON.stringify(softwares, null, 2));
        for (const soft of softwares) {
          if (soft.image_url) {
            const blob = await fetchBlob(soft.image_url);
            if (blob) softwareFolder.file(`${sanitizeName(soft.name)}.jpg`, blob);
          }
        }
      }
    }

    // 3. Process Gallery
    if (galleryCategories && galleryItems) {
      const galleryFolder = zip.folder('gallery');
      if (galleryFolder) {
        galleryFolder.file('data.json', JSON.stringify({ categories: galleryCategories, items: galleryItems }, null, 2));
        for (const cat of galleryCategories) {
          const catFolder = galleryFolder.folder(sanitizeName(cat.name));
          if (!catFolder) continue;
          const items = galleryItems.filter(i => i.category_id === cat.id);
          for (const item of items) {
            if (item.image_url) {
              const blob = await fetchBlob(item.image_url);
              if (blob) catFolder.file(`${sanitizeName(item.name || 'image')}.jpg`, blob);
            }
          }
        }
      }
    }

    // 4. Process Carousels
    const carouselsFolder = zip.folder('carousels');
    if (carouselsFolder) {
      if (carouselImages) {
        const logosFolder = carouselsFolder.folder('logos');
        logosFolder?.file('data.json', JSON.stringify(carouselImages, null, 2));
        for (const logo of carouselImages) {
          if (logo.image_url) {
            const blob = await fetchBlob(logo.image_url);
            if (blob) logosFolder?.file(`${sanitizeName(logo.name)}.png`, blob);
          }
        }
      }

      if (heroCarousel) {
        const heroFolder = carouselsFolder.folder('hero');
        heroFolder?.file('data.json', JSON.stringify(heroCarousel, null, 2));
        for (const slide of heroCarousel) {
          if (slide.image_url) {
            const blob = await fetchBlob(slide.image_url);
            if (blob) heroFolder?.file(`${sanitizeName(slide.title)}.jpg`, blob);
          }
        }
      }
    }

    onProgress('Generating ZIP file (This may take a minute)...');
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    
    onProgress('Downloading ZIP...');
    saveAs(zipBlob, 'nuexis-app-data.zip');

    toast.success('App Data downloaded successfully!');
  } catch (error: any) {
    console.error('Export failed:', error);
    toast.error(error.message || 'Failed to export app data');
  }
};
