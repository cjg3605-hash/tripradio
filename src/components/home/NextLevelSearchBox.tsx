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
            relative bg-white rounded-3xl transition-all duration-500
            ${isFocused 
              ? 'shadow-2xl shadow-black/15 ring-1 ring-black/5' 
              : 'shadow-xl shadow-black/10'
            }
          `}>
            
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
              className={`
                w-full px-8 py-6 text-xl font-light text-black bg-transparent rounded-3xl
                focus:outline-none transition-all duration-300
                placeholder-gray-400
                ${isSubmitting ? 'cursor-not-allowed opacity-50' : ''}
              `}
            />
            
            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={!query.trim() || isSubmitting}
              className={`
                absolute right-4 top-1/2 transform -translate-y-1/2
                w-14 h-14 rounded-2xl transition-all duration-300
                flex items-center justify-center group
                ${query.trim() && !isSubmitting
                  ? 'bg-black text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }
              `}
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
            <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-2xl shadow-black/15 border border-gray-100 overflow-hidden z-10">
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.id || suggestion.name}-${index}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`
                    w-full px-6 py-4 text-left transition-all duration-200
                    border-b border-gray-50 last:border-b-0 group
                    ${selectedIndex === index 
                      ? 'bg-gray-50 border-l-4 border-l-black' 
                      : 'hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`
                        font-medium transition-colors
                        ${selectedIndex === index ? 'text-black' : 'text-gray-900 group-hover:text-black'}
                      `}>
                        {suggestion.name}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {suggestion.location}
                      </div>
                    </div>
                    <div className={`
                      transition-all duration-200
                      ${selectedIndex === index ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 group-hover:opacity-60 group-hover:translate-x-0'}
                    `}>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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