export interface AnimeItem {
  id: string;
  title: string;
  rating: number;
  type: string;
  imageUrl: string;
}

export interface MangaItem {
  id: string;
  title: string;
  rating: number;
  type: string;
  imageUrl: string;
}

export interface CharacterItem {
  id: string;
  name: string;
  anime: string;
  imageUrl: string;
  favorites?: string;
}

export interface FranchiseItem {
  id: string;
  name: string;
  imageUrl: string;
}

export interface GuideItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

export interface GenreItem {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

export interface RankingItem {
  rank: number;
  title: string;
  rating: number;
  favorites: string;
  imageUrl: string;
}

export interface FeaturedSlide {
  id: string;
  title: string;
  subtitle: string;
  buttonText: string;
  imageUrl: string;
}
