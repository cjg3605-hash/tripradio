'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

interface Suggestion {
  id?: string;
  name: string;
  location: string;
}

export default function NextLevelSearchBox() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { currentLanguage } = useLanguage();

  // Rotating placeholder examples
  const placeholders = [
    '경복궁',
    '부산 해운대', 
    '제주도 성산일출봉',
    '명동 카페거리',
    '강릉 커피거리'
  ];

  // Rotate placeholders
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Advanced search suggestions
  useEffect(() => {
    if (query.length >= 2) {
      setIsTyping(true);
      const timer = setTimeout(async () => {
        try {
          const response = await fetch(`/api/locations/search?q=${encodeURIComponent(query)}&lang=${currentLanguage}`);
          const data = await response.json();
          setSuggestions(data.success ? data.data.slice(0, 5) : []);
          setSelectedIndex(-1);
        } catch (error) {
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

  // Keyboard navigation
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

  return (
    <>
      {/* Background Overlay on Focus */}
      {isFocused && (
        <div className="fixed inset-0 bg-black/5 backdrop-blur-sm z-40 transition-all duration-500" />
      )}
      
      {/* Main Search Container */}
      <div className="relative z-50">
        
        {/* Search Card */}
        <div className={`
          relative transition-all duration-700 ease-out
          ${isFocused 
            ? 'scale-105 translate-y-[-8px]' 
            : 'scale-100 translate-y-0'
          }
        `}>
          
          {/* Input Container */}
          <div className={`
            relative bg-white transition-all duration-500
            ${isFocused 
              ? 'shadow-ultra ring-1 ring-black/5' 
              : 'shadow-premium'
            }
          `}
          style={{
            borderRadius: 'var(--radius-2xl)'
          }}>
            
            {/* Main Input */}
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
              // 접근성 속성
              aria-label="여행지 검색"
              aria-describedby="search-suggestions"
              aria-expanded={suggestions.length > 0 && isFocused}
              aria-autocomplete="list"
              role="combobox"
              aria-activedescendant={selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined}
              className={`
                input-base w-full bg-transparent
                px-8 py-6 text-fluid-xl font-light text-black
                placeholder-gray-500 touch-target-comfortable
                transition-all duration-300 ease-out
                ${isSubmitting ? 'cursor-not-allowed opacity-50' : ''}
              `}
              style={{
                borderRadius: 'var(--radius-2xl)',
                fontSize: 'var(--text-xl)'
              }}
            />
            
            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={!query.trim() || isSubmitting}
              // 접근성 속성
              aria-label={`${query.trim() ? `'${query}' 검색하기` : '검색어를 입력하세요'}`}
              type="submit"
              className={`
                absolute right-4 top-1/2 transform -translate-y-1/2
                btn-base touch-target flex items-center justify-center group
                transition-all duration-300 ease-out
                ${query.trim() && !isSubmitting
                  ? 'bg-black text-white shadow-button-hover hover:shadow-lg hover:scale-105 hover:-translate-y-0.5 active:scale-95 active:translate-y-0' 
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none'
                }
              `}
              style={{
                width: 'var(--touch-target-comfortable)',
                height: 'var(--touch-target-comfortable)',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : isTyping ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg 
                  className="w-6 h-6 transition-transform group-hover:scale-110" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </button>
            
            {/* Progress Indicator */}
            {query.length > 0 && !isSubmitting && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 rounded-b-3xl overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-black to-gray-600 transition-all duration-300 ease-out"
                  style={{ width: `${Math.min((query.length / 15) * 100, 100)}%` }}
                />
              </div>
            )}
          </div>

          {/* Enhanced Suggestions Dropdown */}
          {suggestions.length > 0 && isFocused && !isSubmitting && (
            <div 
              id="search-suggestions"
              className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-100 overflow-hidden z-10 shadow-dropdown"
              style={{
                borderRadius: 'var(--radius-xl)'
              }}
              role="listbox"
              aria-label="검색 제안"
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.id || suggestion.name}-${index}`}
                  id={`suggestion-${index}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  role="option"
                  aria-selected={selectedIndex === index}
                  aria-label={`${suggestion.name}, ${suggestion.location}`}
                  className={`
                    w-full text-left transition-all duration-200 ease-out
                    group focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset
                    touch-target-comfortable
                    ${selectedIndex === index 
                      ? 'bg-blue-50 border-l-4 border-l-blue-500 text-blue-900' 
                      : 'hover:bg-gray-50'
                    }
                  `}
                  style={{
                    padding: 'var(--space-4) var(--space-6)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`
                        font-medium transition-colors
                        ${selectedIndex === index ? 'text-blue-900' : 'text-gray-900 group-hover:text-black'}
                      `}>
                        {suggestion.name}
                      </div>
                      <div className={`text-sm mt-1 ${
                        selectedIndex === index ? 'text-blue-700' : 'text-gray-500'
                      }`}>
                        {suggestion.location}
                      </div>
                    </div>
                    <div className={`
                      transition-all duration-200
                      ${selectedIndex === index ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 group-hover:opacity-60 group-hover:translate-x-0'}
                    `}>
                      <svg 
                        className={`w-4 h-4 ${
                          selectedIndex === index ? 'text-blue-600' : 'text-gray-400'
                        }`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}