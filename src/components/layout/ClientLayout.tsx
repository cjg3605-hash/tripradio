'use client';

import { useState } from 'react';
import Header from './Header';
import { HistorySidebar } from './HistorySidebar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  return (
    <>
      <Header onHistoryOpen={() => setIsHistoryOpen(true)} />
      <HistorySidebar isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
      {children}
    </>
  );
}