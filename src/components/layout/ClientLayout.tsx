'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { HistorySidebar } from './HistorySidebar';
import { useState } from 'react';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  return (
    <>
      <Header onSidebarToggle={() => setIsHistoryOpen(true)} />
      <HistorySidebar isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
      {children}
    </>
  );
} 