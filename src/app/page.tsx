'use client';

import { useState, useEffect } from 'react';
import NextLevelSearchBox from '@/components/home/NextLevelSearchBox';

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentWord, setCurrentWord] = useState(0);

  const words = ['스토리텔러', '오디오가이드', '여행동반자'];

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
        
        {/* Hero Typography */}
        <div className={`
          pb-16 px-4 transform transition-all duration-1000
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
        </div>
      </section>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes expandRight {
          0% {
            transform: scaleX(0);
          }
          100% {
            transform: scaleX(1);
          }
        }

        @keyframes expandLeft {
          0% {
            transform: scaleX(0);
          }
          100% {
            transform: scaleX(1);
          }
        }
      `}</style>
    </main>
  );
}