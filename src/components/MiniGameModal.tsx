import React, { useState, useEffect, useRef } from 'react';
import { StorageService } from '../services/storage';

interface MiniGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  catName: string;
  onShowToast: (title: string, subtitle?: string) => void;
}

type GamePhase = 'intro' | 'playing' | 'ended';

export const MiniGameModal: React.FC<MiniGameModalProps> = ({
  isOpen,
  onClose,
  catName,
  onShowToast,
}) => {
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [timeLeft, setTimeLeft] = useState(20);
  const [score, setScore] = useState(0);
  const [yarnPosition, setYarnPosition] = useState({ x: 50, y: 50 });
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [earnedPati, setEarnedPati] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setPhase('intro');
      setTimeLeft(20);
      setScore(0);
      setRewardClaimed(false);
      setEarnedPati(0);
      setYarnPosition({ x: 50, y: 50 });
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isOpen]);

  // Game countdown timer
  useEffect(() => {
    if (phase === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleGameOver();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Periodically reposition yarn automatically every 1.8s if not clicked
      const moveInterval = setInterval(() => {
        moveYarn();
      }, 1800);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
        clearInterval(moveInterval);
      };
    }
  }, [phase]);

  const moveYarn = () => {
    const randomX = Math.floor(Math.random() * 75) + 12; // 12% to 87%
    const randomY = Math.floor(Math.random() * 70) + 15; // 15% to 85%
    setYarnPosition({ x: randomX, y: randomY });
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(20);
    setRewardClaimed(false);
    setPhase('playing');
    moveYarn();
  };

  const handleYarnClick = (e: React.MouseEvent | React.TouchEvent | React.KeyboardEvent) => {
    if (phase !== 'playing') return;
    e.stopPropagation();

    setScore((prev) => prev + 1);
    moveYarn();
  };

  const handleGameOver = () => {
    setPhase('ended');
  };

  // Safe one-time reward processing when game ends
  useEffect(() => {
    if (phase === 'ended' && !rewardClaimed) {
      setRewardClaimed(true);
      const calculatedPati = 15;
      const res = StorageService.recordMiniGameReward(score, calculatedPati);
      setEarnedPati(res.patiEarned);
      onShowToast(`Mini oyun tamamlandı! (+${res.patiEarned} Pati)`, `${catName} neşeyle zıplıyor!`);
    }
  }, [phase, rewardClaimed, score, catName, onShowToast]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest max-w-md w-full rounded-2xl shadow-2xl border border-surface-container p-6 flex flex-col gap-4 animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-surface-container pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧶</span>
            <span className="font-headline font-bold text-lg text-on-surface">
              {catName} ile Oyuncağı Yakala
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors"
            aria-label="Kapat"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Phase 1: Intro */}
        {phase === 'intro' && (
          <div className="flex flex-col gap-4 py-2">
            <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-secondary-fixed/50 flex items-center justify-center text-3xl mb-3 shadow-inner">
                🧶
              </div>
              <h3 className="font-headline font-bold text-base text-on-surface mb-1">
                Nasıl Oynanır?
              </h3>
              <p className="font-body text-xs md:text-sm text-on-surface-variant max-w-xs leading-relaxed">
                20 saniye boyunca oyun alanında hareket eden renkli yumağa dokun veya tıkla. {catName}'yu neşelendir ve ortak oda için +15 Pati kazan!
              </p>
            </div>

            <div className="flex items-center justify-between text-xs font-label text-on-surface-variant px-1">
              <span>⏱️ Süre: 20 saniye</span>
              <span>🐾 Ödül: +15 Pati</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl font-label text-sm text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={startGame}
                className="px-6 py-2 rounded-xl bg-primary text-on-primary font-label font-bold text-sm shadow-[0_4px_0_#304d38] active:translate-y-1 active:shadow-[0_1px_0_#304d38] transition-all flex items-center gap-1.5"
              >
                <span>Oyuna Başla</span>
                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
              </button>
            </div>
          </div>
        )}

        {/* Phase 2: Playing Canvas */}
        {phase === 'playing' && (
          <div className="flex flex-col gap-3">
            {/* Top Indicator Strip */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 bg-primary-fixed/50 px-3 py-1 rounded-full text-xs font-label text-on-primary-fixed font-bold">
                <span className="material-symbols-outlined text-[15px]">timer</span>
                <span>Kalan: {timeLeft}s</span>
              </div>
              <div className="flex items-center gap-1.5 bg-secondary-fixed/50 px-3 py-1 rounded-full text-xs font-label text-on-secondary-fixed font-bold">
                <span>Skor: {score}</span>
              </div>
            </div>

            {/* Interactive Playground Box */}
            <div
              ref={containerRef}
              className="relative w-full h-56 bg-surface-container-high rounded-xl overflow-hidden border border-surface-container select-none touch-none cursor-crosshair shadow-inner"
            >
              {/* Floor Pattern Texture */}
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#405d47_1px,transparent_1px)] [background-size:16px_16px]" />

              {/* Bouncing / Target Yarn */}
              <button
                onClick={handleYarnClick}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') handleYarnClick(e);
                }}
                style={{
                  left: `${yarnPosition.x}%`,
                  top: `${yarnPosition.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className="absolute w-12 h-12 rounded-full bg-secondary-fixed hover:bg-secondary-container active:scale-90 text-2xl flex items-center justify-center shadow-lg transition-all duration-300 border-2 border-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-secondary animate-bounce"
                title="Yumağı yakala!"
                aria-label="Yumağı yakala"
              >
                🧶
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-outline px-1">
              <span>İpucu: Yumağa tıklayabilir ya da klavyeden Space/Enter basabilirsin.</span>
              <button
                type="button"
                onClick={onClose}
                className="text-error hover:underline"
              >
                Çıkış
              </button>
            </div>
          </div>
        )}

        {/* Phase 3: Results */}
        {phase === 'ended' && (
          <div className="flex flex-col gap-4 py-2 text-center">
            <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center text-3xl mb-2 shadow-xs">
                🏆
              </div>
              <h3 className="font-headline font-bold text-lg text-on-surface">Tebrikler!</h3>
              <p className="font-body text-xs text-on-surface-variant mt-0.5">
                {catName} seninle oynamaktan büyük keyif aldı!
              </p>

              <div className="grid grid-cols-2 gap-3 w-full mt-4">
                <div className="bg-surface-container-lowest p-3 rounded-xl border border-surface-container flex flex-col items-center">
                  <span className="font-label text-xs text-on-surface-variant">Toplanan Yumak</span>
                  <span className="font-display font-bold text-xl text-primary">{score}</span>
                </div>
                <div className="bg-surface-container-lowest p-3 rounded-xl border border-surface-container flex flex-col items-center">
                  <span className="font-label text-xs text-on-surface-variant">Kazanılan Pati</span>
                  <span className="font-display font-bold text-xl text-secondary">
                    +{earnedPati} 🐾
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl font-label text-sm text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                Odaya Dön
              </button>
              <button
                type="button"
                onClick={startGame}
                className="px-5 py-2 rounded-xl bg-primary text-on-primary font-label font-bold text-sm shadow-[0_4px_0_#304d38] active:translate-y-1 active:shadow-[0_1px_0_#304d38] transition-all"
              >
                Tekrar Oyna
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
