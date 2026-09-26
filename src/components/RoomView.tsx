import React, { useState, useEffect, useRef } from 'react';
import { ActiveTab, AppState, UserProfile } from '../types';
import { StorageService } from '../services/storage';
import { MISO_THOUGHTS } from '../constants/initialData';
import { CatBehaviorState, RenderMode, RoomTarget, ROOM_COORDINATES } from './cat/types';
import { CatStateMachine } from './cat/catStateMachine';
import { ModularCatSvg } from './cat/ModularCatSvg';
import { DevAnimationPanel } from './cat/DevAnimationPanel';

interface RoomViewProps {
  state: AppState;
  currentUser: UserProfile;
  otherUser: UserProfile;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenMiniGame: () => void;
  onShowToast: (title: string, subtitle?: string) => void;
}

export const RoomView: React.FC<RoomViewProps> = ({
  state,
  currentUser,
  otherUser,
  setActiveTab,
  onOpenMiniGame,
  onShowToast,
}) => {
  const { cat, notes, wishlist, careLogs, settings } = state;
  const [thoughtIndex, setThoughtIndex] = useState(0);
  const [bowlTooltip, setBowlTooltip] = useState(false);
  const [cushionTooltip, setCushionTooltip] = useState(false);

  // --- Cat Behavioral Finite State Machine (FSM) ---
  const [catState, setCatState] = useState<CatBehaviorState>(
    cat.isSleeping ? 'sleeping' : 'idle'
  );
  const [targetLocation, setTargetLocation] = useState<RoomTarget>(
    cat.isSleeping ? 'cushion' : 'rug'
  );
  const [facing, setFacing] = useState<'left' | 'right'>('right');
  const [catCoords, setCatCoords] = useState<{ x: number; y: number }>(
    cat.isSleeping ? ROOM_COORDINATES.cushion : ROOM_COORDINATES.rug
  );
  const [actionLabel, setActionLabel] = useState<string | null>(null);
  const [renderMode, setRenderMode] = useState<RenderMode>('original');
  const [showPurrBadge, setShowPurrBadge] = useState(false);

  // Active timers tracking for safe teardown
  const sequenceTimersRef = useRef<NodeJS.Timeout[]>([]);

  const clearAllTimers = () => {
    sequenceTimersRef.current.forEach((t) => clearTimeout(t));
    sequenceTimersRef.current = [];
  };

  useEffect(() => {
    return () => clearAllTimers();
  }, []);

  // Sync external sleep state
  useEffect(() => {
    if (cat.isSleeping && catState !== 'sleeping' && catState !== 'fallingAsleep') {
      setCatState('sleeping');
      setTargetLocation('cushion');
      setCatCoords(ROOM_COORDINATES.cushion);
    } else if (!cat.isSleeping && catState === 'sleeping') {
      setCatState('idle');
      setTargetLocation('rug');
      setCatCoords(ROOM_COORDINATES.rug);
    }
  }, [cat.isSleeping]);

  // Pause animations when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearAllTimers();
        if (catState !== 'sleeping') {
          setCatState('idle');
          setTargetLocation('rug');
          setCatCoords(ROOM_COORDINATES.rug);
          setActionLabel(null);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [catState]);

  // Smooth position interpolation to target coordinates
  useEffect(() => {
    const target = ROOM_COORDINATES[targetLocation];
    if (!target) return;

    if (settings.reducedMotion) {
      setCatCoords(target);
      return;
    }

    setCatCoords(target);
  }, [targetLocation, settings.reducedMotion]);

  // Rotate Miso's sweet thoughts every 14 seconds when idle
  useEffect(() => {
    const timer = setInterval(() => {
      if (catState === 'idle') {
        setThoughtIndex((prev) => (prev + 1) % MISO_THOUGHTS.length);
      }
    }, 14000);
    return () => clearInterval(timer);
  }, [catState]);

  const isBusy = CatStateMachine.isBusy(catState);

  // --- End-to-End Care Sequences ---

  // 1. Mama Ver Flow: idle -> walking to bowl -> eating -> update data -> return to rug -> idle
  const handleFeedSequence = () => {
    if (cat.satiety >= 100) {
      onShowToast(`${cat.name} zaten tıka basa tok! 🥣`, 'Mama kabının önünde masumca otursa bile tok :)');
      return;
    }

    if (isBusy || catState === 'sleeping') {
      if (catState === 'sleeping') {
        onShowToast(`${cat.name} şu an derin uykuda 💤`, 'Önce uyandırmalısın.');
      }
      return;
    }

    clearAllTimers();
    setActionLabel('Mama kabına gidiyor...');
    setFacing('right');
    setCatState('walking');
    setTargetLocation('bowl');

    // Step 2: Arrive at food bowl & start eating
    const t1 = setTimeout(() => {
      setCatState('eating');
      setActionLabel('Mama yiyor... 🥣');

      // Step 3: Complete eating & perform data mutation
      const t2 = setTimeout(() => {
        const result = StorageService.feedCat(currentUser.name, currentUser.id);
        if (result.success) {
          onShowToast(`${cat.name}'ya mama verildi! 🥣`, '+15 Tokluk • +10 Pati ortak havuzda');
        }

        setActionLabel('Doydu, yerine dönüyor...');
        setFacing('left');
        setCatState('walking');
        setTargetLocation('rug');

        // Step 4: Return to idle on rug
        const t3 = setTimeout(() => {
          setCatState('idle');
          setFacing('right');
          setActionLabel(null);
        }, 1200);
        sequenceTimersRef.current.push(t3);
      }, 2400);
      sequenceTimersRef.current.push(t2);
    }, 1200);
    sequenceTimersRef.current.push(t1);
  };

  // 2. Sev Flow: idle -> beingPetted (sparkles & purr) -> idle
  const handlePetSequence = () => {
    if (isBusy) return;

    clearAllTimers();
    setActionLabel('Seviliyor... ✨');
    setShowPurrBadge(true);
    setCatState('beingPetted');

    StorageService.petCat(currentUser.name, currentUser.id);

    const t1 = setTimeout(() => {
      setShowPurrBadge(false);
      setCatState(cat.isSleeping ? 'sleeping' : 'idle');
      setActionLabel(null);
    }, 1800);
    sequenceTimersRef.current.push(t1);

    onShowToast(`${cat.name} sevildi ✨`, 'Mırr... Mutluluk arttı');
  };

  // 3. Uyut / Uyandır Flow
  const handleToggleSleepSequence = () => {
    if (isBusy) return;

    clearAllTimers();

    if (cat.isSleeping || catState === 'sleeping') {
      // Waking up sequence: wakingUp -> return to rug -> idle
      setActionLabel('Uyanıyor & geriniyor... ☀️');
      setCatState('wakingUp');

      const t1 = setTimeout(() => {
        setFacing('left');
        setCatState('walking');
        setTargetLocation('rug');

        const t2 = setTimeout(() => {
          setCatState('idle');
          setFacing('right');
          setActionLabel(null);
          StorageService.toggleSleepCat();
          onShowToast(`${cat.name} uyandı! ☀️`, 'Enerji toparlandı.');
        }, 1200);
        sequenceTimersRef.current.push(t2);
      }, 1000);
      sequenceTimersRef.current.push(t1);
    } else {
      // Falling asleep sequence: walk to cushion -> fallingAsleep -> sleeping
      setActionLabel('Mindere gidiyor... 💤');
      setFacing('right');
      setCatState('walking');
      setTargetLocation('cushion');

      const t1 = setTimeout(() => {
        setCatState('fallingAsleep');
        setActionLabel('Kıvrılıyor...');

        const t2 = setTimeout(() => {
          setCatState('sleeping');
          setActionLabel(null);
          StorageService.toggleSleepCat();
          onShowToast(`${cat.name} uykuya daldı 💤`, 'Zzz... Dinleniyor.');
        }, 1100);
        sequenceTimersRef.current.push(t2);
      }, 1200);
      sequenceTimersRef.current.push(t1);
    }
  };

  // 4. Oyna Flow
  const handlePlaySequence = () => {
    if (isBusy || catState === 'sleeping') {
      if (catState === 'sleeping') {
        onShowToast(`${cat.name} uyuyor 💤`, 'Önce uyandırmalısın.');
      }
      return;
    }

    clearAllTimers();
    setActionLabel('Oynuyor! 🧶');
    setCatState('playing');
    setTargetLocation('play');

    const t1 = setTimeout(() => {
      onOpenMiniGame();
      const t2 = setTimeout(() => {
        setCatState('idle');
        setTargetLocation('rug');
        setActionLabel(null);
      }, 600);
      sequenceTimersRef.current.push(t2);
    }, 900);
    sequenceTimersRef.current.push(t1);
  };

  // Dev state trigger (for developer testing without data mutation)
  const handleDevTriggerState = (targetState: CatBehaviorState, targetLoc: RoomTarget = 'rug') => {
    clearAllTimers();
    setCatState(targetState);
    setTargetLocation(targetLoc);
    setActionLabel(CatStateMachine.getActionLabel(targetState) || null);
    if (targetLoc === 'bowl') setFacing('right');
    else if (targetLoc === 'play') setFacing('left');
  };

  // Find featured note (pinned first, or first in list)
  const featuredNote = notes.find((n) => n.isPinned) || notes[0];

  // Active wishlist ideas
  const activeIdeas = wishlist.filter((item) => !item.isCompleted).slice(0, 3);

  return (
    <div className="max-w-[1240px] w-full mx-auto px-4 md:px-6 py-4 md:py-6 flex flex-col gap-6">
      {/* Co-presence & Ambience Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-container-low px-4 md:px-6 py-2.5 rounded-xl border border-surface-container shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            <span className="font-label text-xs md:text-sm text-primary font-semibold">
              Oda Sakin
            </span>
          </div>
          <span className="text-outline text-xs">•</span>
          <div className="flex items-center gap-1.5 text-on-surface-variant text-xs md:text-sm">
            <span className="material-symbols-outlined text-[17px] text-primary">wb_sunny</span>
            <span>Öğleden sonra güneşi • 23°C</span>
          </div>
          {actionLabel && (
            <span className="font-label text-xs px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-bold animate-pulse">
              {actionLabel}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-surface-container px-3 py-1 rounded-full shadow-xs">
            <span className="text-on-surface-variant font-medium">{currentUser.name}:</span>
            <span className="text-primary font-bold">Çevrim içi</span>
          </div>
          <div className="flex items-center gap-1.5 bg-secondary-fixed/40 px-3 py-1 rounded-full shadow-xs">
            <span className="text-on-secondary-fixed-variant font-medium">{otherUser.name}:</span>
            <span className="text-secondary font-semibold">Odayı paylaşıyor</span>
          </div>
        </div>
      </div>

      {/* Main Workspace Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT / CENTER: Cat Living Stage (8 Cols) */}
        <section className="lg:col-span-8 flex flex-col gap-4">
          {/* Interactive Room Canvas */}
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] rounded-2xl overflow-hidden shadow-md bg-surface-container-high group select-none border border-surface-container">
            {/* Room Scene Background Illustration */}
            <img
              alt={`${cat.name}'nun Güneşli Odası`}
              className={`w-full h-full object-cover object-center pointer-events-none transition-transform duration-700 ${
                catState === 'sleeping' ? 'brightness-95 contrast-95' : ''
              }`}
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxrtGJoirzsFnMK4oQ93n-PzY2V7nOL8hVxMfICyPuxkBk_DVL7pTSDyaNnhff3M-oERr9Yo-q879Btx4DOsN0HeWg7l-s5wrNHymtSFDCLSWlm2YyYCwIqt4mVSU3D29nmZoA_6g91rxEBd_U_nsh4497tAUd1Rcj8pEyQLSpi3JpOSsIaw0_rSqOhkS33wqnZ_ZJcE1e0-pPWvOTfc2yeqYXWO8DiD2VVwVgaYVRM46tuYIxYOaf"
              referrerPolicy="no-referrer"
            />

            {/* Sunbeam Atmosphere Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-secondary-fixed/15 to-transparent pointer-events-none mix-blend-soft-light" />

            {/* In Modular SVG mode: Soft patch over the static cat on the rug so only the dynamic animated cat is visible */}
            {renderMode === 'modular-svg' && (
              <div
                className="absolute bottom-[23%] left-[39%] sm:left-[43%] w-40 h-28 pointer-events-none rounded-full blur-xs opacity-90 transition-opacity duration-300"
                style={{
                  background: 'radial-gradient(circle, #f3cfbc 45%, #ecbfa9 75%, transparent 100%)',
                }}
              />
            )}

            {/* Miso Interactive Speech Bubble */}
            <div
              onClick={() => setThoughtIndex((prev) => (prev + 1) % MISO_THOUGHTS.length)}
              className="absolute top-[28%] sm:top-[33%] left-[34%] sm:left-[39%] -translate-x-1/2 -translate-y-full z-20 cursor-pointer transition-all duration-300 transform hover:scale-105 active:scale-95"
              title="Miso'nun düşüncesini değiştir"
            >
              <div className="relative bg-surface-container-lowest text-on-surface px-4 py-2.5 rounded-2xl shadow-md border border-surface-container flex items-center gap-2 max-w-[220px] sm:max-w-[280px]">
                <span className="text-sm leading-none shrink-0">🐾</span>
                <p className="font-label text-xs sm:text-sm text-on-surface font-medium leading-snug">
                  "{MISO_THOUGHTS[thoughtIndex]}"
                </p>
                <div className="absolute -bottom-1.5 left-7 w-3 h-3 bg-surface-container-lowest border-r border-b border-surface-container transform rotate-45" />
              </div>
            </div>

            {/* Hotspot 1: Wall Pinboard (Mantar Pano) */}
            <button
              onClick={() => setActiveTab('notlar')}
              className="absolute top-[4%] right-[30%] sm:right-[33%] z-20 p-2 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm shadow-md hover:scale-110 active:scale-95 transition-transform border border-surface-container"
              title="Notlar Panosunu Aç"
              aria-label="Not panosuna git"
            >
              <span className="material-symbols-outlined text-primary text-[20px]">push_pin</span>
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-secondary text-on-secondary font-label text-[10px] font-bold leading-none shadow-xs">
                {notes.length}
              </span>
            </button>

            {/* Hotspot 2: Miso's Food Bowl */}
            <div
              className="absolute bottom-[16%] right-[22%] sm:right-[25%] z-20 cursor-pointer"
              onMouseEnter={() => setBowlTooltip(true)}
              onMouseLeave={() => setBowlTooltip(false)}
              onClick={handleFeedSequence}
              title="Mama Kabı (Tıkla ve besle)"
            >
              <div className={`relative flex items-center justify-center w-9 h-9 rounded-full bg-surface-container-lowest/80 backdrop-blur-sm shadow-md hover:scale-110 active:scale-95 transition-all border border-surface-container ${
                catState === 'eating' ? 'ring-2 ring-primary animate-pulse scale-110' : ''
              }`}>
                <span className="text-sm leading-none">🥣</span>
              </div>
              {bowlTooltip && (
                <div className="absolute bottom-11 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface px-2.5 py-1 rounded-lg text-xs whitespace-nowrap shadow-md pointer-events-none z-30 font-label">
                  Mama Kabı: %{cat.satiety} Dolu (Beslemek için tıkla)
                </div>
              )}
            </div>

            {/* Hotspot 3: Sage Cushion */}
            <div
              className="absolute bottom-[20%] right-[5%] sm:right-[7%] z-20 cursor-pointer"
              onMouseEnter={() => setCushionTooltip(true)}
              onMouseLeave={() => setCushionTooltip(false)}
              onClick={handleToggleSleepSequence}
              title="Minder (Uyut/Uyandır)"
            >
              <div className={`relative flex items-center justify-center w-9 h-9 rounded-full bg-surface-container-lowest/80 backdrop-blur-sm shadow-md hover:scale-110 active:scale-95 transition-all border border-surface-container ${
                catState === 'sleeping' ? 'ring-2 ring-secondary' : ''
              }`}>
                <span className="material-symbols-outlined text-primary text-[19px]">bed</span>
              </div>
              {cushionTooltip && (
                <div className="absolute bottom-11 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface px-2.5 py-1 rounded-lg text-xs whitespace-nowrap shadow-md pointer-events-none z-30 font-label">
                  {catState === 'sleeping' ? `${cat.name} uyuyor (Uyandırmak için tıkla)` : `${cat.name}'nun favori minderi`}
                </div>
              )}
            </div>

            {/* DYNAMIC CAT ACTOR LAYER */}
            {renderMode === 'modular-svg' ? (
              // B: Modular SVG Cat Actor with Dynamic Interpolated Coordinates
              <div
                style={{
                  position: 'absolute',
                  left: `${catCoords.x}%`,
                  top: `${catCoords.y}%`,
                  transform: 'translate(-50%, -70%)',
                  transition: settings.reducedMotion
                    ? 'none'
                    : 'left 1.2s cubic-bezier(0.4, 0, 0.2, 1), top 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  zIndex: 25,
                }}
              >
                <ModularCatSvg
                  state={catState}
                  facing={facing}
                  reducedMotion={settings.reducedMotion}
                  onClick={handlePetSequence}
                />
              </div>
            ) : (
              // A: Original Painting Interaction Area (Invisible hitbox with responsive feedback)
              <>
                <button
                  onClick={handlePetSequence}
                  aria-label={`${cat.name}'yu sev`}
                  className="absolute bottom-[22%] left-[37%] sm:left-[41%] w-40 h-28 z-10 cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  type="button"
                >
                  <span className="sr-only">{cat.name}'yu sev</span>
                </button>

                {/* Subtle Breathing for Original Image */}
                <div
                  className={`absolute bottom-[20%] left-[37%] sm:left-[41%] w-44 h-32 pointer-events-none ${
                    !settings.reducedMotion && catState !== 'sleeping' ? 'animate-cat-breathe' : ''
                  }`}
                />
              </>
            )}

            {/* Floating Purr / Sparkle Feedback */}
            <div
              className={`absolute bottom-[44%] left-[46%] pointer-events-none transition-all duration-500 transform z-30 flex items-center gap-1.5 bg-surface-container-lowest/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-primary/20 text-primary font-label text-xs sm:text-sm font-bold ${
                showPurrBadge ? 'opacity-100 -translate-y-4 scale-105' : 'opacity-0 translate-y-2 scale-95'
              }`}
            >
              <span>✨</span>
              <span>Mırr... (+5 Mutluluk)</span>
            </div>

            {/* Ambient Room Status Tag */}
            <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 bg-surface-container-lowest/90 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-sm border border-surface-container">
              <span
                className={`w-2 h-2 rounded-full ${
                  catState === 'sleeping' ? 'bg-secondary' : 'bg-primary animate-pulse'
                }`}
              />
              <span className="font-label text-xs sm:text-sm text-on-surface font-bold">
                {cat.name}
              </span>
              <span className="font-body text-xs text-on-surface-variant">
                • {actionLabel || (catState === 'sleeping' ? 'Zzz Huzurla uyuyor' : 'Güneşleniyor')}
              </span>
            </div>
          </div>

          {/* Cat Vitals & Meter Bars */}
          <div className="bg-surface-container-lowest p-4 md:p-5 rounded-2xl border border-surface-container shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Tokluk (Satiety) */}
            <div className="flex-1 w-full flex flex-col gap-1.5">
              <div className="flex items-center justify-between font-label text-xs md:text-sm">
                <span className="flex items-center gap-1.5 text-on-surface font-semibold">
                  <span>🥣</span> Tokluk
                </span>
                <span className="text-primary font-bold">{cat.satiety}%</span>
              </div>
              <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-container rounded-full transition-all duration-500"
                  style={{ width: `${cat.satiety}%` }}
                />
              </div>
            </div>

            <div className="hidden sm:block w-px h-8 bg-surface-container" />

            {/* Mutluluk (Happiness) */}
            <div className="flex-1 w-full flex flex-col gap-1.5">
              <div className="flex items-center justify-between font-label text-xs md:text-sm">
                <span className="flex items-center gap-1.5 text-on-surface font-semibold">
                  <span>🌿</span> Mutluluk
                </span>
                <span className="text-secondary font-bold">{cat.happiness}%</span>
              </div>
              <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden">
                <div
                  className="h-full bg-secondary-fixed-dim rounded-full transition-all duration-500"
                  style={{ width: `${cat.happiness}%` }}
                />
              </div>
            </div>

            <div className="hidden sm:block w-px h-8 bg-surface-container" />

            {/* Enerji (Energy) */}
            <div className="flex-1 w-full flex flex-col gap-1.5">
              <div className="flex items-center justify-between font-label text-xs md:text-sm">
                <span className="flex items-center gap-1.5 text-on-surface font-semibold">
                  <span>⚡</span> Enerji
                </span>
                <span className="text-primary font-bold">{cat.energy}%</span>
              </div>
              <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-fixed-dim rounded-full transition-all duration-500"
                  style={{ width: `${cat.energy}%` }}
                />
              </div>
            </div>
          </div>

          {/* Primary Care Action Tray */}
          <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-container shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-label text-xs md:text-sm text-on-surface-variant font-bold">
                Birlikte Bakım Eylemleri
              </span>
              <span className="font-label text-xs text-outline">
                {isBusy ? 'İşlem sürüyor...' : 'Günde bir tık yeterli'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Mama Ver Action */}
              <button
                onClick={handleFeedSequence}
                disabled={isBusy}
                type="button"
                className={`group relative flex flex-col items-center justify-center py-3.5 px-3 rounded-xl shadow-[0_4px_0_#304d38] active:translate-y-[2px] active:shadow-[0_2px_0_#304d38] transition-all ${
                  catState === 'eating'
                    ? 'bg-primary text-on-primary ring-2 ring-primary-container'
                    : 'bg-primary-container text-on-primary'
                }`}
              >
                <span className="text-2xl mb-1">🥣</span>
                <span className="font-label text-sm font-bold">
                  {catState === 'eating' ? 'Mama Yiyor...' : 'Mama Ver'}
                </span>
                <span className="font-label text-[11px] text-on-primary-container opacity-90 mt-0.5">
                  +15 Tokluk
                </span>
              </button>

              {/* Sev Action */}
              <button
                onClick={handlePetSequence}
                disabled={isBusy}
                type="button"
                className={`group relative flex flex-col items-center justify-center py-3.5 px-3 bg-surface-container-lowest text-on-surface rounded-xl shadow-xs border border-surface-container hover:bg-surface-container active:translate-y-0.5 transition-all ${
                  catState === 'beingPetted' ? 'ring-2 ring-secondary bg-secondary-fixed/30' : ''
                }`}
              >
                <span className="text-2xl mb-1">🐾</span>
                <span className="font-label text-sm font-bold">
                  {catState === 'beingPetted' ? 'Seviliyor...' : 'Sev'}
                </span>
                <span className="font-label text-[11px] text-secondary font-medium mt-0.5">
                  +5 Mutluluk
                </span>
              </button>

              {/* Oyna Action */}
              <button
                onClick={handlePlaySequence}
                disabled={isBusy}
                type="button"
                className={`group relative flex flex-col items-center justify-center py-3.5 px-3 bg-surface-container-lowest text-on-surface rounded-xl shadow-xs border border-surface-container hover:bg-surface-container active:translate-y-0.5 transition-all ${
                  catState === 'playing' ? 'ring-2 ring-primary bg-primary-fixed/30' : ''
                }`}
              >
                <span className="text-2xl mb-1">🧶</span>
                <span className="font-label text-sm font-bold">
                  {catState === 'playing' ? 'Oynuyor...' : 'Oyna'}
                </span>
                <span className="font-label text-[11px] text-primary font-medium mt-0.5">
                  Mini Oyun
                </span>
              </button>

              {/* Uyut / Uyandır Action */}
              <button
                onClick={handleToggleSleepSequence}
                disabled={isBusy}
                type="button"
                className={`group relative flex flex-col items-center justify-center py-3.5 px-3 rounded-xl shadow-xs border transition-all active:translate-y-0.5 ${
                  catState === 'sleeping'
                    ? 'bg-secondary-fixed text-on-secondary-fixed border-secondary-fixed-dim'
                    : 'bg-surface-container-lowest text-on-surface border-surface-container hover:bg-surface-container'
                }`}
              >
                <span className="text-2xl mb-1">{catState === 'sleeping' ? '☀️' : '💤'}</span>
                <span className="font-label text-sm font-bold">
                  {catState === 'sleeping' ? 'Uyandır' : 'Uyut'}
                </span>
                <span className="font-label text-[11px] text-outline mt-0.5">
                  {catState === 'sleeping' ? 'Enerji toparlandı' : 'Zzz Dinlenme'}
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* RIGHT / SIDEBAR: Companion Feed & Fast Access (4 Cols) */}
        <aside className="lg:col-span-4 flex flex-col gap-4">
          {/* Pinned Note Preview Card */}
          {featuredNote && (
            <div className="relative bg-surface-container-lowest p-4 rounded-2xl border border-surface-container shadow-xs flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary text-[18px]">push_pin</span>
                  <span className="font-headline text-sm font-bold text-on-surface">Günün Notu</span>
                </div>
                <button
                  onClick={() => setActiveTab('notlar')}
                  className="font-label text-xs text-primary hover:underline flex items-center gap-0.5"
                >
                  Tümü <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                </button>
              </div>

              <div
                style={{ backgroundColor: featuredNote.color }}
                className="p-3.5 rounded-xl border border-surface-container/60 flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{featuredNote.authorEmoji}</span>
                    <span className="font-label text-xs font-bold text-on-surface">
                      {featuredNote.authorName}
                    </span>
                  </div>
                  {featuredNote.tag && (
                    <span className="font-label text-[10px] px-2 py-0.5 rounded-md bg-surface-container-highest/60 text-primary font-semibold">
                      {featuredNote.tag}
                    </span>
                  )}
                </div>

                <h4 className="font-headline text-sm text-on-surface font-bold">
                  {featuredNote.title}
                </h4>
                <p className="font-body text-xs text-on-surface-variant leading-relaxed line-clamp-2">
                  {featuredNote.body}
                </p>

                {/* Quick Reaction Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 mt-1 border-t border-black/5">
                  {(['😄', '👀', '🐾', '☕'] as const).map((emoji) => {
                    const reaction = featuredNote.reactions.find((r) => r.emoji === emoji);
                    const count = reaction ? reaction.users.length : 0;
                    const hasReacted = reaction?.users.includes(currentUser.id);

                    return (
                      <button
                        key={emoji}
                        onClick={() => StorageService.toggleNoteReaction(featuredNote.id, emoji, currentUser.id)}
                        className={`px-2 py-0.5 rounded-full text-xs font-label flex items-center gap-1 transition-all active:scale-95 ${
                          hasReacted
                            ? 'bg-secondary-fixed text-on-secondary-fixed font-bold shadow-xs'
                            : 'bg-surface-container-lowest/80 text-on-surface hover:bg-surface-bright'
                        }`}
                      >
                        <span>{emoji}</span>
                        {count > 0 && <span className="text-[10px]">{count}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Bakım Günlüğü (Recent Care Feed) */}
          <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container shadow-xs flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[19px]">history</span>
                <span className="font-headline text-sm font-bold text-on-surface">Bakım Günlüğü</span>
              </div>
              <span className="font-label text-[11px] text-outline">Bugün</span>
            </div>

            <div className="flex flex-col gap-2">
              {careLogs.slice(0, 3).map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-2.5 p-1.5 rounded-lg hover:bg-surface-container-low transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-primary-fixed/60 flex items-center justify-center text-on-primary-fixed text-xs shrink-0 mt-0.5">
                    {log.emoji}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-body text-xs text-on-surface leading-tight">
                      <strong className="font-bold text-primary">{log.actorName}</strong> {log.actionText}
                    </span>
                    <span className="font-label text-[10px] text-on-surface-variant">
                      {log.timeAgo} {log.rewardPati ? `• +${log.rewardPati} Pati` : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bir Ara Yapalım Wishlist Sneak Peek */}
          <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container shadow-xs flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-[19px]">checklist</span>
                <span className="font-headline text-sm font-bold text-on-surface">Bir Ara Yapalım</span>
              </div>
              <button
                onClick={() => setActiveTab('bir-ara-yapalim')}
                className="font-label text-xs text-primary hover:underline"
              >
                {activeIdeas.length} öneri →
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              {activeIdeas.map((idea) => (
                <div
                  key={idea.id}
                  onClick={() => setActiveTab('bir-ara-yapalim')}
                  className="flex items-center justify-between p-2 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="text-xs shrink-0">
                      {idea.category === 'film' && '🎬'}
                      {idea.category === 'kahve' && '☕'}
                      {idea.category === 'oyun' && '🎮'}
                      {idea.category === 'diger' && '🌱'}
                    </span>
                    <span className="font-body text-xs text-on-surface truncate">{idea.title}</span>
                  </div>
                  <span className="font-label text-[10px] px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-semibold shrink-0">
                    {idea.authorName}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Mini-Game Launcher Card */}
          <div className="bg-gradient-to-br from-surface-container-high to-surface-container-low p-4 rounded-2xl border border-surface-container shadow-xs flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-1 font-label text-sm text-primary font-bold">
                <span>🧶</span>
                <span>Oyuncağı Yakala</span>
              </div>
              <p className="font-body text-xs text-on-surface-variant mt-0.5">
                20 saniyelik mola verip +15 Pati kazan.
              </p>
            </div>
            <button
              onClick={handlePlaySequence}
              type="button"
              className="px-4 py-2 bg-primary text-on-primary rounded-xl font-label text-xs font-bold shadow-md hover:bg-primary-container active:scale-95 transition-all shrink-0"
            >
              Başlat
            </button>
          </div>
        </aside>
      </div>

      {/* Dev Animation Test Panel (Discreet floating development preview tool) */}
      <DevAnimationPanel
        renderMode={renderMode}
        onSetRenderMode={setRenderMode}
        currentState={catState}
        onTriggerState={handleDevTriggerState}
        isBusy={isBusy}
        reducedMotion={settings.reducedMotion}
        onToggleReducedMotion={() =>
          StorageService.updateSettings({ reducedMotion: !settings.reducedMotion })
        }
        currentCoord={catCoords}
      />
    </div>
  );
};
