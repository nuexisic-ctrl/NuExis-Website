import React, { useState } from 'react';
import { Search, Filter, ChevronDown, X, Eye, Monitor, Hand, Presentation, Users, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

// Import Images
import poleStandieImg from '@/images/Products/Pole Standie/Pole Standie 5.webp';
import digitalMSPodiumImg from '@/images/Products/Digital MS Podium/Digital MS Podium 5.webp';
import woodenDisplayPodiumImg from '@/images/Products/Wooden Display Podium/Wooden Display Podium 4.webp';
import digitalAudioSignalProcessorImg from '@/images/Products/Digital Audio Signal Processor/Digital Audio Signal Processor 3.webp';
import speakersImg from '@/images/Products/Speakers/Speakers 4.webp';
import interpreterConsoleImg from '@/images/Products/Interpreter Console/Interpreter Console 4.webp';
import aTypeStandieImg from '@/images/Products/A Type Standie/A Type Standie 6.webp';
import tTypeStandieImg from '@/images/Products/T Type Standie/T Type Standie 4.webp';
import informationKioskImg from '@/images/Products/Information Kiosk/Information kiosk 5.webp';
import amplifierImg from '@/images/Products/Amplifier/Amplifier 5.webp';
import vcBarImg from '@/images/Products/VC Bar/VC Bar 5.webp'; // ADDED: VC Bar Image Import
import digitalTouchDelegateMicrophoneImg from '@/images/Products/Digital Touch Delegate Microphone/Digital Touch Delegate Microphone 3.webp';
import digitalTouchChairpersonMicrophoneImg from '@/images/Products/Digital Touch Chairperson Microphone/Digital Touch Chairperson Microphone 3.webp';

// Product interface
interface Product {
  id: number;
  name: string;
  category: string;
  image: string;
  specs: {
    label: string;
    value: string;
  }[];
}

// Real product data from user
const productData: Product[] = [
  // Digital Signage Series
  {
    id: 1, name: "A Type Standie", category: "Digital Signage Series",
    image: aTypeStandieImg,
    specs: [
      { label: "Type", value: "Digital Signage" },
      { label: "Mounting", value: "Floor Standing" },
      { label: "Application", value: "Public Display" }
    ]
  },
  {
    id: 2, name: "T Type Standie", category: "Digital Signage Series",
    image: tTypeStandieImg,
    specs: [
      { label: "Type", value: "Digital Signage" },
      { label: "Mounting", value: "Floor Standing" },
      { label: "Application", value: "Information Display" }
    ]
  },
  {
    id: 3, name: "Pole Standie", category: "Digital Signage Series",
    image: poleStandieImg,
    specs: [
      { label: "Type", value: "Digital Signage" },
      { label: "Mounting", value: "Pole Mounted" },
      { label: "Application", value: "Public Display" }
    ]
  },

  // Touch Displays
  {
    id: 4, name: "Capacitive Overlay", category: "Touch Displays",
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=2070&auto=format&fit=crop",
    specs: [
      { label: "Technology", value: "Capacitive Touch" },
      { label: "Type", value: "Touch Overlay" },
      { label: "Application", value: "Interactive Display" }
    ]
  },
  {
    id: 5, name: "Information Kiosk", category: "Touch Displays",
    image: informationKioskImg,
    specs: [
      { label: "Type", value: "Interactive Kiosk" },
      { label: "Technology", value: "Touch Screen" },
      { label: "Application", value: "Self-Service" }
    ]
  },
  {
    id: 6, name: "Infrared Touch Frame", category: "Touch Displays",
    image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=2069&auto=format&fit=crop",
    specs: [
      { label: "Technology", value: "Infrared Touch" },
      { label: "Type", value: "Touch Frame" },
      { label: "Application", value: "Large Format Display" }
    ]
  },

  // Digital Podium
  {
    id: 7, name: "Digital MS Podium", category: "Digital Podium",
    image: digitalMSPodiumImg,
    specs: [
      { label: "Type", value: "Digital Podium" },
      { label: "Material", value: "Metal Structure" },
      { label: "Application", value: "Conference Room" }
    ]
  },
  {
    id: 8, name: "Wooden Display Podium", category: "Digital Podium",
    image: woodenDisplayPodiumImg,
    specs: [
      { label: "Type", value: "Digital Podium" },
      { label: "Material", value: "Wooden Finish" },
      { label: "Application", value: "Executive Office" }
    ]
  },
  {
    id: 9, name: "PA Podium", category: "Digital Podium",
    image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2012&auto=format&fit=crop",
    specs: [
      { label: "Type", value: "Public Address Podium" },
      { label: "Features", value: "Audio System" },
      { label: "Application", value: "Public Speaking" }
    ]
  },

  // Digital Conference Series
  {
    id: 10, name: "Digital Discussion Controller", category: "Digital Conference Series",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop",
    specs: [
      { label: "Type", value: "Conference Controller" },
      { label: "Technology", value: "Digital Control" },
      { label: "Application", value: "Meeting Management" }
    ]
  },
  {
    id: 11, name: "Digital Touch Delegate Microphone", category: "Digital Conference Series",
    image: digitalTouchDelegateMicrophoneImg,
    specs: [
      { label: "Type", value: "Touch Microphone" },
      { label: "Technology", value: "Digital Touch" },
      { label: "Application", value: "Delegate Speaking" }
    ]
  },
  {
    id: 12, name: "Digital Audio Signal Processor", category: "Digital Conference Series",
    image: digitalAudioSignalProcessorImg,
    specs: [
      { label: "Type", value: "Audio Processor" },
      { label: "Technology", value: "Digital Signal Processing" },
      { label: "Application", value: "Audio Management" }
    ]
  },
  {
    id: 19, name: "Digital Touch Chairperson Microphone", category: "Digital Conference Series",
    image: digitalTouchChairpersonMicrophoneImg,
    specs: [
      { label: "Type", value: "Chairperson Microphone" },
      { label: "Technology", value: "Digital Touch" },
      { label: "Application", value: "Chairperson Control" }
    ]
  },
  {
    id: 14, name: "Interpreter Console", category: "Digital Conference Series",
    image: interpreterConsoleImg,
    specs: [
      { label: "Type", value: "Interpreter Station" },
      { label: "Technology", value: "Multi-language Support" },
      { label: "Application", value: "Simultaneous Translation" }
    ]
  },
  {
    id: 15, name: "VC Bar", category: "Digital Conference Series",
    image: vcBarImg, // CHANGED: Updated to use the imported local image
    specs: [
      { label: "Type", value: "Video Conference Bar" },
      { label: "Technology", value: "Video Conferencing" },
      { label: "Application", value: "Remote Meetings" }
    ]
  },

  // Pro Audio System
  {
    id: 16, name: "Wired/Wireless Microphones", category: "Pro Audio System",
    image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=2070&auto=format&fit=crop",
    specs: [
      { label: "Type", value: "Professional Microphones" },
      { label: "Connectivity", value: "Wired & Wireless" },
      { label: "Application", value: "Audio Recording" }
    ]
  },
  {
    id: 17, name: "Speakers", category: "Pro Audio System",
    image: speakersImg,
    specs: [
      { label: "Type", value: "Professional Speakers" },
      { label: "Technology", value: "High-Fidelity Audio" },
      { label: "Application", value: "Sound Reinforcement" }
    ]
  },
  {
    id: 18, name: "Amplifier", category: "Pro Audio System",
    image: amplifierImg,
    specs: [
      { label: "Type", value: "Audio Amplifier" },
      { label: "Technology", value: "Power Amplification" },
      { label: "Application", value: "Audio Enhancement" }
    ]
  }
];

// Get unique categories
const categories = Array.from(new Set(productData.map(p => p.category)));

// Category icons mapping
const categoryIcons: { [key: string]: any } = {
  "Digital Signage Series": Monitor,
  "Touch Displays": Hand,
  "Digital Podium": Presentation,
  "Digital Conference Series": Users,
  "Pro Audio System": Volume2
};

const DisplayPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  // Filtering Logic
  const filteredProducts = productData.filter(product => {
    const matchesSearch = searchQuery === '' ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.specs.some(spec =>
        spec.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spec.value.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesCategory = selectedCategory === 'All Categories' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group products by category
  const groupedProducts: { [key: string]: Product[] } = {};
  filteredProducts.forEach(product => {
    if (!groupedProducts[product.category]) {
      groupedProducts[product.category] = [];
    }
    groupedProducts[product.category].push(product);
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Categories');
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 pt-32 pb-12">

      {/* --- Header Section --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Siwtching and Controls</h1>
        </motion.div>
      </div>

      {/* --- Search & Filters (Non-Sticky) --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-white/80 backdrop-blur-xl border border-black/10 rounded-xl p-3 sm:p-4 shadow-lg">

          <div className="flex flex-col md:flex-row gap-3 items-center">
            {/* Search Bar */}
            <div className="relative w-full md:flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-black/10 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-brand-blue transition-colors"
              />
            </div>

            {/* Category Filter */}
            <div className="w-full md:w-56">
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full appearance-none bg-white border border-black/20 text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-blue cursor-pointer hover:bg-gray-50 hover:border-black/30 transition-colors"
                  style={{
                    backgroundImage: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none'
                  }}
                >
                  <option value="All Categories" className="bg-white text-gray-900">All Categories</option>
                  {categories.map(c => <option key={c} value={c} className="bg-white text-gray-900">{c}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* Clear Button */}
            <button
              onClick={clearFilters}
              className="w-full md:w-auto bg-black/5 hover:bg-brand-blue text-gray-900 hover:text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium border border-black/5 text-sm"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* --- Products by Category --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {Object.keys(groupedProducts).length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
            <button onClick={clearFilters} className="mt-4 text-brand-blue hover:underline">Reset Filters</button>
          </div>
        ) : (
          Object.entries(groupedProducts).map(([category, products]) => {
            const IconComponent = categoryIcons[category] || Monitor;
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-1.5 bg-brand-blue/10 rounded-lg border border-brand-blue/20">
                    <IconComponent className="w-4 h-4 text-brand-blue" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{category}</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-black/10 to-transparent"></div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="group bg-white border border-black/10 rounded-xl overflow-hidden hover:border-brand-blue/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(22,66,117,0.1)] flex flex-col"
                    >
                      {/* Product Image */}
                      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>

                      {/* Product Info */}
                      <div className="p-4 flex flex-col flex-grow">
                        <h3 className="text-base font-bold text-gray-900 mb-3 group-hover:text-brand-blue transition-colors">
                          {product.name}
                        </h3>

                        {/* View Button - Large and Blue */}
                        <div className="mt-auto">
                          {product.id === 3 ? (
                            <Link
                              to="/pole_standie"
                              className="w-full bg-brand-blue text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md text-sm"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </Link>
                          ) : product.id === 7 ? (
                            <Link
                              to="/digital_ms_podium"
                              className="w-full bg-brand-blue text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md text-sm"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </Link>
                          ) : product.id === 8 ? (
                            <Link
                              to="/wooden_display_podium"
                              className="w-full bg-brand-blue text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md text-sm"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </Link>
                          ) : product.id === 12 ? (
                            <Link
                              to="/digital_audio_signal_processor"
                              className="w-full bg-brand-blue text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md text-sm"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </Link>

                          ) : product.id === 14 ? (
                            <Link
                              to="/interpreter_console"
                              className="w-full bg-brand-blue text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md text-sm"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </Link>
                          ) : product.id === 18 ? (
                            <Link
                              to="/amplifier"
                              className="w-full bg-brand-blue text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md text-sm"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </Link>
                          ) : product.id === 1 ? (
                            <Link
                              to="/a_type_standie"
                              className="w-full bg-brand-blue text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md text-sm"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </Link>
                          ) : product.id === 2 ? (
                            <Link
                              to="/t_type_standie"
                              className="w-full bg-brand-blue text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md text-sm"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </Link>
                          ) : product.id === 5 ? (
                            <Link
                              to="/information_kiosk"
                              className="w-full bg-brand-blue text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md text-sm"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </Link>
                          ) : product.id === 11 ? (
                            <Link
                              to="/digital_touch_delegate_microphone"
                              className="w-full bg-brand-blue text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md text-sm"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </Link>
                          ) : product.id === 15 ? ( // ADDED: Logic for VC Bar Page
                            <Link
                              to="/vc_bar"
                              className="w-full bg-brand-blue text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md text-sm"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </Link>
                          ) : (
                            <button
                              className="w-full bg-brand-blue text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md text-sm"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })
        )}
      </div >

    </div >
  );
};

export default DisplayPage;