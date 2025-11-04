'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type PodcastVersion = 'v1' | 'v2';

interface PodcastVersionContextType {
  version: PodcastVersion;
  setVersion: (version: PodcastVersion) => void;
  stats: {
    generationTime?: number;
    apiCalls?: number;
    segments?: number;
  } | null;
  setStats: (stats: any) => void;
}

const PodcastVersionContext = createContext<PodcastVersionContextType | undefined>(undefined);

export function PodcastVersionProvider({ children }: { children: React.ReactNode }) {
  const [version, setVersion] = useState<PodcastVersion>('v2');
  const [stats, setStats] = useState<any>(null);

  // localStorage에서 저장된 선택값 로드
  useEffect(() => {
    const savedVersion = localStorage.getItem('podcastVersion') as PodcastVersion | null;
    if (savedVersion) {
      setVersion(savedVersion);
    }
  }, []);

  // 선택된 버전 저장
  const handleSetVersion = (newVersion: PodcastVersion) => {
    setVersion(newVersion);
    localStorage.setItem('podcastVersion', newVersion);
    // 버전 변경 시 통계 초기화
    setStats(null);
  };

  return (
    <PodcastVersionContext.Provider
      value={{
        version,
        setVersion: handleSetVersion,
        stats,
        setStats
      }}
    >
      {children}
    </PodcastVersionContext.Provider>
  );
}

export function usePodcastVersion() {
  const context = useContext(PodcastVersionContext);
  if (context === undefined) {
    throw new Error('usePodcastVersion must be used within a PodcastVersionProvider');
  }
  return context;
}
