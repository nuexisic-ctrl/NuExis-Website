import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight, Box, Monitor, Grid, ZoomIn, ZoomOut, Maximize2, X,
    ArrowLeft, Home, Download, FileText, Share2, CheckCircle2
} from 'lucide-react';
import { productCatalog, slugify, ProductItem, CategoryNode, SeriesNode } from '../data/productCatalog';

// --- Assets & Helper Functions ---

// Import all product images dynamically
const productImages = import.meta.glob('@/images/Products/**/*.webp', {
    eager: true,
    query: '?url',
    import: 'default'
}) as Record<string, string>;

const allImagesMap = productImages;

// Helper to get images for a folder
const getImagesForFolder = (folderName?: string) => {
    if (!folderName) return [];
    return Object.entries(allImagesMap)
        .filter(([path]) => path.includes(folderName))
        .map(([, url]) => url);
};

// --- Components ---

const Breadcrumbs: React.FC<{ items: { label: string; href: string }[] }> = ({ items }) => (
    <nav className="flex items-center text-sm text-gray-500 mb-6 overflow-x-auto whitespace-nowrap pb-2 no-scrollbar">
        <Link to="/" className="hover:text-brand-blue transition-colors flex items-center">
            <Home className="w-4 h-4 mr-1" /> Home
        </Link>
        {items.map((item, index) => (
            <React.Fragment key={index}>
                <ChevronRight className="w-4 h-4 mx-2 flex-shrink-0 text-gray-400" />
                <Link
                    to={item.href}
                    className={`hover:text-brand-blue transition-colors ${index === items.length - 1 ? 'font-semibold text-brand-blue' : ''}`}
                >
                    {item.label}
                </Link>
            </React.Fragment>
        ))}
    </nav>
);

const SectionTitle: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
    <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
        <div className="h-1 w-12 bg-brand-blue rounded-full mt-3"></div>
    </div>
);

// --- Detailed Product View ---

