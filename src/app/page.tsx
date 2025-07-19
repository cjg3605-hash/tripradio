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

  // 실시간 검색 제안 (기존 유지)
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

  const handlePopularClick = (destination: string) => {
    setQuery(destination);
    setIsSubmitting(true);
    router.push(`/guide/${encodeURIComponent(destination)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
      
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-200 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-100 rounded-full filter blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Mouse follower effect */}
      <div 
        className="fixed w-6 h-6 bg-blue-400/20 rounded-full pointer-events-none transition-transform duration-75 ease-out z-0"
        style={{
          left: mousePosition.x - 12,
          top: mousePosition.y - 12,
          transform: `scale(${isFocused ? 2 : 1})`,
        }}
      />

      {/* Main content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="pt-16 pb-8 text-center">
          
          {/* Brand title with improved mobile sizing */}
          <div className={`transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                내 손 안의
              </span>
            </h1>
            
            {/* Animated word rotation */}
            <div className="mb-6 h-12 sm:h-14 flex items-center justify-center">
              <div className="relative">
                {words.map((word, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 flex items-center justify-center text-xl sm:text-2xl md:text-3xl font-medium text-gray-700 transition-all duration-500 ${
                      currentWord === index 
                        ? 'opacity-100 scale-100 translate-y-0' 
                        : 'opacity-0 scale-95 translate-y-2'
                    }`}
                  >
                    {word}
                  </div>
                ))}
              </div>
            </div>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              AI가 실시간으로 생성하는 개인 맞춤형 여행 가이드<br />
              <span className="text-blue-600 font-medium">어디든 떠나보세요!</span>
            </p>
          </div>

          {/* Search Section */}
          <div className={`relative max-w-3xl mx-auto transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            
            {/* Background overlay on focus */}
            {isFocused && (
              <div className="fixed inset-0 bg-black/5 backdrop-blur-sm z-40 transition-all duration-500" />
            )}
            
            {/* Search Container */}
            <div className={`relative z-50 transition-all duration-700 ease-out ${
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
                      <div className="px-6 py-4 text-center text-gray-500">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                          <span>검색중...</span>
                        </div>
                      </div>
                    ) : (
                      suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className={`w-full px-4 sm:px-6 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                            selectedIndex === index ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                          }`}
                        >
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{suggestion.name}</div>
                            <div className="text-sm text-gray-500 truncate">{suggestion.location}</div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Popular Destinations */}
        <div className={`py-12 transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8">
            인기 여행지
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {popularDestinations.map((destination, index) => (
              <button
                key={index}
                onClick={() => handlePopularClick(destination.name)}
                className="group p-4 sm:p-6 bg-white rounded-xl hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:scale-105"
              >
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl mb-3">{destination.emoji}</div>
                  <div className="text-base sm:text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {destination.name}
                  </div>
                  <div className="text-sm text-gray-500 mb-3">
                    {destination.category}
                  </div>
                  <div className="flex items-center justify-center">
                    <Play className="w-4 h-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className={`py-12 transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              왜 NAVI-GUIDE인가요?
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              AI 기술로 더 스마트하고 개인화된 여행 경험을 제공합니다
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="text-center p-6 bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className={`text-center py-12 transition-all duration-1000 delay-900 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 sm:p-12 text-white">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              지금 바로 시작해보세요!
            </h2>
            <p className="text-base sm:text-lg opacity-90 mb-6">
              어떤 여행지든 검색해보세요. AI가 특별한 가이드를 만들어드립니다.
            </p>
            <button
              onClick={() => inputRef.current?.focus()}
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 hover:scale-105"
            >
              <Search className="w-5 h-5" />
              여행지 검색하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}