import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Loader2, FileText, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface CatalogRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: { id: string; name: string; slug: string | null };
  document: { id: string; name: string };
}

const CatalogRequestModal: React.FC<CatalogRequestModalProps> = ({ isOpen, onClose, product, document }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    phoneNumber: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isFormValid = formData.fullName.trim() && formData.companyName.trim() && formData.phoneNumber.trim() && isValidEmail(formData.email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || loading) return;
    
    setLoading(true);
    setError(null);

    // Rate Limiting (Basic local check, actual should be on edge/backend)
    const recentRequestsKey = `catalog_req_${formData.email}`;
    const lastRequest = localStorage.getItem(recentRequestsKey);
    if (lastRequest && (Date.now() - parseInt(lastRequest)) < 1000 * 60 * 60 * 24) {
       setError("You have already submitted a request recently. Our team will contact you soon.");
       setLoading(false);
       return;
    }

    try {
      const { error: dbError } = await supabase.from('catalog_requests').insert({
        full_name: formData.fullName.trim(),
        company_name: formData.companyName.trim(),
        phone_number: formData.phoneNumber.trim(),
        email: formData.email.trim(),
        catalog_id: document.id,
        catalog_name: document.name,
        product_id: product.id,
        product_slug: product.slug,
        status: 'pending'
      });

      if (dbError) throw new Error(dbError.message);
      
      localStorage.setItem(recentRequestsKey, Date.now().toString());
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setSuccess(false);
      setError(null);
      setFormData({ fullName: '', companyName: '', phoneNumber: '', email: '' });
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 sm:p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative">
              <button
                onClick={handleClose}
                className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="h-2 w-full bg-gradient-to-r from-brand-blue to-cyan-500" />

              <div className="p-8">
                {success ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center text-center py-8"
                  >
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted</h3>
                    <p className="text-gray-600 mb-8 max-w-xs">
                      Thank you for your interest. Our team will review your request and contact you shortly with access to the catalog.
                    </p>
                    <button
                      onClick={handleClose}
                      className="w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors"
                    >
                      Return to Product
                    </button>
                  </motion.div>
                ) : (
                  <>
                    <div className="flex items-start gap-4 mb-8">
                      <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center shrink-0">
                        <FileText className="w-6 h-6 text-brand-blue" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">Request Catalog</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Please provide your details below to access the full catalog for <b>{product.name}</b>.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Full Name *</label>
                          <input
                            type="text"
                            value={formData.fullName}
                            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue transition-all"
                            placeholder="John Doe"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Company Name *</label>
                          <input
                            type="text"
                            value={formData.companyName}
                            onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue transition-all"
                            placeholder="Acme Corp"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Email Address *</label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue transition-all"
                            placeholder="john@example.com"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Phone Number *</label>
                          <input
                            type="tel"
                            value={formData.phoneNumber}
                            onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue transition-all"
                            placeholder="+1 (234) 567-8900"
                          />
                        </div>
                      </div>

                      {error && (
                        <div className="p-3 rounded-xl bg-red-50 flex items-start gap-2.5 text-sm text-red-600 border border-red-100 pt-3">
                           <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                           <p>{error}</p>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={!isFormValid || loading}
                        className="w-full mt-4 flex items-center justify-center py-4 px-6 border border-transparent rounded-xl text-white bg-brand-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue font-semibold shadow-lg shadow-brand-blue/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Request"}
                      </button>
                      <p className="text-center text-[10px] text-gray-400 mt-3 pt-2 border-t border-gray-100">
                         By submitting this form, you agree to our privacy policy and terms of service.
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CatalogRequestModal;
