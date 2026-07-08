import { useLanguageStore } from './store';

export const translations = {
  ID: {
    // Navigation
    home: 'Beranda',
    leaderboard: 'Leaderboard',
    favorites: 'Favorit Saya',
    profile: 'Profil Hunter',
    searchPlaceholder: 'Cari manga/manhwa...',
    menuTitle: 'MENU UTAMA',
    searchResultFor: 'Hasil pencarian untuk',
    emptyFavorites: 'Belum ada manga yang ditambahkan ke favorit.',

    // Homepage
    spotlightTitle: 'REKOMENDASI UTAMA',
    latestUpdates: 'UPDATE TERBARU',
    byGenre: 'BERDASARKAN GENRE',
    popularCharacters: 'KARAKTER POPULER',
    popularRankings: 'PERINGKAT POPULER',
    noMangaFound: 'Tidak ada manga yang ditemukan.',
    loading: 'Sedang memuat data...',
    readNowButton: 'BACA SEKARANG',
    filterAll: 'Semua',
    filterPopular: 'Populer',
    filterNew: 'Terbaru',
    filterCompleted: 'Selesai',

    // Manga Detail
    synopsis: 'Sinopsis',
    chapters: 'Daftar Chapter',
    readFirst: 'Mulai Membaca',
    bookmarked: 'Tersimpan ke Favorit',
    bookmark: 'Simpan ke Favorit',
    status: 'Status',
    author: 'Penulis',
    type: 'Tipe',
    rating: 'Rating',
    released: 'Dirilis',
    lastUpdated: 'Update Terakhir',
    viewAllChapters: 'Lihat Semua Chapter',
    backToHome: 'Kembali ke Beranda',

    // Chapter Reader
    nextChapter: 'Chapter Selanjutnya',
    prevChapter: 'Chapter Sebelumnya',
    backToManga: 'Kembali ke Info Manga',
    loadingImages: 'Memuat gambar chapter...',
    noImages: 'Tidak ada gambar yang ditemukan untuk chapter ini.',

    // Leaderboard View
    topHunters: 'Papan Peringkat S-Rank',
    hunterGuild: 'Sistem Guild Hunter Dunia Wi-Buku',
    rank: 'Peringkat',
    hunter: 'Hunter',
    level: 'Level',
    points: 'Poin',
    chaptersCompleted: 'Chapter Selesai',
    emptyLeaderboard: 'Belum ada hunter di papan peringkat.',
    yourStats: 'Statistik Guild Anda',

    // Profile View
    accountSettings: 'Pengaturan Akun',
    vipStatusActive: 'Status Langganan VIP Aktif',
    vipStatusInactive: 'Akses VIP Belum Aktif',
    claimVip: 'Klaim Akses VIP',
    changeAvatar: 'Ubah gambar foto profil/avatar dan banner',
    logOut: 'Keluar Sesi',
    saveChanges: 'Simpan Perubahan',
    chooseLanguage: 'Pilih Bahasa',
    bioPlaceholder: 'Tulis biografi Hunter Anda...',
    termsAndConditions: 'Aturan Hunter Guild',
    rulesTitle: 'Aturan Guild Hunter',
    joined: 'Bergabung sejak',
    rankTitle: 'Gelar Hunter',
    xpNeeded: 'XP untuk Naik Level',
    editProfile: 'Edit Profil',
    cancel: 'Batal',
    usernameLabel: 'Nama Pengguna',
    bioLabel: 'Biografi',
    changeBannerText: 'Klik banner untuk mengunggah banner baru (Maksimal 5MB)',
    changeAvatarText: 'Klik foto profil untuk mengunggah avatar baru (Maksimal 5MB)',
    uploadSuccess: 'Gambar berhasil diperbarui!',
    historyRow: 'Riwayat Membaca',
    historyTitle: 'Riwayat Chapter Selesai',
    historySubtitle: 'Daftar chapter yang telah Anda selesaikan',
    emptyHistory: 'Anda belum menyelesaikan chapter apa pun.',
    noAccount: 'Belum punya akun? Daftar gratis di bawah.',
    hasAccount: 'Sudah punya akun? Masuk langsung.',
    loginTitle: 'Masuk Hunter Guild',
    registerTitle: 'Daftar Hunter Baru',
    orContinueWith: 'Atau lanjut menggunakan',
    sendingVerification: 'Mengirim email verifikasi...',
    notVerifiedWarning: 'Email Anda belum diverifikasi. Silakan periksa kotak masuk Anda atau klik tombol di bawah untuk kirim ulang.',
    resendVerificationButton: 'Kirim Ulang Email Verifikasi',
  },
  EN: {
    // Navigation
    home: 'Home',
    leaderboard: 'Leaderboard',
    favorites: 'My Favorites',
    profile: 'Hunter Profile',
    searchPlaceholder: 'Search manga/manhwa...',
    menuTitle: 'MAIN MENU',
    searchResultFor: 'Search results for',
    emptyFavorites: 'No manga added to favorites yet.',

    // Homepage
    spotlightTitle: 'MAIN RECOMMENDATION',
    latestUpdates: 'LATEST UPDATES',
    byGenre: 'BY GENRE',
    popularCharacters: 'POPULAR CHARACTERS',
    popularRankings: 'POPULAR RANKINGS',
    noMangaFound: 'No manga found.',
    loading: 'Loading data...',
    readNowButton: 'READ NOW',
    filterAll: 'All',
    filterPopular: 'Popular',
    filterNew: 'New',
    filterCompleted: 'Completed',

    // Manga Detail
    synopsis: 'Synopsis',
    chapters: 'Chapter List',
    readFirst: 'Start Reading',
    bookmarked: 'Saved to Favorites',
    bookmark: 'Add to Favorites',
    status: 'Status',
    author: 'Author',
    type: 'Type',
    rating: 'Rating',
    released: 'Released',
    lastUpdated: 'Last Updated',
    viewAllChapters: 'View All Chapters',
    backToHome: 'Back to Home',

    // Chapter Reader
    nextChapter: 'Next Chapter',
    prevChapter: 'Previous Chapter',
    backToManga: 'Back to Manga Info',
    loadingImages: 'Loading chapter images...',
    noImages: 'No images found for this chapter.',

    // Leaderboard View
    topHunters: 'S-Rank Leaderboard',
    hunterGuild: 'Wi-Buku World Hunter Guild System',
    rank: 'Rank',
    hunter: 'Hunter',
    level: 'Level',
    points: 'Points',
    chaptersCompleted: 'Chapters Read',
    emptyLeaderboard: 'No hunters on the leaderboard yet.',
    yourStats: 'Your Guild Statistics',

    // Profile View
    accountSettings: 'Account Settings',
    vipStatusActive: 'Active VIP Subscription',
    vipStatusInactive: 'VIP Access Inactive',
    claimVip: 'Claim VIP Access',
    changeAvatar: 'Change profile picture and banner',
    logOut: 'Log Out',
    saveChanges: 'Save Changes',
    chooseLanguage: 'Select Language',
    bioPlaceholder: 'Write your Hunter biography...',
    termsAndConditions: 'Hunter Guild Rules',
    rulesTitle: 'Hunter Guild Rules',
    joined: 'Member since',
    rankTitle: 'Hunter Title',
    xpNeeded: 'XP to Level Up',
    editProfile: 'Edit Profile',
    cancel: 'Cancel',
    usernameLabel: 'Username',
    bioLabel: 'Biography',
    changeBannerText: 'Click banner to upload new banner (Max 5MB)',
    changeAvatarText: 'Click avatar to upload new profile picture (Max 5MB)',
    uploadSuccess: 'Image updated successfully!',
    historyRow: 'Reading History',
    historyTitle: 'Completed Chapters History',
    historySubtitle: 'List of chapters you have read and completed',
    emptyHistory: 'You have not completed any chapters yet.',
    noAccount: "Don't have an account? Sign up for free.",
    hasAccount: 'Already have an account? Log in directly.',
    loginTitle: 'Hunter Guild Login',
    registerTitle: 'Register New Hunter',
    orContinueWith: 'Or continue with',
    sendingVerification: 'Sending verification email...',
    notVerifiedWarning: 'Your email is not verified yet. Please check your inbox or click below to resend verification.',
    resendVerificationButton: 'Resend Verification Email',
  }
};

export function useTranslation() {
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  const t = (key: keyof typeof translations.ID) => {
    return translations[language][key] || translations.ID[key] || key;
  };

  return { t, language, setLanguage };
}
