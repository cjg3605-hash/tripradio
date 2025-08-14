'use client';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { KeywordPageSchema } from '@/components/seo/KeywordPageSchema';
// 50개 국가 대규모 비자 정보 데이터 (한국 여권 기준, 2025년)
const visaInfo = [
  // 아시아 태평양 (무비자/비자 면제)
  {
    country: '일본',
    flag: '🇯🇵',
    visaFree: true,
    maxDays: 90,
    requirements: ['유효한 여권', '왕복 항공권', '체류비 증명'],
    digitalNomad: false,
    difficulty: 'easy',
    popularWith: 'tourists',
    continent: 'asia',
    language: '일본어',
    currency: 'JPY'
  },
  {
    country: '태국',
    flag: '🇹🇭', 
    visaFree: true,
    maxDays: 30,
    requirements: ['유효한 여권 (6개월 이상)', '출국 티켓 증명'],
    digitalNomad: true,
    nomadVisa: 'LTR 비자',
    difficulty: 'easy',
    popularWith: 'nomads',
    continent: 'asia',
    language: '태국어',
    currency: 'THB'
  },
  {
    country: '싱가포르',
    flag: '🇸🇬',
    visaFree: true,
    maxDays: 90,
    requirements: ['유효한 여권', '충분한 체재비 증명'],
    digitalNomad: false,
    difficulty: 'easy',
    popularWith: 'tourists',
    continent: 'asia',
    language: '영어',
    currency: 'SGD'
  },
  {
    country: '말레이시아',
    flag: '🇲🇾',
    visaFree: true,
    maxDays: 90,
    requirements: ['유효한 여권 (6개월 이상)', '출국 티켓'],
    digitalNomad: true,
    nomadVisa: 'DE Rantau 프로그램',
    difficulty: 'easy',
    popularWith: 'nomads',
    continent: 'asia',
    language: '말레이어/영어',
    currency: 'MYR'
  },
  {
    country: '인도네시아',
    flag: '🇮🇩',
    visaFree: true,
    maxDays: 30,
    requirements: ['유효한 여권 (6개월 이상)', '출국 티켓'],
    digitalNomad: true,
    nomadVisa: 'B213A 비자',
    difficulty: 'easy',
    popularWith: 'nomads',
    continent: 'asia',
    language: '인도네시아어',
    currency: 'IDR'
  },
  {
    country: '베트남',
    flag: '🇻🇳',
    visaFree: true,
    maxDays: 45,
    requirements: ['유효한 여권 (6개월 이상)', '출국 티켓'],
    digitalNomad: false,
    difficulty: 'easy',
    popularWith: 'tourists',
    continent: 'asia',
    language: '베트남어',
    currency: 'VND'
  },
  {
    country: '필리핀',
    flag: '🇵🇭',
    visaFree: true,
    maxDays: 30,
    requirements: ['유효한 여권 (6개월 이상)', '왕복 항공권'],
    digitalNomad: false,
    difficulty: 'easy',
    popularWith: 'tourists',
    continent: 'asia',
    language: '타갈로그어/영어',
    currency: 'PHP'
  },
  {
    country: '중국',
    flag: '🇨🇳',
    visaFree: false,
    requirements: ['관광비자 필요', '초청장', '호텔 예약', '왕복 항공권'],
    digitalNomad: false,
    difficulty: 'hard',
    popularWith: 'tourists',
    continent: 'asia',
    language: '중국어',
    currency: 'CNY'
  },
  {
    country: '인도',
    flag: '🇮🇳',
    visaFree: false,
    requirements: ['e-비자 또는 관광비자', '호텔 예약', '예방접종 증명'],
    digitalNomad: false,
    difficulty: 'medium',
    popularWith: 'tourists',
    continent: 'asia',
    language: '힌디어/영어',
    currency: 'INR'
  },
  {
    country: '홍콩',
    flag: '🇭🇰',
    visaFree: true,
    maxDays: 90,
    requirements: ['유효한 여권', '출국 티켓'],
    digitalNomad: false,
    difficulty: 'easy',
    popularWith: 'tourists',
    continent: 'asia',
    language: '중국어/영어',
    currency: 'HKD'
  },
  {
    country: '마카오',
    flag: '🇲🇴',
    visaFree: true,
    maxDays: 90,
    requirements: ['유효한 여권'],
    digitalNomad: false,
    difficulty: 'easy',
    popularWith: 'tourists',
    continent: 'asia',
    language: '중국어/포르투갈어',
    currency: 'MOP'
  },
  {
    country: '대만',
    flag: '🇹🇼',
    visaFree: true,
    maxDays: 90,
    requirements: ['유효한 여권', '왕복 항공권'],
    digitalNomad: false,
    difficulty: 'easy',
    popularWith: 'tourists',
    continent: 'asia',
    language: '중국어',
    currency: 'TWD'
  },

  // 유럽 (솅겐/EU)
  {
    country: '독일',
    flag: '🇩🇪',
    visaFree: true,
    maxDays: 90,
    requirements: ['유효한 여권', '숙박 예약', '여행 보험'],
    digitalNomad: false,
    difficulty: 'medium',
    popularWith: 'tourists',
    continent: 'europe',
    language: '독일어',
    currency: 'EUR'
  },
  {
    country: '프랑스',
    flag: '🇫🇷',
    visaFree: true,
    maxDays: 90,
    requirements: ['유효한 여권', '숙박 증명', '여행 보험', '충분한 자금'],
    digitalNomad: false,
    difficulty: 'medium',
    popularWith: 'tourists',
    continent: 'europe',
    language: '프랑스어',
    currency: 'EUR'
  },
  {
    country: '이탈리아',
    flag: '🇮🇹',
    visaFree: true,
    maxDays: 90,
    requirements: ['유효한 여권', '숙박 증명', '여행 보험'],
    digitalNomad: false,
    difficulty: 'medium',
    popularWith: 'tourists',
    continent: 'europe',
    language: '이탈리아어',
    currency: 'EUR'
  },
  {
    country: '스페인',
    flag: '🇪🇸',
    visaFree: true,
    maxDays: 90,
    requirements: ['유효한 여권', '숙박 증명', '여행 보험'],
    digitalNomad: true,
    nomadVisa: 'Digital Nomad Visa',
    difficulty: 'medium',
    popularWith: 'nomads',
    continent: 'europe',
    language: '스페인어',
    currency: 'EUR'
  },
  {
    country: '포르투갈',
    flag: '🇵🇹',
    visaFree: true,
    maxDays: 90,
    requirements: ['유효한 여권', '숙박 증명', '충분한 자금'],
    digitalNomad: true,
    nomadVisa: 'D7 비자',
    difficulty: 'medium',
    popularWith: 'nomads',
    continent: 'europe',
    language: '포르투갈어',
    currency: 'EUR'
  },
  {
    country: '네덜란드',
    flag: '🇳🇱',
    visaFree: true,
    maxDays: 90,
    requirements: ['유효한 여권', '숙박 증명', '여행 보험', '충분한 자금'],
    digitalNomad: false,
    difficulty: 'medium',
    popularWith: 'tourists',
    continent: 'europe',
    language: '네덜란드어',
    currency: 'EUR'
  },
  {
    country: '영국',
    flag: '🇬🇧',
    visaFree: true,
    maxDays: 180,
    requirements: ['유효한 여권', '왕복 항공권', '충분한 자금'],
    digitalNomad: false,
    difficulty: 'medium',
    popularWith: 'tourists',
    continent: 'europe',
    language: '영어',
    currency: 'GBP'
  },
  {
    country: '스위스',
    flag: '🇨🇭',
    visaFree: true,
    maxDays: 90,
    requirements: ['유효한 여권', '숙박 증명', '여행 보험', '충분한 자금'],
    digitalNomad: false,
    difficulty: 'medium',
    popularWith: 'tourists',
    continent: 'europe',
    language: '독일어/프랑스어',
    currency: 'CHF'
  },
  {
    country: '오스트리아',
    flag: '🇦🇹',
    visaFree: true,
    maxDays: 90,
    requirements: ['유효한 여권', '숙박 증명', '여행 보험'],
    digitalNomad: false,
    difficulty: 'medium',
    popularWith: 'tourists',
    continent: 'europe',
    language: '독일어',
    currency: 'EUR'
  },
  {
    country: '체코',
    flag: '🇨🇿',
    visaFree: true,
    maxDays: 90,
    requirements: ['유효한 여권', '숙박 증명', '여행 보험'],
    digitalNomad: false,
    difficulty: 'medium',
    popularWith: 'tourists',
    continent: 'europe',
    language: '체코어',
    currency: 'CZK'
  },
  {
    country: '헝가리',
    flag: '🇭🇺',
    visaFree: true,
    maxDays: 90,
    requirements: ['유효한 여권', '숙박 증명', '여행 보험'],
    digitalNomad: false,
    difficulty: 'medium',
    popularWith: 'tourists',
    continent: 'europe',
    language: '헝가리어',
    currency: 'HUF'
  },
  {
    country: '폴란드',
    flag: '🇵🇱',
    visaFree: true,
    maxDays: 90,
    requirements: ['유효한 여권', '숙박 증명', '여행 보험'],
    digitalNomad: false,
    difficulty: 'medium',
    popularWith: 'tourists',
    continent: 'europe',
    language: '폴란드어',
    currency: 'PLN'
  },
  {
    country: '그리스',
    flag: '🇬🇷',
    visaFree: true,
    maxDays: 90,
    requirements: ['유효한 여권', '숙박 증명', '여행 보험'],
    digitalNomad: true,
    nomadVisa: 'Digital Nomad Visa',
    difficulty: 'medium',
    popularWith: 'nomads',
    continent: 'europe',
    language: '그리스어',
    currency: 'EUR'
  },
  {
    country: '조지아',
    flag: '🇬🇪',
    visaFree: true,
    maxDays: 365,
    requirements: ['유효한 여권'],
    digitalNomad: true,
    nomadVisa: '1년 무비자',
    difficulty: 'easy',
    popularWith: 'nomads',
    continent: 'europe',
    language: '조지아어',
    currency: 'GEL'
  },
  {
    country: '에스토니아',
    flag: '🇪🇪',
    visaFree: true,
    maxDays: 90,
    requirements: ['유효한 여권', '숙박 증명', '여행 보험'],
    digitalNomad: true,
    nomadVisa: 'Digital Nomad Visa',
    difficulty: 'medium',
    popularWith: 'nomads',
    continent: 'europe',
    language: '에스토니아어',
    currency: 'EUR'
  },

  // 아메리카
  {
    country: '미국',
    flag: '🇺🇸',
    visaFree: true,
    maxDays: 90,
    requirements: ['ESTA 승인', '유효한 여권', '왕복 항공권'],
    digitalNomad: false,
    difficulty: 'medium',
    popularWith: 'tourists',
    continent: 'america',
    language: '영어',
    currency: 'USD'
  },
  {
    country: '캐나다',
    flag: '🇨🇦',
    visaFree: false,
    requirements: ['eTA 승인', '유효한 여권', '왕복 항공권'],
    digitalNomad: false,
    difficulty: 'medium',
    popularWith: 'tourists',
    continent: 'america',
    language: '영어/프랑스어',
    currency: 'CAD'
  },
  {
    country: '멕시코',
    flag: '🇲🇽',
    visaFree: true,
    maxDays: 180,
    requirements: ['유효한 여권', '출국 티켓'],
    digitalNomad: true,
    nomadVisa: 'Temporary Resident',
    difficulty: 'easy',
    popularWith: 'nomads',
    continent: 'america',
    language: '스페인어',
    currency: 'MXN'
  },
  {
    country: '브라질',
    flag: '🇧🇷',
    visaFree: true,
    maxDays: 90,
    requirements: ['유효한 여권', '황열병 예방접종'],
    digitalNomad: false,
    difficulty: 'medium',
    popularWith: 'tourists',
    continent: 'america',
    language: '포르투갈어',
    currency: 'BRL'
  },
  {
    country: '아르헨티나',
    flag: '🇦🇷',
    visaFree: true,
    maxDays: 90,
    requirements: ['유효한 여권'],
    digitalNomad: false,
    difficulty: 'easy',
    popularWith: 'tourists',
    continent: 'america',
    language: '스페인어',
    currency: 'ARS'
  },
  {
    country: '칠레',
    flag: '🇨🇱',
    visaFree: true,
    maxDays: 90,
    requirements: ['유효한 여권', '출국 티켓'],
    digitalNomad: false,
    difficulty: 'easy',
    popularWith: 'tourists',
    continent: 'america',
    language: '스페인어',
    currency: 'CLP'
  },
  {
    country: '콜롬비아',
    flag: '🇨🇴',
    visaFree: true,
    maxDays: 90,
    requirements: ['유효한 여권', '황열병 예방접종'],
    digitalNomad: false,
    difficulty: 'medium',
    popularWith: 'tourists',
    continent: 'america',
    language: '스페인어',
    currency: 'COP'
  },
  {
    country: '페루',
    flag: '🇵🇪',
    visaFree: true,
    maxDays: 90,
    requirements: ['유효한 여권', '황열병 예방접종'],
    digitalNomad: false,
    difficulty: 'medium',
    popularWith: 'tourists',
    continent: 'america',
    language: '스페인어',
    currency: 'PEN'
  },

  // 중동
  {
    country: 'UAE (두바이)',
    flag: '🇦🇪',
    visaFree: true,
    maxDays: 30,
    requirements: ['유효한 여권 (6개월 이상)'],
    digitalNomad: true,
    nomadVisa: 'Golden Visa',
    difficulty: 'easy',
    popularWith: 'nomads',
    continent: 'middle_east',
    language: '아랍어/영어',
    currency: 'AED'
  },
  {
    country: '카타르',
    flag: '🇶🇦',
    visaFree: true,
    maxDays: 30,
    requirements: ['유효한 여권', '왕복 항공권'],
    digitalNomad: false,
    difficulty: 'easy',
    popularWith: 'tourists',
    continent: 'middle_east',
    language: '아랍어',
    currency: 'QAR'
  },
  {
    country: '이스라엘',
    flag: '🇮🇱',
    visaFree: true,
    maxDays: 90,
    requirements: ['유효한 여권', '왕복 항공권'],
    digitalNomad: false,
    difficulty: 'medium',
    popularWith: 'tourists',
    continent: 'middle_east',
    language: '히브리어',
    currency: 'ILS'
  },
  {
    country: '터키',
    flag: '🇹🇷',
    visaFree: true,
    maxDays: 90,
    requirements: ['유효한 여권 (6개월 이상)'],
    digitalNomad: false,
    difficulty: 'easy',
    popularWith: 'tourists',
    continent: 'middle_east',
    language: '터키어',
    currency: 'TRY'
  },

  // 아프리카
  {
    country: '남아프리카',
    flag: '🇿🇦',
    visaFree: true,
    maxDays: 90,
    requirements: ['유효한 여권', '황열병 예방접종'],
    digitalNomad: false,
    difficulty: 'medium',
    popularWith: 'tourists',
    continent: 'africa',
    language: '영어/아프리칸스어',
    currency: 'ZAR'
  },
  {
    country: '모로코',
    flag: '🇲🇦',
    visaFree: true,
    maxDays: 90,
    requirements: ['유효한 여권 (6개월 이상)'],
    digitalNomad: false,
    difficulty: 'easy',
    popularWith: 'tourists',
    continent: 'africa',
    language: '아랍어/프랑스어',
    currency: 'MAD'
  },
  {
    country: '이집트',
    flag: '🇪🇬',
    visaFree: false,
    requirements: ['도착비자 또는 사전 비자', '유효한 여권'],
    digitalNomad: false,
    difficulty: 'medium',
    popularWith: 'tourists',
    continent: 'africa',
    language: '아랍어',
    currency: 'EGP'
  },

  // 오세아니아
  {
    country: '호주',
    flag: '🇦🇺',
    visaFree: false,
    requirements: ['ETA 또는 eVisitor', '유효한 여권', '건강검진'],
    digitalNomad: false,
    difficulty: 'medium',
    popularWith: 'tourists',
    continent: 'oceania',
    language: '영어',
    currency: 'AUD'
  },
  {
    country: '뉴질랜드',
    flag: '🇳🇿',
    visaFree: false,
    requirements: ['NZeTA', '유효한 여권', '관광세 지불'],
    digitalNomad: false,
    difficulty: 'medium',
    popularWith: 'tourists',
    continent: 'oceania',
    language: '영어',
    currency: 'NZD'
  },
  {
    country: '피지',
    flag: '🇫🇯',
    visaFree: true,
    maxDays: 120,
    requirements: ['유효한 여권', '왕복 항공권'],
    digitalNomad: false,
    difficulty: 'easy',
    popularWith: 'tourists',
    continent: 'oceania',
    language: '영어/피지어',
    currency: 'FJD'
  },

  // 추가 유럽 국가들
  {
    country: '노르웨이',
    flag: '🇳🇴',
    visaFree: true,
    maxDays: 90,
    requirements: ['유효한 여권', '충분한 자금', '여행 보험'],
    digitalNomad: false,
    difficulty: 'medium',
    popularWith: 'tourists',
    continent: 'europe',
    language: '노르웨이어',
    currency: 'NOK'
  },
  {
    country: '스웨덴',
    flag: '🇸🇪',
    visaFree: true,
    maxDays: 90,
    requirements: ['유효한 여권', '충분한 자금', '여행 보험'],
    digitalNomad: false,
    difficulty: 'medium',
    popularWith: 'tourists',
    continent: 'europe',
    language: '스웨덴어',
    currency: 'SEK'
  },
  {
    country: '덴마크',
    flag: '🇩🇰',
    visaFree: true,
    maxDays: 90,
    requirements: ['유효한 여권', '충분한 자금', '여행 보험'],
    digitalNomad: false,
    difficulty: 'medium',
    popularWith: 'tourists',
    continent: 'europe',
    language: '덴마크어',
    currency: 'DKK'
  },
  {
    country: '핀란드',
    flag: '🇫🇮',
    visaFree: true,
    maxDays: 90,
    requirements: ['유효한 여권', '충분한 자금', '여행 보험'],
    digitalNomad: false,
    difficulty: 'medium',
    popularWith: 'tourists',
    continent: 'europe',
    language: '핀란드어',
    currency: 'EUR'
  },
  {
    country: '아이슬란드',
    flag: '🇮🇸',
    visaFree: true,
    maxDays: 90,
    requirements: ['유효한 여권', '충분한 자금', '여행 보험'],
    digitalNomad: false,
    difficulty: 'medium',
    popularWith: 'tourists',
    continent: 'europe',
    language: '아이슬란드어',
    currency: 'ISK'
  },

  // 추가 아시아 국가들
  {
    country: '스리랑카',
    flag: '🇱🇰',
    visaFree: false,
    requirements: ['ETA 비자', '유효한 여권'],
    digitalNomad: false,
    difficulty: 'medium',
    popularWith: 'tourists',
    continent: 'asia',
    language: '싱할라어/타밀어',
    currency: 'LKR'
  },
  {
    country: '방글라데시',
    flag: '🇧🇩',
    visaFree: false,
    requirements: ['비자 필요', '초청장', '예방접종 증명'],
    digitalNomad: false,
    difficulty: 'hard',
    popularWith: 'business',
    continent: 'asia',
    language: '벵골어',
    currency: 'BDT'
  }
];

