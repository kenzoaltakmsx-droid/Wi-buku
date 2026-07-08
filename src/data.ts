import { 
  AnimeItem, 
  MangaItem, 
  CharacterItem, 
  FranchiseItem, 
  GuideItem, 
  GenreItem, 
  RankingItem,
  FeaturedSlide
} from './types';

export const FRANCHISES: FranchiseItem[] = [
  {
    id: 'bleach',
    name: 'BLEACH',
    imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=150&q=80'
  },
  {
    id: 'dragon-ball',
    name: 'DRAGON BALL',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150&q=80'
  },
  {
    id: 'naruto',
    name: 'NARUTO',
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=150&q=80'
  },
  {
    id: 'one-piece',
    name: 'ONE PIECE',
    imageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=150&q=80'
  },
  {
    id: 'pokemon',
    name: 'POKÉMON',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=150&q=80'
  }
];

export const FEATURED_SLIDES: FeaturedSlide[] = [
  {
    id: 'rooster-fighter',
    title: 'UM GALO DE BRIGA CONTRA MONSTROS GIGANTES? CONHEÇA A MAIOR LOUCURA DO ANO!',
    subtitle: 'Esqueça os heróis clichês com espadas mágicas. Em Rooster Fighter, a salvação da humanidade está nas garras (e no bico) do galo mais casca-grossa, invocado e vingativo dos mangás. Vem ver onde assistir e por que a internet inteira só fala dessa insanidade.',
    buttonText: 'Saiba mais',
    imageUrl: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=1200&q=80' // styled rooster/anime background
  },
  {
    id: 'rezero',
    title: 'RE:ZERO - COMEÇANDO UMA VIDA EM OUTRO MUNDO DA 4ª TEMPORADA',
    subtitle: 'Subaru Natsuki retorna em sua batalha mais intensa até agora, enfrentando novos desafios temporais e desvendando segredos profundos do Reino de Lugnica.',
    buttonText: 'Ver episódios',
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&q=80'
  },
  {
    id: 'one-piece-featured',
    title: 'ONE PIECE: O ARCO DE EGGHEAD ATINGE O SEU CLÍMAX',
    subtitle: 'Os Chapéus de Palha enfrentam o Governo Mundial na ilha futurista do Dr. Vegapunk. Acompanhe a batalha que promete abalar as estruturas de todo o mundo.',
    buttonText: 'Assistir agora',
    imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=1200&q=80'
  }
];

export const CURRENT_SEASON_ANIME: AnimeItem[] = [
  {
    id: 'rezero-4',
    title: 'Re:Zero - Começando Uma Vida Em Outro...',
    rating: 9.04,
    type: 'Anime',
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80'
  },
  {
    id: 'witch-hat',
    title: 'Witch Hat Atelier',
    rating: 8.69,
    type: 'Anime',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&q=80'
  },
  {
    id: 'nippon-sangoku',
    title: 'Nippon Sangoku',
    rating: 8.50,
    type: 'Anime',
    imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&q=80'
  },
  {
    id: 'dr-stone',
    title: 'Dr. STONE: Science Future — Parte 3...',
    rating: 8.29,
    type: 'Anime',
    imageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&q=80'
  },
  {
    id: 'wistoria-2',
    title: 'Wistoria: Wand and Sword 2ª Temporada',
    rating: 8.24,
    type: 'Anime',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80'
  },
  {
    id: 'iruma-kun',
    title: 'Welcome to Demon School! Iruma-kun ...',
    rating: 8.13,
    type: 'Anime',
    imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=400&q=80'
  },
  {
    id: 'diamond-ace',
    title: 'Diamond no Ace: Act II 2ª Temporada',
    rating: 8.11,
    type: 'Anime',
    imageUrl: 'https://images.unsplash.com/photo-1513829096999-4978602297f7?w=400&q=80'
  },
  {
    id: 'slime-isekai',
    title: 'That Time I Got Reincarnated as a...',
    rating: 8.11,
    type: 'Anime',
    imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=80'
  },
  {
    id: 'cote-4',
    title: 'Classroom of the Elite IV - Segundo...',
    rating: 8.00,
    type: 'Anime',
    imageUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&q=80'
  },
  {
    id: 'daemons-shadow',
    title: 'Daemons of the Shadow Realm',
    rating: 7.95,
    type: 'Anime',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&q=80'
  },
  {
    id: 'koori-no-jouheki',
    title: 'Koori no Jouheki',
    rating: 7.94,
    type: 'Anime',
    imageUrl: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=400&q=80'
  },
  {
    id: 'pretties',
    title: 'I Made Friends with the Second Pretties...',
    rating: 7.93,
    type: 'Anime',
    imageUrl: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=400&q=80'
  }
];

