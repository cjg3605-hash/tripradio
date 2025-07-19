'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { Search, ArrowRight } from 'lucide-react';

// 검색 제안 인터페이스
interface Suggestion {
  id?: string;
  name: string;
  location: string;
}

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const { currentLanguage, t } = useLanguage();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // 인기 여행지 (미니멀)
  const popularDestinations = [
    { name: '경복궁', icon: '🏛️' },
    { name: '제주도 성산일출봉', icon: '🌋' },
    { name: '부산 해운대', icon: '🏖️' },
    { name: '강릉 커피거리', icon: '☕' }
  ];

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

  const handleDestinationClick = (destination: { name: string }) => {
    handleSearch(destination.name);
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

  return (
    <div className="min-h-screen bg-white">
      {/* 메인 히어로 섹션 */}
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        {/* 브랜드 타이틀 */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-light text-black mb-4 tracking-tight">
            스마트한 여행
          </h1>
          <h2 className="text-3xl md:text-5xl font-normal text-blue-600 mb-6">
            AI Personalizado
          </h2>
          <p className="text-lg text-gray-600 max-w-lg mx-auto leading-relaxed">
            어디든지 입력하면, AI가 개인 맞춤형 음성 가이드를 
            <span className="text-blue-600 font-medium"> 실시간으로 생성</span>해드립니다
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
                placeholder="경북궁"
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
          {suggestions.length > 0 && (
            <div className="absolute w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg z-10">
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id || suggestion.name}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-2xl last:rounded-b-2xl
                           ${index === selectedIndex ? 'bg-blue-50' : ''}`}
                >
                  <div className="font-medium text-gray-900">{suggestion.name}</div>
                  {suggestion.location && (
                    <div className="text-sm text-gray-500">{suggestion.location}</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 인기 여행지 */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <h3 className="text-xl font-medium text-center text-gray-700 mb-8">
          인기 여행지
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {popularDestinations.map((destination) => (
            <button
              key={destination.name}
              onClick={() => handleDestinationClick(destination)}
              className="p-6 bg-white border border-gray-200 rounded-2xl hover:border-gray-300 
                       hover:shadow-sm transition-all duration-200 text-center group"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">
                {destination.icon}
              </div>
              <div className="font-medium text-gray-900 text-sm">
                {destination.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 하단 앱 정보 (미니멀) */}
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