'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { Search, MapPin, Globe, Headphones, Sparkles, ArrowRight, ChevronRight } from 'lucide-react';

// 검색 제안 인터페이스
interface Suggestion {
  id?: string;
  name: string;
  location: string;
}

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [currentWord, setCurrentWord] = useState(0);
  
  const { currentLanguage, t } = useLanguage();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // 회전하는 단어들
  const words = [
    '여행동반자',
    'AI 도슨트', 
    '맞춤형 추천',
    '다국어 지원'
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

  // 단어 회전 애니메이션
  useEffect(() => {
    const wordInterval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 3000);

    return () => clearInterval(wordInterval);
  }, []);

  // 검색 제안 API 호출
  useEffect(() => {
    if (query.length >= 2) {
      setIsTyping(true);
      const timer = setTimeout(async () => {
        try {
          const response = await fetch(`/api/locations/search?q=${encodeURIComponent(query)}&lang=${currentLanguage}`);
          if (response.ok) {
            const data = await response.json();
            setSuggestions(data.success ? data.data.slice(0, 5) : []);
          }
        } catch (error) {
          console.error('검색 제안 오류:', error);
          setSuggestions([]);
        } finally {
          setIsTyping(false);
        }
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setIsTyping(false);
      setSelectedIndex(-1);
      return undefined;
    }
  }, [query, currentLanguage]);

  // 검색 처리
  const handleSearch = async (searchQuery: string) => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery || isSubmitting) return;

    setIsSubmitting(true);
    try {
      router.push(`/search?q=${encodeURIComponent(trimmedQuery)}&lang=${currentLanguage}`);
    } catch (error) {
      console.error('검색 오류:', error);
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    handleSearch(suggestion.name);
  };

  // 키보드 네비게이션
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleSubmit(e);
        }
        break;
      case 'Escape':
        setSuggestions([]);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
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

  return (
    <div className="min-h-screen bg-white">
      {/* 메인 히어로 섹션 */}
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        {/* 브랜드 타이틀 - 원래 캡쳐 텍스트 */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-light text-gray-600 mb-2">
            내 손안의
          </h1>
          <h2 className="text-3xl md:text-5xl font-normal text-black mb-4">
            <span 
              key={currentWord}
              className="inline-block transition-all duration-500"
            >
              {words[currentWord]}
            </span>
          </h2>
          <p className="text-xl font-medium text-black mb-2">
            가이드없이 자유롭게!
          </p>
          <p className="text-lg text-black mb-6">
            여행은 길이있게
          </p>
          <p className="text-base text-gray-600 max-w-lg mx-auto">
            AI가 찾아낸 가장 알맞은 가이드해설
          </p>
        </div>

        {/* 검색 영역 */}
        <div className="w-full max-w-2xl relative">
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="부산 해운대"
                className="w-full px-6 py-4 text-lg bg-gray-50 border border-gray-200 rounded-full 
                         focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent
                         transition-all duration-200"
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={!query.trim() || isSubmitting}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 
                         w-12 h-12 bg-blue-600 text-white rounded-full 
                         flex items-center justify-center hover:bg-blue-700 
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-200"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* 검색 제안 */}
          {(suggestions.length > 0 || isTyping) && isFocused && (
            <div className="absolute w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg z-10">
              {isTyping ? (
                <div className="flex items-center justify-center py-4">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mr-2" />
                  <span className="text-gray-500 text-sm">검색 중...</span>
                </div>
              ) : (
                suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.id || suggestion.name}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-2xl last:rounded-b-2xl
                             flex items-center justify-between group transition-colors duration-150
                             ${index === selectedIndex ? 'bg-blue-50' : ''}`}
                  >
                    <div>
                      <div className="font-medium text-gray-900">{suggestion.name}</div>
                      {suggestion.location && (
                        <div className="text-sm text-gray-500">{suggestion.location}</div>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* 기능 소개 섹션 */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="text-center mb-12">
          <h3 className="text-2xl font-light text-gray-800 mb-4">
            AI가 만드는 특별한 여행 경험
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            최첨단 AI 기술로 당신만을 위한 개인 맞춤형 가이드를 실시간으로 생성합니다
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 
                              group-hover:bg-blue-100 transition-colors duration-200">
                  <IconComponent className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 하단 앱 정보 */}
      <div className="text-center pb-16 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-sm text-gray-500 mb-2">
            🎧 navi-guide ai sight vercel app
          </div>
          <div className="text-xs text-gray-400">
            공급한 공간의 이름을 입력하세요
          </div>
        </div>
      </div>
    </div>
  );
}