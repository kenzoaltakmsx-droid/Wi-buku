import React, { useState } from 'react';
import { Star, Video, ArrowUpRight, Search, SlidersHorizontal } from 'lucide-react';
import { CURRENT_SEASON_ANIME } from '../data';

export default function AnimeGrid() {
  const [filterQuery, setFilterQuery] = useState('');
  const [minRating, setMinRating] = useState(0);

  const filteredAnime = CURRENT_SEASON_ANIME.filter(anime => {
    const matchesSearch = anime.title.toLowerCase().includes(filterQuery.toLowerCase());
    const matchesRating = anime.rating >= minRating;
    return matchesSearch && matchesRating;
  });

  return (
    <section className="relative w-full py-12 bg-[#0d0f12]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Header Title Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-800/60 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-6 bg-[#82C341] rounded-full"></div>
              <h2 className="font-display font-bold text-xl md:text-2xl text-white tracking-tight uppercase">
                Animes da Temporada Atual
              </h2>
            </div>
            <p className="text-gray-400 text-xs md:text-sm">
              Veja os animes da temporada atual, com séries que já estrearam e episódios sendo lançados semanalmente.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search filter input directly within section */}
            <div className="flex items-center bg-[#15191e] border border-gray-800 rounded-full py-1 px-3 focus-within:border-[#82C341]/60 transition-colors w-44 md:w-56">
              <input 
                type="text" 
                placeholder="Filtrar temporada..." 
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="bg-transparent text-[11px] text-white focus:outline-none w-full"
              />
              <Search size={12} className="text-gray-500" />
            </div>

            <button className="flex items-center gap-1 px-3 py-1 bg-[#82C341]/10 border border-[#82C341]/20 hover:border-[#82C341] text-[#82C341] hover:bg-[#82C341] hover:text-[#0d0f12] text-[11px] font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer">
              <span>ver todos</span>
              <ArrowUpRight size={12} />
            </button>
          </div>
        </div>

        {/* Anime Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {filteredAnime.map((anime) => (
            <div 
              key={anime.id} 
              className="flex flex-col gap-2 group cursor-pointer"
            >
              {/* Poster Image Cover */}
              <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-gray-900 shadow-[0_8px_20px_rgba(0,0,0,0.4)] group-hover:shadow-[0_0_20px_rgba(130,195,65,0.25)] transition-all duration-300">
                <img 
                  src={anime.imageUrl} 
                  alt={anime.title} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f12]/90 via-[#0d0f12]/20 to-transparent opacity-100 transition-opacity duration-300"></div>

                {/* Rating badge overlapping on image */}
                <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-[#0d0f12]/80 backdrop-blur-md rounded-md text-[10px] font-bold text-[#82C341] border border-[#82C341]/20 shadow-md">
                  <Star size={10} fill="currentColor" />
                  <span>{anime.rating.toFixed(2)}</span>
                </div>

                {/* Play hover state */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/35">
                  <div className="w-10 h-10 rounded-full bg-[#82C341] flex items-center justify-center text-[#0d0f12] shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                    <Video size={16} fill="currentColor" />
                  </div>
                </div>
              </div>

              {/* Poster Meta text below */}
              <div className="px-1 flex flex-col gap-0.5">
                <h3 className="font-semibold text-xs md:text-xs text-white group-hover:text-[#82C341] transition-colors duration-300 line-clamp-1">
                  {anime.title}
                </h3>
                
                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                  <div className="flex items-center gap-0.5 text-[#82C341] font-bold">
                    <Star size={10} fill="currentColor" />
                    <span>{anime.rating.toFixed(2)}</span>
                  </div>
                  <span className="text-gray-600">•</span>
                  <div className="flex items-center gap-0.5">
                    <Video size={10} className="text-gray-500" />
                    <span>{anime.type}</span>
                  </div>
                </div>
              </div>

            </div>
          ))}

          {filteredAnime.length === 0 && (
            <div className="col-span-full py-16 text-center">
              <p className="text-gray-400 text-sm">Nenhum anime encontrado com os filtros atuais.</p>
              <button 
                onClick={() => { setFilterQuery(''); setMinRating(0); }}
                className="mt-4 px-4 py-1.5 bg-[#15191e] hover:bg-[#1a1f26] text-xs text-[#82C341] border border-gray-800 rounded-full transition-colors cursor-pointer"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
