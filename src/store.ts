import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from './lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { fixUrlTypo } from './utils';

export interface FavoriteItem {
  title: string;
  link: string;
  thumb: string;
  desc?: string;
}

interface FavoriteStore {
  favorites: FavoriteItem[];
  toggleFavorite: (item: FavoriteItem) => Promise<void>;
  isFavorite: (link: string) => boolean;
  setFavorites: (favorites: FavoriteItem[]) => void;
}

export const useFavorites = create<FavoriteStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      toggleFavorite: async (item) => {
        const favs = get().favorites;
        let newFavs: FavoriteItem[];
        const exists = favs.find(f => f.link === item.link);
        if (exists) {
          newFavs = favs.filter(f => f.link !== item.link);
        } else {
          newFavs = [...favs, item];
        }
        set({ favorites: newFavs });

        // Sync with Firestore if user is logged in
        const currentUser = useUserStore.getState().user;
        if (currentUser) {
          try {
            await setDoc(doc(db, 'users', currentUser.uid), {
              favorites: newFavs
            }, { merge: true });
          } catch (e) {
            console.error("Failed to sync favorites to Firestore:", e);
          }
        }
      },
      isFavorite: (link) => {
        return !!get().favorites.find(f => f.link === link);
      },
      setFavorites: (favorites) => {
        set({ favorites });
      }
    }),
    {
      name: 'komiku-favorites-v2',
    }
  )
);

// Game-related interfaces
export interface UserProfile {
  uid: string;
  email: string | null;
  username: string;
  avatar: string; // Emoji or asset identifier
  bio?: string;
  banner?: string;
  points: number;
  level: number;
  xp: number;
  completedChapters: string[]; // List of chapter URLs
  completedChaptersCount: number;
}

interface UserStore {
  user: UserProfile | null;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setUser: (user: UserProfile | null) => void;
  syncProfile: (uid: string, email: string | null, displayName: string | null, selectedAvatar?: string, forceSocialSync?: boolean) => Promise<UserProfile>;
  updateProfileInCloud: (username: string, avatar: string, bio?: string, banner?: string) => Promise<void>;
  logout: () => void;
  completeChapter: (chapterUrl: string, chapterTitle: string) => Promise<{ pointsEarned: number; leveledUp: boolean } | null>;
  hasCompleted: (chapterUrl: string) => boolean;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      setLoading: (loading) => set({ loading }),
      setUser: (user) => set({ user }),
      
