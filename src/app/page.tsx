'use client';

import SearchBox from '@/components/home/SearchBox';
import { useState } from 'react';
import { Search, MapPin, Headphones, Play, ArrowRight } from 'lucide-react';

export default function Home() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* 배경 3D 기하학적 요소들 */}
      <div className="absolute inset-0 pointer-events-none">
        {/* 큰 원형 그림자 */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-gray-900/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-black/10 rounded-full blur-2xl"></div>
        
        {/* 기하학적 형태들 */}
        <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-black rounded-full shadow-lg"></div>
        <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-gray-800 rounded-sm shadow-lg transform rotate-45"></div>
        <div className="absolute bottom-1/3 left-1/4 w-8 h-1 bg-gray-700 shadow-lg"></div>
      </div>

      {/* 히어로 섹션 */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8" aria-label="메인 히어로 섹션">
        <div className="text-center max-w-5xl mx-auto">
          
          {/* 메인 헤드라인 - 레이어드 텍스트 */}
          <div className="text-center mb-12">
            <div className="relative inline-block">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-black mb-4 leading-tight tracking-tighter relative z-10" role="banner">
                내 손안의 도슨트
                <br />
                <span className="relative">
                  AI 오디오 가이드
                  {/* 텍스트 하이라이트 */}
                  <div className="absolute bottom-2 left-0 right-0 h-4 bg-black/10 -skew-x-12 -z-10"></div>
                </span>
              </h1>
              {/* 텍스트 그림자 */}
              <div className="absolute top-1 left-1 text-5xl md:text-7xl lg:text-8xl font-black text-gray-300/50 -z-10">
                내 손안의 도슨트<br />AI 오디오 가이드
              </div>
            </div>
            
            <p className="text-xl md:text-2xl text-gray-600 font-light max-w-3xl mx-auto mt-8 leading-relaxed">
              실시간으로 들려주는
              <span className="relative inline-block mx-2">
                <span className="bg-black text-white px-3 py-1 rounded-lg font-semibold">생생한 현장 해설</span>
                <div className="absolute top-1 left-1 bg-gray-400 px-3 py-1 rounded-lg -z-10"></div>
              </span>
              <br />
              <span className="text-lg text-indigo-600 font-medium">📍 텍스트 + 🎧 음성으로 생생한 현장 해설</span>
            </p>
          </div>

          {/* 검색 박스 */}
          <div className="w-full max-w-2xl mx-auto mb-16">
            <SearchBox />
          </div>

          {/* 사용 예시 텍스트 */}
          <div className="mb-16 text-center">
            <p className="text-gray-500 text-sm">
              예: "경복궁", "부산 해운대", "제주도 성산일출봉", "명동 카페거리"
            </p>
          </div>

          {/* 3D 카드들 - 사용법 (높이 축소) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            {[
              { 
                step: "01", 
                title: "장소 입력", 
                desc: "궁금한 곳의 이름을 입력하세요",
                icon: <Search className="w-6 h-6" />,
                color: "from-gray-900 to-black"
              },
              { 
                step: "02", 
                title: "AI 분석", 
                desc: "실시간으로 이야기를 찾아 구성합니다",
                icon: <Headphones className="w-6 h-6" />,
                color: "from-gray-800 to-gray-900"
              },
              { 
                step: "03", 
                title: "현장 감상", 
                desc: "텍스트와 음성으로 생생하게 체험하세요",
                icon: <Play className="w-6 h-6" />,
                color: "from-gray-700 to-gray-800"
              }
            ].map((item, index) => (
              <div 
                key={index}
                className="relative group cursor-pointer"
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* 메인 카드 */}
                <div className={`relative bg-white rounded-2xl p-6 border border-gray-200 transition-all duration-500 ${
                  hoveredCard === index ? 'transform -translate-y-2 shadow-xl' : 'shadow-md'
                }`}>
                  {/* 스텝 번호 - 3D 효과 */}
                  <div className="relative mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl shadow-md flex items-center justify-center transform transition-transform duration-300 ${
                      hoveredCard === index ? 'rotate-3 scale-105' : ''
                    }`}>
                      <span className="text-white font-bold text-lg">{item.step}</span>
                    </div>
                    {/* 번호 그림자 */}
                    <div className="absolute top-1 left-1 w-12 h-12 bg-gray-400/20 rounded-xl -z-10 blur-sm"></div>
                  </div>

                  {/* 아이콘 */}
                  <div className={`text-black mb-3 transition-all duration-300 ${
                    hoveredCard === index ? 'transform scale-105' : ''
                  }`}>
                    {item.icon}
                  </div>

                  <h3 className="text-lg font-bold text-black mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>

                  {/* 호버 시 화살표 */}
                  <div className={`mt-3 text-black transition-all duration-300 ${
                    hoveredCard === index ? 'opacity-100 transform translate-x-1' : 'opacity-0'
                  }`}>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                {/* 카드 그림자 */}
                <div className={`absolute top-1 left-1 right-1 bottom-1 bg-gray-300/15 rounded-2xl -z-10 blur-sm transition-all duration-500 ${
                  hoveredCard === index ? 'opacity-100' : 'opacity-50'
                }`}></div>
              </div>
            ))}
          </div>

          {/* 데모 섹션 - 플로팅 박스 */}
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-gray-50 rounded-3xl p-8 md:p-12 border border-gray-200 shadow-xl">
              <div className="flex flex-col md:flex-row items-start gap-6">
                {/* 3D 아이콘 */}
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 bg-black rounded-2xl shadow-lg flex items-center justify-center transform rotate-3">
                    <Headphones className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute top-1 left-1 w-16 h-16 bg-gray-400/30 rounded-2xl -z-10 blur-sm"></div>
                </div>

                <div className="flex-1">
                  <h4 className="text-2xl font-bold text-black mb-4">실제 사용 예시</h4>
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <p className="text-gray-800 text-lg leading-relaxed mb-4">
                      "여기서 보이는 이 웅장한 문은 광화문입니다. 1395년 태조 이성계가 조선을 건국하며 세운 경복궁의 정문이죠. 
                      흥미롭게도 이 문은 일제강점기와 6.25 전쟁을 거치며 세 번이나 이전되었다가..."
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-600 font-medium">경복궁에서 실시간 재생 중</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* 섹션 그림자 */}
            <div className="absolute top-2 left-2 right-2 bottom-2 bg-gray-300/20 rounded-3xl -z-10 blur-sm"></div>
          </div>
        </div>
      </section>
    </main>
  );
}