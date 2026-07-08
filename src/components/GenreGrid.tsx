import React from 'react';
import { 
  Swords, 
  Compass, 
  Flame, 
  Heart, 
  Coffee, 
  BookOpen, 
  Sparkles, 
  Laugh, 
  Trophy, 
  Brain, 
  Cpu, 
  Ghost,
  ArrowUpRight,
  LucideProps
} from 'lucide-react';
import { GENRES } from '../data';

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  Swords,
  Globe: Compass,
  Flame,
  Heart,
  Coffee,
  BookOpen,
  Sparkles,
  Laugh,
  Trophy,
  Brain,
  Cpu,
  Ghost
};

export default function GenreGrid() {
  return (
    <section className="relative w-full py-12 bg-[#0d0f12]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-800/60 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-6 bg-[#82C341] rounded-full"></div>
              <h2 className="font-display font-bold text-xl md:text-2xl text-white tracking-tight uppercase">
                Explore os principais gêneros de anime
              </h2>
            </div>
            <p className="text-gray-400 text-xs md:text-sm">
              Navegue por animes organizados por gêneros, como ação, romance, fantasia, comédia e muitos outros.
            </p>
          </div>

          <div>
            <button className="flex items-center gap-1 px-3 py-1 bg-[#82C341]/10 border border-[#82C341]/20 hover:border-[#82C341] text-[#82C341] hover:bg-[#82C341] hover:text-[#0d0f12] text-[11px] font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer">
              <span>ver todos</span>
              <ArrowUpRight size={12} />
            </button>
          </div>
        </div>

        {/* Genres Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {GENRES.map((genre) => {
            const IconComponent = iconMap[genre.icon] || Swords;
            return (
              <div 
                key={genre.id}
                className={`relative p-5 rounded-2xl bg-gradient-to-br ${genre.color} border border-gray-800/60 transition-all duration-300 hover:scale-[1.02] cursor-pointer group flex flex-col justify-between min-h-[140px] hover:shadow-[0_8px_25px_rgba(0,0,0,0.5)]`}
              >
                {/* Icon block with active colored background */}
                <div className="w-9 h-9 rounded-xl bg-black/40 flex items-center justify-center text-white group-hover:text-[#82C341] group-hover:bg-black/60 transition-all duration-300">
                  <IconComponent size={18} />
                </div>

                {/* Info */}
                <div className="mt-4">
                  <h3 className="font-display font-bold text-xs md:text-sm text-white group-hover:text-[#82C341] transition-colors mb-1 uppercase tracking-tight">
                    {genre.name}
                  </h3>
                  <p className="text-[10px] text-gray-300/80 line-clamp-2 leading-relaxed font-light">
                    {genre.description}
                  </p>
                </div>
                
                {/* Accent glow corner */}
                <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-[#82C341] group-hover:animate-ping transition-colors"></div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
