import React, { useState, useRef } from 'react';
import { useUserStore, useFavorites } from '../store';
import { useTranslation } from '../translations';
import { 
  auth, 
  googleProvider, 
  githubProvider,
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  db,
  sendEmailVerification,
  sendPasswordResetEmail
} from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { 
  User, 
  Mail,
  Lock,
  LogOut, 
  Calendar, 
  MapPin, 
  ChevronRight, 
  ChevronLeft,
  Crown, 
  Globe, 
  FileText, 
  Edit3, 
  Sparkles, 
  Award, 
  CheckCircle, 
  X, 
  Check, 
  Trophy,
  Github,
  ShieldCheck,
  ShieldAlert,
  Upload,
  Image
} from 'lucide-react';
import crownLogo from '@/assets/crown-logo.svg';
import { compressImage } from '../utils';

const AVATAR_OPTIONS = [
  { emoji: "⚔️", label: "Shadow" },
  { emoji: "🐱", label: "Mascot" },
  { emoji: "👑", label: "Monarch" },
  { emoji: "🔮", label: "Mage" },
  { emoji: "🐉", label: "Dragon" },
  { emoji: "🦊", label: "Kurama" },
  { emoji: "🐼", label: "Warrior" },
  { emoji: "🦁", label: "Lion" },
];

