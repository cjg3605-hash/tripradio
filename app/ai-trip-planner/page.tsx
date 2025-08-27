// @ts-nocheck
'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowLeft, Calendar, ChevronDown, MapPin, Users, Heart, Briefcase, User, Thermometer, DollarSign, Clock, Star, Plane, Camera, Mountain, Utensils, ShoppingBag, Landmark, Waves, TreePine, Building2, Sun, Cloud, CloudRain, Snowflake, Globe, History } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { SUPPORTED_LANGUAGES } from '@/contexts/LanguageContext';

// 번역 결과를 string으로 변환하는 유틸리티 함수
const translateToString = (value: string | string[] | undefined, fallback: string = ''): string => {
  if (Array.isArray(value)) {
    return value[0] || fallback;
  }
  return value || fallback;
};

// 번역 결과를 string[]로 변환하는 유틸리티 함수
const translateToArray = (value: string[] | string[][] | undefined, fallback: string[] = []): string[] => {
  if (!value) return fallback;
  if (Array.isArray(value) && value.length > 0 && Array.isArray(value[0])) {
    return (value as string[][])[0] || fallback;
  }
  return value as string[] || fallback;
};
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface TravelStyle {
  id: string;
  emoji: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  budget: string;
  duration: string;
  focus: string[];
}

interface Destination {
  id: string;
  emoji: string;
  name: string;
  country: string;
  region: string;
  budget: string;
  bestTime: string;
  duration: string;
  highlights: string[];
  tags: string[];
  weather: string;
  temp: string;
  currency: string;
  exchangeRate: string;
  visaRequired: boolean;
  visaDays: number;
  flightTime: string;
  timeZone: string;
  language: string;
  mustSee: string[];
  foodSpecialty: string[];
  activities: string[];
  transportation: string[];
  tips: string[];
  budgetBreakdown: {
    accommodation: string;
    food: string;
    transport: string;
    activities: string;
  };
}

interface TravelTemplate {
  id: string;
  title: string;
  duration: string;
  style: string;
  price: string;
  destinations: string[];
  itinerary: {
    day: number;
    location: string;
    activities: string[];
  }[];
}


