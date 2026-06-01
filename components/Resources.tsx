import React from 'react';
import { BookOpen, TrendingUp, Calculator, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Resource {
    title: string;
    description: string;
    category: string;
    readTime: string;
    icon: React.ReactNode;
    image: string;
}

const resources: Resource[] = [
    {
        title: "AV Trends 2024",
        description: "Discover the latest innovations shaping the audio visual industry, from AI-powered displays to immersive experiences.",
        category: "Industry Insights",
        readTime: "8 min read",
        icon: <TrendingUp className="w-6 h-6" />,
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"
    },
    {
        title: "How to Choose the Right Display",
        description: "A comprehensive guide to selecting the perfect display solution for your business needs and environment.",
        category: "Buying Guide",
        readTime: "12 min read",
        icon: <BookOpen className="w-6 h-6" />,
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop"
    },
    {
        title: "ROI of Digital Signage",
        description: "Learn how digital signage solutions can boost engagement, increase sales, and deliver measurable business value.",
        category: "ROI Calculator",
        readTime: "10 min read",
        icon: <Calculator className="w-6 h-6" />,
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop"
    }
];

const Resources: React.FC = () => {
    return (
        <section className="relative py-20 overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-blue/20 to-transparent" />
            <div className="absolute top-20 right-0 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-0 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <div>
                        <h2 className="text-sm font-bold tracking-widest text-brand-accent uppercase mb-4">
                            Resources & Insights
                        </h2>
                        <h3 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                            Knowledge Hub
                        </h3>
                        <p className="text-base text-gray-600 max-w-2xl mx-auto">
                            Expert insights, guides, and tools to help you make informed AV decisions
                        </p>
                    </div>
                </div>

                {/* Resources Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {resources.map((resource, idx) => (
                        <article
                            key={idx}
                            className="group bg-white rounded-3xl overflow-hidden border border-black/10 hover:border-brand-blue/50 hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] transition-all duration-500"
                        >
                            {/* Image */}
                            <div className="relative h-56 overflow-hidden">
                                <img
                                    src={resource.image}
                                    alt={resource.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                                {/* Category Badge */}
                                <div className="absolute top-4 left-4 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full border border-black/10">
                                    <div className="flex items-center gap-2">
                                        <span className="text-brand-blue">{resource.icon}</span>
                                        <span className="text-xs font-semibold text-gray-900">{resource.category}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-brand-blue transition-colors duration-300">
                                    {resource.title}
                                </h4>
                                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                                    {resource.description}
                                </p>

                                {/* Footer */}
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">{resource.readTime}</span>
                                    <button className="flex items-center gap-2 text-sm font-semibold text-brand-blue group-hover:gap-3 transition-all duration-300">
                                        Read More
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                {/* CTA Section */}
                <div
                    className="text-center"
                >
                    <button className="group px-8 py-4 bg-gradient-to-r from-brand-blue to-brand-accent text-white font-semibold rounded-full hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all duration-300 hover:scale-105">
                        <span className="flex items-center gap-2">
                            Explore All Resources
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                        </span>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Resources;
