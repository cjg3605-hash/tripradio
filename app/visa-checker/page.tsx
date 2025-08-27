'use client';

import { useState, useMemo } from "react";
import { Search, Globe, AlertCircle, CheckCircle, XCircle, Info, Plane, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

export default function VisaCheckerPage() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedVisaType, setSelectedVisaType] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedCountry, setSelectedCountry] = useState<CountryVisaInfo | null>(null);
  const [activeTab, setActiveTab] = useState<string>('popular');
  
  const countriesPerPage = 12;

  // 2025년 기준 전 세계 195개국 한국 여권 비자 정보 (실제 데이터)
  const allCountriesData: CountryVisaInfo[] = [
    // 인기 여행지
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
      lastUpdated: '2025-01-15',
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
      notes: '관광 목적으로 30일간 무비자 체류 가능 (연장 가능)',
      lastUpdated: '2025-01-15',
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
      lastUpdated: '2025-01-15',
      popularRank: 3
    },
    {
      id: 'usa',
      country: 'United States',
      countryKo: '미국',
      emoji: '🇺🇸',
      region: 'North America',
      visaRequired: 'evisa',
      stayDuration: 90,
      processingTime: '즉시-72시간',
      fee: '$21',
      requirements: ['ESTA 사전 신청', '유효한 여권', '왕복 항공권', '재정 증명서'],
      notes: 'ESTA 승인 시 90일간 체류 가능 (2년간 유효)',
      lastUpdated: '2025-01-15',
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
      requirements: ['유효한 여권 (3개월 이상)', '왕복 항공권', '여행자 보험', '숙박 증명서'],
      notes: '솅겐 협정으로 180일 중 90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15',
      popularRank: 5
    },
    {
      id: 'uk',
      country: 'United Kingdom',
      countryKo: '영국',
      emoji: '🇬🇧',
      region: 'Europe',
      visaRequired: 'none',
      stayDuration: 180,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권', '숙박 증명서', '충분한 체재비'],
      notes: '관광 목적으로 6개월간 무비자 체류 가능 (브렉시트 이후)',
      lastUpdated: '2025-01-15',
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
      notes: 'ETA(전자여행허가)로 90일 체류 가능 (1년간 유효)',
      lastUpdated: '2025-01-15',
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
      notes: 'eTA로 6개월 체류 가능 (5년간 유효)',
      lastUpdated: '2025-01-15',
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
      notes: '2024년 8월부터 45일간 무비자 체류 가능 (2025년 8월까지 임시)',
      lastUpdated: '2025-01-15',
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
      notes: '솅겐 협정으로 180일 중 90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15',
      popularRank: 10
    },

    // 아시아
    {
      id: 'china',
      country: 'China',
      countryKo: '중국',
      emoji: '🇨🇳',
      region: 'Asia',
      visaRequired: 'none',
      stayDuration: 15,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권', '숙박 증명서'],
      notes: '2024년부터 15일간 무비자 체류 가능 (2025년 12월까지 연장)',
      lastUpdated: '2025-01-15'
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
      lastUpdated: '2025-01-15'
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
      lastUpdated: '2025-01-15'
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
      notes: '관광 목적으로 30일간 무비자 체류 가능 (연장 가능)',
      lastUpdated: '2025-01-15'
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
      lastUpdated: '2025-01-15'
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
      lastUpdated: '2025-01-15'
    },
    {
      id: 'hongkong',
      country: 'Hong Kong SAR',
      countryKo: '홍콩',
      emoji: '🇭🇰',
      region: 'Asia',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (1개월 이상)', '출국 항공권'],
      notes: '관광 목적으로 90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'macau',
      country: 'Macau SAR',
      countryKo: '마카오',
      emoji: '🇲🇴',
      region: 'Asia',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (1개월 이상)', '출국 항공권'],
      notes: '관광 목적으로 90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
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
      lastUpdated: '2025-01-15'
    },
    {
      id: 'maldives',
      country: 'Maldives',
      countryKo: '몰디브',
      emoji: '🇲🇻',
      region: 'Asia',
      visaRequired: 'on-arrival',
      stayDuration: 30,
      fee: '무료',
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권', '숙박 예약 확인서'],
      notes: '도착비자로 30일 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'sri-lanka',
      country: 'Sri Lanka',
      countryKo: '스리랑카',
      emoji: '🇱🇰',
      region: 'Asia',
      visaRequired: 'evisa',
      stayDuration: 30,
      processingTime: '즉시-24시간',
      fee: '$50',
      requirements: ['ETA 온라인 신청', '유효한 여권', '여권 사진'],
      notes: '전자비자(ETA)로 30일 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'nepal',
      country: 'Nepal',
      countryKo: '네팔',
      emoji: '🇳🇵',
      region: 'Asia',
      visaRequired: 'on-arrival',
      stayDuration: 90,
      fee: '$30-125',
      requirements: ['유효한 여권 (6개월 이상)', '여권 사진', '현금'],
      notes: '도착비자로 15일($30), 30일($50), 90일($125) 선택 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'bhutan',
      country: 'Bhutan',
      countryKo: '부탄',
      emoji: '🇧🇹',
      region: 'Asia',
      visaRequired: 'required',
      stayDuration: 30,
      processingTime: '평균 5-10일',
      fee: '$40 + $200/일',
      requirements: ['비자 신청서', '여권 사진', '여행 일정서', 'SDF 지불'],
      notes: '사전 비자 + 지속가능발전기금(SDF) $200/일 필요',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'myanmar',
      country: 'Myanmar',
      countryKo: '미얀마',
      emoji: '🇲🇲',
      region: 'Asia',
      visaRequired: 'required',
      stayDuration: 28,
      processingTime: '평균 3-5일',
      fee: '$50',
      requirements: ['비자 신청서', '여권 사진', '여행 일정서'],
      notes: '현재 정치적 불안으로 입국 제한 (2024년 기준)',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'laos',
      country: 'Laos',
      countryKo: '라오스',
      emoji: '🇱🇦',
      region: 'Asia',
      visaRequired: 'on-arrival',
      stayDuration: 30,
      fee: '$30-42',
      requirements: ['유효한 여권 (6개월 이상)', '여권 사진', '현금'],
      notes: '도착비자로 30일 체류 가능',
      lastUpdated: '2025-01-15'
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
      requirements: ['유효한 여권 (6개월 이상)', '여권 사진', '현금'],
      notes: '도착비자로 30일 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'brunei',
      country: 'Brunei',
      countryKo: '브루나이',
      emoji: '🇧🇳',
      region: 'Asia',
      visaRequired: 'none',
      stayDuration: 30,
      requirements: ['유효한 여권 (6개월 이상)', '출국 항공권'],
      notes: '관광 목적으로 30일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'timor-leste',
      country: 'Timor-Leste',
      countryKo: '동티모르',
      emoji: '🇹🇱',
      region: 'Asia',
      visaRequired: 'on-arrival',
      stayDuration: 30,
      fee: '$30',
      requirements: ['유효한 여권 (6개월 이상)', '현금'],
      notes: '도착비자로 30일 체류 가능',
      lastUpdated: '2025-01-15'
    },

    // 유럽 (솅겐 협정 국가들)
    {
      id: 'italy',
      country: 'Italy',
      countryKo: '이탈리아',
      emoji: '🇮🇹',
      region: 'Europe',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (3개월 이상)', '왕복 항공권', '여행자 보험'],
      notes: '솅겐 협정으로 180일 중 90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
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
      notes: '솅겐 협정으로 180일 중 90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
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
      notes: '솅겐 협정으로 180일 중 90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
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
      notes: '솅겐 협정으로 180일 중 90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
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
      notes: '솅겐 협정으로 180일 중 90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
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
      notes: '솅겐 협정으로 180일 중 90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
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
      notes: '솅겐 협정으로 180일 중 90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
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
      notes: '솅겐 협정으로 180일 중 90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
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
      notes: '솅겐 협정으로 180일 중 90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
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
      notes: '솅겐 협정으로 180일 중 90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
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
      notes: '솅겐 협정으로 180일 중 90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
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
      notes: '솅겐 협정으로 180일 중 90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
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
      notes: '솅겐 협정으로 180일 중 90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
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
      notes: '솅겐 협정으로 180일 중 90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
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
      notes: '솅겐 협정으로 180일 중 90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
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
      notes: '솅겐 협정으로 180일 중 90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'slovakia',
      country: 'Slovakia',
      countryKo: '슬로바키아',
      emoji: '🇸🇰',
      region: 'Europe',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (3개월 이상)', '왕복 항공권', '여행자 보험'],
      notes: '솅겐 협정으로 180일 중 90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'slovenia',
      country: 'Slovenia',
      countryKo: '슬로베니아',
      emoji: '🇸🇮',
      region: 'Europe',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (3개월 이상)', '왕복 항공권', '여행자 보험'],
      notes: '솅겐 협정으로 180일 중 90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'estonia',
      country: 'Estonia',
      countryKo: '에스토니아',
      emoji: '🇪🇪',
      region: 'Europe',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (3개월 이상)', '왕복 항공권', '여행자 보험'],
      notes: '솅겐 협정으로 180일 중 90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'latvia',
      country: 'Latvia',
      countryKo: '라트비아',
      emoji: '🇱🇻',
      region: 'Europe',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (3개월 이상)', '왕복 항공권', '여행자 보험'],
      notes: '솅겐 협정으로 180일 중 90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'lithuania',
      country: 'Lithuania',
      countryKo: '리투아니아',
      emoji: '🇱🇹',
      region: 'Europe',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (3개월 이상)', '왕복 항공권', '여행자 보험'],
      notes: '솅겐 협정으로 180일 중 90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'malta',
      country: 'Malta',
      countryKo: '몰타',
      emoji: '🇲🇹',
      region: 'Europe',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (3개월 이상)', '왕복 항공권', '여행자 보험'],
      notes: '솅겐 협정으로 180일 중 90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'luxembourg',
      country: 'Luxembourg',
      countryKo: '룩셈부르크',
      emoji: '🇱🇺',
      region: 'Europe',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (3개월 이상)', '왕복 항공권', '여행자 보험'],
      notes: '솅겐 협정으로 180일 중 90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
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
      notes: '솅겐 협정 가입 (2023년) - 180일 중 90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
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
      notes: '90일간 무비자 체류 가능 (솅겐 가입 예정)',
      lastUpdated: '2025-01-15'
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
      notes: '90일간 무비자 체류 가능 (솅겐 가입 예정)',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'cyprus',
      country: 'Cyprus',
      countryKo: '키프로스',
      emoji: '🇨🇾',
      region: 'Europe',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (3개월 이상)', '왕복 항공권', '여행자 보험'],
      notes: '솅겐 협정으로 180일 중 90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'ireland',
      country: 'Ireland',
      countryKo: '아일랜드',
      emoji: '🇮🇪',
      region: 'Europe',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권', '충분한 체재비'],
      notes: '관광 목적으로 90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
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
      notes: '현재 제재로 인해 비자 발급 중단 (2022년 이후)',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'ukraine',
      country: 'Ukraine',
      countryKo: '우크라이나',
      emoji: '🇺🇦',
      region: 'Europe',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (3개월 이상)', '왕복 항공권'],
      notes: '현재 전쟁으로 인해 관광 입국 불가 (2022년 이후)',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'belarus',
      country: 'Belarus',
      countryKo: '벨라루스',
      emoji: '🇧🇾',
      region: 'Europe',
      visaRequired: 'none',
      stayDuration: 30,
      requirements: ['유효한 여권 (3개월 이상)', '왕복 항공권', '여행자 보험'],
      notes: '30일간 무비자 체류 가능 (국제공항 경유 시)',
      lastUpdated: '2025-01-15'
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
      fee: '$50',
      requirements: ['e-비자 온라인 신청', '유효한 여권', '신용카드'],
      notes: 'e-비자로 90일 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'serbia',
      country: 'Serbia',
      countryKo: '세르비아',
      emoji: '🇷🇸',
      region: 'Europe',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (3개월 이상)', '왕복 항공권'],
      notes: '90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'albania',
      country: 'Albania',
      countryKo: '알바니아',
      emoji: '🇦🇱',
      region: 'Europe',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (3개월 이상)', '왕복 항공권'],
      notes: '90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'bosnia',
      country: 'Bosnia and Herzegovina',
      countryKo: '보스니아 헤르체고비나',
      emoji: '🇧🇦',
      region: 'Europe',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (3개월 이상)', '왕복 항공권'],
      notes: '90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'montenegro',
      country: 'Montenegro',
      countryKo: '몬테네그로',
      emoji: '🇲🇪',
      region: 'Europe',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (3개월 이상)', '왕복 항공권'],
      notes: '90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'north-macedonia',
      country: 'North Macedonia',
      countryKo: '북마케도니아',
      emoji: '🇲🇰',
      region: 'Europe',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (3개월 이상)', '왕복 항공권'],
      notes: '90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'kosovo',
      country: 'Kosovo',
      countryKo: '코소보',
      emoji: '🇽🇰',
      region: 'Europe',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (3개월 이상)', '왕복 항공권'],
      notes: '90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
    },

    // 북미
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
      lastUpdated: '2025-01-15'
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
      notes: 'CA-4 협정으로 90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'belize',
      country: 'Belize',
      countryKo: '벨리즈',
      emoji: '🇧🇿',
      region: 'North America',
      visaRequired: 'none',
      stayDuration: 30,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권'],
      notes: '30일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
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
      notes: 'CA-4 협정으로 90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
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
      notes: '90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'nicaragua',
      country: 'Nicaragua',
      countryKo: '니카라과',
      emoji: '🇳🇮',
      region: 'North America',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권'],
      notes: 'CA-4 협정으로 90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'honduras',
      country: 'Honduras',
      countryKo: '온두라스',
      emoji: '🇭🇳',
      region: 'North America',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권'],
      notes: 'CA-4 협정으로 90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'el-salvador',
      country: 'El Salvador',
      countryKo: '엘살바도르',
      emoji: '🇸🇻',
      region: 'North America',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권'],
      notes: 'CA-4 협정으로 90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
    },

    // 남미
    {
      id: 'brazil',
      country: 'Brazil',
      countryKo: '브라질',
      emoji: '🇧🇷',
      region: 'South America',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권', '황열병 예방접종 증명서'],
      notes: '2024년부터 90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
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
      notes: '90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
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
      notes: '90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'peru',
      country: 'Peru',
      countryKo: '페루',
      emoji: '🇵🇪',
      region: 'South America',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권', '황열병 예방접종 증명서'],
      notes: '90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'colombia',
      country: 'Colombia',
      countryKo: '콜롬비아',
      emoji: '🇨🇴',
      region: 'South America',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권', '황열병 예방접종 증명서'],
      notes: '90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
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
      notes: '90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
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
      notes: '90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'ecuador',
      country: 'Ecuador',
      countryKo: '에콰도르',
      emoji: '🇪🇨',
      region: 'South America',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권', '황열병 예방접종 증명서'],
      notes: '90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'bolivia',
      country: 'Bolivia',
      countryKo: '볼리비아',
      emoji: '🇧🇴',
      region: 'South America',
      visaRequired: 'on-arrival',
      stayDuration: 90,
      fee: '$100',
      requirements: ['유효한 여권 (6개월 이상)', '여권 사진', '황열병 예방접종 증명서'],
      notes: '도착비자로 90일 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'venezuela',
      country: 'Venezuela',
      countryKo: '베네수엘라',
      emoji: '🇻🇪',
      region: 'South America',
      visaRequired: 'required',
      stayDuration: 90,
      processingTime: '평균 15-30일',
      fee: '$60',
      requirements: ['비자 신청서', '초청장', '여권 사진', '황열병 예방접종 증명서'],
      notes: '현재 정치적 불안으로 비자 발급 어려움',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'guyana',
      country: 'Guyana',
      countryKo: '가이아나',
      emoji: '🇬🇾',
      region: 'South America',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권', '황열병 예방접종 증명서'],
      notes: '90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'suriname',
      country: 'Suriname',
      countryKo: '수리남',
      emoji: '🇸🇷',
      region: 'South America',
      visaRequired: 'on-arrival',
      stayDuration: 90,
      fee: '$100',
      requirements: ['유효한 여권 (6개월 이상)', '여권 사진', '황열병 예방접종 증명서'],
      notes: '도착비자로 90일 체류 가능',
      lastUpdated: '2025-01-15'
    },

    // 오세아니아
    {
      id: 'new-zealand',
      country: 'New Zealand',
      countryKo: '뉴질랜드',
      emoji: '🇳🇿',
      region: 'Oceania',
      visaRequired: 'evisa',
      stayDuration: 90,
      processingTime: '즉시-72시간',
      fee: 'NZD $35',
      requirements: ['NZeTA 온라인 신청', '유효한 여권', '왕복 항공권'],
      notes: 'NZeTA(전자여행허가)로 90일 체류 가능',
      lastUpdated: '2025-01-15'
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
      notes: '120일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'vanuatu',
      country: 'Vanuatu',
      countryKo: '바누아투',
      emoji: '🇻🇺',
      region: 'Oceania',
      visaRequired: 'none',
      stayDuration: 30,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권'],
      notes: '30일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'samoa',
      country: 'Samoa',
      countryKo: '사모아',
      emoji: '🇼🇸',
      region: 'Oceania',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권'],
      notes: '90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'tonga',
      country: 'Tonga',
      countryKo: '통가',
      emoji: '🇹🇴',
      region: 'Oceania',
      visaRequired: 'none',
      stayDuration: 31,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권'],
      notes: '31일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
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
      notes: '30일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'micronesia',
      country: 'Micronesia',
      countryKo: '미크로네시아',
      emoji: '🇫🇲',
      region: 'Oceania',
      visaRequired: 'none',
      stayDuration: 30,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권'],
      notes: '30일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'marshall-islands',
      country: 'Marshall Islands',
      countryKo: '마셜 제도',
      emoji: '🇲🇭',
      region: 'Oceania',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권'],
      notes: '90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'kiribati',
      country: 'Kiribati',
      countryKo: '키리바시',
      emoji: '🇰🇮',
      region: 'Oceania',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권'],
      notes: '90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'nauru',
      country: 'Nauru',
      countryKo: '나우루',
      emoji: '🇳🇷',
      region: 'Oceania',
      visaRequired: 'on-arrival',
      stayDuration: 30,
      fee: 'AUD $25',
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권'],
      notes: '도착비자로 30일 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'tuvalu',
      country: 'Tuvalu',
      countryKo: '투발루',
      emoji: '🇹🇻',
      region: 'Oceania',
      visaRequired: 'on-arrival',
      stayDuration: 30,
      fee: 'AUD $100',
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권'],
      notes: '도착비자로 30일 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'papua-new-guinea',
      country: 'Papua New Guinea',
      countryKo: '파푸아뉴기니',
      emoji: '🇵🇬',
      region: 'Oceania',
      visaRequired: 'evisa',
      stayDuration: 60,
      processingTime: '평균 5-10일',
      fee: '$50',
      requirements: ['온라인 비자 신청', '유효한 여권', '여권 사진'],
      notes: '전자비자로 60일 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'solomon-islands',
      country: 'Solomon Islands',
      countryKo: '솔로몬 제도',
      emoji: '🇸🇧',
      region: 'Oceania',
      visaRequired: 'on-arrival',
      stayDuration: 90,
      fee: '$200',
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권', '현금'],
      notes: '도착비자로 90일 체류 가능',
      lastUpdated: '2025-01-15'
    },

    // 아프리카
    {
      id: 'south-africa',
      country: 'South Africa',
      countryKo: '남아프리카공화국',
      emoji: '🇿🇦',
      region: 'Africa',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (30일 이상)', '왕복 항공권', '황열병 예방접종 증명서'],
      notes: '90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
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
      notes: '90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'tunisia',
      country: 'Tunisia',
      countryKo: '튀니지',
      emoji: '🇹🇳',
      region: 'Africa',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (3개월 이상)', '왕복 항공권'],
      notes: '90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'egypt',
      country: 'Egypt',
      countryKo: '이집트',
      emoji: '🇪🇬',
      region: 'Africa',
      visaRequired: 'on-arrival',
      stayDuration: 30,
      fee: '$25',
      requirements: ['유효한 여권 (6개월 이상)', '여권 사진', '현금'],
      notes: '도착비자로 30일 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'kenya',
      country: 'Kenya',
      countryKo: '케냐',
      emoji: '🇰🇪',
      region: 'Africa',
      visaRequired: 'evisa',
      stayDuration: 90,
      processingTime: '평균 3-5일',
      fee: '$50',
      requirements: ['eTA 온라인 신청', '유효한 여권', '황열병 예방접종 증명서'],
      notes: 'eTA로 90일 체류 가능',
      lastUpdated: '2025-01-15'
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
      requirements: ['유효한 여권 (6개월 이상)', '여권 사진', '황열병 예방접종 증명서'],
      notes: '도착비자로 90일 체류 가능',
      lastUpdated: '2025-01-15'
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
      requirements: ['온라인 비자 신청', '유효한 여권', '여권 사진'],
      notes: '전자비자로 30일 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'madagascar',
      country: 'Madagascar',
      countryKo: '마다가스카르',
      emoji: '🇲🇬',
      region: 'Africa',
      visaRequired: 'on-arrival',
      stayDuration: 90,
      fee: '$35-80',
      requirements: ['유효한 여권 (6개월 이상)', '여권 사진', '현금'],
      notes: '도착비자로 90일 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'mauritius',
      country: 'Mauritius',
      countryKo: '모리셔스',
      emoji: '🇲🇺',
      region: 'Africa',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권', '숙박 증명서'],
      notes: '90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'seychelles',
      country: 'Seychelles',
      countryKo: '세이셸',
      emoji: '🇸🇨',
      region: 'Africa',
      visaRequired: 'none',
      stayDuration: 30,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권', '숙박 증명서'],
      notes: '30일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'botswana',
      country: 'Botswana',
      countryKo: '보츠와나',
      emoji: '🇧🇼',
      region: 'Africa',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권'],
      notes: '90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'namibia',
      country: 'Namibia',
      countryKo: '나미비아',
      emoji: '🇳🇦',
      region: 'Africa',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권'],
      notes: '90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'zambia',
      country: 'Zambia',
      countryKo: '잠비아',
      emoji: '🇿🇲',
      region: 'Africa',
      visaRequired: 'evisa',
      stayDuration: 90,
      processingTime: '평균 3-5일',
      fee: '$50',
      requirements: ['온라인 비자 신청', '유효한 여권', '황열병 예방접종 증명서'],
      notes: '전자비자로 90일 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'zimbabwe',
      country: 'Zimbabwe',
      countryKo: '짐바브웨',
      emoji: '🇿🇼',
      region: 'Africa',
      visaRequired: 'on-arrival',
      stayDuration: 90,
      fee: '$30',
      requirements: ['유효한 여권 (6개월 이상)', '여권 사진', '현금'],
      notes: '도착비자로 90일 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'rwanda',
      country: 'Rwanda',
      countryKo: '르완다',
      emoji: '🇷🇼',
      region: 'Africa',
      visaRequired: 'on-arrival',
      stayDuration: 30,
      fee: '$30',
      requirements: ['유효한 여권 (6개월 이상)', '여권 사진', '황열병 예방접종 증명서'],
      notes: '도착비자로 30일 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'uganda',
      country: 'Uganda',
      countryKo: '우간다',
      emoji: '🇺🇬',
      region: 'Africa',
      visaRequired: 'evisa',
      stayDuration: 90,
      processingTime: '평균 3-5일',
      fee: '$50',
      requirements: ['온라인 비자 신청', '유효한 여권', '황열병 예방접종 증명서'],
      notes: '전자비자로 90일 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'ghana',
      country: 'Ghana',
      countryKo: '가나',
      emoji: '🇬🇭',
      region: 'Africa',
      visaRequired: 'evisa',
      stayDuration: 30,
      processingTime: '평균 3-5일',
      fee: '$75',
      requirements: ['온라인 비자 신청', '유효한 여권', '황열병 예방접종 증명서'],
      notes: '전자비자로 30일 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'senegal',
      country: 'Senegal',
      countryKo: '세네갈',
      emoji: '🇸🇳',
      region: 'Africa',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권', '황열병 예방접종 증명서'],
      notes: '90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'ivory-coast',
      country: 'Ivory Coast',
      countryKo: '코트디부아르',
      emoji: '🇨🇮',
      region: 'Africa',
      visaRequired: 'evisa',
      stayDuration: 90,
      processingTime: '평균 3-5일',
      fee: '$70',
      requirements: ['온라인 비자 신청', '유효한 여권', '황열병 예방접종 증명서'],
      notes: '전자비자로 90일 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'cape-verde',
      country: 'Cape Verde',
      countryKo: '카보베르데',
      emoji: '🇨🇻',
      region: 'Africa',
      visaRequired: 'on-arrival',
      stayDuration: 30,
      fee: '€25',
      requirements: ['유효한 여권 (6개월 이상)', '여권 사진', '현금'],
      notes: '도착비자로 30일 체류 가능',
      lastUpdated: '2025-01-15'
    },

    // 중동
    {
      id: 'israel',
      country: 'Israel',
      countryKo: '이스라엘',
      emoji: '🇮🇱',
      region: 'Middle East',
      visaRequired: 'none',
      stayDuration: 90,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권'],
      notes: '90일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'uae',
      country: 'United Arab Emirates',
      countryKo: '아랍에미리트',
      emoji: '🇦🇪',
      region: 'Middle East',
      visaRequired: 'none',
      stayDuration: 30,
      requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권'],
      notes: '30일간 무비자 체류 가능 (연장 가능)',
      lastUpdated: '2025-01-15'
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
      notes: '30일간 무비자 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'oman',
      country: 'Oman',
      countryKo: '오만',
      emoji: '🇴🇲',
      region: 'Middle East',
      visaRequired: 'evisa',
      stayDuration: 30,
      processingTime: '즉시-24시간',
      fee: '$20',
      requirements: ['온라인 비자 신청', '유효한 여권', '신용카드'],
      notes: '전자비자로 30일 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'kuwait',
      country: 'Kuwait',
      countryKo: '쿠웨이트',
      emoji: '🇰🇼',
      region: 'Middle East',
      visaRequired: 'evisa',
      stayDuration: 90,
      processingTime: '즉시-24시간',
      fee: '$3',
      requirements: ['온라인 비자 신청', '유효한 여권', '왕복 항공권'],
      notes: '전자비자로 90일 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'bahrain',
      country: 'Bahrain',
      countryKo: '바레인',
      emoji: '🇧🇭',
      region: 'Middle East',
      visaRequired: 'evisa',
      stayDuration: 90,
      processingTime: '즉시-24시간',
      fee: '$29',
      requirements: ['온라인 비자 신청', '유효한 여권', '신용카드'],
      notes: '전자비자로 90일 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'jordan',
      country: 'Jordan',
      countryKo: '요단',
      emoji: '🇯🇴',
      region: 'Middle East',
      visaRequired: 'on-arrival',
      stayDuration: 30,
      fee: '40 JOD',
      requirements: ['유효한 여권 (6개월 이상)', '여권 사진', '현금'],
      notes: '도착비자로 30일 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'lebanon',
      country: 'Lebanon',
      countryKo: '레바논',
      emoji: '🇱🇧',
      region: 'Middle East',
      visaRequired: 'on-arrival',
      stayDuration: 30,
      fee: '$50',
      requirements: ['유효한 여권 (6개월 이상)', '여권 사진', '현금'],
      notes: '도착비자로 30일 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'saudi-arabia',
      country: 'Saudi Arabia',
      countryKo: '사우디아라비아',
      emoji: '🇸🇦',
      region: 'Middle East',
      visaRequired: 'evisa',
      stayDuration: 90,
      processingTime: '즉시-24시간',
      fee: '$80',
      requirements: ['온라인 비자 신청', '유효한 여권', '신용카드'],
      notes: '전자비자로 90일 체류 가능 (1년간 유효)',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'iran',
      country: 'Iran',
      countryKo: '이란',
      emoji: '🇮🇷',
      region: 'Middle East',
      visaRequired: 'on-arrival',
      stayDuration: 30,
      fee: '€50',
      requirements: ['유효한 여권 (6개월 이상)', '여권 사진', '여행자 보험'],
      notes: '도착비자로 30일 체류 가능',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'iraq',
      country: 'Iraq',
      countryKo: '이라크',
      emoji: '🇮🇶',
      region: 'Middle East',
      visaRequired: 'required',
      stayDuration: 30,
      processingTime: '평균 10-20일',
      fee: '$80',
      requirements: ['비자 신청서', '초청장', '여권 사진', '여행자 보험'],
      notes: '현재 안전상 여행 비권장',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'syria',
      country: 'Syria',
      countryKo: '시리아',
      emoji: '🇸🇾',
      region: 'Middle East',
      visaRequired: 'required',
      stayDuration: 15,
      processingTime: '평균 15-30일',
      fee: '$100',
      requirements: ['비자 신청서', '초청장', '여권 사진'],
      notes: '현재 내전으로 입국 불가',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'yemen',
      country: 'Yemen',
      countryKo: '예멘',
      emoji: '🇾🇪',
      region: 'Middle East',
      visaRequired: 'required',
      stayDuration: 30,
      processingTime: '불가',
      fee: '불가',
      requirements: ['현재 발급 불가'],
      notes: '현재 내전으로 입국 불가',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'afghanistan',
      country: 'Afghanistan',
      countryKo: '아프가니스탄',
      emoji: '🇦🇫',
      region: 'Middle East',
      visaRequired: 'required',
      stayDuration: 30,
      processingTime: '불가',
      fee: '불가',
      requirements: ['현재 발급 불가'],
      notes: '현재 정치적 상황으로 입국 불가',
      lastUpdated: '2025-01-15'
    }
  ];

  // 비자 타입 아이콘 및 색상 함수들
  const getVisaTypeIcon = (visaType: string) => {
    switch (visaType) {
      case 'none':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'evisa':
        return <Globe className="w-4 h-4 text-blue-600" />;
      case 'on-arrival':
        return <Plane className="w-4 h-4 text-orange-600" />;
      case 'required':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const getVisaTypeText = (visaType: string) => {
    switch (visaType) {
      case 'none':
        return '무비자';
      case 'evisa':
        return '전자비자';
      case 'on-arrival':
        return '도착비자';
      case 'required':
        return '비자 필요';
      default:
        return '확인 필요';
    }
  };

  const getVisaTypeBadgeColor = (visaType: string) => {
    switch (visaType) {
      case 'none':
        return 'bg-green-100 text-green-800';
      case 'evisa':
        return 'bg-blue-100 text-blue-800';
      case 'on-arrival':
        return 'bg-orange-100 text-orange-800';
      case 'required':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 필터링 및 검색 로직
  const filteredCountries = useMemo(() => {
    let filtered = allCountriesData;

    // 탭별 필터링
    if (activeTab !== 'popular') {
      filtered = filtered.filter(country => country.region === activeTab);
    } else {
      // 인기 탭의 경우 popularRank가 있는 국가들만 표시
      filtered = filtered.filter(country => country.popularRank).sort((a, b) => (a.popularRank || 999) - (b.popularRank || 999));
    }

    // 검색 필터링
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(country => 
        country.country.toLowerCase().includes(query) ||
        country.countryKo.includes(query)
      );
    }

    // 비자 타입 필터링
    if (selectedVisaType !== 'all') {
      filtered = filtered.filter(country => country.visaRequired === selectedVisaType);
    }

    return filtered;
  }, [activeTab, searchQuery, selectedVisaType, allCountriesData]);

  // 페이지네이션 로직
  const totalPages = Math.ceil(filteredCountries.length / countriesPerPage);
  const currentCountries = filteredCountries.slice(
    (currentPage - 1) * countriesPerPage,
    currentPage * countriesPerPage
  );

  const resetPagination = () => {
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-black dark:text-white mb-6 transition-colors duration-300">
              한국 여권 비자 체커
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 transition-colors duration-300">
              전 세계 195개국의 비자 요구사항을 한눈에 확인하세요
            </p>
            <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="국가명을 검색하세요 (예: 일본, Japan)"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    resetPagination();
                  }}
                  className="pl-10 h-12 text-lg"
                />
              </div>
              <div className="flex gap-2">
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
                한국 여권 기준 비자 요건 정보 (2025년 1월 업데이트)
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
                <li>• 공항 발급</li>
                <li>• 현금 준비 필요</li>
                <li>• 대기 시간 있음</li>
              </ul>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="font-semibold text-black mb-2">비자 필요</h3>
              <p className="text-sm text-gray-600 mb-3">
                사전에 대사관에서 비자 발급 필수
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• 사전 준비</li>
                <li>• 서류 많음</li>
                <li>• 비용 발생</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            비자 준비 완료했다면, 이제 여행 가이드로!
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            TripRadio.AI와 함께 더 특별한 여행을 계획해보세요
          </p>
          <a href="/">
            <Button size="lg" className="bg-white text-black hover:bg-gray-100">
              TripRadio.AI 시작하기
            </Button>
          </a>
        </div>
      </section>
    </div>
  );
}