import React from 'react';
import { BookOpen, Calendar, ArrowRight } from 'lucide-react';
import { GUIDES } from '../data';

export default function GuidesSection() {
  return (
    <section className="relative w-full py-12 bg-[#0b0c0e]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Title Block */}
        <div className="flex items-center justify-between border-b border-gray-800/60 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-6 bg-[#82C341] rounded-full"></div>
              <h2 className="font-display font-bold text-xl md:text-2xl text-white tracking-tight uppercase">
                Guias de Animes e Mangás
              </h2>
            </div>
            <p className="text-gray-400 text-xs md:text-sm">
              Análise completas, cronologias, explicações de finais e tudo o que você precisa para entender suas obras favoritas.
            </p>
          </div>
        </div>

        {/* Guides Grid / Scroller */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {GUIDES.map((guide) => (
            <article 
              key={guide.id}
              className="group flex flex-col bg-[#111418] border border-gray-800/80 rounded-2xl overflow-hidden hover:border-[#82C341]/30 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_0_15px_rgba(130,195,65,0.15)]"
            >
              {/* Image Banner */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-900">
                <img 
                  src={guide.imageUrl} 
                  alt={guide.title} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111418] via-[#111418]/10 to-transparent"></div>
                
                {/* Guide Badge */}
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#82C341] text-[#0d0f12] text-[9px] font-bold uppercase tracking-wider rounded-md">
                  Guia Útil
                </div>
              </div>

              {/* Guide Details */}
              <div className="p-4 flex flex-col flex-grow">
                <div className="flex items-center gap-2 text-[9px] text-gray-500 uppercase tracking-wider mb-2">
                  <span className="flex items-center gap-0.5"><Calendar size={10} /> 30 Jun 2026</span>
                  <span>•</span>
                  <span className="text-[#82C341]">Destaque</span>
                </div>

                <h3 className="font-display font-bold text-xs md:text-xs text-white group-hover:text-[#82C341] transition-colors duration-300 line-clamp-3 mb-2 leading-snug">
                  {guide.title}
                </h3>

                <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed mb-4 flex-grow">
                  {guide.description}
                </p>

                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#82C341] uppercase tracking-wider group-hover:gap-2.5 transition-all mt-auto">
                  <span>Ler guia completo</span>
                  <ArrowRight size={10} />
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
