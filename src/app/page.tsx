'use client';

import { useState, useEffect } from 'react';
import { SearchBox } from '@/components/home/SearchBox';
import { Header } from '@/components/layout/Header';
import { HistorySidebar } from '@/components/layout/HistorySidebar';
import { useLanguage } from '@/contexts/LanguageContext';

export default function HomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { t, isLoading } = useLanguage();

  return (
    <>
      <Header onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <HistorySidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center pt-20">
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
    </>
  );
} 