import React from 'react';
import { ActiveTab, UserProfile } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  patiBalance: number;
  currentUser: UserProfile;
  otherUser: UserProfile;
  onSwitchUser: (userId: string) => void;
  onOpenSettings: () => void;
  notesCount: number;
  openIdeasCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  patiBalance,
  currentUser,
  otherUser,
  onSwitchUser,
  onOpenSettings,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-xl border-b border-surface-container shadow-[0_1px_12px_rgba(88,118,94,0.08)]">
      <div className="h-16 md:h-20 max-w-[1240px] mx-auto px-4 md:px-6 flex items-center justify-between gap-2 md:gap-4">
        {/* Left: Brand Zone */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setActiveTab('oda')}
            className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
          >
            {/* Paw Icon */}
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm group-hover:bg-primary-container transition-colors shrink-0">
              <span className="material-symbols-outlined text-[20px] md:text-[22px]">pets</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-base md:text-lg text-primary group-hover:text-primary-container transition-colors tracking-tight leading-tight">
                Pati Molası
              </span>
              <span className="font-label text-[11px] text-on-surface-variant font-medium leading-none">
                iki kişilik oda
              </span>
            </div>
          </button>
        </div>

        {/* Center: Desktop Navigation Bar */}
        <nav
          className="hidden md:flex items-center gap-1 p-1 bg-surface-container-high rounded-full shadow-inner"
          aria-label="Ana Gezinme"
        >
          <button
            onClick={() => setActiveTab('oda')}
            className={`px-4 py-1.5 rounded-full font-label text-sm transition-all flex items-center gap-1.5 ${
              activeTab === 'oda'
                ? 'bg-primary-container text-on-primary font-semibold shadow-[0_2px_6px_rgba(64,93,71,0.25)]'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span>Oda</span>
          </button>

          <button
            onClick={() => setActiveTab('notlar')}
            className={`relative px-4 py-1.5 rounded-full font-label text-sm transition-all flex items-center gap-1.5 ${
              activeTab === 'notlar'
                ? 'bg-primary-container text-on-primary font-semibold shadow-[0_2px_6px_rgba(64,93,71,0.25)]'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span>Notlar</span>
            <span className="w-2 h-2 rounded-full bg-secondary" title="Ortak panoda notlar var" />
          </button>

          <button
            onClick={() => setActiveTab('bir-ara-yapalim')}
            className={`px-4 py-1.5 rounded-full font-label text-sm transition-all flex items-center gap-1.5 ${
              activeTab === 'bir-ara-yapalim'
                ? 'bg-primary-container text-on-primary font-semibold shadow-[0_2px_6px_rgba(64,93,71,0.25)]'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span>Bir Ara Yapalım</span>
          </button>

          <button
            onClick={() => setActiveTab('esyalar')}
            className={`px-4 py-1.5 rounded-full font-label text-sm transition-all flex items-center gap-1.5 ${
              activeTab === 'esyalar'
                ? 'bg-primary-container text-on-primary font-semibold shadow-[0_2px_6px_rgba(64,93,71,0.25)]'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span>Eşyalar</span>
          </button>
        </nav>

        {/* Right: Actions & Co-presence Area */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Subtle Ambient Greeting (Desktop) */}
          <div className="hidden xl:flex flex-col items-end pr-1 text-right">
            <span className="font-label text-[11px] text-on-surface-variant">gün ortası huzuru</span>
            <span className="font-label text-xs text-primary font-semibold">Biraz mola?</span>
          </div>

          {/* Pati Points Currency Pill */}
          <button
            onClick={() => setActiveTab('esyalar')}
            className="flex items-center gap-1.5 bg-secondary-fixed/50 hover:bg-secondary-fixed/70 px-3 py-1 md:py-1.5 rounded-full shadow-xs transition-colors"
            title="Ortak Pati Bakiyesi"
          >
            <span className="text-xs leading-none">🐾</span>
            <span className="font-label text-xs md:text-sm text-on-secondary-fixed font-bold tracking-wide">
              {patiBalance} pati
            </span>
          </button>

          {/* Co-presence Duo Switcher (Switch between Selin and Mert in Demo Mode) */}
          <div
            className="flex items-center bg-surface-container-low px-1 py-1 rounded-full border border-surface-container shadow-xs"
            title="Demo Modu: Karakteri Değiştir (Selin / Mert)"
          >
            <button
              onClick={() => onSwitchUser('selin')}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all ${
                currentUser.id === 'selin'
                  ? 'bg-secondary-fixed text-on-secondary-fixed ring-2 ring-secondary shadow-sm scale-105 font-bold'
                  : 'text-on-surface-variant opacity-60 hover:opacity-100'
              }`}
              title="Selin olarak odayı görüntüle"
            >
              🌿
            </button>
            <div className="w-1.5 h-1.5 mx-0.5 rounded-full bg-outline-variant" />
            <button
              onClick={() => onSwitchUser('mert')}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all ${
                currentUser.id === 'mert'
                  ? 'bg-primary-fixed text-on-primary-fixed ring-2 ring-primary shadow-sm scale-105 font-bold'
                  : 'text-on-surface-variant opacity-60 hover:opacity-100'
              }`}
              title="Mert olarak odayı görüntüle"
            >
              ☕
            </button>
          </div>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors flex items-center justify-center text-on-surface-variant hover:text-on-surface"
            title="Oda ve Uygulama Ayarları"
            aria-label="Ayarlar"
          >
            <span className="material-symbols-outlined text-[19px]">settings</span>
          </button>

          {/* Current User Active Indicator Chip */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 bg-surface-container-high px-2 py-1 rounded-full text-xs font-label font-semibold text-primary hover:bg-surface-container-highest transition-colors"
            title={`${currentUser.name} aktif (Ayarları açmak için tıkla)`}
          >
            <span className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center text-[10px]">
              {currentUser.name[0]}
            </span>
            <span className="hidden sm:inline">{currentUser.name}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
