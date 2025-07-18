'use client';

import { useState, useEffect } from 'react';
import NextLevelSearchBox from '@/components/home/NextLevelSearchBox';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentWord, setCurrentWord] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const words = ['도슨트', '여행지식', '가이드북', '스토리텔러'];

  useEffect(() => {
    setIsLoaded(true);
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Subtle mouse tracking for parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <main className="min-h-screen bg-white relative overflow-hidden">
      
      {/* Ultra Subtle Grid Background */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,1) 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px',
            transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`
          }}
        />
      </div>

      {/* Floating Geometric Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Primary accent dot */}
        <div 
          className="absolute w-2 h-2 bg-black rounded-full opacity-30 transition-transform duration-1000"
          style={{
            top: '15%',
            right: '12%',
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
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
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[70vh] px-6 pt-24">
        
        {/* Hero Typography */}
        <div className={`
  min-h-screen pt-4 pb-16 px-4 transform transition-all duration-1000
  ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
`}>
         {/* Dynamic Subtitle */}
<div className="h-20 flex items-center justify-center mb-4">
  <h2 className="text-[clamp(1.5rem,4vw,2.5rem)] font-light text-black tracking-wide">
    내 손안의 
    <span className="relative inline-block ml-4 min-w-[200px] text-left">
      <span 
        key={currentWord}
        className="absolute inset-0 transition-all duration-800 ease-out"
        style={{
          animation: 'fadeInUp 0.8s ease-out'
        }}
                >
                  {words[currentWord]}
                </span>
              </span>
            </h2>
          </div>

          {/* Elegant Separator */}
          <div className="flex items-center justify-center gap-8 mb-8">
            <div 
              className="w-16 h-px bg-black origin-left"
              style={{
                animation: 'expandRight 1.5s ease-out 0.5s both'
              }}
            />
            <div 
              className="w-2 h-2 bg-black rounded-full"
              style={{
                animation: 'pulse 2s ease-in-out infinite 1s'
              }}
            />
            <div 
              className="w-16 h-px bg-black origin-right"
              style={{
                animation: 'expandLeft 1.5s ease-out 0.5s both'
              }}
            />
          </div>

          {/* Tagline */}
          <div className="mb-8">
            <p className="text-[clamp(1rem,2.5vw,1.25rem)] font-light text-gray-600 tracking-wide leading-relaxed max-w-lg mx-auto">
            가이드없이 자유롭게,<br />
              <span className="text-black font-medium">여행은 깊이있게</span>
              <span className="text-gray-500 text-[0.85em] mt-2 block">AI가 찾아낸 가장 완벽한 가이드해설</span>
            </p>
          </div>
        </div>

        {/* Next-Level Search */}
        <div className="w-full max-w-2xl mx-auto mb-8">
          <NextLevelSearchBox />
        </div>

        {/* Minimal Feature Preview */}
        <div className={`
          grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto
          transform transition-all duration-1000 delay-700
          ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
        `}>
          
          {/* Feature 1 */}
          <div className="text-center group cursor-pointer">
            <div className="w-20 h-20 mx-auto mb-6 bg-black rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <div className="w-3 h-3 bg-black rounded-full" />
              </div>
            </div>
            <h3 className="text-lg font-light text-black mb-3 tracking-wide">장소 입력</h3>
            <p className="text-sm text-gray-500 font-light leading-relaxed">
              궁금한 곳의<br />이름을 입력하세요
            </p>
          </div>

          {/* Feature 2 */}
          <div className="text-center group cursor-pointer">
            <div className="w-20 h-20 mx-auto mb-6 bg-black rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <div className="w-10 h-px bg-white" />
            </div>
            <h3 className="text-lg font-light text-black mb-3 tracking-wide">AI 생성</h3>
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
            <h3 className="text-lg font-light text-black mb-3 tracking-wide">오디오 재생</h3>
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
  <p className="text-sm text-gray-400 font-light tracking-wide mb-4">
    인기 검색어
  </p>
  <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
    {['경복궁', '부산 해운대', '제주도 성산일출봉', '명동 카페거리', '강릉 커피거리'].map((place, index) => (
      <span 
        key={index}
        className="px-4 py-2 text-sm text-gray-500 bg-gray-50 rounded-full hover:bg-gray-100 hover:text-gray-700 transition-all duration-200 cursor-pointer"
        style={{
          animationDelay: `${1.2 + index * 0.1}s`
        }}
      >
        {place}
      </span>
    ))}
  </div>
</div>

      </section>

      {/* Bottom Accent */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-px h-16 bg-black opacity-10" />
      </div>

      {/* Custom CSS Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes expandRight {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        
        @keyframes expandLeft {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>
    </main>
  );
}