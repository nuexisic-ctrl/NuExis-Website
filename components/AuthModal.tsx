import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultTab = 'login' }) => {
  const { signIn, signUp } = useAuth();
  const [tab, setTab] = useState<'login' | 'signup'>(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({ fullName: '', email: '', password: '' });

  const resetForm = () => {
    setForm({ fullName: '', email: '', password: '' });
    setError(null);
    setShowPassword(false);
  };

  const switchTab = (newTab: 'login' | 'signup') => {
    setTab(newTab);
    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (tab === 'login') {
      const { error } = await signIn(form.email, form.password);
      if (error) {
        setError(error.message === 'Invalid login credentials'
          ? 'Invalid email or password. Please try again.'
          : error.message);
      } else {
        toast.success('Welcome back! 👋');
        handleClose();
      }
    } else {
      if (!form.fullName.trim()) {
        setError('Please enter your full name.');
        setLoading(false);
        return;
      }
      if (form.password.length < 6) {
        setError('Password must be at least 6 characters.');
        setLoading(false);
        return;
      }
      const { error } = await signUp(form.email, form.password, form.fullName);
      if (error) {
        setError(error.message);
      } else {
        toast.success('Account created! Please check your email to confirm.');
        handleClose();
      }
    }

    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-black/10 overflow-hidden">

              {/* Gradient accent top bar */}
              <div className="h-1 w-full bg-gradient-to-r from-brand-blue via-blue-400 to-blue-600" />

              {/* Header */}
              <div className="flex items-center justify-between px-7 pt-6 pb-2">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {tab === 'login' ? 'Welcome back' : 'Create account'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {tab === 'login' ? 'Sign in to your NuExis account' : 'Join NuExis today'}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tab Switcher */}
              <div className="flex mx-7 mt-4 bg-gray-100 rounded-xl p-1">
                {(['login', 'signup'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => switchTab(t)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                      tab === t
                        ? 'bg-white text-brand-blue shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {t === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    {t === 'login' ? 'Log In' : 'Sign Up'}
                  </button>
                ))}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-7 py-5 space-y-4">
                {/* Full Name (signup only) */}
                <AnimatePresence>
                  {tab === 'signup' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Your full name"
                          value={form.fullName}
                          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue transition-all"
                          autoComplete="name"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue transition-all"
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder={tab === 'signup' ? 'Minimum 6 characters' : '••••••••'}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                      className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue transition-all"
                      autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm"
                    >
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-brand-blue text-white font-semibold text-sm hover:bg-blue-700 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-brand-blue/25"
                >
                  {loading ? (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : tab === 'login' ? (
                    <><LogIn className="w-4 h-4" /> Log In</>
                  ) : (
                    <><UserPlus className="w-4 h-4" /> Create Account</>
                  )}
                </button>

                {/* Switch Tab Link */}
                <p className="text-center text-sm text-gray-500 pb-2">
                  {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
                  <button
                    type="button"
                    onClick={() => switchTab(tab === 'login' ? 'signup' : 'login')}
                    className="text-brand-blue font-semibold hover:underline"
                  >
                    {tab === 'login' ? 'Sign up' : 'Log in'}
                  </button>
                </p>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
