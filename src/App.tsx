import React, { useState, useEffect } from 'react';
import { ActiveTab, AppState } from './types';
import { StorageService } from './services/storage';
import { USERS } from './constants/initialData';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { RoomView } from './components/RoomView';
import { NotesView } from './components/NotesView';
import { WishlistView } from './components/WishlistView';
import { ShopView } from './components/ShopView';
import { MiniGameModal } from './components/MiniGameModal';
import { SettingsModal } from './components/SettingsModal';
import { Toast, ToastData } from './components/Toast';

export default function App() {
  const [state, setState] = useState<AppState>(() => StorageService.getState());
  const [activeTab, setActiveTab] = useState<ActiveTab>('oda');
  const [isMiniGameOpen, setIsMiniGameOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  useEffect(() => {
    StorageService.init();
    const unsubscribe = StorageService.subscribe((newState) => {
      setState(newState);
    });
    return () => unsubscribe();
  }, []);

  const showToast = (title: string, subtitle?: string) => {
    setToast({
      id: `${Date.now()}`,
      title,
      subtitle,
    });
    setTimeout(() => {
      setToast((curr) => (curr?.title === title ? null : curr));
    }, 4000);
  };

  const currentUser = USERS[state.currentUserId] || USERS.mert;
  const otherUserId = state.currentUserId === 'mert' ? 'selin' : 'mert';
  const otherUser = USERS[otherUserId] || USERS.selin;

  const handleSwitchUser = (userId: string) => {
    StorageService.switchUser(userId);
    const switchedTo = USERS[userId]?.name || userId;
    showToast(`Aktif kullanıcı: ${switchedTo}`, 'Odayı diğer partnerin gözünden görüyorsun.');
  };

  const openIdeasCount = state.wishlist.filter((w) => !w.isCompleted).length;

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        patiBalance={state.patiBalance}
        currentUser={currentUser}
        otherUser={otherUser}
        onSwitchUser={handleSwitchUser}
        onOpenSettings={() => setIsSettingsOpen(true)}
        notesCount={state.notes.length}
        openIdeasCount={openIdeasCount}
      />

      {/* Main Content Area */}
      <main className="w-full pt-16 md:pt-20 flex-1 flex flex-col">
        {activeTab === 'oda' && (
          <RoomView
            state={state}
            currentUser={currentUser}
            otherUser={otherUser}
            setActiveTab={setActiveTab}
            onOpenMiniGame={() => setIsMiniGameOpen(true)}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'notlar' && (
          <NotesView
            notes={state.notes}
            currentUser={currentUser}
            catName={state.settings.catName}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'bir-ara-yapalim' && (
          <WishlistView
            wishlist={state.wishlist}
            currentUser={currentUser}
            otherUser={otherUser}
            setActiveTab={setActiveTab}
            patiBalance={state.patiBalance}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'esyalar' && (
          <ShopView
            items={state.shopItems}
            patiBalance={state.patiBalance}
            currentUser={currentUser}
            otherUser={otherUser}
            catName={state.settings.catName}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Footer matching Stitch Layout */}
      <footer className="w-full bg-surface-container-low border-t border-surface-container mt-auto mb-16 md:mb-0">
        <div className="max-w-[1240px] mx-auto px-4 md:px-6 py-4 md:py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-on-surface-variant text-xs font-label">
          <div className="flex items-center gap-2">
            <span className="text-primary font-bold text-sm">Pati Molası</span>
            <span className="text-outline">• İki kişilik sakin ritim odası</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-on-surface transition-colors"
            >
              Kedi Bakım Rehberi
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-on-surface transition-colors"
            >
              Oda Kuralları
            </button>
            <span className="text-outline-variant">|</span>
            <span className="text-outline">Birlikte büyütülen sevgilerle</span>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notesCount={state.notes.length}
        openIdeasCount={openIdeasCount}
      />

      {/* Mini-Game Modal */}
      <MiniGameModal
        isOpen={isMiniGameOpen}
        onClose={() => setIsMiniGameOpen(false)}
        catName={state.settings.catName}
        onShowToast={showToast}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={state.settings}
        currentUser={currentUser}
        otherUser={otherUser}
        onSwitchUser={handleSwitchUser}
        onShowToast={showToast}
      />

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
