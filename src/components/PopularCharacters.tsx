import React from 'react';
import { Sparkles, ArrowUpRight } from 'lucide-react';
import { POPULAR_CHARACTERS } from '../data';

export default function PopularCharacters() {
  return (
    <section className="relative w-full py-12 bg-[#0b0c0e]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-800/60 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-6 bg-[#82C341] rounded-full"></div>
              <h2 className="font-display font-bold text-xl md:text-2xl text-white tracking-tight uppercase">
                Personagens Mais Populares
              </h2>
            </div>
            <p className="text-gray-400 text-xs md:text-sm">
              Veja os personagens mais populares dos animes. De heróis a vilões que marcaram diferentes gerações.
            </p>
          </div>

          <div>
            <button className="flex items-center gap-1 px-3 py-1 bg-[#82C341]/10 border border-[#82C341]/20 hover:border-[#82C341] text-[#82C341] hover:bg-[#82C341] hover:text-[#0d0f12] text-[11px] font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer">
              <span>ver todos</span>
              <ArrowUpRight size={12} />
            </button>
          </div>
        </div>

        {/* Characters list */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 justify-center">
          {POPULAR_CHARACTERS.map((char) => (
            <div 
              key={char.id} 
              className="flex flex-col items-center text-center gap-3 group cursor-pointer"
            >
              {/* Circular Headshot Frame */}
              <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full p-[4px] bg-gradient-to-tr from-gray-800 to-gray-900 group-hover:from-[#82C341] group-hover:to-[#82C341]/80 group-hover:scale-105 transition-all duration-300 shadow-[0_4px_15px_rgba(0,0,0,0.4)] group-hover:shadow-[0_0_20px_rgba(130,195,65,0.3)]">
                <div className="w-full h-full rounded-full overflow-hidden bg-gray-950 border border-gray-950">
                  <img 
                    src={char.imageUrl} 
                    alt={char.name} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500 filter brightness-95"
                  />
                </div>
                
                {/* Micro-interaction decoration badge */}
                <div className="absolute -bottom-1 right-2 w-6 h-6 rounded-full bg-[#15191e] border border-gray-800 group-hover:border-[#82C341] flex items-center justify-center text-gray-500 group-hover:text-[#82C341] transition-all">
                  <Sparkles size={10} fill="currentColor" />
                </div>
              </div>

              {/* Names metadata */}
              <div className="flex flex-col gap-0.5">
                <h3 className="font-display font-bold text-xs text-white group-hover:text-[#82C341] transition-colors duration-300">
                  {char.name}
                </h3>
                <span className="text-[10px] text-gray-400 font-medium">
                  {char.anime}
                </span>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
