'use client';

import { useState, useEffect } from 'react';
import { HistorySidebar } from '@/components/layout/HistorySidebar';
import { SearchBox } from '@/components/home/SearchBox';
import { useLanguage } from '@/contexts/LanguageContext';

export default function HomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { t, isLoading } = useLanguage();
  const [splashVisible, setSplashVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setSplashVisible(false), 1500);
    return () => clearTimeout(timeout);
  }, []);

  if (splashVisible) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <img src="/navi.png" alt="Navi Logo" className="w-32 h-32 mb-8 animate-bounce" />
      </div>
    );
  }

  return (
    <>
      <HistorySidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <header className="w-full flex items-center justify-between px-4 py-3 bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center gap-2">
          <img src="/navi.png" alt="Navi Logo" className="w-8 h-8 mr-2" />
          <span className="text-xl font-bold text-indigo-700 tracking-tight">NAVI-GUIDE</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen((open) => !open)}
          className="ml-2 p-2 rounded-full hover:bg-gray-100 transition-colors border border-gray-200 shadow"
          aria-label="히스토리 열기"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-history w-6 h-6 text-indigo-600"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l4 2"/></svg>
        </button>
      </header>
      <main>
        <div className="flex min-h-screen flex-col items-center justify-start bg-gray-50 p-4 text-center pt-8">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            {isLoading ? 'AI와 함께하는 가이드 투어' : t.home.title}
          </h1>
          <p className="mb-8 text-gray-500">
            {isLoading ? '개인 맞춤형 여행 가이드를 AI가 실시간으로 생성해드립니다' : t.home.subtitle}
          </p>

          <div className="w-full max-w-2xl">
            <SearchBox />
          </div>

          <p className="mt-8 text-sm text-gray-600">
            ✨ {isLoading ? 'AI가 실시간으로 생성하는 독특한 여행 가이드를 만나보세요' : t.home.description}
          </p>
        </div>
      </main>
    </>
  );
} 