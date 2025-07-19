'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

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

  // 회전하는 단어들
  const words = [
    '스토리텔러',
    t?.home?.features?.personalized || '맞춤형추천',
    t?.home?.features?.multiLanguage || '다국어지원',
    '도슨트'
  ];

  // 회전하는 플레이스홀더
  const placeholders = [
    '강릉 커피거리',
    '경복궁',
    '부산 해운대',
    '제주도 성산일출봉',
    '명동 카페거리'
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

  // 최적화된 마우스 추적
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

  // 실시간 검색 제안
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
        console.error('검색 제안 API 오류:', error);
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
    return undefined; // 명시적 undefined 리턴 추가
  }
}, [query, currentLanguage]);

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
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  // 검색 실행
  const handleSearch = () => {
    if (!query.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    setIsFocused(false);
    
    setTimeout(() => {
      router.push(`/guide/${encodeURIComponent(query.trim())}`);
    }, 100);
  };

  // 제안 클릭 처리
  const handleSuggestionClick = (suggestion: Suggestion) => {
    setQuery(suggestion.name);
    setIsFocused(false);
    setIsSubmitting(true);
    
    setTimeout(() => {
      router.push(`/guide/${encodeURIComponent(suggestion.name)}`);
    }, 0);
  };

  // 검색박스 포커스 처리
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
    <div className="min-h-screen bg-white font-sans">
      {/* Enhanced Background Overlay when focused */}
      {isFocused && (
        <div className="fixed inset-0 bg-black/8 backdrop-blur-md z-40 transition-all duration-500" />
      )}

      {/* Main Content */}
      <main className="relative overflow-hidden">
        {/* Enhanced Geometric Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Large floating circle with gradient */}
          <div 
            className="absolute w-96 h-96 rounded-full transition-all duration-1000 ease-out opacity-30"
            style={{
              top: '10%',
              right: '10%',
              background: 'radial-gradient(circle, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.05) 50%, transparent 100%)',
              transform: `translate(${mousePosition.x * -0.02}px, ${mousePosition.y * -0.02}px)`
            }}
          />
          
          {/* Precision line with glow */}
          <div 
            className="absolute transition-all duration-700 ease-out"
            style={{
              top: '35%',
              left: '8%',
              width: '80px',
              height: '1px',
              background: 'linear-gradient(90deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)',
              transform: `translate(${mousePosition.x * -0.01}px, ${mousePosition.y * 0.01}px)`
            }}
          />
          
          {/* Micro square with rotation */}
          <div 
            className="absolute w-2 h-2 transition-all duration-500 ease-out opacity-40"
            style={{
              bottom: '30%',
              right: '20%',
              background: 'linear-gradient(45deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.4) 100%)',
              borderRadius: '2px',
              transform: `translate(${mousePosition.x * 0.015}px, ${mousePosition.y * -0.01}px) rotate(${mousePosition.x * 0.1}deg)`
            }}
          />
        </div>

        {/* Enhanced Hero Section */}
        <section className="relative z-10 flex flex-col items-center justify-center px-6 pt-32 pb-24 min-h-screen">
          
          {/* Enhanced Hero Typography */}
          <div className={`
            pb-20 px-4 transform transition-all duration-1000 ease-out
            ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
          `}>
            {/* Enhanced 메인 타이틀 */}
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-thin tracking-[-0.03em] text-black leading-[0.85] mb-8 text-center">
              <div className="relative">
                <span className="block font-extralight bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent">
                  {t?.home?.brandTitle || '내 손안의'}
                </span>
                <span className="block overflow-hidden" style={{ height: '1.1em' }}>
                  <span 
                    className="inline-block transition-transform duration-1000 ease-out font-light"
                    style={{
                      transform: `translateY(-${currentWord * 100}%)`
                    }}
                  >
                    {words.map((word, index) => (
                      <span key={index} className="flex items-center justify-center bg-gradient-to-r from-black via-gray-700 to-black bg-clip-text text-transparent" style={{ height: '1.1em' }}>
                        {word}
                      </span>
                    ))}
                  </span>
                </span>
              </div>
            </h1>

            {/* Enhanced 구분선 */}
            <div className="flex items-center justify-center gap-6 mb-10">
              <div className="w-20 h-px bg-gradient-to-r from-transparent via-black to-transparent"></div>
              <div className="w-3 h-3 bg-black rounded-full shadow-sm"></div>
              <div className="w-20 h-px bg-gradient-to-r from-transparent via-black to-transparent"></div>
            </div>

            {/* Enhanced 서브타이틀 */}
            <div className="text-center space-y-4 mb-16">
              <p className="text-xl md:text-2xl lg:text-3xl text-gray-700 font-light tracking-wide leading-relaxed">
                가이드없이 자유롭게,
              </p>
              <p className="text-xl md:text-2xl lg:text-3xl text-gray-700 font-light tracking-wide leading-relaxed">
                여행은 깊이있게
              </p>
              <div className="pt-6">
                <p className="text-base md:text-lg text-gray-500 font-light tracking-wide leading-relaxed">
                  AI가 찾아낸 가장 완벽한 가이드해설
                </p>
              </div>
            </div>
          </div>

          {/* Ultra Enhanced Search Box */}
          <div className="relative z-50 w-full max-w-2xl mx-auto">
            
            {/* Search Card with enhanced shadow and glass effect */}
            <div className={`
              relative transition-all duration-700 ease-out
              ${isFocused 
                ? 'scale-105 translate-y-[-12px]' 
                : 'scale-100 translate-y-0'
              }
            `}>
              
              {/* Input Container with enhanced glass morphism */}
              <div className={`
                relative bg-white/90 backdrop-blur-xl rounded-3xl transition-all duration-500 border border-white/20
                ${isFocused 
                  ? 'shadow-2xl shadow-black/10 ring-1 ring-black/5 bg-white/95' 
                  : 'shadow-xl shadow-black/5'
                }
              `}>
                
                {/* Main Input with enhanced styling */}
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
                    w-full px-8 py-7 text-xl md:text-2xl font-light text-black bg-transparent rounded-3xl
                    focus:outline-none transition-all duration-300
                    placeholder-gray-400 placeholder:transition-all placeholder:duration-300
                    ${isSubmitting ? 'cursor-not-allowed opacity-50' : ''}
                    ${isFocused ? 'placeholder-gray-300' : ''}
                  `}
                />
                
              {/* Enhanced Search Button */}
<button
  onClick={handleSearch}
  disabled={!query.trim() || isSubmitting}
  className={`
    absolute right-4 top-1/2 transform -translate-y-1/2
    w-16 h-16 rounded-2xl transition-all duration-300
    flex items-center justify-center group overflow-hidden
    ${query.trim() && !isSubmitting
      ? 'bg-black text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95' 
      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
    }
  `}
>
  {/* Button background effect */}
  <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-black opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
  
  {isSubmitting ? (
    <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin relative z-10" />
  ) : isTyping ? (
    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin relative z-10" />
  ) : (
    <svg 
      className="w-7 h-7 transition-transform group-hover:scale-110 relative z-10" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )}
</button>
                
                {/* Enhanced Progress Indicator */}
                {query.length > 0 && !isSubmitting && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 rounded-b-3xl overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-black via-gray-700 to-black transition-all duration-500 ease-out"
                      style={{ width: `${Math.min((query.length / 15) * 100, 100)}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Ultra Enhanced Suggestions Dropdown */}
              {suggestions.length > 0 && isFocused && !isSubmitting && (
                <div className="absolute top-full left-0 right-0 mt-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/10 border border-gray-100/50 overflow-hidden z-10">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={`${suggestion.id || suggestion.name}-${index}`}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`
                        w-full px-6 py-4 text-left transition-all duration-200
                        group relative overflow-hidden
                        ${selectedIndex === index 
                          ? 'bg-gray-50 border-l-4 border-l-black' 
                          : 'hover:bg-gray-50/80'
                        }
                      `}
                    >
                      {/* Hover background effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                      
                      <div className="flex items-center justify-between relative z-10">
                        <div>
                          <div className={`
                            font-medium transition-colors duration-200
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
        </section>

        {/* Ultra Enhanced Features Section */}
        <section className="relative z-10 py-20 -mt-20">
          <div className="max-w-6xl mx-auto px-6">
            
            {/* Enhanced 3개 원형 버튼 with premium styling */}
            <div className="flex flex-col md:flex-row justify-center items-center gap-16 md:gap-12">
              
              {/* Enhanced 음성 입력 */}
              <div className="text-center group">
                <button 
                  onClick={() => console.log('음성 입력 기능 호출')}
                  className="relative w-24 h-24 bg-black rounded-full flex items-center justify-center hover:scale-110 transition-all duration-500 shadow-xl hover:shadow-2xl mb-6 group-hover:shadow-black/20 overflow-hidden"
                >
                  {/* Background gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Pulse effect */}
                  <div className="absolute inset-0 rounded-full bg-black animate-ping opacity-20 group-hover:opacity-30"></div>
                  
                  {/* Icon */}
                  <div className="w-5 h-5 bg-white rounded-full relative z-10 shadow-sm"></div>
                </button>
                <div className="transition-all duration-300 group-hover:transform group-hover:scale-105">
                  <div className="text-xl font-bold text-black mb-2 tracking-tight">음성 입력</div>
                  <div className="text-sm text-gray-500 leading-relaxed">궁금한 곳의</div>
                  <div className="text-sm text-gray-500 leading-relaxed">이름을 입력하세요</div>
                </div>
              </div>

              {/* Enhanced AI 생성 */}
              <div className="text-center group">
                <button 
                  onClick={() => console.log('AI 생성 기능 호출')}
                  className="relative w-24 h-24 bg-black rounded-full flex items-center justify-center hover:scale-110 transition-all duration-500 shadow-xl hover:shadow-2xl mb-6 group-hover:shadow-black/20 overflow-hidden"
                >
                  {/* Background gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Pulse effect */}
                  <div className="absolute inset-0 rounded-full bg-black animate-ping opacity-20 group-hover:opacity-30"></div>
                  
                  {/* Icon */}
                  <div className="w-10 h-px bg-white relative z-10 shadow-sm"></div>
                </button>
                <div className="transition-all duration-300 group-hover:transform group-hover:scale-105">
                  <div className="text-xl font-bold text-black mb-2 tracking-tight">AI 생성</div>
                  <div className="text-sm text-gray-500 leading-relaxed">실시간으로</div>
                  <div className="text-sm text-gray-500 leading-relaxed">맞춤 가이드 생성</div>
                </div>
              </div>

              {/* Enhanced 오디오 재생 */}
              <div className="text-center group">
                <button 
                  onClick={() => console.log('오디오 재생 기능 호출')}
                  className="relative w-24 h-24 bg-black rounded-full flex items-center justify-center hover:scale-110 transition-all duration-500 shadow-xl hover:shadow-2xl mb-6 group-hover:shadow-black/20 overflow-hidden"
                >
                  {/* Background gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Pulse effect */}
                  <div className="absolute inset-0 rounded-full bg-black animate-ping opacity-20 group-hover:opacity-30"></div>
                  
                  {/* Enhanced Icon */}
                  <div className="grid grid-cols-2 gap-1 relative z-10">
                    <div className="w-2 h-2 bg-white rounded-full shadow-sm"></div>
                    <div className="w-2 h-2 bg-white rounded-full shadow-sm"></div>
                    <div className="w-2 h-2 bg-white rounded-full shadow-sm"></div>
                    <div className="w-2 h-2 bg-white rounded-full shadow-sm"></div>
                  </div>
                </button>
                <div className="transition-all duration-300 group-hover:transform group-hover:scale-105">
                  <div className="text-xl font-bold text-black mb-2 tracking-tight">오디오 재생</div>
                  <div className="text-sm text-gray-500 leading-relaxed">음성으로 생생한</div>
                  <div className="text-sm text-gray-500 leading-relaxed">현장 해설</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Footer Spacing */}
        <div className="h-16"></div>
      </main>
    </div>
  );
}