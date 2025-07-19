'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { Search, MapPin, Globe, Headphones, Sparkles, ArrowRight, Play, ChevronRight } from 'lucide-react';

// 검색 제안 인터페이스
interface Suggestion {
  id?: string;
  name: string;
  location: string;
}

export default function HomePage() {
  // 상태 관리
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentWord, setCurrentWord] = useState(0);
  
  // 검색 관련 상태
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  
  // 컨텍스트 & 훅
  const { currentLanguage, t } = useLanguage();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // 회전하는 단어들 (기존 + 추가)
  const words = [
    'AI 도슨트',
    t?.home?.features?.personalized || '맞춤형 추천',
    t?.home?.features?.multiLanguage || '다국어 지원',
    '스토리텔러'
  ];

  // 회전하는 플레이스홀더
  const placeholders = [
    '강릉 커피거리',
    '경복궁',
    '부산 해운대',
    '제주도 성산일출봉',
    '명동 카페거리'
  ];

  // 인기 여행지
  const popularDestinations = [
    { name: '경복궁', category: '궁궐', emoji: '🏛️' },
    { name: '제주도 성산일출봉', category: '자연', emoji: '🌋' },
    { name: '부산 해운대', category: '해변', emoji: '🏖️' },
    { name: '강릉 커피거리', category: '문화', emoji: '☕' }
  ];

  // 기능 소개
  const features = [
    { 
      icon: Headphones, 
      title: 'AI 음성 가이드', 
      description: '전문 도슨트의 해설을 AI 음성으로' 
    },
    { 
      icon: Globe, 
      title: '다국어 지원', 
      description: '한국어, 영어, 일본어 등 지원' 
    },
    { 
      icon: MapPin, 
      title: '맞춤형 루트', 
      description: '당신의 취향에 맞는 여행 코스' 
    },
    { 
      icon: Sparkles, 
      title: '실시간 생성', 
      description: '현장에서 바로 생성되는 가이드' 
    }
  ];

  // 페이지 로드 애니메이션
  useEffect(() => {
    setIsLoaded(true);
    
    const wordInterval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 3000);

    const placeholderInterval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);

    return () => {
      clearInterval(wordInterval);
      clearInterval(placeholderInterval);
    };
  }, [words.length, placeholders.length]);

  // 최적화된 마우스 추적 (기존 유지)
  useEffect(() => {
    let animationFrameId: number;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      
      animationFrameId = requestAnimationFrame(() => {
        setMousePosition({ x: e.clientX, y: e.clientY });
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  // 실시간 검색 제안 (FIXED: 모든 코드 경로에서 반환값 제공)
  useEffect(() => {
    if (query.length >= 2) {
      setIsTyping(true);
      const timer = setTimeout(async () => {
        try {
          const response = await fetch(`/api/locations/search?q=${encodeURIComponent(query)}&lang=${currentLanguage}`);
          const data = await response.json();
          setSuggestions(data.success ? data.suggestions.slice(0, 5) : []);
          setIsTyping(false);
        } catch (error) {
          console.error('Search suggestions error:', error);
          setSuggestions([]);
          setIsTyping(false);
        }
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setIsTyping(false);
      // 명시적으로 undefined 반환 (모든 코드 경로에서 반환값 제공)
      return undefined;
    }
  }, [query, currentLanguage]);

  // 키보드 네비게이션 (기존 유지)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSuggestionClick(suggestions[selectedIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  const handleSearch = () => {
    if (!query.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    setIsFocused(false);
    
    setTimeout(() => {
      router.push(`/guide/${encodeURIComponent(query.trim())}`);
    }, 100);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setQuery(suggestion.name);
    setIsFocused(false);
    setIsSubmitting(true);
    
    setTimeout(() => {
      router.push(`/guide/${encodeURIComponent(suggestion.name)}`);
    }, 0);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsFocused(false);
      setSelectedIndex(-1);
    }, 200);
  };

  const handlePopularDestinationClick = (destination: { name: string }) => {
    setIsSubmitting(true);
    router.push(`/guide/${encodeURIComponent(destination.name)}`);
  };

  return (
    <>
      {/* 배경 오버레이 */}
      {isFocused && (
        <div className="fixed inset-0 bg-black/5 backdrop-blur-sm z-40 transition-all duration-500" />
      )}
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 overflow-hidden">
        {/* 배경 장식 요소 */}
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="absolute w-96 h-96 bg-blue-100/30 rounded-full blur-3xl transition-all duration-1000 ease-out"
            style={{
              left: mousePosition.x * 0.1,
              top: mousePosition.y * 0.1,
            }}
          />
          <div 
            className="absolute w-80 h-80 bg-purple-100/20 rounded-full blur-2xl transition-all duration-1000 ease-out"
            style={{
              right: (window.innerWidth - mousePosition.x) * 0.05,
              bottom: (window.innerHeight - mousePosition.y) * 0.05,
            }}
          />
        </div>

        <div className="relative z-10">
          {/* 메인 컨테이너 */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* 히어로 섹션 */}
            <div className="pt-20 sm:pt-32 pb-16 sm:pb-20 text-center">
              
              {/* 메인 타이틀 */}
              <div className={`mb-8 sm:mb-12 transition-all duration-1000 ease-out ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}>
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                    스마트한 여행
                  </span>
                  <br />
                  <span className="inline-flex items-center">
                    <span className="mr-3 sm:mr-4">AI </span>
                    <span 
                      key={currentWord}
                      className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-pulse"
                    >
                      {words[currentWord]}
                    </span>
                  </span>
                </h1>
                
                <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  어디든지 입력하면, AI가 개인 맞춤형 음성 가이드를 
                  <br className="hidden sm:inline" />
                  <span className="text-blue-600 font-medium"> 실시간으로 생성</span>해드립니다
                </p>
              </div>

              {/* 검색 박스 */}
              <div className={`relative mb-12 sm:mb-16 transition-all duration-1000 ease-out delay-200 ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}>
                
                {/* 검색 카드 */}
                <div className={`max-w-2xl mx-auto transform transition-all duration-700 ease-out ${
                  isFocused 
                    ? 'scale-105 translate-y-[-8px]' 
                    : 'scale-100 translate-y-0'
                }`}>
                  
                  {/* Input Container */}
                  <div className={`relative bg-white rounded-2xl sm:rounded-3xl transition-all duration-500 ${
                    isFocused 
                      ? 'shadow-2xl shadow-black/15 ring-1 ring-blue-500/30' 
                      : 'shadow-xl shadow-black/10 hover:shadow-2xl'
                  }`}>
                    
                    {/* Main Input */}
                    <div className="flex items-center">
                      <Search className="absolute left-4 sm:left-6 w-5 h-5 text-gray-400 z-10" />
                      <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder={placeholders[placeholderIndex]}
                        disabled={isSubmitting}
                        className={`w-full pl-12 sm:pl-16 pr-24 sm:pr-32 py-4 sm:py-5 md:py-6 text-base sm:text-lg md:text-xl font-light text-black bg-transparent rounded-2xl sm:rounded-3xl focus:outline-none transition-all duration-300 placeholder-gray-400 ${
                          isSubmitting ? 'cursor-not-allowed opacity-50' : ''
                        }`}
                      />
                      
                      {/* Search Button */}
                      <button
                        onClick={handleSearch}
                        disabled={!query.trim() || isSubmitting}
                        className="absolute right-2 sm:right-3 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-xl sm:rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 text-sm sm:text-base font-medium"
                      >
                        {isSubmitting ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <span className="hidden sm:inline">가이드 생성</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>

                    {/* Search Suggestions */}
                    {isFocused && (suggestions.length > 0 || isTyping) && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-100 py-2 max-h-64 overflow-y-auto z-60">
                        {isTyping ? (
                          <div className="flex items-center justify-center py-4">
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mr-2" />
                            <span className="text-gray-500 text-sm">검색 중...</span>
                          </div>
                        ) : (
                          suggestions.map((suggestion, index) => (
                            <button
                              key={`${suggestion.name}-${index}`}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className={`w-full text-left px-4 sm:px-6 py-3 hover:bg-gray-50 transition-colors duration-150 flex items-center justify-between group ${
                                selectedIndex === index ? 'bg-blue-50' : ''
                              }`}
                            >
                              <div>
                                <div className="font-medium text-gray-900">{suggestion.name}</div>
                                <div className="text-sm text-gray-500">{suggestion.location}</div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 인기 여행지 */}
              <div className={`mb-16 sm:mb-20 transition-all duration-1000 ease-out delay-300 ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}>
                <h3 className="text-lg sm:text-xl font-medium text-gray-700 mb-6">인기 여행지</h3>
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                  {popularDestinations.map((destination, index) => (
                    <button
                      key={destination.name}
                      onClick={() => handlePopularDestinationClick(destination)}
                      disabled={isSubmitting}
                      className={`group flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 bg-white rounded-full shadow-md hover:shadow-lg border border-gray-100 hover:border-blue-200 transition-all duration-200 ${
                        isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                      }`}
                    >
                      <span className="text-lg sm:text-xl">{destination.emoji}</span>
                      <span className="font-medium text-gray-800 text-sm sm:text-base">{destination.name}</span>
                      <span className="text-xs text-gray-500 hidden sm:inline">#{destination.category}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 기능 소개 섹션 */}
            <div className={`pb-20 sm:pb-32 transition-all duration-1000 ease-out delay-500 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                  AI가 만드는 
                  <span className="text-blue-600"> 특별한 여행</span>
                </h2>
                <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                  전문 도슨트의 해설을 AI 기술로 재현하여, 언제 어디서나 개인 맞춤형 가이드를 제공합니다
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                {features.map((feature, index) => (
                  <div
                    key={feature.title}
                    className={`group bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform ${
                      isLoaded ? `animate-fade-in-up` : 'opacity-0'
                    }`}
                    style={{ animationDelay: `${600 + index * 100}ms` }}
                  >
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-blue-200 transition-colors duration-300">
                      <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{feature.title}</h3>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 애니메이션 스타일 */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(2rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </>
  );
}