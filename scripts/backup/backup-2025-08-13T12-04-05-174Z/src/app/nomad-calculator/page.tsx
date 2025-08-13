'use client';

import { Metadata } from 'next';
import Link from 'next/link';
import React from 'react';
import { generateKeywordPageMetadata } from '@/lib/seo/metadata';
import { KeywordPageSchema } from '@/components/seo/KeywordPageSchema';
import { useTranslations } from '@/components/useTranslations';

export const metadata: Metadata = {
  ...generateKeywordPageMetadata(
    '/nomad-calculator',
    'ko',
    '디지털노마드 생활비 계산기 | 전세계 원격근무 도시 비교 TripRadio.AI',
    '💻 전세계 디지털노마드 도시들의 생활비, WiFi 속도, 시간대를 비교하고 최적의 원격근무 장소를 찾아보세요. 실시간 데이터 기반 스마트 추천',
    ['디지털노마드 계산기', '원격근무 생활비', '노마드 도시 비교', '해외 거주비용', 'WiFi 속도 비교', '시간대 계산기', '코워킹 스페이스', '디지털노마드 추천', 'TripRadio.AI']
  )
};

// 20개 노마드 도시 대규모 데이터 (2024년 기준, Nomad List 등 참조)
const nomadCities = [
  // 유럽 (최고 노마드 도시들)
  {
    name: '리스본',
    country: '포르투갈',
    emoji: '🇵🇹',
    monthlyBudget: { min: 1200, max: 2000, currency: '€' },
    wifiSpeed: { avg: 95, rating: 'excellent' },
    timezone: 'GMT+0',
    coworkingSpaces: 45,
    nomadScore: 9.2,
    highlights: ['유럽 타임존', '강한 노마드 커뮤니티', '좋은 날씨'],
    livingCosts: { accommodation: 600, food: 300, transport: 40, coworking: 150, entertainment: 200 },
    region: 'europe',
    visaFree: 90,
    bestSeason: 'Apr-Oct'
  },
  {
    name: '베르린',
    country: '독일',
    emoji: '🇩🇪',
    monthlyBudget: { min: 1500, max: 2500, currency: '€' },
    wifiSpeed: { avg: 88, rating: 'excellent' },
    timezone: 'GMT+1',
    coworkingSpaces: 78,
    nomadScore: 9.0,
    highlights: ['스타트업 허브', '풍부한 문화', '저렴한 맥주'],
    livingCosts: { accommodation: 800, food: 400, transport: 60, coworking: 180, entertainment: 300 },
    region: 'europe',
    visaFree: 90,
    bestSeason: 'May-Sep'
  },
  {
    name: '암스테르담',
    country: '네덜란드',
    emoji: '🇳🇱',
    monthlyBudget: { min: 2000, max: 3000, currency: '€' },
    wifiSpeed: { avg: 92, rating: 'excellent' },
    timezone: 'GMT+1',
    coworkingSpaces: 55,
    nomadScore: 8.8,
    highlights: ['자전거 문화', '영어 친화적', '테크 허브'],
    livingCosts: { accommodation: 1200, food: 500, transport: 80, coworking: 200, entertainment: 350 },
    region: 'europe',
    visaFree: 90,
    bestSeason: 'Apr-Oct'
  },
  {
    name: '바르셀로나',
    country: '스페인',
    emoji: '🇪🇸',
    monthlyBudget: { min: 1100, max: 1800, currency: '€' },
    wifiSpeed: { avg: 85, rating: 'very good' },
    timezone: 'GMT+1',
    coworkingSpaces: 42,
    nomadScore: 8.6,
    highlights: ['해변과 도시', '따뜻한 날씨', '활발한 나이트라이프'],
    livingCosts: { accommodation: 650, food: 350, transport: 50, coworking: 160, entertainment: 250 },
    region: 'europe',
    visaFree: 90,
    bestSeason: 'Mar-Nov'
  },
  {
    name: '프라하',
    country: '체코',
    emoji: '🇨🇿',
    monthlyBudget: { min: 800, max: 1400, currency: '$' },
    wifiSpeed: { avg: 78, rating: 'very good' },
    timezone: 'GMT+1',
    coworkingSpaces: 28,
    nomadScore: 8.3,
    highlights: ['저렴한 생활비', '아름다운 건축', '중부유럽 중심'],
    livingCosts: { accommodation: 450, food: 250, transport: 35, coworking: 120, entertainment: 180 },
    region: 'europe',
    visaFree: 90,
    bestSeason: 'Apr-Oct'
  },

  // 아시아 태평양 (저렴하고 인기)
  {
    name: '창구',
    country: '인도네시아',
    emoji: '🇮🇩', 
    monthlyBudget: { min: 800, max: 1500, currency: '$' },
    wifiSpeed: { avg: 50, rating: 'good' },
    timezone: 'GMT+8',
    coworkingSpaces: 25,
    nomadScore: 8.8,
    highlights: ['저렴한 생활비', '비치 라이프', '서핑 문화'],
    livingCosts: { accommodation: 400, food: 200, transport: 50, coworking: 100, entertainment: 150 },
    region: 'asia',
    visaFree: 30,
    bestSeason: 'Apr-Oct'
  },
  {
    name: '발리 (우붓)',
    country: '인도네시아',
    emoji: '🇮🇩',
    monthlyBudget: { min: 700, max: 1300, currency: '$' },
    wifiSpeed: { avg: 45, rating: 'good' },
    timezone: 'GMT+8',
    coworkingSpaces: 18,
    nomadScore: 8.5,
    highlights: ['정글 뷰', '요가 문화', '저렴한 마사지'],
    livingCosts: { accommodation: 350, food: 180, transport: 60, coworking: 90, entertainment: 120 },
    region: 'asia',
    visaFree: 30,
    bestSeason: 'Apr-Oct'
  },
  {
    name: '치앙마이',
    country: '태국',
    emoji: '🇹🇭',
    monthlyBudget: { min: 600, max: 1200, currency: '$' },
    wifiSpeed: { avg: 65, rating: 'good' },
    timezone: 'GMT+7',
    coworkingSpaces: 22,
    nomadScore: 8.4,
    highlights: ['극저렴 생활비', '노마드 커뮤니티', '맛있는 음식'],
    livingCosts: { accommodation: 300, food: 150, transport: 30, coworking: 80, entertainment: 100 },
    region: 'asia',
    visaFree: 30,
    bestSeason: 'Nov-Mar'
  },
  {
    name: '방콕',
    country: '태국',
    emoji: '🇹🇭',
    monthlyBudget: { min: 800, max: 1500, currency: '$' },
    wifiSpeed: { avg: 82, rating: 'very good' },
    timezone: 'GMT+7',
    coworkingSpaces: 35,
    nomadScore: 8.2,
    highlights: ['대도시 편의시설', '국제적 환경', '교통 접근성'],
    livingCosts: { accommodation: 450, food: 200, transport: 40, coworking: 120, entertainment: 180 },
    region: 'asia',
    visaFree: 30,
    bestSeason: 'Nov-Mar'
  },
  {
    name: '호치민',
    country: '베트남',
    emoji: '🇻🇳',
    monthlyBudget: { min: 500, max: 1000, currency: '$' },
    wifiSpeed: { avg: 58, rating: 'good' },
    timezone: 'GMT+7',
    coworkingSpaces: 16,
    nomadScore: 7.9,
    highlights: ['매우 저렴', '맛있는 음식', '성장하는 스타트업'],
    livingCosts: { accommodation: 280, food: 120, transport: 25, coworking: 70, entertainment: 90 },
    region: 'asia',
    visaFree: 45,
    bestSeason: 'Dec-Apr'
  },
  {
    name: '쿠알라룸푸르',
    country: '말레이시아',
    emoji: '🇲🇾',
    monthlyBudget: { min: 700, max: 1300, currency: '$' },
    wifiSpeed: { avg: 75, rating: 'very good' },
    timezone: 'GMT+8',
    coworkingSpaces: 28,
    nomadScore: 8.1,
    highlights: ['다문화 환경', '영어 통용', '저렴한 생활비'],
    livingCosts: { accommodation: 380, food: 180, transport: 35, coworking: 90, entertainment: 140 },
    region: 'asia',
    visaFree: 90,
    bestSeason: 'Mar-Oct'
  },

  // 아메리카 (높은 품질, 높은 비용)
  {
    name: '멕시코시티',
    country: '멕시코',
    emoji: '🇲🇽',
    monthlyBudget: { min: 900, max: 1600, currency: '$' },
    wifiSpeed: { avg: 80, rating: 'very good' },
    timezone: 'GMT-6',
    coworkingSpaces: 35,
    nomadScore: 8.5,
    highlights: ['풍부한 문화', '미국 시간대', '훌륭한 음식'],
    livingCosts: { accommodation: 500, food: 250, transport: 30, coworking: 120, entertainment: 180 },
    region: 'america',
    visaFree: 180,
    bestSeason: 'Oct-Apr'
  },
  {
    name: '플라야 델 카르멘',
    country: '멕시코',
    emoji: '🇲🇽',
    monthlyBudget: { min: 1000, max: 1800, currency: '$' },
    wifiSpeed: { avg: 72, rating: 'good' },
    timezone: 'GMT-5',
    coworkingSpaces: 12,
    nomadScore: 8.0,
    highlights: ['카리브해 해변', '리조트 지역', '따뜻한 날씨'],
    livingCosts: { accommodation: 600, food: 280, transport: 40, coworking: 100, entertainment: 200 },
    region: 'america',
    visaFree: 180,
    bestSeason: 'Nov-Apr'
  },
  {
    name: '메데인',
    country: '콜롬비아',
    emoji: '🇨🇴',
    monthlyBudget: { min: 700, max: 1300, currency: '$' },
    wifiSpeed: { avg: 68, rating: 'good' },
    timezone: 'GMT-5',
    coworkingSpaces: 18,
    nomadScore: 7.8,
    highlights: ['영원한 봄 날씨', '친절한 사람들', '저렴한 생활비'],
    livingCosts: { accommodation: 400, food: 200, transport: 25, coworking: 80, entertainment: 150 },
    region: 'america',
    visaFree: 90,
    bestSeason: 'Dec-Mar'
  },
  {
    name: '부에노스아이레스',
    country: '아르헨티나',
    emoji: '🇦🇷',
    monthlyBudget: { min: 600, max: 1200, currency: '$' },
    wifiSpeed: { avg: 70, rating: 'good' },
    timezone: 'GMT-3',
    coworkingSpaces: 24,
    nomadScore: 7.5,
    highlights: ['유럽 느낌', '저렴한 와인', '탱고 문화'],
    livingCosts: { accommodation: 350, food: 180, transport: 20, coworking: 90, entertainment: 130 },
    region: 'america',
    visaFree: 90,
    bestSeason: 'Sep-May'
  },

  // 동유럽/코카서스 (가성비 최고)
  {
    name: '트빌리시',
    country: '조지아',
    emoji: '🇬🇪',
    monthlyBudget: { min: 600, max: 1200, currency: '$' },
    wifiSpeed: { avg: 70, rating: 'good' },
    timezone: 'GMT+4',
    coworkingSpaces: 15,
    nomadScore: 8.0,
    highlights: ['1년 비자 프리', '매우 저렴', '유럽 근접'],
    livingCosts: { accommodation: 350, food: 150, transport: 20, coworking: 80, entertainment: 100 },
    region: 'europe',
    visaFree: 365,
    bestSeason: 'Apr-Oct'
  },
  {
    name: '부다페스트',
    country: '헝가리',
    emoji: '🇭🇺',
    monthlyBudget: { min: 900, max: 1500, currency: '€' },
    wifiSpeed: { avg: 85, rating: 'very good' },
    timezone: 'GMT+1',
    coworkingSpaces: 32,
    nomadScore: 8.2,
    highlights: ['아름다운 건축', '온천 문화', '저렴한 EU 도시'],
    livingCosts: { accommodation: 500, food: 280, transport: 40, coworking: 140, entertainment: 200 },
    region: 'europe',
    visaFree: 90,
    bestSeason: 'Apr-Oct'
  },
  {
    name: '크라코프',
    country: '폴란드',
    emoji: '🇵🇱',
    monthlyBudget: { min: 700, max: 1300, currency: '$' },
    wifiSpeed: { avg: 78, rating: 'very good' },
    timezone: 'GMT+1',
    coworkingSpaces: 22,
    nomadScore: 7.9,
    highlights: ['중세 건축', '저렴한 맥주', '활발한 IT 씬'],
    livingCosts: { accommodation: 400, food: 200, transport: 30, coworking: 100, entertainment: 150 },
    region: 'europe',
    visaFree: 90,
    bestSeason: 'Apr-Oct'
  },

  // 중동/아프리카 (신흥 지역)
  {
    name: '두바이',
    country: 'UAE',
    emoji: '🇦🇪',
    monthlyBudget: { min: 2000, max: 3500, currency: '$' },
    wifiSpeed: { avg: 98, rating: 'excellent' },
    timezone: 'GMT+4',
    coworkingSpaces: 45,
    nomadScore: 8.3,
    highlights: ['무세금', '미래 도시', '안전한 환경'],
    livingCosts: { accommodation: 1200, food: 600, transport: 80, coworking: 250, entertainment: 400 },
    region: 'middle_east',
    visaFree: 30,
    bestSeason: 'Nov-Mar'
  },
  {
    name: '케이프타운',
    country: '남아프리카',
    emoji: '🇿🇦',
    monthlyBudget: { min: 800, max: 1400, currency: '$' },
    wifiSpeed: { avg: 65, rating: 'good' },
    timezone: 'GMT+2',
    coworkingSpaces: 18,
    nomadScore: 7.6,
    highlights: ['아름다운 자연', '와인 지역', '저렴한 생활비'],
    livingCosts: { accommodation: 450, food: 250, transport: 40, coworking: 90, entertainment: 160 },
    region: 'africa',
    visaFree: 90,
    bestSeason: 'Oct-Mar'
  }
];

