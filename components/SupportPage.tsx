import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Clock, MessageSquare, Headphones, FileQuestion } from 'lucide-react';
import toast from 'react-hot-toast';

const SupportPage: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, 1500));

        toast.success('Message sent successfully! We\'ll get back to you soon.');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        setIsSubmitting(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const supportOptions = [
        {
            icon: <Headphones className="w-6 h-6" />,
            title: "Technical Support",
            description: "Get help with installation, troubleshooting, and maintenance.",
            availability: "Mon to Sun 9 to 6 pm",
            email: "support@nuexis.com",
            phone: "9992199229"
        },
        {
            icon: <MessageSquare className="w-6 h-6" />,
            title: "Sales Inquiry",
            description: "Discuss your AV requirements and get custom quotes.",
            availability: "Mon-Fri, 9AM-6PM",
            email: "sales@Nuexisinc@gmail.com",
            phone: "9625800589"
        },
        {
            icon: <FileQuestion className="w-6 h-6" />,
            title: "Product Information",
            description: "Learn more about our products and solutions.",
            availability: "Self-Service",
            email: "Info@nuexis.com",
            phone: "9625800589"
        }
    ];

    return (
        <div className="min-h-screen pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-sm font-bold tracking-widest text-brand-accent uppercase mb-4">
                        Support Center
                    </h2>
                    <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                        How Can We Help?
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Our dedicated support team is here to assist you with any questions about our AV solutions.
                    </p>
                </motion.div>

                {/* Support Options */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
                >
                    {supportOptions.map((option, idx) => (
                        <div
                            key={idx}
                            className="flex flex-col p-6 bg-white rounded-2xl border border-black/10 hover:border-brand-blue/50 hover:shadow-lg transition-all duration-300 group"
                        >
                            <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue mb-4 group-hover:bg-brand-blue group-hover:text-white transition-colors">
                                {option.icon}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{option.title}</h3>
                            <p className="text-sm text-gray-600 mb-4">{option.description}</p>
                            
                            <div className="space-y-2 mb-4 mt-auto">
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <Mail className="w-4 h-4 text-brand-blue" />
                                    {option.email}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <Phone className="w-4 h-4 text-brand-blue" />
                                    {option.phone}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-brand-accent font-medium">
                                <Clock className="w-3.5 h-3.5" />
                                {option.availability}
                            </div>
                        </div>
                    ))}
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-3xl border border-black/10 p-8"
                    >
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-black/10 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                                        placeholder="Your name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-black/10 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-black/10 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                                        placeholder="9992199229"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                                    <select
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-black/10 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all bg-white"
                                    >
                                        <option value="">Select a topic</option>
                                        <option value="technical">Technical Support</option>
                                        <option value="sales">Sales Inquiry</option>
                                        <option value="product">Product Information</option>
                                        <option value="partnership">Partnership</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows={5}
                                    className="w-full px-4 py-3 rounded-xl border border-black/10 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all resize-none"
                                    placeholder="How can we help you?"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3 bg-brand-blue text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {isSubmitting ? (
                                    <span>Sending...</span>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Send Message
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>

                    {/* Contact Information */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-8"
                    >
                        <div className="bg-gradient-to-br from-brand-blue to-brand-accent p-8 rounded-3xl text-white">
                            <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-1">Head Office</h4>
                                        <p className="text-sm opacity-90">
                                            H-62, kunwar singh nagar,<br />
                                            nangloi, delhi - 110041
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-1">Phone</h4>
                                        <p className="text-sm opacity-90">
                                            9992199229
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-1">Email</h4>
                                        <p className="text-sm opacity-90">
                                            support@nuexis.com
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-1">Business Hours</h4>
                                        <p className="text-sm opacity-90">
                                            Mon to Sun: 9:00 AM - 6:00 PM
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Map Placeholder */}
                        <div className="bg-white rounded-3xl border border-black/10 overflow-hidden h-64">
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <div className="text-center">
                                    <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                    <p className="text-gray-500 text-sm">Interactive Map</p>
                                    <p className="text-gray-400 text-xs">Coming Soon</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default SupportPage;
