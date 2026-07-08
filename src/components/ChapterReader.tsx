import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, BookOpen, Settings, RefreshCw, ZoomIn, ZoomOut, Sparkles, CheckCircle, Trophy, Award, AlertCircle } from 'lucide-react';
import { useUserStore } from '../store';
import { useTranslation } from '../translations';

interface ChapterData {
  title: string;
  images: string[];
  prev: string | null;
  next: string | null;
  mangaLink: string | null;
}

interface ChapterReaderProps {
  url: string;
  onBackToManga: (mangaUrl: string) => void;
  onChapterSelect: (chapterUrl: string) => void;
}

export default function ChapterReader({ url, onBackToManga, onChapterSelect }: ChapterReaderProps) {
  const { t, language } = useTranslation();
  const [data, setData] = useState<ChapterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [zoom, setZoom] = useState(100); // percentage width zoom
  const readerTopRef = useRef<HTMLDivElement>(null);

  // Auth and points state
  const { user, completeChapter, hasCompleted } = useUserStore();
  const [claimed, setClaimed] = useState(false);
  const [showLevelUpAlert, setShowLevelUpAlert] = useState(false);

  useEffect(() => {
    setClaimed(false);
    setShowLevelUpAlert(false);
  }, [url]);

  const alreadyClaimed = hasCompleted(url) || claimed;

  const handleClaimPoints = async () => {
    if (!user) return;
    const result = await completeChapter(url, data?.title || 'Chapter');
    if (result) {
      setClaimed(true);
      if (result.leveledUp) {
        setShowLevelUpAlert(true);
      }
    }
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    fetch(`/api/chapter?url=${encodeURIComponent(url)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Gagal memuat konten chapter.');
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
          // Scroll smoothly to top on load
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      })
      .catch((err: any) => {
        if (active) {
          setError(err.message || 'Gagal memuat gambar.');
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [url]);

  if (loading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-32 bg-[#090a0c] min-h-screen">
        <div className="w-12 h-12 border-4 border-[#82C341] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 text-sm animate-pulse">{t('loadingImages')}</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-24 px-4 bg-[#090a0c] min-h-screen">
        <p className="text-red-400 font-semibold mb-4 text-center">{error || (language === 'ID' ? 'Chapter tidak ditemukan atau kegagalan scraping.' : 'Chapter not found or scraping failed.')}</p>
        <button 
          onClick={() => {
            if (data?.mangaLink) {
              onBackToManga(data.mangaLink);
            } else {
              window.history.back();
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded-full transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> {t('backToManga')}
        </button>
      </div>
    );
  }

  return (
    <div ref={readerTopRef} className="min-h-screen bg-[#090a0c] text-gray-100 flex flex-col">
      {/* Dynamic Header Reader Bar */}
      <div className="sticky top-0 z-50 bg-[#0d0f12]/95 border-b border-gray-900/80 backdrop-blur-md px-4 py-2 flex items-center justify-between gap-4">
        
        {/* Left Nav */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              if (data.mangaLink) {
                onBackToManga(data.mangaLink);
              }
            }}
            className="p-1.5 hover:bg-gray-800 rounded-lg text-[#82C341] transition-colors cursor-pointer"
            title={t('backToManga')}
          >
            <ArrowLeft size={18} />
          </button>
          
          <div className="flex flex-col min-w-0">
            <h1 className="font-display font-bold text-xs md:text-sm text-white truncate max-w-[200px] sm:max-w-xs md:max-w-md">
              {data.title}
            </h1>
            <span className="text-[10px] text-gray-500 font-medium">
              {language === 'ID' ? 'Mode Baca Vertikal' : 'Vertical Reading Mode'}
            </span>
          </div>
        </div>

        {/* Reader Settings & Actions */}
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="hidden sm:flex items-center gap-1.5 border-r border-gray-800 pr-2 mr-2">
            <button 
              onClick={() => setZoom(Math.max(50, zoom - 10))}
              className="p-1.5 text-gray-400 hover:text-white rounded-md cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut size={14} />
            </button>
            <span className="text-[10px] text-gray-400 font-mono w-8 text-center">{zoom}%</span>
            <button 
              onClick={() => setZoom(Math.min(100, zoom + 10))}
              className="p-1.5 text-gray-400 hover:text-white rounded-md cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn size={14} />
            </button>
          </div>

          {/* Prev Chapter */}
          <button 
            disabled={!data.prev}
            onClick={() => data.prev && onChapterSelect(data.prev)}
            className="p-1.5 bg-[#111418] border border-gray-800 hover:border-gray-700 rounded-lg text-gray-300 hover:text-[#82C341] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1"
          >
            <ChevronLeft size={14} />
            <span className="hidden md:inline text-[10px] font-bold uppercase tracking-wider">
              {language === 'ID' ? 'Sblm' : 'Prev'}
            </span>
          </button>

          {/* Next Chapter */}
          <button 
            disabled={!data.next}
            onClick={() => data.next && onChapterSelect(data.next)}
            className="p-1.5 bg-[#111418] border border-gray-800 hover:border-gray-700 rounded-lg text-gray-300 hover:text-[#82C341] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1"
          >
            <span className="hidden md:inline text-[10px] font-bold uppercase tracking-wider">
              {language === 'ID' ? 'Brkt' : 'Next'}
            </span>
            <ChevronRight size={14} />
          </button>
        </div>

      </div>

      {/* Pages Container - Styled for manga reading */}
      <div className="flex-grow py-6 flex flex-col items-center justify-start bg-[#090a0c] overflow-y-auto">
        <div 
          className="flex flex-col gap-1 transition-all duration-300" 
          style={{ width: `${zoom}%`, maxWidth: '800px' }}
        >
          {data.images.map((img, index) => (
            <div key={index} className="relative w-full overflow-hidden bg-gray-950/40 min-h-[400px]">
              <img 
                src={img} 
                alt={`${language === 'ID' ? 'Halaman' : 'Page'} ${index + 1}`} 
                referrerPolicy="no-referrer"
                loading="lazy"
                className="w-full h-auto object-contain mx-auto"
                onError={(e) => {
                  // Fallback or retry logic if images fail to load due to scrapers
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="absolute bottom-2 right-2 text-[9px] text-gray-500 font-mono bg-black/45 px-1.5 py-0.5 rounded-sm">
                {language === 'ID' ? 'Halaman' : 'Page'} {index + 1} / {data.images.length}
              </div>
            </div>
          ))}

          {data.images.length === 0 && (
            <div className="py-16 text-center text-gray-400 text-xs">
              {language === 'ID' ? 'Gagal memuat halaman chapter ini secara otomatis.' : 'Failed to load chapter pages automatically.'}
            </div>
          )}
        </div>
      </div>

      {/* Gamified Points Claiming Banner */}
      <div className="w-full max-w-xl mx-auto px-4 mt-6 mb-2">
        {!user ? (
          <div className="bg-[#111418] border border-dashed border-gray-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🐱</span>
              <div>
                <h4 className="text-xs font-bold text-white uppercase">
                  {language === 'ID' ? 'Ingin Mendapatkan Poin?' : 'Want to Earn Points?'}
                </h4>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {language === 'ID' ? 'Masuk akun terlebih dahulu untuk menyimpan level & skor membaca Anda!' : 'Sign in first to save your level & reading score!'}
                </p>
              </div>
            </div>
            <span className="text-[10px] text-[#82C341] font-bold bg-[#82C341]/10 px-2.5 py-1 rounded border border-[#82C341]/20 shrink-0">
              {language === 'ID' ? 'Klaim +50 XP' : 'Claim +50 XP'}
            </span>
          </div>
        ) : alreadyClaimed ? (
          <div className="bg-[#82C341]/5 border border-[#82C341]/20 rounded-2xl p-4 flex items-center justify-center gap-2 text-[#82C341]">
            <CheckCircle size={16} />
            <span className="text-xs font-bold uppercase tracking-wider text-center">
              {language === 'ID' ? 'Bab Ini Telah Diselesaikan! (+50 XP Diklaim)' : 'This Chapter has been Completed! (+50 XP Claimed)'}
            </span>
          </div>
        ) : (
          <button 
            onClick={handleClaimPoints}
            className="w-full bg-gradient-to-r from-[#82C341] to-[#99db4e] text-[#0d0f12] py-4 px-6 rounded-2xl font-display font-black text-xs uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg shadow-[#82C341]/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles size={16} className="animate-bounce" />
            {language === 'ID' ? 'Selesaikan Bab Ini & Klaim +50 Poin Hunter!' : 'Complete this Chapter & Claim +50 Hunter Points!'}
          </button>
        )}
      </div>

      {/* Chapter Reader Bottom Footer Navigation */}
      <div className="bg-[#0d0f12] border-t border-gray-900 py-8 px-4 flex flex-col items-center gap-6">
        <div className="flex items-center gap-4">
          {data.prev && (
            <button 
              onClick={() => onChapterSelect(data.prev!)}
              className="px-5 py-2.5 bg-[#111418] border border-gray-800 hover:border-[#82C341] text-xs font-semibold rounded-full hover:text-[#82C341] transition-all cursor-pointer flex items-center gap-2"
            >
              <ChevronLeft size={14} />
              {t('prevChapter')}
            </button>
          )}

          {data.mangaLink && (
            <button 
              onClick={() => onBackToManga(data.mangaLink!)}
              className="px-5 py-2.5 bg-[#82C341]/10 border border-[#82C341]/30 hover:border-[#82C341] text-xs font-bold uppercase tracking-wider rounded-full text-[#82C341] hover:bg-[#82C341] hover:text-[#0d0f12] transition-all cursor-pointer flex items-center gap-2"
            >
              <BookOpen size={14} />
              {t('backToManga')}
            </button>
          )}

          {data.next && (
            <button 
              onClick={() => onChapterSelect(data.next!)}
              className="px-5 py-2.5 bg-[#82C341] hover:bg-[#99db4e] text-[#0d0f12] text-xs font-bold rounded-full transition-all cursor-pointer flex items-center gap-2"
            >
              {t('nextChapter')}
              <ChevronRight size={14} />
            </button>
          )}
        </div>

        <span className="text-[11px] text-gray-500 font-medium">
          {language === 'ID' 
            ? 'Tips: Gunakan tombol panah di bagian atas untuk navigasi cepat antar chapter.' 
            : 'Tip: Use the arrow buttons at the top for quick navigation between chapters.'}
        </span>
      </div>

      {/* Level Up Celebration Dialog */}
      {showLevelUpAlert && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-[#111418] border-2 border-[#82C341] rounded-3xl p-6 md:p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden">
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#82C341]/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl"></div>
            
            <div className="text-5xl mb-4">🏆</div>
            <span className="px-2.5 py-0.5 bg-[#82C341]/10 text-[#82C341] rounded-full text-[10px] font-bold uppercase tracking-widest mb-2 inline-block border border-[#82C341]/20">
              LEVEL UP!
            </span>
            <h3 className="font-display font-black text-xl text-white uppercase tracking-tight mt-1">
              {language === 'ID' ? `Level ${user.level} Dicapai!` : `Level ${user.level} Reached!`}
            </h3>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              {language === 'ID' 
                ? `Selamat Hunter ${user.username}! Gelar Anda meningkat. Teruslah membaca manga untuk menjadi yang terkuat!` 
                : `Congratulations Hunter ${user.username}! Your rank has increased. Keep reading manga to become the strongest!`}
            </p>
            <div className="mt-6 p-3 bg-gray-950 rounded-xl border border-gray-900 text-xs text-yellow-500 font-bold uppercase flex items-center justify-center gap-1.5">
              <Award size={14} /> {language === 'ID' ? 'Gelar Baru: ' : 'New Title: '}{user.level >= 10 ? "Shadow Monarch" : user.level >= 6 ? "S-Rank Hunter" : user.level >= 3 ? "Elite Hunter" : "Novice"}
            </div>
            <button
              onClick={() => setShowLevelUpAlert(false)}
              className="mt-6 w-full py-2.5 bg-[#82C341] hover:bg-[#99db4e] text-[#0d0f12] text-xs font-bold rounded-xl transition-all cursor-pointer uppercase tracking-wider"
            >
              {language === 'ID' ? 'Lanjutkan Membaca' : 'Continue Reading'}
            </button>
          </div>
        </div>
      )}


    </div>
  );
}
