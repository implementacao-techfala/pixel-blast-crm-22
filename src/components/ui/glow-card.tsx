import React, { ReactNode } from 'react';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'blue' | 'purple' | 'green' | 'red' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  width?: string | number;
  height?: string | number;
  customSize?: boolean;
}

const GlowCard: React.FC<GlowCardProps> = ({ 
  children, 
  className = '', 
  glowColor = 'purple',
  size = 'md',
  width,
  height,
  customSize = false
}) => {
  const getGlowColor = () => {
    switch (glowColor) {
      case 'purple': return 'shadow-[0_0_20px_rgba(147,51,234,0.3)]';
      case 'blue': return 'shadow-[0_0_20px_rgba(59,130,246,0.3)]';
      case 'green': return 'shadow-[0_0_20px_rgba(34,197,94,0.3)]';
      case 'red': return 'shadow-[0_0_20px_rgba(239,68,68,0.3)]';
      case 'orange': return 'shadow-[0_0_20px_rgba(249,115,22,0.3)]';
      default: return 'shadow-[0_0_20px_rgba(147,51,234,0.3)]';
    }
  };

  return (
    <div
      className={`
        ${customSize ? '' : 'w-64 h-80'}
        rounded-2xl 
        relative 
        p-6 
        backdrop-blur-xl 
        bg-white/10 
        border 
        border-white/20
        ${getGlowColor()}
        hover:shadow-[0_0_30px_rgba(147,51,234,0.5)]
        transition-all 
        duration-300
        ${className}
      `}
      style={{
        width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
        height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
      }}
    >
      {children}
    </div>
  );
};

export { GlowCard };