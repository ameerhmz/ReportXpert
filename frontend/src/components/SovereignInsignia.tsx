import React from "react";

interface SovereignInsigniaProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

export const SovereignInsignia: React.FC<SovereignInsigniaProps> = ({ 
  className = "w-6 h-6", 
  size = 24,
  glow = false
}) => (
  <div className={`relative inline-flex items-center justify-center shrink-0 ${glow ? "drop-shadow-[0_0_8px_rgba(222,133,53,0.35)]" : ""}`}>
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer Precision Caliper Ring with Cardinal Tick Marks */}
      <circle cx="16" cy="16" r="14" stroke="#414843" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.6" />
      <circle cx="16" cy="16" r="11.5" stroke="#333935" strokeWidth="1" />

      {/* 4 Precision Cardinal Ticks */}
      <line x1="16" y1="1" x2="16" y2="4" stroke="#de8535" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="16" y1="28" x2="16" y2="31" stroke="#de8535" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="1" y1="16" x2="4" y2="16" stroke="#de8535" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="28" y1="16" x2="31" y2="16" stroke="#de8535" strokeWidth="1.5" strokeLinecap="round" />

      {/* Interlocking Academic Crest & Geometric Hex Diamond Geometry */}
      <path
        d="M16 6.5L24.2 11.2V20.8L16 25.5L7.8 20.8V11.2L16 6.5Z"
        stroke="#b8b2a4"
        strokeWidth="1.2"
        strokeLinejoin="round"
        opacity="0.8"
      />
      
      {/* Precision Internal Flow Channels */}
      <line x1="16" y1="7" x2="16" y2="25" stroke="#333935" strokeWidth="1" />
      <line x1="8" y1="16" x2="24" y2="16" stroke="#333935" strokeWidth="1" />

      {/* Core Tungsten / Amber Flame Atom */}
      <circle cx="16" cy="16" r="4" fill="url(#amber-core-gradient)" />
      <circle cx="16" cy="16" r="2" fill="#fff5ea" />

      {/* Radiant Gradient */}
      <defs>
        <radialGradient id="amber-core-gradient" cx="0.5" cy="0.5" r="0.5" fx="0.35" fy="0.35">
          <stop offset="0%" stopColor="#f5aa67" />
          <stop offset="70%" stopColor="#de8535" />
          <stop offset="100%" stopColor="#a34e15" />
        </radialGradient>
      </defs>
    </svg>
  </div>
);
