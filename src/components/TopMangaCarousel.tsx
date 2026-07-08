import React from 'react';
import { Star, BookOpen, ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { TOP_MANGAS } from '../data';

export default function TopMangaCarousel() {
  return (
    <section className="relative w-full py-12 bg-[#0d0f12]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-800/60 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-6 bg-[#82C341] rounded-full"></div>
              <h2 className="font-display font-bold text-xl md:text-2xl text-white tracking-tight uppercase">
                Top Mangás
              </h2>
            </div>
            <p className="text-gray-400 text-xs md:text-sm">
              Os mangás mais bem avaliados pela comunidade. Veja quais obras se destacaram entre os leitores.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <button className="p-1.5 bg-[#15191e] border border-gray-800 hover:border-[#82C341] text-gray-400 hover:text-[#82C341] rounded-lg transition-colors cursor-pointer" aria-label="Anterior">
                <ChevronLeft size={16} />
              </button>
              <button className="p-1.5 bg-[#15191e] border border-gray-800 hover:border-[#82C341] text-gray-400 hover:text-[#82C341] rounded-lg transition-colors cursor-pointer" aria-label="Próximo">
                <ChevronRight size={16} />
              </button>
            </div>

            <button className="flex items-center gap-1 px-3 py-1 bg-[#82C341]/10 border border-[#82C341]/20 hover:border-[#82C341] text-[#82C341] hover:bg-[#82C341] hover:text-[#0d0f12] text-[11px] font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer">
              <span>ver todos</span>
              <ArrowUpRight size={12} />
            </button>
          </div>
        </div>

        {/* Manga List Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {TOP_MANGAS.map((manga) => (
            <div 
              key={manga.id} 
              className="flex flex-col gap-2 group cursor-pointer"
            >
              {/* Cover Card */}
              <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-gray-900 shadow-[0_8px_20px_rgba(0,0,0,0.4)] group-hover:shadow-[0_0_20px_rgba(130,195,65,0.25)] transition-all duration-300">
                <img 
                  src={manga.imageUrl} 
                  alt={manga.title} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f12]/90 via-[#0d0f12]/10 to-transparent"></div>

                {/* Rating overlay badge */}
                <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-[#0d0f12]/80 backdrop-blur-md rounded-md text-[10px] font-bold text-[#82C341] border border-[#82C341]/20 shadow-md">
                  <Star size={10} fill="currentColor" />
                  <span>{manga.rating.toFixed(2)}</span>
                </div>

                {/* Book overlay icon on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/35">
                  <div className="w-10 h-10 rounded-full bg-[#82C341] flex items-center justify-center text-[#0d0f12] shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                    <BookOpen size={16} />
                  </div>
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="px-1 flex flex-col gap-0.5">
                <h3 className="font-semibold text-xs md:text-xs text-white group-hover:text-[#82C341] transition-colors duration-300 line-clamp-1">
                  {manga.title}
                </h3>
                
                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                  <div className="flex items-center gap-0.5 text-[#82C341] font-bold">
                    <Star size={10} fill="currentColor" />
                    <span>{manga.rating.toFixed(2)}</span>
                  </div>
                  <span className="text-gray-600">•</span>
                  <div className="flex items-center gap-0.5">
                    <BookOpen size={10} className="text-gray-500" />
                    <span>{manga.type}</span>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
