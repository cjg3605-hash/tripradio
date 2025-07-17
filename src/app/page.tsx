'use client';

import SearchBox from '@/components/home/SearchBox';
import { useState } from 'react';

export default function Home() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <main className="min-h-screen bg-white relative overflow-hidden">
      {/* Ultra Minimal Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Single precision dot */}
        <div className="absolute top-[15%] left-[85%] w-2 h-2 bg-black rounded-full opacity-80"></div>
        
        {/* Thin line accent */}
        <div className="absolute top-[45%] right-[5%] w-0.5 h-24 bg-black opacity-30"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute bottom-[20%] left-[10%] grid grid-cols-3 gap-8 opacity-20">
          <div className="w-1 h-1 bg-black rounded-full"></div>
          <div className="w-1 h-1 bg-black rounded-full"></div>
          <div className="w-1 h-1 bg-black rounded-full"></div>
        </div>
      </div>

      {/* Main Content */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6" aria-label="메인 콘텐츠">
        <div className="text-center max-w-4xl mx-auto">
          
          {/* Ultra Minimal Title */}
          <div className="mb-20">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-light text-black mb-8 leading-[0.85] tracking-[-0.02em] font-mono">
              NAVI
            </h1>
            
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-light text-black mb-6 tracking-wide">
                내 손안의 도슨트
              </h2>
              <h3 className="text-xl md:text-2xl font-light text-gray-600 mb-12 tracking-wider">
                AI 오디오 가이드
              </h3>
            </div>

            {/* Minimalist Subtitle */}
            <div className="flex items-center justify-center gap-6 mb-16">
              <div className="w-8 h-0.5 bg-black"></div>
              <p className="text-sm font-medium text-black tracking-[0.2em] uppercase">
                생생한 현장 해설
              </p>
              <div className="w-8 h-0.5 bg-black"></div>
            </div>
          </div>

          {/* Ultra Clean Search */}
          <div className="w-full max-w-xl mx-auto mb-20">
            <SearchBox />
          </div>

          {/* Minimal Example Text */}
          <div className="mb-24">
            <p className="text-sm text-gray-500 font-light tracking-wide leading-relaxed">
              예: 경복궁, 부산 해운대, 제주도 성산일출봉, 명동 카페거리
            </p>
          </div>

          {/* Ultra Minimal Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-5xl mx-auto">
            
            {/* Card 1 */}
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-6 bg-black rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                </div>
              </div>
              <h4 className="text-lg font-light text-black mb-3 tracking-wide">장소 입력</h4>
              <p className="text-sm text-gray-600 font-light leading-relaxed">
                궁금한 곳의 이름을 입력하세요
              </p>
            </div>

            {/* Card 2 */}
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-6 bg-black rounded-full flex items-center justify-center">
                <div className="w-8 h-0.5 bg-white"></div>
              </div>
              <h4 className="text-lg font-light text-black mb-3 tracking-wide">AI 생성</h4>
              <p className="text-sm text-gray-600 font-light leading-relaxed">
                실시간으로 맞춤 가이드 생성
              </p>
            </div>

            {/* Card 3 */}
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-6 bg-black rounded-full flex items-center justify-center">
                <div className="grid grid-cols-2 gap-1">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
              </div>
              <h4 className="text-lg font-light text-black mb-3 tracking-wide">오디오 재생</h4>
              <p className="text-sm text-gray-600 font-light leading-relaxed">
                음성으로 생생한 현장 해설
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Bottom Minimal Element */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-0.5 h-12 bg-black opacity-20"></div>
      </div>

    </main>
  );
}