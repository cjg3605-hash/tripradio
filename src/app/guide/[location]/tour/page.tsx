'use client';

import { SearchBox } from '@/components/home/SearchBox';
import { Headphones, MapPin, BookOpen } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* 히어로 섹션 */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-br from-indigo-50 via-white to-blue-50" aria-label="메인 히어로 섹션">
        <div className="text-center max-w-4xl mx-auto">
          {/* 개선된 제목 */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight" role="banner">
            <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent flex items-center justify-center gap-4">
              <Headphones className="w-12 h-12 md:w-16 md:h-16 text-indigo-600" />
              내 손안의 도슨트
            </span>
            <br />
            <span className="text-2xl md:text-4xl lg:text-5xl text-gray-700 font-medium">
              NAVI 오디오 가이드
            </span>
          </h1>
          
          {/* 개선된 부제목 */}
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            어떤 장소에서든 그 곳만의 특별한 이야기를 들려드립니다<br />
            <span className="text-lg text-indigo-600 font-medium">📍 텍스트 + 🎧 음성으로 생생한 현장 해설</span>
          </p>
          
          {/* 검색 박스 */}
          <div className="w-full max-w-2xl mx-auto">
            <SearchBox />
          </div>

          {/* 사용 예시 텍스트 */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              예: "경복궁", "부산 해운대", "제주도 성산일출봉", "명동 카페거리"
            </p>
          </div>

          {/* 사용 방법 미리보기 */}
          <div className="mt-16 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-8 border border-indigo-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">💡 이렇게 사용하세요</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">장소 검색</h4>
                  <p className="text-sm text-gray-600">궁금한 장소나 건물 이름을 입력하세요</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">가이드 생성</h4>
                  <p className="text-sm text-gray-600">AI가 그 장소의 이야기를 찾아 정리합니다</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">현장에서 감상</h4>
                  <p className="text-sm text-gray-600">텍스트로 읽고 오디오로 들으며 현장을 더 깊이 이해하세요</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}