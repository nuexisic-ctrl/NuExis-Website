import React from 'react';
import { Quote, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    id: 1,
    quote: "NuExis delivered an outstanding active LED video wall for our control room. Their attention to detail, from pixel pitch selection to final installation, proved they truly understand mission-critical AV infrastructure.",
    author: "Rohan Desai",
    role: "Chief Technology Officer, Nexus Systems",
    image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 2,
    quote: "The digital podiums and interactive flat panels from NuExis have modernized our university's lecture halls. The build quality is exceptional, and the integration with our existing AV setup was seamless.",
    author: "Priya Patel",
    role: "Dean of Technology, Amrita University",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 3,
    quote: "Upgrading our corporate boardrooms with NuExis conference systems was the best decision. The audio clarity is phenomenal, eliminating all background noise during crucial international client calls.",
    author: "Vikram Malhotra",
    role: "Head of IT Infrastructure, Global Edge Solutions",
    image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&q=80"
  }
];

const Testimonials: React.FC = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-brand-blue/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-brand-blue font-bold tracking-widest uppercase text-xs mb-3">Community</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900">Trusted by Visionaries</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div
              key={t.id}
              className="flex flex-col p-8 rounded-3xl bg-white border border-black/5 backdrop-blur-sm hover:bg-gray-50 hover:border-brand-blue/20 transition-all duration-300 group relative overflow-hidden shadow-sm hover:shadow-md"
            >
              {/* Hover Gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="mb-8 relative z-10">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, starI) => (
                    <Star key={starI} className="w-4 h-4 text-brand-accent fill-brand-accent" />
                  ))}
                </div>
                <Quote className="w-6 h-6 text-brand-blue opacity-40 mb-3" />
                <p className="text-base text-gray-600 leading-relaxed font-light">"{t.quote}"</p>
              </div>

              <div className="mt-auto flex items-center gap-4 pt-6 border-t border-black/5 relative z-10">
                <div className="relative">
                  <div className="absolute inset-0 bg-brand-blue rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity" />
                  <img src={t.image} alt={t.author} className="w-12 h-12 rounded-full object-cover border border-black/10 relative z-10" />
                </div>
                <div>
                  <h4 className="text-gray-900 font-semibold group-hover:text-brand-blue transition-colors">{t.author}</h4>
                  <p className="text-sm text-gray-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;