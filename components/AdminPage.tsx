import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Shield, Menu, X, ChevronRight, Layers, Image as ImageIcon, Inbox, Bell, Download, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { exportAppData } from '../lib/exportHelper';
import toast from 'react-hot-toast';
import AdminProductsPanel from './AdminProductsPanel';
import AdminSoftwarePanel from './AdminSoftwarePanel';
import AdminGalleryPanel from './AdminGalleryPanel';
import AdminRequestsPanel from './AdminRequestsPanel';
import AdminCarouselPanel from './AdminCarouselPanel';
import AdminHeroCarouselPanel from './AdminHeroCarouselPanel';

// ── Sidebar items — add more entries here as new features are built ─────────────
const sidebarItems = [
  { id: 'products', label: 'Products', icon: Package },
  { id: 'software', label: 'Software', icon: Layers },
  { id: 'gallery', label: 'Gallery', icon: ImageIcon },
  { id: 'carousel', label: 'Carousel (Logos)', icon: ImageIcon },
  { id: 'hero_carousel', label: 'Carousel (Landing Page)', icon: ImageIcon },
  { id: 'requests', label: 'Requests', icon: Inbox },
];

// ── Panel registry ─────────────────────────────────────────────────────────────
const panels: Record<string, React.ReactNode> = {
  products: <AdminProductsPanel />,
  software: <AdminSoftwarePanel />,
  gallery: <AdminGalleryPanel />,
  carousel: <AdminCarouselPanel />,
  hero_carousel: <AdminHeroCarouselPanel />,
  requests: <AdminRequestsPanel />,
};

// ── AdminPage ──────────────────────────────────────────────────────────────────
const AdminPage: React.FC = () => {
  const { profile } = useAuth();
  const [activeSection, setActiveSection] = useState('products');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadRequests, setUnreadRequests] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  
  const handleDownloadData = async () => {
    if (isExporting) return;
    setIsExporting(true);
    let toastId = toast.loading('Starting export...');
    try {
      await exportAppData((msg) => toast.loading(msg, { id: toastId }));
    } finally {
      setIsExporting(false);
      toast.dismiss(toastId);
    }
  };

  useEffect(() => {
    // Top-level realtime listener for incoming catalog requests
    const channel = supabase.channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'catalog_requests' },
        (payload) => {
          const email = payload.new.email;
          toast.success(
            <div>
               <b>New Request</b><br />
               <span className="text-sm">{email} requested access.</span>
            </div>,
            { icon: <Bell className="w-5 h-5 text-brand-blue" />, duration: 5000 }
          );
          setUnreadRequests(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const displayName = profile?.full_name || profile?.email || 'Admin';
  const activeLabel = sidebarItems.find(i => i.id === activeSection)?.label ?? '';

  return (
    <div className="min-h-screen bg-gray-50 pt-20 flex">

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 min-h-[calc(100vh-5rem)] border-r border-black/5 bg-white shadow-sm">
        {/* User pill */}
        <div className="px-5 py-5 border-b border-black/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-blue text-white flex items-center justify-center font-bold text-base shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{profile?.full_name || 'Admin'}</p>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-brand-blue/10 text-brand-blue px-2 py-0.5 rounded-full tracking-widest uppercase">
                <Shield className="w-2.5 h-2.5" /> Admin
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {sidebarItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                 setActiveSection(id);
                 if (id === 'requests') setUnreadRequests(0);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                activeSection === id
                  ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/25'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">{label}</span>
              {id === 'requests' && unreadRequests > 0 && (
                 <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-5 text-center">
                    {unreadRequests}
                 </span>
              )}
              {activeSection === id && <ChevronRight className="w-4 h-4 ml-auto opacity-70" />}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-black/5 space-y-3">
          <button 
             onClick={handleDownloadData}
             disabled={isExporting}
             className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
             {isExporting ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <Download className="w-4 h-4 shrink-0" />}
             {isExporting ? 'Exporting...' : 'Download App Data'}
          </button>
          <p className="text-xs text-gray-400 text-center">NuExis Admin v1.0</p>
        </div>
      </aside>

      {/* ── Mobile Sidebar Drawer ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              key="drawer"
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 z-50 w-64 h-full bg-white shadow-2xl lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-blue text-white flex items-center justify-center font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 truncate max-w-[130px]">{profile?.full_name || 'Admin'}</p>
                    <span className="text-[10px] font-bold text-brand-blue uppercase tracking-widest">Admin</span>
                  </div>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 px-3 py-4 space-y-1">
                {sidebarItems.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => { 
                       setActiveSection(id); 
                       setSidebarOpen(false); 
                       if (id === 'requests') setUnreadRequests(0);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      activeSection === id
                        ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/25'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="flex-1 text-left">{label}</span>
                    {id === 'requests' && unreadRequests > 0 && (
                       <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-5 text-center">
                          {unreadRequests}
                       </span>
                    )}
                  </button>
                ))}
              </nav>

              <div className="px-5 py-4 border-t border-black/5">
                <button 
                   onClick={handleDownloadData}
                   disabled={isExporting}
                   className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                   {isExporting ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <Download className="w-4 h-4 shrink-0" />}
                   {isExporting ? 'Exporting...' : 'Download App Data'}
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top bar / breadcrumb */}
        <div className="bg-white/90 backdrop-blur-md border-b border-black/5 px-6 py-3.5 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-500 select-none">
            <Shield className="w-4 h-4 text-brand-blue" />
            <span className="font-semibold text-gray-900">Admin</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <span className="font-medium text-gray-700">{activeLabel}</span>
          </div>
        </div>

        {/* Panel */}
        <main className="flex-1 px-6 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
            >
              {panels[activeSection]}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminPage;