export const GUIDES: GuideItem[] = [
  {
    id: 'demon-slayer-guide',
    title: 'Demon Slayer: tudo sobre saga de Tanjiro, do primeiro corte ao Castelo...',
    description: 'Análise completa, cronologias, explicações de finais e tudo o que você precisa para entender suas obras favoritas.',
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80'
  },
  {
    id: 'chainsaw-man-guide',
    title: 'Chainsaw Man: a obra completa agora que o mangá acabou',
    description: 'Tudo sobre Denji, os Demônios e os mistérios que envolveram a parte 1 e 2 da saga mais insana da atualidade.',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&q=80'
  },
  {
    id: 'wistoria-guide',
    title: 'Wistoria: tudo sobre o anime e o mangá',
    description: 'Conheça Will Serfort e o universo mágico de Wand and Sword, uma das grandes surpresas da temporada.',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80'
  },
  {
    id: 'frieren-guide',
    title: 'Frieren: o anime, o mangá e a ordem para acompanhar',
    description: 'O guia definitivo sobre a jornada de Frieren após a derrota do Rei Demônio e as lições de vida no caminho.',
    imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=400&q=80'
  },
  {
    id: 'berserk-guide',
    title: 'Berserk: por onde começar a ler o mangá',
    description: 'Tire suas dúvidas sobre a cronologia, os arcos mais icônicos e o legado imortal de Kentaro Miura.',
    imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&q=80'
  }
];

export const TOP_MANGAS: MangaItem[] = [
  {
    id: 'berserk-manga',
    title: 'Berserk',
    rating: 9.46,
    type: 'Mangá',
    imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=300&q=80'
  },
  {
    id: 'jojo-7',
    title: "JoJo's Bizarre Adventure Parte 7...",
    rating: 9.33,
    type: 'Mangá',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&q=80'
  },
  {
    id: 'vagabond',
    title: 'Vagabond',
    rating: 9.27,
    type: 'Mangá',
    imageUrl: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=300&q=80'
  },
  {
    id: 'one-piece-manga',
    title: 'One Piece',
    rating: 9.21,
    type: 'Mangá',
    imageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=300&q=80'
  },
  {
    id: 'monster-manga',
    title: 'Monster',
    rating: 9.16,
    type: 'Mangá',
    imageUrl: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=300&q=80'
  },
  {
    id: 'vinland-saga',
    title: 'Vinland Saga',
    rating: 9.09,
    type: 'Mangá',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&q=80'
  }
];

export const POPULAR_CHARACTERS: CharacterItem[] = [
  {
    id: 'lelouch',
    name: 'Lelouch Lamperouge',
    anime: 'Code Geass',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80'
  },
  {
    id: 'luffy',
    name: 'Monkey D. Luffy',
    anime: 'One Piece',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80'
  },
  {
    id: 'levi',
    name: 'Levi Ackerman',
    anime: 'Shingeki no Kyojin',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80'
  },
  {
    id: 'l-lawliet',
    name: 'L Lawliet',
    anime: 'Death Note',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&q=80'
  },
  {
    id: 'zoro',
    name: 'Roronoa Zoro',
    anime: 'One Piece',
    imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&q=80'
  },
  {
    id: 'killua',
    name: 'Killua Zoldyck',
    anime: 'Hunter x Hunter',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&q=80'
  }
];

