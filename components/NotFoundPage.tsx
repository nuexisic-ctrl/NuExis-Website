import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFoundPage: React.FC = () => {
    return (
        <section className="min-h-screen flex items-center justify-center pt-24 pb-12 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center max-w-2xl mx-auto"
            >
                {/* 404 Number */}
                <div className="relative mb-8">
                    <h1 className="text-[150px] md:text-[200px] font-bold text-gray-100 leading-none select-none">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 bg-brand-blue/10 rounded-full flex items-center justify-center">
                            <Search className="w-10 h-10 text-brand-blue" />
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
                    Page Not Found
                </h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Oops! The page you're looking for doesn't exist or has been moved.
                    Let's get you back on track.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        to="/"
                        className="flex items-center gap-2 px-6 py-3 bg-brand-blue text-white font-semibold rounded-full hover:bg-blue-700 transition-colors shadow-lg shadow-brand-blue/20"
                    >
                        <Home className="w-5 h-5" />
                        Back to Home
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-full border border-black/10 hover:border-brand-blue/50 hover:text-brand-blue transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Go Back
                    </button>
                </div>

                {/* Quick Links */}
                <div className="mt-12 pt-8 border-t border-black/10">
                    <p className="text-sm text-gray-500 mb-4">Or explore our popular pages:</p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Link to="/product" className="text-sm text-brand-blue hover:underline">Products</Link>
                        <span className="text-gray-300">•</span>
                        <Link to="/digital-signage-series" className="text-sm text-brand-blue hover:underline">Digital Signage</Link>
                        <span className="text-gray-300">•</span>
                        <Link to="/digital-podium" className="text-sm text-brand-blue hover:underline">Podiums</Link>
                        <span className="text-gray-300">•</span>
                        <Link to="/support" className="text-sm text-brand-blue hover:underline">Support</Link>
                    </div>
                </div>
            </motion.div>
        </section>
    );
};

export default NotFoundPage;
