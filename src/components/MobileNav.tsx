import React from 'react';
import { ActiveTab } from '../types';

interface MobileNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  notesCount: number;
  openIdeasCount: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  setActiveTab,
  notesCount,
  openIdeasCount,
}) => {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-lg border-t border-surface-container py-1 px-2 safe-area-pb shadow-lg"
      aria-label="Mobil Gezinme"
    >
      <div className="grid grid-cols-4 items-center h-14">
        {/* Tab 1: Oda */}
        <button
          onClick={() => setActiveTab('oda')}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 transition-colors rounded-lg ${
            activeTab === 'oda' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
          }`}
          aria-current={activeTab === 'oda' ? 'page' : undefined}
        >
          <span
            className={`material-symbols-outlined text-[22px] ${
              activeTab === 'oda' ? 'font-bold' : ''
            }`}
          >
            cottage
          </span>
          <span className="font-label text-[11px] font-semibold leading-tight">Oda</span>
        </button>

        {/* Tab 2: Notlar */}
        <button
          onClick={() => setActiveTab('notlar')}
          className={`relative min-h-[44px] flex flex-col items-center justify-center gap-0.5 transition-colors rounded-lg ${
            activeTab === 'notlar' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
          }`}
          aria-current={activeTab === 'notlar' ? 'page' : undefined}
        >
          <span className="relative">
            <span
              className={`material-symbols-outlined text-[22px] ${
                activeTab === 'notlar' ? 'font-bold' : ''
              }`}
            >
              push_pin
            </span>
            {notesCount > 0 && (
              <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-secondary" />
            )}
          </span>
          <span className="font-label text-[11px] font-semibold leading-tight">Notlar</span>
        </button>

        {/* Tab 3: Liste (Bir Ara Yapalım) */}
        <button
          onClick={() => setActiveTab('bir-ara-yapalim')}
          className={`relative min-h-[44px] flex flex-col items-center justify-center gap-0.5 transition-colors rounded-lg ${
            activeTab === 'bir-ara-yapalim' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
          }`}
          aria-current={activeTab === 'bir-ara-yapalim' ? 'page' : undefined}
        >
          <span className="relative">
            <span
              className={`material-symbols-outlined text-[22px] ${
                activeTab === 'bir-ara-yapalim' ? 'font-bold' : ''
              }`}
            >
              checklist
            </span>
            {openIdeasCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[9px] font-bold">
                {openIdeasCount}
              </span>
            )}
          </span>
          <span className="font-label text-[11px] font-semibold leading-tight">Liste</span>
        </button>

        {/* Tab 4: Eşyalar */}
        <button
          onClick={() => setActiveTab('esyalar')}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 transition-colors rounded-lg ${
            activeTab === 'esyalar' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
          }`}
          aria-current={activeTab === 'esyalar' ? 'page' : undefined}
        >
          <span
            className={`material-symbols-outlined text-[22px] ${
              activeTab === 'esyalar' ? 'font-bold' : ''
            }`}
          >
            storefront
          </span>
          <span className="font-label text-[11px] font-semibold leading-tight">Eşyalar</span>
        </button>
      </div>
    </nav>
  );
};
