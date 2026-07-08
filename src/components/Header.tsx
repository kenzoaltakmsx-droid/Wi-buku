import React, { useState } from 'react';
import { Menu, Search, User, ChevronDown, Bell, Play, Bookmark, Home, Trophy } from 'lucide-react';
import CatLogo from './CatLogo';
import { useTranslation } from '../translations';

interface HeaderProps {
  currentView: string;
  onSearch: (query: string) => void;
  onNavigate: (viewType: 'home' | 'leaderboard' | 'favorites' | 'profile') => void;
  onToggleSidebar: () => void;
}

export default function Header({ currentView, onSearch, onNavigate, onToggleSidebar }: HeaderProps) {
  const { t } = useTranslation();
  const [searchCategory, setSearchCategory] = useState('Manga');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800/80 bg-[#0d0f12]/95 backdrop-blur-md px-4 py-3 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left Side: Menu + Logo */}
        <div className="flex items-center gap-2">
          <button 
            onClick={onToggleSidebar}
            className="hidden lg:flex text-gray-400 hover:text-[#82C341] p-1.5 rounded-lg hover:bg-gray-900 transition-colors cursor-pointer items-center justify-center mr-1" 
            aria-label="Menu"
          >
            <Menu size={22} />
          </button>
          
          <button 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 group bg-transparent border-none p-0 cursor-pointer text-left"
          >
            <CatLogo size={36} className="drop-shadow-[0_0_10px_rgba(130,195,65,0.4)] group-hover:scale-105 transition-all duration-300" />
            <span className="font-display font-bold text-xl tracking-tight text-white group-hover:text-[#82C341] transition-colors duration-300">
              wi-<span className="text-[#82C341]">buku</span>
            </span>
          </button>
        </div>

        {/* Middle navigation removed to be kept exclusively at the bottom */}

        {/* Right Side: Search + Profile */}
        <div className="flex items-center gap-4">
          {/* Search Bar Container */}
          <form onSubmit={handleSearchSubmit} className="flex items-center bg-[#15191e] border border-gray-800 rounded-full py-1 px-3 focus-within:border-[#82C341]/60 transition-colors relative w-48 sm:w-64 lg:w-80">
            {/* Category Select Dropdown */}
            <div className="relative">
              <button 
                type="button"
                onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-gray-400 hover:text-white border-r border-gray-800 pr-2 mr-2 cursor-pointer"
              >
                {searchCategory}
                <ChevronDown size={12} className="text-gray-500" />
              </button>
              
              {showCategoryMenu && (
                <div className="absolute top-full left-0 mt-2 bg-[#1a1f26] border border-gray-800 rounded-xl py-1 w-28 shadow-2xl z-50">
                  {['Manga'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setSearchCategory(cat);
                        setShowCategoryMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-[#82C341] hover:text-[#0d0f12] font-semibold transition-colors first:rounded-t-xl last:rounded-b-xl"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <input 
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-transparent text-xs text-white focus:outline-none w-full placeholder-gray-500"
            />
            
            <button type="submit" className="text-gray-500 hover:text-[#82C341] bg-transparent border-none p-0 cursor-pointer ml-1 shrink-0">
              <Search size={14} />
            </button>
          </form>

        </div>

      </div>
    </header>
  );
}