export default function NomadCalculatorPage() {
  const t = useTranslations();
  
  // Personalization and comparison features
  const [savedCities, setSavedCities] = React.useState<string[]>([]);
  const [compareMode, setCompareMode] = React.useState(false);
  const [selectedCities, setSelectedCities] = React.useState<string[]>([]);
  const [filters, setFilters] = React.useState({
    budget: 'all',
    wifi: 'all',
    timezone: 'all',
    lifestyle: 'all'
  });

  // Load saved preferences
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nomad-saved-cities');
      const userFilters = localStorage.getItem('nomad-filters');
      if (saved) setSavedCities(JSON.parse(saved));
      if (userFilters) setFilters(JSON.parse(userFilters));
    }
  }, []);

  // Save preferences
  const saveCityToFavorites = (cityName: string) => {
    const updated = savedCities.includes(cityName) 
      ? savedCities.filter(c => c !== cityName)
      : [...savedCities, cityName];
    setSavedCities(updated);
    localStorage.setItem('nomad-saved-cities', JSON.stringify(updated));
  };

  // Filter cities based on preferences
  const filteredCities = nomadCities.filter(city => {
    if (filters.budget !== 'all') {
      const budgetRanges = {
        '500-1000': [500, 1000],
        '1000-1500': [1000, 1500], 
        '1500-2000': [1500, 2000],
        '2000+': [2000, 5000]
      };
      const range = budgetRanges[filters.budget as keyof typeof budgetRanges];
      if (city.monthlyBudget.min < range[0] || city.monthlyBudget.max > range[1]) return false;
    }
    
    if (filters.wifi !== 'all') {
      const wifiThresholds = { 'basic': 30, 'good': 50, 'very_good': 80, 'excellent': 100 };
      const threshold = wifiThresholds[filters.wifi as keyof typeof wifiThresholds];
      if (city.wifiSpeed.avg < threshold) return false;
    }
    
    return true;
  });

  // Toggle compare mode
  const toggleCompareMode = () => {
    setCompareMode(!compareMode);
    setSelectedCities([]);
  };

  // Handle city selection for comparison
  const toggleCitySelection = (cityName: string) => {
    if (selectedCities.includes(cityName)) {
      setSelectedCities(selectedCities.filter(c => c !== cityName));
    } else if (selectedCities.length < 3) {
      setSelectedCities([...selectedCities, cityName]);
    }
  };

  return (
    <>
      <KeywordPageSchema 
        keyword="디지털노마드 계산기"
        pagePath="/nomad-calculator"
        title="디지털노마드 생활비 계산기 | 전세계 원격근무 도시 비교 TripRadio.AI"
        description="전세계 디지털노마드 도시들의 생활비, WiFi 속도, 시간대를 비교하고 최적의 원격근무 장소를 찾아보세요. 실시간 데이터 기반 스마트 추천"
        features={['생활비 비교', 'WiFi 속도 분석', '시간대 계산', '코워킹 스페이스 정보', '노마드 커뮤니티', '1년 비자 정보']}
      />
      <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 mb-6">
              {t('tools.nomadCalculator.badge')}
            </div>
            <h1 className="text-3xl lg:text-5xl font-light text-gray-900 mb-6 tracking-tight">
              {t('tools.nomadCalculator.hero.title')} 
              <span className="font-semibold block mt-2">{t('tools.nomadCalculator.hero.subtitle')}</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              {t('tools.nomadCalculator.hero.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Calculator Tool */}
      <section className="container mx-auto px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Smart Controls */}
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium text-gray-900">{t('tools.nomadCalculator.filters.title')}</h2>
              <div className="flex gap-2">
                <button
                  onClick={toggleCompareMode}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    compareMode ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {compareMode ? `비교중 (${selectedCities.length}/3)` : '도시 비교'}
                </button>
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-all"
                  onClick={() => {
                    const userPrefs = { savedCities, filters, compareMode: selectedCities };
                    localStorage.setItem('nomad-user-preferences', JSON.stringify(userPrefs));
                    alert('선호도가 저장되었습니다!');
                  }}
                >
                  선호도 저장
                </button>
              </div>
            </div>
            
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('tools.nomadCalculator.filters.budget')}</label>
                <select 
                  value={filters.budget}
                  onChange={(e) => {
                    const newFilters = {...filters, budget: e.target.value};
                    setFilters(newFilters);
                    localStorage.setItem('nomad-filters', JSON.stringify(newFilters));
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="all">모든 예산</option>
                  <option value="500-1000">$500 - $1000</option>
                  <option value="1000-1500">$1000 - $1500</option>
                  <option value="1500-2000">$1500 - $2000</option>
                  <option value="2000+">$2000+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('tools.nomadCalculator.filters.wifi')}</label>
                <select 
                  value={filters.wifi}
                  onChange={(e) => {
                    const newFilters = {...filters, wifi: e.target.value};
                    setFilters(newFilters);
                    localStorage.setItem('nomad-filters', JSON.stringify(newFilters));
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="all">모든 속도</option>
                  <option value="basic">기본 (30+ Mbps)</option>
                  <option value="good">좋음 (50+ Mbps)</option>
                  <option value="very_good">매우 좋음 (80+ Mbps)</option>
                  <option value="excellent">최고 (100+ Mbps)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('tools.nomadCalculator.filters.timezone')}</label>
                <select 
                  value={filters.timezone}
                  onChange={(e) => {
                    const newFilters = {...filters, timezone: e.target.value};
                    setFilters(newFilters);
                    localStorage.setItem('nomad-filters', JSON.stringify(newFilters));
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="all">상관없음</option>
                  <option value="europe">유럽 시간대</option>
                  <option value="asia">아시아 시간대</option>
                  <option value="america">미국 시간대</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">즐겨찾기</label>
                <select className="w-full p-3 border border-gray-300 rounded-lg bg-white">
                  <option value="all">전체 ({filteredCities.length}개)</option>
                  <option value="saved">저장됨 ({savedCities.length}개)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Comparison View */}
          {compareMode && selectedCities.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">선택한 도시 비교 ({selectedCities.length}개)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3">도시</th>
                      <th className="text-left py-2 px-3">월 예산</th>
                      <th className="text-left py-2 px-3">WiFi</th>
                      <th className="text-left py-2 px-3">노마드 점수</th>
                      <th className="text-left py-2 px-3">비자</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCities.map(cityName => {
                      const city = nomadCities.find(c => c.name === cityName)!;
                      return (
                        <tr key={cityName} className="border-b">
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-2">
                              <span>{city.emoji}</span>
                              <div>
                                <div className="font-medium">{city.name}</div>
                                <div className="text-xs text-gray-500">{city.country}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-2 px-3">{city.monthlyBudget.currency}{city.monthlyBudget.min}-{city.monthlyBudget.max}</td>
                          <td className="py-2 px-3">{city.wifiSpeed.avg}Mbps</td>
                          <td className="py-2 px-3">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">{city.nomadScore}/10</span>
                          </td>
                          <td className="py-2 px-3">{city.visaFree}일</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* City Comparison Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 mb-12">
            {filteredCities.map((city, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {compareMode && (
                      <input
                        type="checkbox"
                        checked={selectedCities.includes(city.name)}
                        onChange={() => toggleCitySelection(city.name)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300"
                        disabled={!selectedCities.includes(city.name) && selectedCities.length >= 3}
                      />
                    )}
                    <div className="text-3xl">{city.emoji}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-medium text-gray-900">{city.name}</h3>
                        <button
                          onClick={() => saveCityToFavorites(city.name)}
                          className={`text-sm transition-colors ${
                            savedCities.includes(city.name) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                          }`}
                        >
                          {savedCities.includes(city.name) ? '❤️' : '🤍'}
                        </button>
                      </div>
                      <p className="text-sm text-gray-600">{city.country} • {city.region}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                      {city.nomadScore}/10
                    </div>
                    <div className="text-xs text-gray-500 mt-1">비자 {city.visaFree}일</div>
                  </div>
                </div>

                {/* Budget Range */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{t('tools.nomadCalculator.card.monthlyBudget')}</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {city.monthlyBudget.currency}{city.monthlyBudget.min} - {city.monthlyBudget.max}
                    </span>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-light text-gray-900">{city.wifiSpeed.avg}</div>
                    <div className="text-xs text-gray-600">{t('tools.nomadCalculator.card.wifiAvg')}</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-light text-gray-900">{city.coworkingSpaces}</div>
                    <div className="text-xs text-gray-600">{t('tools.nomadCalculator.card.coworking')}</div>
                  </div>
                </div>

                {/* Highlights */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {city.highlights.map((highlight, hIndex) => (
                      <span key={hIndex} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">{t('tools.nomadCalculator.card.costBreakdown')}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('tools.nomadCalculator.card.costs.accommodation')}</span>
                      <span>${city.livingCosts.accommodation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('tools.nomadCalculator.card.costs.food')}</span>
                      <span>${city.livingCosts.food}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('tools.nomadCalculator.card.costs.transport')}</span>
                      <span>${city.livingCosts.transport}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('tools.nomadCalculator.card.costs.coworking')}</span>
                      <span>${city.livingCosts.coworking}</span>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="flex gap-2">
                  <Link 
                    href={`/?destination=${encodeURIComponent(city.name)}&nomad=true`}
                    className="flex-1 bg-black text-white py-3 px-4 rounded-lg text-center block hover:bg-gray-800 transition-colors text-sm font-medium"
                  >
                    {t('tools.nomadCalculator.card.viewGuide', { city: city.name })}
                  </Link>
                  <Link 
                    href={`/visa-checker?country=${encodeURIComponent(city.country)}`}
                    className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg text-center hover:bg-gray-50 transition-colors text-sm font-medium"
                    title="비자 정보 확인"
                  >
                    📋
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Smart Recommendations */}
          <div className="bg-gray-50 p-8 rounded-lg">
            <h2 className="text-2xl font-light text-gray-900 mb-6 text-center">
              {t('tools.nomadCalculator.recommendations.title')} <span className="font-semibold">{t('tools.nomadCalculator.recommendations.subtitle')}</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="text-center mb-4">
                  <div className="text-3xl mb-2">🏆</div>
                  <h3 className="font-medium text-gray-900">{t('tools.nomadCalculator.recommendations.beginner.title')}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {t('tools.nomadCalculator.recommendations.beginner.description')}
                </p>
                <div className="text-center">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">{t('tools.nomadCalculator.recommendations.beginner.city')}</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="text-center mb-4">
                  <div className="text-3xl mb-2">💰</div>
                  <h3 className="font-medium text-gray-900">{t('tools.nomadCalculator.recommendations.budget.title')}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {t('tools.nomadCalculator.recommendations.budget.description')}
                </p>
                <div className="text-center">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">{t('tools.nomadCalculator.recommendations.budget.city')}</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="text-center mb-4">
                  <div className="text-3xl mb-2">🌊</div>
                  <h3 className="font-medium text-gray-900">{t('tools.nomadCalculator.recommendations.workLife.title')}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {t('tools.nomadCalculator.recommendations.workLife.description')}
                </p>
                <div className="text-center">
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">{t('tools.nomadCalculator.recommendations.workLife.city')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Tools */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-light text-gray-900 mb-4">
              더 많은 <span className="font-semibold">노마드 도구들</span>
            </h2>
            <p className="text-gray-600">성공적인 디지털노마드 생활을 위한 필수 도구들</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Link href="/visa-checker?nomad=true" className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-4">
                <div className="text-3xl mb-3">📋</div>
                <h3 className="text-lg font-medium text-gray-900">비자 체커</h3>
              </div>
              <p className="text-sm text-gray-600 text-center">
                국적별 비자 요구사항과 디지털노마드 비자 정보를 확인하세요
              </p>
            </Link>

            <Link href="/?purpose=coworking" className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-4">
                <div className="text-3xl mb-3">🏢</div>
                <h3 className="text-lg font-medium text-gray-900">코워킹 파인더</h3>
              </div>
              <p className="text-sm text-gray-600 text-center">
                전세계 코워킹 스페이스와 카페 정보를 실시간으로 찾아보세요
              </p>
            </Link>

            <Link href="/trip-planner?type=nomad" className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-4">
                <div className="text-3xl mb-3">🗺️</div>
                <h3 className="text-lg font-medium text-gray-900">노마드 플래너</h3>
              </div>
              <p className="text-sm text-gray-600 text-center">
                다음 목적지까지의 여행 계획을 체계적으로 세워보세요
              </p>
            </Link>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}