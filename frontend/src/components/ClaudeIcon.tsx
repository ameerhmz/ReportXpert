import React from "react";
import { SovereignInsignia } from "./SovereignInsignia";

interface ClaudeIconProps {
  className?: string;
  size?: number;
}

export const ClaudeIcon: React.FC<ClaudeIconProps> = ({ className = "w-6 h-6", size = 24 }) => (
  <SovereignInsignia className={className} size={size} glow={true} />
);

