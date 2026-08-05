import React from 'react';

interface LogoProps {
  className?: string;
  size?: number | string;
}

export const NeuromaxLogo: React.FC<LogoProps> = ({ className = '', size = 48 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`rounded-2xl shadow-md ${className}`}
    >
      <defs>
        {/* Background Gradient */}
        <linearGradient id="bgGrad" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="100%" stopColor="#312e81" />
        </linearGradient>

        {/* Outer Frame Gradient */}
        <linearGradient id="frameGrad" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#3730a3" />
        </linearGradient>

        {/* Central Glow for Puzzle Piece */}
        <radialGradient id="puzzleGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>

        <filter id="glowBlur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Main Container Badge */}
      <rect width="200" height="200" rx="44" fill="url(#bgGrad)" stroke="url(#frameGrad)" strokeWidth="6" />

      {/* Inner Frame Accent Line */}
      <rect x="7" y="7" width="186" height="186" rx="38" fill="none" stroke="#6366f1" strokeWidth="2" strokeOpacity="0.5" />

      {/* Central Glow Effect */}
      <circle cx="102" cy="92" r="50" fill="url(#puzzleGlow)" />

      {/* REALISTIC SIDE-PROFILE ANATOMICAL BRAIN */}
      {/* 1. Main Cortical Outer Outline */}
      <g stroke="#93c5fd" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Cerebrum Lobes Contour (Frontal facing right, Parietal top, Occipital left, Temporal lower) */}
        <path
          d="M 100 42 
             C 124 42, 146 50, 158 66 
             C 168 80, 166 98, 154 110 
             C 142 120, 128 122, 114 118 
             C 120 128, 116 142, 104 148 
             C 94 154, 82 152, 74 144 
             C 62 148, 48 138, 44 124 
             C 38 112, 40 98, 48 86 
             C 38 72, 46 56, 62 48 
             C 74 42, 88 42, 100 42 Z"
          strokeWidth="5.5"
        />

        {/* Cerebellum & Brain Stem */}
        <path d="M 74 144 C 80 134, 92 138, 100 146 C 104 152, 106 160, 106 168" stroke="#818cf8" strokeWidth="4" />
        <path d="M 62 134 C 70 128, 80 130, 88 138" stroke="#6366f1" strokeWidth="3" />
        <path d="M 52 124 C 60 118, 70 120, 78 128" stroke="#6366f1" strokeWidth="2.5" />
      </g>

      {/* 2. Realistic Cortical Gyri & Sulci (Convolutions) */}
      <g stroke="#6366f1" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.95">
        {/* Central & Precentral Sulci (Frontal & Parietal) */}
        <path d="M 100 46 C 106 58, 118 64, 132 58" />
        <path d="M 120 64 C 132 72, 144 74, 152 86" />
        <path d="M 136 88 C 146 96, 154 100, 152 108" />
        
        {/* Sylvian Fissure (Lateral Sulcus) */}
        <path d="M 148 98 C 132 102, 112 96, 98 102" stroke="#818cf8" strokeWidth="4.5" />
        <path d="M 64 94 C 76 92, 88 98, 98 94" stroke="#818cf8" strokeWidth="4" />

        {/* Frontal Lobe Convolutions */}
        <path d="M 78 50 C 70 62, 60 66, 52 76" />
        <path d="M 92 56 C 84 68, 76 74, 66 84" />
        <path d="M 108 54 C 100 66, 92 72, 82 82" />

        {/* Occipital & Temporal Folds */}
        <path d="M 48 98 C 58 106, 68 104, 76 114" />
        <path d="M 134 112 C 124 118, 112 116, 102 124" />
        <path d="M 116 124 C 108 130, 98 128, 92 136" />
        <path d="M 70 114 C 78 120, 84 118, 90 126" />
      </g>

      {/* Synaptic Nodes (Glowing Dots) */}
      <g fill="#a5b4fc">
        <circle cx="152" cy="72" r="3" />
        <circle cx="132" cy="58" r="2.5" />
        <circle cx="66" cy="84" r="2.5" />
        <circle cx="48" cy="98" r="3" />
        <circle cx="152" cy="108" r="3" />
        <circle cx="106" cy="168" r="3.5" fill="#c7d2fe" />
      </g>

      {/* Central Golden Puzzle Piece (Bridging the Hemispheres) */}
      <g filter="url(#glowBlur)">
        <path
          d="M 92 86 
             h 8 
             c 0 -3.5, 2.5 -5.5, 5.5 -5.5 
             s 5.5 2, 5.5 5.5 
             h 8 
             v 8 
             c 3.5 0, 5.5 2.5, 5.5 5.5 
             s -2 5.5, -5.5 5.5 
             v 8 
             h -8 
             c 0 -3.5, -2.5 -5.5, -5.5 -5.5 
             s -5.5 2, -5.5 5.5 
             h -8 
             v -8 
             c -3.5 0, -5.5 -2.5, -5.5 -5.5 
             s 2 -5.5, 5.5 -5.5 
             z"
          fill="#fbbf24"
          stroke="#f59e0b"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};

