import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'compact' | 'icon';
  theme?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  variant = 'full',
  theme = 'light',
  size = 'md',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const isDark = theme === 'dark';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* SVG Icon: Droplet + Verification Shield + Wave Motif */}
      <div className={`relative ${iconSizes[size]} shrink-0 transition-transform hover:scale-105 duration-200`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          <defs>
            <linearGradient id="avDropletGrad" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#159B86" />
              <stop offset="50%" stopColor="#087E83" />
              <stop offset="100%" stopColor="#176B91" />
            </linearGradient>
            <linearGradient id="avWaveGrad" x1="12" y1="26" x2="36" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#B9D9D6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="avShieldGlow" x1="16" y1="16" x2="32" y2="34" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#B9D9D6" />
            </linearGradient>
          </defs>

          {/* Organic Water Droplet Base */}
          <path
            d="M24 3C24 3 9 20.5 9 30.5C9 38.7843 15.7157 45.5 24 45.5C32.2843 45.5 39 38.7843 39 30.5C39 20.5 24 3 24 3Z"
            fill="url(#avDropletGrad)"
          />

          {/* Flowing Clean Water Waves inside droplet */}
          <path
            d="M12 31C15 28.5 19 33 24 31C29 29 33 33 36 31C37 32 37.5 33.5 37.8 35C35 41 29.5 44 24 44C18.5 44 13 41 10.2 35C10.6 33.5 11.2 32 12 31Z"
            fill="url(#avWaveGrad)"
          />

          {/* Verification Shield Center Mark */}
          <path
            d="M24 13L32 17V24C32 29.5 28.5 33.5 24 35C19.5 33.5 16 29.5 16 24V17L24 13Z"
            fill="#087E83"
            fillOpacity="0.85"
            stroke="url(#avShieldGlow)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Trust Checkmark */}
          <path
            d="M20.5 24L23 26.5L27.5 21"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Brand Typographic Wordmark */}
      {variant !== 'icon' && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center">
            <span
              className={`font-extrabold tracking-tight ${textSizes[size]} ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Aqua
            </span>
            <span
              className={`font-extrabold tracking-tight ${textSizes[size]} text-teal-600`}
            >
              Verify
            </span>
            <span className="ml-1 text-[10px] font-bold tracking-widest px-1.5 py-0.5 rounded uppercase bg-teal-100 text-teal-800 border border-teal-200">
              LK
            </span>
          </div>
          {variant === 'full' && (
            <span
              className={`text-[10px] uppercase font-semibold tracking-wider ${
                isDark ? 'text-teal-200/80' : 'text-slate-500'
              }`}
            >
              Water Quality Monitor
            </span>
          )}
        </div>
      )}
    </div>
  );
};
