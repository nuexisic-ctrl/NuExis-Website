import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';

export const exportAppData = async (
  context: {
    categories: any[];
    products: any[];
    softwares: any[];
    galleryCategories: any[];
    galleryItems: any[];
    heroSlides: any[];
    partnerLogos: any[];
    pendingFiles: Record<string, File>;
  },
  onProgress: (msg: string) => void
) => {
  const zip = new JSZip();

  try {
    onProgress('Compiling staticDb.ts...');
    
    // Create the DB content
    const dbContent = `// Static Database Compiled from NuExis Offline Admin Panel
// Generated at ${new Date().toISOString()}

export const staticCategories = ${JSON.stringify(context.categories, null, 2)};

export const staticProducts = ${JSON.stringify(context.products, null, 2)};

export const staticSoftwares = ${JSON.stringify(context.softwares, null, 2)};

export const staticGalleryCategories = ${JSON.stringify(context.galleryCategories, null, 2)};

export const staticGalleryItems = ${JSON.stringify(context.galleryItems, null, 2)};

export const staticHeroSlides = ${JSON.stringify(context.heroSlides, null, 2)};

export const staticPartnerLogos = ${JSON.stringify(context.partnerLogos, null, 2)};
`;

    // Add staticDb.ts to the ZIP under data/
    zip.file('data/staticDb.ts', dbContent);

    // Process all pending upload files
    const fileKeys = Object.keys(context.pendingFiles);
    onProgress(`Adding ${fileKeys.length} new asset files to package...`);

    for (const key of fileKeys) {
      const file = context.pendingFiles[key];
      // Map path starting with /images/... to public/images/... in the ZIP
      const zipPath = key.startsWith('/') ? `public${key}` : `public/${key}`;
      zip.file(zipPath, file);
    }

    onProgress('Generating ZIP file (This may take a moment)...');
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    
    onProgress('Downloading ZIP...');
    saveAs(zipBlob, 'nuexis-update-package.zip');

    toast.success('App Data package downloaded successfully!');
  } catch (error: any) {
    console.error('Export failed:', error);
    toast.error(error.message || 'Failed to export app data');
  }
};

