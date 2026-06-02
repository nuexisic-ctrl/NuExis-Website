import React from 'react';
import { Play } from 'lucide-react';

const AboutStack: React.FC = () => {
  return (
    <section className="relative py-24">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h3 className="text-[#0ea5e9] uppercase font-bold tracking-[0.2em] text-sm">About Us</h3>
        </div>

        {/* First Block: Our Mission */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 mb-32">
          {/* Left Text */}
          <div className="w-full lg:w-1/2">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Our Mission
            </h2>
            <div className="space-y-6 text-gray-600 leading-relaxed text-lg">
              <p>
                At NuExis, we believe that exceptional audio visual technology is the
                foundation of modern communication. Our mission is to deliver innovative
                AV solutions that transform how businesses connect, collaborate, and
                engage with their audiences.
              </p>
              <p>
                We're committed to providing enterprise-grade equipment paired with unmatched
                technical expertise. From digital signage to conference systems, every solution we
                deliver is designed to exceed expectations and drive real business results.
              </p>
            </div>
          </div>
          
          {/* Right Image */}
          <div className="w-full lg:w-1/2 relative lg:right-[-4rem]">
            <div className="relative w-full aspect-[4/3] rounded-[48px] overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1600&auto=format&fit=crop" 
                alt="NuExis team in a meeting room" 
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating Card */}
            <div className="absolute -bottom-6 right-8 bg-white p-5 rounded-[24px] shadow-2xl border border-gray-100 z-20 min-w-[200px]">
              <h4 className="font-bold text-gray-900 text-xl mb-1">NuExis</h4>
              <p className="text-gray-500 text-sm">AV Excellence</p>
            </div>
          </div>
        </div>

        {/* Second Block: Our Story */}
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left Image (Video Thumbnail) */}
          <div className="w-full lg:w-1/2 relative">
            <div className="relative w-full aspect-[1.1] md:aspect-[4/3] rounded-[40px] overflow-hidden shadow-2xl group cursor-pointer">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1600&auto=format&fit=crop" 
                alt="NuExis team collaborating" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="w-20 h-20 bg-[#448df7] rounded-full flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
                  <Play className="w-8 h-8 text-white ml-2" fill="currentColor" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Text */}
          <div className="w-full lg:w-1/2">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Our Story
            </h2>
            <div className="space-y-6 text-gray-600 leading-relaxed text-lg">
              <p>
                Founded by AV industry veterans in 2000, NuExis emerged from a simple
                observation: businesses needed audio visual solutions that were both
                cutting-edge and reliable. What started as a small team of passionate
                technologists has grown into a global leader in professional AV systems.
              </p>
              <p>
                Today, we serve clients across India, delivering everything from immersive
                digital signage to sophisticated conference room systems. Our commitment to
                innovation and customer success has made us the trusted partner for organizations
                that demand excellence in their AV infrastructure.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default AboutStack;
