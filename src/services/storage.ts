import { AppState, CareLogItem, NoteItem, ShopItem, WishlistItem } from '../types';
import { INITIAL_STATE } from '../constants/initialData';

const STORAGE_KEY = 'pati_molasi_state_v1';
const SYNC_CHANNEL_NAME = 'pati_molasi_sync_channel';

// Calculate passive decay & regeneration gracefully
function calculatePassiveCatState(state: AppState): AppState {
  const now = Date.now();
  const lastUpdated = state.cat.lastUpdated || now;
  const elapsedMinutes = Math.floor((now - lastUpdated) / (1000 * 60));

  if (elapsedMinutes <= 1) return state;

  // Gentle passive rate: -1 satiety every 30 mins, -1 happiness every 45 mins
  // Minimum clamp at 25 (Miso never starves, gets sick, or makes user feel guilty)
  let newSatiety = state.cat.satiety;
  let newHappiness = state.cat.happiness;
  let newEnergy = state.cat.energy;

  if (!state.cat.isSleeping) {
    const satietyLoss = Math.floor(elapsedMinutes / 30);
    const happinessLoss = Math.floor(elapsedMinutes / 45);
    const energyLoss = Math.floor(elapsedMinutes / 40);

    newSatiety = Math.max(25, newSatiety - satietyLoss);
    newHappiness = Math.max(30, newHappiness - happinessLoss);
    newEnergy = Math.max(20, newEnergy - energyLoss);
  } else {
    // While sleeping, energy recovers +5 every 15 mins up to 100
    const energyGain = Math.floor(elapsedMinutes / 15) * 5;
    newEnergy = Math.min(100, newEnergy + energyGain);
  }

  return {
    ...state,
    cat: {
      ...state.cat,
      satiety: newSatiety,
      happiness: newHappiness,
      energy: newEnergy,
      lastUpdated: now,
    },
  };
}

export class StorageService {
  private static broadcastChannel: BroadcastChannel | null = null;
  private static listeners: Array<(state: AppState) => void> = [];

