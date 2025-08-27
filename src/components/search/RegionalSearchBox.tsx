'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { enhancedLocationSearch, SearchCandidate, SearchFilters } from '@/lib/search/enhanced-search-system';

interface RegionalSearchBoxProps {
  placeholder?: string;
  onLocationSelect?: (location: SearchCandidate) => void;
  showRegionalFilters?: boolean;
  userLocation?: { lat: number; lng: number };
}

export default function RegionalSearchBox({ 
  placeholder,
  onLocationSelect,
  showRegionalFilters = true,
  userLocation
}: RegionalSearchBoxProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { currentLanguage, t } = useLanguage();

  // 🔍 향상된 검색 로직
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const results = await enhancedLocationSearch(
          query, 
          { ...filters, language: currentLanguage },
          userLocation
        );
        setSuggestions(results.slice(0, 10)); // 상위 10개만 표시
      } catch (error) {
        console.error('검색 오류:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query, filters, currentLanguage, userLocation]);

  // 키보드 네비게이션
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
        handleDirectSearch();
      }
    } else if (e.key === 'Escape') {
      setSuggestions([]);
      inputRef.current?.blur();
    }
  };

  // 제안 항목 클릭
  const handleSuggestionClick = (suggestion: SearchCandidate) => {
    setQuery(suggestion.name);
    setSuggestions([]);
    
    if (onLocationSelect) {
      onLocationSelect(suggestion);
    } else {
      // 🚀 새 URL 구조: /guide/[language]/[location]
      router.push(`/guide/${currentLanguage}/${encodeURIComponent(suggestion.name)}`);
    }
  };

  // 직접 검색
  const handleDirectSearch = () => {
    if (!query.trim()) return;
    
    setSuggestions([]);
    // 🚀 새 URL 구조: /guide/[language]/[location]
    router.push(`/guide/${currentLanguage}/${encodeURIComponent(query.trim())}`);
  };

  // 필터 업데이트
  const updateFilter = (key: keyof SearchFilters, value: string | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* 🎯 메인 검색창 */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || String(t('search.placeholder'))}
          className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-all duration-300 bg-white shadow-lg"
        />
        
        {/* 🔄 로딩 인디케이터 */}
        {isLoading && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* ⚙️ 필터 버튼 */}
        {showRegionalFilters && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="absolute right-12 top-1/2 transform -translate-y-1/2 p-2 text-gray-500 hover:text-blue-500 transition-colors"
          >
            🔧
          </button>
        )}
      </div>

      {/* 🌍 지역 필터 */}
      {showFilters && showRegionalFilters && (
        <div className="mt-2 p-4 bg-gray-50 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              value={filters.country || ''}
              onChange={(e) => updateFilter('country', e.target.value || undefined)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="">{t('search.allCountries')}</option>
              <option value="KR">🇰🇷 한국</option>
              <option value="JP">🇯🇵 일본</option>
              <option value="US">🇺🇸 미국</option>
              <option value="FR">🇫🇷 프랑스</option>
              <option value="IT">🇮🇹 이탈리아</option>
              <option value="ES">🇪🇸 스페인</option>
              <option value="GB">🇬🇧 영국</option>
              <option value="DE">🇩🇪 독일</option>
              <option value="CN">🇨🇳 중국</option>
              <option value="SG">🇸🇬 싱가포르</option>
            </select>
            
            <input
              type="text"
              placeholder={String(t('search.regionFilter'))}
              value={filters.region || ''}
              onChange={(e) => updateFilter('region', e.target.value || undefined)}
              className="px-3 py-2 border rounded-lg"
            />
            
            <select
              value={filters.category || ''}
              onChange={(e) => updateFilter('category', e.target.value || undefined)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="">{t('search.allCategories')}</option>
              <option value="historic">{t('search.historic')}</option>
              <option value="nature">{t('search.nature')}</option>
              <option value="museum">{t('search.museum')}</option>
              <option value="shopping">{t('search.shopping')}</option>
              <option value="food">{t('search.food')}</option>
            </select>
          </div>
        </div>
      )}

      {/* 📋 검색 제안 목록 */}
      {suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.id}-${suggestion.language}`}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`px-6 py-4 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">
                    {suggestion.name}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    📍 {suggestion.region || t('search.unknownRegion')}, {getCountryFlag(suggestion.country_code)} {suggestion.country_code}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {t('search.language')}: {getLanguageLabel(suggestion.language)} • 
                    {t('search.similarity')}: {Math.round(suggestion.similarity_score * 100)}%
                  </div>
                </div>
                
                {/* 🏆 유사도 점수 */}
                <div className="flex items-center ml-4">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    suggestion.similarity_score >= 0.8 
                      ? 'bg-green-100 text-green-800'
                      : suggestion.similarity_score >= 0.6
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {Math.round(suggestion.similarity_score * 100)}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 🌍 국가 플래그 이모지
function getCountryFlag(countryCode?: string | null): string {
  const flags: Record<string, string> = {
    'KR': '🇰🇷', 'JP': '🇯🇵', 'US': '🇺🇸', 'FR': '🇫🇷', 
    'IT': '🇮🇹', 'ES': '🇪🇸', 'GB': '🇬🇧', 'DE': '🇩🇪',
    'CN': '🇨🇳', 'SG': '🇸🇬', 'AU': '🇦🇺', 'CA': '🇨🇦',
    'BR': '🇧🇷', 'MX': '🇲🇽', 'IN': '🇮🇳', 'TH': '🇹🇭',
    'VA': '🇻🇦', 'CH': '🇨🇭', 'AT': '🇦🇹', 'NL': '🇳🇱'
  };
  return flags[countryCode || ''] || '🌍';
}

// 🗣️ 언어 라벨
function getLanguageLabel(lang: string): string {
  const labels: Record<string, string> = {
    'ko': '한국어', 'en': 'English', 'ja': '日本語', 
    'zh': '中文', 'es': 'Español', 'fr': 'Français',
    'de': 'Deutsch', 'it': 'Italiano', 'pt': 'Português'
  };
  return labels[lang] || lang.toUpperCase();
}