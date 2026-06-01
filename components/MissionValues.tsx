import React from 'react';
import { Target, Eye, Heart, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const values = [
    {
        icon: <Target className="w-8 h-8" />,
        title: "Excellence",
        description: "We strive for perfection in every project, ensuring the highest quality AV solutions for our clients."
    },
    {
        icon: <Eye className="w-8 h-8" />,
        title: "Innovation",
        description: "Continuously pushing boundaries with cutting-edge technology and creative problem-solving."
    },
    {
        icon: <Heart className="w-8 h-8" />,
        title: "Partnership",
        description: "Building lasting relationships through trust, transparency, and exceptional service."
    },
    {
        icon: <Zap className="w-8 h-8" />,
        title: "Agility",
        description: "Adapting quickly to changing needs and delivering solutions that exceed expectations."
    }
];

const MissionValues: React.FC = () => {
    return (
        <section className="relative py-20 overflow-hidden">
            {/* Decorative line */}
            <div className="absolute left-0 top-0 w-full h-px bg-gradient-to-r from-transparent via-brand-blue/20 to-transparent" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Mission Statement */}
                <div className="text-center mb-24">
                    <h2 className="text-sm font-bold tracking-widest text-brand-accent uppercase mb-4">Our Mission</h2>
                    <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 max-w-4xl mx-auto leading-tight">
                        Empowering businesses through <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-accent">exceptional AV experiences</span>
                    </h3>
                    <p className="text-base text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        At NuExis, we believe that effective communication is the foundation of success. Our mission is to provide innovative audio visual solutions that transform how organizations connect, collaborate, and communicate with their audiences.
                    </p>
                </div>

                {/* Values Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {values.map((value, idx) => (
                        <div
                            key={idx}
                            className="text-center group"
                        >
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-blue/20 to-brand-accent/20 border border-black/10 mb-4 group-hover:scale-110 group-hover:border-brand-blue/50 transition-all duration-300">
                                <div className="text-brand-blue group-hover:text-brand-accent transition-colors duration-300">
                                    {value.icon}
                                </div>
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h4>
                            <p className="text-sm text-gray-600 leading-relaxed">{value.description}</p>
                        </div>
                    ))}
                </div>

                {/* CTA Section */}
                <div className="mt-24 text-center">
                    <div className="inline-block p-8 rounded-3xl bg-gradient-to-br from-brand-blue/10 to-brand-accent/10 border border-black/10">
                        <h4 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                            Ready to elevate your AV experience?
                        </h4>
                        <p className="text-gray-600 text-base mb-6 max-w-2xl mx-auto">
                            Let's discuss how our solutions can transform your communication and presentation capabilities.
                        </p>
                        <button className="px-6 py-3 bg-brand-blue hover:bg-brand-blue/80 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:scale-105 text-sm">
                            Get in Touch
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MissionValues;