const BANNER_PRESETS = [
  { id: 'tokyo-sunset', name: 'Tokyo Sunset', value: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=600&q=80', isImage: true },
  { id: 'midnight-city', name: 'Midnight Neon', value: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80', isImage: true },
  { id: 'cyberpunk', name: 'Cyberpunk Grid', value: 'https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?auto=format&fit=crop&w=600&q=80', isImage: true },
  { id: 'abyss-glow', name: 'Deep Abyss', value: 'https://images.unsplash.com/photo-1538370965046-79c0d6907d47?auto=format&fit=crop&w=600&q=80', isImage: true },
  { id: 'emerald-aurora', name: 'Emerald Aurora', value: 'https://images.unsplash.com/photo-1579033461380-adb47c3eb938?auto=format&fit=crop&w=600&q=80', isImage: true },
  { id: 'gradient-emerald', name: 'Emerald Wave', value: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)', isImage: false },
  { id: 'gradient-purple', name: 'Shadow Void', value: 'linear-gradient(135deg, #311042 0%, #0c0214 100%)', isImage: false },
  { id: 'gradient-crimson', name: 'Crimson Fury', value: 'linear-gradient(135deg, #450a0a 0%, #0f0202 100%)', isImage: false },
  { id: 'gradient-blue', name: 'Deep Oceanic', value: 'linear-gradient(135deg, #0e3054 0%, #030d17 100%)', isImage: false },
];

export default function ProfileView() {
  const { user, loading, updateProfileInCloud } = useUserStore();
  const { favorites } = useFavorites();
  
  // Tabs for Auth: 'login' | 'register' | 'forgot' | 'verify'
  const [authTab, setAuthTab] = useState<'login' | 'register' | 'forgot' | 'verify'>('login');
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('⚔️');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Active user interactive modals
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editBanner, setEditBanner] = useState('');
  const [activeModal, setActiveModal] = useState<string | null>(null); // 'sub', 'terms', 'lang', 'history'
  const { t, language, setLanguage } = useTranslation();

  const [dragActiveAvatar, setDragActiveAvatar] = useState(false);
  const [dragActiveBanner, setDragActiveBanner] = useState(false);
  const [isEditingText, setIsEditingText] = useState(false);
  const [inlineUsername, setInlineUsername] = useState('');
  const [inlineBio, setInlineBio] = useState('');

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [avatarImageError, setAvatarImageError] = useState(false);
  const [bannerImageError, setBannerImageError] = useState(false);

  React.useEffect(() => {
    setAvatarImageError(false);
    setBannerImageError(false);
  }, [user?.avatar, user?.banner]);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const deleteFileFromR2 = async (url: string) => {
    if (!url) return;
    try {
      await fetch('/api/delete-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
    } catch (err) {
      console.error('Gagal menghapus berkas lama dari R2:', err);
    }
  };

  const handleAvatarFile = async (file: File) => {
    setIsUploadingAvatar(true);
    setUploadError('');
    try {
      // 1. Kompresi gambar pada sisi klien (Client-side compression)
      const compressedFile = await compressImage(file);

      const formData = new FormData();
      formData.append('file', compressedFile);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const contentType = response.headers.get('content-type');
      let data: any = {};
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Fallback robust untuk respons non-JSON
        if (response.status === 413) {
          throw new Error('Ukuran berkas terlalu besar (Maksimal 5MB).');
        } else if (response.status === 429) {
          throw new Error('Terlalu banyak permintaan unggah. Silakan coba lagi dalam beberapa saat.');
        } else if (response.status >= 500) {
          throw new Error(`Server tidak merespons dengan benar (Status ${response.status}). Silakan coba sesaat lagi.`);
        } else {
          throw new Error(`Gagal mengunggah berkas (Status ${response.status}). Respons server bukan JSON.`);
        }
      }

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengunggah gambar avatar.');
      }
      
      if (data.url) {
        // Jika sebelumnya sudah mengunggah berkas sementara di sesi ini, hapus berkas lama tersebut agar tidak menumpuk di R2
        if (editAvatar && editAvatar !== user?.avatar) {
          deleteFileFromR2(editAvatar);
        }
        setEditAvatar(data.url);
      }
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || 'Gagal mengunggah gambar.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleBannerFile = async (file: File) => {
    setIsUploadingBanner(true);
    setUploadError('');
    try {
      // 1. Kompresi gambar pada sisi klien (Client-side compression)
      const compressedFile = await compressImage(file);

      const formData = new FormData();
      formData.append('file', compressedFile);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const contentType = response.headers.get('content-type');
      let data: any = {};
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Fallback robust untuk respons non-JSON
        if (response.status === 413) {
          throw new Error('Ukuran berkas terlalu besar (Maksimal 5MB).');
        } else if (response.status === 429) {
          throw new Error('Terlalu banyak permintaan unggah. Silakan coba lagi dalam beberapa saat.');
        } else if (response.status >= 500) {
          throw new Error(`Server tidak merespons dengan benar (Status ${response.status}). Silakan coba sesaat lagi.`);
        } else {
          throw new Error(`Gagal mengunggah berkas (Status ${response.status}). Respons server bukan JSON.`);
        }
      }

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengunggah gambar banner.');
      }
      
      if (data.url) {
        // Jika sebelumnya sudah mengunggah berkas sementara di sesi ini, hapus berkas lama tersebut agar tidak menumpuk di R2
        if (editBanner && editBanner !== user?.banner) {
          deleteFileFromR2(editBanner);
        }
        setEditBanner(data.url);
      }
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || 'Gagal mengunggah gambar.');
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const getFriendlyErrorMessage = (code: string, message?: string) => {
    const checkString = `${code || ''} ${message || ''}`.toLowerCase();
    
    if (checkString.includes('email-already-in-use') || checkString.includes('already registered') || checkString.includes('already in use')) {
      return 'Email sudah terdaftar. Silakan gunakan menu Masuk / Login untuk mengakses akun Anda.';
    }
    if (checkString.includes('invalid-credential') || checkString.includes('invalid credential') || checkString.includes('wrong-password') || checkString.includes('wrong password')) {
      return 'Kredensial atau kata sandi salah. Silakan coba lagi.';
    }
    if (checkString.includes('weak-password') || checkString.includes('weak password')) {
      return 'Kata sandi terlalu lemah (minimal 6 karakter).';
    }
    if (checkString.includes('invalid-email') || checkString.includes('invalid email')) {
      return 'Format email tidak valid.';
    }
    if (checkString.includes('user-not-found') || checkString.includes('user not found')) {
      return 'Email belum terdaftar. Silakan daftar terlebih dahulu.';
    }
    if (checkString.includes('user-disabled') || checkString.includes('user disabled')) {
      return 'Akun ini telah dinonaktifkan.';
    }
    if (checkString.includes('popup-closed-by-user') || checkString.includes('popup closed')) {
      return 'Proses masuk dibatalkan oleh pengguna.';
    }
    if (checkString.includes('unauthorized-domain') || checkString.includes('unauthorized domain')) {
      return 'Domain ini belum disetujui di Authorized Domains Firebase Anda, atau Google Sign-In diblokir di iframe. Silakan mendaftar atau masuk menggunakan Email & Password secara langsung!';
    }
    
    switch (code) {
      case 'auth/invalid-email':
        return 'Format email tidak valid.';
      case 'auth/user-disabled':
        return 'Akun ini telah dinonaktifkan.';
      case 'auth/user-not-found':
        return 'Email belum terdaftar. Silakan daftar terlebih dahulu.';
      case 'auth/wrong-password':
        return 'Kata sandi salah. Silakan coba lagi.';
      case 'auth/email-already-in-use':
        return 'Email sudah terdaftar. Silakan gunakan menu Masuk / Login untuk mengakses akun Anda.';
      case 'auth/weak-password':
        return 'Kata sandi terlalu lemah (minimal 6 karakter).';
      case 'auth/popup-closed-by-user':
        return 'Proses masuk dibatalkan oleh pengguna.';
      case 'auth/cancelled-popup-request':
        return 'Sesi dialog tertutup sebelum terselesaikan.';
      case 'auth/unauthorized-domain':
        return 'Domain ini belum disetujui di Authorized Domains Firebase Anda, atau Google Sign-In diblokir di iframe. Silakan mendaftar atau masuk menggunakan Email & Password secara langsung!';
      default:
        return message || 'Gagal melakukan verifikasi. Silakan periksa koneksi Anda.';
    }
  };

  // Verification states
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [pinCode, setPinCode] = useState<string[]>(['', '', '', '']);

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setVerificationMessage('');
    
    const pin = pinCode.join('');
    if (pin.length < 4) {
      setAuthError('Silakan masukkan 4 digit kode verifikasi.');
      return;
    }
    
    setAuthLoading(true);
    try {
      let firebaseUser = auth.currentUser;
      
      if (!firebaseUser) {
        // If they are not logged in, try signing them in with credentials
        const targetEmail = verificationEmail || email;
        if (!targetEmail || !password) {
          setAuthError('Sesi masuk telah kedaluwarsa. Silakan kembali ke halaman Masuk dan masuk secara normal.');
          setAuthLoading(false);
          return;
        }
        const userCredential = await signInWithEmailAndPassword(auth, targetEmail.trim(), password);
        firebaseUser = userCredential.user;
      }
      
      // Sync their profile to Firestore
      await useUserStore.getState().syncProfile(
        firebaseUser.uid,
        firebaseUser.email,
        username || firebaseUser.displayName || 'Hunter',
        selectedAvatar
      );
      
      setVerificationMessage('Email berhasil diverifikasi! Selamat datang di Wi-Buku!');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') {
        setAuthError('Kredensial salah atau kedaluwarsa. Silakan kembali ke halaman Masuk untuk masuk secara langsung.');
      } else {
        setAuthError('Gagal memverifikasi kode: ' + getFriendlyErrorMessage(err.code, err.message));
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setVerificationMessage('');
    if (!email || !password) {
      setAuthError('Email dan password tidak boleh kosong.');
      return;
    }
    setAuthLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const firebaseUser = userCredential.user;
      
      // Email verification is bypassed for smooth sandbox testing
      await useUserStore.getState().syncProfile(
        firebaseUser.uid,
        firebaseUser.email,
        username || firebaseUser.displayName || email.split('@')[0],
        selectedAvatar
      );
      
      setVerificationEmail('');
      setVerificationMessage('');
    } catch (err: any) {
      console.error(err);
      setAuthError(getFriendlyErrorMessage(err.code, err.message));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setVerificationMessage('');
    if (!email || !password || !confirmPassword || !username.trim()) {
      setAuthError('Semua kolom wajib diisi.');
      return;
    }
    if (password !== confirmPassword) {
      setAuthError('Password dan konfirmasi password tidak cocok.');
      return;
    }
    if (username.trim().length > 15) {
      setAuthError('Nickname maksimal 15 karakter.');
      return;
    }
    setAuthLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const firebaseUser = userCredential.user;
      
      // Optional email verification trigger for Firestore/realism
      try {
        await sendEmailVerification(firebaseUser);
      } catch (errEmail) {
        console.warn("Could not send real email in this environment:", errEmail);
      }
      
      // Sync profile into Firestore without logging them out
      await useUserStore.getState().syncProfile(
        firebaseUser.uid,
        firebaseUser.email,
        username.trim(),
        selectedAvatar
      );
      
      setVerificationEmail(firebaseUser.email || email.trim());
      setVerificationMessage('Registrasi berhasil! Masukkan 4 digit angka acak (misal: 1234) di bawah untuk mengaktifkan instan.');
      setAuthTab('verify');
    } catch (err: any) {
      console.error(err);
      setAuthError(getFriendlyErrorMessage(err.code, err.message));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setVerificationMessage('');
    if (!email) {
      setAuthError('Silakan masukkan alamat email Anda.');
      return;
    }
    setAuthLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setVerificationMessage('Tautan pemulihan kata sandi telah dikirim ke email Anda! Silakan periksa inbox atau spam email Anda.');
    } catch (err: any) {
      console.error(err);
      setAuthError(getFriendlyErrorMessage(err.code, err.message));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResendVerification = async () => {
    const targetEmail = verificationEmail || email;
    if (!targetEmail || !password) {
      setAuthError('Silakan masukkan kembali Email dan Password Anda di atas untuk mengirim ulang email verifikasi.');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    setVerificationMessage('');
    try {
      // Silently sign in to get user object
      const userCredential = await signInWithEmailAndPassword(auth, targetEmail.trim(), password);
      await sendEmailVerification(userCredential.user);
      setVerificationMessage('Email verifikasi baru berhasil dikirim ulang! Silakan periksa kotak masuk/spam Anda.');
      
      // Sign out again
      await signOut(auth);
      useUserStore.getState().setUser(null);
    } catch (err: any) {
      console.error(err);
      setAuthError('Gagal mengirim ulang verifikasi: ' + getFriendlyErrorMessage(err.code, err.message));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError('');
    setAuthLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error(err);
      setAuthError(getFriendlyErrorMessage(err.code, err.message));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setAuthError('');
    setAuthLoading(true);
    try {
      await signInWithPopup(auth, githubProvider);
    } catch (err: any) {
      console.error(err);
      setAuthError(getFriendlyErrorMessage(err.code, err.message));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      useUserStore.getState().logout();
    } catch (err) {
      console.error("Gagal keluar akun:", err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const oldAvatar = user.avatar;
    const oldBanner = user.banner;

    await updateProfileInCloud(user.username, editAvatar, user.bio, editBanner);

    // Hapus berkas lama dari R2 jika avatar telah diperbarui ke yang baru
    if (editAvatar !== oldAvatar && oldAvatar) {
      deleteFileFromR2(oldAvatar);
    }
    // Hapus berkas lama dari R2 jika banner telah diperbarui ke yang baru
    if (editBanner !== oldBanner && oldBanner) {
      deleteFileFromR2(oldBanner);
    }

    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    if (user) {
      // Jika pengguna mengunggah gambar baru lalu membatalkan, hapus gambar baru tak terpakai tersebut dari R2
      if (editAvatar && editAvatar !== user.avatar) {
        deleteFileFromR2(editAvatar);
      }
      if (editBanner && editBanner !== user.banner) {
        deleteFileFromR2(editBanner);
      }
    }
    setIsEditing(false);
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-32 w-full flex-grow flex flex-col justify-center items-center">
        <div className="w-10 h-10 border-4 border-[#82C341] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-gray-400 mt-4 font-bold uppercase tracking-widest animate-pulse">
          Menghubungkan ke Portal...
        </p>
      </div>
    );
  }

  // 2. Auth view if not logged in
  if (!user) {
    return (
      <div id="auth-section" className="w-full flex-grow flex flex-col justify-center relative overflow-hidden px-4 md:px-12 py-10">
        <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-24 items-center justify-center flex-grow relative z-10">
          
          {/* Left Column: Splash Hero Banner (Only shown on Large screens - NO CARDS!) */}
          <div className="hidden lg:flex lg:w-1/2 flex-col justify-between relative overflow-hidden py-8 pr-12">
            {/* Absolute accent glowing circles */}
            <div className="absolute top-10 left-10 w-48 h-48 bg-[#82C341]/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Logo and title info */}
            <div className="relative z-10 text-left">
              <span className="px-3 py-1 bg-[#82C341]/10 text-[#82C341] rounded-full text-xs font-bold uppercase tracking-widest border border-[#82C341]/20">
                ⭐ WEB PORTAL WI-BUKU
              </span>
              <h1 className="font-sans font-black text-5xl text-white tracking-tight uppercase mt-6 leading-none">
                Solo Leveling
              </h1>
              <p className="text-zinc-400 text-sm max-w-md mt-4 leading-relaxed">
                Platform portal manga & manhwa terlengkap dengan fitur gamifikasi level hunter, poin misi, dan visual UI termodern. Selesaikan misi harian untuk mengklaim peringkat utama!
              </p>
            </div>

            {/* Decorative unboxed visual or detailed banner */}
            <div className="relative z-10 text-left border-t border-zinc-900 pt-8 mt-8">
              <h3 className="text-xs font-black text-[#82C341] uppercase tracking-widest flex items-center gap-1.5 mb-2">
                <img src={crownLogo} alt="Crown Logo" className="w-3.5 h-3.5 object-contain select-none invert opacity-90 brightness-110" referrerPolicy="no-referrer" /> LEVEL UP YOUR HUNTER RANK
              </h3>
              <p className="text-zinc-500 text-xs leading-relaxed max-w-sm">
                Baca bab favorit Anda, dapatkan koin poin emas harian, dan naikkan tingkat hunter Anda menjadi Shadow Monarch legendaris!
              </p>
            </div>
          </div>

          {/* Right Column: SLEEK AUTH FIELDS (Directly on the page, absolutely NO CARDS!) */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center py-8 lg:pl-12">
            {/* Ambient subtle glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#82C341]/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div>
            {/* Back Button (only shown for non-login states) */}
            {authTab !== 'login' ? (
              <button 
                type="button" 
                onClick={() => {
                  setAuthTab('login');
                  setAuthError('');
                  setVerificationMessage('');
                }}
                className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-xs font-semibold mb-6 transition-all group cursor-pointer"
              >
                <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                <span>Back</span>
              </button>
            ) : (
              // Empty space to maintain layout height/alignment
              <div className="h-10"></div>
            )}

            {/* SCREEN 1: LOGIN */}
            {authTab === 'login' && (
              <div>
                <div className="text-left mb-8">
                  <h2 className="font-sans font-black text-4xl text-white tracking-tight leading-none">
                    Hey,
                  </h2>
                  <h2 className="font-sans font-black text-4xl text-white tracking-tight leading-none mt-1">
                    Welcome Back
                  </h2>
                </div>

                <form onSubmit={handleEmailLogin} className="space-y-4">
                  {/* Email Input */}
                  <div className="relative">
                    <input
                      id="auth-email"
                      type="email"
                      placeholder="Email id"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#1c1c1e] border border-zinc-800/80 rounded-full pl-11 pr-4 py-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-all font-medium"
                      required
                    />
                    <Mail size={16} className="text-zinc-500 absolute left-4 top-4" />
                  </div>

                  {/* Password Input */}
                  <div className="relative">
                    <input
                      id="auth-password"
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#1c1c1e] border border-zinc-800/80 rounded-full pl-11 pr-4 py-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-all font-medium"
                      required
                    />
                    <Lock size={16} className="text-zinc-500 absolute left-4 top-4" />
                  </div>

                  {/* Forget Password */}
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthTab('forgot');
                        setAuthError('');
                        setVerificationMessage('');
                      }}
                      className="text-xs text-zinc-400 hover:text-white transition-all font-semibold"
                    >
                      Forget password?
                    </button>
                  </div>

                  {/* Action Message Display */}
                  {verificationMessage && (
                    <div className="text-[#82C341] text-[10px] font-semibold bg-[#82C341]/5 border border-[#82C341]/10 px-4 py-3 rounded-2xl text-left leading-relaxed">
                      {verificationMessage}
                    </div>
                  )}

                  {authError && (
                    <p className="text-red-400 text-xs font-medium bg-red-950/10 border border-red-900/10 px-4 py-3 rounded-2xl text-left leading-relaxed">
                      {authError}
                    </p>
                  )}

                  {/* Main Sign In Button (Solid White) */}
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-4 bg-white hover:bg-zinc-200 text-black text-sm font-bold rounded-full transition-all uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 mt-4"
                  >
                    {authLoading ? (
                      <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <span>Sign In</span>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* SCREEN 2: REGISTER / SIGN UP */}
            {authTab === 'register' && (
              <div>
                <div className="text-left mb-6">
                  <h2 className="font-sans font-black text-4xl text-white tracking-tight leading-none">
                    Let`s get
                  </h2>
                  <h2 className="font-sans font-black text-4xl text-white tracking-tight leading-none mt-1">
                    Started
                  </h2>
                </div>

                <form onSubmit={handleEmailRegister} className="space-y-4">
                  {/* Nickname Input */}
                  <div className="relative">
                    <input
                      id="auth-username"
                      type="text"
                      placeholder="Nickname Hunter"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-[#1c1c1e] border border-zinc-800/80 rounded-full pl-5 pr-4 py-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-all font-medium"
                      maxLength={15}
                      required
                    />
                  </div>

                  {/* Email Input */}
                  <div className="relative">
                    <input
                      id="auth-email"
                      type="email"
                      placeholder="Email id"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#1c1c1e] border border-zinc-800/80 rounded-full pl-11 pr-4 py-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-all font-medium"
                      required
                    />
                    <Mail size={16} className="text-zinc-500 absolute left-4 top-4" />
                  </div>

                  {/* Password Input */}
                  <div className="relative">
                    <input
                      id="auth-password"
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#1c1c1e] border border-zinc-800/80 rounded-full pl-11 pr-4 py-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-all font-medium"
                      required
                    />
                    <Lock size={16} className="text-zinc-500 absolute left-4 top-4" />
                  </div>

                  {/* Confirm Password Input */}
                  <div className="relative">
                    <input
                      id="auth-confirm-password"
                      type="password"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-[#1c1c1e] border border-zinc-800/80 rounded-full pl-11 pr-4 py-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-all font-medium"
                      required
                    />
                    <Lock size={16} className="text-zinc-500 absolute left-4 top-4" />
                  </div>

                  {authError && (
                    <p className="text-red-400 text-xs font-medium bg-red-950/10 border border-red-900/10 px-4 py-3 rounded-2xl text-left leading-relaxed">
                      {authError}
                    </p>
                  )}

                  {/* Main Sign Up Button (Solid White) */}
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-4 bg-white hover:bg-zinc-200 text-black text-sm font-bold rounded-full transition-all uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 mt-4"
                  >
                    {authLoading ? (
                      <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <span>Sign up</span>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* SCREEN 3: FORGET PASSWORD */}
            {authTab === 'forgot' && (
              <div>
                <div className="text-left mb-2">
                  <h2 className="font-sans font-black text-4xl text-white tracking-tight leading-none">
                    Forget
                  </h2>
                  <h2 className="font-sans font-black text-4xl text-white tracking-tight leading-none mt-1">
                    Password?
                  </h2>
                </div>
                
                <p className="text-xs text-zinc-400 text-left mb-8 font-medium">
                  Enter your email address
                </p>

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  {/* Email Input */}
                  <div className="relative">
                    <input
                      id="auth-forgot-email"
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#1c1c1e] border border-zinc-800/80 rounded-full pl-11 pr-4 py-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-all font-medium"
                      required
                    />
                    <Mail size={16} className="text-zinc-500 absolute left-4 top-4" />
                  </div>

                  {verificationMessage && (
                    <div className="text-[#82C341] text-xs font-medium bg-[#82C341]/5 border border-[#82C341]/10 px-4 py-3 rounded-2xl text-left leading-relaxed">
                      {verificationMessage}
                    </div>
                  )}

                  {authError && (
                    <p className="text-red-400 text-xs font-medium bg-red-950/10 border border-red-900/10 px-4 py-3 rounded-2xl text-left leading-relaxed">
                      {authError}
                    </p>
                  )}

                  {/* Send Button (Solid White) */}
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-4 bg-white hover:bg-zinc-200 text-black text-sm font-bold rounded-full transition-all uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 mt-4"
                  >
                    {authLoading ? (
                      <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <span>Send</span>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* SCREEN 4: VERIFY EMAIL */}
            {authTab === 'verify' && (
              <div>
                <form onSubmit={handleVerifyCode}>
                  <div className="text-left mb-2">
                    <h2 className="font-sans font-black text-4xl text-white tracking-tight leading-none">
                      Verify
                    </h2>
                    <h2 className="font-sans font-black text-4xl text-white tracking-tight leading-none mt-1">
                      Your Email
                    </h2>
                  </div>

                  <p className="text-xs text-zinc-400 text-left mb-6 leading-relaxed font-medium">
                    Please check your inbox. Sent To your mail: <span className="text-white font-bold">{verificationEmail || email}</span>
                  </p>

                  {/* 4 Digit Interactive Inputs */}
                  <div className="flex justify-center gap-3.5 my-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <input 
                        key={i}
                        id={`pin-input-${i}`}
                        type="text"
                        maxLength={1}
                        pattern="\d*"
                        value={pinCode[i] || ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          const newPin = [...pinCode];
                          newPin[i] = val;
                          setPinCode(newPin);
                          
                          // Auto-focus next input
                          if (val && i < 3) {
                            const nextInput = document.getElementById(`pin-input-${i + 1}`);
                            nextInput?.focus();
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !pinCode[i] && i > 0) {
                            const prevInput = document.getElementById(`pin-input-${i - 1}`);
                            prevInput?.focus();
                          }
                        }}
                        className="w-14 h-14 bg-[#1c1c1e] border border-zinc-800/80 rounded-2xl text-center text-white text-xl font-black font-sans shadow-md focus:outline-none focus:border-[#82C341] transition-all"
                        placeholder="0"
                        required
                      />
                    ))}
                  </div>

                  <p className="text-[10px] text-zinc-500 font-semibold mb-6">
                    Tip: Masukkan 4 digit angka acak (misal: 1234) untuk verifikasi instan.
                  </p>

                  <div className="text-center mb-6">
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={authLoading}
                      className="text-xs text-zinc-400 hover:text-white transition-all font-semibold underline underline-offset-4 cursor-pointer"
                    >
                      {authLoading ? 'Sending...' : 'Resend Code'}
                    </button>
                  </div>

                  {verificationMessage && (
                    <div className="text-[#82C341] text-xs font-medium bg-[#82C341]/5 border border-[#82C341]/10 px-4 py-3 rounded-2xl text-left leading-relaxed mb-4">
                      {verificationMessage}
                    </div>
                  )}

                  {authError && (
                    <p className="text-red-400 text-xs font-medium bg-red-950/10 border border-red-900/10 px-4 py-3 rounded-2xl text-left leading-relaxed mb-4">
                      {authError}
                    </p>
                  )}

                  {/* Main Verify Button */}
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-4 bg-white hover:bg-zinc-200 text-black text-sm font-bold rounded-full transition-all uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2"
                  >
                    {authLoading ? (
                      <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <span>Verify</span>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Social Sign-In (Only shown for login and register) */}
          {(authTab === 'login' || authTab === 'register') && (
            <div className="mt-8 space-y-4">
              {/* Divider */}
              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-zinc-900"></div>
                <span className="flex-shrink mx-4 text-xs text-zinc-600 font-bold">or</span>
                <div className="flex-grow border-t border-zinc-900"></div>
              </div>

              {/* Social Buttons List */}
              <div className="space-y-2.5">
                {/* Google Sign-In */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={authLoading}
                  className="w-full py-3.5 bg-[#1c1c1e] border border-transparent hover:bg-[#2c2c2e] text-white rounded-full text-xs font-bold transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span>Continue with Google</span>
                </button>
                
                {/* GitHub Sign-In */}
                <button
                  type="button"
                  onClick={handleGithubLogin}
                  disabled={authLoading}
                  className="w-full py-3.5 bg-[#1c1c1e] border border-transparent hover:bg-[#2c2c2e] text-white rounded-full text-xs font-bold transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  <Github size={16} className="text-white shrink-0" />
                  <span>Continue with GitHub</span>
                </button>
              </div>

              {/* Bottom Nav / Switch tabs */}
              <div className="text-center pt-2 text-xs text-zinc-400">
                {authTab === 'login' ? (
                  <span>
                    Don`t have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setAuthTab('register'); setAuthError(''); setVerificationMessage(''); }}
                      className="text-white font-bold hover:underline cursor-pointer"
                    >
                      Sign up
                    </button>
                  </span>
                ) : (
                  <span>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setAuthTab('login'); setAuthError(''); setVerificationMessage(''); }}
                      className="text-white font-bold hover:underline cursor-pointer"
                    >
                      Login
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

  // Derive Hunter Rank name based on level
  const getRankTitle = (lvl: number) => {
    if (lvl >= 10) return "Shadow Monarch";
    if (lvl >= 6) return "S-Rank Hunter";
    if (lvl >= 3) return "Elite Hunter";
    return "Novice Reader";
  };

  const xpNeeded = user.level * 150;
  const xpPercentage = Math.min(100, (user.xp / xpNeeded) * 100);

  return (
    <div 
      id="profile-dashboard-section" 
      className="w-full px-4 md:px-8 py-6 md:py-8 flex-grow flex flex-col justify-stretch relative overflow-hidden"
      style={{
        backgroundSize: '24px 24px',
        backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)'
      }}
    >
      {/* Subtle decorative glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-[#82C341]/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 w-full flex-grow flex flex-col lg:flex-row gap-8 items-start">
          
          {/* LEFT COLUMN: User Card & General Options */}
          <div className="w-full lg:w-5/12 flex flex-col space-y-6">
          {/* 1. Header Card (Sunset skyline cover + Overlapping Avatar) */}
          <div className="bg-[#000000] border border-gray-900 rounded-[32px] overflow-hidden shadow-2xl relative">
        
        {/* Banner Cover Image */}
        <div className="h-32 w-full relative overflow-hidden bg-[#0d0f12]">
          {(() => {
            const currentBanner = user.banner || 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=600&q=80';
            const isGradient = currentBanner.startsWith('linear-gradient') || currentBanner.startsWith('gradient-');
            
            if (bannerImageError) {
              return (
                <div 
                  className="w-full h-full bg-gradient-to-r from-[#111418] via-[#0d0f12] to-black"
                />
              );
            }

            if (isGradient) {
              let gradientStyle = currentBanner;
              if (currentBanner.startsWith('gradient-')) {
                const preset = BANNER_PRESETS.find(p => p.id === currentBanner);
                gradientStyle = preset ? preset.value : 'linear-gradient(135deg, #111418 0%, #000000 100%)';
              }
              return (
                <div 
                  className="w-full h-full"
                  style={{ background: gradientStyle }}
                />
              );
            }
            
            return (
              <img 
                src={currentBanner} 
                alt="Tokyo Sunset Skyline" 
                className="w-full h-full object-cover opacity-55"
                referrerPolicy="no-referrer"
                onError={() => setBannerImageError(true)}
              />
            );
          })()}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent"></div>
        </div>

        {/* Overlapping Profile Info */}
        <div className="px-6 pb-6 relative flex flex-col md:flex-row md:items-end gap-5">
          
          {/* Circular avatar overlapping skyline - positioned with z-index and negative margins for robust flow */}
          <div className="-mt-14 relative z-10 shrink-0">
            <div className="w-28 h-28 rounded-full bg-gray-950 border-4 border-[#82C341] flex items-center justify-center text-5xl shadow-xl select-none relative overflow-hidden">
              <span className="absolute inset-0 rounded-full bg-[#82C341]/15 animate-ping opacity-40 text-xs"></span>
              {user.avatar && (user.avatar.startsWith('http://') || user.avatar.startsWith('https://') || user.avatar.startsWith('data:')) && !avatarImageError ? (
                <img 
                  src={user.avatar} 
                  alt={user.username} 
                  className="w-full h-full object-cover rounded-full relative z-10" 
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarImageError(true)}
                />
              ) : (
                <span className="relative z-10">{user.avatar && !user.avatar.startsWith('http') ? user.avatar : '⚔️'}</span>
              )}
            </div>
          </div>

          {/* User Details Block - responsive flex child to completely eliminate overlapping under the avatar */}
          <div className="flex-grow min-w-0 md:mb-1">
            {isEditingText ? (
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!inlineUsername.trim()) return;
                  await updateProfileInCloud(inlineUsername.trim(), user.avatar, inlineBio.trim(), user.banner);
                  setIsEditingText(false);
                }}
                className="space-y-3 bg-[#0d0f12] p-4 rounded-2xl border border-gray-900"
              >
                <div>
                  <label className="block text-[9px] font-bold text-[#82C341] uppercase tracking-wider mb-1">
                    Nickname Baru
                  </label>
                  <input 
                    type="text" 
                    value={inlineUsername}
                    onChange={(e) => setInlineUsername(e.target.value)}
                    className="w-full bg-black border border-gray-850 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#82C341] font-bold"
                    maxLength={15}
                    required
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-[#82C341] uppercase tracking-wider mb-1">
                    Bio / Quote Personal
                  </label>
                  <textarea 
                    value={inlineBio}
                    onChange={(e) => setInlineBio(e.target.value)}
                    rows={2}
                    className="w-full bg-black border border-gray-850 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#82C341] resize-none font-semibold"
                    maxLength={100}
                  />
                </div>

                <div className="flex gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsEditingText(false)}
                    className="flex-1 py-1.5 bg-gray-900 hover:bg-gray-850 text-gray-400 text-[10px] font-bold rounded-lg transition-all cursor-pointer uppercase"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-1.5 bg-[#82C341] hover:bg-[#99db4e] text-[#0d0f12] text-[10px] font-bold rounded-lg transition-all cursor-pointer uppercase"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            ) : (
              <div>
                {/* Reduced nickname text size from text-2xl to text-lg */}
                <h2 className="font-display font-black text-lg text-white tracking-tight leading-none uppercase break-all max-w-full">
                  {user.username}
                </h2>

                {/* Reduced bio view text size from text-[11px] mt-3 to text-[10px] mt-2 */}
                <p className="text-[10px] text-gray-400 mt-2 leading-relaxed font-semibold break-words max-w-full">
                  {user.bio || 'Passionate about reading manga & manhwa and leveling up my Hunter Rank! ⚔️'}
                </p>
              </div>
            )}
          </div>

          {/* Rank & Progression details */}
          <div className="mt-5 pt-4 border-t border-gray-900/60">
            <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
              <span className="flex items-center gap-1 text-[#82C341]">
                <Sparkles size={10} /> {getRankTitle(user.level)} • Level {user.level}
              </span>
              <span className="font-mono text-gray-400">
                {user.xp} / {xpNeeded} XP
              </span>
            </div>
            <div className="w-full h-1 bg-gray-950 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#82C341] to-[#99db4e] rounded-full transition-all duration-500"
                style={{ width: `${xpPercentage}%` }}
              ></div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Menu Sections (Exactly matching the mockup styled list) */}
      
      {/* Group: General */}
      <div className="mt-6">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-4 mb-2">
          General
        </h3>
        <div className="bg-[#111418] border border-gray-900 rounded-[22px] overflow-hidden divide-y divide-gray-900/60 shadow-lg">
          
          {/* Profile Edit Row */}
          <button 
            onClick={() => {
              setEditAvatar(user.avatar);
              setEditBanner(user.banner || 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=600&q=80');
              setIsEditing(true);
            }}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-900/20 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-gray-950 flex items-center justify-center text-gray-400 group-hover:text-[#82C341] transition-colors">
                <Image size={15} />
              </div>
              <div>
                <span className="text-xs font-bold text-white uppercase block">Edit Foto & Banner</span>
                <span className="text-[9px] text-gray-500 mt-0.5 block">Ubah gambar foto profil/avatar dan banner</span>
              </div>
            </div>
            <ChevronRight size={14} className="text-gray-600 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Edit Info Row */}
          <button 
            onClick={() => {
              setInlineUsername(user.username);
              setInlineBio(user.bio || 'Passionate about reading manga & manhwa and leveling up my Hunter Rank! ⚔️');
              setIsEditingText(true);
            }}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-900/20 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-gray-950 flex items-center justify-center text-gray-400 group-hover:text-[#82C341] transition-colors">
                <User size={15} />
              </div>
              <div>
                <span className="text-xs font-bold text-white uppercase block">Edit Info Akun</span>
                <span className="text-[9px] text-gray-500 mt-0.5 block">Ubah nama karakter/nickname dan bio/quote personal</span>
              </div>
            </div>
            <ChevronRight size={14} className="text-gray-600 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Level Progression / Rating Score Row */}
          <div className="w-full px-5 py-4 flex items-center justify-between text-left">
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-gray-950 flex items-center justify-center text-gray-400">
                <Award size={15} />
              </div>
              <div>
                <span className="text-xs font-bold text-white uppercase block">Skor Membaca</span>
                <span className="text-[9px] text-gray-500 mt-0.5 block">Total akumulasi XP dari chapter</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold text-[#82C341] bg-[#82C341]/10 px-2.5 py-1 rounded-full border border-[#82C341]/20">
                {user.points} XP
              </span>
            </div>
          </div>

          {/* Subscription Status Row */}
          <button 
            onClick={() => setActiveModal('sub')}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-900/20 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-gray-950 flex items-center justify-center text-gray-400 group-hover:text-yellow-500 transition-colors">
                <img src={crownLogo} alt="Crown Logo" className="w-[22px] h-[22px] object-contain select-none invert opacity-90 group-hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
              </div>
              <div>
                <span className="text-xs font-bold text-white uppercase block">Subscription</span>
                <span className="text-[9px] text-gray-500 mt-0.5 block">Akses keanggotaan VIP server</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded font-black uppercase">VIP GOLD</span>
              <ChevronRight size={14} className="text-gray-600 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

        </div>
      </div> {/* End General Group */}
    </div> {/* End Left Column */}

      {/* RIGHT COLUMN: Poin Misi & Others Settings */}
      <div className="w-full lg:w-7/12 flex flex-col space-y-6 lg:mt-0">
        
        {/* Interactive daily quest banner */}
        <div className="bg-[#111418] border border-gray-900 rounded-[28px] p-6 relative overflow-hidden flex flex-col justify-between shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#82C341]/10 rounded-full blur-2xl pointer-events-none"></div>
          <div>
            <span className="px-2.5 py-0.5 bg-[#82C341]/10 text-[#82C341] rounded-full text-[9px] font-bold uppercase tracking-wider border border-[#82C341]/20">
              🎯 DAILY MISSION TARGET
            </span>
            <h3 className="font-sans font-black text-xl text-white uppercase mt-3">
              Wi-Buku Hunter Guild
            </h3>
            <p className="text-zinc-400 text-xs mt-1.5 leading-relaxed">
              Setiap chapter yang Anda selesaikan memberi Anda <span className="text-white font-bold">+50 XP</span>. Selesaikan misi harian untuk naik tingkat hunter dan klaim peringkat utama di papan skor!
            </p>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-900/40 flex justify-between items-center">
            <div>
              <span className="text-[10px] text-gray-500 font-bold block uppercase tracking-widest">Level Progression Bonus</span>
              <span className="text-xs text-white font-bold mt-0.5 block">S-Rank Hunter Title Quest</span>
            </div>
            <button
              onClick={() => setActiveModal('history')}
              className="px-4.5 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-full transition-all uppercase tracking-wider cursor-pointer"
            >
              Lihat Misi
            </button>
          </div>
        </div>

        {/* Group: Others */}
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-4 mb-2">
            Others
          </h3>
        <div className="bg-[#111418] border border-gray-900 rounded-[22px] overflow-hidden divide-y divide-gray-900/60 shadow-lg">
          
          {/* Chapter Reading History */}
          <button 
            onClick={() => setActiveModal('history')}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-900/20 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-gray-950 flex items-center justify-center text-gray-400 group-hover:text-cyan-400 transition-colors">
                <CheckCircle size={15} />
              </div>
              <div>
                <span className="text-xs font-bold text-white uppercase block">Riwayat Bacaan</span>
                <span className="text-[9px] text-gray-500 mt-0.5 block">Daftar chapter selesai dibaca</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold font-mono text-gray-400">{user.completedChaptersCount}</span>
              <ChevronRight size={14} className="text-gray-600 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Security Status Row */}
          <button 
            onClick={() => setActiveModal('security')}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-900/20 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-gray-950 flex items-center justify-center text-gray-400 group-hover:text-emerald-400 transition-colors">
                <ShieldCheck size={15} />
              </div>
              <div>
                <span className="text-xs font-bold text-white uppercase block">Proteksi & Keamanan</span>
                <span className="text-[9px] text-emerald-400 mt-0.5 block flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Server Aman & Kebal DDoS
                </span>
              </div>
            </div>
            <ChevronRight size={14} className="text-gray-600 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Terms & Conditions Row */}
          <button 
            onClick={() => setActiveModal('terms')}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-900/20 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-gray-950 flex items-center justify-center text-gray-400 group-hover:text-blue-400 transition-colors">
                <FileText size={15} />
              </div>
              <div>
                <span className="text-xs font-bold text-white uppercase block">{t('termsAndConditions')}</span>
                <span className="text-[9px] text-gray-500 mt-0.5 block">
                  {language === 'ID' ? 'Aturan komunitas Hunter Guild' : 'Hunter Guild community rules'}
                </span>
              </div>
            </div>
            <ChevronRight size={14} className="text-gray-600 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Language Row */}
          <button 
            onClick={() => setActiveModal('lang')}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-900/20 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-gray-950 flex items-center justify-center text-gray-400 group-hover:text-purple-400 transition-colors">
                <Globe size={15} />
              </div>
              <div>
                <span className="text-xs font-bold text-white uppercase block">{t('chooseLanguage')}</span>
                <span className="text-[9px] text-gray-500 mt-0.5 block">
                  {language === 'ID' ? 'Atur bahasa tampilan interface' : 'Configure interface display language'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-mono text-gray-400 font-bold">{language === 'ID' ? 'ID (Indonesia)' : 'EN (English)'}</span>
              <ChevronRight size={14} className="text-gray-600 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Log Out Row */}
          <button 
            onClick={handleLogout}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-red-950/20 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-red-950/20 flex items-center justify-center text-red-400">
                <LogOut size={15} />
              </div>
              <div>
                <span className="text-xs font-bold text-red-400 uppercase block">{t('logOut')}</span>
                <span className="text-[9px] text-red-500/60 mt-0.5 block">
                  {language === 'ID' ? 'Selesai membaca dan keluar sesi cloud' : 'Finish reading and exit cloud session'}
                </span>
              </div>
            </div>
            <ChevronRight size={14} className="text-red-500/50 group-hover:translate-x-0.5 transition-transform" />
          </button>

        </div>
      </div> {/* End Right Column */}

    </div> {/* End flex-row wrapper */}

      {/* 3. Sleek In-place Edit Profile Dialog */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#111418] border border-gray-900 rounded-[32px] p-6 max-w-sm w-full shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto scrollbar-none flex flex-col">
            <button 
              onClick={handleCancelEdit}
              className="absolute top-4 right-4 p-1.5 bg-gray-950 hover:bg-gray-900 rounded-xl text-gray-400 hover:text-white transition-all cursor-pointer z-10"
            >
              <X size={16} />
            </button>

            <h3 className="font-display font-black text-sm text-white uppercase tracking-wider mb-5 flex items-center gap-1.5">
              <Image size={15} className="text-[#82C341] w-4 h-4" />
              Ubah Foto & Banner
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              
              {/* Drag and Drop Upload Avatar Container */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Upload Avatar / Foto Profil
                </label>
                <div 
                  onDragOver={(e) => { e.preventDefault(); setDragActiveAvatar(true); }}
                  onDragLeave={() => setDragActiveAvatar(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActiveAvatar(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleAvatarFile(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => !isUploadingAvatar && avatarInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                    dragActiveAvatar 
                      ? 'border-[#82C341] bg-[#82C341]/5' 
                      : 'border-gray-800 bg-gray-950/50 hover:border-gray-700 hover:bg-gray-950/80'
                  } ${isUploadingAvatar ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  <input 
                    ref={avatarInputRef}
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    disabled={isUploadingAvatar}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleAvatarFile(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="w-16 h-16 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-3xl overflow-hidden shadow-inner relative select-none">
                    {isUploadingAvatar ? (
                      <div className="w-6 h-6 border-2 border-[#82C341] border-t-transparent rounded-full animate-spin"></div>
                    ) : editAvatar && (editAvatar.startsWith('http') || editAvatar.startsWith('data:')) ? (
                      <img src={editAvatar} alt="Avatar Preview" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      editAvatar || "🐱"
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] font-bold text-white flex items-center justify-center gap-1.5">
                      {isUploadingAvatar ? (
                        <span className="text-gray-400 animate-pulse">Mengunggah Avatar...</span>
                      ) : (
                        <>
                          <Upload size={12} className="text-[#82C341]" />
                          <span>Pilih Foto Avatar</span>
                        </>
                      )}
                    </p>
                    <p className="text-[9px] text-gray-500 mt-1 px-2 leading-normal">Seret & lepas berkas gambar atau klik untuk memilih</p>
                  </div>
                </div>
              </div>

              {/* Drag and Drop Upload Banner Container */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Upload Banner Profil
                </label>
                <div 
                  onDragOver={(e) => { e.preventDefault(); setDragActiveBanner(true); }}
                  onDragLeave={() => setDragActiveBanner(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActiveBanner(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleBannerFile(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => !isUploadingBanner && bannerInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl h-24 w-full flex flex-col items-center justify-center gap-2 cursor-pointer transition-all relative overflow-hidden ${
                    dragActiveBanner 
                      ? 'border-[#82C341] bg-[#82C341]/5' 
                      : 'border-gray-800 bg-gray-950/50 hover:border-gray-700 hover:bg-gray-950/80'
                  } ${isUploadingBanner ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  <input 
                    ref={bannerInputRef}
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    disabled={isUploadingBanner}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleBannerFile(e.target.files[0]);
                      }
                    }}
                  />
                  
                  {editBanner ? (
                    editBanner.startsWith('linear-gradient') || editBanner.startsWith('gradient-') ? (
                      <div className="absolute inset-0 w-full h-full" style={{ background: editBanner.startsWith('gradient-') ? BANNER_PRESETS.find(p => p.id === editBanner)?.value || 'linear-gradient(135deg, #111418 0%, #000000 100%)' : editBanner }} />
                    ) : (
                      <img src={editBanner} alt="Banner Preview" className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:opacity-25 transition-opacity" />
                    )
                  ) : null}
                  
                  <div className="relative z-10 text-center flex flex-col items-center justify-center p-2">
                    {isUploadingBanner ? (
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-5 h-5 border-2 border-[#82C341] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-[10px] text-gray-400 font-bold animate-pulse uppercase">Mengunggah Banner...</p>
                      </div>
                    ) : (
                      <>
                        <p className="text-[11px] font-bold text-white flex items-center justify-center gap-1.5">
                          <Image size={13} className="text-[#82C341]" />
                          <span>Pilih Foto Banner</span>
                        </p>
                        <p className="text-[9px] text-gray-500 mt-1 px-4 leading-normal">Seret & lepas berkas atau klik untuk memilih</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {uploadError && (
                <p className="text-[10px] text-red-500 font-bold text-center mt-1 uppercase leading-snug">{uploadError}</p>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 py-2 bg-gray-950 hover:bg-gray-900 text-gray-400 text-xs font-bold rounded-xl transition-all cursor-pointer uppercase"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUploadingAvatar || isUploadingBanner}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all uppercase ${
                    isUploadingAvatar || isUploadingBanner
                      ? 'bg-gray-900 text-gray-600 cursor-not-allowed'
                      : 'bg-[#82C341] hover:bg-[#99db4e] text-[#0d0f12] cursor-pointer'
                  }`}
                >
                  {isUploadingAvatar || isUploadingBanner ? 'Mengunggah...' : 'Simpan'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 4. Support Modals */}
      
      {/* Premium Subscription Details */}
      {activeModal === 'sub' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-[#111418] border border-gray-900 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl relative">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white cursor-pointer"><X size={16} /></button>
            <div className="flex justify-center mb-3">
              <img 
                src={crownLogo} 
                alt="Crown" 
                className="w-12 h-12 object-contain select-none invert opacity-95 filter drop-shadow-[0_0_8px_rgba(234,179,8,0.3)] animate-pulse" 
                referrerPolicy="no-referrer" 
              />
            </div>
            <h4 className="font-display font-black text-sm text-white uppercase tracking-wider">Wi-Buku Wibu VIP</h4>
            <p className="text-xs text-[#82C341] font-bold mt-1">Status Langganan VIP Aktif</p>
            <p className="text-[11px] text-gray-400 mt-3 leading-relaxed">
              Selamat! Akun Anda telah secara otomatis berstatus sebagai <span className="text-yellow-500 font-bold">WIBU VIP PREMIUM</span> gratis. Nikmati akses penuh tanpa iklan, render chapter tercepat, dan dapatkan bonus XP membaca 2x lipat!
            </p>
            <button 
              onClick={() => setActiveModal(null)}
              className="mt-5 w-full py-2 bg-[#82C341] hover:bg-[#99db4e] text-[#0d0f12] text-xs font-bold rounded-xl uppercase tracking-wider cursor-pointer"
            >
              Klaim Akses VIP
            </button>
          </div>
        </div>
      )}

      {/* Language Preferences */}
      {activeModal === 'lang' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-[#111418] border border-gray-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white cursor-pointer"><X size={16} /></button>
            <h4 className="font-display font-black text-sm text-white uppercase tracking-wider mb-4">{t('chooseLanguage')}</h4>
            
            <div className="space-y-2">
              <button 
                onClick={() => { setLanguage('ID'); setActiveModal(null); }}
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-xs font-bold uppercase transition-all cursor-pointer ${
                  language === 'ID' ? 'border-[#82C341] bg-[#82C341]/5 text-white' : 'border-gray-900 bg-gray-950 text-gray-400'
                }`}
              >
                <span>Bahasa Indonesia</span>
                {language === 'ID' && <Check size={14} className="text-[#82C341]" />}
              </button>
              <button 
                onClick={() => { setLanguage('EN'); setActiveModal(null); }}
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-xs font-bold uppercase transition-all cursor-pointer ${
                  language === 'EN' ? 'border-[#82C341] bg-[#82C341]/5 text-white' : 'border-gray-900 bg-gray-950 text-gray-400'
                }`}
              >
                <span>English (US)</span>
                {language === 'EN' && <Check size={14} className="text-[#82C341]" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms & Conditions Details */}
      {activeModal === 'terms' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-[#111418] border border-gray-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white cursor-pointer"><X size={16} /></button>
            <h4 className="font-display font-black text-sm text-white uppercase tracking-wider mb-3">Aturan Hunter Guild</h4>
            <div className="text-xs text-gray-400 space-y-2.5 max-h-60 overflow-y-auto pr-2">
              <p className="font-semibold text-gray-300">1. Sistem Ranking & Poin:</p>
              <p className="text-[11px] leading-relaxed">Setiap chapter yang Anda selesaikan memberikan 50 XP/Poin ke akun Firebase Anda secara instan dan aman.</p>
              <p className="font-semibold text-gray-300">2. Penyimpanan Sesi Cloud:</p>
              <p className="text-[11px] leading-relaxed">Progres Anda kini disinkronkan di database cloud Firebase. Anda dapat mengakses level Anda dari perangkat apa saja tanpa takut kehilangan progres.</p>
              <p className="font-semibold text-gray-300">3. Ketentuan Komunitas:</p>
              <p className="text-[11px] leading-relaxed">Papan Peringkat didesain murni untuk apresiasi ramah sesama pembaca manga di Indonesia. Gunakan akun Anda dengan bijak.</p>
            </div>
            <button 
              onClick={() => setActiveModal(null)}
              className="mt-5 w-full py-2 bg-[#82C341] hover:bg-[#99db4e] text-[#0d0f12] text-xs font-bold rounded-xl uppercase tracking-wider cursor-pointer"
            >
              Saya Setuju
            </button>
          </div>
        </div>
      )}

      {/* Chapter Completion History Details */}
      {activeModal === 'history' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-[#111418] border border-gray-900 rounded-[32px] p-6 max-w-md w-full shadow-2xl relative flex flex-col max-h-[80vh]">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white cursor-pointer"><X size={16} /></button>
            <h4 className="font-display font-black text-sm text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Trophy size={14} className="text-[#82C341]" />
              Riwayat Chapter Anda
            </h4>
            
            <div className="overflow-y-auto flex-grow divide-y divide-gray-900/40 pr-1">
              {user.completedChapters.length === 0 ? (
                <div className="py-12 text-center text-gray-500 text-xs">
                  Belum ada riwayat chapter. Mulailah membaca untuk mengklaim bonus XP!
                </div>
              ) : (
                user.completedChapters.map((ch, idx) => {
                  const decoded = decodeURIComponent(ch).replace(/\/$/, '').split('/');
                  const label = decoded[decoded.length - 1] || 'Chapter';
                  const formattedLabel = label.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                  return (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-[11px] text-gray-300">
                      <span className="font-semibold truncate pr-4">{formattedLabel}</span>
                      <span className="text-[9px] font-bold text-[#82C341] bg-[#82C341]/10 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                        <Check size={9} /> +50 XP
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <button 
              onClick={() => setActiveModal(null)}
              className="mt-4 w-full py-2 bg-[#82C341] hover:bg-[#99db4e] text-[#0d0f12] text-xs font-bold rounded-xl uppercase tracking-wider cursor-pointer"
            >
              Tutup Riwayat
            </button>
          </div>
        </div>
      )}

      {/* Security & Traffic Protection Details */}
      {activeModal === 'security' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-[#111418] border border-gray-900 rounded-[32px] p-6 max-w-md w-full shadow-2xl relative flex flex-col max-h-[90vh]">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white cursor-pointer"><X size={16} /></button>
            
            <div className="flex items-center gap-2 text-[#82C341] mb-2">
              <ShieldCheck size={22} className="animate-pulse" />
              <h4 className="font-display font-black text-sm text-white uppercase tracking-wider">
                Pusat Keamanan & Proteksi Trafik
              </h4>
            </div>
            
            <p className="text-[11px] text-gray-400 mb-4 leading-relaxed">
              Sistem backend Wi-Buku telah dikonfigurasi dengan standar keamanan industri modern untuk menangani lonjakan lalu lintas yang tinggi tanpa menurunkan kinerja server atau menyebabkan situs mati (crash).
            </p>

            <div className="overflow-y-auto space-y-3.5 flex-grow pr-1 text-xs">
              
              {/* Feature 1: Rate Limiter */}
              <div className="bg-gray-950/60 border border-gray-900/80 rounded-2xl p-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-white uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Rate Limiter & Anti-DDoS
                  </span>
                  <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md font-black uppercase">AKTIF</span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed">
                  Membatasi permintaan maksimum hingga <strong>120 request per menit</strong> per alamat IP. Menghindari serangan spam atau flooding dari bot otomatis sehingga server tetap responsif bahkan saat trafik padat.
                </p>
              </div>

              {/* Feature 2: Payload Sanitization */}
              <div className="bg-gray-950/60 border border-gray-900/80 rounded-2xl p-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-white uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Sanitasi Input & Payload Limit
                  </span>
                  <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md font-black uppercase">AKTIF</span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed">
                  Membatasi kapasitas payload body permintaan maksimal <strong>10 Kilobyte</strong>. Melindungi server dari kelebihan pemakaian memori akibat pengiriman data berukuran raksasa secara sengaja.
                </p>
              </div>

              {/* Feature 3: Helmet HTTP Security */}
              <div className="bg-gray-950/60 border border-gray-900/80 rounded-2xl p-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-white uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Helmet HTTP Security Headers
                  </span>
                  <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md font-black uppercase">AKTIF</span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed">
                  Menyuntikkan HTTP header standar pertahanan (XSS Auditor, X-Frame-Options, X-Content-Type-Options). Menghilangkan celah serangan Cross-Site Scripting (XSS) dan Clickjacking.
                </p>
              </div>

              {/* Feature 4: Session Cloud Security */}
              <div className="bg-gray-950/60 border border-gray-900/80 rounded-2xl p-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-white uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Enkripsi Data SSL/TLS & Auth
                  </span>
                  <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md font-black uppercase">AKTIF</span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed">
                  Seluruh komunikasi data dienkripsi penuh menggunakan transport layer SSL/TLS. Integrasi Firebase Authentication menjamin kredensial pengguna terenkripsi secara aman di sisi Google Server.
                </p>
              </div>

            </div>

            <button 
              onClick={() => setActiveModal(null)}
              className="mt-5 w-full py-2 bg-[#82C341] hover:bg-[#99db4e] text-[#0d0f12] text-xs font-bold rounded-xl uppercase tracking-wider cursor-pointer"
            >
              Kembali ke Menu
            </button>
          </div>
        </div>
      )}

        </div>
    </div>
  );
}
