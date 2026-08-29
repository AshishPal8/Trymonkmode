'use client';

import React from 'react';
import Image from 'next/image';
import { appIcon } from '@/assets';

interface AuraLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  subtitle?: string;
  className?: string;
  forceDarkText?: boolean; // For landing page light navbar
}

export function AuraLogo({
  size = 'md',
  showText = true,
  subtitle,
  className = '',
  forceDarkText = false,
}: AuraLogoProps) {
  const sizeMap = {
    sm: {
      box: 'w-7 h-7 sm:w-8 sm:h-8 rounded-xl',
      imgSize: 32,
      title: 'text-sm sm:text-base font-extrabold',
      sub: 'text-[10px]',
    },
    md: {
      box: 'w-9 h-9 sm:w-10 sm:h-10 rounded-2xl',
      imgSize: 40,
      title: 'text-base sm:text-lg font-extrabold',
      sub: 'text-xs',
    },
    lg: {
      box: 'w-12 h-12 rounded-2xl',
      imgSize: 48,
      title: 'text-xl font-extrabold',
      sub: 'text-xs',
    },
    xl: {
      box: 'w-16 h-16 rounded-3xl',
      imgSize: 64,
      title: 'text-2xl font-extrabold',
      sub: 'text-sm',
    },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand App Icon */}
      <div
        className={`relative flex items-center justify-center shrink-0 ${currentSize.box} overflow-hidden shadow-md shadow-blue-500/10 transition-transform duration-300 hover:scale-105`}
      >
        <Image
          src={appIcon}
          alt="TryMonkMode Logo"
          width={currentSize.imgSize}
          height={currentSize.imgSize}
          priority
          draggable={false}
          className="w-full h-full object-contain rounded-xl no-drag select-none pointer-events-none"
        />
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col text-left leading-tight min-w-0">
          <div className="flex items-center tracking-tight font-sans">
            <span className={`${currentSize.title} ${forceDarkText ? 'text-slate-900' : 'text-slate-900 dark:text-white'}`}>
              Try
            </span>
            <span className={`${currentSize.title} text-[#0052FF]`}>
              MonkMode
            </span>
          </div>
          {subtitle && (
            <span className={`${currentSize.sub} ${forceDarkText ? 'text-slate-500' : 'text-muted-foreground'} font-medium truncate`}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export const TryMonkLogo = AuraLogo;
export type TryMonkLogoProps = AuraLogoProps;