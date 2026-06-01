import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { HeroSlide } from '../types';
import { ChevronRight, PlayCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';


// Import Carousel Images
import professionalAVSolutionImg from '@/images/coursel/Professional AV solution.webp';
import digitalSignageImg from '@/images/coursel/Digital Signage.webp';
import conferenceRoomImg from '@/images/coursel/Conference Room.webp';
import interactiveTouchDisplayImg from '@/images/coursel/Interactive touch display.webp';
import activeLedImg from '@/images/coursel/Active LED.webp';

// fallback slides removed



const slideVariants = {
  enter: (direction: number) => {
    return {
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    };
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => {
    return {
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    };
  }
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

const Hero: React.FC = () => {
  const [[page, direction], setPage] = useState([0, 0]);
  const [resetKey, setResetKey] = useState(0);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlides = async () => {
      // 1. Check local storage for cached slides
      const cachedSlidesStr = localStorage.getItem('nuexis_hero_cache');
      let cachedSlides = null;
      if (cachedSlidesStr) {
        try {
          cachedSlides = JSON.parse(cachedSlidesStr);
          if (cachedSlides && cachedSlides.length > 0) {
            setSlides(cachedSlides);
            setLoading(false);
          }
        } catch (e) {
          console.error("Failed to parse hero cache", e);
        }
      }

      // 2. Fetch fresh data from Supabase
      const { data, error } = await supabase.from('hero_carousel').select('*').order('created_at', { ascending: true });
      if (!error && data) {
        const newSlides = data.map((d: any) => ({
          id: d.id,
          title: d.title,
          subtitle: d.subtitle,
          image: d.image_url
        }));
        
        // 3. Update state and cache if different
        if (JSON.stringify(cachedSlides) !== JSON.stringify(newSlides)) {
          setSlides(newSlides);
          localStorage.setItem('nuexis_hero_cache', JSON.stringify(newSlides));
        }
      }

      setLoading(false);
    };
    fetchSlides();

    // 4. Set up realtime subscription for hero_carousel
    const heroChannel = supabase
      .channel('hero_carousel_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'hero_carousel' },
        (payload) => {
          fetchSlides(); // Re-fetch all to keep order correct and cache updated
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(heroChannel);
    };
  }, []);

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
    setResetKey(prev => prev + 1); // Reset auto-advance timer
  };

  useEffect(() => {
    const interval = setInterval(() => {
      paginate(1);
    }, 5000); // Slower auto-advance for better UX (5s)
    return () => clearInterval(interval);
  }, [resetKey, page]);

  if (loading) {
    return (
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-12">
        <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </section>
    );
  }

  if (slides.length === 0) {
    return (
      <section className="relative min-h-[60vh] flex items-center justify-center pt-24 pb-12">
        <div className="text-center text-gray-500">
           <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">Welcome to NuExis</h1>
           <p className="text-lg">Please configure featured slides in the Admin Panel.</p>
        </div>
      </section>
    );
  }

  // Calculate current index from page (infinite loop)
  const imageIndex = Math.abs(page % slides.length);
  const currentIndex = imageIndex; // Maintain compatibility with rest of component

  const handleImageClick = () => {
    paginate(1);
  };

  const nextSlide = slides[(currentIndex + 1) % slides.length];

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-12 overflow-hidden">
      {/* Background Gradient Blurs */}


      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12 lg:gap-16 xl:gap-24">

        {/* Left Content - Text */}
        <div className="flex-1 w-full text-center lg:text-left relative z-10 order-2 lg:order-1">
          <div className="min-h-[320px] sm:min-h-[280px] lg:min-h-[400px] flex flex-col justify-center relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute w-full top-0 lg:top-auto"
              >


                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-4 leading-[1.1]">
                  {slides[currentIndex].title}
                </h1>
                <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  {slides[currentIndex].subtitle}
                </p>

                <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6 w-full sm:w-auto">
                  <button className="h-[52px] px-8 rounded-xl bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white font-semibold text-[15px] transition-all duration-300 shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_10px_25px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 w-full sm:w-auto">
                    View Solutions
                  </button>
                  <button className="h-[52px] px-6 rounded-xl bg-transparent hover:bg-black/5 text-slate-800 font-semibold text-[15px] transition-all duration-300 inline-flex items-center justify-center gap-2.5 w-full sm:w-auto">
                    <PlayCircle className="w-[22px] h-[22px] text-blue-600 stroke-[2.5]" />
                    <span>Watch Demo</span>
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

        {/* Right Content - Carousel Image */}
        {/* Added drag listeners to the wrapper */}
        <div className="flex-1 w-full relative group order-1 lg:order-2 touch-pan-y">
          <div className="relative w-full aspect-[4/3] lg:aspect-square xl:aspect-[5/4] max-h-[60vh] lg:max-h-none">

            <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/20 to-brand-accent/20 rounded-3xl transform lg:rotate-6 scale-95 blur-2xl transition-all duration-500 group-hover:blur-3xl opacity-60" />

            <motion.div
              className="relative w-full h-full rounded-3xl overflow-hidden border border-black/10 shadow-2xl bg-white cursor-pointer"
              onClick={handleImageClick}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <AnimatePresence initial={false} custom={direction}>
                <motion.img
                  key={currentIndex}
                  src={slides[currentIndex].image}
                  alt={slides[currentIndex].title}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                  className="absolute inset-0 w-full h-full object-cover"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={1}
                  onDragEnd={(e, { offset, velocity }) => {
                    const swipe = swipePower(offset.x, velocity.x);

                    if (swipe < -swipeConfidenceThreshold) {
                      paginate(1);
                    } else if (swipe > swipeConfidenceThreshold) {
                      paginate(-1);
                    }
                  }}
                />
              </AnimatePresence>

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none z-10" />

              {/* Glass info card inside image - Shows next slide title */}
              <div className="hidden sm:block absolute bottom-6 left-6 right-6 p-4 sm:p-6 rounded-2xl bg-white/90 backdrop-blur-md border border-white/20 transform translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out pointer-events-none z-20">
                <div className="flex items-center justify-between text-gray-900">
                  <span className="text-sm font-semibold">{nextSlide.title}</span>
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </div>
              </div>
            </motion.div>

          </div>

          {/* Progress Indicators */}
          <div className="mt-8 flex items-center justify-center space-x-3">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  const diff = idx - currentIndex;
                  if (diff !== 0) paginate(diff);
                }}
                className={`h-1.5 rounded-full transition-all duration-500 ${currentIndex === idx ? 'w-8 bg-brand-blue' : 'w-2 bg-black/20 hover:bg-black/40'
                  }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;