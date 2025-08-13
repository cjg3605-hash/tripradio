'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Header from './Header';
import { HistorySidebar } from './HistorySidebar';

// 성능 모니터링 프로바이더 동적 로드
const PerformanceProvider = dynamic(() => import('@/components/providers/PerformanceProvider'), {
  ssr: false
});

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  return (
    <PerformanceProvider>
      <Header onHistoryOpen={() => setIsHistoryOpen(true)} />
      <HistorySidebar isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
      {children}
    </PerformanceProvider>
  );
}