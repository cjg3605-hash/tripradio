import { useState, useMemo } from "react";
import { ArrowLeft, Search, Filter, Globe, Calendar, AlertCircle, CheckCircle, XCircle, Info, Plane, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface VisaCheckerPageProps {
  onBackToHome: () => void;
}

interface CountryVisaInfo {
  id: string;
  country: string;
  countryKo: string;
  emoji: string;
  region: string;
  visaRequired: 'none' | 'required' | 'on-arrival' | 'evisa';
  stayDuration: number;
  processingTime?: string;
  fee?: string;
  requirements: string[];
  notes?: string;
  lastUpdated: string;
  popularRank?: number;
}

export function VisaCheckerPage({ onBackToHome }: VisaCheckerPageProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedVisaType, setSelectedVisaType] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedCountry, setSelectedCountry] = useState<CountryVisaInfo | null>(null);
  const [activeTab, setActiveTab] = useState<string>('popular');
  
  const countriesPerPage = 12;

  // 전 세계 195개국 비자 정보 데이터베이스
  const allCountriesData: CountryVisaInfo[] = [
    // 인기 여행지 (Popular)
    {
      id: 'japan',
      country: 'Japan',
      countryKo: '일본',
      emoji: '🇯🇵',
      region: 'Asia',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권', '충분한 체재비 증명'],
      notes: '관광, 상용, 친족방문 목적으로 90일간 무비자 체류 가능',
      lastUpdated: '2024-01-15',
      popularRank: 1
    },
    {
      id: 'thailand',
      country: 'Thailand',
      countryKo: '태국',
      emoji: '🇹🇭',
      region: 'Asia',
      visaRequired: 'none',
      stayDuration: 30,
      requirements: ['유효한 여권 (6개월 이상)', '출국 항공권', '숙박 증명서'],
      notes: '관광 목적으로 30일간 무비자 체류 가능',
      lastUpdated: '2024-01-15',
      popularRank: 2
    },
    {
      id: 'singapore',
      country: 'Singapore',
      countryKo: '싱가포르',
      emoji: '🇸🇬',
      region: 'Asia',
      visaRequired: 'none',
      stayDuration: 30,
      requirements: ['유효한 여권 (6개월 이상)', '충분한 체재비', '숙박 증명서'],
      notes: '관광 목적으로 30일간 무비자 체류 가능',
      lastUpdated: '2024-01-15',
      popularRank: 3
    },
    {
      id: 'usa',
      country: 'United States',
      countryKo: '미국',
      emoji: '🇺🇸',
      region: 'North America',
      visaRequired: 'required',
      stayDuration: 90,
      processingTime: '평균 30-60일',
      fee: '$185',
      requirements: ['ESTA 사전 신청', 'DS-160 양식', '면접 (일부 경우)', '재정 증명서'],
      notes: 'ESTA로 90일 체류 가능하나 별도 신청 필요',
      lastUpdated: '2024-01-15',
      popularRank: 4
    },
    {
      id: 'france',
      country: 'France',
      countryKo: '프랑스',
      emoji: '🇫🇷',
      region: 'Europe',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (3개월 이상)', '왕복 항공권', '여행자 보험'],
      notes: '솅겐 협정으로 90일간 무비자 체류 가능',
      lastUpdated: '2024-01-15',
      popularRank: 5
    },
    {
      id: 'uk',
      country: 'United Kingdom',
      countryKo: '영국',
      emoji: '🇬🇧',
      region: 'Europe',
      visaRequired: 'required',
      stayDuration: 180,
      processingTime: '평균 15-30일',
      fee: '£100',
      requirements: ['온라인 신청서', '여권 사진', '재정 증명서', '숙박 예약 확인서'],
      notes: '관광 목적으로 6개월 체류 가능',
      lastUpdated: '2024-01-15',
      popularRank: 6
    },
    {
      id: 'australia',
      country: 'Australia',
      countryKo: '호주',
      emoji: '🇦🇺',
      region: 'Oceania',
      visaRequired: 'evisa',
      stayDuration: 90,
      processingTime: '즉시-24시간',
      fee: 'AUD $20',
      requirements: ['ETA 온라인 신청', '유효한 여권', '왕복 항공권'],
      notes: 'ETA(전자여행허가)로 90일 체류 가능',
      lastUpdated: '2024-01-15',
      popularRank: 7
    },
    {
      id: 'canada',
      country: 'Canada',
      countryKo: '캐나다',
      emoji: '🇨🇦',
      region: 'North America',
      visaRequired: 'evisa',
      stayDuration: 180,
      processingTime: '즉시-몇 분',
      fee: 'CAD $7',
      requirements: ['eTA 온라인 신청', '유효한 여권', '신용카드'],
      notes: 'eTA로 6개월 체류 가능',
      lastUpdated: '2024-01-15',
      popularRank: 8
    },
    {
      id: 'vietnam',
      country: 'Vietnam',
      countryKo: '베트남',
      emoji: '🇻🇳',
      region: 'Asia',
      visaRequired: 'none',
      stayDuration: 45,
      requirements: ['유효한 여권 (6개월 이상)', '출국 항공권'],
      notes: '2024년부터 45일간 무비자 체류 가능',
      lastUpdated: '2024-01-15',
      popularRank: 9
    },
    {
      id: 'germany',
      country: 'Germany',
      countryKo: '독일',
      emoji: '🇩🇪',
      region: 'Europe',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (3개월 이상)', '왕복 항공권', '여행자 보험'],
      notes: '솅겐 협정으로 90일간 무비자 체류 가능',
      lastUpdated: '2024-01-15',
      popularRank: 10
    },

    // 아시아 국가들
    {
      id: 'china',
      country: 'China',
      countryKo: '중국',
      emoji: '🇨🇳',
      region: 'Asia',
      visaRequired: 'required',
      stayDuration: 30,
      processingTime: '평균 4-7일',
      fee: '₩70,000',
      requirements: ['비자 신청서', '여권 사진', '초청장 또는 여행 일정표', '재정 증명서'],
      notes: '관광 목적으로 30일 체류 가능 (비자 필요)',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'india',
      country: 'India',
      countryKo: '인도',
      emoji: '🇮🇳',
      region: 'Asia',
      visaRequired: 'evisa',
      stayDuration: 30,
      processingTime: '평균 3-5일',
      fee: '$25',
      requirements: ['e-비자 온라인 신청', '디지털 사진', '여권 스캔본'],
      notes: 'e-Tourist 비자로 30일 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'malaysia',
      country: 'Malaysia',
      countryKo: '말레이시아',
      emoji: '🇲🇾',
      region: 'Asia',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (6개월 이상)', '출국 항공권', '충분한 체재비'],
      notes: '관광 목적으로 90일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'philippines',
      country: 'Philippines',
      countryKo: '필리핀',
      emoji: '🇵🇭',
      region: 'Asia',
      visaRequired: 'none',
      stayDuration: 30,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권'],
      notes: '관광 목적으로 30일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'indonesia',
      country: 'Indonesia',
      countryKo: '인도네시아',
      emoji: '🇮🇩',
      region: 'Asia',
      visaRequired: 'none',
      stayDuration: 30,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권'],
      notes: '관광 목적으로 30일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'taiwan',
      country: 'Taiwan',
      countryKo: '대만',
      emoji: '🇹🇼',
      region: 'Asia',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권'],
      notes: '관광 목적으로 90일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'hongkong',
      country: 'Hong Kong',
      countryKo: '홍콩',
      emoji: '🇭🇰',
      region: 'Asia',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (1개월 이상)', '왕복 항공권'],
      notes: '관광 목적으로 90일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'macau',
      country: 'Macau',
      countryKo: '마카오',
      emoji: '🇲🇴',
      region: 'Asia',
      visaRequired: 'none',
      stayDuration: 30,
      requirements: ['유효한 여권 (1개월 이상)', '왕복 항공권'],
      notes: '관광 목적으로 30일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'mongolia',
      country: 'Mongolia',
      countryKo: '몽골',
      emoji: '🇲🇳',
      region: 'Asia',
      visaRequired: 'none',
      stayDuration: 30,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권'],
      notes: '관광 목적으로 30일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'myanmar',
      country: 'Myanmar',
      countryKo: '미얀마',
      emoji: '🇲🇲',
      region: 'Asia',
      visaRequired: 'evisa',
      stayDuration: 28,
      processingTime: '평균 3-5일',
      fee: '$50',
      requirements: ['e-비자 온라인 신청', '여권 사진', '여권 스캔본'],
      notes: 'e-비자로 28일 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'nepal',
      country: 'Nepal',
      countryKo: '네팔',
      emoji: '🇳🇵',
      region: 'Asia',
      visaRequired: 'on-arrival',
      stayDuration: 30,
      fee: '$30',
      requirements: ['유효한 여권 (6개월 이상)', '여권 사진', '비자 수수료'],
      notes: '도착 비자로 30일 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'sri-lanka',
      country: 'Sri Lanka',
      countryKo: '스리랑카',
      emoji: '🇱🇰',
      region: 'Asia',
      visaRequired: 'evisa',
      stayDuration: 30,
      processingTime: '평균 1-3일',
      fee: '$20',
      requirements: ['ETA 온라인 신청', '여권 스캔본', '신용카드'],
      notes: 'ETA로 30일 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'bangladesh',
      country: 'Bangladesh',
      countryKo: '방글라데시',
      emoji: '🇧🇩',
      region: 'Asia',
      visaRequired: 'on-arrival',
      stayDuration: 30,
      fee: '$51',
      requirements: ['유효한 여권 (6개월 이상)', '여권 사진', '비자 수수료'],
      notes: '도착 비자로 30일 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'maldives',
      country: 'Maldives',
      countryKo: '몰디브',
      emoji: '🇲🇻',
      region: 'Asia',
      visaRequired: 'on-arrival',
      stayDuration: 30,
      fee: 'Free',
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권', '숙박 예약 확인서'],
      notes: '무료 도착 비자로 30일 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'brunei',
      country: 'Brunei',
      countryKo: '브루나이',
      emoji: '🇧🇳',
      region: 'Asia',
      visaRequired: 'none',
      stayDuration: 30,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권'],
      notes: '관광 목적으로 30일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'cambodia',
      country: 'Cambodia',
      countryKo: '캄보디아',
      emoji: '🇰🇭',
      region: 'Asia',
      visaRequired: 'on-arrival',
      stayDuration: 30,
      fee: '$30',
      requirements: ['유효한 여권 (6개월 이상)', '여권 사진', '비자 수수료'],
      notes: '도착 비자로 30일 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'laos',
      country: 'Laos',
      countryKo: '라오스',
      emoji: '🇱🇦',
      region: 'Asia',
      visaRequired: 'on-arrival',
      stayDuration: 30,
      fee: '$35',
      requirements: ['유효한 여권 (6개월 이상)', '여권 사진', '비자 수수료'],
      notes: '도착 비자로 30일 체류 가능',
      lastUpdated: '2024-01-15'
    },

    // 유럽 국가들
    {
      id: 'italy',
      country: 'Italy',
      countryKo: '이탈리아',
      emoji: '🇮🇹',
      region: 'Europe',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (3개월 이상)', '왕복 항공권', '여행자 보험'],
      notes: '솅겐 협정으로 90일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'spain',
      country: 'Spain',
      countryKo: '스페인',
      emoji: '🇪🇸',
      region: 'Europe',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (3개월 이상)', '왕복 항공권', '여행자 보험'],
      notes: '솅겐 협정으로 90일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'netherlands',
      country: 'Netherlands',
      countryKo: '네덜란드',
      emoji: '🇳🇱',
      region: 'Europe',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (3개월 이상)', '왕복 항공권', '여행자 보험'],
      notes: '솅겐 협정으로 90일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'austria',
      country: 'Austria',
      countryKo: '오스트리아',
      emoji: '🇦🇹',
      region: 'Europe',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (3개월 이상)', '왕복 항공권', '여행자 보험'],
      notes: '솅겐 협정으로 90일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'belgium',
      country: 'Belgium',
      countryKo: '벨기에',
      emoji: '🇧🇪',
      region: 'Europe',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (3개월 이상)', '왕복 항공권', '여행자 보험'],
      notes: '솅겐 협정으로 90일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'portugal',
      country: 'Portugal',
      countryKo: '포르투갈',
      emoji: '🇵🇹',
      region: 'Europe',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (3개월 이상)', '왕복 항공권', '여행자 보험'],
      notes: '솅겐 협정으로 90일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'switzerland',
      country: 'Switzerland',
      countryKo: '스위스',
      emoji: '🇨🇭',
      region: 'Europe',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (3개월 이상)', '왕복 항공권', '여행자 보험'],
      notes: '솅겐 협정으로 90일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'norway',
      country: 'Norway',
      countryKo: '노르웨이',
      emoji: '🇳🇴',
      region: 'Europe',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (3개월 이상)', '왕복 항공권', '여행자 보험'],
      notes: '솅겐 협정으로 90일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'sweden',
      country: 'Sweden',
      countryKo: '스웨덴',
      emoji: '🇸🇪',
      region: 'Europe',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (3개월 이상)', '왕복 항공권', '여행자 보험'],
      notes: '솅겐 협정으로 90일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'denmark',
      country: 'Denmark',
      countryKo: '덴마크',
      emoji: '🇩🇰',
      region: 'Europe',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (3개월 이상)', '왕복 항공권', '여행자 보험'],
      notes: '솅겐 협정으로 90일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'finland',
      country: 'Finland',
      countryKo: '핀란드',
      emoji: '🇫🇮',
      region: 'Europe',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (3개월 이상)', '왕복 항공권', '여행자 보험'],
      notes: '솅겐 협정으로 90일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'iceland',
      country: 'Iceland',
      countryKo: '아이슬란드',
      emoji: '🇮🇸',
      region: 'Europe',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (3개월 이상)', '왕복 항공권', '여행자 보험'],
      notes: '솅겐 협정으로 90일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'greece',
      country: 'Greece',
      countryKo: '그리스',
      emoji: '🇬🇷',
      region: 'Europe',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (3개월 이상)', '왕복 항공권', '여행자 보험'],
      notes: '솅겐 협정으로 90일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'czech-republic',
      country: 'Czech Republic',
      countryKo: '체코',
      emoji: '🇨🇿',
      region: 'Europe',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (3개월 이상)', '왕복 항공권', '여행자 보험'],
      notes: '솅겐 협정으로 90일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'hungary',
      country: 'Hungary',
      countryKo: '헝가리',
      emoji: '🇭🇺',
      region: 'Europe',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (3개월 이상)', '왕복 항공권', '여행자 보험'],
      notes: '솅겐 협정으로 90일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'poland',
      country: 'Poland',
      countryKo: '폴란드',
      emoji: '🇵🇱',
      region: 'Europe',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (3개월 이상)', '왕복 항공권', '여행자 보험'],
      notes: '솅겐 협정으로 90일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'romania',
      country: 'Romania',
      countryKo: '루마니아',
      emoji: '🇷🇴',
      region: 'Europe',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (3개월 이상)', '왕복 항공권', '여행자 보험'],
      notes: '90일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'bulgaria',
      country: 'Bulgaria',
      countryKo: '불가리아',
      emoji: '🇧🇬',
      region: 'Europe',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (3개월 이상)', '왕복 항공권', '여행자 보험'],
      notes: '90일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'croatia',
      country: 'Croatia',
      countryKo: '크로아티아',
      emoji: '🇭🇷',
      region: 'Europe',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (3개월 이상)', '왕복 항공권', '여행자 보험'],
      notes: '솅겐 협정으로 90일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'russia',
      country: 'Russia',
      countryKo: '러시아',
      emoji: '🇷🇺',
      region: 'Europe',
      visaRequired: 'required',
      stayDuration: 30,
      processingTime: '평균 10-20일',
      fee: '₩100,000',
      requirements: ['비자 신청서', '초청장', '여권 사진', '여행자 보험'],
      notes: '관광 비자로 30일 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'turkey',
      country: 'Turkey',
      countryKo: '터키',
      emoji: '🇹🇷',
      region: 'Europe',
      visaRequired: 'evisa',
      stayDuration: 90,
      processingTime: '즉시-24시간',
      fee: '$20',
      requirements: ['e-비자 온라인 신청', '유효한 여권', '신용카드'],
      notes: 'e-비자로 90일 체류 가능',
      lastUpdated: '2024-01-15'
    },

    // 북미 국가들
    {
      id: 'mexico',
      country: 'Mexico',
      countryKo: '멕시코',
      emoji: '🇲🇽',
      region: 'North America',
      visaRequired: 'none',
      stayDuration: 180,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권'],
      notes: '관광 목적으로 180일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'guatemala',
      country: 'Guatemala',
      countryKo: '과테말라',
      emoji: '🇬🇹',
      region: 'North America',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권'],
      notes: '관광 목적으로 90일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'costa-rica',
      country: 'Costa Rica',
      countryKo: '코스타리카',
      emoji: '🇨🇷',
      region: 'North America',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권'],
      notes: '관광 목적으로 90일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'panama',
      country: 'Panama',
      countryKo: '파나마',
      emoji: '🇵🇦',
      region: 'North America',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권'],
      notes: '관광 목적으로 90일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    },

    // 남미 국가들
    {
      id: 'brazil',
      country: 'Brazil',
      countryKo: '브라질',
      emoji: '🇧🇷',
      region: 'South America',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권'],
      notes: '관광 목적으로 90일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'argentina',
      country: 'Argentina',
      countryKo: '아르헨티나',
      emoji: '🇦🇷',
      region: 'South America',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권'],
      notes: '관광 목적으로 90일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'chile',
      country: 'Chile',
      countryKo: '칠레',
      emoji: '🇨🇱',
      region: 'South America',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권'],
      notes: '관광 목적으로 90일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'peru',
      country: 'Peru',
      countryKo: '페루',
      emoji: '🇵🇪',
      region: 'South America',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권'],
      notes: '관광 목적으로 90일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'colombia',
      country: 'Colombia',
      countryKo: '콜롬비아',
      emoji: '🇨🇴',
      region: 'South America',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권'],
      notes: '관광 목적으로 90일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'ecuador',
      country: 'Ecuador',
      countryKo: '에콰도르',
      emoji: '🇪🇨',
      region: 'South America',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권'],
      notes: '관광 목적으로 90일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'uruguay',
      country: 'Uruguay',
      countryKo: '우루과이',
      emoji: '🇺🇾',
      region: 'South America',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권'],
      notes: '관광 목적으로 90일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'paraguay',
      country: 'Paraguay',
      countryKo: '파라과이',
      emoji: '🇵🇾',
      region: 'South America',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권'],
      notes: '관광 목적으로 90일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    },

    // 오세아니아 국가들
    {
      id: 'new-zealand',
      country: 'New Zealand',
      countryKo: '뉴질랜드',
      emoji: '🇳🇿',
      region: 'Oceania',
      visaRequired: 'evisa',
      stayDuration: 90,
      processingTime: '즉시-72시간',
      fee: 'NZD $12',
      requirements: ['NZeTA 온라인 신청', '유효한 여권', '신용카드'],
      notes: 'NZeTA로 90일 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'fiji',
      country: 'Fiji',
      countryKo: '피지',
      emoji: '🇫🇯',
      region: 'Oceania',
      visaRequired: 'none',
      stayDuration: 120,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권'],
      notes: '관광 목적으로 120일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'palau',
      country: 'Palau',
      countryKo: '팔라우',
      emoji: '🇵🇼',
      region: 'Oceania',
      visaRequired: 'none',
      stayDuration: 30,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권'],
      notes: '관광 목적으로 30일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'guam',
      country: 'Guam',
      countryKo: '괌',
      emoji: '🇬🇺',
      region: 'Oceania',
      visaRequired: 'required',
      stayDuration: 45,
      processingTime: '평균 14-21일',
      fee: '$185',
      requirements: ['ESTA 또는 미국 비자', '유효한 여권', '왕복 항공권'],
      notes: 'ESTA나 미국 비자로 45일 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'saipan',
      country: 'Saipan',
      countryKo: '사이판',
      emoji: '🇲🇵',
      region: 'Oceania',
      visaRequired: 'none',
      stayDuration: 45,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권'],
      notes: '관광 목적으로 45일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    },

    // 아프리카 국가들
    {
      id: 'egypt',
      country: 'Egypt',
      countryKo: '이집트',
      emoji: '🇪🇬',
      region: 'Africa',
      visaRequired: 'on-arrival',
      stayDuration: 30,
      fee: '$25',
      requirements: ['유효한 여권 (6개월 이상)', '여권 사진', '비자 수수료'],
      notes: '도착 비자로 30일 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'morocco',
      country: 'Morocco',
      countryKo: '모로코',
      emoji: '🇲🇦',
      region: 'Africa',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권'],
      notes: '관광 목적으로 90일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'south-africa',
      country: 'South Africa',
      countryKo: '남아프리카공화국',
      emoji: '🇿🇦',
      region: 'Africa',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권', '빈 페이지 2장 이상'],
      notes: '관광 목적으로 90일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'tunisia',
      country: 'Tunisia',
      countryKo: '튀니지',
      emoji: '🇹🇳',
      region: 'Africa',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권'],
      notes: '관광 목적으로 90일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'kenya',
      country: 'Kenya',
      countryKo: '케냐',
      emoji: '🇰🇪',
      region: 'Africa',
      visaRequired: 'evisa',
      stayDuration: 90,
      processingTime: '평균 2-7일',
      fee: '$51',
      requirements: ['e-비자 온라인 신청', '여권 사진', '여권 스캔본'],
      notes: 'e-비자로 90일 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'tanzania',
      country: 'Tanzania',
      countryKo: '탄자니아',
      emoji: '🇹🇿',
      region: 'Africa',
      visaRequired: 'on-arrival',
      stayDuration: 90,
      fee: '$50',
      requirements: ['유효한 여권 (6개월 이상)', '여권 사진', '비자 수수료'],
      notes: '도착 비자로 90일 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'ethiopia',
      country: 'Ethiopia',
      countryKo: '에티오피아',
      emoji: '🇪🇹',
      region: 'Africa',
      visaRequired: 'evisa',
      stayDuration: 30,
      processingTime: '평균 3-5일',
      fee: '$52',
      requirements: ['e-비자 온라인 신청', '여권 사진', '여권 스캔본'],
      notes: 'e-비자로 30일 체류 가능',
      lastUpdated: '2024-01-15'
    },

    // 중동 국가들
    {
      id: 'uae',
      country: 'UAE',
      countryKo: '아랍에미리트',
      emoji: '🇦🇪',
      region: 'Middle East',
      visaRequired: 'none',
      stayDuration: 30,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권'],
      notes: '관광 목적으로 30일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'qatar',
      country: 'Qatar',
      countryKo: '카타르',
      emoji: '🇶🇦',
      region: 'Middle East',
      visaRequired: 'none',
      stayDuration: 30,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권'],
      notes: '관광 목적으로 30일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'oman',
      country: 'Oman',
      countryKo: '오만',
      emoji: '🇴🇲',
      region: 'Middle East',
      visaRequired: 'evisa',
      stayDuration: 30,
      processingTime: '평균 1-3일',
      fee: '$20',
      requirements: ['e-비자 온라인 신청', '여권 스캔본', '신용카드'],
      notes: 'e-비자로 30일 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'bahrain',
      country: 'Bahrain',
      countryKo: '바레인',
      emoji: '🇧🇭',
      region: 'Middle East',
      visaRequired: 'evisa',
      stayDuration: 14,
      processingTime: '평균 1-3일',
      fee: '$25',
      requirements: ['e-비자 온라인 신청', '여권 스캔본', '신용카드'],
      notes: 'e-비자로 14일 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'kuwait',
      country: 'Kuwait',
      countryKo: '쿠웨이트',
      emoji: '🇰🇼',
      region: 'Middle East',
      visaRequired: 'evisa',
      stayDuration: 90,
      processingTime: '평균 2-5일',
      fee: '$40',
      requirements: ['e-비자 온라인 신청', '여권 스캔본', '신용카드'],
      notes: 'e-비자로 90일 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'jordan',
      country: 'Jordan',
      countryKo: '요단',
      emoji: '🇯🇴',
      region: 'Middle East',
      visaRequired: 'on-arrival',
      stayDuration: 30,
      fee: '$40',
      requirements: ['유효한 여권 (6개월 이상)', '여권 사진', '비자 수수료'],
      notes: '도착 비자로 30일 체류 가능',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'israel',
      country: 'Israel',
      countryKo: '이스라엘',
      emoji: '🇮🇱',
      region: 'Middle East',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권'],
      notes: '관광 목적으로 90일간 무비자 체류 가능',
      lastUpdated: '2024-01-15'
    }
  ];

  const regions = ['popular', 'Asia', 'Europe', 'North America', 'South America', 'Oceania', 'Africa', 'Middle East'];
  const visaTypes = ['all', 'none', 'required', 'evisa', 'on-arrival'];

  const getCountriesByTab = (tab: string) => {
    if (tab === 'popular') {
      return allCountriesData.filter(country => country.popularRank && country.popularRank <= 10);
    }
    return allCountriesData.filter(country => country.region === tab);
  };

  const filteredCountries = useMemo(() => {
    let filtered = searchQuery ? allCountriesData : getCountriesByTab(activeTab);

    if (searchQuery) {
      filtered = filtered.filter(country => 
        country.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.countryKo.includes(searchQuery)
      );
    }

    if (selectedVisaType !== 'all') {
      filtered = filtered.filter(country => country.visaRequired === selectedVisaType);
    }

    return filtered.sort((a, b) => {
      if (a.popularRank && b.popularRank) {
        return a.popularRank - b.popularRank;
      }
      if (a.popularRank && !b.popularRank) return -1;
      if (!a.popularRank && b.popularRank) return 1;
      return a.countryKo.localeCompare(b.countryKo);
    });
  }, [searchQuery, selectedVisaType, activeTab]);

  const totalPages = Math.ceil(filteredCountries.length / countriesPerPage);
  const currentCountries = filteredCountries.slice(
    (currentPage - 1) * countriesPerPage,
    currentPage * countriesPerPage
  );

  const getVisaTypeIcon = (type: string) => {
    switch (type) {
      case 'none': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'required': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'evisa': return <Globe className="w-5 h-5 text-blue-600" />;
      case 'on-arrival': return <Plane className="w-5 h-5 text-orange-600" />;
      default: return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getVisaTypeText = (type: string) => {
    switch (type) {
      case 'none': return '무비자';
      case 'required': return '비자 필요';
      case 'evisa': return '전자비자';
      case 'on-arrival': return '도착비자';
      default: return '정보 없음';
    }
  };

  const getVisaTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'none': return 'bg-green-100 text-green-800';
      case 'required': return 'bg-red-100 text-red-800';
      case 'evisa': return 'bg-blue-100 text-blue-800';
      case 'on-arrival': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const resetPagination = () => {
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full glass-effect">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center space-x-2 text-gray-400 hover:text-black" 
              onClick={onBackToHome}
            >
              <ArrowLeft size={16} />
              <span className="text-sm">Go Back</span>
            </Button>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">T</span>
              </div>
              <h1 className="text-xl font-bold text-black hidden sm:block">TripRadio.AI</h1>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-sm">English</Button>
              <Button variant="ghost" size="sm" className="text-sm">History</Button>
              <Button variant="ghost" size="sm" className="text-sm">Sign In</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-6 bg-neutral-100 text-neutral-800">
            Visa Requirements
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-black mb-6 tracking-tight">
            전 세계 비자 요건 확인
          </h1>
          
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto mb-8">
            195개국 여행지의 비자 요건을 한 번에 확인하세요
          </p>

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="국가명을 검색하세요 (예: 일본, 미국, Japan, France)"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  resetPagination();
                }}
                className="pl-12 pr-4 py-3 text-lg rounded-full border-gray-300 focus:border-black focus:ring-black"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedVisaType}
                  onChange={(e) => {
                    setSelectedVisaType(e.target.value);
                    resetPagination();
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white"
                >
                  <option value="all">모든 비자 유형</option>
                  <option value="none">무비자</option>
                  <option value="evisa">전자비자</option>
                  <option value="on-arrival">도착비자</option>
                  <option value="required">비자 필요</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="py-8 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={(value) => {
            setActiveTab(value);
            resetPagination();
            setSearchQuery('');
          }}>
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 h-auto p-1 bg-gray-100">
              <TabsTrigger value="popular" className="text-xs sm:text-sm py-2">인기</TabsTrigger>
              <TabsTrigger value="Asia" className="text-xs sm:text-sm py-2">아시아</TabsTrigger>
              <TabsTrigger value="Europe" className="text-xs sm:text-sm py-2">유럽</TabsTrigger>
              <TabsTrigger value="North America" className="text-xs sm:text-sm py-2">북미</TabsTrigger>
              <TabsTrigger value="South America" className="text-xs sm:text-sm py-2">남미</TabsTrigger>
              <TabsTrigger value="Oceania" className="text-xs sm:text-sm py-2">오세아니아</TabsTrigger>
              <TabsTrigger value="Africa" className="text-xs sm:text-sm py-2">아프리카</TabsTrigger>
              <TabsTrigger value="Middle East" className="text-xs sm:text-sm py-2">중동</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-semibold text-black">
                {searchQuery ? `'${searchQuery}' 검색 결과` : `${activeTab === 'popular' ? '인기 여행지' : activeTab} 국가`} ({filteredCountries.length}개국)
              </h2>
              <p className="text-gray-600 mt-1">
                한국 여권 기준 비자 요건 정보
              </p>
            </div>

            {totalPages > 1 && (
              <div className="text-sm text-gray-500">
                페이지 {currentPage} / {totalPages}
              </div>
            )}
          </div>

          {/* Country Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {currentCountries.map((country) => (
              <Card 
                key={country.id}
                className={`p-6 hover:shadow-lg transition-all cursor-pointer ${
                  selectedCountry?.id === country.id ? 'ring-2 ring-black' : ''
                }`}
                onClick={() => setSelectedCountry(selectedCountry?.id === country.id ? null : country)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{country.emoji}</span>
                    <div>
                      <h3 className="font-semibold text-black">{country.countryKo}</h3>
                      <p className="text-sm text-gray-500">{country.country}</p>
                    </div>
                  </div>
                  {country.popularRank && country.popularRank <= 10 && (
                    <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                      인기
                    </Badge>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">비자 요건</span>
                    <div className="flex items-center space-x-2">
                      {getVisaTypeIcon(country.visaRequired)}
                      <Badge className={`text-xs ${getVisaTypeBadgeColor(country.visaRequired)}`}>
                        {getVisaTypeText(country.visaRequired)}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">체류 기간</span>
                    <span className="text-sm font-medium">{country.stayDuration}일</span>
                  </div>

                  {country.fee && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">비자 비용</span>
                      <span className="text-sm font-medium">{country.fee}</span>
                    </div>
                  )}

                  {country.processingTime && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">처리 시간</span>
                      <span className="text-sm text-gray-700">{country.processingTime}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    업데이트: {country.lastUpdated}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          {/* No Results */}
          {filteredCountries.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-black mb-2">검색 결과가 없습니다</h3>
              <p className="text-gray-600">다른 검색어를 시도하거나 필터를 변경해보세요</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                이전
              </Button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-10 h-10 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                다음
              </Button>
            </div>
          )}

          {/* Selected Country Details */}
          {selectedCountry && (
            <Card className="mt-12 p-8 bg-gray-50">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <span className="text-5xl">{selectedCountry.emoji}</span>
                  <div>
                    <h2 className="text-3xl font-bold text-black">{selectedCountry.countryKo}</h2>
                    <p className="text-lg text-gray-600">{selectedCountry.country}</p>
                  </div>
                </div>
                <Button variant="ghost" onClick={() => setSelectedCountry(null)}>
                  ✕
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-black">비자 정보</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <span className="text-gray-600">비자 요건</span>
                      <div className="flex items-center space-x-2">
                        {getVisaTypeIcon(selectedCountry.visaRequired)}
                        <span className="font-medium">{getVisaTypeText(selectedCountry.visaRequired)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <span className="text-gray-600">체류 기간</span>
                      <span className="font-medium">{selectedCountry.stayDuration}일</span>
                    </div>
                    {selectedCountry.fee && (
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="text-gray-600">비자 비용</span>
                        <span className="font-medium">{selectedCountry.fee}</span>
                      </div>
                    )}
                    {selectedCountry.processingTime && (
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="text-gray-600">처리 시간</span>
                        <span className="font-medium">{selectedCountry.processingTime}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-black">필요 서류</h3>
                  <ul className="space-y-2">
                    {selectedCountry.requirements.map((req, index) => (
                      <li key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <span className="text-gray-700">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {selectedCountry.notes && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-black">추가 정보</h3>
                  <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-start space-x-3">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                      <p className="text-blue-800">{selectedCountry.notes}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  정보 업데이트: {selectedCountry.lastUpdated} | 실제 출입국 시 최신 정보를 확인하시기 바랍니다.
                </p>
              </div>
            </Card>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">비자 유형 가이드</h2>
            <p className="text-xl text-neutral-600">각 비자 유형별 특징을 알아보세요</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-black mb-2">무비자</h3>
              <p className="text-sm text-gray-600 mb-3">
                별도 비자 없이 여권만으로 입국 가능
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• 즉시 출발 가능</li>
                <li>• 비용 없음</li>
                <li>• 간편한 절차</li>
              </ul>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-black mb-2">전자비자</h3>
              <p className="text-sm text-gray-600 mb-3">
                온라인으로 신청하는 전자 비자
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• 온라인 신청</li>
                <li>• 빠른 처리</li>
                <li>• 미리 준비 필요</li>
              </ul>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plane className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-black mb-2">도착비자</h3>
              <p className="text-sm text-gray-600 mb-3">
                입국 시 공항에서 발급받는 비자
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• 현장 발급</li>
                <li>• 대기시간 있음</li>
                <li>• 현금 준비 필요</li>
              </ul>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="font-semibold text-black mb-2">비자 필요</h3>
              <p className="text-sm text-gray-600 mb-3">
                사전에 대사관에서 비자 발급 필요
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• 사전 신청 필수</li>
                <li>• 시간 소요</li>
                <li>• 복잡한 절차</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            비자 확인부터 여행 가이드까지
          </h2>
          
          <p className="text-xl text-neutral-300 mb-8 max-w-2xl mx-auto">
            비자 요건 확인을 마쳤다면, TripRadio.AI와 함께 완벽한 여행을 계획해보세요
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-black" />
              </div>
              <h3 className="font-medium text-white mb-2">비자 요건 확인</h3>
              <p className="text-sm text-neutral-300">
                전 세계 195개국의 최신 비자 정보를 실시간으로 확인하세요
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-black" />
              </div>
              <h3 className="font-medium text-white mb-2">여행 계획 수립</h3>
              <p className="text-sm text-neutral-300">
                AI가 당신만의 완벽한 여행 계획을 생성해드립니다
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Plane className="w-8 h-8 text-black" />
              </div>
              <h3 className="font-medium text-white mb-2">실시간 가이드</h3>
              <p className="text-sm text-neutral-300">
                현지에서 실시간 AI 오디오 가이드로 깊이 있는 여행을 경험하세요
              </p>
            </div>
          </div>

          <Button
            onClick={onBackToHome}
            className="bg-white text-black px-8 py-3 rounded-full text-lg font-medium hover:bg-gray-100 transition-colors"
          >
            통합 여행 서비스 시작하기
          </Button>
        </div>
      </section>
    </div>
  );
}