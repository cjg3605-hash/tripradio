'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import GuideGenerating from '@/components/guide/GuideGenerating';

// 검색 제안 인터페이스
interface Suggestion {
  id?: string;
  name: string;
  location: string;
}

export default function HomePage() {
  const router = useRouter();
  const { currentLanguage, t } = useLanguage();
  
  // 상태 관리
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentWord, setCurrentWord] = useState(0);
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([
    { name: '경복궁', location: '서울 종로구' },
    { name: '부산 해운대', location: '부산 해운대구' },
    { name: '제주도 성산일출봉', location: '제주 서귀포시' }
  ]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  
  // 기능 상태
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);

  // 회전하는 단어들
  const words = [
    t('home.features.personalizedGuides') || '맞춤형추천',
    t('home.features.audioNarration') || '음성해설',
    t('home.features.multiLanguage') || '다국어지원',
    t('home.features.offlineAccess') || '오프라인'
  ];

  // 회전하는 플레이스홀더
  const placeholders = [
    '강릉 커피거리',
    '경복궁',
    '부산 해운대',
    '제주도 성산일출봉',
    '명동 카페거리'
  ];

  useEffect(() => {
    setIsLoaded(true);
    
    // 단어 회전
    const wordInterval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 3000);

    // 플레이스홀더 회전
    const placeholderInterval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);

    return () => {
      clearInterval(wordInterval);
      clearInterval(placeholderInterval);
    };
  }, [words.length, placeholders.length]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 자동완성 API 호출
  const fetchSuggestions = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([
        { name: '경복궁', location: '서울 종로구' },
        { name: '부산 해운대', location: '부산 해운대구' },
        { name: '제주도 성산일출봉', location: '제주 서귀포시' }
      ]);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const response = await fetch(`/api/locations/search?q=${encodeURIComponent(searchQuery)}&lang=${currentLanguage}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setSuggestions(data.data.slice(0, 5)); // 최대 5개 제안
      } else {
        console.warn('자동완성 API 응답 오류:', data.error);
        // 기본 제안 유지
      }
    } catch (error) {
      console.error('자동완성 API 호출 실패:', error);
      // 에러 시 기본 제안 유지
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // 디바운스된 검색 함수
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim() && isFocused) {
        fetchSuggestions(query.trim());
      }
    }, 300); // 300ms 디바운스

    return () => clearTimeout(timeoutId);
  }, [query, currentLanguage, isFocused]);

  // 검색 실행
  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsGenerating(true);
    try {
      router.push(`/guide/${encodeURIComponent(query.trim())}`);
    } catch (error) {
      console.error('검색 오류:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };



  // AI 가이드 생성
  const handleAIGeneration = async () => {
    if (!query.trim()) {
      alert('먼저 장소를 입력해주세요.');
      return;
    }

    setIsGenerating(true);
    try {
      console.log('🚀 AI 가이드 생성 요청 시작:', {
        url: '/api/ai/generate-guide-with-gemini',
        method: 'POST',
        location: query.trim(),
        language: currentLanguage,
        library: 'Gemini 완전 라이브러리'
      });

      // 완전한 Gemini 라이브러리 사용으로 변경
      const response = await fetch('/api/ai/generate-guide-with-gemini', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          location: query.trim(),
          userProfile: {
            language: currentLanguage,
            interests: ['문화', '역사'],
            knowledgeLevel: '중급',
            ageGroup: '30대',
            preferredStyle: '친근함',
            tourDuration: 90,
            companions: 'solo'
          }
        }),
      });

      console.log('📡 응답 수신:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ 가이드 생성 성공:', data);
        router.push(`/guide/${encodeURIComponent(query.trim())}/tour`);
      } else {
        const errorData = await response.json().catch(() => ({ 
          error: `HTTP ${response.status}: ${response.statusText}` 
        }));
        console.error('❌ 가이드 생성 실패:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        alert(errorData.error || `가이드 생성에 실패했습니다 (${response.status})`);
      }
    } catch (error) {
      console.error('❌ AI 생성 오류:', error);
      alert('가이드 생성 중 네트워크 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 오디오 재생
  const handleAudioPlayback = () => {
    if (!query.trim()) {
      alert('먼저 장소를 입력해주세요.');
      return;
    }

    setAudioPlaying(!audioPlaying);
    
    setTimeout(() => {
      router.push(`/guide/${encodeURIComponent(query.trim())}/tour`);
    }, 1000);
  };

  // 가이드 생성 중일 때 새로운 컴포넌트 표시
  if (isGenerating) {
    return (
      <GuideGenerating
        locationName={query}
        onCancel={() => setIsGenerating(false)}
        onComplete={() => {
          setIsGenerating(false);
          router.push(`/guide/${encodeURIComponent(query.trim())}`);
        }}
        userPreferences={{
          interests: ['문화', '역사', '건축'],
          ageGroup: '30대',
          language: currentLanguage
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">



      {/* Main Content */}
      <main className="relative overflow-hidden">
        {/* Geometric Background Elements */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div 
            className="absolute w-96 h-96 border border-black/5 rounded-full transition-transform duration-1000 z-0"
            style={{
              top: '10%',
              right: '10%',
              transform: `translate(${mousePosition.x * -0.02}px, ${mousePosition.y * -0.02}px)`
            }}
          />
          
          <div 
            className="absolute w-20 h-px bg-black opacity-15 transition-transform duration-700 z-0"
            style={{
              top: '35%',
              left: '8%',
              transform: `translate(${mousePosition.x * -0.01}px, ${mousePosition.y * 0.01}px)`
            }}
          />
        </div>

        {/* Hero Section */}
        <section className="relative z-10 flex flex-col items-center justify-center px-6 pt-12 pb-20">
          
          {/* Hero Typography */}
          <div className={`
            pb-20 px-4 transform transition-all duration-1000
            ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
          `}>
            {/* Main Title */}
            <h1 className="text-2xl md:text-3xl font-thin tracking-[-0.02em] text-black mb-8">
              <div>
                {/* 상단: 내손안의 (왼쪽 정렬) */}
                <div className="mb-4 text-left">
                  <span className="block font-bold text-2xl">
                    {t('home.brandTitle') || '내 손안의'}
                  </span>
                </div>
                
                {/* 하단 중앙: 회전하는 단어들 */}
                <div className="flex justify-center">
                  <div className="overflow-hidden" style={{ height: '32px', lineHeight: '32px' }}>
                    <span 
                      className="inline-block transition-transform duration-1000 ease-out font-bold text-2xl"
                      style={{
                        transform: `translateY(-${currentWord * 32}px)`
                      }}
                    >
                      {words.map((word, index) => (
                        <span key={index} className="block" style={{ height: '32px', lineHeight: '32px' }}>
                          {word}
                        </span>
                      ))}
                    </span>
                  </div>
                </div>
              </div>
            </h1>

            {/* Decorative Element */}
            <div className="flex items-center justify-center gap-8 mb-12 relative z-0">
              <div className="w-12 h-px bg-black opacity-30"></div>
              <div className="w-1 h-1 bg-black rounded-full opacity-50"></div>
              <div className="w-1 h-1 bg-black rounded-full opacity-30"></div>
              <div className="w-1 h-1 bg-black rounded-full opacity-20"></div>
              <div className="w-12 h-px bg-black opacity-30"></div>
            </div>

            {/* Subtitle */}
            <div className="text-center space-y-2 mb-1">
              <p className="text-base text-gray-500 font-light tracking-wide">
                {currentLanguage === 'ko' ? '가이드없이 자유롭게,' : t('home.subtitle')}
              </p>
              <p className="text-lg text-gray-700 font-light tracking-wide">
                {currentLanguage === 'ko' ? '여행은 깊이있게' : t('home.subtitle2')}
              </p>
              <p className="text-base text-black font-light tracking-wide">
                {currentLanguage === 'ko' ? 'AI가 찾아낸 가장 완벽한 가이드해설' : t('home.description')}
              </p>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative z-50 w-full max-w-2xl mx-auto">
            <div className={`
              relative transition-all duration-700 ease-out
              ${isFocused 
                ? 'scale-105 translate-y-[-8px]' 
                : 'scale-100 translate-y-0'
              }
            `}>
              <div className={`
                relative bg-white rounded-3xl transition-all duration-500
                ${isFocused 
                  ? 'shadow-2xl shadow-black/15 ring-1 ring-black/5' 
                  : 'shadow-xl shadow-black/10'
                }
              `}>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                  placeholder={placeholders[placeholderIndex]}
                  className="w-full px-8 py-6 text-xl font-light text-black bg-transparent rounded-3xl focus:outline-none transition-all duration-300 placeholder-gray-400"
                />
                
                <button
                  onClick={handleSearch}
                  disabled={!query.trim() || isGenerating}
                  className={`
                    absolute right-4 top-1/2 transform -translate-y-1/2
                    w-14 h-14 rounded-2xl transition-all duration-300
                    flex items-center justify-center group
                    ${query.trim() && !isGenerating
                      ? 'bg-black text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95' 
                      : 'bg-black text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 opacity-50 cursor-not-allowed'
                    }
                  `}
                >
                  {isGenerating ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-6 h-6 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Suggestions Dropdown */}
              {isFocused && query.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white rounded-2xl shadow-2xl shadow-black/15 border border-gray-100 overflow-hidden z-10">
                  {isLoadingSuggestions ? (
                    <div className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                        <span className="text-sm text-gray-500">검색 중...</span>
                      </div>
                    </div>
                  ) : suggestions.length > 0 ? (
                    suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setQuery(suggestion.name);
                          setIsFocused(false);
                          setTimeout(() => handleSearch(), 100);
                        }}
                        className="w-full px-6 py-4 text-left transition-all duration-200 group hover:bg-gray-50"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900 group-hover:text-black">
                              {suggestion.name}
                            </div>
                            {suggestion.location && (
                              <div className="text-sm text-gray-500 mt-1">
                                {suggestion.location}
                              </div>
                            )}
                          </div>
                          <div className="opacity-0 translate-x-2 group-hover:opacity-60 group-hover:translate-x-0 transition-all duration-200">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-6 py-4 text-center text-sm text-gray-500">
                      검색 결과가 없습니다
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Features Section - 3개 원형 아이콘 */}
        <section className="relative z-10 py-8">
          <div className="max-w-6xl mx-auto px-6">
            {/* 모든 화면에서 가로 배열 */}
            <div className="flex flex-row justify-center items-start gap-2 sm:gap-4 md:gap-8 mb-16">
              
              {/* 장소 입력 */}
              <div className="text-center relative z-10 flex-1 max-w-32 sm:max-w-xs">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full flex items-center justify-center bg-black text-white mb-3 sm:mb-4 shadow-lg">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="h-16 sm:h-20 flex flex-col justify-center">
                  <div className="text-sm sm:text-lg font-medium text-black mb-1">장소 입력</div>
                  <div className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                    궁금한 곳의<br />이름을 입력하세요
                  </div>
                </div>
              </div>

              {/* 화살표 1 */}
              <div className="flex items-center justify-center pt-6 sm:pt-8">
                <svg className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {/* AI 생성 */}
              <div className="text-center relative z-10 flex-1 max-w-32 sm:max-w-xs">
                <button 
                  onClick={handleAIGeneration}
                  disabled={!query.trim() || isGenerating}
                  className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full flex items-center justify-center hover:scale-105 transition-all duration-300 shadow-lg mb-3 sm:mb-4 bg-black text-white ${
                    isGenerating ? 'animate-pulse' : ''
                  } ${!query.trim() ? 'opacity-100 cursor-not-allowed' : ''}`}
                >
                  {isGenerating ? (
                    <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                </button>
                <div className="h-16 sm:h-20 flex flex-col justify-center">
                  <div className="text-sm sm:text-lg font-medium text-black mb-1">AI 생성</div>
                  <div className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                    실시간으로<br />맞춤 가이드 생성
                  </div>
                </div>
              </div>

              {/* 화살표 2 */}
              <div className="flex items-center justify-center pt-6 sm:pt-8">
                <svg className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {/* 오디오 재생 */}
              <div className="text-center relative z-10 flex-1 max-w-32 sm:max-w-xs">
                <button 
                  onClick={handleAudioPlayback}
                  disabled={!query.trim()}
                  className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full flex items-center justify-center hover:scale-105 transition-all duration-300 shadow-lg mb-3 sm:mb-4 bg-black text-white ${
                    audioPlaying ? 'animate-pulse' : ''
                  } ${!query.trim() ? 'opacity-100 cursor-not-allowed' : ''}`}
                >
                  {audioPlaying ? (
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>
                <div className="h-16 sm:h-20 flex flex-col justify-center">
                  <div className="text-sm sm:text-lg font-medium text-black mb-1">오디오 재생</div>
                  <div className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                    음성으로 생생한<br />현장 해설
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}