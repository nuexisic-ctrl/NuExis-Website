import React from 'react';
import { Award, Users, Building2, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const stats = [
    {
        icon: <Award className="w-8 h-8" />,
        value: "25+",
        label: "Years Experience",
        description: "Industry-leading expertise in AV solutions"
    },
    {
        icon: <Users className="w-8 h-8" />,
        value: "1000+",
        label: "Projects Delivered",
        description: "Successful installations worldwide"
    },

    {
        icon: <TrendingUp className="w-8 h-8" />,
        value: "98%",
        label: "Client Satisfaction",
        description: "Trusted by leading organizations"
    }
];

const WhyChooseUs: React.FC = () => {
    return (
        <section className="relative py-20 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-blue/5 rounded-full blur-[150px]" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-accent/5 rounded-full blur-[150px]" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Section Header */}
                <div className="text-center mb-20">
                    <h2 className="text-sm font-bold tracking-widest text-brand-accent uppercase mb-4">Why Choose NuExis</h2>
                    <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                        Your Trusted <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-accent">AV Partner</span>
                    </h3>
                    <p className="text-base text-gray-600 max-w-3xl mx-auto">
                        We combine cutting-edge technology with unparalleled service to deliver audio visual solutions that exceed expectations.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8">
                    {stats.map((stat, idx) => (
                        <div
                            key={idx}
                            className="relative group"
                        >
                            <div className="p-6 rounded-2xl bg-white border border-black/10 hover:border-brand-blue/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-500">
                                <div className="mb-4 text-brand-blue group-hover:text-brand-accent transition-colors duration-300">
                                    {stat.icon}
                                </div>
                                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                                <div className="text-base font-semibold text-gray-900 mb-2">{stat.label}</div>
                                <p className="text-xs text-gray-600">{stat.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Value Propositions */}
                <div className="mt-24 grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <h4 className="text-2xl font-bold text-gray-900">Innovation at Our Core</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            We stay ahead of the curve by continuously investing in research and development. Our team of experts ensures you always have access to the latest AV technologies and solutions.
                        </p>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start">
                                <div className="w-2 h-2 bg-brand-blue rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                <span className="text-gray-600">Latest 4K and 8K display technologies</span>
                            </li>
                            <li className="flex items-start">
                                <div className="w-2 h-2 bg-brand-blue rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                <span className="text-gray-600">Advanced audio processing systems</span>
                            </li>
                            <li className="flex items-start">
                                <div className="w-2 h-2 bg-brand-blue rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                <span className="text-gray-600">Integrated control and automation</span>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-2xl font-bold text-gray-900">Comprehensive Support</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            From initial consultation to post-installation support, we're with you every step of the way. Our dedicated team ensures your AV systems perform flawlessly.
                        </p>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start">
                                <div className="w-2 h-2 bg-brand-accent rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                <span className="text-gray-600">24/7 technical support availability</span>
                            </li>
                            <li className="flex items-start">
                                <div className="w-2 h-2 bg-brand-accent rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                <span className="text-gray-600">On-site training and documentation</span>
                            </li>
                            <li className="flex items-start">
                                <div className="w-2 h-2 bg-brand-accent rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                <span className="text-gray-600">Preventive maintenance programs</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs;