const nomadVisaCountries = [
  { country: '에스토니아', flag: '🇪🇪', visa: 'Digital Nomad Visa', duration: '1년', minIncome: '$3,500/월' },
  { country: '포르투갈', flag: '🇵🇹', visa: 'D7 Visa', duration: '2년', minIncome: '$2,800/월' },
  { country: '바베이도스', flag: '🇧🇧', visa: 'Welcome Stamp', duration: '1년', minIncome: '$50,000/년' },
  { country: '두바이', flag: '🇦🇪', visa: '1년 리모트 워크 비자', duration: '1년', minIncome: '$5,000/월' },
  { country: '멕시코', flag: '🇲🇽', visa: 'Temporary Resident', duration: '1년', minIncome: '$2,700/월' }
];

export default function VisaCheckerPage() {
  const t = useTranslations('visaChecker');
  
  return (
    <>
      <KeywordPageSchema 
        keyword={t('keyword')}
        pagePath="/visa-checker"
        title={t('metadata.title')}
        description={t('metadata.description')}
        features={[t('features.realtimeInfo'), t('features.visaFree'), t('features.nomadVisa'), t('features.checklist'), t('features.immigration'), t('features.tips')]}
      />
      <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-6 py-3 bg-gray-50 border border-gray-200 rounded-full text-sm font-medium text-gray-600 mb-8">
              {t('badge')}
            </div>
            <h1 className="text-5xl lg:text-6xl font-light text-gray-900 mb-6 tracking-tight">
              {t('hero.title')}
            </h1>
            <h2 className="text-2xl lg:text-3xl font-normal text-gray-700 mb-8">
              {t('hero.subtitle')}
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              한국 여권 소지자를 위한 50개국 비자 정보를 확인하고, 디지털노마드 비자부터 관광비자까지 모든 출입국 요구사항을 한눈에 파악하세요.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Visa Checker */}
      <section className="container mx-auto px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-50 p-8 rounded-lg mb-12 border border-gray-200">
            <h2 className="text-2xl font-light text-gray-900 mb-2 text-center">
              한국 여권 비자 체커
            </h2>
            <p className="text-sm text-gray-600 mb-6 text-center">
              2025년 최신 정보 기준 | 중요: 출발 전 대사관에서 최신 정보 확인 필수
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">출발국</label>
                <div className="w-full p-4 border border-gray-300 rounded-lg bg-gray-100 text-gray-600">
                  대한민국 (한국 여권 전용)
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">목적지</label>
                <input 
                  type="text" 
                  placeholder="예: 중국(무비자 30일), 일본(90일), 태국(90일)..."
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 min-h-[44px]"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">여행 목적</label>
                <select className="w-full p-4 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 min-h-[44px]">
                  <option>관광</option>
                  <option>출장</option>
                  <option>디지털노마드</option>
                  <option>장기체류</option>
                  <option>학업</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">체류 기간</label>
                <select className="w-full p-4 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 min-h-[44px]">
                  <option>1주 이내</option>
                  <option>1개월 이내</option>
                  <option>3개월 이내</option>
                  <option>6개월 이내</option>
                  <option>1년 이상</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button className="w-full bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 shadow-sm min-h-[44px] flex items-center justify-center">
                  한국 여권 비자 요구사항 확인
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations Visa Info */}
      <section className="container mx-auto px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-light text-gray-900 mb-8 text-center">
            인기 여행지 <span className="font-semibold">비자 정보</span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visaInfo.map((info, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="w-6 h-6 bg-gray-400 rounded"></div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{info.country}</h3>
                      {info.visaFree ? (
                        <div className="flex items-center gap-2">
                          <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs font-medium">
                            무비자
                          </div>
                          <span className="text-sm text-gray-600">{info.maxDays}일</span>
                        </div>
                      ) : (
                        <div className="bg-gray-200 text-gray-800 px-3 py-1 rounded-lg text-xs font-medium">
                          비자 필요
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-lg text-xs font-medium ${
                    info.difficulty === 'easy' ? 'bg-gray-50 text-gray-600 border border-gray-200' :
                    info.difficulty === 'medium' ? 'bg-gray-100 text-gray-700 border border-gray-300' :
                    'bg-gray-200 text-gray-800 border border-gray-400'
                  }`}>
                    {info.difficulty === 'easy' ? '쉬움' : 
                     info.difficulty === 'medium' ? '보통' : '어려움'}
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">필수 서류</h4>
                  <ul className="space-y-1">
                    {info.requirements.map((req, reqIndex) => (
                      <li key={reqIndex} className="text-sm text-gray-600 flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                        </div>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {info.digitalNomad && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-4 h-4 bg-gray-400 rounded-sm"></div>
                      <span className="text-sm font-medium text-gray-700">디지털노마드 가능</span>
                    </div>
                    {info.nomadVisa && (
                      <p className="text-xs text-gray-600">{info.nomadVisa}</p>
                    )}
                  </div>
                )}

                <Link 
                  href={`/?destination=${encodeURIComponent(info.country)}&visa=guide`}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-center block hover:bg-gray-200 transition-all duration-200 text-sm font-medium"
                >
                  {info.country} 여행 가이드 보기
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Digital Nomad Visas */}
      <section className="py-20 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-light text-gray-900 mb-4">
              디지털노마드 <span className="font-semibold">전용 비자</span>
            </h2>
            <p className="text-gray-600">한국 여권 기준 원격근무자를 위한 특별 비자 프로그램</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {nomadVisaCountries.map((country, index) => (
              <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 bg-gray-500 rounded"></div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{country.country}</h3>
                    <p className="text-sm text-gray-600">{country.visa}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">체류기간:</span>
                    <span className="font-medium">{country.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">최소소득:</span>
                    <span className="font-medium">{country.minIncome}</span>
                  </div>
                </div>

                <Link 
                  href={`/nomad-calculator?country=${encodeURIComponent(country.country)}`}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-center block hover:bg-gray-200 transition-all duration-200 text-sm font-medium"
                >
                  노마드 계산기로 분석
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link 
              href="/nomad-calculator"
              className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-lg min-h-[44px]"
            >
              전체 노마드 도시 비교하기
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Visa Tips */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-light text-gray-900 mb-8 text-center">
              비자 신청 <span className="font-semibold">필수 팁</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-gray-700 mb-3">반드시 확인할 것</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• 여권 유효기간 6개월 이상 남아있는지</li>
                    <li>• 왕복 항공권 또는 제3국 출국 티켓</li>
                    <li>• 충분한 체재비 증명 (은행 잔고증명서)</li>
                    <li>• 여행자 보험 가입 확인</li>
                    <li>• 숙박 예약 확인서</li>
                  </ul>
                </div>

                <div className="bg-gray-100 p-6 rounded-lg border border-gray-300">
                  <h3 className="font-medium text-gray-800 mb-3">주의사항</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• 무비자 ≠ 무조건 입국 가능</li>
                    <li>• 출입국 관리소 재량으로 입국 거부 가능</li>
                    <li>• 코로나19 등 상황에 따라 변경 가능</li>
                    <li>• 여권에 충분한 빈 페이지 필요</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-gray-700 mb-3">유용한 팁</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• 출발 전 외교부 여행경보 확인</li>
                    <li>• 대사관 웹사이트에서 최신 정보 확인</li>
                    <li>• 여행 일정표 준비 (영문 또는 현지어)</li>
                    <li>• 출입국 카드 미리 작성하기</li>
                    <li>• 중요 서류 사본 준비</li>
                  </ul>
                </div>

                <div className="bg-gray-200 p-6 rounded-lg border border-gray-400">
                  <h3 className="font-medium text-gray-800 mb-3">피해야 할 것</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• 만료 임박한 여권으로 출국</li>
                    <li>• 불법 취업 가능성 의심받을 행동</li>
                    <li>• 거짓 정보 제공</li>
                    <li>• 과도한 현금 소지 (신고 필요)</li>
                    <li>• 금지 품목 휴대</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Travel Guide Integration */}
      <section className="py-20 lg:py-32 bg-gray-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-light mb-6 tracking-tight">
              비자 준비 완료! <span className="font-semibold">이제 여행 가이드와 함께</span>
            </h2>
            <p className="text-lg lg:text-xl text-gray-300 mb-8 leading-relaxed">
              한국 여권으로 출입국 준비가 끝났다면, 그 나라에서만 경험할 수 있는 
              특별한 이야기와 문화를 AI 가이드가 안내해드립니다
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-gray-900 p-6 rounded-lg">
                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <div className="w-6 h-6 bg-gray-300 rounded"></div>
                </div>
                <h3 className="font-medium mb-2">현지 문화 체험</h3>
                <p className="text-sm text-gray-300">단순 관광이 아닌 그 나라의 깊은 역사와 문화 이해</p>
              </div>
              <div className="bg-gray-900 p-6 rounded-lg">
                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <div className="w-6 h-4 bg-gray-400 rounded-sm"></div>
                </div>
                <h3 className="font-medium mb-2">현지인 관점</h3>
                <p className="text-sm text-gray-300">현지인만 아는 숨겨진 명소와 생활 꿀팁</p>
              </div>
              <div className="bg-gray-900 p-6 rounded-lg">
                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                </div>
                <h3 className="font-medium mb-2">안전 여행 팁</h3>
                <p className="text-sm text-gray-300">현지 상황과 주의사항을 실시간으로 안내</p>
              </div>
            </div>
            <Link 
              href="/?visa=ready&guide=start"
              className="inline-block bg-white text-gray-900 px-10 py-4 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200 shadow-lg"
            >
              여행 가이드 시작하기
            </Link>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}