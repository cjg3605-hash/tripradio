'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import NextLevelSearchBox from '@/components/home/NextLevelSearchBox';

export default function HomePage() {
  const { t } = useLanguage();
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentWord, setCurrentWord] = useState(0);

  // 디자인과 매칭되는 애니메이션 단어들
  const words = [
    t.home.features?.realTime || '실시간가이드',
    t.home.features?.personalized || '맞춤형추천',
    t.home.features?.multiLanguage || '다국어지원',
    '도슨트'
  ];

  useEffect(() => {
    setIsLoaded(true);
    
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [words.length]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <main className="relative overflow-hidden">
      {/* Geometric Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Large floating circle */}
        <div 
          className="absolute w-96 h-96 border border-black/5 rounded-full transition-transform duration-1000"
          style={{
            top: '10%',
            right: '10%',
            transform: `translate(${mousePosition.x * -0.02}px, ${mousePosition.y * -0.02}px)`
          }}
        />
        
        {/* Precision line */}
        <div 
          className="absolute w-20 h-px bg-black opacity-15 transition-transform duration-700"
          style={{
            top: '35%',
            left: '8%',
            transform: `translate(${mousePosition.x * -0.01}px, ${mousePosition.y * 0.01}px)`
          }}
        />
        
        {/* Micro square */}
        <div 
          className="absolute w-1 h-1 bg-black opacity-20 rotate-45 transition-transform duration-500"
          style={{
            bottom: '30%',
            right: '20%',
            transform: `translate(${mousePosition.x * 0.015}px, ${mousePosition.y * -0.01}px) rotate(45deg)`
          }}
        />
      </div>

      {/* Main Content */}
      <section className="relative z-10 flex flex-col items-center justify-center px-6 pt-16">
        
        {/* Hero Typography - 완전한 "내손안의 도슨트" 디자인 복구 */}
        <div className={`
          pb-16 px-4 transform transition-all duration-1000
          ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
        `}>
          <h1 className="text-5xl md:text-7xl font-extralight tracking-tight text-black leading-tight mb-8">
            <div className="relative">
              <span className="block">{t.home.brandTitle || '내손안의'}</span>
              <span className="block overflow-hidden h-20">
                <span 
                  className="inline-block transition-transform duration-700 ease-in-out"
                  style={{
                    transform: `translateY(-${currentWord * 100}%)`
                  }}
                >
                  {words.map((word, index) => (
                    <span key={index} className="flex h-20 items-center">
                      {word}
                    </span>
                  ))}
                </span>
              </span>
            </div>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 text-center max-w-2xl mx-auto font-light leading-relaxed mb-16">
            {t.home.subtitle}
          </p>
        </div>

        {/* Search Box */}
        <NextLevelSearchBox />

        {/* Features Section */}
        <div className={`
          grid grid-cols-1 md:grid-cols-3 gap-16 mt-32 max-w-4xl mx-auto px-4
          transform transition-all duration-1500 ease-out
          ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
        `}>
          
          {/* Feature 1 */}
          <div className="text-center group cursor-pointer">
            <div className="w-20 h-20 mx-auto mb-6 bg-black rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <div className="w-3 h-3 bg-black rounded-full" />
              </div>
            </div>
            <h3 className="text-lg font-light text-black mb-3 tracking-wide">
              {t.home.searchPlaceholder || '장소 입력'}
            </h3>
            <p className="text-sm text-gray-500 font-light leading-relaxed">
              궁금한 곳의<br />이름을 입력하세요
            </p>
          </div>

          {/* Feature 2 */}
          <div className="text-center group cursor-pointer">
            <div className="w-20 h-20 mx-auto mb-6 bg-black rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <div className="w-10 h-px bg-white" />
            </div>
            <h3 className="text-lg font-light text-black mb-3 tracking-wide">
              {t.home.features?.realTime || 'AI 생성'}
            </h3>
            <p className="text-sm text-gray-500 font-light leading-relaxed">
              실시간으로<br />맞춤 가이드 생성
            </p>
          </div>

          {/* Feature 3 */}
          <div className="text-center group cursor-pointer">
            <div className="w-20 h-20 mx-auto mb-6 bg-black rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <div className="grid grid-cols-2 gap-1.5">
                <div className="w-2 h-2 bg-white rounded-full" />
                <div className="w-2 h-2 bg-white rounded-full" />
                <div className="w-2 h-2 bg-white rounded-full" />
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            </div>
            <h3 className="text-lg font-light text-black mb-3 tracking-wide">
              {t.guide.realTimeGuide || '오디오 재생'}
            </h3>
            <p className="text-sm text-gray-500 font-light leading-relaxed">
              음성으로 생생한<br />현장 해설
            </p>
          </div>
        </div>

        {/* Popular Examples */}
        <div className={`
          text-center transform transition-all duration-1500 ease-out
          ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
        `}>
          <div className="mt-32 mb-16">
            <h2 className="text-2xl md:text-3xl font-light text-black mb-8">
              {t.home.popularDestinations || '인기 여행지'}
            </h2>
            <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
              {[
                '경복궁', '제주도', '부산 해운대', '강릉 커피거리', 
                '전주 한옥마을', '속초 중앙시장', '여수 밤바다'
              ].map((place) => (
                <span
                  key={place}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 cursor-pointer transition-colors duration-200"
                >
                  {place}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}