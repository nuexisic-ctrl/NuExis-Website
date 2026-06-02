import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, Grid } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';

interface GalleryImage {
    id: string; // Changed to string to support DB uuids
    src: string;
    alt: string;
    category: string;
}

const GalleryPage: React.FC = () => {
    const { galleryCategories, galleryItems, resolveImageUrl } = useCatalog();
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const categories = ["All", ...galleryCategories.map(c => c.name)];

    // Map the database entities into the frontend structure
    const allImages: GalleryImage[] = galleryItems.map(item => {
        const cat = galleryCategories.find(c => c.id === item.category_id);
        return {
            id: item.id,
            src: resolveImageUrl(item.image_url),
            alt: item.name,
            category: cat?.name || 'Unknown'
        };
    });

    const filteredImages = selectedCategory === "All"
        ? allImages
        : allImages.filter(img => img.category === selectedCategory);

    const openLightbox = (image: GalleryImage, index: number) => {
        setLightboxImage(image);
        setCurrentIndex(index);
    };

    const closeLightbox = () => {
        setLightboxImage(null);
    };

    const goToPrevious = () => {
        const newIndex = currentIndex === 0 ? filteredImages.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
        setLightboxImage(filteredImages[newIndex]);
    };

    const goToNext = () => {
        const newIndex = currentIndex === filteredImages.length - 1 ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
        setLightboxImage(filteredImages[newIndex]);
    };

    return (
        <div className="min-h-screen pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-sm font-bold tracking-widest text-brand-accent uppercase mb-4">
                        Our Portfolio
                    </h2>
                    <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                        Product Gallery
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Explore our range of professional AV solutions and successful installations.
                    </p>
                </motion.div>

                {/* Category Filter */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-wrap justify-center gap-3 mb-12"
                >
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-5 py-2 rounded-full font-medium text-sm transition-all duration-300 ${selectedCategory === category
                                    ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20"
                                    : "bg-white text-gray-700 border border-black/10 hover:border-brand-blue/50"
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </motion.div>

                {/* Gallery Grid */}
                <motion.div
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                >
                    <AnimatePresence>
                        {filteredImages.map((image, index) => (
                            <motion.div
                                key={image.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                className="group relative aspect-square overflow-hidden rounded-2xl cursor-pointer"
                                onClick={() => openLightbox(image, index)}
                            >
                                <img
                                    src={image.src}
                                    alt={image.alt}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                            <ZoomIn className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-4">
                                        <p className="text-white font-semibold">{image.alt}</p>
                                        <p className="text-white/70 text-sm">{image.category}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

                {/* No Results */}
                {filteredImages.length === 0 && (
                    <div className="text-center py-20">
                        <Grid className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No images found in this category.</p>
                    </div>
                )}
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {lightboxImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
                        onClick={closeLightbox}
                    >
                        {/* Close Button */}
                        <button
                            onClick={closeLightbox}
                            className="absolute top-6 right-6 p-2 text-white/70 hover:text-white transition-colors"
                        >
                            <X className="w-8 h-8" />
                        </button>

                        {/* Previous Button */}
                        <button
                            onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                            className="absolute left-4 md:left-8 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>

                        {/* Image */}
                        <motion.img
                            key={lightboxImage.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            src={lightboxImage.src}
                            alt={lightboxImage.alt}
                            className="max-w-full max-h-[85vh] object-contain rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                        />

                        {/* Next Button */}
                        <button
                            onClick={(e) => { e.stopPropagation(); goToNext(); }}
                            className="absolute right-4 md:right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>

                        {/* Image Info */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-white">
                            <p className="font-semibold">{lightboxImage.alt}</p>
                            <p className="text-sm text-white/70">{currentIndex + 1} / {filteredImages.length}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GalleryPage;
