import React from 'react';
import { Mail, MapPin, Phone, Twitter, Instagram, Linkedin } from 'lucide-react';
import Logo from './Logo';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white/70 backdrop-blur-sm border-t border-black/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center">
              <Logo className="h-8 w-auto" />
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Pioneering the future of audio visual technology with innovative solutions for global enterprises.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-4">Solutions</h4>
            <ul className="space-y-2">
              {['Digital Signage', 'Video Conferencing', 'LED Walls', 'Control Systems'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-600 hover:text-brand-blue transition-colors text-sm">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-4">Company</h4>
            <ul className="space-y-2">
              {['About Us', 'Careers', 'Blog', 'Legal'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-600 hover:text-brand-blue transition-colors text-sm">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-4">Contact</h4>
            <ul className="space-y-2">
              <li className="flex items-start space-x-3 text-gray-600 text-sm">
                <MapPin className="w-4 h-4 mt-1 text-brand-blue" />
                <span>Kunwar Singh Nagar, Nangloi, Delhi-41</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-600 text-sm">
                <Phone className="w-4 h-4 text-brand-blue" />
                <span>9625800589</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-600 text-sm">
                <Mail className="w-4 h-4 text-brand-blue" />
                <span>support@nuexis.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-black/10 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} NuExis Inc. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-gray-900 transition-colors" aria-label="Twitter"><Twitter className="w-5 h-5" /></a>
            <a href="https://www.instagram.com/nuexis.inc/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 transition-colors" aria-label="Instagram"><Instagram className="w-5 h-5" /></a>
            <a href="#" className="text-gray-400 hover:text-gray-900 transition-colors" aria-label="LinkedIn"><Linkedin className="w-5 h-5" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;