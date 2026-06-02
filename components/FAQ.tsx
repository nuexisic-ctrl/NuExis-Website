import React, { useState } from 'react';
import { Plus, Minus, Search } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

interface FAQItem {
    question: string;
    answer: string;
    category: string;
}

const faqs: FAQItem[] = [
    {
        question: "What types of AV solutions does NuExis provide?",
        answer: "NuExis offers comprehensive audio visual solutions including digital signage, interactive displays, video walls, conference room systems, sound systems, and complete AV integration services. We serve businesses of all sizes across various industries with enterprise-grade equipment and expert installation.",
        category: "Products & Services"
    },
    {
        question: "How long does it take to install AV equipment?",
        answer: "Installation timelines vary based on project complexity. A simple display installation typically takes 1-2 days, while comprehensive conference room systems may require 1-2 weeks. Large-scale digital signage networks can take 2-6 weeks. We provide detailed project timelines during the consultation phase and ensure minimal disruption to your operations.",
        category: "Installation"
    },
    {
        question: "Do you offer ongoing technical support?",
        answer: "Yes! We provide 24/7 technical support across all our solutions. Our support packages include remote troubleshooting, on-site service when needed, preventive maintenance, software updates, and dedicated account management. We're committed to ensuring your AV systems operate flawlessly.",
        category: "Support"
    },
    {
        question: "What is the typical ROI timeline for digital signage?",
        answer: "Most businesses see measurable ROI within 6-12 months. Digital signage typically increases customer engagement by 30-40%, boosts sales by 15-30%, and reduces perceived wait times by up to 35%. Our ROI calculator can provide specific projections based on your business type and goals.",
        category: "ROI & Pricing"
    },
    {
        question: "Can your systems integrate with our existing infrastructure?",
        answer: "Absolutely. Our solutions are designed for seamless integration with most existing IT infrastructure, content management systems, and third-party applications. We conduct thorough compatibility assessments and can provide custom integration solutions to ensure everything works together perfectly.",
        category: "Integration"
    },
    {
        question: "What industries do you specialize in?",
        answer: "We serve a wide range of industries including retail, corporate offices, education, healthcare, hospitality, transportation, and government facilities. Our team has deep expertise in understanding industry-specific needs and compliance requirements, delivering tailored AV solutions for each sector.",
        category: "Industries"
    },
    {
        question: "Do you provide training for our staff?",
        answer: "Yes, comprehensive training is included with every installation. We offer hands-on training sessions, detailed documentation, video tutorials, and ongoing training resources. Our goal is to ensure your team feels confident operating and maintaining the AV systems.",
        category: "Training"
    },
    {
        question: "What warranty and maintenance options are available?",
        answer: "All equipment comes with manufacturer warranties (typically 1-3 years). We also offer extended warranty programs and flexible maintenance plans including quarterly inspections, priority service, replacement parts coverage, and system performance optimization. Custom maintenance packages can be tailored to your specific needs.",
        category: "Warranty"
    }
];

const categories = Array.from(new Set(faqs.map(faq => faq.category)));

const FAQ: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [searchQuery, setSearchQuery] = useState<string>("");

    const toggleFAQ = (index: number) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    const filteredFAQs = faqs.filter(faq => {
        const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory;
        const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <section className="relative py-20 overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-blue/20 to-transparent" />
            <div className="absolute top-20 left-0 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-0 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <div>
                        <h2 className="text-sm font-bold tracking-widest text-brand-accent uppercase mb-4">
                            Support Center
                        </h2>
                        <h3 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                            Frequently Asked Questions
                        </h3>
                        <p className="text-base text-gray-600 max-w-2xl mx-auto">
                            Find quick answers to common questions about our AV solutions and services
                        </p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-8">
                    <div className="relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search questions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 rounded-2xl border border-black/10 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all duration-300 bg-white shadow-sm"
                        />
                    </div>
                </div>

                {/* Category Filter */}
                <div className="mb-12">
                    <div className="flex flex-wrap gap-3 justify-center">
                        <button
                            onClick={() => setSelectedCategory("All")}
                            className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${selectedCategory === "All"
                                ? "bg-brand-blue text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                                : "bg-white text-gray-700 border border-black/10 hover:border-brand-blue/50"
                                }`}
                        >
                            All
                        </button>
                        {categories.map((category, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${selectedCategory === category
                                    ? "bg-brand-blue text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                                    : "bg-white text-gray-700 border border-black/10 hover:border-brand-blue/50"
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* FAQ Items */}
                <div className="space-y-4">
                    {filteredFAQs.map((faq, idx) => (
                        <div
                            key={idx}
                            className="bg-white rounded-2xl border border-black/10 overflow-hidden hover:border-brand-blue/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] transition-all duration-300"
                        >
                            <button
                                onClick={() => toggleFAQ(idx)}
                                className="w-full px-6 py-5 flex items-center justify-between text-left group"
                            >
                                <div className="flex-1 pr-4">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="px-3 py-1 bg-brand-blue/10 text-brand-blue text-xs font-semibold rounded-full">
                                            {faq.category}
                                        </span>
                                    </div>
                                    <h4 className="text-base md:text-lg font-bold text-gray-900 group-hover:text-brand-blue transition-colors duration-300">
                                        {faq.question}
                                    </h4>
                                </div>
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${activeIndex === idx
                                    ? "bg-brand-blue text-white rotate-180"
                                    : "bg-gray-100 text-gray-600 group-hover:bg-brand-blue/10 group-hover:text-brand-blue"
                                    }`}>
                                    {activeIndex === idx ? (
                                        <Minus className="w-5 h-5" />
                                    ) : (
                                        <Plus className="w-5 h-5" />
                                    )}
                                </div>
                            </button>

                            <AnimatePresence>
                                {activeIndex === idx && (
                                    <div className="overflow-hidden">
                                        <div className="px-6 pb-5 pt-0">
                                            <div className="pl-4 border-l-2 border-brand-blue/30">
                                                <p className="text-sm text-gray-600 leading-relaxed">
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

                {/* No Results */}
                {filteredFAQs.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 mb-4">No questions found matching your criteria.</p>
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setSelectedCategory("All");
                            }}
                            className="text-brand-blue font-semibold hover:underline"
                        >
                            Clear filters
                        </button>
                    </div>
                )}

                {/* Contact CTA */}
                <div className="mt-16 bg-gradient-to-br from-brand-blue to-brand-accent p-8 rounded-3xl text-center text-white">
                    <h4 className="text-2xl font-bold mb-3">
                        Still Have Questions?
                    </h4>
                    <p className="text-sm mb-6 opacity-90 max-w-xl mx-auto">
                        Our team of AV experts is here to help. Contact us for personalized assistance and detailed information about our solutions.
                    </p>
                    <Link to="/support" className="inline-block px-8 py-3 bg-white text-brand-blue font-semibold rounded-full hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all duration-300 hover:scale-105">
                        Contact Support Team
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default FAQ;
