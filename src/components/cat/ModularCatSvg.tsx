import React, { useState, useEffect } from 'react';
import { CatBehaviorState } from './types';

interface ModularCatSvgProps {
  state: CatBehaviorState;
  facing?: 'left' | 'right';
  reducedMotion?: boolean;
  className?: string;
  onClick?: () => void;
}

export const ModularCatSvg: React.FC<ModularCatSvgProps> = ({
  state,
  facing = 'right',
  reducedMotion = false,
  className = '',
  onClick,
}) => {
  // Autonomous blinking state (eyes close briefly every 3.5 - 6 seconds when not sleeping)
  const [isBlinking, setIsBlinking] = useState(false);
  // Autonomous ear twitch state (rare, every 8-15 seconds)
  const [earTwitch, setEarTwitch] = useState(false);

  const isSleeping = state === 'sleeping' || state === 'fallingAsleep';

  useEffect(() => {
    if (reducedMotion || isSleeping) return;

    let blinkTimeout: NodeJS.Timeout;
    const scheduleNextBlink = () => {
      const delay = Math.random() * 2500 + 3500; // 3.5s to 6s
      blinkTimeout = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          scheduleNextBlink();
        }, 180);
      }, delay);
    };

    scheduleNextBlink();
    return () => clearTimeout(blinkTimeout);
  }, [reducedMotion, isSleeping]);

  useEffect(() => {
    if (reducedMotion || isSleeping) return;

    let twitchTimeout: NodeJS.Timeout;
    const scheduleNextTwitch = () => {
      const delay = Math.random() * 7000 + 8000; // 8s to 15s
      twitchTimeout = setTimeout(() => {
        setEarTwitch(true);
        setTimeout(() => {
          setEarTwitch(false);
          scheduleNextTwitch();
        }, 400);
      }, delay);
    };

    scheduleNextTwitch();
    return () => clearTimeout(twitchTimeout);
  }, [reducedMotion, isSleeping]);

  // Derived animation styles
  const isWalking = state === 'walking';
  const isEating = state === 'eating';
  const isPetted = state === 'beingPetted';
  const isPlaying = state === 'playing';

  return (
    <div
      onClick={onClick}
      className={`relative inline-block select-none cursor-pointer group ${className}`}
      style={{
        transform: `${facing === 'left' ? 'scaleX(-1)' : 'scaleX(1)'}`,
        transition: 'transform 0.3s ease',
      }}
    >
      <svg
        viewBox="0 0 160 120"
        className="w-36 h-28 sm:w-44 sm:h-32 drop-shadow-md overflow-visible"
        aria-label="Miso Kedi"
      >
        <defs>
          {/* Shadow gradient */}
          <radialGradient id="cat-shadow-gradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2A322D" stopOpacity="0.35" />
            <stop offset="80%" stopColor="#2A322D" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#2A322D" stopOpacity="0" />
          </radialGradient>

          {/* Fur textures & colors */}
          <linearGradient id="miso-body-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFDF9" />
            <stop offset="100%" stopColor="#F6EFE5" />
          </linearGradient>

          <linearGradient id="miso-tabby-patch" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EAA873" />
            <stop offset="100%" stopColor="#D98A4E" />
          </linearGradient>

          <filter id="cozy-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#405D47" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* 1. GROUND SHADOW (Follows contact point) */}
        <ellipse
          cx="80"
          cy="104"
          rx={isPlaying ? '36' : isWalking ? '42' : '48'}
          ry={isPlaying ? '9' : '12'}
          fill="url(#cat-shadow-gradient)"
          className={`transition-all duration-300 ${
            isPlaying && !reducedMotion ? 'opacity-60 scale-90' : 'opacity-100'
          }`}
        />

        {/* MAIN BODY ASSEMBLY GROUP */}
        <g
          className={`transition-transform duration-200 origin-bottom ${
            isWalking && !reducedMotion
              ? 'animate-pulse'
              : isPetted && !reducedMotion
              ? 'scale-105'
              : isPlaying && !reducedMotion
              ? '-translate-y-2'
              : ''
          }`}
          style={{ transformOrigin: '80px 100px' }}
        >
          {/* 2. TAIL (Independent wagging pivot at left hip) */}
          <g
            style={{
              transformOrigin: '40px 88px',
              animation:
                !reducedMotion && (isSleeping || isPetted || isPlaying)
                  ? 'tail-wag 3s ease-in-out infinite'
                  : !reducedMotion
                  ? 'tail-slow 5s ease-in-out infinite'
                  : 'none',
            }}
          >
            {/* Curled Fluffy Tail */}
            <path
              d="M 38 88 C 24 84, 14 74, 18 58 C 20 50, 28 48, 30 54 C 32 64, 28 74, 42 84 Z"
              fill="url(#miso-tabby-patch)"
              stroke="#D98A4E"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* White tip on tail */}
            <path
              d="M 18 58 C 20 50, 28 48, 30 54 C 28 58, 22 62, 18 58 Z"
              fill="#FFFDF9"
            />
          </g>

          {/* 3. BACK PAWS (Tucked beneath) */}
          <ellipse
            cx="48"
            cy="98"
            rx="12"
            ry="6"
            fill="#F0E5D7"
            stroke="#DBCBBA"
            strokeWidth="1"
          />

          {/* 4. MAIN TORSO (Chest breathing pivot) */}
          <g
            style={{
              transformOrigin: '75px 95px',
              animation:
                !reducedMotion && isSleeping
                  ? 'sleep-breathe 3.5s ease-in-out infinite'
                  : !reducedMotion
                  ? 'idle-breathe 4s ease-in-out infinite'
                  : 'none',
            }}
          >
            {/* Main plump cat body egg */}
            <ellipse
              cx="75"
              cy="80"
              rx="44"
              ry="26"
              fill="url(#miso-body-grad)"
              stroke="#E2D4C3"
              strokeWidth="1.5"
            />

            {/* Ginger Tabby Patches on Back */}
            <path
              d="M 50 62 C 58 56, 74 58, 82 66 C 76 72, 62 72, 50 62 Z"
              fill="url(#miso-tabby-patch)"
              opacity="0.95"
            />
            <path
              d="M 68 64 C 74 60, 88 64, 94 72 C 86 76, 76 74, 68 64 Z"
              fill="url(#miso-tabby-patch)"
              opacity="0.9"
            />
            <path
              d="M 42 76 C 46 72, 54 75, 58 80 C 50 84, 44 82, 42 76 Z"
              fill="url(#miso-tabby-patch)"
              opacity="0.85"
            />

            {/* Soft tummy shading highlight */}
            <ellipse cx="78" cy="85" rx="28" ry="16" fill="#FFFDF9" />
          </g>

          {/* 5. FRONT PAWS (Tucked / Walking steps) */}
          <g
            style={{
              transformOrigin: '95px 100px',
              animation: isWalking && !reducedMotion ? 'front-paw-step 0.6s ease-in-out infinite alternate' : 'none',
            }}
          >
            {/* Left front paw */}
            <ellipse
              cx="88"
              cy="99"
              rx="9"
              ry="5"
              fill="#FFFDF9"
              stroke="#DBCBBA"
              strokeWidth="1"
            />
            {/* Right front paw */}
            <ellipse
              cx="102"
              cy="98"
              rx="9"
              ry="5"
              fill="#FFFDF9"
              stroke="#DBCBBA"
              strokeWidth="1"
            />
            {/* Tiny toe marks */}
            <path d="M 86 100 L 86 98 M 89 101 L 89 99 M 100 99 L 100 97 M 103 100 L 103 98" stroke="#D98A4E" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
          </g>

          {/* 6. HEAD ASSEMBLY (Pivot at neck: 105px 65px) */}
          <g
            style={{
              transformOrigin: '105px 65px',
              animation:
                isEating && !reducedMotion
                  ? 'head-eat-munch 0.5s ease-in-out infinite alternate'
                  : isPetted && !reducedMotion
                  ? 'head-nudge 1.5s ease-in-out infinite alternate'
                  : isPlaying && !reducedMotion
                  ? 'head-alert 0.8s ease-in-out infinite alternate'
                  : 'none',
            }}
          >
            {/* EARS */}
            {/* Left Ear */}
            <g
              style={{
                transformOrigin: '94px 44px',
                transform: earTwitch && !reducedMotion ? 'rotate(-10deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            >
              <polygon
                points="90,46 96,28 108,42"
                fill="url(#miso-tabby-patch)"
                stroke="#D98A4E"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <polygon points="93,44 97,33 104,42" fill="#FDD1B9" />
            </g>

            {/* Right Ear */}
            <g
              style={{
                transformOrigin: '124px 44px',
                transform: earTwitch && !reducedMotion ? 'rotate(12deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            >
              <polygon
                points="114,42 126,28 132,46"
                fill="url(#miso-body-grad)"
                stroke="#E2D4C3"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <polygon points="117,42 124,33 129,44" fill="#FDD1B9" />
            </g>

            {/* Head Base Round Shape */}
            <ellipse
              cx="112"
              cy="56"
              rx="22"
              ry="18"
              fill="url(#miso-body-grad)"
              stroke="#E2D4C3"
              strokeWidth="1.5"
            />

            {/* Ginger Patch on Right/Top Head */}
            <path
              d="M 98 44 C 104 38, 118 39, 122 46 C 118 52, 106 50, 98 44 Z"
              fill="url(#miso-tabby-patch)"
              opacity="0.95"
            />

            {/* Cute Cheek Tufts */}
            <path d="M 91 58 L 86 60 L 91 63 Z" fill="#FFFDF9" />
            <path d="M 133 58 L 138 60 L 133 63 Z" fill="#FFFDF9" />

            {/* 7. EYES & EYELIDS */}
            {isSleeping ? (
              // Sleeping closed peaceful smiling crescents
              <g stroke="#785745" strokeWidth="1.8" strokeLinecap="round" fill="none">
                <path d="M 100 56 Q 105 60 110 56" />
                <path d="M 116 56 Q 121 60 126 56" />
              </g>
            ) : isBlinking ? (
              // Brief blink slit
              <g stroke="#785745" strokeWidth="2" strokeLinecap="round" fill="none">
                <path d="M 100 56 L 110 56" />
                <path d="M 116 56 L 126 56" />
              </g>
            ) : (
              // Open alert/cozy smiling eyes
              <g>
                <path
                  d="M 100 55 Q 105 51 110 55 Q 105 59 100 55 Z"
                  fill="#405D47"
                  stroke="#2A322D"
                  strokeWidth="1"
                />
                <circle cx="107" cy="54" r="1.5" fill="#FFFFFF" />

                <path
                  d="M 116 55 Q 121 51 126 55 Q 121 59 116 55 Z"
                  fill="#405D47"
                  stroke="#2A322D"
                  strokeWidth="1"
                />
                <circle cx="123" cy="54" r="1.5" fill="#FFFFFF" />
              </g>
            )}

            {/* Nose & Mouth */}
            <polygon points="112,61 114,64 110,64" fill="#FDD1B9" stroke="#785745" strokeWidth="0.5" />
            <path
              d="M 110 65 Q 112 67 114 65"
              fill="none"
              stroke="#785745"
              strokeWidth="1.2"
              strokeLinecap="round"
            />

            {/* Whiskers */}
            <g stroke="#785745" strokeWidth="0.8" opacity="0.45" strokeLinecap="round">
              {/* Left whiskers */}
              <line x1="96" y1="62" x2="84" y2="60" />
              <line x1="96" y1="65" x2="83" y2="66" />
              {/* Right whiskers */}
              <line x1="128" y1="62" x2="140" y2="60" />
              <line x1="128" y1="65" x2="141" y2="66" />
            </g>

            {/* Soft pink blush on cheeks */}
            <circle cx="98" cy="62" r="3.5" fill="#FFDBC9" opacity="0.6" />
            <circle cx="126" cy="62" r="3.5" fill="#FFDBC9" opacity="0.6" />
          </g>
        </g>

        {/* SLEEPING ZZZ PARTICLES */}
        {isSleeping && !reducedMotion && (
          <g className="animate-pulse">
            <text x="126" y="32" fill="#58765E" fontSize="12" fontWeight="bold" fontFamily="Quicksand">
              z
            </text>
            <text x="136" y="22" fill="#58765E" fontSize="15" fontWeight="bold" fontFamily="Quicksand">
              Z
            </text>
            <text x="148" y="10" fill="#405D47" fontSize="18" fontWeight="bold" fontFamily="Quicksand">
              z
            </text>
          </g>
        )}

        {/* PETTING / PURRING FLOATING PARTICLES */}
        {isPetted && !reducedMotion && (
          <g className="animate-bounce">
            <text x="130" y="24" fontSize="16">✨</text>
            <text x="75" y="30" fontSize="14">❤️</text>
          </g>
        )}

        {/* EATING FOOD CRUNCH PARTICLES */}
        {isEating && !reducedMotion && (
          <g>
            <circle cx="125" cy="78" r="2" fill="#D98A4E" className="animate-ping" />
            <circle cx="132" cy="74" r="1.5" fill="#785745" />
            <circle cx="128" cy="84" r="2" fill="#EAA873" />
          </g>
        )}
      </svg>

      {/* Embedded Keyframe Styles for Organic Animations */}
      <style>{`
        @keyframes tail-wag {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(14deg); }
        }
        @keyframes tail-slow {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(8deg); }
        }
        @keyframes idle-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02, 1.03); }
        }
        @keyframes sleep-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03, 1.04) translateY(-1px); }
        }
        @keyframes head-eat-munch {
          0% { transform: translateY(0px) rotate(0deg); }
          100% { transform: translateY(4px) rotate(4deg); }
        }
        @keyframes head-nudge {
          0% { transform: rotate(0deg) translateY(0px); }
          100% { transform: rotate(-5deg) translateY(-2px); }
        }
        @keyframes head-alert {
          0% { transform: translateY(0px) scale(1); }
          100% { transform: translateY(-4px) scale(1.02); }
        }
        @keyframes front-paw-step {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-3px); }
        }
      `}</style>
    </div>
  );
};
