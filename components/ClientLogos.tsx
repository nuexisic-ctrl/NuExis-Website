import React, { useState } from 'react';
import { staticPartnerLogos } from '../data/staticDb';

interface ClientLogo {
  id: string;
  name: string;
  image_url: string;
}

const ClientLogos: React.FC = () => {
    const [clients] = useState<ClientLogo[]>(staticPartnerLogos);
    const [loading] = useState(false);

    // Function to cleanly render the content
    const renderCarouselContent = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-10 opacity-60 text-gray-400">
                    Loading Trusted Partners...
                </div>
            );
        }

        if (clients.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                    <p>No logos added yet. Add them from the admin panel.</p>
                </div>
            );
        }

        return (
            <div className="scroll-container py-4">
                <div className="flex gap-6 pr-6">
                    {[...clients, ...clients, ...clients].map((client, idx) => (
                        <div
                            key={idx}
                            className="flex-shrink-0 flex items-center justify-center p-4 rounded-lg bg-white border border-black/5 hover:border-brand-blue/20 hover:shadow-lg hover:shadow-brand-blue/5 hover:-translate-y-1 transition-all duration-300 group w-40 h-24"
                        >
                            <img
                                src={client.image_url}
                                alt={`${client.name} logo`}
                                className="h-12 w-auto max-w-[120px] object-contain filter grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-105"
                            />
                        </div>
                    ))}
                </div>
                {/* Duplicate block for seamless endless loop */}
                <div className="flex gap-6 pr-6" aria-hidden="true">
                    {[...clients, ...clients, ...clients].map((client, idx) => (
                        <div
                            key={idx}
                            className="flex-shrink-0 flex items-center justify-center p-4 rounded-lg bg-white border border-black/5 hover:border-brand-blue/20 hover:shadow-lg hover:shadow-brand-blue/5 hover:-translate-y-1 transition-all duration-300 group w-40 h-24"
                        >
                            <img
                                src={client.image_url}
                                alt={`${client.name} logo`}
                                className="h-12 w-auto max-w-[120px] object-contain filter grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-105"
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <section className="relative py-20 overflow-hidden border-y border-black/5">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-transparent"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-sm font-bold tracking-widest text-brand-accent uppercase mb-3">
                        Trusted By Industry Leaders
                    </h2>
                    <p className="text-gray-600 text-lg">
                        Powering AV solutions for the world's most innovative companies
                    </p>
                </div>

                {/* Infinite Scrolling Carousel */}
                <div className="relative overflow-hidden mask-gradient-x">
                    {/* Gradient overlays for smooth fade in/out at edges */}
                    <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-20 pointer-events-none"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-20 pointer-events-none"></div>

                    <style>{`
                        @keyframes infiniteScroll {
                            0% { transform: translateX(0); }
                            100% { transform: translateX(-50%); }
                        }
                        .scroll-container {
                            display: flex;
                            width: max-content;
                            animation: infiniteScroll 50s linear infinite;
                            will-change: transform;
                        }
                        .scroll-container:hover {
                            animation-play-state: paused;
                        }
                    `}</style>
                    
                    {renderCarouselContent()}
                </div>
            </div>
        </section>
    );
};

export default ClientLogos;
