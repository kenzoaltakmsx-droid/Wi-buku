import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import MangaDetail from './components/MangaDetail';
import ChapterReader from './components/ChapterReader';
import LeaderboardView from './components/LeaderboardView';
import ProfileView from './components/ProfileView';
import { useFavorites, useUserStore } from './store';
import { useTranslation } from './translations';
import logoBuku from '@/assets/logo-buku.svg';
import { Sparkles, Bookmark, Search, BookOpen, Star, RefreshCw, Layers, TrendingUp, Trophy, User, Home, X } from 'lucide-react';
import { auth, signOut } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

type ViewState = 
  | { type: 'home' } 
  | { type: 'favorites' }
  | { type: 'search'; query: string }
  | { type: 'detail'; url: string }
  | { type: 'chapter'; url: string }
  | { type: 'leaderboard' }
  | { type: 'profile' };


interface MangaItem {
  title: string;
  link: string;
  thumb: string;
  desc?: string;
}

interface CategoryGroup {
  category: string;
  items: MangaItem[];
}

export default function App() {
  const { t, language } = useTranslation();
  const [view, setView] = useState<ViewState>({ type: 'home' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // API State
  const [categories, setCategories] = useState<CategoryGroup[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoriesError, setCategoriesError] = useState('');

  // Search state (for the search view)
  const [searchResults, setSearchResults] = useState<MangaItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Favorites store
  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  // Active Category filter tab for Home view
  const [activeTab, setActiveTab] = useState<string>('All');

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Check if the user logged in using social media (Google or GitHub)
        const isSocial = firebaseUser.providerData.some(
          (p) => p.providerId === 'google.com' || p.providerId === 'github.com'
        );

        // Sync with existing profile, passing forceSocialSync = isSocial
        await useUserStore.getState().syncProfile(
          firebaseUser.uid,
          firebaseUser.email,
          firebaseUser.displayName,
          firebaseUser.photoURL || '🐱',
          isSocial
        );
      } else {
        // User logged out
        useUserStore.getState().setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch initial home categories from scraper backend
  useEffect(() => {
    setLoadingCategories(true);
    setCategoriesError('');
    fetch('/api/home-categories')
      .then((res) => {
        if (!res.ok) throw new Error('Gagal memuat daftar manga dari server.');
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Respons server tidak valid (bukan JSON).');
        }
        return res.json();
      })
      .then((data) => {
        setCategories(data);
        setLoadingCategories(false);
      })
      .catch((err: any) => {
        console.error(err);
        setCategoriesError(err.message || 'Gagal terhubung ke server scraping Komikindo.');
        setLoadingCategories(false);
      });
  }, []);

  // Handle Search trigger
  const handleSearch = (query: string) => {
    setView({ type: 'search', query });
    setSearching(true);
    setSearchError('');
    setSearchResults([]);

    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Terjadi kesalahan saat mencari.');
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Respons server tidak valid (bukan JSON).');
        }
        return res.json();
      })
      .then((data) => {
        setSearchResults(data);
        setSearching(false);
      })
      .catch((err: any) => {
        console.error(err);
        setSearchError(err.message || 'Gagal mencari hasil.');
        setSearching(false);
      });
  };

  // Get dynamic spotlight manga based on real-time scraper data
  const getSpotlightManga = () => {
    if (categories && categories.length > 0) {
      const validCategory = categories.find(cat => cat.items && cat.items.length > 0);
      if (validCategory && validCategory.items.length > 0) {
        const item = validCategory.items[0];
        const scoreVal = item.desc ? item.desc.replace('Score: ', '').trim() : '9.5';
        return {
          title: item.title,
          desc: `Manga populer "${item.title}" rilis hari ini secara real-time. Nikmati chapter terbaru dengan kualitas visual terbaik dan terjemahan bahasa Indonesia terakurat hanya di Wi-Buku!`,
          thumb: item.thumb,
          link: item.link,
          score: scoreVal === 'N/A' || !scoreVal ? '9.4' : scoreVal
        };
      }
    }
    // Fallback if loading or empty
    return {
      title: "Solo Leveling (Only I Level Up)",
      desc: "Gerbang misterius menghubungkan dunia kita dengan dungeon yang penuh dengan monster. Sung Jin-Woo adalah pemburu peringkat E, namun segalanya berubah saat ia menemukan dungeon ganda.",
      thumb: "https://upload.wikimedia.org/wikipedia/en/9/9f/Solo_Leveling_webtoon_volume_1_cover.jpg",
      link: "https://komikindo.tv/manga/solo-leveling/",
      score: "9.8"
    };
  };

  const spotlight = getSpotlightManga();

  return (
    <div id="app-container" className="min-h-screen bg-[#0d0f12] text-gray-100 flex flex-col selection:bg-[#82C341] selection:text-[#0d0f12]">
      
      {/* Universal Header with responsive callbacks */}
      <Header 
        currentView={view.type}
        onSearch={handleSearch} 
        onNavigate={(viewType) => setView({ type: viewType })}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <main className="flex-grow flex flex-col">

        {/* Dynamic render based on view state */}
        {view.type === 'home' && (
          <div 
            id="home-section" 
            className="w-full px-4 md:px-8 py-6 md:py-8 flex-grow flex flex-col justify-start relative overflow-hidden"
            style={{
              backgroundSize: '24px 24px',
              backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)'
            }}
          >
            {/* Subtle decorative glow */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#82C341]/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-36 h-36 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex-grow flex flex-col">
                
                {/* 1. Header / Greeting Banner */}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-left">
                    <h2 className="font-sans font-black text-2xl text-white tracking-tight leading-none">
                      Beranda
                    </h2>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Wi-Buku Manga Portal</p>
                  </div>
                  
                  <span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-[#82C341] rounded-full animate-pulse shrink-0"></span> ONLINE
                  </span>
                </div>

                {/* 2. Curated Hero Spotlight (In-card integrated) */}
                <div className="relative w-full bg-[#111418] border border-gray-900/60 rounded-3xl p-4 md:p-8 overflow-hidden mb-5">
                  <div className="absolute inset-0 z-0 opacity-10">
                    <img 
                      src={spotlight.thumb} 
                      alt="Spotlight BG" 
                      className="w-full h-full object-cover blur-sm scale-105"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 justify-between">
                    <div className="flex flex-col items-start max-w-2xl">
                      <span className="px-2 py-0.5 bg-[#82C341]/10 text-[#82C341] rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest mb-2 border border-[#82C341]/20 flex items-center gap-1">
                        <Sparkles size={8} /> REKOMENDASI HARI INI
                      </span>
                      <h3 className="font-sans font-black text-lg md:text-2xl text-white uppercase tracking-tight mb-1 md:mb-2 line-clamp-1">
                        {spotlight.title}
                      </h3>
                      <p className="text-[10px] md:text-xs text-gray-400 leading-relaxed mb-3 md:mb-4 line-clamp-2 md:line-clamp-3">
                        {spotlight.desc}
                      </p>
                      <button 
                        onClick={() => setView({ type: 'detail', url: spotlight.link })}
                        className="px-4 py-2 bg-[#82C341] hover:bg-[#99db4e] text-[#0d0f12] text-[10px] md:text-xs font-bold rounded-full transition-all shadow-md shadow-[#82C341]/20 uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                      >
                        <img src={logoBuku} alt="Book" className="w-5 h-5 object-contain select-none" referrerPolicy="no-referrer" /> Mulai Baca
                      </button>
                    </div>
                    {/* Floating large cover image for spotlight on desktop */}
                    <div className="hidden md:block shrink-0 w-36 aspect-[2/3] rounded-xl overflow-hidden border border-zinc-800 shadow-2xl rotate-2 hover:rotate-0 transition-all duration-300">
                      <img 
                        src={spotlight.thumb} 
                        alt={spotlight.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Genres filter badges bar */}
                <div className="mb-5">
                  <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-2">
                    <button 
                      onClick={() => setActiveTab('All')}
                      className={`px-3 py-1 text-[10px] font-semibold rounded-full shrink-0 cursor-pointer transition-colors ${
                        activeTab === 'All' 
                          ? 'bg-[#82C341] text-[#0d0f12]' 
                          : 'bg-[#1c1c1e] border border-zinc-800/80 hover:border-zinc-700 text-gray-400 hover:text-white'
                      }`}
                    >
                      Semua
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.category}
                        onClick={() => setActiveTab(cat.category)}
                        className={`px-3 py-1 text-[10px] font-semibold rounded-full shrink-0 cursor-pointer transition-colors ${
                          activeTab === cat.category 
                            ? 'bg-[#82C341] text-[#0d0f12]' 
                            : 'bg-[#1c1c1e] border border-zinc-800/80 hover:border-zinc-700 text-gray-400 hover:text-white'
                        }`}
                      >
                        {cat.category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Main Manga Catalog Shelf */}
                <div className="flex-grow">
                  {loadingCategories ? (
                    <div className="py-24 flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-3 border-[#82C341] border-t-transparent rounded-full animate-spin mb-3"></div>
                      <p className="text-gray-500 text-[10px]">Memuat katalog Komikindo...</p>
                    </div>
                  ) : categoriesError ? (
                    <div className="py-12 text-center bg-[#1c1c1e] border border-zinc-800 rounded-3xl p-5">
                      <p className="text-red-400 font-semibold text-xs mb-1">{categoriesError}</p>
                      <p className="text-gray-500 text-[10px] mb-3">Komikindo TV offline atau lambat merespons.</p>
                      <button 
                        onClick={() => window.location.reload()}
                        className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full text-[10px] transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <RefreshCw size={10} /> Coba Lagi
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-6 pb-20">
                      {categories
                        .filter(cat => activeTab === 'All' || cat.category === activeTab)
                        .map((cat) => (
                          <div key={cat.category} className="flex flex-col">
                            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-1.5 mb-3">
                              <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-[#82C341] rounded-full animate-pulse"></span>
                                <h3 className="font-sans font-bold text-sm text-white uppercase tracking-tight">
                                  {cat.category}
                                </h3>
                              </div>
                              <span className="text-[9px] uppercase font-bold text-gray-500 font-mono tracking-wider">
                                {cat.items.length} Judul
                              </span>
                            </div>

                            {/* Responsive cover grid inside applet container */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-5">
                              {cat.items.map((manga, i) => {
                                const isFav = isFavorite(manga.link);
                                return (
                                  <div 
                                    key={i}
                                    className="group flex flex-col gap-1.5 cursor-pointer"
                                    onClick={() => setView({ type: 'detail', url: manga.link })}
                                  >
                                    <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-gray-900 border border-zinc-800/80 group-hover:border-[#82C341]/60 transition-all duration-300">
                                      <img 
                                        src={manga.thumb} 
                                        alt={manga.title} 
                                        referrerPolicy="no-referrer"
                                        loading="lazy"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      />
                                      
                                      {/* Absolute Score overlay */}
                                      {manga.desc && (
                                        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-black/75 text-[8px] font-bold text-[#82C341] uppercase tracking-wider font-mono">
                                          {manga.desc.replace('Score: ', '')}
                                        </div>
                                      )}

                                      {/* Absolute Favorite Button overlay */}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleFavorite(manga);
                                        }}
                                        className="absolute bottom-2 right-2 p-1.5 bg-black/75 hover:bg-black text-gray-400 hover:text-[#82C341] rounded-lg transition-colors cursor-pointer"
                                        title={isFav ? "Hapus dari Favorit" : "Tambah ke Favorit"}
                                      >
                                        <Bookmark size={11} fill={isFav ? "#82C341" : "none"} className={isFav ? "text-[#82C341]" : ""} />
                                      </button>
                                    </div>
                                    <h4 className="font-semibold text-[11px] text-gray-300 group-hover:text-[#82C341] transition-colors line-clamp-1 leading-tight px-0.5">
                                      {manga.title}
                                    </h4>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

        {/* 2. Favorites View */}
        {view.type === 'favorites' && (
          <div 
            id="favorites-section" 
            className="w-full px-4 md:px-8 py-6 md:py-8 flex-grow flex flex-col justify-start relative overflow-hidden"
            style={{
              backgroundSize: '24px 24px',
              backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)'
            }}
          >
            {/* Subtle decorative glow */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#82C341]/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-36 h-36 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex-grow flex flex-col">
                <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 mb-5">
                  <Bookmark className="text-[#82C341]" size={18} />
                  <h2 className="font-sans font-black text-2xl text-white tracking-tight leading-none uppercase">Favorit Saya ({favorites.length})</h2>
                </div>

                <div className="flex-grow">
                  {favorites.length === 0 ? (
                    <div className="py-20 text-center bg-[#1c1c1e] border border-zinc-800 rounded-[32px] p-8 max-w-sm mx-auto">
                      <Bookmark className="text-zinc-600 mx-auto mb-4" size={40} />
                      <h3 className="text-white font-bold text-sm mb-2">Daftar favorit Anda kosong</h3>
                      <p className="text-gray-400 text-[11px] leading-relaxed mb-6">
                        Mulai jelajahi katalog dan klik ikon bookmark untuk menyimpan manga dan manhwa favorit Anda.
                      </p>
                      <button 
                        onClick={() => setView({ type: 'home' })}
                        className="px-5 py-2.5 bg-[#82C341] hover:bg-[#99db4e] text-[#0d0f12] font-bold text-xs rounded-full cursor-pointer transition-colors uppercase tracking-wider"
                      >
                        Jelajahi Katalog
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-5 pb-20">
                      {favorites.map((manga, i) => (
                        <div 
                          key={i}
                          className="group flex flex-col gap-1.5 cursor-pointer"
                          onClick={() => setView({ type: 'detail', url: manga.link })}
                        >
                          <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-gray-900 border border-zinc-800/80 group-hover:border-[#82C341]/60 transition-all duration-300">
                            <img 
                              src={manga.thumb} 
                              alt={manga.title} 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <button
                              onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(manga);
                              }}
                              className="absolute bottom-2 right-2 p-1.5 bg-black/75 hover:bg-black text-[#82C341] rounded-lg transition-colors cursor-pointer"
                            >
                              <Bookmark size={11} fill="#82C341" />
                            </button>
                          </div>
                          <h4 className="font-semibold text-[11px] text-gray-300 group-hover:text-[#82C341] transition-colors line-clamp-1 leading-tight px-0.5">
                            {manga.title}
                          </h4>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        {/* 3. Search Results View */}
        {view.type === 'search' && (
          <div 
            id="search-section" 
            className="w-full px-4 md:px-8 py-6 md:py-8 flex-grow flex flex-col justify-start relative overflow-hidden"
            style={{
              backgroundSize: '24px 24px',
              backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)'
            }}
          >
            {/* Subtle decorative glow */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#82C341]/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-36 h-36 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex-grow flex flex-col">
                <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 mb-5">
                  <Search className="text-[#82C341]" size={18} />
                  <h2 className="font-sans font-black text-sm text-white uppercase tracking-tight truncate max-w-[280px]">
                    Hasil: <span className="text-[#82C341] italic">"{view.query}"</span>
                  </h2>
                </div>

                <div className="flex-grow">
                  {searching ? (
                    <div className="py-24 flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-3 border-[#82C341] border-t-transparent rounded-full animate-spin mb-3"></div>
                      <p className="text-gray-500 text-[10px]">Mencari di Komikindo TV...</p>
                    </div>
                  ) : searchError ? (
                    <div className="text-center py-12 text-red-400 font-semibold text-xs">
                      {searchError}
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="py-16 text-center max-w-sm mx-auto">
                      <p className="text-gray-400 text-xs mb-4">Tidak ditemukan manga yang cocok.</p>
                      <button 
                        onClick={() => setView({ type: 'home' })}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full text-xs transition-colors cursor-pointer"
                      >
                        Kembali ke Beranda
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-5 pb-20">
                      {searchResults.map((manga, i) => {
                        const isFav = isFavorite(manga.link);
                        return (
                          <div 
                            key={i}
                            className="group flex flex-col gap-1.5 cursor-pointer"
                            onClick={() => setView({ type: 'detail', url: manga.link })}
                          >
                            <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-gray-900 border border-zinc-800/80 group-hover:border-[#82C341]/60 transition-all duration-300">
                              <img 
                                src={manga.thumb} 
                                alt={manga.title} 
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(manga);
                                }}
                                className="absolute bottom-2 right-2 p-1.5 bg-black/75 hover:bg-black text-[#82C341] rounded-lg transition-colors cursor-pointer"
                              >
                                <Bookmark size={11} fill={isFav ? "#82C341" : "none"} className={isFav ? "text-[#82C341]" : ""} />
                              </button>
                            </div>
                            <h4 className="font-semibold text-[11px] text-gray-300 group-hover:text-[#82C341] transition-colors line-clamp-1 leading-tight px-0.5">
                              {manga.title}
                            </h4>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
        )}

        {/* 4. Manga Detail View */}
        {view.type === 'detail' && (
          <MangaDetail 
            url={view.url} 
            onBack={() => setView({ type: 'home' })} 
            onChapterSelect={(chapterUrl) => setView({ type: 'chapter', url: chapterUrl })}
          />
        )}

        {/* 5. Chapter Reader View */}
        {view.type === 'chapter' && (
          <ChapterReader 
            url={view.url} 
            onBackToManga={(mangaUrl) => setView({ type: 'detail', url: mangaUrl })} 
            onChapterSelect={(chapterUrl) => setView({ type: 'chapter', url: chapterUrl })}
          />
        )}

        {/* 6. Leaderboard View */}
        {view.type === 'leaderboard' && (
          <LeaderboardView onNavigate={(viewName) => setView({ type: viewName })} />
        )}

        {/* 7. Profile View */}
        {view.type === 'profile' && (
          <ProfileView />
        )}

      </main>

      {/* Floating Capsule Bottom Navbar for all views */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-sm">
        <div className="flex items-center justify-around gap-1.5 bg-black/75 backdrop-blur-xl border border-white/10 px-3 py-2 rounded-full shadow-2xl shadow-black/90">
          
          {/* Home Tab */}
          <button
            onClick={() => setView({ type: 'home' })}
            className={`transition-all duration-300 flex items-center justify-center cursor-pointer ${
              view.type === 'home'
                ? 'bg-[#82C341] text-[#0d0f12] px-5 py-2.5 rounded-full font-bold'
                : 'p-3 text-gray-400 hover:text-white'
            }`}
            title={t('home')}
          >
            <Home size={18} fill={view.type === 'home' ? "currentColor" : "none"} />
          </button>

          {/* Leaderboard Tab */}
          <button
            onClick={() => setView({ type: 'leaderboard' })}
            className={`transition-all duration-300 flex items-center justify-center cursor-pointer ${
              view.type === 'leaderboard'
                ? 'bg-[#82C341] text-[#0d0f12] px-5 py-2.5 rounded-full font-bold'
                : 'p-3 text-gray-400 hover:text-white'
            }`}
            title={t('leaderboard')}
          >
            <Trophy size={18} fill={view.type === 'leaderboard' ? "currentColor" : "none"} />
          </button>

          {/* Favorites Tab */}
          <button
            onClick={() => setView({ type: 'favorites' })}
            className={`transition-all duration-300 flex items-center justify-center cursor-pointer ${
              view.type === 'favorites'
                ? 'bg-[#82C341] text-[#0d0f12] px-5 py-2.5 rounded-full font-bold'
                : 'p-3 text-gray-400 hover:text-white'
            }`}
            title={t('favorites')}
          >
            <Bookmark size={18} fill={view.type === 'favorites' ? "currentColor" : "none"} />
          </button>

          {/* Profile Tab */}
          <button
            onClick={() => setView({ type: 'profile' })}
            className={`transition-all duration-300 flex items-center justify-center cursor-pointer ${
              view.type === 'profile'
                ? 'bg-[#82C341] text-[#0d0f12] px-5 py-2.5 rounded-full font-bold'
                : 'p-3 text-gray-400 hover:text-white'
            }`}
            title={t('profile')}
          >
            <User size={18} fill={view.type === 'profile' ? "currentColor" : "none"} />
          </button>

        </div>
      </div>

      {/* Slide-out Sidebar Drawer Menu (Always available via Hamburger menu) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity cursor-pointer"
          />
          
          {/* Drawer content */}
          <div className="relative flex flex-col w-80 max-w-[85vw] h-full bg-[#0d0f12] border-r border-gray-900 p-6 shadow-2xl z-50 text-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 mb-8">
              <span className="font-display font-black text-sm uppercase tracking-tight text-white">
                OKU<span className="text-[#82C341]">TARI</span> MENU
              </span>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 hover:bg-gray-900 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Tutup"
              >
                <X size={20} />
              </button>
            </div>

            {/* Nav Links */}
            <nav className="flex flex-col gap-2 flex-grow">
              <button 
                onClick={() => { setView({ type: 'home' }); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-left transition-all cursor-pointer ${
                  view.type === 'home' ? 'bg-[#82C341] text-[#0d0f12]' : 'hover:bg-gray-900 text-gray-300 hover:text-white'
                }`}
              >
                <Home size={16} />
                {t('home')}
              </button>

              <button 
                onClick={() => { setView({ type: 'leaderboard' }); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-left transition-all cursor-pointer ${
                  view.type === 'leaderboard' ? 'bg-[#82C341] text-[#0d0f12]' : 'hover:bg-gray-900 text-gray-300 hover:text-white'
                }`}
              >
                <Trophy size={16} />
                {t('leaderboard')}
              </button>

              <button 
                onClick={() => { setView({ type: 'favorites' }); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-left transition-all cursor-pointer ${
                  view.type === 'favorites' ? 'bg-[#82C341] text-[#0d0f12]' : 'hover:bg-gray-900 text-gray-300 hover:text-white'
                }`}
              >
                <Bookmark size={16} />
                {t('favorites')}
              </button>

              <button 
                onClick={() => { setView({ type: 'profile' }); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-left transition-all cursor-pointer ${
                  view.type === 'profile' ? 'bg-[#82C341] text-[#0d0f12]' : 'hover:bg-gray-900 text-gray-300 hover:text-white'
                }`}
              >
                <User size={16} />
                {t('profile')}
              </button>
            </nav>

            {/* Footer */}
            <div className="pt-4 border-t border-gray-900/60 text-center">
              <span className="text-[9px] text-gray-600 font-black tracking-widest uppercase">
                Wi-Buku Reader
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Universal Footer */}
      <Footer />

    </div>
  );
}
