import React, { useEffect, Suspense, lazy, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import ClientLogos from './components/ClientLogos';
import SmoothScrollWrapper from './components/SmoothScrollWrapper';
import GlobalBackground from './components/GlobalBackground';
import LoadingSpinner from './components/LoadingSpinner';
import { AuthProvider } from './context/AuthContext';
import { CatalogProvider } from './context/CatalogContext';
import AuthModal from './components/AuthModal';

// Lazy Load Components
const About = lazy(() => import('./components/About'));
const WhyChooseUs = lazy(() => import('./components/WhyChooseUs'));
const MissionValues = lazy(() => import('./components/MissionValues'));
const Testimonials = lazy(() => import('./components/Testimonials'));

const FAQ = lazy(() => import('./components/FAQ'));
const Footer = lazy(() => import('./components/Footer'));

// New Pages
const NotFoundPage = lazy(() => import('./components/NotFoundPage'));
const SupportPage = lazy(() => import('./components/SupportPage'));
const GalleryPage = lazy(() => import('./components/GalleryPage'));
const AdminPage = lazy(() => import('./components/AdminPage'));
const SitemapPage = lazy(() => import('./components/SitemapPage'));

// Dynamic Catalog Pages
const CategoryListPage = lazy(() => import('./components/CategoryListPage'));
const CategoryProductsPage = lazy(() => import('./components/CategoryProductsPage'));
const ProductDetailPage = lazy(() => import('./components/ProductDetailPage'));

import CookieConsent from './components/CookieConsent';
import WhatsAppButton from './components/WhatsAppButton';
import { useAuth } from './context/AuthContext';
import Seo from './components/Seo';
import { buildOrganizationLd, buildWebsiteLd, DEFAULT_DESCRIPTION, BRAND_KEYWORDS } from './lib/seo';

import { ThemeProvider } from './context/ThemeContext';

// Guard: only lets admins through
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user || !isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
};

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const HomePage: React.FC = () => (
  <>
    <Seo
      title="NuExis — Professional AV Solutions, Digital Signage & LED Displays"
      rawTitle
      description={DEFAULT_DESCRIPTION}
      canonicalPath="/"
      keywords={BRAND_KEYWORDS}
      jsonLd={[buildOrganizationLd(), buildWebsiteLd()]}
    />
    <Hero />
    <ClientLogos />
    <Suspense fallback={<div className="min-h-[200px]" />}>
      <About />
      <WhyChooseUs />
      <MissionValues />
      <Testimonials />

      <FAQ />
    </Suspense>
  </>
);

const AppContent: React.FC = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');

  const openLogin = () => { setAuthModalTab('login'); setAuthModalOpen(true); };
  const openSignup = () => { setAuthModalTab('signup'); setAuthModalOpen(true); };

  return (
    <main className="min-h-screen selection:bg-brand-blue selection:text-white relative">
      <GlobalBackground />
      <ScrollToTop />
      <Toaster position="top-center" />
      <CookieConsent />
      <WhatsAppButton />

      <Header onLoginClick={openLogin} onSignupClick={openSignup} />
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} defaultTab={authModalTab} />

      <SmoothScrollWrapper>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* ── Public / Home ── */}
            <Route path="/" element={<HomePage />} />

            {/* ── Catalog pages ── */}
            <Route path="/categories" element={<CategoryListPage />} />
            <Route path="/category/:slug" element={<CategoryProductsPage />} />
            <Route path="/product/:categorySlug/:productSlug" element={<ProductDetailPage />} />

            {/* Legacy redirect: old /product route → /categories */}
            <Route path="/product" element={<Navigate to="/categories" replace />} />
            <Route path="/digital-signage-series" element={<Navigate to="/categories" replace />} />
            <Route path="/touch-display" element={<Navigate to="/categories" replace />} />
            <Route path="/digital-podium" element={<Navigate to="/categories" replace />} />
            <Route path="/digital-conference-series" element={<Navigate to="/categories" replace />} />
            <Route path="/pro-audio-system" element={<Navigate to="/categories" replace />} />
            <Route path="/active-led" element={<Navigate to="/categories" replace />} />
            <Route path="/conferencing-system" element={<Navigate to="/categories" replace />} />

            {/* ── Other pages ── */}
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/sitemap" element={<SitemapPage />} />

            {/* ── Admin (protected) ── */}
            <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />

            {/* ── 404 ── */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>

        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </SmoothScrollWrapper>
    </main>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CatalogProvider>
          <AppContent />
        </CatalogProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;