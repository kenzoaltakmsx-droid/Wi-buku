import React, { useEffect, useState } from 'react';
import { ArrowLeft, Bookmark, BookmarkCheck, List, Sparkles, BookOpen } from 'lucide-react';
import { useFavorites } from '../store';
import { useTranslation } from '../translations';

interface Chapter {
  title: string;
  link: string;
  date: string;
}

interface MangaDetailData {
  title: string;
  thumb: string;
  synopsis: string;
  chapters: Chapter[];
}

interface MangaDetailProps {
  url: string;
  onBack: () => void;
  onChapterSelect: (chapterUrl: string) => void;
}

export default function MangaDetail({ url, onBack, onChapterSelect }: MangaDetailProps) {
  const { t, language } = useTranslation();
  const [data, setData] = useState<MangaDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortAsc, setSortAsc] = useState(false); // Default descending (newest first)
  const [chapterSearch, setChapterSearch] = useState('');

  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    
    fetch(`/api/detail?url=${encodeURIComponent(url)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Gagal memuat detail manga.');
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Respons server tidak valid (bukan JSON).');
        }
        return res.json();
      })
      .then((resData) => {
        if (active) {
          setData(resData);
          setLoading(false);
        }
      })
      .catch((err: any) => {
        if (active) {
          setError(err.message || 'Kesalahan koneksi.');
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [url]);

  if (loading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-24 min-h-[400px]">
        <div className="w-12 h-12 border-4 border-[#82C341] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 text-sm">{t('loading')}</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-20 px-4">
        <p className="text-red-400 font-semibold mb-4">{error || t('noMangaFound')}</p>
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded-full transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> {t('backToHome')}
        </button>
      </div>
    );
  }

  const isFav = isFavorite(url);

  // Toggle state using store helper
  const handleToggleFavorite = () => {
    toggleFavorite({
      title: data.title,
      link: url,
      thumb: data.thumb || 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=300&q=80',
      desc: 'Manga/Manhwa'
    });
  };

  // Sort and filter chapters
  const filteredChapters = data.chapters.filter(ch => 
    ch.title.toLowerCase().includes(chapterSearch.toLowerCase())
  );

  const sortedChapters = [...filteredChapters].sort((a, b) => {
    // Basic sorting by index / title number approximation
    return sortAsc ? 1 : -1; 
  });

  return (
    <div className="relative w-full pb-20 bg-[#0d0f12]">
      {/* Background Cover Blur Banner */}
      <div className="absolute top-0 left-0 w-full h-[240px] overflow-hidden z-0 opacity-20">
        <img 
          src={data.thumb} 
          alt={data.title} 
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover blur-3xl scale-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f12] via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pt-6">
        {/* Back navigation button */}
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#82C341] hover:text-[#99db4e] mb-8 group cursor-pointer transition-colors"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>{t('backToHome')}</span>
        </button>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Cover & Fav Button Sidebar */}
          <div className="md:col-span-1 flex flex-col gap-4">
            <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-gray-900 shadow-2xl border border-gray-800">
              <img 
                src={data.thumb} 
                alt={data.title} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
            </div>

            <button 
              onClick={handleToggleFavorite}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                isFav 
                  ? 'bg-amber-500/10 border border-amber-500/40 text-amber-500 hover:bg-amber-500/20' 
                  : 'bg-[#82C341] hover:bg-[#99db4e] text-[#0d0f12] shadow-lg shadow-[#82C341]/10'
              }`}
            >
              {isFav ? (
                <>
                  <BookmarkCheck size={14} />
                  <span>{t('bookmarked')}</span>
                </>
              ) : (
                <>
                  <Bookmark size={14} />
                  <span>{t('bookmark')}</span>
                </>
              )}
            </button>
          </div>

          {/* Texts & Info Content Area */}
          <div className="md:col-span-3 flex flex-col justify-start">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-[#82C341]/15 text-[#82C341] rounded-md text-[10px] font-bold uppercase tracking-wider">
                Manga
              </span>
              <span className="text-gray-500 text-xs">•</span>
              <span className="text-gray-400 text-xs">
                {language === 'ID' ? 'Baru diperbarui' : 'Recently updated'}
              </span>
            </div>

            <h1 className="font-display font-bold text-2xl md:text-4xl text-white mb-4 uppercase leading-tight tracking-tight">
              {data.title}
            </h1>

            <div className="bg-[#111418] border border-gray-800/80 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider mb-3">
                <Sparkles size={14} className="text-[#82C341]" />
                <span>{t('synopsis')}</span>
              </div>
              <p className="text-xs md:text-sm text-gray-300 leading-relaxed font-light whitespace-pre-line">
                {data.synopsis}
              </p>
            </div>

            {/* Quick specifications */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-[#111418]/60 border border-gray-800/60 rounded-xl">
                <span className="text-gray-500 block mb-0.5">
                  {language === 'ID' ? 'Arah Baca' : 'Reading Direction'}
                </span>
                <span className="text-gray-300 font-semibold">
                  {language === 'ID' ? 'Kanan ke Kiri' : 'Right to Left'}
                </span>
              </div>
              <div className="p-3 bg-[#111418]/60 border border-gray-800/60 rounded-xl">
                <span className="text-gray-500 block mb-0.5">
                  {language === 'ID' ? 'Sumber' : 'Source'}
                </span>
                <span className="text-gray-300 font-semibold">Komikindo TV</span>
              </div>
              <div className="p-3 bg-[#111418]/60 border border-gray-800/60 rounded-xl col-span-2 sm:col-span-1">
                <span className="text-gray-500 block mb-0.5">Total Chapter</span>
                <span className="text-gray-300 font-semibold">{data.chapters.length}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Chapters Section */}
        <div className="border-t border-gray-800/60 pt-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <List size={18} className="text-[#82C341]" />
              <h2 className="font-display font-bold text-lg text-white uppercase tracking-tight">
                {t('chapters')} ({filteredChapters.length})
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {/* Filter inputs */}
              <input 
                type="text" 
                placeholder={language === 'ID' ? 'Cari chapter...' : 'Search chapter...'}
                value={chapterSearch}
                onChange={(e) => setChapterSearch(e.target.value)}
                className="bg-[#111418] border border-gray-800 focus:border-[#82C341]/60 focus:outline-none text-xs text-white rounded-xl px-3 py-1.5 placeholder-gray-500 w-44"
              />

              <button 
                onClick={() => setSortAsc(!sortAsc)}
                className="px-3 py-1.5 bg-[#111418] border border-gray-800 hover:border-gray-700 text-xs text-gray-300 rounded-xl cursor-pointer transition-colors"
              >
                {sortAsc 
                  ? (language === 'ID' ? 'Terlama Dahulu' : 'Oldest First') 
                  : (language === 'ID' ? 'Terbaru Dahulu' : 'Newest First')}
              </button>
            </div>
          </div>

          {/* Chapter cards list */}
          {sortedChapters.length === 0 ? (
            <div className="bg-[#111418] border border-gray-800 p-8 text-center rounded-2xl">
              <p className="text-gray-400 text-xs">Tidak ada chapter yang tersedia dengan filter saat ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {sortedChapters.map((ch, index) => (
                <div 
                  key={index}
                  onClick={() => onChapterSelect(ch.link)}
                  className="flex items-center justify-between p-4 bg-[#111418] border border-gray-800/80 hover:border-[#82C341]/40 rounded-xl cursor-pointer group hover:bg-[#15191e] transition-all"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <BookOpen size={14} className="text-gray-500 group-hover:text-[#82C341] transition-colors shrink-0" />
                    <span className="font-semibold text-xs text-white group-hover:text-[#82C341] transition-colors line-clamp-1">
                      {ch.title}
                    </span>
                  </div>
                  {ch.date && (
                    <span className="text-[10px] text-gray-500 shrink-0 font-mono">
                      {ch.date}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
