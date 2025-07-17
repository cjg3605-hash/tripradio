'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

interface Suggestion {
  id?: string;
  name: string;
  location: string;
}

export default function SearchBox() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { currentLanguage } = useLanguage();

  // 언어별 플레이스홀더 텍스트 - Ultra Minimal
  const getPlaceholderText = () => {
    const placeholders = {
      ko: '어디의 이야기가 궁금하세요?',
      en: 'Which place would you like to learn about?',
      ja: 'どちらの場所のお話を聞きたいですか？',
      zh: '您想了解哪个地方的故事？',
      es: '¿De qué lugar te gustaría escuchar la historia?'
    };
    return placeholders[currentLanguage as keyof typeof placeholders] || placeholders.ko;
  };

  // 검색 추천 기능
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (isSubmitting) return;

    const timer = setTimeout(async () => {
      setIsSuggesting(true);
      setError(null);
      try {
        const response = await fetch(`/api/locations/search?q=${encodeURIComponent(query)}&lang=${currentLanguage}`);
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          setSuggestions(data.data);
          setShowSuggestions(data.data.length > 0);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsSuggesting(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, currentLanguage, isSubmitting]);

  // 가이드 페이지로 이동
  const navigateToGuide = (locationName: string) => {
    try {
      const encodedName = encodeURIComponent(locationName);
      router.push(`/guide/${encodedName}`);
    } catch (error) {
      console.error('네비게이션 오류:', error);
      setIsSubmitting(false);
    }
  };

  // 검색 실행
  const handleSearch = () => {
    if (isSubmitting || isSuggesting || !query.trim()) return;
    
    setIsSubmitting(true);
    setError(null);
    setShowSuggestions(false);

    setTimeout(() => {
      navigateToGuide(query.trim());
    }, 100);
  };

  // 엔터키 처리
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  // 제안 클릭
  const handleSuggestionClick = (suggestion: Suggestion) => {
    const newQuery = suggestion.name;
    setQuery(newQuery);
    setShowSuggestions(false);
    
    setTimeout(() => {
      setIsSubmitting(true);
      setError(null);
      navigateToGuide(newQuery);
    }, 0);
  };

  // 입력창 외부 클릭 시 제안 숨기기
  const handleInputBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <div className="relative w-full max-w-xl mx-auto">
      
      {/* Ultra Minimal Search Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={handleInputBlur}
          placeholder={getPlaceholderText()}
          className="w-full px-0 py-6 text-xl font-light text-black placeholder-gray-400 bg-transparent border-0 border-b-2 border-gray-200 focus:border-black focus:outline-none transition-colors duration-300"
        />
        
        {/* Search Button - Ultra Minimal */}
        <button
          type="button"
          onClick={handleSearch}
          onMouseDown={(e) => e.preventDefault()}
          disabled={!query.trim() || isSubmitting || isSuggesting}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black text-white rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-800 transition-all duration-200 flex items-center justify-center group"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <div className="w-0.5 h-4 bg-white group-hover:scale-110 transition-transform"></div>
          )}
        </button>
      </div>

      {/* Loading Indicator - Ultra Minimal */}
      {isSuggesting && (
        <div className="absolute top-full left-0 right-0 mt-4 py-4 text-center">
          <div className="inline-flex items-center gap-2 text-gray-500 text-sm font-light">
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      )}

      {/* Suggestions - Ultra Minimal */}
      {showSuggestions && suggestions.length > 0 && !isSuggesting && (
        <div className="absolute top-full left-0 right-0 mt-4 bg-white border border-gray-100 shadow-sm max-h-80 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.id || suggestion.name}-${index}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSuggestionClick(suggestion)}
              className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-b-0 transition-colors duration-150"
            >
              <div className="text-black font-light mb-1">
                {suggestion.name}
              </div>
              <div className="text-sm text-gray-500 font-light">
                {suggestion.location}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* No Results - Ultra Minimal */}
      {query.length >= 2 && !isSuggesting && suggestions.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-4 py-4 text-center">
          <p className="text-gray-500 text-sm font-light mb-2">"{query}" 바로 가이드 생성하기</p>
          <button
            type="button"
            onClick={handleSearch}
            className="text-black hover:text-gray-600 text-sm font-light underline transition-colors duration-150"
          >
            가이드 생성하기 →
          </button>
        </div>
      )}

      {/* Error Message - Ultra Minimal */}
      {error && (
        <div className="absolute top-full left-0 right-0 mt-4 py-4 text-center">
          <p className="text-red-500 text-sm font-light mb-2">{error}</p>
          <button
            type="button"
            onClick={handleSearch}
            className="text-black hover:text-gray-600 text-sm font-light underline transition-colors duration-150"
          >
            다시 시도하기
          </button>
        </div>
      )}
    </div>
  );
}