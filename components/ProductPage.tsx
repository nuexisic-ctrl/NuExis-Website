import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const ProductPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-32 pb-20 min-h-[80vh] bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-12 rounded-3xl shadow-sm border border-black/5"
        >
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
          >
            Products Unavailable
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-xl text-gray-600 leading-relaxed"
          >
            We are currently updating our product catalog. Check back soon for our latest offerings.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductPage;