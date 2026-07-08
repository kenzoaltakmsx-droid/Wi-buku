import React from 'react';
import { FRANCHISES } from '../data';

export default function FranchiseBadges() {
  return (
    <section className="relative w-full py-8 bg-[#0d0f12]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
          {FRANCHISES.map((franchise) => (
            <div 
              key={franchise.id} 
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              {/* Circular Thumbnail Wrapper */}
              <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full p-[3px] bg-gradient-to-tr from-gray-800 to-[#82C341]/30 group-hover:from-[#82C341] group-hover:to-[#82C341] group-hover:scale-105 transition-all duration-300 shadow-[0_4px_15px_rgba(0,0,0,0.3)] group-hover:shadow-[0_0_15px_rgba(130,195,65,0.4)]">
                <div className="w-full h-full rounded-full overflow-hidden border border-gray-900 bg-gray-900">
                  <img 
                    src={franchise.imageUrl} 
                    alt={franchise.name} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500 filter brightness-95"
                  />
                </div>
              </div>

              {/* Franchise Text */}
              <span className="text-[10px] md:text-xs font-display font-bold uppercase tracking-widest text-gray-400 group-hover:text-[#82C341] transition-colors duration-300">
                {franchise.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