const DetailedProductView: React.FC<{
    product: ProductItem;
    seriesLabel: string;
    categoryLabel: string;
    activeSeries: SeriesNode;
}> = ({ product, seriesLabel, categoryLabel, activeSeries }) => {
    const images = getImagesForFolder(product.imageFolder);
    const [activeImage, setActiveImage] = useState(images[0] || 'https://via.placeholder.com/800x600?text=No+Image');
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [activeTab, setActiveTab] = useState<'description' | 'specs'>('description');

    const imageRef = useRef<HTMLDivElement>(null);    const navigate = useNavigate();

    // SEO Title
    useEffect(() => {
        document.title = `${product.label} | NuExis`;
        // Scroll to top on load
        window.scrollTo(0, 0);
    }, [product]);

    // Reset zoom when image changes
    useEffect(() => {
        setZoom(1);
        setPosition({ x: 0, y: 0 });
    }, [activeImage]);

    // Cleanup drag listener
    useEffect(() => {
        const handleUp = () => setIsDragging(false);
        window.addEventListener('mouseup', handleUp);
        return () => window.removeEventListener('mouseup', handleUp);
    }, []);

    // Zoom Handlers
    const handleZoomIn = () => { setZoom(prev => Math.min(prev + 0.5, 4)); setPosition({ x: 0, y: 0 }); };
    const handleZoomOut = () => { setZoom(prev => Math.max(prev - 0.5, 1)); setPosition({ x: 0, y: 0 }); };
    const handleResetZoom = () => { setZoom(1); setPosition({ x: 0, y: 0 }); };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
        setZoom(1);
        setPosition({ x: 0, y: 0 });
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey) return;
        e.preventDefault();
        e.stopPropagation();
        const delta = e.deltaY > 0 ? -0.25 : 0.25;
        setZoom(prev => Math.min(Math.max(prev + delta, 1), 4));
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (zoom > 1) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && zoom > 1) {
            setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
        }
    };

    const handleActionClick = (action: () => void) => {
        action();
    };

    // Find related products (same category)
    const relatedProducts = useMemo(() => {
        // Collect all subcategories from the current series categories
        // Ideally filter by the same category first
        const allItems: ProductItem[] = [];
        Object.values(activeSeries.categories).forEach(cat => {
            if (cat.label === categoryLabel) {
                // Same category items
                allItems.push(...cat.subcategories);
            }
        });
        return allItems.filter(p => p.id !== product.id).slice(0, 4);
    }, [activeSeries, categoryLabel, product.id]);

    const breadcrumbs = [
        { label: 'Products', href: '/product' },
        { label: seriesLabel, href: `/product/${slugify(activeSeries.label)}` },
        { label: categoryLabel, href: `/product/${slugify(activeSeries.label)}/${slugify(categoryLabel)}` },
        { label: product.label, href: '#' }
    ];

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <Breadcrumbs items={breadcrumbs} />

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-12">
                    <div className="md:flex">
                        {/* Left: Image Gallery */}
                        <div className="md:w-3/5 lg:w-2/3 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200 p-6 lg:p-10 relative group">
                            <div className="relative h-[400px] lg:h-[600px] w-full bg-white rounded-xl shadow-inner border border-gray-100 overflow-hidden flex items-center justify-center">
                                {/* Grid Pattern Background */}
                                <div className="absolute inset-0 opacity-[0.03]"
                                    style={{ backgroundImage: `radial-gradient(#000 1px, transparent 1px)`, backgroundSize: '20px 20px' }}
                                />

                                <motion.div
                                    ref={imageRef}
                                    className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing z-10"
                                    onWheel={handleWheel}
                                    onMouseDown={handleMouseDown}
                                    onMouseMove={handleMouseMove}
                                    style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
                                >
                                    <motion.img
                                        key={activeImage}
                                        src={activeImage}
                                        alt={product.label}
                                        className="max-w-full max-h-full object-contain select-none shadow-xl"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: zoom, x: position.x, y: position.y }}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                </motion.div>

                                {/* Image Controls */}
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 backdrop-blur-md shadow-lg rounded-full px-4 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                                    <button onClick={handleZoomOut} className="p-2 hover:bg-gray-100 rounded-full text-gray-700 hover:text-brand-blue" title="Zoom Out"><ZoomOut className="w-4 h-4" /></button>
                                    <span className="text-xs font-mono text-gray-500 w-12 text-center">{Math.round(zoom * 100)}%</span>
                                    <button onClick={handleZoomIn} className="p-2 hover:bg-gray-100 rounded-full text-gray-700 hover:text-brand-blue" title="Zoom In"><ZoomIn className="w-4 h-4" /></button>
                                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                                    <button onClick={handleResetZoom} className="p-2 hover:bg-gray-100 rounded-full text-gray-700 hover:text-brand-blue" title="Reset"><Maximize2 className="w-4 h-4" /></button>
                                    <button onClick={toggleFullscreen} className="p-2 hover:bg-gray-100 rounded-full text-gray-700 hover:text-brand-blue" title="Fullscreen"><Monitor className="w-4 h-4" /></button>
                                </div>
                            </div>

                            {/* Thumbnails */}
                            {images.length > 1 && (
                                <div className="mt-6 flex justify-center gap-3 overflow-x-auto pb-2 px-4 no-scrollbar">
                                    {images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImage(img)}
                                            className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${activeImage === img ? 'border-brand-blue ring-2 ring-brand-blue/20 ring-offset-2' : 'border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100'}`}
                                        >
                                            <img src={img} alt="" className="w-full h-full object-cover bg-white" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right: Product Details */}
                        <div className="md:w-2/5 lg:w-1/3 p-8 lg:p-10 flex flex-col h-auto max-h-[calc(100vh-6rem)] overflow-y-auto sticky top-24 custom-scrollbar">
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-blue/10 text-brand-blue uppercase tracking-wide">
                                        {seriesLabel}
                                    </span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 uppercase tracking-wide">
                                        {categoryLabel}
                                    </span>
                                </div>
                                <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
                                    {product.label}
                                </h1>
                                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                                    {product.description || `Professional grade ${product.label} designed for seamless integration and superior performance in commercial environments.`}
                                </p>
                            </div>

                            {/* Tabs */}
                            <div className="flex border-b border-gray-200 mb-6">
                                <button
                                    onClick={() => setActiveTab('description')}
                                    className={`pb-3 mr-6 text-sm font-medium transition-colors relative ${activeTab === 'description' ? 'text-brand-blue' : 'text-gray-500 hover:text-gray-800'}`}
                                >
                                    Key Features
                                    {activeTab === 'description' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue" />}
                                </button>
                                <button
                                    onClick={() => setActiveTab('specs')}
                                    className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'specs' ? 'text-brand-blue' : 'text-gray-500 hover:text-gray-800'}`}
                                >
                                    Specifications
                                    {activeTab === 'specs' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue" />}
                                </button>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex-grow mb-8"
                                >
                                    {activeTab === 'description' ? (
                                        <ul className="space-y-3">
                                            {[1, 2, 3, 4].map((i) => (
                                                <li key={i} className="flex items-start">
                                                    <CheckCircle2 className="w-5 h-5 text-brand-blue mt-0.5 mr-3 flex-shrink-0" />
                                                    <span className="text-gray-700 text-sm">
                                                        High-durability construction suitable for 24/7 operation in demanding environments.
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="bg-gray-50 rounded-lg p-4 text-sm font-mono text-gray-700 border border-gray-200">
                                            {product.specs ? (
                                                <table className="w-full">
                                                    <tbody>
                                                        {product.specs.map((s, i) => (
                                                            <tr key={i} className="border-b border-gray-200 last:border-0">
                                                                <td className="py-2 text-gray-500">{s.label}</td>
                                                                <td className="py-2 font-semibold text-right">{s.value}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <div className="text-center py-4 text-gray-500">
                                                    Detailed specifications sheet available for download.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            {/* Actions */}
                            <div className="mt-auto space-y-3">
                                <button
                                    onClick={() => handleActionClick(() => console.log("Request Quote"))}
                                    className="w-full group relative flex items-center justify-center py-4 px-6 border border-transparent rounded-xl text-white bg-brand-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue font-semibold shadow-lg shadow-brand-blue/30 transition-all transform hover:-translate-y-0.5"
                                >
                                    Request a Quote
                                    <ChevronRight className="ml-2 w-5 h-5 opacity-80 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleActionClick(() => console.log("Download Specs"))}
                                        className="flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue transition-colors"
                                    >
                                        <FileText className="mr-2 w-4 h-4 text-gray-500" />
                                        Specs
                                    </button>
                                    <button
                                        onClick={() => console.log("Share")}
                                        className="flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue transition-colors"
                                    >
                                        <Share2 className="mr-2 w-4 h-4 text-gray-500" />
                                        Share
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-16">
                        <SectionTitle title="Related Products" subtitle={`More from ${categoryLabel}`} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map((item, idx) => (
                                <Link
                                    key={item.id}
                                    to={`/product/${slugify(activeSeries.label)}/${slugify(categoryLabel)}/${item.id}`}
                                    className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
                                    onClick={() => window.scrollTo(0, 0)}
                                >
                                    <div className="aspect-square bg-gray-100 p-6 flex items-center justify-center relative overflow-hidden">
                                        <div className="absolute inset-0 bg-brand-blue/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <Box className="w-12 h-12 text-brand-blue/40 group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900 group-hover:text-brand-blue transition-colors truncate">{item.label}</h3>
                                        <div className="flex items-center text-sm text-brand-blue mt-2 font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                            View Details <ChevronRight className="w-3 h-3 ml-1" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Fullscreen Overlay */}
            <AnimatePresence>
                {isFullscreen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
                        onClick={toggleFullscreen}
                    >
                        <button onClick={toggleFullscreen} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"><X className="w-6 h-6" /></button>
                        <motion.img
                            initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                            src={activeImage}
                            alt="Fullscreen"
                            className="max-w-full max-h-[85vh] object-contain shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        />
                        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 overflow-x-auto px-4 py-2">
                            {images.map((img, idx) => (
                                <button key={idx} onClick={(e) => { e.stopPropagation(); setActiveImage(img); }} className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 transition-all ${activeImage === img ? 'border-brand-blue scale-110' : 'border-white/30 hover:border-white/60'}`}>
                                    <img src={img} className="w-full h-full object-cover rounded-lg" />
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- Main Page Component ---
// Modified Display Item Type
type DisplayItem =
    | { type: 'item'; label: string; href: string; imageFolder?: string; id: string; description?: string }
    | { type: 'category'; label: string; href: string; count: number; subLabels: string[] };

const DynamicProductPage: React.FC = () => {
    const { series, category, item } = useParams<{ series: string; category: string; item: string }>();
    const navigate = useNavigate();

    // 1. Find Series
    const activeSeriesKey = Object.keys(productCatalog).find(key => slugify(productCatalog[key].label) === series);
    const activeSeries = activeSeriesKey ? productCatalog[activeSeriesKey] : null;

    useEffect(() => {
        if (activeSeries) {
            document.title = `${activeSeries.label} | NuExis`;
        } else {
            document.title = `Products | NuExis`;
        }
    }, [activeSeries, category, item]);

    if (!activeSeries) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                        <Box className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Product Not Found</h1>
                    <p className="text-gray-600 mb-8">The product series you are looking for does not exist or has been moved.</p>
                    <Link to="/" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-brand-blue hover:bg-blue-700 transition-colors shadow-lg shadow-brand-blue/20">
                        Return Home
                    </Link>
                </div>
            </div>
        );
    }

    // 2. Resolve Active Category & Item
    let activeCategory: CategoryNode | null = null;
    let activeItem: ProductItem | null = null;

    if (category) {
        // Try precise matching first
        const catKey = Object.keys(activeSeries.categories).find(key => slugify(activeSeries.categories[key].label) === category);

        if (catKey) {
            // It's a category
            activeCategory = activeSeries.categories[catKey];
            if (item) {
                activeItem = activeCategory.subcategories.find(p => p.id === item) || null;
            }
        } else {
            // Check direct item link (series -> item) in case URL skipping category? 
            // OR maybe "category" param IS the item ID (if the router allows optional category)
            // But based on user current code it seems it tries to find category first.
            // Let's keep the logic: search if "category" is actually an item ID in one of the categories
            for (const cat of Object.values(activeSeries.categories)) {
                const found = cat.subcategories.find(p => p.id === category);
                if (found) {
                    activeItem = found;
                    activeCategory = cat;
                    break;
                }
            }
        }
    }

    // Render Detailed View
    if (activeItem && activeCategory) {
        return <DetailedProductView product={activeItem} seriesLabel={activeSeries.label} categoryLabel={activeCategory.label} activeSeries={activeSeries} />;
    }

    // Render Grid View (Category or Series Level)
    const pageTitle = activeCategory ? activeCategory.label : activeSeries.label;
    const itemsToDisplay: DisplayItem[] = useMemo(() => {
        if (activeCategory) {
            // Flat List of Items in Category
            return activeCategory.subcategories.map(subItem => ({
                label: subItem.label,
                id: subItem.id,
                href: `/product/${slugify(activeSeries.label)}/${slugify(activeCategory!.label)}/${subItem.id}`,
                type: 'item',
                imageFolder: subItem.imageFolder,
                description: subItem.description
            }));
        } else {
            // List of Categories
            return Object.entries(activeSeries.categories).map(([key, cat]) => ({
                label: cat.label,
                count: cat.subcategories.length,
                subLabels: cat.subcategories.slice(0, 3).map(s => s.label),
                href: `/product/${slugify(activeSeries.label)}/${slugify(cat.label)}`,
                type: 'category'
            }));
        }
    }, [activeSeries, activeCategory]);

    // Breadcrumbs for Grid
    const gridBreadcrumbs = activeCategory
        ? [
            { label: 'Products', href: '/product' },
            { label: activeSeries.label, href: `/product/${slugify(activeSeries.label)}` },
            { label: activeCategory.label, href: '#' }
        ]
        : [{ label: 'Products', href: '/product' }, { label: activeSeries.label, href: '#' }];

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <Breadcrumbs items={gridBreadcrumbs} />

                <div className="mb-10 text-center md:text-left">
                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight"
                    >
                        {pageTitle}
                    </motion.h1>
                    <div className="h-1.5 w-24 bg-brand-blue rounded-full mx-auto md:mx-0"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {itemsToDisplay.map((item, index) => (
                        <motion.div
                            key={item.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Link
                                to={item.href}
                                className="group block bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col"
                            >
                                <div className="aspect-[16/10] bg-gray-100 relative overflow-hidden flex items-center justify-center p-8 border-b border-gray-50">
                                    {item.type === 'item' && item.imageFolder ? (
                                        (() => {
                                            const imgs = getImagesForFolder(item.imageFolder);
                                            return imgs[0] ? (
                                                <img src={imgs[0]} alt={item.label} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="text-brand-blue opacity-50"><Box className="w-16 h-16" /></div>
                                            );
                                        })()
                                    ) : (
                                        <div className="text-brand-blue opacity-50 group-hover:scale-110 transition-transform duration-500">
                                            {item.type === 'category' ? <Grid className="w-16 h-16" /> : <Box className="w-16 h-16" />}
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-brand-blue transition-colors leading-tight">
                                            {item.label}
                                        </h3>
                                        {item.type === 'category' && (
                                            <span className="flex-shrink-0 px-2.5 py-1 bg-brand-blue/10 text-brand-blue text-xs font-bold rounded-full">
                                                {item.count}
                                            </span>
                                        )}
                                    </div>

                                    {item.type === 'category' && item.subLabels && (
                                        <div className="mb-4 flex flex-wrap gap-2">
                                            {item.subLabels.map(label => (
                                                <span key={label} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{label}</span>
                                            ))}
                                            {item.count > 3 && <span className="text-xs text-gray-400 px-1 py-1">+{item.count - 3} more</span>}
                                        </div>
                                    )}

                                    {item.type === 'item' && (
                                        <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                                            {item.description || `Professional grade ${item.label} designed for seamless integration.`}
                                        </p>
                                    )}

                                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center text-sm font-semibold text-brand-blue">
                                        {item.type === 'category' ? 'Browse Collection' : 'View Details'}
                                        <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {itemsToDisplay.length === 0 && (
                    <div className="text-center py-32">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                            <Box className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No products found</h3>
                        <p className="mt-1 text-gray-500">Check back later for new additions to this series.</p>
                        <div className="mt-6">
                            <Link to="/" className="text-brand-blue hover:underline font-medium">Browse other series</Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DynamicProductPage;
