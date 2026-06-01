import React from 'react';
import { Calendar, Clock, Users, Video, ArrowRight } from 'lucide-react';

interface Webinar {
    title: string;
    description: string;
    date: string;
    time: string;
    duration: string;
    attendees: string;
    speaker: string;
    speakerTitle: string;
    image: string;
    status: 'upcoming' | 'live' | 'recorded';
}

const webinars: Webinar[] = [
    {
        title: "The Future of Interactive Displays",
        description: "Explore cutting-edge interactive display technologies and their applications in modern business environments.",
        date: "December 15, 2025",
        time: "2:00 PM EST",
        duration: "60 min",
        attendees: "250+",
        speaker: "Dr. Sarah Chen",
        speakerTitle: "Chief Technology Officer",
        image: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?q=80&w=2070&auto=format&fit=crop",
        status: "upcoming"
    },
    {
        title: "Maximizing ROI with Digital Signage",
        description: "Learn proven strategies to measure and maximize the return on investment from your digital signage solutions.",
        date: "December 22, 2025",
        time: "3:00 PM EST",
        duration: "45 min",
        attendees: "180+",
        speaker: "Michael Rodriguez",
        speakerTitle: "Business Development Director",
        image: "https://images.unsplash.com/photo-1551818255-e6e10975bc17?q=80&w=2073&auto=format&fit=crop",
        status: "upcoming"
    },
    {
        title: "AV Solutions for Hybrid Workspaces",
        description: "Design effective audio visual systems that support seamless collaboration between remote and in-office teams.",
        date: "January 5, 2026",
        time: "1:00 PM EST",
        duration: "90 min",
        attendees: "300+",
        speaker: "Emily Thompson",
        speakerTitle: "Workspace Solutions Architect",
        image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop",
        status: "upcoming"
    }
];

const Webinars: React.FC = () => {
    return (
        <section className="relative py-20 overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-blue/20 to-transparent" />
            <div className="absolute top-40 left-1/4 w-72 h-72 bg-brand-blue/5 rounded-full blur-3xl" />
            <div className="absolute bottom-40 right-1/4 w-72 h-72 bg-brand-accent/5 rounded-full blur-3xl" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <div>
                        <h2 className="text-sm font-bold tracking-widest text-brand-accent uppercase mb-4">
                            Learn & Connect
                        </h2>
                        <h3 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                            Upcoming Webinars
                        </h3>
                        <p className="text-base text-gray-600 max-w-2xl mx-auto">
                            Join our expert-led sessions to stay ahead of AV industry trends and best practices
                        </p>
                    </div>
                </div>

                {/* Webinar Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    {webinars.map((webinar, idx) => (
                        <div
                            key={idx}
                            className="group bg-white rounded-3xl overflow-hidden border border-black/10 hover:border-brand-blue/50 hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] transition-all duration-500"
                        >
                            {/* Image Header */}
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={webinar.image}
                                    alt={webinar.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                                {/* Status Badge */}
                                <div className="absolute top-4 right-4 px-3 py-1.5 bg-brand-blue text-white text-xs font-bold rounded-full flex items-center gap-2 animate-pulse">
                                    <div className="w-2 h-2 bg-white rounded-full" />
                                    {webinar.status.toUpperCase()}
                                </div>

                                {/* Date Badge */}
                                <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
                                    <Calendar className="w-5 h-5" />
                                    <span className="text-sm font-semibold">{webinar.date}</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-brand-blue transition-colors duration-300">
                                    {webinar.title}
                                </h4>
                                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                                    {webinar.description}
                                </p>

                                {/* Meta Info */}
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3 text-sm text-gray-700">
                                        <Clock className="w-4 h-4 text-brand-blue" />
                                        <span>{webinar.time} • {webinar.duration}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-700">
                                        <Users className="w-4 h-4 text-brand-blue" />
                                        <span>{webinar.attendees} registered</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-700">
                                        <Video className="w-4 h-4 text-brand-blue" />
                                        <div>
                                            <div className="font-semibold">{webinar.speaker}</div>
                                            <div className="text-xs text-gray-500">{webinar.speakerTitle}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* CTA Button */}
                                <button className="w-full py-3 px-6 bg-gradient-to-r from-brand-blue to-brand-accent text-white font-semibold rounded-full hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 group">
                                    Reserve Your Spot
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-3xl border border-black/10 text-center">
                    <h4 className="text-2xl font-bold text-gray-900 mb-3">
                        Never Miss an Event
                    </h4>
                    <p className="text-sm text-gray-600 mb-6 max-w-xl mx-auto">
                        Subscribe to our newsletter and get notified about upcoming webinars, exclusive content, and industry insights
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="flex-1 px-6 py-3 rounded-full border border-black/20 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all duration-300"
                        />
                        <button className="px-8 py-3 bg-gray-900 text-white font-semibold rounded-full hover:bg-brand-blue transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] whitespace-nowrap">
                            Subscribe
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Webinars;
