import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronDown, ChevronRight, FileText, HelpCircle, MessageSquare, LogOut, LogIn, UserPlus, Shield, Layers, SunMoon, Sun, Moon, Check } from 'lucide-react';
import { NavItem } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCatalog } from '../context/CatalogContext';
import { useTheme } from '../context/ThemeContext';

// Import Software Dropdown Images
import nuexisSignageImg from '@/images/software-dropdown/NuExis Signage.webp';
import stwardPlatformImg from '@/images/software-dropdown/Stward Platform Control System.webp';

// "All Categories" thumbnail (shown as first item in Product mega-menu)
import allCategoriesImg from '@/images/product-dropdown/10.webp';



// Define types for the Mega Menu structure
interface MegaMenuItem {
  label: string;
  href: string;
  image?: string;
  imageFit?: string;
}

interface MegaMenuSection {
  items: MegaMenuItem[];
  gridCols?: number; // Added to support dynamic grid columns
  promo?: {
    title: string;
    description?: string;
    image: string;
    linkText?: string;
    linkHref?: string;
  };
}

interface EnhancedNavItem extends NavItem {
  megaMenu?: MegaMenuSection;

}

const resourcesAndMore: EnhancedNavItem[] = [
  {
    label: 'Resources',
    href: '#resources',
    megaMenu: {
      gridCols: 3,
      items: [
        { label: 'Blogs', href: '#blogs', image: 'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?auto=format&fit=crop&q=80&w=300&h=200' },
        { label: 'Awards', href: '#awards', image: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&q=80&w=300&h=200' },
        { label: 'News', href: '#news', image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=300&h=200' },
        { label: 'Press Release', href: '#press', image: 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?auto=format&fit=crop&q=80&w=300&h=200' },
        { label: 'Case Studies', href: '#case-studies', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=300&h=200' },
        { label: 'Video Testimonials', href: '#testimonials', image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=300&h=200' },
      ],
      promo: {
        title: 'Events',
        description: 'Stay updated with PeopleLink\'s latest events, conferences, and industry exhibitions.',
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=400&h=300',
      }
    }
  },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Support', href: '/support' },
];

interface HeaderProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLoginClick, onSignupClick }) => {
  const { user, profile, isAdmin, signOut } = useAuth();
  const { navCategories, softwares, loading: catalogLoading, resolveImageUrl } = useCatalog();
  const { theme, setTheme } = useTheme();

  // Build dynamic navLinks: Home + Product(dynamic) + Software + Resources + Gallery + Support
  const productNavItem: EnhancedNavItem = {
    label: 'Products',
    href: '/categories',
    megaMenu: {
      gridCols: navCategories.length <= 3 ? navCategories.length + 1 : Math.min(5, navCategories.length + 1),
      items: [
        { label: 'All Categories', href: '/categories', image: allCategoriesImg },
        ...navCategories.map(cat => ({
          label: cat.name,
          href: `/category/${cat.slug}`,
          image: resolveImageUrl(cat.image_url),
        })),
      ],
    },
  };

  const softwareNavItem: EnhancedNavItem = {
    label: 'Solutions',
    href: '#solutions',
    megaMenu: {
      gridCols: softwares.length <= 2 ? softwares.length : Math.min(4, softwares.length),
      items: softwares.map(soft => ({
        label: soft.name,
        href: soft.forward_url,
        image: resolveImageUrl(soft.image_url),
        imageFit: soft.image_fit,
      })),
      promo: {
        title: 'Video Collaboration Suite',
        description: 'Discover InstaVC an all-in-one suite with 10+ powerful video collaboration tools.',
        image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=400&h=300',
      }
    }
  };

  const navLinks: EnhancedNavItem[] = [
    productNavItem,
    softwareNavItem,
    ...resourcesAndMore,
  ];
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileSection = (label: string) => {
    setMobileExpanded(mobileExpanded === label ? null : label);
  };

  const isRoute = (href: string) => href.startsWith('/');

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-lg shadow-sm border-b border-black/5' 
          : 'bg-white border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between px-6 py-2 lg:py-2.5">
          {/* Logo */}
          <Link to="/" className="flex items-center cursor-pointer group z-50">
            <Logo className="h-8 w-auto" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-1">
            {(!catalogLoading ? navLinks : navLinks).map((link) => (
              <div key={link.label} className="group">
                <div className="px-1 py-2 relative after:content-[''] after:absolute after:left-0 after:w-full after:h-8 after:top-full">
                  {isRoute(link.href) ? (
                    <Link
                      to={link.href}
                      className={`flex items-center px-3 py-1.5 text-sm font-medium transition-colors duration-200 rounded-md ${
                        location.pathname === link.href
                          ? 'text-brand-blue bg-brand-blue/5'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {link.label}
                      {link.megaMenu && (
                        <ChevronDown className="w-4 h-4 ml-1.5 opacity-70 transform group-hover:rotate-180 transition-transform duration-300" />
                      )}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className={`flex items-center px-3 py-1.5 text-sm font-medium transition-colors duration-200 rounded-md ${
                        location.pathname === link.href
                          ? 'text-brand-blue bg-brand-blue/5'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      } cursor-pointer`}
                    >
                      {link.label}
                      {link.megaMenu && (
                        <ChevronDown className="w-4 h-4 ml-1.5 opacity-70 transform group-hover:rotate-180 transition-transform duration-300" />
                      )}
                    </a>
                  )}
                </div>



                {/* Legacy Mega Menu Dropdown */}
                {link.megaMenu && (
                  <div className="absolute top-full left-0 w-full pt-1 opacity-0 invisible pointer-events-none group-hover:opacity-100 group-hover:visible transition-[opacity,transform,visibility] duration-200 transform translate-y-1 group-hover:translate-y-0 z-50 flex flex-col items-center">
                    
                    <div className="bg-white/95 backdrop-blur-xl border border-black/10 rounded-2xl shadow-2xl overflow-hidden p-6 w-[96%] max-w-[1000px] pointer-events-auto text-left relative">
                      <div className="flex gap-8">
                        {/* Grid Section */}
                        <div
                          className={`flex-1 grid gap-6 ${link.megaMenu.gridCols === 5 ? 'grid-cols-5' :
                            link.megaMenu.gridCols === 4 ? 'grid-cols-4' :
                              link.megaMenu.gridCols === 3 ? 'grid-cols-3' : 'grid-cols-2'
                            }`}
                        >
                          {link.megaMenu.items.map((item) => (
                            isRoute(item.href) ? (
                              <Link
                                key={item.label}
                                to={item.href}
                                className="group/item flex flex-col space-y-1.5"
                              >
                                <div className="overflow-hidden rounded-lg aspect-video bg-gray-100 shadow-sm group-hover/item:shadow-md transition-all">
                                  {item.image && (
                                    <img
                                      src={item.image}
                                      alt={item.label}
                                      style={{ objectFit: (item.imageFit || 'cover') as any }}
                                      className="w-full h-full transform group-hover/item:scale-105 transition-transform duration-500"
                                    />
                                  )}
                                </div>
                                <span className="text-xs font-semibold text-gray-800 group-hover/item:text-brand-blue text-center leading-tight">
                                  {item.label}
                                </span>
                              </Link>
                            ) : (
                              <a
                                key={item.label}
                                href={item.href}
                                className="group/item flex flex-col space-y-1.5"
                              >
                                <div className="overflow-hidden rounded-lg aspect-video bg-gray-100 shadow-sm group-hover/item:shadow-md transition-all">
                                  {item.image && (
                                    <img
                                      src={item.image}
                                      alt={item.label}
                                      style={{ objectFit: (item.imageFit || 'cover') as any }}
                                      className="w-full h-full transform group-hover/item:scale-105 transition-transform duration-500"
                                    />
                                  )}
                                </div>
                                <span className="text-xs font-semibold text-gray-800 group-hover/item:text-brand-blue text-center leading-tight">
                                  {item.label}
                                </span>
                              </a>
                            )
                          ))}
                        </div>

                        {/* Promo Section */}
                        {link.megaMenu.promo && (
                          <div className="w-1/3 bg-gray-50 rounded-xl p-4 flex flex-col">
                            <h3 className="text-lg font-bold text-gray-900 mb-3">
                              {link.megaMenu.promo.title}
                            </h3>
                            <div className="flex-1 overflow-hidden rounded-lg mb-3 bg-white shadow-sm">
                              <img
                                src={link.megaMenu.promo.image}
                                alt={link.megaMenu.promo.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            {link.megaMenu.promo.description && (
                              <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                                {link.megaMenu.promo.description}
                              </p>
                            )}
                            <div className="flex gap-2 mt-auto">
                              <button className="flex-1 py-2 px-3 bg-gray-800 text-white text-xs font-medium rounded-lg hover:bg-gray-900 transition-colors flex items-center justify-center gap-1">
                                <MessageSquare className="w-3 h-3" /> Testimonials
                              </button>
                              <button className="flex-1 py-2 px-3 bg-gray-800 text-white text-xs font-medium rounded-lg hover:bg-gray-900 transition-colors flex items-center justify-center gap-1">
                                <HelpCircle className="w-3 h-3" /> FAQs
                              </button>
                              <button className="flex-1 py-2 px-3 bg-gray-800 text-white text-xs font-medium rounded-lg hover:bg-gray-900 transition-colors flex items-center justify-center gap-1">
                                <FileText className="w-3 h-3" /> Docs
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Desktop Admin Link — admin only */}
            {isAdmin && (
              <div className="px-1 py-2">
                <Link
                  to="/admin"
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold transition-colors rounded-full ${
                    location.pathname === '/admin'
                      ? 'text-brand-blue bg-brand-blue/5'
                      : 'text-brand-blue hover:bg-brand-blue/5'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </Link>
              </div>
            )}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center gap-2 ml-3">
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full text-gray-700 hover:bg-black/5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center text-sm font-bold">
                    {(profile?.full_name || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium max-w-[100px] truncate">
                    {profile?.full_name || user.email}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 bg-white/95 backdrop-blur-xl border border-black/10 rounded-2xl shadow-xl overflow-hidden py-2 z-50"
                    >
                      <div className="px-4 py-2 border-b border-black/5">
                        <p className="text-sm font-semibold text-gray-900 truncate">{profile?.full_name || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      
                      {/* Theme selection item with submenu on hover */}
                      <div className="relative group/theme-item border-b border-black/5">
                        <div className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-black/5 cursor-pointer transition-colors">
                          <div className="flex items-center gap-2">
                            <SunMoon className="w-4 h-4 text-gray-500" />
                            <span>Theme</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover/theme-item:translate-x-0.5 transition-transform" />
                        </div>
                        
                        {/* Submenu */}
                        <div className="absolute right-full top-0 mr-1 w-36 bg-white/95 backdrop-blur-xl border border-black/10 rounded-xl shadow-lg overflow-hidden py-1 opacity-0 pointer-events-none group-hover/theme-item:opacity-100 group-hover/theme-item:pointer-events-auto transition-[opacity,transform] duration-200 transform translate-x-1 group-hover/theme-item:translate-x-0">
                          <button
                            onClick={() => { setTheme('light'); setUserMenuOpen(false); }}
                            className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-black/5 transition-colors flex items-center justify-between"
                          >
                            <span className="flex items-center gap-1.5">
                              <Sun className="w-3.5 h-3.5 text-gray-400" />
                              Light mode
                            </span>
                            {theme === 'light' && <Check className="w-3.5 h-3.5 text-brand-blue" />}
                          </button>
                          <button
                            onClick={() => { setTheme('dark'); setUserMenuOpen(false); }}
                            className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-black/5 transition-colors flex items-center justify-between"
                          >
                            <span className="flex items-center gap-1.5">
                              <Moon className="w-3.5 h-3.5 text-gray-400" />
                              Dark mode
                            </span>
                            {theme === 'dark' && <Check className="w-3.5 h-3.5 text-brand-blue" />}
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => { signOut(); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <button
                  onClick={onLoginClick}
                  className="px-4 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-black/5 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  Log In <LogIn className="w-4 h-4 ml-0.5" />
                </button>
                <button
                  onClick={onSignupClick}
                  className="px-4 py-1.5 text-sm font-medium text-white bg-brand-blue hover:bg-blue-600 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  Sign Up <UserPlus className="w-4 h-4 ml-0.5" />
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden z-50">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-brand-blue"
              aria-label="Toggle Mobile Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 mx-4 p-4 bg-white/95 backdrop-blur-xl rounded-2xl border border-black/10 lg:hidden flex flex-col space-y-2 shadow-2xl overflow-hidden max-h-[80vh] overflow-y-auto overscroll-contain"
          >
            {navLinks.map((link) => (
              <div key={link.label}>
                <div
                  className="flex items-center justify-between px-4 py-3 text-lg font-medium text-gray-700 hover:text-brand-blue hover:bg-black/5 rounded-xl cursor-pointer transition-colors"
                  onClick={() => (link.megaMenu) ? toggleMobileSection(link.label) : null}
                >
                  {isRoute(link.href) && !link.megaMenu ? (
                    <Link to={link.href} className="flex-1" onClick={() => setIsMobileMenuOpen(false)}>
                      {link.label}
                    </Link>
                  ) : (
                    <a href={link.megaMenu ? undefined : link.href} className="flex-1" onClick={() => !link.megaMenu && setIsMobileMenuOpen(false)}>
                      {link.label}
                    </a>
                  )}

                  {(link.megaMenu) && (
                    <ChevronDown
                      className={`w-5 h-5 transition-transform duration-300 ${mobileExpanded === link.label ? 'rotate-180' : ''}`}
                    />
                  )}
                </div>

                {/* Mobile Submenu */}
                <AnimatePresence>
                  {link.megaMenu && mobileExpanded === link.label && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-black/5 rounded-lg mt-1 ml-4"
                    >
                      {link.megaMenu.items.map((child) => (
                        isRoute(child.href) ? (
                          <Link
                            key={child.label}
                            to={child.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:text-brand-blue border-l-2 border-transparent hover:border-brand-blue transition-all"
                          >
                            {child.image && (
                              <img src={child.image} alt="" className="w-8 h-8 rounded object-cover" />
                            )}
                            {child.label}
                          </Link>
                        ) : (
                          <a
                            key={child.label}
                            href={child.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:text-brand-blue border-l-2 border-transparent hover:border-brand-blue transition-all"
                          >
                            {child.image && (
                              <img src={child.image} alt="" className="w-8 h-8 rounded object-cover" />
                            )}
                            {child.label}
                          </a>
                        )
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            {/* Mobile Admin Link — admin only */}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 text-base font-semibold rounded-xl transition-colors ${
                  location.pathname === '/admin'
                    ? 'text-brand-blue bg-brand-blue/5'
                    : 'text-brand-blue hover:bg-brand-blue/5'
                }`}
              >
                <Shield className="w-5 h-5" />
                Admin Panel
              </Link>
            )}

            {/* Mobile Auth section */}
            <div className="pt-2 border-t border-black/5 mt-2">
              {user ? (
                <div className="px-4 py-3">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-brand-blue text-white flex items-center justify-center text-base font-bold">
                      {(profile?.full_name || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{profile?.full_name || 'User'}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  
                  {/* Mobile Theme Toggle */}
                  <div className="mb-3 border border-black/10 rounded-xl overflow-hidden">
                    <div className="flex bg-gray-50 p-1">
                      <button
                        onClick={() => setTheme('light')}
                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                          theme === 'light'
                            ? 'bg-white text-brand-blue shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <Sun className="w-3.5 h-3.5" /> Light
                      </button>
                      <button
                        onClick={() => setTheme('dark')}
                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                          theme === 'dark'
                            ? 'bg-white text-brand-blue shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <Moon className="w-3.5 h-3.5" /> Dark
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => { signOut(); setIsMobileMenuOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-600 font-medium text-sm hover:bg-red-100 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              ) : (
                <div className="px-4 py-2 flex flex-col gap-2">
                  <button
                    onClick={() => { onLoginClick(); setIsMobileMenuOpen(false); }}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors text-center"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => { onSignupClick(); setIsMobileMenuOpen(false); }}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-blue hover:bg-blue-600 transition-colors text-center shadow-sm"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
