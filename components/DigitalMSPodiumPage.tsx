import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ZoomIn, ZoomOut, Maximize2, X } from 'lucide-react';
import { Link } from 'react-router-dom';

// Import images
import mainImage from '@/images/Products/Digital MS Podium/Digital MS Podium 5.webp';
import img1 from '@/images/Products/Digital MS Podium/Digital MS Podium 1.webp';
import img2 from '@/images/Products/Digital MS Podium/Digital MS Podium 2.webp';
import img3 from '@/images/Products/Digital MS Podium/Digital MS Podium 3.webp';
import img4 from '@/images/Products/Digital MS Podium/Digital MS Podium 4.webp';

const allImages = [mainImage, img1, img2, img3, img4];

const DigitalMSPodiumPage: React.FC = () => {
    const [activeImage, setActiveImage] = useState(mainImage);
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isFullscreen, setIsFullscreen] = useState(false);
    const imageRef = useRef<HTMLDivElement>(null);
    // Reset zoom and position when changing images
    useEffect(() => {
        setZoom(1);
        setPosition({ x: 0, y: 0 });
    }, [activeImage]);

    // Reset position to center when zoom changes
    useEffect(() => {
        if (zoom === 1) {
            setPosition({ x: 0, y: 0 });
        }
    }, [zoom]);

    // Zoom controls - always center image
    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + 0.5, 4));
        setPosition({ x: 0, y: 0 });
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev - 0.5, 1));
        setPosition({ x: 0, y: 0 });
    };

    const handleResetZoom = () => {
        setZoom(1);
        setPosition({ x: 0, y: 0 });
    };

    // Toggle fullscreen
    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
        setZoom(1);
        setPosition({ x: 0, y: 0 });
    };

    // Mouse wheel zoom - prevent browser zoom and center image
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Prevent browser zoom (Ctrl+wheel)
        if (e.ctrlKey) {
            return;
        }

        if (e.deltaY < 0) {
            setZoom(prev => {
                const newZoom = Math.min(prev + 0.5, 4);
                setPosition({ x: 0, y: 0 });
                return newZoom;
            });
        } else {
            setZoom(prev => {
                const newZoom = Math.max(prev - 0.5, 1);
                setPosition({ x: 0, y: 0 });
                return newZoom;
            });
        }
    };

    // Pan functionality
    const handleMouseDown = (e: React.MouseEvent) => {
        if (zoom > 1) {
            setIsDragging(true);
            setDragStart({
                x: e.clientX - position.x,
                y: e.clientY - position.y
            });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && zoom > 1) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleActionClick = (action: () => void) => {
        action();
    };

    return (
        <>
            <div className="min-h-screen bg-gray-50 pt-16 pb-8">
                <div className="max-w-5xl mx-auto px-4">

                    {/* Back Button */}
                    <div className="mb-3">
                        <Link to="/display" className="inline-flex items-center text-gray-600 hover:text-brand-blue transition-colors text-xs font-medium">
                            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                            Back to Products
                        </Link>
                    </div>

                    {/* Compact Product Card */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">

                        {/* Header - More Compact */}
                        <div className="px-5 py-3 border-b border-gray-200 bg-gray-50/50">
                            <span className="inline-block px-2 py-0.5 bg-brand-blue/10 text-brand-blue text-[10px] font-semibold rounded mb-1.5">
                                DIGITAL PODIUM
                            </span>
                            <h1 className="text-xl font-bold text-gray-900">
                                Digital MS Podium
                            </h1>
                        </div>

                        {/* Main Content - Compact Grid */}
                        <div className="p-4">
                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

                                {/* Left: Image Gallery - Takes 3 columns */}
                                <div className="lg:col-span-3">

                                    {/* Main Image with Zoom/Pan - Reduced Height */}
                                    <div className="relative mb-2">
                                        <motion.div
                                            ref={imageRef}
                                            key={activeImage}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.3 }}
                                            className="relative h-64 bg-gray-50 rounded-lg overflow-hidden border border-gray-200"
                                            onWheel={handleWheel}
                                            onMouseDown={handleMouseDown}
                                            onMouseMove={handleMouseMove}
                                            onMouseUp={handleMouseUp}
                                            onMouseLeave={handleMouseUp}
                                            style={{
                                                cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                                                touchAction: 'none',
                                                userSelect: 'none',
                                                WebkitUserSelect: 'none'
                                            }}
                                        >
                                            <img
                                                src={activeImage}
                                                alt="Digital MS Podium"
                                                className="absolute inset-0 w-full h-full object-contain transition-transform duration-200 select-none"
                                                style={{
                                                    transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                                                    transformOrigin: 'center'
                                                }}
                                                draggable={false}
                                            />
                                        </motion.div>

                                        {/* Compact Zoom Controls */}
                                        <div className="absolute bottom-2 right-2 flex gap-0.5 bg-white/95 backdrop-blur-sm rounded-md p-0.5 shadow-md">
                                            <button
                                                onClick={handleZoomOut}
                                                disabled={zoom <= 1}
                                                className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                title="Zoom Out"
                                            >
                                                <ZoomOut className="w-3.5 h-3.5 text-gray-700" />
                                            </button>
                                            <button
                                                onClick={handleResetZoom}
                                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                                title="Reset"
                                            >
                                                <Maximize2 className="w-3.5 h-3.5 text-gray-700" />
                                            </button>
                                            <button
                                                onClick={handleZoomIn}
                                                disabled={zoom >= 4}
                                                className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                title="Zoom In"
                                            >
                                                <ZoomIn className="w-3.5 h-3.5 text-gray-700" />
                                            </button>
                                        </div>

                                        {/* Fullscreen Button */}
                                        <button
                                            onClick={toggleFullscreen}
                                            className="absolute top-2 right-2 p-1 bg-white/95 backdrop-blur-sm rounded-md shadow-md hover:bg-gray-100 transition-colors"
                                            title="View Fullscreen"
                                        >
                                            <Maximize2 className="w-3.5 h-3.5 text-gray-700" />
                                        </button>

                                        {/* Compact Zoom Indicator */}
                                        {zoom > 1 && (
                                            <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm px-1.5 py-0.5 rounded shadow-md">
                                                <span className="text-[10px] font-semibold text-gray-700">{Math.round(zoom * 100)}%</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Thumbnail Gallery - 5 Images */}
                                    <div className="grid grid-cols-5 gap-1.5">
                                        {allImages.map((img, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setActiveImage(img)}
                                                className={`aspect-square rounded-md overflow-hidden border transition-all ${activeImage === img
                                                    ? 'border-brand-blue ring-1 ring-brand-blue/30'
                                                    : 'border-gray-300 hover:border-gray-400'
                                                    }`}
                                            >
                                                <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>

                                    {/* Compact Hint */}
                                    <p className="text-[10px] text-gray-500 mt-1.5 text-center">
                                        Scroll to zoom • Drag to pan • Click fullscreen icon
                                    </p>
                                </div>

                                {/* Right: Product Info - Takes 2 columns */}
                                <div className="lg:col-span-2 flex flex-col">
                                    <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                                        Professional metal-structured digital podium for conferences, presentations, and corporate meetings.
                                    </p>

                                    {/* Compact Features List */}
                                    <div className="mb-4 flex-grow">
                                        <h3 className="text-[10px] font-bold text-gray-900 uppercase tracking-wide mb-1.5">Key Features</h3>
                                        <ul className="space-y-1 text-xs text-gray-700">
                                            <li className="flex items-center">
                                                <span className="w-1 h-1 bg-brand-blue rounded-full mr-1.5"></span>
                                                Metal structure design
                                            </li>
                                            <li className="flex items-center">
                                                <span className="w-1 h-1 bg-brand-blue rounded-full mr-1.5"></span>
                                                Integrated display screen
                                            </li>
                                            <li className="flex items-center">
                                                <span className="w-1 h-1 bg-brand-blue rounded-full mr-1.5"></span>
                                                Cable management system
                                            </li>
                                            <li className="flex items-center">
                                                <span className="w-1 h-1 bg-brand-blue rounded-full mr-1.5"></span>
                                                Document camera ready
                                            </li>
                                            <li className="flex items-center">
                                                <span className="w-1 h-1 bg-brand-blue rounded-full mr-1.5"></span>
                                                Professional finish
                                            </li>
                                        </ul>
                                    </div>

                                    {/* Compact CTA Buttons */}
                                    <div className="space-y-1.5">
                                        <button
                                            onClick={() => handleActionClick(() => console.log('Request Quote'))}
                                            className="w-full bg-brand-blue text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-xs shadow-sm"
                                        >
                                            Request Quote
                                        </button>
                                        <button
                                            onClick={() => handleActionClick(() => console.log('View Specifications'))}
                                            className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-1.5 rounded-lg font-medium hover:bg-gray-50 transition-colors text-xs"
                                        >
                                            Specification
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fullscreen Modal */}
            <AnimatePresence>
                {isFullscreen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
                        onClick={toggleFullscreen}
                    >
                        {/* Close Button */}
                        <button
                            onClick={toggleFullscreen}
                            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors z-10"
                            title="Close Fullscreen"
                        >
                            <X className="w-6 h-6 text-white" />
                        </button>

                        {/* Fullscreen Image Container */}
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="relative max-w-7xl max-h-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={activeImage}
                                alt="Digital MS Podium - Fullscreen"
                                className="max-w-full max-h-[90vh] object-contain"
                            />

                            {/* Thumbnail Navigation in Fullscreen */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 backdrop-blur-sm p-2 rounded-lg">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveImage(img);
                                        }}
                                        className={`w-12 h-12 rounded-md overflow-hidden border-2 transition-all ${activeImage === img
                                            ? 'border-brand-blue ring-2 ring-brand-blue/50'
                                            : 'border-white/30 hover:border-white/60'
                                            }`}
                                    >
                                        <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default DigitalMSPodiumPage;
