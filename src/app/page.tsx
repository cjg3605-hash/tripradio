'use client';

import SearchBox from '@/components/home/SearchBox';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* 히어로 섹션 */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-br from-blue-50 via-white to-cyan-50" aria-label="메인 히어로 섹션">
        <div className="text-center max-w-4xl mx-auto">
          {/* 제목 */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight" role="banner">
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              AI 가이드
            </span>
            <br />
            <span className="text-2xl md:text-4xl lg:text-5xl text-gray-600">
              어디든 떠나보세요
            </span>
          </h1>
          
          {/* 부제목 */}
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            AI가 만들어주는 맞춤형 여행 가이드로<br />
            새로운 모험을 시작하세요
          </p>
          
          {/* 검색 박스 */}
          <div className="w-full max-w-2xl mx-auto">
            <SearchBox />
          </div>
          
          {/* 특징 소개 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl" role="img" aria-label="로봇">🤖</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI 맞춤 가이드</h3>
              <p className="text-gray-600">당신의 취향에 맞는 완벽한 여행 계획을 AI가 제안합니다</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl" role="img" aria-label="지도">🗺️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">실시간 경로</h3>
              <p className="text-gray-600">최적화된 경로와 실시간 지도로 효율적인 여행을 돕습니다</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl" role="img" aria-label="헤드폰">🎧</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">음성 가이드</h3>
              <p className="text-gray-600">손이 자유로운 음성 가이드로 편안한 여행을 즐기세요</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
} 