import React from "react";
import { cn } from "@/lib/utils";

interface BackgroundGraphProps {
  className?: string;
}

// Subtle SVG graph/network background using theme tokens with very low saturation
export const BackgroundGraph = ({ className }: BackgroundGraphProps) => {
  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden ${className}`}>
      <svg
        className="w-full h-full opacity-[0.008] text-muted-foreground"
        viewBox="0 0 800 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Ultra-subtle grid */}
        <defs>
          <pattern id="minimal-grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="currentColor" strokeWidth="0.3"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#minimal-grid)" />
        
        {/* Minimal nodes */}
        <g className="animate-float-slow">
          <circle cx="120" cy="120" r="1" fill="currentColor" opacity="0.15" />
          <circle cx="280" cy="180" r="0.8" fill="currentColor" opacity="0.12" />
          <circle cx="450" cy="100" r="1" fill="currentColor" opacity="0.15" />
          <circle cx="620" cy="220" r="0.8" fill="currentColor" opacity="0.12" />
          <circle cx="680" cy="350" r="1" fill="currentColor" opacity="0.15" />
          
          {/* Barely visible connections */}
          <line x1="120" y1="120" x2="280" y2="180" stroke="currentColor" strokeWidth="0.3" opacity="0.08" />
          <line x1="280" y1="180" x2="450" y2="100" stroke="currentColor" strokeWidth="0.3" opacity="0.08" />
          <line x1="450" y1="100" x2="620" y2="220" stroke="currentColor" strokeWidth="0.3" opacity="0.08" />
        </g>
      </svg>
    </div>
  );
};

export default BackgroundGraph;
