'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // /guide로 시작하는 모든 경로에서 헤더 숨김
  const hideHeader = pathname.startsWith('/guide');

  return (
    <>
      {!hideHeader && <Header />}
      {children}
    </>
  );
} 