'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { HistorySidebar } from './HistorySidebar';
import { useState } from 'react';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // /guide로 시작하는 모든 경로에서 헤더 숨김
  const hideHeader = pathname.startsWith('/guide');

  return (
    <>
      {!hideHeader && <Header onSidebarToggle={() => setIsHistoryOpen(true)} />}
      <HistorySidebar isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
      {children}
    </>
  );
} 