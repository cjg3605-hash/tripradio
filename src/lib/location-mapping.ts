/**
 * 다국어 지명 매핑 시스템
 * 해외 사용자가 영어/일본어/중국어/스페인어 지명으로 접근할 때
 * 한국어 지명으로 자동 변환하여 DB 조회 가능하게 함
 */

// 주요 관광지 다국어 매핑
export const LOCATION_MAPPINGS: Record<string, Record<string, string>> = {
  // 한국 도시
  '서울': {
    en: 'seoul',
    ja: 'ソウル',
    zh: '首尔',
    es: 'seúl',
    ko: '서울'
  },
  '부산': {
    en: 'busan',
    ja: 'プサン',
    zh: '釜山',
    es: 'busán',
    ko: '부산'
  },
  
  // 한국 관광지
  'gyeongbokgung': {
    en: 'gyeongbokgung palace',
    ja: 'けいふくきゅう',
    zh: '景福宫',
    es: 'palacio gyeongbokgung',
    ko: '경복궁'
  },
  '남산타워': {
    en: 'n seoul tower',
    ja: 'nソウルタワー', 
    zh: 'n首尔塔',
    es: 'torre n de seul',
    ko: '남산타워'
  },
  '부산해운대': {
    en: 'haeundae beach',
    ja: 'はうんで',
    zh: '海云台海水浴场',
    es: 'playa haeundae',
    ko: '부산해운대'
  },
  '제주도': {
    en: 'jeju island',
    ja: 'ちぇじゅど',
    zh: '济州岛',
    es: 'isla jeju',
    ko: '제주도'
  },
  
  // 세계 주요 관광지
  '에펠탑': {
    en: 'eiffel tower',
    ja: 'エッフェル塔',
    zh: '埃菲尔铁塔',
    es: 'torre eiffel',
    ko: '에펠탑'
  },
  '콜로세움': {
    en: 'colosseum',
    ja: 'コロッセオ',
    zh: '罗马斗兽场',
    es: 'coliseo',
    ko: '콜로세움'
  },
  '타지마할': {
    en: 'taj mahal',
    ja: 'タージマハル',
    zh: '泰姬陵',
    es: 'taj mahal',
    ko: '타지마할'
  },
  '자유의여신상': {
    en: 'statue of liberty',
    ja: '自由の女神像',
    zh: '自由女神像',
    es: 'estatua de la libertad',
    ko: '자유의여신상'
  },
  '마추픽추': {
    en: 'machu picchu',
    ja: 'マチュピチュ',
    zh: '马丘比丘',
    es: 'machu picchu',
    ko: '마추픽추'
  },
  '사그라다파밀리아': {
    en: 'sagrada familia',
    ja: 'サグラダファミリア',
    zh: '圣家堂',
    es: 'sagrada familia',
    ko: '사그라다파밀리아'
  },
  '루브르박물관': {
    en: 'louvre museum',
    ja: 'ルーヴル美術館',
    zh: '卢浮宫',
    es: 'museo del louvre',
    ko: '루브르박물관'
  },
  '빅벤': {
    en: 'big ben',
    ja: 'ビッグベン',
    zh: '大本钟',
    es: 'big ben',
    ko: '빅벤'
  }
};

/**
 * 입력된 지명을 정규화하여 매핑 테이블에서 검색
 */
function normalizeForMapping(location: string): string {
  return location
    .toLowerCase()
    .trim()
    .replace(/[^\w\s가-힣\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff]/g, '') // 특수문자 제거
    .replace(/\s+/g, ' '); // 공백 정규화
}

/**
 * 다국어 지명을 한국어 지명으로 매핑
 */
