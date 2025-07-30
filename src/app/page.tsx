'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import GuideGenerating from '@/components/guide/GuideGenerating';

// 검색 제안 인터페이스
interface Suggestion {
  id?: string;
  name: string;
  location: string;
}

export default function HomePage() {
  const router = useRouter();
  const { currentLanguage, t } = useLanguage();
  
  // 상태 관리
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentWord, setCurrentWord] = useState(0);
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([
    { name: '에펠탑', location: '프랑스 파리' },
    { name: '타지마할', location: '인도 아그라' },
    { name: '마추픽추', location: '페루 쿠스코' }
  ]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  
  // 기능 상태
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  
  // 지역별 탭 상태
  const [activeRegion, setActiveRegion] = useState('europe');
  
  // 지역별 인기 국가 데이터 (인기여행지 스타일)
  const regionCountries = useMemo(() => ({
    europe: [
      { 
        id: 'france', 
        name: '프랑스', 
        flag: '🇫🇷', 
        attractions: ['에펠탑', '루브르 박물관', '베르사유 궁전'],
        description: '로맨틱한 파리와 화려한 문화유산',
        gradient: 'from-blue-400 to-purple-500',
        bgColor: 'bg-gradient-to-br from-blue-50 to-purple-50'
      },
      { 
        id: 'italy', 
        name: '이탈리아', 
        flag: '🇮🇹', 
        attractions: ['콜로세움', '피사의 사탑', '바티칸'],
        description: '고대 로마의 영광과 르네상스 예술',
        gradient: 'from-green-400 to-emerald-500',
        bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50'
      },
      { 
        id: 'spain', 
        name: '스페인', 
        flag: '🇪🇸', 
        attractions: ['사그라다 파밀리아', '알함브라 궁전', '구엘 공원'],
        description: '가우디의 건축과 플라멩코의 열정',
        gradient: 'from-orange-400 to-red-500',
        bgColor: 'bg-gradient-to-br from-orange-50 to-red-50'
      },
      { 
        id: 'uk', 
        name: '영국', 
        flag: '🇬🇧', 
        attractions: ['빅벤', '타워 브리지', '버킹엄 궁전'],
        description: '전통과 현대가 조화로운 대영제국',
        gradient: 'from-slate-400 to-blue-600',
        bgColor: 'bg-gradient-to-br from-slate-50 to-blue-50'
      },
      { 
        id: 'germany', 
        name: '독일', 
        flag: '🇩🇪', 
        attractions: ['브란덴부르크 문', '노이슈반슈타인성', '쾰른 대성당'],
        description: '동화 속 성과 깊은 역사의 나라',
        gradient: 'from-yellow-400 to-amber-500',
        bgColor: 'bg-gradient-to-br from-yellow-50 to-amber-50'
      }
    ],
    asia: [
      { 
        id: 'japan', 
        name: '일본', 
        flag: '🇯🇵', 
        attractions: ['후지산', '기요미즈데라', '센소지'],
        description: '전통과 첨단이 공존하는 신비로운 나라',
        gradient: 'from-pink-400 to-rose-500',
        bgColor: 'bg-gradient-to-br from-pink-50 to-rose-50'
      },
      { 
        id: 'china', 
        name: '중국', 
        flag: '🇨🇳', 
        attractions: ['만리장성', '자금성', '천안문 광장'],
        description: '5천년 역사를 간직한 거대한 문명',
        gradient: 'from-red-400 to-yellow-500',
        bgColor: 'bg-gradient-to-br from-red-50 to-yellow-50'
      },
      { 
        id: 'india', 
        name: '인도', 
        flag: '🇮🇳', 
        attractions: ['타지마할', '붉은 요새', '갠지스 강'],
        description: '신비로운 영성과 화려한 궁전들',
        gradient: 'from-orange-400 to-pink-500',
        bgColor: 'bg-gradient-to-br from-orange-50 to-pink-50'
      },
      { 
        id: 'thailand', 
        name: '태국', 
        flag: '🇹🇭', 
        attractions: ['왓 아룬', '대왕궁', '왓 포'],
        description: '황금빛 사원과 미소의 나라',
        gradient: 'from-yellow-400 to-orange-500',
        bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-50'
      },
      { 
        id: 'singapore', 
        name: '싱가포르', 
        flag: '🇸🇬', 
        attractions: ['마리나 베이 샌즈', '가든스 바이 더 베이', '머라이언'],
        description: '미래도시와 다양한 문화의 만남',
        gradient: 'from-teal-400 to-blue-500',
        bgColor: 'bg-gradient-to-br from-teal-50 to-blue-50'
      }
    ],
    americas: [
      { 
        id: 'usa', 
        name: '미국', 
        flag: '🇺🇸', 
        attractions: ['자유의 여신상', '그랜드 캐니언', '타임스퀘어'],
        description: '자유와 꿈의 땅, 무한한 가능성',
        gradient: 'from-blue-400 to-red-500',
        bgColor: 'bg-gradient-to-br from-blue-50 to-red-50'
      },
      { 
        id: 'canada', 
        name: '캐나다', 
        flag: '🇨🇦', 
        attractions: ['나이아가라 폭포', 'CN 타워', '밴프 국립공원'],
        description: '광활한 자연과 깨끗한 도시',
        gradient: 'from-red-400 to-orange-500',
        bgColor: 'bg-gradient-to-br from-red-50 to-orange-50'
      },
      { 
        id: 'brazil', 
        name: '브라질', 
        flag: '🇧🇷', 
        attractions: ['리우 예수상', '이과수 폭포', '마라카낭 스타디움'],
        description: '삼바와 축구, 열정적인 남미',
        gradient: 'from-green-400 to-yellow-500',
        bgColor: 'bg-gradient-to-br from-green-50 to-yellow-50'
      },
      { 
        id: 'peru', 
        name: '페루', 
        flag: '🇵🇪', 
        attractions: ['마추픽추', '쿠스코', '나스카 라인'],
        description: '잉카 문명의 신비로운 유적들',
        gradient: 'from-amber-400 to-orange-500',
        bgColor: 'bg-gradient-to-br from-amber-50 to-orange-50'
      },
      { 
        id: 'mexico', 
        name: '멕시코', 
        flag: '🇲🇽', 
        attractions: ['치첸이트사', '테오티우아칸', '칸쿤'],
        description: '마야 문명과 카리브해의 낙원',
        gradient: 'from-green-500 to-red-500',
        bgColor: 'bg-gradient-to-br from-green-50 to-red-50'
      }
    ]
  }), []);

  // 회전하는 단어들 (audioguide 맞춤)
  const words = useMemo(() => [
    t('home.features.personalGuide') || '개인가이드',
    t('home.features.audioCommentary') || '오디오해설',
    t('home.features.tourDocent') || '투어도슨트',
    t('home.features.selfTour') || '셀프투어'
  ], [currentLanguage, t]);

  // 회전하는 플레이스홀더 (다국어 지원)
  const placeholders = useMemo(() => {
    const translated = t('home.searchPlaceholders');
    
    
    return Array.isArray(translated) ? translated : [
      '에펠탑',
      '타지마할',
      '마추픽추',
      '콜로세움',
      '자유의 여신상'
    ];
  }, [t]);

  // 언어 변경 시 인덱스 리셋
  useEffect(() => {
    setPlaceholderIndex(0);
    setCurrentWord(0);
  }, [currentLanguage]);

  useEffect(() => {
    setIsLoaded(true);
    
    // 단어 회전
    const wordInterval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 3000);

    // 플레이스홀더 회전
    const placeholderInterval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);

    return () => {
      clearInterval(wordInterval);
      clearInterval(placeholderInterval);
    };
  }, [currentLanguage, words.length, placeholders.length]); // currentLanguage 의존성 추가

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 자동완성 API 호출
  const fetchSuggestions = async (searchQuery: string) => {
    if (searchQuery.length < 1) {
      const translated = t('home.defaultSuggestions');
      setSuggestions(
        Array.isArray(translated) ? translated : [
          { name: '에펠탑', location: '프랑스 파리' },
          { name: '타지마할', location: '인도 아그라' },
          { name: '마추픽추', location: '페루 쿠스코' }
        ]
      );
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const response = await fetch(`/api/locations/search?q=${encodeURIComponent(searchQuery)}&lang=${currentLanguage}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setSuggestions(data.data.slice(0, 5)); // 최대 5개 제안
        setSelectedSuggestionIndex(-1); // 새로운 제안이 오면 선택 초기화
      } else {
        setSuggestions([]);
        setSelectedSuggestionIndex(-1);
      }
    } catch (error) {
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };


  // 디바운스된 검색 함수
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim() && isFocused) {
        fetchSuggestions(query.trim());
      }
    }, 200); // 200ms 디바운스 (최적화)

    return () => clearTimeout(timeoutId);
  }, [query, currentLanguage, isFocused]);

  // 검색 실행
  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsGenerating(true);
    try {
      router.push(`/guide/${encodeURIComponent(query.trim())}`);
    } catch (error) {
      console.error('검색 오류:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isFocused || suggestions.length === 0) {
      if (e.key === 'Enter') {
        handleSearch();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > -1 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length) {
          const selectedSuggestion = suggestions[selectedSuggestionIndex];
          setQuery(selectedSuggestion.name);
          setIsFocused(false);
          setSelectedSuggestionIndex(-1);
          setTimeout(() => {
            router.push(`/guide/${encodeURIComponent(selectedSuggestion.name)}`);
          }, 100);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setIsFocused(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };



  // AI 가이드 생성
  const handleAIGeneration = async () => {
    if (!query.trim()) {
      alert('먼저 장소를 입력해주세요.');
      return;
    }

    setIsGenerating(true);
    try {
      console.log('🚀 AI 가이드 생성 요청 시작:', {
        url: '/api/ai/generate-guide-with-gemini',
        method: 'POST',
        location: query.trim(),
        language: currentLanguage,
        library: 'Gemini 완전 라이브러리'
      });

      // 완전한 Gemini 라이브러리 사용으로 변경
      const response = await fetch('/api/ai/generate-guide-with-gemini', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          location: query.trim(),
          userProfile: {
            language: currentLanguage,
            interests: ['문화', '역사'],
            knowledgeLevel: '중급',
            ageGroup: '30대',
            preferredStyle: '친근함',
            tourDuration: 90,
            companions: 'solo'
          }
        }),
      });

      console.log('📡 응답 수신:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ 가이드 생성 성공:', data);
        router.push(`/guide/${encodeURIComponent(query.trim())}/tour`);
      } else {
        const errorData = await response.json().catch(() => ({ 
          error: `HTTP ${response.status}: ${response.statusText}` 
        }));
        console.error('❌ 가이드 생성 실패:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        alert(errorData.error || `가이드 생성에 실패했습니다 (${response.status})`);
      }
    } catch (error) {
      console.error('❌ AI 생성 오류:', error);
      alert('가이드 생성 중 네트워크 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 오디오 재생
  const handleAudioPlayback = () => {
    if (!query.trim()) {
      alert('먼저 장소를 입력해주세요.');
      return;
    }

    setAudioPlaying(!audioPlaying);
    
    setTimeout(() => {
      router.push(`/guide/${encodeURIComponent(query.trim())}/tour`);
    }, 1000);
  };

  // 국가 클릭 처리
  const handleCountryClick = (country: any) => {
    // 해당 국가의 첫 번째 유명 관광지로 검색
    const firstAttraction = country.attractions[0];
    setQuery(firstAttraction);
    setTimeout(() => {
      router.push(`/guide/${encodeURIComponent(firstAttraction)}`);
    }, 300);
  };

  // 가이드 생성 중일 때 새로운 컴포넌트 표시
  if (isGenerating) {
    return (
      <GuideGenerating
        locationName={query}
        onCancel={() => setIsGenerating(false)}
        onComplete={() => {
          setIsGenerating(false);
          router.push(`/guide/${encodeURIComponent(query.trim())}`);
        }}
        userPreferences={{
          interests: ['문화', '역사', '건축'],
          ageGroup: '30대',
          language: currentLanguage
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">



      {/* Main Content */}
      <main className="relative overflow-hidden">
        {/* Geometric Background Elements */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div 
            className="absolute w-96 h-96 border border-black/5 rounded-full transition-transform duration-1000 z-0"
            style={{
              top: '10%',
              right: '10%',
              transform: `translate(${mousePosition.x * -0.02}px, ${mousePosition.y * -0.02}px)`
            }}
          />
          
          <div 
            className="absolute w-20 h-px bg-black opacity-15 transition-transform duration-700 z-0"
            style={{
              top: '35%',
              left: '8%',
              transform: `translate(${mousePosition.x * -0.01}px, ${mousePosition.y * 0.01}px)`
            }}
          />
        </div>

        {/* Hero Section */}
        <section className="relative z-10 flex flex-col items-center justify-center px-6 pt-12 pb-20">
          
          {/* Hero Typography */}
          <div className={`
            pb-20 px-4 transform transition-all duration-1000
            ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
          `}>
            {/* Main Title */}
            <h1 className="text-2xl md:text-3xl font-thin tracking-[-0.02em] text-black mb-8">
              <div>
                {/* 상단: 내손안의 (왼쪽 정렬) */}
                <div className="mb-4 text-left">
                  <span className="block font-bold text-2xl">
                    {t('home.brandTitle') || '내 손안의'}
                  </span>
                </div>
                
                {/* 하단 중앙: 회전하는 단어들 */}
                <div className="flex justify-center">
                  <div className="overflow-hidden" style={{ height: '32px', lineHeight: '32px' }}>
                    <span 
                      className="inline-block transition-transform duration-1000 ease-out font-bold text-2xl"
                      style={{
                        transform: `translateY(-${currentWord * 32}px)`
                      }}
                    >
                      {words.map((word, index) => (
                        <span key={index} className="block" style={{ height: '32px', lineHeight: '32px' }}>
                          {word}
                        </span>
                      ))}
                    </span>
                  </div>
                </div>
              </div>
            </h1>

            {/* Decorative Element */}
            <div className="flex items-center justify-center gap-8 mb-12 relative z-0">
              <div className="w-12 h-px bg-black opacity-30"></div>
              <div className="w-1 h-1 bg-black rounded-full opacity-50"></div>
              <div className="w-1 h-1 bg-black rounded-full opacity-30"></div>
              <div className="w-1 h-1 bg-black rounded-full opacity-20"></div>
              <div className="w-12 h-px bg-black opacity-30"></div>
            </div>

            {/* Subtitle */}
            <div className="text-center space-y-2 mb-1">
              <p className="text-base text-gray-500 font-light tracking-wide">
                {t('home.subtitle')}
              </p>
              <p className="text-lg text-gray-700 font-light tracking-wide">
                {t('home.subtitle2')}
              </p>
              <p className="text-base text-black font-light tracking-wide">
                {t('home.description')}
              </p>
            </div>
          </div>

          {/* How to Use - 3 Steps */}
          <div className="w-full max-w-4xl mx-auto mb-12 px-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
              <h2 className="text-lg font-bold text-center mb-6 text-gray-800">
                🎧 3단계로 시작하는 AI 음성 가이드
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center group">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <h3 className="font-bold mb-2 text-gray-800">1. 관광명소 검색</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    가고 싶은 <span className="font-semibold text-blue-600">구체적인 장소</span>나 박물관을 입력하세요
                  </p>
                </div>
                
                <div className="text-center group">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <span className="text-2xl">🎧</span>
                  </div>
                  <h3 className="font-bold mb-2 text-gray-800">2. AI 음성가이드 생성</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    <span className="font-semibold text-green-600">전문가 수준</span>의 맞춤형 음성 해설을 즉시 생성합니다
                  </p>
                </div>
                
                <div className="text-center group">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <span className="text-2xl">🚶‍♂️</span>
                  </div>
                  <h3 className="font-bold mb-2 text-gray-800">3. 실시간 투어</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    <span className="font-semibold text-purple-600">GPS 기반</span>으로 위치에 맞는 해설을 들으며 관람하세요
                  </p>
                </div>
              </div>
              
              {/* 추가 설명 */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500 bg-white/60 rounded-lg px-4 py-2 inline-block">
                  💡 <span className="font-medium">예시:</span> &ldquo;루브르 박물관&rdquo;, &ldquo;에펠탑&rdquo;, &ldquo;경복궁&rdquo; 등 구체적인 장소명을 입력해보세요
                </p>
              </div>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative z-50 w-full max-w-2xl mx-auto">
            <div className={`
              relative transition-all duration-700 ease-out
              ${isFocused 
                ? 'scale-105 translate-y-[-8px]' 
                : 'scale-100 translate-y-0'
              }
            `}>
              <div className={`
                relative bg-white rounded-3xl transition-all duration-500
                ${isFocused 
                  ? 'shadow-2xl shadow-black/15 ring-1 ring-black/5' 
                  : 'shadow-xl shadow-black/10'
                }
              `}>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                  placeholder={placeholders[placeholderIndex]}
                  className="w-full px-8 py-6 text-xl font-light text-black bg-transparent rounded-3xl focus:outline-none transition-all duration-300 placeholder-gray-400"
                />
                
                <button
                  onClick={handleSearch}
                  disabled={!query.trim() || isGenerating}
                  className={`
                    absolute right-4 top-1/2 transform -translate-y-1/2
                    w-14 h-14 rounded-2xl transition-all duration-300
                    flex items-center justify-center group
                    ${query.trim() && !isGenerating
                      ? 'bg-black text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95' 
                      : 'bg-black text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 opacity-50 cursor-not-allowed'
                    }
                  `}
                >
                  {isGenerating ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-6 h-6 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Suggestions Dropdown */}
              {isFocused && query.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white rounded-2xl shadow-2xl shadow-black/15 border border-gray-100 overflow-hidden z-50 autocomplete-dropdown">
                  {isLoadingSuggestions ? (
                    <div className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                        <span className="text-sm text-gray-500">검색 중...</span>
                      </div>
                    </div>
                  ) : suggestions.length > 0 ? (
                    suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          const selectedLocation = suggestion.name;
                          setQuery(selectedLocation);
                          setIsFocused(false);
                          setSelectedSuggestionIndex(-1);
                          setTimeout(() => {
                            router.push(`/guide/${encodeURIComponent(selectedLocation)}`);
                          }, 100);
                        }}
                        onMouseEnter={() => setSelectedSuggestionIndex(index)}
                        onMouseLeave={() => setSelectedSuggestionIndex(-1)}
                        className={`w-full px-6 py-4 text-left transition-all duration-200 group suggestion-item ${
                          selectedSuggestionIndex === index 
                            ? 'bg-blue-50 ring-2 ring-blue-200' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900 group-hover:text-black">
                              {suggestion.name}
                            </div>
                            {suggestion.location && (
                              <div className="text-sm text-gray-500 mt-1">
                                {suggestion.location}
                              </div>
                            )}
                          </div>
                          <div className="opacity-0 translate-x-2 group-hover:opacity-60 group-hover:translate-x-0 transition-all duration-200">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-6 py-4 text-center text-sm text-gray-500">
                      검색 결과가 없습니다
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Regional Countries Section */}
        <section className="relative z-10 py-12 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-6xl mx-auto px-6">
            
            {/* 섹션 제목 */}
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                🌍 인기 여행 국가
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                세계 각국의 대표 관광명소와 함께하는 특별한 오디오 가이드 여행을 시작하세요
              </p>
            </div>
            
            {/* 지역별 탭 */}
            <div className="flex justify-center mb-8">
              <div className="bg-white rounded-xl p-1 shadow-sm border border-gray-100">
                <div className="flex space-x-1">
                  {[
                    { id: 'europe', label: '유럽', icon: '🏰' },
                    { id: 'asia', label: '아시아', icon: '🏯' },
                    { id: 'americas', label: '미주', icon: '🗽' }
                  ].map((region) => (
                    <button
                      key={region.id}
                      onClick={() => setActiveRegion(region.id)}
                      className={`
                        px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300
                        flex items-center gap-2
                        ${activeRegion === region.id
                          ? 'bg-black text-white shadow-md'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }
                      `}
                    >
                      <span className="text-lg">{region.icon}</span>
                      {region.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 국가 카드 슬라이드 - 인기여행지 스타일 */}
            <div className="overflow-x-auto pb-4">
              <div className="flex space-x-6 min-w-max px-2">
                {regionCountries[activeRegion as keyof typeof regionCountries].map((country, index) => (
                  <div
                    key={country.id}
                    onClick={() => handleCountryClick(country)}
                    className="flex-shrink-0 w-64 group cursor-pointer"
                  >
                    {/* 메인 카드 */}
                    <div className="relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group-hover:scale-105">
                      
                      {/* 상단 그라데이션 헤더 */}
                      <div className={`relative h-32 bg-gradient-to-br ${country.gradient} overflow-hidden`}>
                        {/* 장식적 패턴 */}
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full"></div>
                        <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full"></div>
                        
                        {/* 국기와 국가명 */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                          <div className="text-4xl mb-2 transform group-hover:scale-110 transition-transform duration-300">
                            {country.flag}
                          </div>
                          <h3 className="font-bold text-lg tracking-wide">
                            {country.name}
                          </h3>
                        </div>

                        {/* 인기 배지 */}
                        <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                          <span className="text-xs text-white font-medium">인기</span>
                        </div>
                      </div>

                      {/* 카드 콘텐츠 */}
                      <div className="p-5">
                        {/* 설명 */}
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                          {country.description}
                        </p>

                        {/* 인기 관광지 */}
                        <div className="space-y-2 mb-4">
                          <h4 className="text-xs font-semibold text-gray-800 uppercase tracking-wider">
                            인기 관광지
                          </h4>
                          {country.attractions.slice(0, 3).map((attraction, idx) => (
                            <div
                              key={idx}
                              className="flex items-center text-sm text-gray-700 group-hover:text-gray-900 transition-colors"
                            >
                              <div className="w-2 h-2 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full mr-3 group-hover:from-gray-400 group-hover:to-gray-600 transition-all duration-300"></div>
                              <span className="font-medium">{attraction}</span>
                            </div>
                          ))}
                        </div>

                        {/* CTA 버튼 */}
                        <div className="pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {country.attractions.length}개 명소
                            </span>
                            <div className="flex items-center text-sm font-semibold text-gray-700 group-hover:text-black transition-colors">
                              <span>가이드 시작</span>
                              <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 모바일 스크롤 힌트 */}
            <div className="flex justify-center mt-8 md:hidden">
              <div className="flex items-center text-xs text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                <svg className="w-4 h-4 mr-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l4-4m0 0l4-4m-4 4v12" />
                </svg>
                <span className="font-medium">좌우로 스크롤하여 더 많은 국가를 확인하세요</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - 3개 원형 아이콘 */}
        <section className="relative z-10 py-8">
          <div className="max-w-6xl mx-auto px-6">
            {/* 모든 화면에서 가로 배열 */}
            <div className="flex flex-row justify-center items-start gap-2 sm:gap-4 md:gap-8 mb-16">
              
              {/* 장소 입력 */}
              <div className="text-center relative z-10 flex-1 max-w-32 sm:max-w-xs">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full flex items-center justify-center bg-black text-white mb-3 sm:mb-4 shadow-lg">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="h-16 sm:h-20 flex flex-col justify-center">
                  <div className="text-sm sm:text-lg font-medium text-black mb-1">장소 입력</div>
                  <div className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                    궁금한 곳의<br />이름을 입력하세요
                  </div>
                </div>
              </div>

              {/* 화살표 1 */}
              <div className="flex items-center justify-center pt-6 sm:pt-8">
                <svg className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {/* AI 생성 */}
              <div className="text-center relative z-10 flex-1 max-w-32 sm:max-w-xs">
                <button 
                  onClick={handleAIGeneration}
                  disabled={!query.trim() || isGenerating}
                  className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full flex items-center justify-center hover:scale-105 transition-all duration-300 shadow-lg mb-3 sm:mb-4 bg-black text-white ${
                    isGenerating ? 'animate-pulse' : ''
                  } ${!query.trim() ? 'opacity-100 cursor-not-allowed' : ''}`}
                >
                  {isGenerating ? (
                    <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                </button>
                <div className="h-16 sm:h-20 flex flex-col justify-center">
                  <div className="text-sm sm:text-lg font-medium text-black mb-1">AI 생성</div>
                  <div className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                    실시간으로<br />맞춤 가이드 생성
                  </div>
                </div>
              </div>

              {/* 화살표 2 */}
              <div className="flex items-center justify-center pt-6 sm:pt-8">
                <svg className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {/* 오디오 재생 */}
              <div className="text-center relative z-10 flex-1 max-w-32 sm:max-w-xs">
                <button 
                  onClick={handleAudioPlayback}
                  disabled={!query.trim()}
                  className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full flex items-center justify-center hover:scale-105 transition-all duration-300 shadow-lg mb-3 sm:mb-4 bg-black text-white ${
                    audioPlaying ? 'animate-pulse' : ''
                  } ${!query.trim() ? 'opacity-100 cursor-not-allowed' : ''}`}
                >
                  {audioPlaying ? (
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>
                <div className="h-16 sm:h-20 flex flex-col justify-center">
                  <div className="text-sm sm:text-lg font-medium text-black mb-1">오디오 재생</div>
                  <div className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                    음성으로 생생한<br />현장 해설
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer with Legal Links */}
      <footer className="relative z-10 bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">네비가이드AI</h3>
              <p className="text-sm text-gray-600 mb-4">
                AI 기반 맞춤형 여행 가이드 서비스로 더 스마트하고 개인화된 여행을 경험하세요.
              </p>
              <div className="flex items-center space-x-4">
                <span className="text-xs text-gray-500">© 2024 네비가이드AI. All rights reserved.</span>
              </div>
            </div>

            {/* Legal Pages */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">법적 정보</h4>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="/legal/privacy" 
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    개인정보처리방침
                  </a>
                </li>
                <li>
                  <a 
                    href="/legal/terms" 
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    이용약관
                  </a>
                </li>
                <li>
                  <a 
                    href="/legal/about" 
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    회사소개
                  </a>
                </li>
                <li>
                  <a 
                    href="/legal/contact" 
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    연락처
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">고객지원</h4>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="https://t.me/naviguideai" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Telegram 채널
                  </a>
                </li>
                <li>
                  <span className="text-sm text-gray-600">
                    평일 09:00 - 18:00 (KST)
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* AdSense Compliance Notice */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              본 사이트는 Google AdSense를 사용하여 광고를 게재합니다. 
              <a href="/legal/privacy" className="underline hover:text-gray-700 ml-1">
                개인정보처리방침
              </a>에서 쿠키 사용 및 광고 정책에 대한 자세한 내용을 확인하실 수 있습니다.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}