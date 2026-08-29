'use client';

import React from 'react';

interface ModuleContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Standardized High-Order Layout Wrapper for all 12 modules.
 * Tightly tuned for native mobile app feel (px-3 py-3.5 on mobile)
 * and spacious desktop layout (sm:px-6 lg:px-8 sm:py-6).
 */
export function ModuleContainer({ children, className = '' }: ModuleContainerProps) {
  return (
    <div className={`w-full max-w-6xl mx-auto px-0 sm:px-6 lg:px-8 py-3.5 sm:py-6 space-y-3 sm:space-y-6 pb-24 sm:pb-28 lg:pb-12 animate-fadeIn transition-all ${className}`}>
      {children}
    </div>
  );
}

/**
 * Higher Order Component (HOC) version for wrapping module components.
 */
export function withModuleLayout<P extends object>(Component: React.ComponentType<P>) {
  return function WrappedWithModuleLayout(props: P) {
    return (
      <ModuleContainer>
        <Component {...props} />
      </ModuleContainer>
    );
  };
}
