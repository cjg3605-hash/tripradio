// 자동완성 데이터 SessionStorage 관리 유틸리티
// 엔터키 입력시 자동완성 결과를 가이드 페이지로 완전 전달하기 위한 시스템

interface AutocompleteData {
  name: string;           // 장소명
  location: string;       // "도시, 국가" 형태의 원본 위치 정보
  region: string;         // 파싱된 지역명 (예: "부산")
  country: string;        // 파싱된 국가명 (예: "대한민국")
  countryCode?: string;   // 국가코드 (예: "KOR")
  type: 'location' | 'attraction';
  confidence: number;     // 신뢰도 점수
  timestamp: number;      // 저장 시각
}

// 클라이언트 환경 확인
const isClientSide = (): boolean => {
  return typeof window !== 'undefined' && typeof sessionStorage !== 'undefined';
};

// SessionStorage 키 생성
const getStorageKey = (locationName: string): string => {
  return `autocomplete_data_${encodeURIComponent(locationName.trim().toLowerCase())}`;
};

/**
 * 자동완성 데이터를 SessionStorage에 저장
 * @param locationName 장소명
 * @param data 자동완성 API에서 받은 데이터
 * @param parsedInfo 파싱된 지역/국가 정보
 */
export const saveAutocompleteData = (
  locationName: string,
  data: any,
  parsedInfo: {
    region: string;
    country: string;
    countryCode?: string;
  }
): boolean => {
  if (!isClientSide()) {
    console.warn('⚠️ SessionStorage를 사용할 수 없는 환경입니다.');
    return false;
  }

  try {
    const autocompleteData: AutocompleteData = {
      name: data.name || locationName,
      location: data.location || '',
      region: parsedInfo.region,
      country: parsedInfo.country,
      countryCode: parsedInfo.countryCode,
      type: data.type || 'attraction',
      confidence: data.confidence || 0.9,
      timestamp: Date.now()
    };

    const storageKey = getStorageKey(locationName);
    sessionStorage.setItem(storageKey, JSON.stringify(autocompleteData));

    console.log('✅ 자동완성 데이터 SessionStorage 저장 완료:', {
      key: storageKey,
      data: autocompleteData
    });

    return true;
  } catch (error) {
    console.error('❌ SessionStorage 저장 실패:', error);
    return false;
  }
};

/**
 * SessionStorage에서 자동완성 데이터 읽기
 * @param locationName 장소명
 * @param removeAfterRead 읽은 후 삭제할지 여부 (기본값: true)
 */
export const getAutocompleteData = (
  locationName: string,
  removeAfterRead: boolean = true
): AutocompleteData | null => {
  if (!isClientSide()) {
    console.warn('⚠️ SessionStorage를 사용할 수 없는 환경입니다.');
    return null;
  }

  try {
    const storageKey = getStorageKey(locationName);
    const stored = sessionStorage.getItem(storageKey);

    if (!stored) {
      console.log('📭 SessionStorage에 자동완성 데이터 없음:', storageKey);
      return null;
    }

    const data: AutocompleteData = JSON.parse(stored);

    // 5분 이상 된 데이터는 무효 처리
    const MAX_AGE = 5 * 60 * 1000; // 5분
    if (Date.now() - data.timestamp > MAX_AGE) {
      console.warn('⏰ 자동완성 데이터가 만료되었습니다:', data.timestamp);
      sessionStorage.removeItem(storageKey);
      return null;
    }

    // 읽은 후 삭제 (일회성 사용)
    if (removeAfterRead) {
      sessionStorage.removeItem(storageKey);
      console.log('🗑️ 자동완성 데이터 사용 후 삭제:', storageKey);
    }

    console.log('✅ SessionStorage에서 자동완성 데이터 로드:', data);
    return data;

  } catch (error) {
    console.error('❌ SessionStorage 읽기 실패:', error);
    return null;
  }
};

/**
 * 특정 장소의 자동완성 데이터 삭제
 * @param locationName 장소명
 */
export const removeAutocompleteData = (locationName: string): boolean => {
  if (!isClientSide()) return false;

  try {
    const storageKey = getStorageKey(locationName);
    sessionStorage.removeItem(storageKey);
    console.log('🗑️ 자동완성 데이터 삭제:', storageKey);
    return true;
  } catch (error) {
    console.error('❌ SessionStorage 삭제 실패:', error);
    return false;
  }
};

/**
 * 모든 자동완성 데이터 정리 (메모리 관리)
 */
export const cleanupAutocompleteData = (): number => {
  if (!isClientSide()) return 0;

  let cleanupCount = 0;

  try {
    const keysToRemove: string[] = [];

    // 자동완성 관련 키들 찾기
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('autocomplete_data_')) {
        keysToRemove.push(key);
      }
    }

    // 정리 실행
    keysToRemove.forEach(key => {
      sessionStorage.removeItem(key);
      cleanupCount++;
    });

    if (cleanupCount > 0) {
      console.log(`🧹 자동완성 데이터 정리 완료: ${cleanupCount}개 항목 삭제`);
    }

    return cleanupCount;
  } catch (error) {
    console.error('❌ SessionStorage 정리 실패:', error);
    return 0;
  }
};

/**
 * 자동완성 데이터 존재 여부 확인
 * @param locationName 장소명
 */
export const hasAutocompleteData = (locationName: string): boolean => {
  if (!isClientSide()) return false;

  try {
    const storageKey = getStorageKey(locationName);
    return sessionStorage.getItem(storageKey) !== null;
  } catch (error) {
    console.error('❌ SessionStorage 확인 실패:', error);
    return false;
  }
};

/**
 * SessionStorage 상태 정보 조회 (디버깅용)
 */
export const getAutocompleteStorageInfo = (): {
  count: number;
  keys: string[];
  totalSize: number;
} => {
  if (!isClientSide()) {
    return { count: 0, keys: [], totalSize: 0 };
  }

  try {
    const keys: string[] = [];
    let totalSize = 0;

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('autocomplete_data_')) {
        keys.push(key);
        const value = sessionStorage.getItem(key);
        if (value) {
          totalSize += key.length + value.length;
        }
      }
    }

    return {
      count: keys.length,
      keys,
      totalSize
    };
  } catch (error) {
    console.error('❌ SessionStorage 정보 조회 실패:', error);
    return { count: 0, keys: [], totalSize: 0 };
  }
};