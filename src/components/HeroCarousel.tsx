import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { FEATURED_SLIDES } from '../data';

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % FEATURED_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = FEATURED_SLIDES[currentSlide];

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#1a1c1e] to-[#0d0f12]">
      {/* Background slide containing the featured illustration */}
      <div className="relative min-h-[480px] md:min-h-[560px] lg:min-h-[620px] w-full flex items-center">
        
        {/* Background Image with Rich Shadow/Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={slide.imageUrl} 
            alt={slide.title} 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center scale-105 filter brightness-90 animate-[pulse_8s_infinite] transition-all duration-1000 ease-in-out"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d0f12] via-[#0d0f12]/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f12] via-transparent to-[#0d0f12]/40"></div>
          
          {/* Neon green glow effect behind title */}
          <div className="absolute left-10 top-1/3 w-[350px] h-[350px] rounded-full bg-[#82C341]/5 blur-[120px]"></div>
        </div>

        {/* Hero Content Area */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-16 w-full flex flex-col items-start">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#82C341]/10 border border-[#82C341]/30 text-[#82C341] rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 animate-pulse">
            Destaque da Semana
          </div>

          {/* Heading */}
          <h1 className="font-display font-bold text-3xl md:text-5xl lg:text-6xl text-white max-w-3xl leading-[1.1] tracking-tight mb-6 drop-shadow-lg uppercase">
            {slide.title}
          </h1>

          {/* Paragraph */}
          <p className="text-gray-300 text-sm md:text-base max-w-2xl leading-relaxed mb-8 font-light text-shadow">
            {slide.subtitle}
          </p>

          {/* Action Button */}
          <button className="group flex items-center gap-2 px-6 py-3 bg-transparent hover:bg-[#82C341] border border-white hover:border-[#82C341] text-white hover:text-[#0d0f12] font-semibold text-xs uppercase tracking-wider rounded-full transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_0_25px_rgba(130,195,65,0.4)] cursor-pointer">
            {slide.buttonText}
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Custom Carousel Dot Indicators (Green Active Line) */}
          <div className="flex items-center gap-3 mt-12 md:mt-20">
            {FEATURED_SLIDES.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  currentSlide === index ? 'w-8 bg-[#82C341]' : 'w-2.5 bg-gray-600 hover:bg-gray-400'
                }`}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
