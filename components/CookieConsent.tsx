
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CookieConsent: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie-consent', 'accepted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookie-consent', 'declined');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[70] bg-white rounded-xl shadow-2xl border border-gray-200 p-6"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        We use cookies 🍪
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                        We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={handleDecline}
                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Decline
                        </button>
                        <button
                            onClick={handleAccept}
                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-brand-blue hover:bg-blue-700 rounded-lg transition-colors shadow-lg shadow-brand-blue/20"
                        >
                            Accept
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CookieConsent;