  public static init() {
    if (typeof window === 'undefined') return;

    if ('BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
        this.broadcastChannel.onmessage = (event) => {
          if (event.data?.type === 'STATE_UPDATED' && event.data.state) {
            this.notifyListeners(event.data.state);
          }
        };
      } catch {
        // Fallback to window storage events
      }
    }

    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          this.notifyListeners(parsed);
        } catch {
          // Ignore json parse error
        }
      }
    });
  }

  public static getState(): AppState {
    if (typeof window === 'undefined') return INITIAL_STATE;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const initial = calculatePassiveCatState(INITIAL_STATE);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        return initial;
      }
      const parsed: AppState = JSON.parse(raw);
      const computed = calculatePassiveCatState(parsed);
      return computed;
    } catch {
      return INITIAL_STATE;
    }
  }

  public static saveState(newState: AppState) {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage({
          type: 'STATE_UPDATED',
          state: newState,
        });
      }
      this.notifyListeners(newState);
    } catch (err) {
      console.error('Failed to save state:', err);
    }
  }

  public static subscribe(callback: (state: AppState) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private static notifyListeners(state: AppState) {
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (err) {
        console.error('Listener callback error:', err);
      }
    });
  }

  // --- Specialized atomic actions ---

  public static feedCat(actorName: string, actorId: string): { success: boolean; message: string } {
    const state = this.getState();

    // Satiety cannot exceed 100
    if (state.cat.satiety >= 100) {
      return { success: false, message: `${state.cat.name} zaten tıka basa tok! :)` };
    }

    const newSatiety = Math.min(100, state.cat.satiety + 15);
    const newPati = state.patiBalance + 10;

    const newLog: CareLogItem = {
      id: `log-${Date.now()}`,
      actorName,
      actorColor: actorId === 'mert' ? '#405d47' : '#785745',
      emoji: '🥣',
      actionText: `${state.cat.name}'ya mama verdi.`,
      timeAgo: 'Az önce',
      timestamp: Date.now(),
      rewardPati: 10,
    };

    const nextState: AppState = {
      ...state,
      patiBalance: newPati,
      cat: {
        ...state.cat,
        satiety: newSatiety,
        lastFedTime: Date.now(),
        lastUpdated: Date.now(),
      },
      careLogs: [newLog, ...state.careLogs.slice(0, 9)],
    };

    this.saveState(nextState);
    return { success: true, message: `${state.cat.name}'ya lezzetli mama verildi! (+15 Tokluk, +10 Pati)` };
  }

  public static petCat(actorName: string, actorId: string): { success: boolean; message: string } {
    const state = this.getState();
    const newHappiness = Math.min(100, state.cat.happiness + 5);

    const nextState: AppState = {
      ...state,
      cat: {
        ...state.cat,
        happiness: newHappiness,
        lastPetTime: Date.now(),
        lastUpdated: Date.now(),
      },
    };

    // Every 5th pet adds a cozy care log
    if (Math.random() > 0.6) {
      const newLog: CareLogItem = {
        id: `log-${Date.now()}`,
        actorName,
        actorColor: actorId === 'mert' ? '#405d47' : '#785745',
        emoji: '🐾',
        actionText: `${state.cat.name}'yu sevdi ve taradı.`,
        timeAgo: 'Az önce',
        timestamp: Date.now(),
      };
      nextState.careLogs = [newLog, ...state.careLogs.slice(0, 9)];
    }

    this.saveState(nextState);
    return { success: true, message: 'Mırr... ✨ (+5 Mutluluk)' };
  }

  public static toggleSleepCat(): { isSleeping: boolean; message: string } {
    const state = this.getState();
    const isSleeping = !state.cat.isSleeping;

    const nextState: AppState = {
      ...state,
      cat: {
        ...state.cat,
        isSleeping,
        lastUpdated: Date.now(),
      },
    };

    this.saveState(nextState);
    return {
      isSleeping,
      message: isSleeping
        ? `${state.cat.name} uyku moduna geçti. Zzz...`
        : `${state.cat.name} esneyerek uyandı!`,
    };
  }

  public static addNote(note: Omit<NoteItem, 'id' | 'createdAt' | 'reactions'>): NoteItem {
    const state = this.getState();
    const newNote: NoteItem = {
      ...note,
      id: `note-${Date.now()}`,
      createdAt: Date.now(),
      reactions: [],
    };

    const nextState: AppState = {
      ...state,
      notes: [newNote, ...state.notes],
    };

    this.saveState(nextState);
    return newNote;
  }

  public static updateNote(noteId: string, updates: Partial<NoteItem>): boolean {
    const state = this.getState();
    const noteIndex = state.notes.findIndex((n) => n.id === noteId);
    if (noteIndex === -1) return false;

    const updatedNotes = [...state.notes];
    updatedNotes[noteIndex] = {
      ...updatedNotes[noteIndex],
      ...updates,
    };

    this.saveState({
      ...state,
      notes: updatedNotes,
    });
    return true;
  }

  public static deleteNote(noteId: string): boolean {
    const state = this.getState();
    const nextNotes = state.notes.filter((n) => n.id !== noteId);
    this.saveState({
      ...state,
      notes: nextNotes,
    });
    return true;
  }

  public static toggleNoteReaction(noteId: string, emoji: '😄' | '👀' | '🐾' | '☕', userId: string) {
    const state = this.getState();
    const note = state.notes.find((n) => n.id === noteId);
    if (!note) return;

    const existingReaction = note.reactions.find((r) => r.emoji === emoji);
    let updatedReactions = [...note.reactions];

    if (existingReaction) {
      if (existingReaction.users.includes(userId)) {
        // Remove user
        const newUsers = existingReaction.users.filter((id) => id !== userId);
        if (newUsers.length === 0) {
          updatedReactions = updatedReactions.filter((r) => r.emoji !== emoji);
        } else {
          updatedReactions = updatedReactions.map((r) =>
            r.emoji === emoji ? { ...r, users: newUsers } : r
          );
        }
      } else {
        // Add user
        updatedReactions = updatedReactions.map((r) =>
          r.emoji === emoji ? { ...r, users: [...r.users, userId] } : r
        );
      }
    } else {
      // Add new reaction entry
      updatedReactions.push({ emoji, users: [userId] });
    }

    this.updateNote(noteId, { reactions: updatedReactions });
  }

  public static togglePinNote(noteId: string) {
    const state = this.getState();
    const note = state.notes.find((n) => n.id === noteId);
    if (!note) return;
    this.updateNote(noteId, { isPinned: !note.isPinned });
  }

  public static addWishlistItem(item: Omit<WishlistItem, 'id' | 'createdAt' | 'isCompleted' | 'likes'>): WishlistItem {
    const state = this.getState();
    const newItem: WishlistItem = {
      ...item,
      id: `wish-${Date.now()}`,
      createdAt: Date.now(),
      isCompleted: false,
      likes: [],
    };

    this.saveState({
      ...state,
      wishlist: [newItem, ...state.wishlist],
    });
    return newItem;
  }

  public static toggleWishlistCompleted(itemId: string) {
    const state = this.getState();
    const item = state.wishlist.find((w) => w.id === itemId);
    if (!item) return;

    const nextWishlist = state.wishlist.map((w) => {
      if (w.id === itemId) {
        return {
          ...w,
          isCompleted: !w.isCompleted,
          completedAt: !w.isCompleted ? Date.now() : undefined,
        };
      }
      return w;
    });

    this.saveState({
      ...state,
      wishlist: nextWishlist,
    });
  }

  public static deleteWishlistItem(itemId: string) {
    const state = this.getState();
    this.saveState({
      ...state,
      wishlist: state.wishlist.filter((w) => w.id !== itemId),
    });
  }

  public static toggleWishlistLike(itemId: string, userId: string) {
    const state = this.getState();
    const nextWishlist = state.wishlist.map((w) => {
      if (w.id === itemId) {
        const hasLiked = w.likes.includes(userId);
        return {
          ...w,
          likes: hasLiked ? w.likes.filter((id) => id !== userId) : [...w.likes, userId],
        };
      }
      return w;
    });

    this.saveState({
      ...state,
      wishlist: nextWishlist,
    });
  }

  public static buyShopItem(itemId: string): { success: boolean; message: string } {
    const state = this.getState();
    const item = state.shopItems.find((i) => i.id === itemId);

    if (!item) return { success: false, message: 'Eşya bulunamadı.' };
    if (item.isOwned) return { success: false, message: 'Bu eşyaya zaten sahipsiniz.' };
    if (state.patiBalance < item.price) {
      return { success: false, message: `Yetersiz bakiye! (${item.price - state.patiBalance} pati eksik)` };
    }

    const newBalance = state.patiBalance - item.price;
    const nextShopItems = state.shopItems.map((i) => {
      if (i.id === itemId) {
        return {
          ...i,
          isOwned: true,
          isPlaced: true,
          badge: 'Odada Aktif',
        };
      }
      return i;
    });

    const nextState: AppState = {
      ...state,
      patiBalance: newBalance,
      shopItems: nextShopItems,
    };

    this.saveState(nextState);
    return {
      success: true,
      message: `${item.name} satın alındı ve odaya eklendi! ✨`,
    };
  }

  public static placeShopItem(itemId: string): { success: boolean; message: string } {
    const state = this.getState();
    const item = state.shopItems.find((i) => i.id === itemId);
    if (!item || !item.isOwned) return { success: false, message: 'Bu eşyaya henüz sahip değilsiniz.' };

    const nextShopItems = state.shopItems.map((i) => {
      if (i.id === itemId) {
        return { ...i, isPlaced: true, badge: 'Odada Aktif' };
      }
      return i;
    });

    this.saveState({
      ...state,
      shopItems: nextShopItems,
    });
    return { success: true, message: `${item.name} odaya yerleştirildi! ✨` };
  }

  public static recordMiniGameReward(score: number, patiReward: number): { success: boolean; patiEarned: number } {
    const state = this.getState();
    const clampedReward = Math.min(20, Math.max(5, patiReward)); // Prevent client abuse

    const newBalance = state.patiBalance + clampedReward;
    const newHappiness = Math.min(100, state.cat.happiness + 15);
    const newEnergy = Math.max(10, state.cat.energy - 10);

    const newLog: CareLogItem = {
      id: `log-${Date.now()}`,
      actorName: state.currentUserId === 'mert' ? 'Mert' : 'Selin',
      actorColor: state.currentUserId === 'mert' ? '#405d47' : '#785745',
      emoji: '🧶',
      actionText: `${state.cat.name} ile mini oyun oynadı (Skor: ${score}).`,
      timeAgo: 'Az önce',
      timestamp: Date.now(),
      rewardPati: clampedReward,
    };

    this.saveState({
      ...state,
      patiBalance: newBalance,
      cat: {
        ...state.cat,
        happiness: newHappiness,
        energy: newEnergy,
        lastUpdated: Date.now(),
      },
      careLogs: [newLog, ...state.careLogs.slice(0, 9)],
    });

    return { success: true, patiEarned: clampedReward };
  }

  public static switchUser(userId: string) {
    const state = this.getState();
    this.saveState({
      ...state,
      currentUserId: userId,
    });
  }

  public static updateSettings(partial: Partial<AppState['settings']>) {
    const state = this.getState();
    this.saveState({
      ...state,
      settings: {
        ...state.settings,
        ...partial,
      },
    });
  }

  public static resetToDemoDefault() {
    this.saveState(INITIAL_STATE);
  }
}
