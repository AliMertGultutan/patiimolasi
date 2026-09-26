import React, { useState } from 'react';
import { CatBehaviorState, RenderMode, RoomTarget } from './types';

interface DevAnimationPanelProps {
  renderMode: RenderMode;
  onSetRenderMode: (mode: RenderMode) => void;
  currentState: CatBehaviorState;
  onTriggerState: (state: CatBehaviorState, target?: RoomTarget) => void;
  isBusy: boolean;
  reducedMotion: boolean;
  onToggleReducedMotion: () => void;
  currentCoord: { x: number; y: number };
}

export const DevAnimationPanel: React.FC<DevAnimationPanelProps> = ({
  renderMode,
  onSetRenderMode,
  currentState,
  onTriggerState,
  isBusy,
  reducedMotion,
  onToggleReducedMotion,
  currentCoord,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-16 md:bottom-6 left-4 z-50">
      {/* Trigger Pill */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 bg-inverse-surface/85 backdrop-blur-md text-inverse-on-surface hover:bg-inverse-surface text-xs font-label font-bold px-3 py-1.5 rounded-full shadow-lg border border-white/10 transition-all opacity-85 hover:opacity-100"
          title="Animasyon ve Durum Geliştirici Paneli"
        >
          <span className="material-symbols-outlined text-[15px] text-secondary-fixed">
            animation
          </span>
          <span>Animasyon Test Paneli</span>
        </button>
      )}

      {/* Expanded Panel */}
      {isOpen && (
        <div className="bg-surface-container-lowest border border-surface-container shadow-2xl rounded-2xl p-4 w-80 text-xs font-body flex flex-col gap-3 animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between border-b border-surface-container pb-2">
            <div className="flex items-center gap-1.5 font-label font-bold text-on-surface">
              <span className="material-symbols-outlined text-primary text-[17px]">science</span>
              <span>Kedi Animasyon Test Paneli</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-6 h-6 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="flex flex-col gap-1.5 bg-surface-container-low p-2 rounded-xl">
            <span className="font-label font-semibold text-[11px] text-on-surface-variant">
              Kedi Render Modu:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => onSetRenderMode('original')}
                className={`py-1.5 px-2 rounded-lg font-label text-[11px] font-bold transition-all border ${
                  renderMode === 'original'
                    ? 'bg-primary-container text-on-primary border-primary-container shadow-xs'
                    : 'bg-surface-container-lowest text-on-surface border-surface-container hover:bg-surface-container'
                }`}
              >
                Orijinal Resim
              </button>
              <button
                type="button"
                onClick={() => onSetRenderMode('modular-svg')}
                className={`py-1.5 px-2 rounded-lg font-label text-[11px] font-bold transition-all border ${
                  renderMode === 'modular-svg'
                    ? 'bg-primary-container text-on-primary border-primary-container shadow-xs'
                    : 'bg-surface-container-lowest text-on-surface border-surface-container hover:bg-surface-container'
                }`}
              >
                Modüler SVG (Canlı)
              </button>
            </div>
          </div>

          {/* State Inspector */}
          <div className="p-2 rounded-xl bg-surface-container text-[11px] flex flex-col gap-1 font-label">
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant">Mevcut Durum:</span>
              <span className="font-bold text-primary uppercase">{currentState}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant">Konum (X, Y):</span>
              <span className="font-bold text-on-surface">
                %{Math.round(currentCoord.x)}, %{Math.round(currentCoord.y)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant">Meşgul mü?:</span>
              <span className={`font-bold ${isBusy ? 'text-secondary' : 'text-primary'}`}>
                {isBusy ? 'Evet' : 'Hayır (Boşta)'}
              </span>
            </div>
          </div>

          {/* Direct State Test Triggers (Sandbox mode - NO real reward or coin mutation) */}
          <div className="flex flex-col gap-1.5">
            <span className="font-label font-semibold text-[11px] text-on-surface-variant">
              Durum Tetikleyicileri (Test / Sandbox):
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => onTriggerState('idle', 'rug')}
                className="py-1 px-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label text-[11px] text-left flex items-center justify-between"
              >
                <span>Idle (Halı)</span>
                <span>🐾</span>
              </button>

              <button
                type="button"
                onClick={() => onTriggerState('walking', 'bowl')}
                className="py-1 px-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label text-[11px] text-left flex items-center justify-between"
              >
                <span>Yürü (Kaba)</span>
                <span>🚶</span>
              </button>

              <button
                type="button"
                onClick={() => onTriggerState('eating', 'bowl')}
                className="py-1 px-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label text-[11px] text-left flex items-center justify-between"
              >
                <span>Yemek Ye</span>
                <span>🥣</span>
              </button>

              <button
                type="button"
                onClick={() => onTriggerState('beingPetted', 'rug')}
                className="py-1 px-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label text-[11px] text-left flex items-center justify-between"
              >
                <span>Sevilme Tepkisi</span>
                <span>✨</span>
              </button>

              <button
                type="button"
                onClick={() => onTriggerState('fallingAsleep', 'cushion')}
                className="py-1 px-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label text-[11px] text-left flex items-center justify-between"
              >
                <span>Mindere Git &amp; Yat</span>
                <span>💤</span>
              </button>

              <button
                type="button"
                onClick={() => onTriggerState('wakingUp', 'rug')}
                className="py-1 px-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label text-[11px] text-left flex items-center justify-between"
              >
                <span>Uyan &amp; Gerin</span>
                <span>☀️</span>
              </button>

              <button
                type="button"
                onClick={() => onTriggerState('playing', 'play')}
                className="py-1 px-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label text-[11px] text-left flex items-center justify-between"
              >
                <span>Oyna (Yumak)</span>
                <span>🧶</span>
              </button>

              <button
                type="button"
                onClick={onToggleReducedMotion}
                className="py-1 px-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-label text-[11px] text-left flex items-center justify-between"
              >
                <span>Hareketi Azalt</span>
                <span>{reducedMotion ? 'Açık' : 'Kapalı'}</span>
              </button>
            </div>
          </div>

          <div className="text-[10px] text-outline border-t border-surface-container pt-1.5 leading-snug">
            *Test butonları puan/bakiye değiştirmez; animasyonları izole test etmeyi sağlar.
          </div>
        </div>
      )}
    </div>
  );
};