export const GENRES: GenreItem[] = [
  {
    id: 'shounen',
    name: 'Shounen',
    description: 'Animes de ação, aventura e amizade, com muita luta e momentos de puro hype.',
    color: 'from-[#1b4332] to-[#2d6a4f] hover:border-emerald-400',
    icon: 'Swords'
  },
  {
    id: 'isekai',
    name: 'Isekai',
    description: 'Histórias em que o protagonista vai parar em outro mundo cheio de magia e aventura.',
    color: 'from-[#4a2810] to-[#6f3f1e] hover:border-amber-500',
    icon: 'Globe'
  },
  {
    id: 'acao',
    name: 'Ação',
    description: 'Lutas intensas, perseguições e adrenalina do começo ao fim do anime.',
    color: 'from-[#0b2d3d] to-[#124d67] hover:border-sky-400',
    icon: 'Flame'
  },
  {
    id: 'romance',
    name: 'Romance',
    description: 'Histórias focadas em sentimentos, relacionamentos e conexões emocionais.',
    color: 'from-[#4c121a] to-[#721c24] hover:border-pink-500',
    icon: 'Heart'
  },
  {
    id: 'slice-of-life',
    name: 'Slice of Life',
    description: 'Histórias leves sobre o cotidiano, perfeitas para relaxar e aquecer o coração.',
    color: 'from-[#143d3c] to-[#1e5a59] hover:border-teal-400',
    icon: 'Coffee'
  },
  {
    id: 'seinen',
    name: 'Seinen',
    description: 'Narrativas mais adultas, com temas densos, complexos e profundos.',
    color: 'from-[#281a3d] to-[#3f2a5c] hover:border-purple-400',
    icon: 'BookOpen'
  },
  {
    id: 'fantasia',
    name: 'Fantasia',
    description: 'Mundos mágicos, criaturas incríveis, magias e aventuras altamente épicas.',
    color: 'from-[#1c3f24] to-[#2a5e37] hover:border-green-400',
    icon: 'Sparkles'
  },
  {
    id: 'comedia',
    name: 'Comédia',
    description: 'Animes feitos para dar risadas, com situações absurdas e humor rápido.',
    color: 'from-[#473b12] to-[#6b581b] hover:border-yellow-400',
    icon: 'Laugh'
  },
  {
    id: 'esportes',
    name: 'Esportes (Spokon)',
    description: 'Competições empolgantes, evolução dos personagens e muita emoção em quadra.',
    color: 'from-[#0f3c3a] to-[#185e5a] hover:border-cyan-400',
    icon: 'Trophy'
  },
  {
    id: 'psicologico',
    name: 'Psicológico',
    description: 'Histórias que desafiam a mente com grandes mistérios e alta tensão emocional.',
    color: 'from-[#3c1240] to-[#5a1b61] hover:border-fuchsia-400',
    icon: 'Brain'
  },
  {
    id: 'mecha',
    name: 'Mecha',
    description: 'Robôs gigantes, tecnologia futurista e batalhas militares em grande escala.',
    color: 'from-[#2c2d30] to-[#424449] hover:border-slate-400',
    icon: 'Cpu'
  },
  {
    id: 'sobrenatural',
    name: 'Sobrenatural',
    description: 'Mistérios ocultos, espíritos e eventos inexplicáveis além do plano real.',
    color: 'from-[#1f4012] to-[#2e5e1b] hover:border-lime-400',
    icon: 'Ghost'
  }
];

export const RANKING_ANIMES: RankingItem[] = [
  {
    rank: 1,
    title: 'Re:Zero - Começando Uma Vida Em Outro Mundo 4...',
    rating: 8.73,
    favorites: '253.8 mil favoritos',
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=100&q=80'
  },
  {
    rank: 2,
    title: 'Wistoria: Wand and Sword 2ª Temporada',
    rating: 8.24,
    favorites: '165.0 mil favoritos',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=100&q=80'
  },
  {
    rank: 3,
    title: 'One Piece',
    rating: 8.59,
    favorites: '2695.1 mil favoritos',
    imageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=100&q=80'
  },
  {
    rank: 4,
    title: 'Witch Hat Atelier',
    rating: 8.69,
    favorites: '339.4 mil favoritos',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=100&q=80'
  },
  {
    rank: 5,
    title: 'Classroom of the Elite IV - Segundo Ano Primeiro...',
    rating: 8.00,
    favorites: '218.2 mil favoritos',
    imageUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=100&q=80'
  }
];

export const RANKING_MANGAS: RankingItem[] = [
  {
    rank: 1,
    title: 'One Piece',
    rating: 9.21,
    favorites: '126.1 mil favoritos',
    imageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=100&q=80'
  },
  {
    rank: 2,
    title: 'Berserk',
    rating: 9.46,
    favorites: '137.1 mil favoritos',
    imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=100&q=80'
  },
  {
    rank: 3,
    title: 'Solo Leveling',
    rating: 8.59,
    favorites: '47.4 mil favoritos',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=100&q=80'
  },
  {
    rank: 4,
    title: 'Wistoria: Wand and Sword',
    rating: 7.81,
    favorites: '259 favoritos',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=100&q=80'
  },
  {
    rank: 5,
    title: 'Chainsaw Man',
    rating: 8.69,
    favorites: '90.8 mil favoritos',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=100&q=80'
  }
];

export const RANKING_CHARACTERS: RankingItem[] = [
  {
    rank: 1,
    title: 'Monkey D. Luffy',
    rating: 9.60,
    favorites: '148.9 mil favoritos',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80'
  },
  {
    rank: 2,
    title: 'Lelouch Lamperouge',
    rating: 9.50,
    favorites: '137.1 mil favoritos',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80'
  },
  {
    rank: 3,
    title: 'Levi Ackerman',
    rating: 9.40,
    favorites: '146.2 mil favoritos',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80'
  },
  {
    rank: 4,
    title: 'L Lawliet',
    rating: 9.30,
    favorites: '131.2 mil favoritos',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&q=80'
  },
  {
    rank: 5,
    title: 'Naruto Uzumaki',
    rating: 9.20,
    favorites: '87.6 mil favoritos',
    imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&q=80'
  }
];
