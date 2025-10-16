'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import Header from './Header';
import { HistorySidebar } from './HistorySidebar';
import { LanguageDetectionToast } from '@/components/common/LanguageDetectionToast';
import { ModeProvider } from '@/contexts/ModeContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

// 성능 모니터링 프로바이더 동적 로드 (임시 비활성화)
// const PerformanceProvider = dynamic(() => import('@/components/providers/PerformanceProvider'), {
//   ssr: false
// });

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const pathname = usePathname();
  
  // 가이드 페이지, 노마드 계산기, AI여행계획 페이지에서는 글로벌 헤더 숨기기
  const isGuidePage = pathname?.startsWith('/guide/');
  const isNomadCalculatorPage = pathname === '/nomad-calculator';
  const isAiTripPlannerPage = pathname === '/ai-trip-planner';
  const shouldHideHeader = isGuidePage || isNomadCalculatorPage || isAiTripPlannerPage;
  
  return (
    <ThemeProvider defaultTheme="system" enableSystem>
      <ModeProvider>
        <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
          {!shouldHideHeader && <Header onHistoryOpen={() => setIsHistoryOpen(true)} />}
          <HistorySidebar isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
          
          {/* 🌍 언어 자동 감지 알림 토스트 */}
          <LanguageDetectionToast />
          
          <main>
            {children}
          </main>
        </div>
      </ModeProvider>
    </ThemeProvider>
  );
}