'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import Header from './Header';
import { HistorySidebar } from './HistorySidebar';

// 성능 모니터링 프로바이더 동적 로드
const PerformanceProvider = dynamic(() => import('@/components/providers/PerformanceProvider'), {
  ssr: false
});

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const pathname = usePathname();
  
  // 가이드 페이지에서는 글로벌 헤더 숨기기
  const isGuidePage = pathname?.startsWith('/guide/');
  
  return (
    <PerformanceProvider>
      {!isGuidePage && <Header onHistoryOpen={() => setIsHistoryOpen(true)} />}
      <HistorySidebar isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
      <main>
        {children}
      </main>
    </PerformanceProvider>
  );
}