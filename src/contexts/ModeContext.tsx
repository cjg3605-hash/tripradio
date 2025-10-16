'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

type Mode = 'guide' | 'podcast';

interface ModeContextType {
  mode: Mode;
  setMode: (mode: Mode) => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>('guide');
  const pathname = usePathname();

  // URL에 따라 자동으로 모드 설정
  useEffect(() => {
    if (pathname.includes('/podcast') || pathname.includes('/tour')) {
      setMode('podcast');
    } else {
      setMode('guide');
    }
  }, [pathname]);

  return (
    <ModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
}