export default function AITripPlannerPage() {
  const { t, currentLanguage, setLanguage } = useLanguage();
  const { data: session } = useSession();
  const router = useRouter();
  
  const [selectedTravelStyle, setSelectedTravelStyle] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [duration, setDuration] = useState<string>('당일치기');
  const [budget, setBudget] = useState<string>('20만원 이하');
  const [interests, setInterests] = useState<string[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TravelTemplate | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<string>('planner');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState<boolean>(false);
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setShowLanguageDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const travelStyles: TravelStyle[] = [
    {
      id: 'solo',
      emoji: '🚶',
      title: t('tripPlanner.data.travelStyles.solo.title') as string,
      description: t('tripPlanner.data.travelStyles.solo.description') as string,
      icon: User,
      budget: t('tripPlanner.data.travelStyles.solo.budget') as string,
      duration: t('tripPlanner.data.travelStyles.solo.duration') as string,
      focus: [
        translateToString(t('tripPlanner.data.travelStyles.solo.focus.freedom'), '자유도'),
        translateToString(t('tripPlanner.data.travelStyles.solo.focus.growth'), '개인 성장'),
        translateToString(t('tripPlanner.data.travelStyles.solo.focus.experience'), '새로운 경험')
      ]
    },
    {
      id: 'couple',
      emoji: '💕',
      title: t('tripPlanner.data.travelStyles.couple.title') as string,
      description: t('tripPlanner.data.travelStyles.couple.description') as string,
      icon: Heart,
      budget: t('tripPlanner.data.travelStyles.couple.budget') as string,
      duration: t('tripPlanner.data.travelStyles.couple.duration') as string,
      focus: [
        translateToString(t('tripPlanner.data.travelStyles.couple.focus.romantic'), '로맨틱'),
        translateToString(t('tripPlanner.data.travelStyles.couple.focus.rest'), '휴식'),
        translateToString(t('tripPlanner.data.travelStyles.couple.focus.memories'), '추억 만들기')
      ]
    },
    {
      id: 'family',
      emoji: '👨‍👩‍👧‍👦',
      title: t('tripPlanner.data.travelStyles.family.title') as string,
      description: t('tripPlanner.data.travelStyles.family.description') as string,
      icon: Users,
      budget: t('tripPlanner.data.travelStyles.family.budget') as string,
      duration: t('tripPlanner.data.travelStyles.family.duration') as string,
      focus: [
        translateToString(t('tripPlanner.data.travelStyles.family.focus.safety'), '안전'),
        translateToString(t('tripPlanner.data.travelStyles.family.focus.facilities'), '편의시설'),
        translateToString(t('tripPlanner.data.travelStyles.family.focus.kidFriendly'), '아이 친화적')
      ]
    },
    {
      id: 'friends',
      emoji: '👥',
      title: t('tripPlanner.data.travelStyles.friends.title') as string,
      description: t('tripPlanner.data.travelStyles.friends.description') as string,
      icon: Users,
      budget: t('tripPlanner.data.travelStyles.friends.budget') as string,
      duration: t('tripPlanner.data.travelStyles.friends.duration') as string,
      focus: [
        translateToString(t('tripPlanner.data.travelStyles.friends.focus.activities'), '액티비티'),
        translateToString(t('tripPlanner.data.travelStyles.friends.focus.nightlife'), '나이트라이프'),
        translateToString(t('tripPlanner.data.travelStyles.friends.focus.groupDiscount'), '그룹 할인')
      ]
    },
    {
      id: 'workation',
      emoji: '💻',
      title: t('tripPlanner.data.travelStyles.business.title') as string,
      description: t('tripPlanner.data.travelStyles.business.description') as string,
      icon: Briefcase,
      budget: t('tripPlanner.data.travelStyles.business.budget') as string,
      duration: t('tripPlanner.data.travelStyles.business.duration') as string,
      focus: [
        translateToString(t('tripPlanner.data.travelStyles.business.focus.wifi'), 'WiFi'),
        translateToString(t('tripPlanner.data.travelStyles.business.focus.cafe'), '카페'),
        translateToString(t('tripPlanner.data.travelStyles.business.focus.workEnvironment'), '업무 환경')
      ]
    }
  ];

  const destinations: Destination[] = useMemo(() => [
    {
      id: 'tokyo',
      emoji: '🏯',
      name: t('tripPlanner.destinations.cities.tokyo') || '도쿄',
      country: t('tripPlanner.destinations.countries.japan') || '일본',
      region: t('tripPlanner.destinations.regions.eastAsia') || '동아시아',
      budget: t('tripPlanner.destinations.budget.range80to120') || '80-120만원',
      bestTime: t('tripPlanner.destinations.bestTime.marchMayNovDec') || '3-5월, 9-11월',
      duration: t('tripPlanner.destinations.duration.threeFourDays') || '3-4일',
      highlights: [
        t('tripPlanner.destinations.attractions.shibuya') || '시부야',
        t('tripPlanner.destinations.attractions.asakusa') || '아사쿠사',
        t('tripPlanner.destinations.attractions.ginza') || '긴자',
        t('tripPlanner.destinations.attractions.harajuku') || '하라주쿠'
      ],
      tags: [
        t('tripPlanner.destinations.tags.culture') || '문화',
        t('tripPlanner.destinations.tags.shopping') || '쇼핑', 
        t('tripPlanner.destinations.tags.food') || '음식',
        t('tripPlanner.destinations.tags.modern') || '현대'
      ],
      weather: t('tripPlanner.destinations.weather.sunny') || '맑음',
      temp: '18°C',
      currency: 'JPY',
      exchangeRate: t('tripPlanner.destinations.exchangeRate.jpy') || '1,000원 = 74엔',
      visaRequired: false,
      visaDays: 90,
      flightTime: t('tripPlanner.destinations.flightTime.twoHalfHour') || '2시간 30분',
      timeZone: 'GMT+9',
      language: '일본어',
      mustSee: [
        t('tripPlanner.destinations.attractions.sensoji') || '센소지 절',
        t('tripPlanner.destinations.attractions.tokyoSkytree') || '도쿄 스카이트리',
        t('tripPlanner.destinations.attractions.meijiShrine') || '메이지 신궁',
        t('tripPlanner.destinations.attractions.tsukijiMarket') || '츠키지 시장'
      ],
      foodSpecialty: [
        t('tripPlanner.destinations.foodSpecialty.sushi') || '스시',
        t('tripPlanner.destinations.foodSpecialty.ramen') || '라멘',
        t('tripPlanner.destinations.foodSpecialty.udon') || '우동',
        t('tripPlanner.destinations.foodSpecialty.tempura') || '텐푸라',
        t('tripPlanner.destinations.foodSpecialty.yakitori') || '야키토리'
      ],
      activities: [
        t('tripPlanner.destinations.activities.onsen') || '온센',
        t('tripPlanner.destinations.activities.karaoke') || '카라오케',
        t('tripPlanner.destinations.activities.shopping') || '쇼핑',
        t('tripPlanner.destinations.activities.photography') || '사진촬영',
        t('tripPlanner.destinations.activities.foodTour') || '푸드투어'
      ],
      transportation: [
        t('tripPlanner.destinations.transportation.jrPass') || 'JR패스',
        t('tripPlanner.destinations.transportation.subway') || '지하철',
        t('tripPlanner.destinations.transportation.taxi') || '택시',
        t('tripPlanner.destinations.transportation.walking') || '도보'
      ],
      tips: [
        t('tripPlanner.destinations.tips.jrPassAdvance') || 'JR패스 미리 구매하면 교통비 절약',
        t('tripPlanner.destinations.tips.cashRequired') || '현금 사용이 일반적이니 충분히 준비',
        t('tripPlanner.destinations.tips.noTipping') || '팁 문화가 없으니 주의',
        t('tripPlanner.destinations.tips.earthquakeApp') || '지진 대비 앱 다운로드 권장'
      ],
      budgetBreakdown: {
        accommodation: t('tripPlanner.destinations.budgetBreakdown.tokyo.accommodation') || '50,000원/일',
        food: t('tripPlanner.destinations.budgetBreakdown.tokyo.food') || '30,000원/일',
        transport: t('tripPlanner.destinations.budgetBreakdown.tokyo.transport') || '15,000원/일',
        activities: t('tripPlanner.destinations.budgetBreakdown.tokyo.activities') || '25,000원/일'
      }
    },
    {
      id: 'seoul',
      emoji: '🏢',
      name: t('tripPlanner.destinations.cities.seoul') || '서울',
      country: t('tripPlanner.destinations.countries.korea') || '한국',
      region: t('tripPlanner.destinations.regions.eastAsia') || '동아시아',
      budget: t('tripPlanner.destinations.budget.range60to100') || '60-100만원',
      bestTime: t('tripPlanner.destinations.bestTime.aprJunSepNov') || '4-6월, 9-11월',
      duration: t('tripPlanner.destinations.duration.twoThreeDays') || '2-3일',
      highlights: [
        t('tripPlanner.destinations.attractions.myeongdong') || '명동',
        t('tripPlanner.destinations.attractions.gangnam') || '강남',
        t('tripPlanner.destinations.attractions.hongdae') || '홍대',
        t('tripPlanner.destinations.attractions.insadong') || '인사동'
      ],
      tags: [
        t('tripPlanner.destinations.tags.kpop') || 'K-pop',
        t('tripPlanner.destinations.tags.shopping') || '쇼핑',
        t('tripPlanner.destinations.tags.food') || '음식', 
        t('tripPlanner.destinations.tags.history') || '역사'
      ],
      weather: t('tripPlanner.destinations.weather.cloudy') || '구름',
      temp: '15°C',
      currency: 'KRW',
      exchangeRate: t('tripPlanner.destinations.exchangeRate.krw') || '기준 통화',
      visaRequired: false,
      visaDays: 0,
      flightTime: t('tripPlanner.destinations.flightTime.domestic') || '국내',
      timeZone: 'GMT+9',
      language: '한국어',
      mustSee: [
        t('tripPlanner.destinations.mustSee.gyeongbok') || '경복궁',
        t('tripPlanner.destinations.mustSee.nseoultower') || '남산타워',
        t('tripPlanner.destinations.mustSee.dongdaemun') || '동대문',
        t('tripPlanner.destinations.mustSee.cheonggyecheon') || '청계천'
      ],
      foodSpecialty: [
        t('tripPlanner.destinations.foodSpecialty.kimchi') || '김치',
        t('tripPlanner.destinations.foodSpecialty.bulgogi') || '불고기',
        t('tripPlanner.destinations.foodSpecialty.bibimbap') || '비빔밥',
        t('tripPlanner.destinations.foodSpecialty.samgyeopsal') || '삼겹살',
        t('tripPlanner.destinations.foodSpecialty.chicken') || '치킨'
      ],
      activities: [
        t('tripPlanner.destinations.activities.hanbok') || '한복 체험',
        t('tripPlanner.destinations.activities.kpopConcert') || 'K-pop 콘서트',
        t('tripPlanner.destinations.activities.shopping') || '쇼핑',
        t('tripPlanner.destinations.activities.hangang') || '한강 공원'
      ],
      transportation: [
        t('tripPlanner.destinations.transportation.subway') || '지하철',
        t('tripPlanner.destinations.transportation.bus') || '버스',
        t('tripPlanner.destinations.transportation.taxi') || '택시',
        t('tripPlanner.destinations.transportation.bikeRental') || '따릉이'
      ],
      tips: [
        t('tripPlanner.destinations.tips.tmoneyCard') || 'T-money카드로 교통비 절약',
        t('tripPlanner.destinations.tips.nightLife') || '24시간 운영하는 곳이 많아 야간 활동 추천',
        t('tripPlanner.destinations.tips.freeWifi') || '무료 WiFi가 잘 되어 있음',
        t('tripPlanner.destinations.tips.noTipping') || '팁 문화 없음'
      ],
      budgetBreakdown: {
        accommodation: t('tripPlanner.destinations.budgetBreakdown.seoul.accommodation') || '40,000원/일',
        food: t('tripPlanner.destinations.budgetBreakdown.seoul.food') || '25,000원/일',
        transport: t('tripPlanner.destinations.budgetBreakdown.seoul.transport') || '10,000원/일',
        activities: t('tripPlanner.destinations.budgetBreakdown.seoul.activities') || '20,000원/일'
      }
    },
    {
      id: 'bangkok',
      emoji: '🛕',
      name: t('tripPlanner.destinations.cities.bangkok') || '방콕',
      country: t('tripPlanner.destinations.countries.thailand') || '태국',
      region: t('tripPlanner.destinations.regions.southeastAsia') || '동남아시아',
      budget: t('tripPlanner.destinations.budget.range50to80') || '50-80만원',
      bestTime: t('tripPlanner.destinations.bestTime.novMar') || '11-3월',
      duration: t('tripPlanner.destinations.duration.threeFourDays') || '3-4일',
      highlights: [
        t('tripPlanner.destinations.attractions.watPho') || '왓포',
        t('tripPlanner.destinations.attractions.khaosanRoad') || '카오산로드',
        t('tripPlanner.destinations.attractions.chatuchakMarket') || '짜뚜짝'
      ],
      tags: [
        t('tripPlanner.destinations.tags.culture') || '문화',
        t('tripPlanner.destinations.tags.food') || '음식',
        t('tripPlanner.destinations.tags.massage') || '마사지',
        t('tripPlanner.destinations.tags.market') || '시장'
      ],
      weather: t('tripPlanner.destinations.weather.hot') || '더움',
      temp: '32°C',
      currency: 'THB',
      exchangeRate: t('tripPlanner.destinations.exchangeRate.thb') || '1,000원 = 24바트',
      visaRequired: false,
      visaDays: 30,
      flightTime: t('tripPlanner.destinations.flightTime.sixHour') || '6시간',
      timeZone: 'GMT+7',
      language: '태국어',
      mustSee: [
        t('tripPlanner.destinations.attractions.watArun') || '왓 아룬',
        t('tripPlanner.destinations.attractions.grandPalace') || '그랜드 팰리스',
        t('tripPlanner.destinations.attractions.floatingMarket') || '수상시장',
        t('tripPlanner.destinations.attractions.lumpiniPark') || '룸피니 공원'
      ],
      foodSpecialty: [
        t('tripPlanner.destinations.foodSpecialty.padthai') || '팟타이',
        t('tripPlanner.destinations.foodSpecialty.tomyum') || '똠얌꿍',
        t('tripPlanner.destinations.foodSpecialty.somtam') || '솜땀',
        t('tripPlanner.destinations.foodSpecialty.mangoStickyRice') || '망고 스티키 라이스'
      ],
      activities: [
        t('tripPlanner.destinations.activities.thaimassage') || '태국 마사지',
        t('tripPlanner.destinations.activities.floatingMarketTour') || '수상시장 투어',
        t('tripPlanner.destinations.activities.templeTour') || '사원 관람',
        t('tripPlanner.destinations.activities.rooftopBar') || '루프탑 바'
      ],
      transportation: [
        t('tripPlanner.destinations.transportation.tuktuk') || '툭툭',
        t('tripPlanner.destinations.transportation.bts') || 'BTS',
        t('tripPlanner.destinations.transportation.mrt') || 'MRT',
        t('tripPlanner.destinations.transportation.boat') || '보트'
      ],
      tips: [
        t('tripPlanner.destinations.tips.hydration') || '더위 대비 충분한 수분 섭취',
        t('tripPlanner.destinations.tips.modestClothing') || '왕궁 방문 시 단정한 복장 필수',
        t('tripPlanner.destinations.tips.checkChange') || '거스름돈 확인 철저히',
        t('tripPlanner.destinations.tips.streetFoodSafe') || '길거리 음식도 안전한 편'
      ],
      budgetBreakdown: {
        accommodation: t('tripPlanner.destinations.budgetBreakdown.bangkok.accommodation') || '25,000원/일',
        food: t('tripPlanner.destinations.budgetBreakdown.bangkok.food') || '15,000원/일',
        transport: t('tripPlanner.destinations.budgetBreakdown.bangkok.transport') || '8,000원/일',
        activities: t('tripPlanner.destinations.budgetBreakdown.bangkok.activities') || '12,000원/일'
      }
    },
    {
      id: 'paris',
      emoji: '🗼',
      name: t('tripPlanner.destinations.cities.paris') || '파리',
      country: t('tripPlanner.destinations.countries.france') || '프랑스',
      region: t('tripPlanner.destinations.regions.europe') || '유럽',
      budget: t('tripPlanner.destinations.budget.range150to250') || '150-250만원',
      bestTime: t('tripPlanner.destinations.bestTime.aprJunSepOct') || '4-6월, 9-10월',
      duration: t('tripPlanner.destinations.duration.fourFiveDays') || '4-5일',
      highlights: [
        t('tripPlanner.destinations.attractions.eiffelTower') || '에펠탑',
        t('tripPlanner.destinations.attractions.louvre') || '루브르',
        t('tripPlanner.destinations.attractions.champselysees') || '샹젤리제'
      ],
      tags: [
        t('tripPlanner.destinations.tags.art') || '예술',
        t('tripPlanner.destinations.tags.fashion') || '패션',
        t('tripPlanner.destinations.tags.food') || '음식',
        t('tripPlanner.destinations.tags.romantic') || '로맨틱'
      ],
      weather: t('tripPlanner.destinations.weather.cloudy') || '구름',
      temp: '12°C',
      currency: 'EUR',
      exchangeRate: t('tripPlanner.destinations.exchangeRate.eur') || '1,000원 = 0.68유로',
      visaRequired: false,
      visaDays: 90,
      flightTime: t('tripPlanner.destinations.flightTime.twelveHour') || '12시간',
      timeZone: 'GMT+1',
      language: '프랑스어',
      mustSee: [
        t('tripPlanner.destinations.mustSee.notredame') || '노트르담',
        t('tripPlanner.destinations.mustSee.montmartre') || '몽마르트',
        t('tripPlanner.destinations.mustSee.versaillesPalace') || '베르사유 궁전',
        t('tripPlanner.destinations.mustSee.orsayMuseum') || '오르세 미술관'
      ],
      foodSpecialty: [
        t('tripPlanner.destinations.foodSpecialty.croissant') || '크루아상',
        t('tripPlanner.destinations.foodSpecialty.macaron') || '마카롱',
        t('tripPlanner.destinations.foodSpecialty.escargot') || '에스카르고',
        t('tripPlanner.destinations.foodSpecialty.coqauvin') || '코코뱅'
      ],
      activities: [
        t('tripPlanner.destinations.activities.museumTour') || '미술관 투어',
        t('tripPlanner.destinations.activities.seineCruise') || '세느강 크루즈',
        t('tripPlanner.destinations.activities.shopping') || '쇼핑',
        t('tripPlanner.destinations.activities.cafeCulture') || '카페 문화'
      ],
      transportation: [
        t('tripPlanner.destinations.transportation.metro') || '메트로',
        t('tripPlanner.destinations.transportation.bus') || '버스',
        t('tripPlanner.destinations.transportation.taxi') || '택시',
        t('tripPlanner.destinations.transportation.walking') || '도보'
      ],
      tips: [
        t('tripPlanner.destinations.tips.museumPass') || '박물관 패스 구매 시 대기시간 단축',
        t('tripPlanner.destinations.tips.sundayClosed') || '일요일엔 많은 상점이 문 닫음',
        t('tripPlanner.destinations.tips.tipTenPercent') || '팁은 10% 정도가 적당',
        t('tripPlanner.destinations.tips.pickpocketWarning') || '소매치기 주의'
      ],
      budgetBreakdown: {
        accommodation: t('tripPlanner.destinations.budgetBreakdown.paris.accommodation') || '100,000원/일',
        food: t('tripPlanner.destinations.budgetBreakdown.paris.food') || '60,000원/일',
        transport: t('tripPlanner.destinations.budgetBreakdown.paris.transport') || '20,000원/일',
        activities: t('tripPlanner.destinations.budgetBreakdown.paris.activities') || '40,000원/일'
      }
    },
    {
      id: 'newyork',
      emoji: '🗽',
      name: t('tripPlanner.destinations.cities.newyork') || '뉴욕',
      country: t('tripPlanner.destinations.countries.usa') || '미국',
      region: t('tripPlanner.destinations.regions.northAmerica') || '북미',
      budget: t('tripPlanner.destinations.budget.range200to350') || '200-350만원',
      bestTime: t('tripPlanner.destinations.bestTime.aprJunSepNov') || '4-6월, 9-11월',
      duration: t('tripPlanner.destinations.duration.fiveSevenDays') || '5-7일',
      highlights: [
        t('tripPlanner.destinations.attractions.timeSquare') || '타임스퀘어',
        t('tripPlanner.destinations.attractions.centralPark') || '센트럴파크',
        t('tripPlanner.destinations.attractions.brooklynBridge') || '브루클린 브릿지'
      ],
      tags: [
        t('tripPlanner.destinations.tags.city') || '도시',
        t('tripPlanner.destinations.tags.culture') || '문화',
        t('tripPlanner.destinations.tags.shopping') || '쇼핑',
        t('tripPlanner.destinations.tags.broadway') || '브로드웨이'
      ],
      weather: t('tripPlanner.destinations.weather.sunny') || '맑음',
      temp: '16°C',
      currency: 'USD',
      exchangeRate: t('tripPlanner.destinations.exchangeRate.usd') || '1,000원 = 0.74달러',
      visaRequired: true,
      visaDays: 90,
      flightTime: t('tripPlanner.destinations.flightTime.fourteenHour') || '14시간',
      timeZone: 'GMT-5',
      language: '영어',
      mustSee: [
        t('tripPlanner.destinations.attractions.statueOfLiberty') || '자유의 여신상',
        t('tripPlanner.destinations.attractions.empireState') || '엠파이어 스테이트',
        t('tripPlanner.destinations.attractions.memorial911') || '9/11 메모리얼',
        t('tripPlanner.destinations.attractions.highLine') || 'High Line'
      ],
      foodSpecialty: [
        t('tripPlanner.destinations.foodSpecialty.hotdog') || '핫도그',
        t('tripPlanner.destinations.foodSpecialty.bagel') || '베이글',
        t('tripPlanner.destinations.foodSpecialty.cheesecake') || '치즈케이크',
        t('tripPlanner.destinations.foodSpecialty.steak') || '스테이크'
      ],
      activities: [
        t('tripPlanner.destinations.activities.broadwayMusical') || '브로드웨이 뮤지컬',
        t('tripPlanner.destinations.activities.museumTour') || '미술관 투어',
        t('tripPlanner.destinations.activities.shopping') || '쇼핑',
        t('tripPlanner.destinations.activities.rooftopBar') || '루프탑 바'
      ],
      transportation: [
        t('tripPlanner.destinations.transportation.subway') || '지하철',
        t('tripPlanner.destinations.transportation.taxi') || '택시',
        t('tripPlanner.destinations.transportation.uber') || '우버',
        t('tripPlanner.destinations.transportation.walking') || '도보'
      ],
      tips: [
        t('tripPlanner.destinations.tips.metroCard') || 'MetroCard로 교통비 절약',
        t('tripPlanner.destinations.tips.tipRequired') || '팁은 필수 (18-20%)',
        t('tripPlanner.destinations.tips.avoidLateSubway') || '안전을 위해 늦은 시간 지하철 피하기',
        t('tripPlanner.destinations.tips.estaRequired') || 'ESTA 사전 신청 필수'
      ],
      budgetBreakdown: {
        accommodation: t('tripPlanner.destinations.budgetBreakdown.newyork.accommodation') || '150,000원/일',
        food: t('tripPlanner.destinations.budgetBreakdown.newyork.food') || '80,000원/일',
        transport: t('tripPlanner.destinations.budgetBreakdown.newyork.transport') || '25,000원/일',
        activities: t('tripPlanner.destinations.budgetBreakdown.newyork.activities') || '60,000원/일'
      }
    },
    {
      id: 'sydney',
      emoji: '🏄‍♂️',
      name: t('tripPlanner.destinations.cities.sydney') || '시드니',
      country: t('tripPlanner.destinations.countries.australia') || '호주',
      region: t('tripPlanner.destinations.regions.oceania') || '오세아니아',
      budget: t('tripPlanner.destinations.budget.range180to280') || '180-280만원',
      bestTime: t('tripPlanner.destinations.bestTime.sepNovMarMay') || '9-11월, 3-5월',
      duration: t('tripPlanner.destinations.duration.fiveSevenDays') || '5-7일',
      highlights: [
        t('tripPlanner.destinations.attractions.operaHouse') || '오페라 하우스',
        t('tripPlanner.destinations.attractions.harborBridge') || '하버 브릿지',
        t('tripPlanner.destinations.attractions.bondyBeach') || '본다이 비치'
      ],
      tags: [
        t('tripPlanner.destinations.tags.beach') || '해변',
        t('tripPlanner.destinations.tags.nature') || '자연',
        t('tripPlanner.destinations.tags.city') || '도시',
        t('tripPlanner.destinations.tags.activities') || '액티비티'
      ],
      weather: t('tripPlanner.destinations.weather.sunny') || '맑음',
      temp: '22°C',
      currency: 'AUD',
      exchangeRate: t('tripPlanner.destinations.exchangeRate.aud') || '1,000원 = 1.1호주달러',
      visaRequired: true,
      visaDays: 90,
      flightTime: t('tripPlanner.destinations.flightTime.tenHour') || '10시간',
      timeZone: 'GMT+10',
      language: '영어',
      mustSee: [
        t('tripPlanner.destinations.mustSee.darlingHarbor') || '달링 하버',
        t('tripPlanner.destinations.mustSee.theRocks') || '록스',
        t('tripPlanner.destinations.mustSee.tarongaZoo') || '타롱가 동물원',
        t('tripPlanner.destinations.mustSee.blueMountains') || '블루 마운틴'
      ],
      foodSpecialty: [
        t('tripPlanner.destinations.foodSpecialty.meatPie') || '미트 파이',
        t('tripPlanner.destinations.foodSpecialty.vegemite') || '베지마이트',
        t('tripPlanner.destinations.foodSpecialty.barbecue') || '바베큐',
        t('tripPlanner.destinations.foodSpecialty.flatWhite') || '플랫 화이트'
      ],
      activities: [
        t('tripPlanner.destinations.activities.surfing') || '서핑',
        t('tripPlanner.destinations.activities.harborCruise') || '하버 크루즈',
        t('tripPlanner.destinations.activities.nationalParkHiking') || '국립공원 하이킹',
        t('tripPlanner.destinations.activities.wineryTour') || '와이너리 투어'
      ],
      transportation: [
        t('tripPlanner.destinations.transportation.train') || '기차',
        t('tripPlanner.destinations.transportation.bus') || '버스',
        t('tripPlanner.destinations.transportation.ferry') || '페리',
        t('tripPlanner.destinations.transportation.carRental') || '렌터카'
      ],
      tips: [
        t('tripPlanner.destinations.tips.opalCard') || 'Opal 카드로 대중교통 이용',
        t('tripPlanner.destinations.tips.sunscreen') || '자외선 차단제 필수',
        t('tripPlanner.destinations.tips.noTipping') || '팁 문화 없음',
        t('tripPlanner.destinations.tips.oppositeSeason') || '계절이 반대임을 고려'
      ],
      budgetBreakdown: {
        accommodation: t('tripPlanner.destinations.budgetBreakdown.sydney.accommodation') || '120,000원/일',
        food: t('tripPlanner.destinations.budgetBreakdown.sydney.food') || '70,000원/일',
        transport: t('tripPlanner.destinations.budgetBreakdown.sydney.transport') || '30,000원/일',
        activities: t('tripPlanner.destinations.budgetBreakdown.sydney.activities') || '50,000원/일'
      }
    }
  ], [t, currentLanguage]);

  const travelTemplates: TravelTemplate[] = [
    {
      id: 'japan-golden',
      title: t('tripPlanner.templates.japanGoldenRoute.title') || '일본 골든루트 5일',
      duration: t('tripPlanner.templates.japanGoldenRoute.duration') || '4박 5일',
      style: 'family',
      price: t('tripPlanner.templates.japanGoldenRoute.price') || '120만원',
      destinations: [
        t('tripPlanner.destinations.cities.tokyo') || '도쿄',
        t('tripPlanner.destinations.cities.kyoto') || '교토',
        t('tripPlanner.destinations.cities.osaka') || '오사카'
      ],
      itinerary: [
        { day: 1, location: t('tripPlanner.templates.cities.tokyo') || '도쿄', activities: Array.isArray(t('tripPlanner.templates.japanGoldenRoute.activities.day1')) ? t('tripPlanner.templates.japanGoldenRoute.activities.day1') : ['아사쿠사 센소지', '스카이트리', '긴자 쇼핑'] },
        { day: 2, location: t('tripPlanner.templates.cities.tokyo') || '도쿄', activities: Array.isArray(t('tripPlanner.templates.japanGoldenRoute.activities.day2')) ? t('tripPlanner.templates.japanGoldenRoute.activities.day2') : ['시부야 크로싱', '메이지신궁', '하라주쿠'] },
        { day: 3, location: t('tripPlanner.templates.cities.kyoto') || '교토', activities: Array.isArray(t('tripPlanner.templates.japanGoldenRoute.activities.day3')) ? t('tripPlanner.templates.japanGoldenRoute.activities.day3') : ['후시미 이나리', '기요미즈데라', '기온 거리'] },
        { day: 4, location: t('tripPlanner.templates.cities.osaka') || '오사카', activities: Array.isArray(t('tripPlanner.templates.japanGoldenRoute.activities.day4')) ? t('tripPlanner.templates.japanGoldenRoute.activities.day4') : ['오사카성', '도톤보리', '쿠로몬 시장'] },
        { day: 5, location: t('tripPlanner.templates.cities.osaka') || '오사카', activities: Array.isArray(t('tripPlanner.templates.japanGoldenRoute.activities.day5')) ? t('tripPlanner.templates.japanGoldenRoute.activities.day5') : ['유니버설 스튜디오', '쇼핑', '출국'] }
      ]
    },
    {
      id: 'europe-classic',
      title: t('tripPlanner.templates.europeClassic.title') || '유럽 클래식 7일',
      duration: t('tripPlanner.templates.europeClassic.duration') || '6박 7일',
      style: 'couple',
      price: t('tripPlanner.templates.europeClassic.price') || '250만원',
      destinations: [
        t('tripPlanner.templates.cities.paris') || '파리',
        t('tripPlanner.templates.cities.london') || '런던',
        t('tripPlanner.templates.cities.amsterdam') || '암스테르담'
      ],
      itinerary: [
        { day: 1, location: t('tripPlanner.templates.cities.paris') || '파리', activities: Array.isArray(t('tripPlanner.templates.europeClassic.activities.day1')) ? t('tripPlanner.templates.europeClassic.activities.day1') : ['에펠탑', '세느강 크루즈', '몽마르트'] },
        { day: 2, location: t('tripPlanner.templates.cities.paris') || '파리', activities: Array.isArray(t('tripPlanner.templates.europeClassic.activities.day2')) ? t('tripPlanner.templates.europeClassic.activities.day2') : ['루브르 박물관', '샹젤리제', '베르사유'] },
        { day: 3, location: t('tripPlanner.templates.cities.london') || '런던', activities: Array.isArray(t('tripPlanner.templates.europeClassic.activities.day3')) ? t('tripPlanner.templates.europeClassic.activities.day3') : ['빅벤', '타워 브릿지', '대영박물관'] },
        { day: 4, location: t('tripPlanner.templates.cities.london') || '런던', activities: Array.isArray(t('tripPlanner.templates.europeClassic.activities.day4')) ? t('tripPlanner.templates.europeClassic.activities.day4') : ['버킹엄궁전', '템즈강 크루즈', '코벤트가든'] },
        { day: 5, location: t('tripPlanner.templates.cities.amsterdam') || '암스테르담', activities: Array.isArray(t('tripPlanner.templates.europeClassic.activities.day5')) ? t('tripPlanner.templates.europeClassic.activities.day5') : ['반고흐 박물관', '안네 프랑크의 집'] },
        { day: 6, location: t('tripPlanner.templates.cities.amsterdam') || '암스테르담', activities: Array.isArray(t('tripPlanner.templates.europeClassic.activities.day6')) ? t('tripPlanner.templates.europeClassic.activities.day6') : ['운하 크루즈', '자전거 투어'] },
        { day: 7, location: t('tripPlanner.templates.cities.amsterdam') || '암스테르담', activities: Array.isArray(t('tripPlanner.templates.europeClassic.activities.day7')) ? t('tripPlanner.templates.europeClassic.activities.day7') : ['자유시간', '출국'] }
      ]
    },
    {
      id: 'southeast-backpack',
      title: t('tripPlanner.templates.southeastBackpack.title') || '동남아 배낭여행 10일',
      duration: t('tripPlanner.templates.southeastBackpack.duration') || '9박 10일',
      style: 'friends',
      price: t('tripPlanner.templates.southeastBackpack.price') || '80만원',
      destinations: [
        t('tripPlanner.templates.cities.bangkok') || '방콕',
        t('tripPlanner.templates.cities.chiangmai') || '치앙마이',
        t('tripPlanner.templates.cities.phuket') || '푸켓'
      ],
      itinerary: [
        { day: 1, location: t('tripPlanner.templates.cities.bangkok') || '방콕', activities: Array.isArray(t('tripPlanner.templates.southeastBackpack.activities.day1')) ? t('tripPlanner.templates.southeastBackpack.activities.day1') : ['왓포', '그랜드 팰리스', '카오산로드'] },
        { day: 2, location: t('tripPlanner.templates.cities.bangkok') || '방콕', activities: Array.isArray(t('tripPlanner.templates.southeastBackpack.activities.day2')) ? t('tripPlanner.templates.southeastBackpack.activities.day2') : ['수상시장', '짜뚜짝 마켓', '루프탑 바'] },
        { day: 3, location: t('tripPlanner.templates.cities.chiangmai') || '치앙마이', activities: Array.isArray(t('tripPlanner.templates.southeastBackpack.activities.day3')) ? t('tripPlanner.templates.southeastBackpack.activities.day3') : ['도이수텝', '나이트 바자', '태국 마사지'] },
        { day: 4, location: t('tripPlanner.templates.cities.chiangmai') || '치앙마이', activities: Array.isArray(t('tripPlanner.templates.southeastBackpack.activities.day4')) ? t('tripPlanner.templates.southeastBackpack.activities.day4') : ['코끼리 캠프', '지프라인', '선데이 마켓'] },
        { day: 5, location: t('tripPlanner.templates.cities.chiangmai') || '치앙마이', activities: Array.isArray(t('tripPlanner.templates.southeastBackpack.activities.day5')) ? t('tripPlanner.templates.southeastBackpack.activities.day5') : ['쿠킹클래스', '사원 투어'] },
        { day: 6, location: t('tripPlanner.templates.cities.phuket') || '푸켓', activities: Array.isArray(t('tripPlanner.templates.southeastBackpack.activities.day6')) ? t('tripPlanner.templates.southeastBackpack.activities.day6') : ['파통 비치', '방글라 로드'] },
        { day: 7, location: t('tripPlanner.templates.cities.phuket') || '푸켓', activities: Array.isArray(t('tripPlanner.templates.southeastBackpack.activities.day7')) ? t('tripPlanner.templates.southeastBackpack.activities.day7') : ['피피섬 투어', '스노클링'] },
        { day: 8, location: t('tripPlanner.templates.cities.phuket') || '푸켓', activities: Array.isArray(t('tripPlanner.templates.southeastBackpack.activities.day8')) ? t('tripPlanner.templates.southeastBackpack.activities.day8') : ['빅 부다', '쇼핑', '해변'] },
        { day: 9, location: t('tripPlanner.templates.cities.phuket') || '푸켓', activities: Array.isArray(t('tripPlanner.templates.southeastBackpack.activities.day9')) ? t('tripPlanner.templates.southeastBackpack.activities.day9') : ['스파', '자유시간'] },
        { day: 10, location: t('tripPlanner.templates.cities.phuket') || '푸켓', activities: Array.isArray(t('tripPlanner.templates.southeastBackpack.activities.day10')) ? t('tripPlanner.templates.southeastBackpack.activities.day10') : ['출국'] }
      ]
    }
  ];

  const interestOptions = [
    { id: 'food', name: t('tripPlanner.data.interests.food') as string, icon: Utensils },
    { id: 'shopping', name: t('tripPlanner.data.interests.shopping') as string, icon: ShoppingBag },
    { id: 'history', name: t('tripPlanner.data.interests.history') as string, icon: Landmark },
    { id: 'nature', name: t('tripPlanner.data.interests.nature') as string, icon: TreePine },
    { id: 'activity', name: t('tripPlanner.data.interests.activity') as string, icon: Mountain },
    { id: 'photo', name: t('tripPlanner.data.interests.photo') as string, icon: Camera },
    { id: 'nightlife', name: t('tripPlanner.data.interests.nightlife') as string, icon: Building2 },
    { id: 'beach', name: t('tripPlanner.data.interests.beach') as string, icon: Waves }
  ];

  // Debug: 번역 데이터 구조 확인
  const budgetOptionsData = t('tripPlanner.data.budgetOptions');
  console.log('budgetOptionsData:', budgetOptionsData, typeof budgetOptionsData);
  
  const durationOptionsData = t('tripPlanner.data.durationOptions');
  console.log('durationOptionsData:', durationOptionsData, typeof durationOptionsData);
  
  // 실제 구조에 따라 처리
  let budgetOptions: string[];
  let durationOptions: string[];
  
  if (typeof budgetOptionsData === 'object' && budgetOptionsData !== null) {
    budgetOptions = Object.values(budgetOptionsData as Record<string, string>);
  } else {
    // 문자열인 경우 직접 배열로 만들기
    budgetOptions = ['20만원 이하', '20-50만원', '50-100만원', '100-200만원', '200만원 이상', '예산 상관없음'];
  }
  
  if (typeof durationOptionsData === 'object' && durationOptionsData !== null) {
    durationOptions = Object.values(durationOptionsData as Record<string, string>);
  } else {
    // 문자열인 경우 직접 배열로 만들기
    durationOptions = [
      t('tripPlanner.data.durationOptions.dayTrip') || '당일치기',
      t('tripPlanner.data.durationOptions.oneNight') || '1박 2일',
      t('tripPlanner.data.durationOptions.twoNights') || '2박 3일',
      t('tripPlanner.data.durationOptions.threeNights') || '3박 4일',
      t('tripPlanner.data.durationOptions.fourNights') || '4박 5일',
      t('tripPlanner.data.durationOptions.oneWeek') || '1주일',
      t('tripPlanner.data.durationOptions.twoWeeks') || '2주일',
      t('tripPlanner.data.durationOptions.oneMonth') || '1개월',
      t('tripPlanner.data.durationOptions.custom') || '직접 입력'
    ];
  }

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleGeneratePlan = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      // Here you would normally navigate or generate the plan
    }, 3000);
  };

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case '맑음': return <Sun className="w-4 h-4 text-yellow-500" />;
      case '구름': return <Cloud className="w-4 h-4 text-gray-500" />;
      case '비': return <CloudRain className="w-4 h-4 text-blue-500" />;
      case '눈': return <Snowflake className="w-4 h-4 text-blue-300" />;
      case '더움': return <Thermometer className="w-4 h-4 text-red-500" />;
      default: return <Sun className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full glass-effect">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={() => window.location.href = '/'}
              className="flex items-center space-x-2 text-gray-400 hover:text-black transition-colors"
            >
              <ArrowLeft size={16} />
              <span className="text-sm">{t('tripPlanner.header.goBack')}</span>
            </button>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">T</span>
              </div>
              <h1 className="text-xl font-bold text-black hidden sm:block">TripRadio.AI</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* 다국어 드롭다운 */}
              <div className="relative" ref={languageDropdownRef}>
                <button 
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-black"
                >
                  <Globe size={16} />
                  <span>
                    {currentLanguage === 'ko' && '한국어'}
                    {currentLanguage === 'en' && 'English'}
                    {currentLanguage === 'ja' && '日本語'}
                    {currentLanguage === 'zh' && '中文'}
                    {currentLanguage === 'es' && 'Español'}
                  </span>
                  <ChevronDown size={12} />
                </button>
                {showLanguageDropdown && (
                  <div className="absolute right-0 mt-2 py-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setShowLanguageDropdown(false);
                        }}
                        className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-50 ${
                          currentLanguage === lang.code ? 'text-blue-600 font-medium' : 'text-gray-700'
                        }`}
                      >
                        {lang.nativeName}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 히스토리 버튼 */}
              <button 
                onClick={() => router.push('/history')}
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-black"
              >
                <History size={16} />
                <span>{t('tripPlanner.header.history')}</span>
              </button>

              {/* 로그인/로그아웃 버튼 */}
              {session ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {session.user?.name || session.user?.email}
                  </span>
                  <button 
                    onClick={() => signOut()}
                    className="text-sm text-gray-600 hover:text-black"
                  >
                    {t('tripPlanner.header.signOut')}
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => signIn()}
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-black"
                >
                  <User size={16} />
                  <span>{t('tripPlanner.header.signIn')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-neutral-100 text-neutral-800 text-sm font-medium mb-6">
            {t('tripPlanner.badge')}
          </div>
          
          <h1 className="text-2xl md:text-3xl text-black mb-4 font-bold" style={{ lineHeight: '1.2', letterSpacing: '-0.02em' }}>
            {t('tripPlanner.hero.title')}
          </h1>
          
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto mb-6" style={{ lineHeight: '1.4' }}>
            {t('tripPlanner.hero.subtitle')}
          </p>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="planner">{t('tripPlanner.tabs.planner')}</TabsTrigger>
            <TabsTrigger value="destinations">{t('tripPlanner.tabs.destinations')}</TabsTrigger>
            <TabsTrigger value="templates">{t('tripPlanner.tabs.templates')}</TabsTrigger>
            <TabsTrigger value="tools">{t('tripPlanner.tabs.tools')}</TabsTrigger>
          </TabsList>

          {/* 계획 만들기 탭 */}
          <TabsContent value="planner" className="space-y-8">
              {/* Planning Form */}
              <div className="bg-neutral-50 rounded-3xl p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-semibold text-black mb-2">{t('tripPlanner.quickPlanner.title')}</h2>
                </div>

                {/* Travel Style Selection */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-black mb-4">{t('tripPlanner.planner.travelStyle')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {travelStyles.map((style) => (
                      <Card 
                        key={style.id}
                        className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                          selectedTravelStyle === style.id 
                            ? 'ring-2 ring-black bg-black text-white' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedTravelStyle(style.id)}
                      >
                        <div className="text-center mb-4">
                          <div className="text-2xl mb-2">{style.emoji}</div>
                          <h4 className="font-medium mb-1">{style.title}</h4>
                          <p className={`text-sm mb-2 ${
                            selectedTravelStyle === style.id ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            {style.description}
                          </p>
                        </div>
                        <div className={`space-y-2 text-xs ${
                          selectedTravelStyle === style.id ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                          <div>{t('tripPlanner.planner.budget')}: {style.budget}</div>
                          <div>{t('tripPlanner.planner.duration')}: {style.duration}</div>
                          <div className="flex flex-wrap gap-1">
                            {style.focus.slice(0, 2).map((focus, index) => (
                              <span key={index} className={`px-2 py-0.5 rounded-md text-xs border ${
                                selectedTravelStyle === style.id ? 'border-gray-600' : 'border-gray-300'
                              }`}>
                                {focus}
                              </span>
                            ))}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Destination and Duration */}
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-black">{t('tripPlanner.planner.destinationAndDuration')}</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-gray-700 font-medium block mb-2">{t('tripPlanner.planner.destination')}</label>
                        <input
                          type="text"
                          placeholder={t('tripPlanner.planner.destinationPlaceholder') as string}
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          className="w-full px-4 py-2 rounded-full border border-gray-300 focus:border-black focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-gray-700 font-medium block mb-2">{t('tripPlanner.planner.startDate')}</label>
                        <div className="relative">
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            placeholder={t('tripPlanner.form.startDatePlaceholder')}
                            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:border-black focus:outline-none"
                          />
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                      </div>

                      <div>
                        <label className="text-gray-700 font-medium block mb-2">{t('tripPlanner.planner.duration')}</label>
                        <div className="relative">
                          <select
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-black focus:border-transparent appearance-none bg-white"
                          >
                            {durationOptions.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-black">{t('tripPlanner.planner.budgetAndPreferences')}</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-gray-700 font-medium block mb-2">{t('tripPlanner.planner.budget')}</label>
                        <div className="relative">
                          <select
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-black focus:border-transparent appearance-none bg-white"
                          >
                            {budgetOptions.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="text-gray-700 font-medium block mb-2">{t('tripPlanner.planner.interests')}</label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {interestOptions.map((interest) => (
                            <label key={interest.id} className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                              <input
                                type="checkbox"
                                checked={interests.includes(interest.id)}
                                onChange={() => toggleInterest(interest.id)}
                                className="rounded border-gray-300 text-black focus:ring-black"
                              />
                              <interest.icon className="w-4 h-4" />
                              <span className="text-sm text-gray-700">{interest.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <div className="text-center">
                  <button
                    onClick={handleGeneratePlan}
                    disabled={!destination || !selectedTravelStyle || isGenerating}
                    className="bg-black text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>{t('tripPlanner.planner.generating')}</span>
                      </div>
                    ) : (
                      t('tripPlanner.planner.generatePlan')
                    )}
                  </button>
                  <p className="text-sm text-gray-500 mt-2">{t('tripPlanner.planner.completionTime')}</p>
                </div>
              </div>
          </TabsContent>

          {/* 여행지 탐색 탭 */}
          <TabsContent value="destinations" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-black mb-2">{t('tripPlanner.destinations.title')}</h2>
                <p className="text-gray-600">{t('tripPlanner.destinations.subtitle')}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {destinations.map((dest) => (
                  <Card 
                    key={dest.id} 
                    className={`p-6 hover:shadow-lg transition-all cursor-pointer ${
                      selectedDestination?.id === dest.id ? 'ring-2 ring-black' : ''
                    }`}
                    onClick={() => setSelectedDestination(selectedDestination?.id === dest.id ? null : dest)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-black flex items-center space-x-2">
                          <span className="text-2xl">{dest.emoji}</span>
                          <span>{dest.name}</span>
                        </h3>
                        <p className="text-sm text-gray-600">{dest.country} • {dest.region}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          {getWeatherIcon(dest.weather)}
                          <span className="text-sm">{dest.temp}</span>
                        </div>
                        <p className="text-xs text-gray-500">{dest.bestTime}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">{t('tripPlanner.planner.budget')}:</span>
                        <span className="font-medium text-black">{dest.budget}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">{t('tripPlanner.planner.recommendedDuration')}:</span>
                        <span className="font-medium text-black">{dest.duration}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">{t('tripPlanner.labels.flightTime') || '비행시간:'}</span>
                        <span className="font-medium text-black">{dest.flightTime}</span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <p className="text-sm text-gray-500">{t('tripPlanner.labels.highlights') || '주요 명소'}</p>
                      <p className="text-sm text-gray-700">{dest.highlights.join(', ')}</p>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-4">
                      {dest.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-neutral-100 text-neutral-700 rounded-md text-xs">
                          {tag}
                        </span>
                      ))}
                      {dest.visaRequired === false && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs">
                          {t('tripPlanner.labels.visaFree') || '무비자'}
                        </span>
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              {/* 선택된 여행지 상세 정보 */}
              {selectedDestination && (
                <Card className="p-8 mt-8 bg-gray-50">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <span className="text-4xl">{selectedDestination.emoji}</span>
                      <div>
                        <h2 className="text-2xl font-bold">{selectedDestination.name}</h2>
                        <p className="text-gray-600">{selectedDestination.country}</p>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600" onClick={() => setSelectedDestination(null)}>
                      ✕
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-black">{t('tripPlanner.labels.basicInfo') || '기본 정보'}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('tripPlanner.labels.currency') || '통화:'}</span>
                          <span>{selectedDestination.currency}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('tripPlanner.labels.exchangeRate') || '환율:'}</span>
                          <span className="text-xs">{selectedDestination.exchangeRate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('tripPlanner.labels.language') || '언어:'}</span>
                          <span>{selectedDestination.language}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('tripPlanner.labels.timeZone') || '시차:'}</span>
                          <span>{selectedDestination.timeZone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('tripPlanner.labels.visa') || '비자:'}</span>
                          <span>
                            {selectedDestination.visaRequired 
                              ? t('tripPlanner.tools.visaRequired') 
                              : `${t('tripPlanner.tools.visaNotRequired')} ${selectedDestination.visaDays}${t('tripPlanner.tools.visaDays')}`
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-black">{t('tripPlanner.labels.budgetAnalysis') || '예산 분석'}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('tripPlanner.labels.accommodation') || '숙박:'}</span>
                          <span>{selectedDestination.budgetBreakdown.accommodation}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('tripPlanner.labels.food') || '식비:'}</span>
                          <span>{selectedDestination.budgetBreakdown.food}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('tripPlanner.labels.transport') || '교통:'}</span>
                          <span>{selectedDestination.budgetBreakdown.transport}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('tripPlanner.labels.activities') || '액티비티:'}</span>
                          <span>{selectedDestination.budgetBreakdown.activities}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-black">{t('tripPlanner.labels.transportation') || '교통수단'}</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedDestination.transportation.map((transport, index) => (
                          <span key={index} className="px-2 py-1 border border-gray-300 rounded text-xs">
                            {transport}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="font-semibold text-black mb-3">{t('tripPlanner.labels.mustSee') || '꼭 가봐야 할 곳'}</h3>
                      <ul className="space-y-1 text-sm text-gray-700">
                        {selectedDestination.mustSee.map((place, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <MapPin className="w-3 h-3" />
                            <span>{place}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-black mb-3">{t('tripPlanner.labels.localFood') || '현지 음식'}</h3>
                      <ul className="space-y-1 text-sm text-gray-700">
                        {selectedDestination.foodSpecialty.map((food, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <Utensils className="w-3 h-3" />
                            <span>{food}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-black">{t('tripPlanner.labels.travelTips') || '여행 팁'}</h3>
                    <ul className="space-y-2">
                      {selectedDestination.tips.map((tip, index) => (
                        <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                          <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              )}
          </TabsContent>

          {/* 추천 일정 탭 */}
          <TabsContent value="templates" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-black mb-2">{t('tripPlanner.templates.title')}</h2>
                <p className="text-gray-600">{t('tripPlanner.templates.subtitle')}</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {travelTemplates.map((template) => (
                  <Card 
                    key={template.id} 
                    className={`p-6 hover:shadow-lg transition-all cursor-pointer ${
                      selectedTemplate?.id === template.id ? 'ring-2 ring-black' : ''
                    }`}
                    onClick={() => setSelectedTemplate(selectedTemplate?.id === template.id ? null : template)}
                  >
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-black mb-2">{template.title}</h3>
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                        <span>{template.duration}</span>
                        <span className="font-semibold text-black">{template.price}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {template.destinations.map((dest, index) => (
                          <span key={index} className="px-2 py-1 bg-neutral-100 text-neutral-700 rounded-md text-xs">
                            {dest}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">{t('tripPlanner.templates.preview')}</p>
                      {template.itinerary.slice(0, 3).map((day) => (
                        <div key={day.day} className="text-xs text-gray-600">
                          <span className="font-medium">{t('tripPlanner.templates.day')} {day.day}</span> {day.location}: {day.activities[0]}
                          {day.activities.length > 1 && '...'}
                        </div>
                      ))}
                    </div>

                    <button className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                      {t('tripPlanner.templates.viewDetails')}
                    </button>
                  </Card>
                ))}
              </div>

              {/* 선택된 템플릿 상세 정보 */}
              {selectedTemplate && (
                <Card className="p-8 mt-8 bg-gray-50">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedTemplate.title}</h2>
                      <p className="text-gray-600">{selectedTemplate.duration} • {selectedTemplate.price}</p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600" onClick={() => setSelectedTemplate(null)}>
                      ✕
                    </button>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-black">{t('tripPlanner.templates.detailedItinerary')}</h3>
                    {selectedTemplate.itinerary.map((day) => (
                      <div key={day.day} className="border-l-4 border-black pl-4 pb-4">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                            {day.day}
                          </div>
                          <h4 className="font-semibold text-lg">{day.location}</h4>
                        </div>
                        <ul className="space-y-1 ml-11">
                          {day.activities.map((activity, index) => (
                            <li key={index} className="text-gray-700 flex items-center space-x-2">
                              <Clock className="w-3 h-3" />
                              <span>{activity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex space-x-4">
                    <button className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800">
                      {t('tripPlanner.templates.startPlan')}
                    </button>
                    <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      {t('tripPlanner.templates.customize')}
                    </button>
                  </div>
                </Card>
              )}
          </TabsContent>

          {/* 여행 도구 탭 */}
          <TabsContent value="tools" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-black mb-2">{t('tripPlanner.tools.title')}</h2>
                <p className="text-gray-600">{t('tripPlanner.tools.subtitle')}</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 환율 계산기 */}
                <Card className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-green-100 p-3 rounded-full">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-black">{t('tripPlanner.tools.currencyConverter')}</h3>
                      <p className="text-sm text-gray-600">{t('tripPlanner.tools.currencyDescription')}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <input type="number" placeholder={t('tripPlanner.tools.amountPlaceholder') as string} className="flex-1 px-3 py-2 border rounded-lg" />
                      <select className="px-3 py-2 border rounded-lg">
                        <option>KRW</option>
                        <option>USD</option>
                        <option>EUR</option>
                        <option>JPY</option>
                      </select>
                    </div>
                    <div className="text-center">→</div>
                    <div className="text-center p-3 bg-gray-100 rounded-lg">
                      <span className="text-lg font-bold">{t('tripPlanner.tools.calculationResult')}</span>
                    </div>
                  </div>
                </Card>

                {/* 날씨 정보 */}
                <Card className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Sun className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-black">{t('tripPlanner.tools.weather')}</h3>
                      <p className="text-sm text-gray-600">{t('tripPlanner.tools.weatherDescription')}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <input type="text" placeholder={t('tripPlanner.tools.cityPlaceholder') as string} className="w-full px-3 py-2 border rounded-lg" />
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-gray-100 rounded">
                        <span className="text-sm">{t('tripPlanner.tools.today')}</span>
                        <div className="flex items-center space-x-2">
                          <Sun className="w-4 h-4" />
                          <span>22°C</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-100 rounded">
                        <span className="text-sm">{t('tripPlanner.tools.tomorrow')}</span>
                        <div className="flex items-center space-x-2">
                          <Cloud className="w-4 h-4" />
                          <span>18°C</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* 여행 체크리스트 */}
                <Card className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <Star className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-black">{t('tripPlanner.tools.checklist')}</h3>
                      <p className="text-sm text-gray-600">{t('tripPlanner.tools.checklistDescription')}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[
                      t('tripPlanner.labels.passport') || '여권/신분증',
                      t('tripPlanner.labels.ticket') || '항공권',
                      t('tripPlanner.labels.reservation') || '숙소 예약',
                      t('tripPlanner.labels.insurance') || '여행자 보험',
                      t('tripPlanner.labels.localCurrency') || '현지 통화'
                    ].map((item, index) => (
                      <label key={index} className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">{item}</span>
                      </label>
                    ))}
                  </div>
                  <button className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                    {t('tripPlanner.tools.viewFullChecklist')}
                  </button>
                </Card>

                {/* 비자 정보 */}
                <Card className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-red-100 p-3 rounded-full">
                      <Plane className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-black">{t('tripPlanner.tools.visaInfo')}</h3>
                      <p className="text-sm text-gray-600">{t('tripPlanner.tools.visaDescription')}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <select className="w-full px-3 py-2 border rounded-lg">
                      <option>{t('tripPlanner.tools.selectCountry')}</option>
                      <option>{t('tripPlanner.tools.countries.japan')}</option>
                      <option>{t('tripPlanner.tools.countries.usa')}</option>
                      <option>{t('tripPlanner.tools.countries.europe')}</option>
                      <option>{t('tripPlanner.tools.countries.southeastAsia')}</option>
                    </select>
                    <div className="p-3 bg-gray-100 rounded-lg text-sm">
                      <p className="font-medium">{t('tripPlanner.tools.visaDetails.japan.title')}</p>
                      <p>{t('tripPlanner.tools.visaDetails.japan.noVisa90Days')}</p>
                      <p>{t('tripPlanner.tools.visaDetails.japan.passportValidity')}</p>
                      <p>{t('tripPlanner.tools.visaDetails.japan.returnTicket')}</p>
                    </div>
                  </div>
                </Card>

                {/* 시차 계산기 */}
                <Card className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-orange-100 p-3 rounded-full">
                      <Clock className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-black">{t('tripPlanner.tools.timezone')}</h3>
                      <p className="text-sm text-gray-600">{t('tripPlanner.tools.timezoneDescription')}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <select className="w-full px-3 py-2 border rounded-lg">
                      <option>{t('tripPlanner.tools.selectDestination')}</option>
                      <option>{t('tripPlanner.destinations.cities.tokyo') || '도쿄'} (+0시간)</option>
                      <option>{t('tripPlanner.destinations.cities.paris') || '파리'} (-8시간)</option>
                      <option>{t('tripPlanner.destinations.cities.newyork') || '뉴욕'} (-14시간)</option>
                    </select>
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="p-2 bg-gray-100 rounded">
                        <p className="text-xs text-gray-500">{t('tripPlanner.tools.koreaTime')}</p>
                        <p className="font-bold">오후 3:00</p>
                      </div>
                      <div className="p-2 bg-blue-100 rounded">
                        <p className="text-xs text-blue-600">{t('tripPlanner.tools.localTime')}</p>
                        <p className="font-bold">오후 3:00</p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* 번역 도구 */}
                <Card className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-teal-100 p-3 rounded-full">
                      <Building2 className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-black">{t('tripPlanner.tools.phrases')}</h3>
                      <p className="text-sm text-gray-600">{t('tripPlanner.tools.phrasesDescription')}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[
                      { ko: '안녕하세요', en: 'Hello' },
                      { ko: '감사합니다', en: 'Thank you' },
                      { ko: '얼마예요?', en: 'How much?' },
                      { ko: '화장실이 어디예요?', en: 'Where is the bathroom?' }
                    ].map((phrase, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                        <div className="font-medium">{phrase.ko}</div>
                        <div className="text-gray-600">{phrase.en}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* CTA Section */}
      <section className="bg-black text-white py-16 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t('tripPlanner.cta.title')}
          </h2>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            {t('tripPlanner.cta.subtitle')}
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-black" />
              </div>
              <h3 className="font-medium text-white mb-2">{t('tripPlanner.cta.feature1Title')}</h3>
              <p className="text-sm text-gray-300">
                {t('tripPlanner.cta.feature1Description')}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-black" />
              </div>
              <h3 className="font-medium text-white mb-2">{t('tripPlanner.cta.feature2Title')}</h3>
              <p className="text-sm text-gray-300">
                {t('tripPlanner.cta.feature2Description')}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Plane className="w-8 h-8 text-black" />
              </div>
              <h3 className="font-medium text-white mb-2">{t('tripPlanner.cta.feature3Title')}</h3>
              <p className="text-sm text-gray-300">
                {t('tripPlanner.cta.feature3Description')}
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="inline-block bg-white text-black px-8 py-3 rounded-full text-lg font-medium hover:bg-gray-100 transition-colors"
          >
            {t('tripPlanner.cta.button')}
          </Link>
        </div>
      </section>
    </div>
  );
}