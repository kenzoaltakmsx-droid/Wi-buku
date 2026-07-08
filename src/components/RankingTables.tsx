import React from 'react';
import { Star, Heart, TrendingUp, Award, Flame, User } from 'lucide-react';
import { RANKING_ANIMES, RANKING_MANGAS, RANKING_CHARACTERS } from '../data';

export default function RankingTables() {
  
  // Custom helper for styled rank badges
  const renderRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-6 h-6 rounded-md bg-amber-500 text-black flex items-center justify-center font-display font-extrabold text-xs shadow-md shadow-amber-500/10">
            1
          </div>
        );
      case 2:
        return (
          <div className="w-6 h-6 rounded-md bg-slate-300 text-black flex items-center justify-center font-display font-extrabold text-xs shadow-md shadow-slate-300/10">
            2
          </div>
        );
      case 3:
        return (
          <div className="w-6 h-6 rounded-md bg-amber-700 text-white flex items-center justify-center font-display font-extrabold text-xs shadow-md shadow-amber-700/10">
            3
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 rounded-md bg-gray-800 text-gray-400 flex items-center justify-center font-display font-bold text-xs">
            {rank}
          </div>
        );
    }
  };

  return (
    <section className="relative w-full py-12 bg-[#0b0c0e]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1: Animes Mais Populares do Momento */}
          <div className="bg-[#111418]/50 border border-gray-800/80 rounded-2xl p-5 shadow-[0_4px_25px_rgba(0,0,0,0.2)]">
            <div className="flex items-center gap-2 border-b border-gray-800 pb-4 mb-4">
              <TrendingUp size={16} className="text-[#82C341]" />
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-tight">
                Animes Mais Populares do Momento
              </h3>
            </div>
            
            <div className="flex flex-col gap-3.5">
              {RANKING_ANIMES.map((item) => (
                <div 
                  key={item.rank}
                  className="flex items-center gap-3 group cursor-pointer hover:bg-gray-800/10 p-1.5 rounded-xl transition-colors"
                >
                  {/* Rank Badge */}
                  {renderRankBadge(item.rank)}

                  {/* Little Image Cover */}
                  <div className="w-10 h-14 rounded-lg overflow-hidden shrink-0 bg-gray-900 border border-gray-800 shadow-sm">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform"
                    />
                  </div>

                  {/* Info Stack */}
                  <div className="flex flex-col min-w-0">
                    <h4 className="font-semibold text-xs text-white group-hover:text-[#82C341] transition-colors duration-300 line-clamp-1 mb-1">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                      <div className="flex items-center gap-0.5 text-[#82C341] font-bold">
                        <Star size={10} fill="currentColor" />
                        <span>{item.rating.toFixed(2)}</span>
                      </div>
                      <span className="text-gray-600">•</span>
                      <div className="flex items-center gap-1">
                        <Heart size={10} className="text-pink-500 fill-pink-500/10" />
                        <span>{item.favorites}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Mangás Mais Populares Agora */}
          <div className="bg-[#111418]/50 border border-gray-800/80 rounded-2xl p-5 shadow-[0_4px_25px_rgba(0,0,0,0.2)]">
            <div className="flex items-center gap-2 border-b border-gray-800 pb-4 mb-4">
              <Flame size={16} className="text-[#82C341]" />
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-tight">
                Mangás Mais Populares Agora
              </h3>
            </div>
            
            <div className="flex flex-col gap-3.5">
              {RANKING_MANGAS.map((item) => (
                <div 
                  key={item.rank}
                  className="flex items-center gap-3 group cursor-pointer hover:bg-gray-800/10 p-1.5 rounded-xl transition-colors"
                >
                  {/* Rank Badge */}
                  {renderRankBadge(item.rank)}

                  {/* Little Image Cover */}
                  <div className="w-10 h-14 rounded-lg overflow-hidden shrink-0 bg-gray-900 border border-gray-800 shadow-sm">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform"
                    />
                  </div>

                  {/* Info Stack */}
                  <div className="flex flex-col min-w-0">
                    <h4 className="font-semibold text-xs text-white group-hover:text-[#82C341] transition-colors duration-300 line-clamp-1 mb-1">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                      <div className="flex items-center gap-0.5 text-[#82C341] font-bold">
                        <Star size={10} fill="currentColor" />
                        <span>{item.rating.toFixed(2)}</span>
                      </div>
                      <span className="text-gray-600">•</span>
                      <div className="flex items-center gap-1">
                        <Heart size={10} className="text-pink-500 fill-pink-500/10" />
                        <span>{item.favorites}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Personagens Mais Acessados */}
          <div className="bg-[#111418]/50 border border-gray-800/80 rounded-2xl p-5 shadow-[0_4px_25px_rgba(0,0,0,0.2)]">
            <div className="flex items-center gap-2 border-b border-gray-800 pb-4 mb-4">
              <User size={16} className="text-[#82C341]" />
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-tight">
                Personagens Mais Acessados
              </h3>
            </div>
            
            <div className="flex flex-col gap-3.5">
              {RANKING_CHARACTERS.map((item) => (
                <div 
                  key={item.rank}
                  className="flex items-center gap-3 group cursor-pointer hover:bg-gray-800/10 p-1.5 rounded-xl transition-colors"
                >
                  {/* Rank Badge */}
                  {renderRankBadge(item.rank)}

                  {/* Little Image Cover */}
                  <div className="w-10 h-14 rounded-lg overflow-hidden shrink-0 bg-gray-900 border border-gray-800 shadow-sm">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform"
                    />
                  </div>

                  {/* Info Stack */}
                  <div className="flex flex-col min-w-0">
                    <h4 className="font-semibold text-xs text-white group-hover:text-[#82C341] transition-colors duration-300 line-clamp-1 mb-1">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                      <div className="flex items-center gap-0.5 text-[#82C341] font-bold">
                        <Star size={10} fill="currentColor" />
                        <span>{item.rating.toFixed(2)}</span>
                      </div>
                      <span className="text-gray-600">•</span>
                      <div className="flex items-center gap-1">
                        <Heart size={10} className="text-pink-500 fill-pink-500/10" />
                        <span>{item.favorites}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
