export type ActiveTab = 'oda' | 'notlar' | 'bir-ara-yapalim' | 'esyalar';

export type UserPersona = 'selin' | 'mert';

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  emoji: string;
  color: string;
  role: 'partner_1' | 'partner_2';
}

export interface CatState {
  name: string;
  satiety: number;     // 0-100 (Tokluk)
  happiness: number;   // 0-100 (Mutluluk)
  energy: number;      // 0-100 (Enerji)
  isSleeping: boolean;
  lastUpdated: number; // timestamp ms
  lastFedTime?: number;
  lastPetTime?: number;
}

export type NoteColor = '#F4F7F2' | '#FCF8F2' | '#F7F5FC';

export interface NoteReaction {
  emoji: '😄' | '👀' | '🐾' | '☕';
  users: string[]; // user IDs who reacted
}

export interface NoteItem {
  id: string;
  title: string;
  body: string;
  authorId: string;
  authorName: string;
  authorEmoji: string;
  color: NoteColor;
  isPinned: boolean;
  createdAt: number;
  tag?: string;
  snippet?: {
    type: 'movie' | 'task' | 'place' | 'quote';
    title: string;
    subtitle: string;
    icon?: string;
  };
  reactions: NoteReaction[];
}

export type WishlistCategory = 'film' | 'kahve' | 'oyun' | 'diger';

export interface WishlistItem {
  id: string;
  title: string;
  description?: string;
  category: WishlistCategory;
  authorId: string;
  authorName: string;
  authorEmoji: string;
  isCompleted: boolean;
  completedAt?: number;
  createdAt: number;
  likes: string[]; // user IDs
}

export type ShopCategory = 'minderler' | 'oyuncaklar' | 'kaplar' | 'susler';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: ShopCategory;
  price: number;
  image: string;
  fallbackEmoji: string;
  isOwned: boolean;
  isPlaced: boolean;
  badge?: string;
}

export interface CareLogItem {
  id: string;
  actorName: string;
  actorColor: string;
  emoji: string;
  actionText: string;
  timeAgo: string;
  timestamp: number;
  rewardPati?: number;
}

export interface AppSettings {
  catName: string;
  soundEnabled: boolean;
  reducedMotion: boolean;
  roomCode: string;
  isSpaceLocked: boolean; // 2 people limit
  mode: 'demo' | 'firebase';
}

export interface AppState {
  currentUserId: string;
  cat: CatState;
  patiBalance: number;
  notes: NoteItem[];
  wishlist: WishlistItem[];
  shopItems: ShopItem[];
  careLogs: CareLogItem[];
  settings: AppSettings;
}