      syncProfile: async (uid, email, displayName, selectedAvatar, forceSocialSync = false) => {
        set({ loading: true });
        try {
          const userRef = doc(db, 'users', uid);
          const userSnap = await getDoc(userRef);
          
          let profile: UserProfile;

          if (userSnap.exists()) {
            const data = userSnap.data();
            // ALWAYS prioritize existing user's custom Firestore profile details
            const finalUsername = data.username || displayName || email?.split('@')[0] || 'Hunter';
            const finalAvatar = data.avatar || selectedAvatar || '🐱';

            profile = {
              uid,
              email: email || data.email || null,
              username: finalUsername,
              avatar: fixUrlTypo(finalAvatar),
              bio: data.bio || 'Passionate about reading manga & manhwa and leveling up my Hunter Rank! ⚔️',
              banner: fixUrlTypo(data.banner || 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=600&q=80'),
              points: data.points ?? 100,
              level: data.level ?? 1,
              xp: data.xp ?? 0,
              completedChapters: data.completedChapters || [],
              completedChaptersCount: (data.completedChapters || []).length
            };
            
            // Sync favorites from database as well if they exist
            if (data.favorites) {
              useFavorites.getState().setFavorites(data.favorites);
            }
          } else {
            // Create a brand new profile
            profile = {
              uid,
              email,
              username: displayName || email?.split('@')[0] || 'Hunter',
              avatar: selectedAvatar || '🐱',
              bio: 'Passionate about reading manga & manhwa and leveling up my Hunter Rank! ⚔️',
              banner: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=600&q=80',
              points: 100, // starting gift
              level: 1,
              xp: 0,
              completedChapters: [],
              completedChaptersCount: 0
            };
            
            // Save to Firestore
            await setDoc(userRef, {
              ...profile,
              favorites: useFavorites.getState().favorites // Seed current local favorites
            });
          }

          set({ user: profile, loading: false });
          return profile;
        } catch (error) {
          console.error("Error syncing profile with Firestore:", error);
          // Fallback to minimal user profile to prevent lockouts
          const fallbackProfile: UserProfile = {
            uid,
            email,
            username: displayName || email?.split('@')[0] || 'Hunter',
            avatar: selectedAvatar || '🐱',
            bio: 'Passionate about reading manga & manhwa and leveling up my Hunter Rank! ⚔️',
            banner: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=600&q=80',
            points: 100,
            level: 1,
            xp: 0,
            completedChapters: [],
            completedChaptersCount: 0
          };
          set({ user: fallbackProfile, loading: false });
          return fallbackProfile;
        }
      },

      updateProfileInCloud: async (username, avatar, bio, banner) => {
        const currentUser = get().user;
        if (!currentUser) return;

        const cleanAvatar = fixUrlTypo(avatar);
        const cleanBanner = fixUrlTypo(banner ?? currentUser.banner);

        const updated = {
          ...currentUser,
          username,
          avatar: cleanAvatar,
          bio: bio ?? currentUser.bio,
          banner: cleanBanner
        };

        set({ user: updated });

        try {
          const userRef = doc(db, 'users', currentUser.uid);
          await setDoc(userRef, {
            username,
            avatar: cleanAvatar,
            bio: bio ?? '',
            banner: cleanBanner
          }, { merge: true });
        } catch (e) {
          console.error("Failed to update profile details in Firestore:", e);
        }
      },

      logout: () => {
        set({ user: null });
        useFavorites.getState().setFavorites([]); // Clear favorites on signout
      },

      completeChapter: async (chapterUrl, chapterTitle) => {
        const currentUser = get().user;
        if (!currentUser) return null;

        // Check if already completed
        if (currentUser.completedChapters.includes(chapterUrl)) {
          return null; 
        }

        const pointsEarned = 50;
        const xpEarned = 50;
        
        let newXp = currentUser.xp + xpEarned;
        let newLevel = currentUser.level;
        let leveledUp = false;
        
        // Level up formula: Level * 150 = XP required to level up
        let xpNeeded = newLevel * 150;
        while (newXp >= xpNeeded) {
          newXp -= xpNeeded;
          newLevel += 1;
          xpNeeded = newLevel * 150;
          leveledUp = true;
        }

        const updatedChapters = [...currentUser.completedChapters, chapterUrl];

        const updatedUser = {
          ...currentUser,
          points: currentUser.points + pointsEarned,
          level: newLevel,
          xp: newXp,
          completedChapters: updatedChapters,
          completedChaptersCount: updatedChapters.length
        };

        set({ user: updatedUser });

        // Sync with Firestore
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          await updateDoc(userRef, {
            points: updatedUser.points,
            level: updatedUser.level,
            xp: updatedUser.xp,
            completedChapters: updatedUser.completedChapters
          });
        } catch (e) {
          console.error("Failed to sync completed chapter to Firestore:", e);
        }

        return { pointsEarned, leveledUp };
      },

      hasCompleted: (chapterUrl) => {
        const currentUser = get().user;
        return currentUser ? currentUser.completedChapters.includes(chapterUrl) : false;
      }
    }),
    {
      name: 'wibuku-user-profile-v3',
    }
  )
);

export interface LanguageState {
  language: 'ID' | 'EN';
  setLanguage: (lang: 'ID' | 'EN') => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'ID',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'wibuku-language-preference',
    }
  )
);

