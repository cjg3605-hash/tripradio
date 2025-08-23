// src/lib/seo/locationTranslation.ts
// 장소명 다국어 번역 시스템

export interface LocationTranslation {
  ko: string;    // 한국어 (원본)
  en: string;    // 영어
  ja: string;    // 일본어  
  zh: string;    // 중국어
  es: string;    // 스페인어
}

// 주요 관광지 번역 데이터베이스
export const LOCATION_TRANSLATIONS: Record<string, LocationTranslation> = {
  // 서울 주요 관광지
  "경복궁": {
    ko: "경복궁",
    en: "Gyeongbokgung-Palace", 
    ja: "景福宮",
    zh: "景福宫",
    es: "Palacio-Gyeongbokgung"
  },
  "창덕궁": {
    ko: "창덕궁",
    en: "Changdeokgung-Palace",
    ja: "昌德宮", 
    zh: "昌德宫",
    es: "Palacio-Changdeokgung"
  },
  "남산타워": {
    ko: "남산타워",
    en: "Namsan-Tower",
    ja: "南山タワー",
    zh: "南山塔", 
    es: "Torre-Namsan"
  },
  "명동": {
    ko: "명동",
    en: "Myeongdong",
    ja: "明洞",
    zh: "明洞",
    es: "Myeongdong"
  },
  "홍대": {
    ko: "홍대",
    en: "Hongdae", 
    ja: "弘大",
    zh: "弘大",
    es: "Hongdae"
  },
  
  // 부산 주요 관광지
  "부산": {
    ko: "부산",
    en: "Busan",
    ja: "釜山", 
    zh: "釜山",
    es: "Busan"
  },
  "해운대": {
    ko: "해운대",
    en: "Haeundae-Beach",
    ja: "海雲台",
    zh: "海云台",
    es: "Playa-Haeundae"
  },
  "광안리": {
    ko: "광안리",
    en: "Gwangalli-Beach",
    ja: "広安里",
    zh: "广安里", 
    es: "Playa-Gwangalli"
  },
  "감천문화마을": {
    ko: "감천문화마을",
    en: "Gamcheon-Culture-Village",
    ja: "甘川文化村",
    zh: "甘川文化村",
    es: "Pueblo-Cultural-Gamcheon"
  },
  
  // 제주도 주요 관광지
  "제주도": {
    ko: "제주도",
    en: "Jeju-Island",
    ja: "済州島",
    zh: "济州岛", 
    es: "Isla-Jeju"
  },
  "한라산": {
    ko: "한라산",
    en: "Hallasan-Mountain", 
    ja: "漢拏山",
    zh: "汉拏山",
    es: "Monte-Hallasan"
  },
  "성산일출봉": {
    ko: "성산일출봉",
    en: "Seongsan-Ilchulbong",
    ja: "城山日出峰",
    zh: "城山日出峰",
    es: "Pico-Seongsan-Ilchulbong"
  },
  
  // 기타 주요 도시
  "서울": {
    ko: "서울", 
    en: "Seoul",
    ja: "ソウル",
    zh: "首尔",
    es: "Seul"
  },
  "인천": {
    ko: "인천",
    en: "Incheon", 
    ja: "仁川",
    zh: "仁川",
    es: "Incheon"
  },
  "대구": {
    ko: "대구",
    en: "Daegu",
    ja: "大邱", 
    zh: "大邱",
    es: "Daegu"
  },
  "광주": {
    ko: "광주",
    en: "Gwangju",
    ja: "光州",
    zh: "光州",
    es: "Gwangju"
  },
  "대전": {
    ko: "대전",
    en: "Daejeon", 
    ja: "大田",
    zh: "大田",
    es: "Daejeon"
  }
};

export type SupportedLanguage = 'ko' | 'en' | 'ja' | 'zh' | 'es';

/**
 * 한국어 장소명을 지정된 언어로 번역
 */
export function translateLocationName(
  koreanName: string, 
  targetLanguage: SupportedLanguage
): string {
  const translation = LOCATION_TRANSLATIONS[koreanName];
  
  if (translation) {
    return translation[targetLanguage];
  }
  
  // 번역이 없으면 한국어 원본 반환 (기존 방식 유지)
  return koreanName;
}

/**
 * 번역된 장소명에서 한국어 원본명 역추적
 */
export function getKoreanLocationName(
  translatedName: string,
  sourceLanguage: SupportedLanguage
): string {
  for (const [koreanName, translations] of Object.entries(LOCATION_TRANSLATIONS)) {
    if (translations[sourceLanguage] === translatedName) {
      return koreanName;
    }
  }
  
  // 역추적 실패 시 입력값 그대로 반환
  return translatedName;
}

/**
 * 언어별 SEO 친화적 URL 슬러그 생성
 */
export function generateLocalizedSlug(
  koreanName: string,
  language: SupportedLanguage
): string {
  const translatedName = translateLocationName(koreanName, language);
  
  // URL 친화적으로 변환
  return translatedName
    .replace(/\s+/g, '-')           // 공백을 하이픈으로
    .replace(/[^\w가-힣一-龯ひ-ヾー-]/g, '-')  // 특수문자 제거 (한중일 문자 유지)
    .replace(/-+/g, '-')            // 연속 하이픈 제거
    .replace(/^-|-$/g, '');         // 앞뒤 하이픈 제거
}

/**
 * 언어별 가이드 URL 생성 (번역된 장소명 사용)
 */
export function generateLocalizedGuideUrls(koreanLocationName: string): Array<{
  language: SupportedLanguage;
  url: string;
  localizedName: string;
}> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://navidocent.com';
  const languages: SupportedLanguage[] = ['ko', 'en', 'ja', 'zh', 'es'];
  
  return languages.map(lang => {
    const localizedName = translateLocationName(koreanLocationName, lang);
    const slug = generateLocalizedSlug(koreanLocationName, lang);
    
    return {
      language: lang,
      url: `${baseUrl}/guide/${lang}/${encodeURIComponent(slug)}`,
      localizedName
    };
  });
}

/**
 * 자동 번역 API 사용 (향후 확장용)
 */
export async function autoTranslateLocationName(
  koreanName: string,
  targetLanguage: SupportedLanguage
): Promise<string> {
  // 기존 번역 데이터 우선 확인
  const existingTranslation = translateLocationName(koreanName, targetLanguage);
  if (existingTranslation !== koreanName) {
    return existingTranslation;
  }
  
  // TODO: 향후 Google Translate API, Papago API 등 연동
  // 현재는 한국어 원본 반환
  console.log(`⚠️ "${koreanName}"의 ${targetLanguage} 번역이 없습니다. 수동 추가 필요.`);
  return koreanName;
}

/**
 * 새로운 장소 번역 추가 (관리자용)
 */
export function addLocationTranslation(
  koreanName: string,
  translations: Partial<LocationTranslation>
): void {
  const fullTranslation: LocationTranslation = {
    ko: koreanName,
    en: translations.en || koreanName,
    ja: translations.ja || koreanName, 
    zh: translations.zh || koreanName,
    es: translations.es || koreanName
  };
  
  LOCATION_TRANSLATIONS[koreanName] = fullTranslation;
  console.log(`✅ "${koreanName}" 번역 추가 완료:`, fullTranslation);
}

/**
 * 사용 가능한 번역 목록 조회
 */
export function getAvailableTranslations(): string[] {
  return Object.keys(LOCATION_TRANSLATIONS);
}

/**
 * 특정 장소의 모든 번역 조회
 */
export function getAllTranslations(koreanName: string): LocationTranslation | null {
  return LOCATION_TRANSLATIONS[koreanName] || null;
}