export function mapLocationToKorean(location: string): string | null {
  const normalized = normalizeForMapping(location);
  
  // 직접 매핑 테이블에서 검색
  for (const [koreanName, translations] of Object.entries(LOCATION_MAPPINGS)) {
    for (const [lang, translation] of Object.entries(translations)) {
      if (normalizeForMapping(translation) === normalized) {
        console.log(`🗺️ 지명 매핑: ${location} (${lang}) → ${koreanName}`);
        return koreanName;
      }
    }
  }
  
  // 부분 매칭 시도 (키워드 기반) - 정확한 단어 매칭만
  const keywords = normalized.split(' ');
  for (const [koreanName, translations] of Object.entries(LOCATION_MAPPINGS)) {
    for (const [lang, translation] of Object.entries(translations)) {
      const translationKeywords = normalizeForMapping(translation).split(' ');
      
      // 정확한 단어 매칭만 허용 (부분 문자열 매칭 제거)
      const exactMatchCount = keywords.filter(keyword => 
        translationKeywords.includes(keyword)
      ).length;
      
      // 모든 키워드가 정확히 매칭되어야 함
      if (exactMatchCount === keywords.length && keywords.length > 0) {
        console.log(`🗺️ 부분 매핑: ${location} (${lang}) → ${koreanName} (매칭률: ${exactMatchCount}/${keywords.length})`);
        return koreanName;
      }
    }
  }
  
  return null;
}

/**
 * 한국어 지명에 대한 다국어 URL 생성
 */
export function generateMultilingualUrls(koreanLocation: string, baseUrl: string): Record<string, string> {
  const mapping = LOCATION_MAPPINGS[koreanLocation];
  if (!mapping) {
    return {};
  }
  
  const urls: Record<string, string> = {};
  for (const [lang, translation] of Object.entries(mapping)) {
    if (lang !== 'ko') {
      urls[lang] = `${baseUrl}/guide/${encodeURIComponent(translation)}?lang=${lang}`;
    }
  }
  
  return urls;
}

/**
 * 지명 추천 시스템 (404 에러 시 사용)
 */
export function suggestSimilarLocations(location: string): string[] {
  const normalized = normalizeForMapping(location);
  const suggestions: Array<{name: string, score: number}> = [];
  
  for (const [koreanName, translations] of Object.entries(LOCATION_MAPPINGS)) {
    let bestScore = 0;
    
    for (const translation of Object.values(translations)) {
      const score = calculateSimilarity(normalized, normalizeForMapping(translation));
      bestScore = Math.max(bestScore, score);
    }
    
    if (bestScore > 0.3) { // 30% 이상 유사도
      suggestions.push({name: koreanName, score: bestScore});
    }
  }
  
  return suggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(s => s.name);
}

/**
 * 한국어 지명을 다국어로 번역
 * 언어 전환 시 URL 업데이트에 사용
 */
export function translateLocationFromKorean(koreanLocation: string, targetLang: string): string | null {
  // 한국어 지명 정규화
  const normalizedKorean = normalizeForMapping(koreanLocation);
  
  // LOCATION_MAPPINGS를 순회하며 한국어 지명 찾기
  for (const [key, translations] of Object.entries(LOCATION_MAPPINGS)) {
    const koreanName = translations.ko || key;
    
    if (normalizeForMapping(koreanName) === normalizedKorean) {
      // 한국어 지명을 찾았으면 대상 언어로 번역
      const translatedName = translations[targetLang];
      if (translatedName) {
        console.log(`🌐 지명 번역: ${koreanLocation} (ko) → ${translatedName} (${targetLang})`);
        return translatedName;
      } else {
        console.log(`⚠️ ${targetLang} 번역 없음: ${koreanLocation}`);
        return null;
      }
    }
  }
  
  console.log(`⚠️ 매핑 테이블에 없는 지명: ${koreanLocation}`);
  return null;
}

/**
 * 문자열 유사도 계산 (Levenshtein distance 기반)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j - 1][i] + 1,     // deletion
        matrix[j][i - 1] + 1,     // insertion
        matrix[j - 1][i - 1] + cost // substitution
      );
    }
  }
  
  const maxLength = Math.max(str1.length, str2.length);
  return maxLength === 0 ? 1 : (maxLength - matrix[str2.length][str1.length]) / maxLength;
}