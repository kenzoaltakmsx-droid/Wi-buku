import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Medal, 
  Star, 
  Flame, 
  Award, 
  BookOpen, 
  ArrowUp, 
  Sparkles, 
  Info, 
  Share2, 
  X, 
  Facebook, 
  Twitter, 
  MessageCircle, 
  Link2,
  Check
} from 'lucide-react';
import { useUserStore } from '../store';
import { useTranslation } from '../translations';
import crownLogo from '@/assets/crown-logo.svg';
import logoBuku from '@/assets/logo-buku.svg';
import logoKucing from '@/assets/logo-kucing.svg';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: useUserStore.getState().user?.uid,
      email: useUserStore.getState().user?.email,
    },
    operationType,
    path
  };
  console.warn('Firestore Handled Gracefully: ', JSON.stringify(errInfo));
  return errInfo;
}

interface LeaderboardViewProps {
  onNavigate?: (viewType: 'home' | 'leaderboard' | 'favorites' | 'profile') => void;
}

export default function LeaderboardView({ onNavigate }: LeaderboardViewProps) {
  const { t, language } = useTranslation();
  const { user } = useUserStore();
  const [showInfo, setShowInfo] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAll, setShowAll] = useState(true);
  const [copied, setCopied] = useState(false);
  const [shareSuccessMessage, setShareSuccessMessage] = useState<string | null>(null);
  const [realUsers, setRealUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveActivity, setLiveActivity] = useState<{
    username: string;
    avatar: string;
    text: string;
  } | null>(null);

  const getMotivationQuote = () => {
    const level = user?.level || 1;
    if (level >= 10) {
      return language === 'ID' 
        ? "Satu-satunya jalan adalah terus melangkah ke atas. Pertahankan takhta Shadow Monarch Anda!"
        : "The only way is up. Defend your throne as the ultimate Shadow Monarch!";
    } else if (level >= 6) {
      return language === 'ID'
        ? "Kekuatan luar biasa telah terbangkitkan! Teruslah membaca untuk menjadi S-Rank Hunter terkuat!"
        : "An extraordinary power has awakened! Keep reading to become the strongest S-Rank Hunter!";
    } else if (level >= 3) {
      return language === 'ID'
        ? "Gelar Elite telah di tangan! Asah terus fokusmu dan taklukkan level berikutnya!"
        : "Elite Title secured! Sharpen your focus and conquer the next level!";
    } else {
      return language === 'ID'
        ? "Perjalanan baru saja dimulai! Kumpulkan XP, selesaikan chapter, dan capai puncak tertinggi!"
        : "The journey has just begun! Gather XP, complete chapters, and reach the absolute peak!";
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersList: any[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const username = data.username || data.email?.split('@')[0] || "Hunter";
          usersList.push({
            username: username,
            points: data.points ?? 0,
            level: data.level ?? 1,
            avatar: data.avatar || "🐱",
            title: data.level >= 10 ? "Shadow Monarch" : data.level >= 6 ? "S-Rank Hunter" : data.level >= 3 ? "Elite Hunter" : "Novice Reader",
            completedCount: data.completedChapters?.length || data.completedChaptersCount || 0,
            uid: doc.id
          });
        });

        setRealUsers(usersList);
      } catch (error: any) {
        handleFirestoreError(error, OperationType.GET, 'users');
        setRealUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Real-time live feed generator simulation
  useEffect(() => {
    if (loading || realUsers.length === 0) return;

    const interval = setInterval(() => {
      // Pick a random user that is not the current user
      const candidateUsers = realUsers.filter(u => !u.username.endsWith('(Anda)') && u.uid !== user?.uid);
      if (candidateUsers.length === 0) return;

      const randomUser = candidateUsers[Math.floor(Math.random() * candidateUsers.length)];
      
      const mangas = ["Solo Leveling", "One Piece", "Blue Lock", "Jujutsu Kaisen", "Chainsaw Man", "Oshi no Ko", "Demon Slayer"];
      const randomManga = mangas[Math.floor(Math.random() * mangas.length)];
      const randomChapter = Math.floor(Math.random() * 80) + 1;
      const pointsAdded = 50;

      // Update the user's points in real-time state
      setRealUsers(prev => prev.map(u => {
        if (u.uid === randomUser.uid) {
          const newPoints = u.points + pointsAdded;
          const newLevel = Math.floor(newPoints / 200) + 1;
          const newTitle = newLevel >= 10 ? "Shadow Monarch" : newLevel >= 6 ? "S-Rank Hunter" : newLevel >= 3 ? "Elite Hunter" : "Novice Reader";
          return {
            ...u,
            points: newPoints,
            level: newLevel,
            title: newTitle,
            completedCount: u.completedCount + 1
          };
        }
        return u;
      }));

      // Generate localized feed text
      const text = language === 'ID'
        ? `menyelesaikan Chapter ${randomChapter} dari ${randomManga} (+50 Poin)`
        : `completed Chapter ${randomChapter} of ${randomManga} (+50 Points)`;
      
      setLiveActivity({
        username: randomUser.username,
        avatar: randomUser.avatar,
        text: text
      });

      // Clear activity display after 6 seconds
      const timeout = setTimeout(() => {
        setLiveActivity(null);
      }, 6000);

      return () => clearTimeout(timeout);
    }, 12000); // Trigger live event every 12 seconds for a highly real-time feeling

    return () => clearInterval(interval);
  }, [loading, realUsers.length, user, language]);

  const triggerShareFeedback = (platform: string) => {
    setShareSuccessMessage(`Berhasil membagikan ranking Anda ke ${platform}!`);
    setTimeout(() => {
      setShareSuccessMessage(null);
    }, 3000);
  };

  // Combine real users fetched from Firestore
  let leaderboardData = [...realUsers];
  
  if (user) {
    // Check if user already exists
    const existsIndex = leaderboardData.findIndex(item => item.uid === user.uid || item.username === user.username || item.username === `${user.username} (Anda)`);
    if (existsIndex !== -1) {
      leaderboardData[existsIndex] = {
        username: `${user.username} (Anda)`,
        points: user.points,
        level: user.level,
        avatar: user.avatar,
        title: user.level >= 10 ? "Shadow Monarch" : user.level >= 6 ? "S-Rank Hunter" : user.level >= 3 ? "Elite Hunter" : "Novice Reader",
        completedCount: user.completedChaptersCount,
        uid: user.uid
      };
    } else {
      leaderboardData.push({
        username: `${user.username} (Anda)`,
        points: user.points,
        level: user.level,
        avatar: user.avatar,
        title: user.level >= 10 ? "Shadow Monarch" : user.level >= 6 ? "S-Rank Hunter" : user.level >= 3 ? "Elite Hunter" : "Novice Reader",
        completedCount: user.completedChaptersCount,
        uid: user.uid
      });
    }
  }

  // Ensure any other users don't have "(Anda)" in their username unless they are the current user
  leaderboardData = leaderboardData.map(item => {
    if (user && item.uid === user.uid) {
      if (!item.username.endsWith(' (Anda)')) {
        return { ...item, username: `${item.username} (Anda)` };
      }
    } else {
      return { ...item, username: item.username.replace(' (Anda)', '') };
    }
    return item;
  });

  // Sort by points descending
  leaderboardData.sort((a, b) => b.points - a.points);

  // Find user's rank
  const userRankIndex = user ? leaderboardData.findIndex(item => item.uid === user.uid || item.username.endsWith('(Anda)')) : -1;
  const userRank = userRankIndex !== -1 ? userRankIndex + 1 : null;

  const getShareUrl = (platform: string) => {
    const rank = userRank || '1';
    const lvl = user?.level || 1;
    const pts = user?.points || 0;
    
    const text = language === 'ID'
      ? `Lihat Peringkat Hunter saya di Wi-Buku! Peringkat #${rank} (Level ${lvl}) dengan ${pts} Poin. Bergabunglah membaca manga terpopuler sekarang!`
      : `Check out my Hunter Rank on Wi-Buku! Rank #${rank} (Level ${lvl}) with ${pts} Points. Join me in reading the most popular manga now!`;
    
    const url = window.location.origin;

    switch (platform) {
      case 'Twitter':
        return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      case 'Facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
      case 'WhatsApp':
        return `https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + url)}`;
      default:
        return '#';
    }
  };

  // Split top 3
  const top3 = leaderboardData.slice(0, 3);
  const restData = leaderboardData.slice(3);

  // Determine which ones to display in "rest"
  const restToShow = showAll ? restData : restData.slice(0, 4);

  // Podium order: [Rank 2 (Left), Rank 1 (Center), Rank 3 (Right)]
  const podiumOrder = [
    top3[1] || { username: "Empty", points: 0, level: 1, avatar: "❓", title: "Novice", completedCount: 0 },
    top3[0] || { username: "Empty", points: 0, level: 1, avatar: crownLogo, title: "Novice", completedCount: 0 },
    top3[2] || { username: "Empty", points: 0, level: 1, avatar: "❓", title: "Novice", completedCount: 0 }
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="w-full px-4 md:px-8 py-12 flex-grow flex flex-col items-center justify-center text-zinc-400 font-medium">
        <span className="w-8 h-8 rounded-full border-2 border-[#82C341] border-t-transparent animate-spin mb-3"></span>
        <span className="text-xs tracking-wider uppercase">Loading Leaderboard...</span>
      </div>
    );
  }

  return (
    <div 
      id="leaderboard-section" 
      className="w-full px-4 md:px-8 py-6 md:py-8 flex-grow flex flex-col justify-stretch relative overflow-hidden"
      style={{
        backgroundSize: '24px 24px',
        backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)'
      }}
    >
      {/* Subtle decorative glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-[#82C341]/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div>
          {/* Top Bar Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h2 className="font-sans font-black text-2xl text-white tracking-tight leading-none">
                {t('leaderboard')}
              </h2>
              <button 
                onClick={() => setShowInfo(!showInfo)}
                className="text-zinc-500 hover:text-white transition-all cursor-pointer"
                title={language === 'ID' ? 'Info Ketentuan Poin' : 'Points Rules Info'}
              >
                <Info size={16} />
              </button>
            </div>
            
            <span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-[#82C341] rounded-full animate-ping shrink-0"></span> REAL-TIME • LIVE
            </span>
          </div>

          {/* Info Modal/Panel inline */}
          {showInfo && (
            <div className="bg-[#1c1c1e] border border-zinc-800 rounded-2xl p-4 mb-6 text-left relative animate-in fade-in slide-in-from-top-2 duration-200">
              <button 
                onClick={() => setShowInfo(false)}
                className="absolute top-3 right-3 text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
              <h4 className="text-xs font-bold text-white uppercase mb-2 flex items-center gap-1.5">
                <Sparkles size={12} className="text-[#82C341]" /> {language === 'ID' ? 'Ketentuan Poin Hunter' : 'Hunter Points Rules'}
              </h4>
              <ul className="space-y-2 text-[11px] text-zinc-400">
                <li className="flex items-start gap-1.5">
                  <span className="text-[#82C341] font-bold">1.</span>
                  {language === 'ID' ? (
                    <span>Selesaikan <span className="text-white font-semibold">1 Bab (Chapter)</span> komik untuk mendapatkan <span className="text-white font-semibold">+50 Poin</span> & XP.</span>
                  ) : (
                    <span>Complete <span className="text-white font-semibold">1 Chapter</span> of a comic to get <span className="text-white font-semibold">+50 Points</span> & XP.</span>
                  )}
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#82C341] font-bold">2.</span>
                  {language === 'ID' ? (
                    <span>Kumpulkan XP untuk menaikkan <span className="text-white font-semibold">Level Hunter</span> Anda.</span>
                  ) : (
                    <span>Collect XP to increase your <span className="text-white font-semibold">Hunter Level</span>.</span>
                  )}
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#82C341] font-bold">3.</span>
                  {language === 'ID' ? (
                    <span>Gelar bergengsi seperti <span className="text-white font-semibold">Shadow Monarch</span> otomatis terbuka di level 10+.</span>
                  ) : (
                    <span>Prestigious ranks like <span className="text-white font-semibold">Shadow Monarch</span> unlock automatically at level 10+.</span>
                  )}
                </li>
              </ul>
            </div>
          )}

          {/* Dual column for large screens, stacked for mobile */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* Left Column: Stats & Podium */}
            <div className="w-full lg:w-5/12 flex flex-col justify-start">
              {/* User Stat Banner / Performance Indicator */}
              <div className="bg-[#1c1c1e]/60 border border-zinc-900 rounded-2xl p-3.5 text-center mb-6">
                <p className="text-[11px] font-semibold text-[#f59e0b] leading-tight flex items-center justify-center gap-1.5 flex-wrap">
                  <Flame size={12} className="shrink-0 animate-bounce" />
                  {user ? (
                    <span>You are doing better than <span className="text-white font-extrabold">{userRank ? Math.max(10, Math.round(100 - (userRank / leaderboardData.length) * 100)) : 60}%</span> of other Learners</span>
                  ) : (
                    <button 
                      onClick={() => onNavigate && onNavigate('profile')}
                      className="bg-transparent border-none text-[#82C341] hover:text-[#99db4e] hover:underline font-bold cursor-pointer inline-flex items-center gap-1 transition-all"
                    >
                      <span>Masuk dengan akun Anda untuk melihat performa ranking Anda!</span>
                      <ArrowUp size={11} className="rotate-45" />
                    </button>
                  )}
                </p>
              </div>

              {/* Podiums Section (Rank 2, Rank 1, Rank 3) */}
              <div className="grid grid-cols-3 gap-2 items-end mb-8 pt-4 bg-[#111418]/30 border border-zinc-900/40 rounded-3xl p-4">
                {podiumOrder.map((item, idx) => {
                  // idx 0 is Rank 2 (Left), idx 1 is Rank 1 (Center), idx 2 is Rank 3 (Right)
                  const isFirst = idx === 1;
                  const isSecond = idx === 0;
                  const isThird = idx === 2;
                  
                  const rank = isFirst ? 1 : isSecond ? 2 : 3;
                  const isCurrentUser = user && (item.username.endsWith('(Anda)') || item.username === user.username);
                  const isEmptySlot = item.username === "Empty";

                  return (
                    <div key={idx} className="flex flex-col items-center">
                      
                      {/* Circular Avatar + Podium Frame */}
                      <div className="relative mb-2 flex items-center justify-center">
                        {/* Crown for First Place */}
                        {isFirst && !isEmptySlot && (
                          <div className="absolute -top-10 z-10 animate-bounce duration-1000">
                            <img 
                              src={crownLogo} 
                              alt="Crown" 
                              className="w-10 h-10 object-contain select-none invert opacity-95 brightness-125 filter drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]" 
                              referrerPolicy="no-referrer" 
                            />
                          </div>
                        )}
                        
                        {/* Circle Frame */}
                        <div className={`rounded-full flex items-center justify-center text-2xl relative shadow-xl select-none overflow-hidden ${
                          isEmptySlot
                            ? 'w-14 h-14 bg-zinc-950/20 border-2 border-dashed border-zinc-800 text-zinc-700'
                            : isFirst 
                            ? 'w-18 h-18 bg-zinc-950 border-4 border-[#f59e0b]' 
                            : 'w-14 h-14 bg-zinc-950 border-2 border-zinc-800'
                        }`}>
                          {isFirst && !isEmptySlot && (
                            <span className="absolute inset-0 rounded-full bg-[#f59e0b]/10 animate-ping opacity-30"></span>
                          )}
                          {isEmptySlot ? (
                            <span className="text-zinc-600 font-mono text-sm">?</span>
                          ) : item.avatar && (
                            item.avatar.startsWith('http://') || 
                            item.avatar.startsWith('https://') || 
                            item.avatar.startsWith('/') || 
                            item.avatar.startsWith('data:') || 
                            item.avatar.includes('.svg')
                          ) ? (
                            <img 
                              src={item.avatar} 
                              alt={item.username} 
                              className={`object-contain rounded-full select-none ${
                                item.avatar === crownLogo 
                                  ? 'w-10 h-10 p-1 invert opacity-95' 
                                  : 'w-full h-full object-cover'
                              }`} 
                              referrerPolicy="no-referrer" 
                            />
                          ) : (
                            <span>{item.avatar}</span>
                          )}
                          
                          {/* Floating Rank Badge */}
                          <span className={`absolute -bottom-1 right-1/2 translate-x-1/2 w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] font-black border text-black font-sans ${
                            isEmptySlot
                              ? 'bg-zinc-900 border-zinc-800 text-zinc-500'
                              : isFirst 
                              ? 'bg-[#f59e0b] border-[#f59e0b]' 
                              : isSecond 
                              ? 'bg-[#94a3b8] border-[#94a3b8]' 
                              : 'bg-[#b45309] border-[#b45309]'
                          }`}>
                            {rank}
                          </span>
                        </div>
                      </div>

                      {/* Username */}
                      <div className="text-center w-full max-w-[100px] mt-1">
                        <p className={`text-xs truncate leading-none ${
                          isEmptySlot 
                            ? 'text-zinc-600 font-medium italic' 
                            : isCurrentUser 
                            ? 'text-[#82C341] font-black' 
                            : 'text-white font-bold'
                        }`}>
                          {isEmptySlot 
                            ? (language === 'ID' ? 'Menunggu...' : 'Awaiting...')
                            : item.username.replace(' (Anda)', '')
                          }
                        </p>
                        
                        {/* Points with Book Logo */}
                        {!isEmptySlot && (
                          <div className="flex items-center justify-center gap-1.5 mt-1.5">
                            <span className="text-[10px] text-zinc-400 font-bold font-mono">
                              {item.points}
                            </span>
                            <img 
                              src={logoBuku} 
                              alt="Book Logo" 
                              className="w-5.5 h-5.5 object-contain select-none shrink-0 brightness-0 invert"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Rankings List & Action buttons */}
            <div className="w-full lg:w-7/12 flex flex-col justify-start">
              {/* Rankings List */}
              <div className="space-y-2.5 pr-1">
                {restToShow.length > 0 ? (
                  restToShow.map((item, index) => {
                    const rank = index + 4;
                    const isCurrentUser = user && (item.username.endsWith('(Anda)') || item.username === user.username);

                    return (
                      <div 
                        key={index} 
                        className={`w-full py-3 px-4 rounded-full flex items-center justify-between gap-3 transition-all ${
                          isCurrentUser 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10' 
                            : 'bg-[#1c1c1e] border border-zinc-900 text-zinc-300'
                        }`}
                      >
                        {/* Left Side: Rank, Avatar, Name */}
                        <div className="flex items-center gap-3.5 min-w-0">
                          <span className={`text-xs font-black font-sans shrink-0 w-5 text-center ${
                            isCurrentUser ? 'text-white' : 'text-zinc-500'
                          }`}>
                            {rank}
                          </span>
                          
                          <div className="w-8 h-8 rounded-full bg-black/40 border border-zinc-800/80 flex items-center justify-center text-base shrink-0 select-none overflow-hidden">
                            {item.avatar && (
                              item.avatar.startsWith('http://') || 
                              item.avatar.startsWith('https://') || 
                              item.avatar.startsWith('/') || 
                              item.avatar.startsWith('data:') || 
                              item.avatar.includes('.svg')
                            ) ? (
                              <img 
                                src={item.avatar} 
                                alt={item.username} 
                                className={`object-contain rounded-full select-none ${
                                  item.avatar === crownLogo 
                                    ? 'w-5 h-5 p-0.5 invert opacity-95' 
                                    : 'w-full h-full object-cover'
                                }`} 
                                referrerPolicy="no-referrer" 
                              />
                            ) : (
                              item.avatar
                            )}
                          </div>

                          <div className="min-w-0 flex flex-col text-left">
                            <span className={`text-xs font-bold truncate leading-none ${
                              isCurrentUser ? 'text-white' : 'text-zinc-200'
                            }`}>
                              {item.username.replace(' (Anda)', '')}
                            </span>
                            <span className={`text-[9px] mt-0.5 truncate font-medium ${
                              isCurrentUser ? 'text-blue-100' : 'text-zinc-500'
                            }`}>
                              {item.title}
                            </span>
                          </div>
                        </div>

                        {/* Right Side: Points */}
                        <div className="flex items-center gap-1 shrink-0">
                          <span className={`text-xs font-bold font-mono ${
                            isCurrentUser ? 'text-white' : 'text-zinc-300'
                          }`}>
                            {item.points}
                          </span>
                          <img 
                            src={logoBuku} 
                            alt="Book Logo" 
                            className="w-4.5 h-4.5 object-contain select-none shrink-0 brightness-0 invert"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 px-4 text-zinc-600 font-medium text-xs border border-dashed border-zinc-900 rounded-3xl bg-[#1c1c1e]/10">
                    <p className="mb-1">
                      {language === 'ID' 
                        ? 'Tidak ada Hunter lain yang terdaftar di papan peringkat saat ini.' 
                        : 'No other registered Hunters found on the leaderboard.'}
                    </p>
                    <p className="text-[10px] text-zinc-700">
                      {language === 'ID'
                        ? 'Ajak teman-temanmu mendaftar untuk bersaing secara real-time!'
                        : 'Invite your friends to register and compete in real-time!'}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons: Share & See more */}
              <div className="mt-8 flex gap-3.5 items-center">
                {/* Share Button (Aesthetic Square Button) */}
                <button
                  type="button"
                  onClick={() => setShowShareModal(true)}
                  className="w-14 h-14 bg-[#1c1c1e] border border-zinc-800/80 hover:bg-[#2c2c2e] text-white rounded-2xl flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-md group"
                  title="Bagikan Ranking"
                >
                  <Share2 size={18} className="group-hover:scale-110 transition-transform text-zinc-300 group-hover:text-white" />
                </button>

                {/* See More Button */}
                <button
                  type="button"
                  onClick={() => setShowAll(!showAll)}
                  className="flex-grow py-4 bg-white hover:bg-zinc-200 text-black text-sm font-bold rounded-full transition-all uppercase tracking-wider cursor-pointer shadow-lg text-center"
                >
                  {showAll ? 'See less' : 'See more'}
                </button>
              </div>
            </div>

          </div>
        </div>

      {/* Share Ranking Modal (Aesthetic Popup replicating right mockup phone) */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Dark Backdrop */}
          <div 
            onClick={() => setShowShareModal(false)}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity cursor-pointer"
          />

          {/* Dialog Container */}
          <div className="relative bg-[#09090b] border border-zinc-900 rounded-[44px] p-6 max-w-sm w-full mx-auto shadow-2xl z-50 text-center animate-in zoom-in-95 duration-200">
            
            {/* Close Button */}
            <button 
              onClick={() => setShowShareModal(false)}
              className="absolute -top-12 right-4 w-9 h-9 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-all cursor-pointer flex items-center justify-center shadow-xl z-[60]"
              aria-label="Tutup"
            >
              <X size={16} />
            </button>

            {/* Simulated Shareable Phone Card Design inside Modal (Card B) */}
            <div className="w-full bg-[#121214] border border-zinc-800/80 rounded-[32px] overflow-hidden shadow-2xl relative flex flex-col items-stretch text-left mb-6">
              
              {/* Top half with soft lime/yellow background like mockup Card B */}
              <div className="h-56 bg-[#e2f0d9] flex items-center justify-center relative overflow-hidden rounded-t-[32px]">
                {user && user.avatar && (
                  user.avatar.startsWith('http://') || 
                  user.avatar.startsWith('https://') || 
                  user.avatar.startsWith('data:') || 
                  user.avatar.startsWith('/')
                ) ? (
                  <img 
                    src={user.avatar} 
                    alt={user.username} 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer" 
                  />
                ) : (
                  <div className="text-6xl select-none animate-pulse">
                    {user ? user.avatar : '👧'}
                  </div>
                )}
                

              </div>

              {/* Bottom half with user information */}
              <div className="p-6 bg-[#121214] flex flex-col gap-3">
                {/* Name & Rank Badge Row */}
                <div className="flex items-center justify-between gap-2.5">
                  <h3 className="text-base font-display font-black text-white truncate max-w-[170px]">
                    {user ? user.username : 'Guest Hunter'}
                  </h3>
                  {/* Rank replaces the green checkmark */}
                  <span className="inline-flex items-center bg-[#82C341]/10 text-[#82C341] text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-[#82C341]/20 font-mono">
                    Rank #{userRank || '1'}
                  </span>
                </div>

                {/* Motivational Quote */}
                <p className="text-xs text-zinc-400 font-medium leading-relaxed min-h-[44px]">
                  "{getMotivationQuote()}"
                </p>

                {/* Bottom Row - followers and points stats are deleted, button remains on right */}
                <div className="flex items-center justify-between pt-3 border-t border-zinc-900/60 mt-2">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider font-mono">
                    LV.{user?.level || 1} • {user?.points || 0} XP
                  </span>
                  
                  {/* Card B styled dark button with WeBook logo */}
                  <button
                    type="button"
                    onClick={() => triggerShareFeedback("WeBook")}
                    className="w-9 h-9 bg-[#18181b] border border-zinc-800 hover:border-zinc-700 active:scale-95 text-white rounded-full transition-all cursor-pointer flex items-center justify-center"
                  >
                    <img 
                      src={logoKucing} 
                      alt="WeBook Logo" 
                      className="w-5.5 h-5.5 object-contain select-none brightness-110"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                </div>
              </div>

            </div>

            {/* Sharing Channels Layout */}
            <p className="text-xs text-zinc-400 font-semibold mb-4 text-left px-1">
              Share ranking in Wi-Buku Leaderboard ❤️
            </p>

            {shareSuccessMessage && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold px-3 py-2 rounded-xl mb-4 animate-in fade-in slide-in-from-top-1 text-center">
                {shareSuccessMessage}
              </div>
            )}

            <div className="grid grid-cols-4 gap-3.5 mb-2">
              {/* Twitter */}
              <a
                href={getShareUrl('Twitter')}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => triggerShareFeedback("Twitter")}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white group-hover:bg-zinc-800 transition-colors">
                  <Twitter size={16} />
                </div>
                <span className="text-[10px] font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors">Twitter</span>
              </a>

              {/* Facebook */}
              <a
                href={getShareUrl('Facebook')}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => triggerShareFeedback("Facebook")}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white group-hover:bg-zinc-800 transition-colors">
                  <Facebook size={16} />
                </div>
                <span className="text-[10px] font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors">Facebook</span>
              </a>

              {/* WhatsApp */}
              <a
                href={getShareUrl('WhatsApp')}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => triggerShareFeedback("WhatsApp")}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white group-hover:bg-emerald-600 group-hover:border-transparent group-hover:text-white transition-all duration-300">
                  <MessageCircle size={16} />
                </div>
                <span className="text-[10px] font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors">WhatsApp</span>
              </a>

              {/* Copy Link */}
              <button
                type="button"
                onClick={() => {
                  handleCopyLink();
                  triggerShareFeedback("Salin Tautan");
                }}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white group-hover:bg-[#82C341] group-hover:text-black group-hover:border-transparent transition-all">
                  {copied ? <Check size={16} /> : <Link2 size={16} />}
                </div>
                <span className="text-[10px] font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors">
                  {copied ? 'Copied' : 'Copy Link'}
                </span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

