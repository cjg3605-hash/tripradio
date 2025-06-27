'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SearchIcon, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Suggestion {
  id?: string;
  name: string;
  location: string;
}

export function SearchBox() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { t, currentLanguage } = useLanguage();

  // 언어별 플레이스홀더 텍스트
  const getPlaceholderText = () => {
    const placeholders = {
      ko: '어디로 가고 싶으세요?',
      en: 'Where would you like to explore?',
      ja: 'どちらへお出かけになりたいですか？',
      zh: '您想去哪里？',
      es: '¿Dónde te gustaría explorar?'
    };
    return placeholders[currentLanguage as keyof typeof placeholders] || placeholders.ko;
  };

  // 언어별 버튼 텍스트
  const getButtonText = () => {
    const buttons = {
      ko: { search: '🔍 탐험시작', loading: '생성중...' },
      en: { search: '🔍 Start Exploring', loading: 'Generating...' },
      ja: { search: '🔍 探検開始', loading: '生成중...' },
      zh: { search: '🔍 开始探索', loading: '生成中...' },
      es: { search: '🔍 Comenzar Exploración', loading: 'Generando...' }
    };
    return buttons[currentLanguage as keyof typeof buttons] || buttons.ko;
  };

  // 언어별 메시지 텍스트
  const getMessages = () => {
    const messages = {
      ko: {
        searching: '검색 중...',
        noResults: '바로 탐험하기',
        generateGuide: '가이드 생성하기 →',
        tryAgain: '다시 시도하기',
        navigationError: '페이지 이동 중 오류가 발생했습니다.',
        searchError: '검색 중 오류가 발생했습니다. 다시 시도해주세요.'
      },
      en: {
        searching: 'Searching...',
        noResults: 'Explore directly',
        generateGuide: 'Generate Guide →',
        tryAgain: 'Try Again',
        navigationError: 'An error occurred while navigating.',
        searchError: 'An error occurred during search. Please try again.'
      },
      ja: {
        searching: '検索中...',
        noResults: '直接探検する',
        generateGuide: 'ガイド生成 →',
        tryAgain: '再試行',
        navigationError: 'ページ移動中にエラーが発生しました。',
        searchError: '検索中にエラーが発生しました。再試行してください。'
      },
      zh: {
        searching: '搜索中...',
        noResults: '直接探索',
        generateGuide: '生成导览 →',
        tryAgain: '重试',
        navigationError: '页面导航时发生错误。',
        searchError: '搜索时发生错误。请重试。'
      },
      es: {
        searching: 'Buscando...',
        noResults: 'Explorar directamente',
        generateGuide: 'Generar Guía →',
        tryAgain: 'Intentar de Nuevo',
        navigationError: 'Ocurrió un error durante la navegación.',
        searchError: 'Ocurrió un error durante la búsqueda. Inténtalo de nuevo.'
      }
    };
    return messages[currentLanguage as keyof typeof messages] || messages.ko;
  };

  // 빠른 AI 자동완성
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(() => {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/locations/search?q=${encodeURIComponent(query)}&lang=${currentLanguage}`);
          const data = await response.json();
          
          if (data.success && Array.isArray(data.suggestions)) {
            setSuggestions(data.suggestions);
            setShowSuggestions(data.suggestions.length > 0);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
          setShowSuggestions(false);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }, 500); // 500ms 지연

    return () => clearTimeout(timer);
  }, [query]);

  // 가이드 페이지로 이동 - 에러 처리 강화
  const navigateToGuide = async (locationName: string) => {
    try {
      setError(null);
      const encodedName = encodeURIComponent(locationName);
      await router.push(`/guide/${encodedName}`);
    } catch (error) {
      console.error('네비게이션 오류:', error);
      setError(getMessages().navigationError);
    }
  };

  // 엔터키 처리
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (query.trim()) {
        navigateToGuide(query.trim());
      }
    }
  };

  // 검색 버튼 클릭 - 개선된 에러 처리
  const handleSearch = async () => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery || isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await navigateToGuide(trimmedQuery);
    } catch (error) {
      console.error('검색 중 오류 발생:', error);
      setError(getMessages().searchError);
    } finally {
      setIsLoading(false);
    }
  };

  // 제안 클릭
  const handleSuggestionClick = (suggestion: Suggestion) => {
    setShowSuggestions(false);
    const encodedQuery = encodeURIComponent(suggestion.name);
    navigateToGuide(suggestion.name);
  };

  // 입력창 외부 클릭 시 제안 숨기기
  const handleInputBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const buttonText = getButtonText();
  const messages = getMessages();

  // 클라이언트에서만 실제 인터랙티브 기능 제공
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* 검색 입력창 */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={handleInputBlur}
          placeholder={getPlaceholderText()}
          className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none pr-24 relative z-10"
        />
        
        <button
          type="button"
          onClick={handleSearch}
          onMouseDown={(e) => e.preventDefault()} // 포커스 유지
          disabled={!query.trim() || isLoading}
          className="absolute right-2 top-2 bottom-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm transition-colors duration-200 z-20 cursor-pointer"
          style={{ pointerEvents: 'auto' }} // 명시적으로 클릭 가능하도록
        >
          <SearchIcon className="w-4 h-4" />
          <span className="ml-1 hidden sm:inline">
            {isLoading ? buttonText.loading : buttonText.search.replace('🔍 ', '')}
          </span>
        </button>
      </div>

      {/* 로딩 표시 */}
      {isLoading && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
            <span className="text-gray-600 text-sm">{messages.searching}</span>
          </div>
        </div>
      )}

      {/* 제안 목록 */}
      {showSuggestions && suggestions.length > 0 && !isLoading && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.id || suggestion.name}-${index}`}
              onMouseDown={(e) => e.preventDefault()} // 블러 방지
              onClick={() => handleSuggestionClick(suggestion)}
              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150 flex items-center"
            >
              <MapPin className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
              <div>
              <div className="text-gray-900 font-medium">
                {suggestion.name}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {suggestion.location}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* 검색 결과 없음 */}
      {query.length >= 2 && !isLoading && suggestions.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
          <div className="text-center text-gray-500">
            <p className="mb-2">"{query}" {messages.noResults}</p>
            <button
              type="button"
              onClick={handleSearch}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium cursor-pointer transition-colors duration-150"
            >
              {messages.generateGuide}
            </button>
          </div>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
          <div className="text-center text-red-500">
            <p className="mb-2">{error}</p>
            <button
              type="button"
              onClick={handleSearch}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium cursor-pointer transition-colors duration-150"
            >
              {messages.tryAgain}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 