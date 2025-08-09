# 🔍 분석가 페르소나 - 가이드 라우팅 시스템 전체 분석 보고서

## 📊 현재 라우팅 플로우 분석

### 1️⃣ 검색/클릭 시작점
**위치**: `src/app/page.tsx:686`
```typescript
// 검색 실행 함수
const handleSearch = useCallback(async () => {
  if (!query.trim() || !isMountedRef.current) return;
  
  setCurrentLoadingQuery(query.trim());
  setLoadingState('search', true);
  try {
    // ✅ 현재 라우팅: /guide/[장소명]?lang=[언어코드]
    router.push(`/guide/${encodeURIComponent(query.trim())}?lang=${currentLanguage}`);
  } catch (error) {
    console.error('Search error:', error);
  }
}, [query, router, setLoadingState]);
```

### 2️⃣ 가이드 페이지 진입점
**위치**: `src/app/guide/[location]/page.tsx:42-98`

**URL 패턴**: `/guide/[location]?lang=[language]`
**예시**: `/guide/감천문화마을?lang=ko`

**매개변수 처리**:
```typescript
interface PageProps {
  params: Promise<{ location: string }>;
  searchParams?: Promise<{ lang?: string }>;
}

// 1. URL에서 장소명과 언어 추출
const locationName = decodeURIComponent(resolvedParams.location || '');
const requestedLang = safeLanguageCode(resolvedSearchParams?.lang);

// 2. 위치명 정규화
const normLocation = normalizeLocationName(locationName);

// 3. 서버사이드 DB 조회
const { data, error } = await supabase
  .from('guides')
  .select('content')
  .eq('locationname', normLocation)      // 🔥 핵심: 정규화된 위치명으로 조회
  .eq('language', serverDetectedLanguage.toLowerCase())
  .maybeSingle();
```

### 3️⃣ 클라이언트사이드 처리
**위치**: `src/app/guide/[location]/MultiLangGuideClient.tsx`

**DB 조회 로직**: `src/lib/multilang-guide-manager.ts:21-38`
```typescript
static async getGuideByLanguage(locationName: string, language: string) {
  // 🔥 동일한 정규화 함수 사용
  const normalizedLocation = normalizeLocationName(locationName);
  
  const { data, error } = await supabase
    .from('guides')
    .select('*')
    .eq('locationname', normalizedLocation)
    .eq('language', language.toLowerCase())
    .single();
}
```

## 🎯 핵심 문제점 식별

### ❌ 문제 1: 사이트맵과 실제 라우팅 불일치

**사이트맵 생성**: `src/app/sitemap.ts:21-24`
```typescript
// 사이트맵에서 URL 생성
const guides = data?.map(item => ({
  name: item.locationname,
  slug: encodeURIComponent(item.locationname)  // 🔥 인코딩된 슬러그 생성
})) || [];

// 결과: /guide/감천문화마을 → /guide/%EA%B0%90%EC%B2%9C%EB%AC%B8%ED%99%94%EB%A7%88%EC%9D%84
```

**실제 페이지 처리**: `src/app/guide/[location]/page.tsx:45-51`
```typescript
// 페이지에서는 디코딩 후 정규화 처리
const locationName = decodeURIComponent(resolvedParams.location || '');
const normLocation = normalizeLocationName(locationName);
```

### ❌ 문제 2: normalizeLocationName 함수의 영향

**정규화 로직**: `src/lib/utils.ts` (추정)
- 공백 처리, 특수문자 처리, 대소문자 통일 등의 정규화
- 사이트맵의 원본 데이터와 정규화된 데이터 간의 불일치 가능성

### ❌ 문제 3: DB 데이터와 URL 매칭 실패

**DB 저장 형태**: `locationname` 컬럼에 저장된 실제 값
**URL 전달 형태**: 사용자 입력 → 인코딩 → 디코딩 → 정규화
**매칭 실패**: 중간 과정에서 데이터 변환으로 인한 불일치

## 🔍 JSON 응답 구조 분석

### DB 저장 구조
```json
{
  "locationname": "감천문화마을",
  "language": "ko",
  "content": {
    "overview": { ... },
    "route": { ... },
    "realTimeGuide": { ... }
  }
}
```

### 클라이언트 기대 구조
```typescript
interface GuideData {
  overview: {
    title: string;
    location: string;
    keyFeatures: string;
    // ...
  };
  route: { ... };
  realTimeGuide: { ... };
}
```

## 🎯 라우팅 문제 원인 분석

1. **사이트맵 URL 생성**: DB의 `locationname` 값을 `encodeURIComponent()`로 인코딩
2. **페이지 접근**: 인코딩된 URL → `decodeURIComponent()` → `normalizeLocationName()`
3. **DB 조회**: 정규화된 이름으로 조회하지만 DB의 실제 저장값과 불일치
4. **결과**: 가이드를 찾을 수 없음 → 클라이언트에서 새로 생성 시도

## ✅ 해결 방안

### 방안 1: 사이트맵 생성 시 정규화 적용
```typescript
// src/app/sitemap.ts 수정
const guides = data?.map(item => ({
  name: item.locationname,
  slug: encodeURIComponent(normalizeLocationName(item.locationname))
})) || [];
```

### 방안 2: DB 조회 시 원본명도 함께 시도
```typescript
// 정규화된 이름으로 먼저 조회, 실패 시 원본명으로 재시도
```

### 방안 3: DB에 정규화된 이름을 별도 컬럼으로 추가
```sql
ALTER TABLE guides ADD COLUMN normalized_locationname TEXT;
UPDATE guides SET normalized_locationname = normalize(locationname);
```

## 📝 매칭 테이블

| 단계 | 입력값 | 처리 함수 | 출력값 | 위치 |
|------|--------|-----------|---------|------|
| 1. 검색/클릭 | "감천문화마을" | `encodeURIComponent()` | "%EA%B0%90%EC%B2%9C%EB%AC%B8%ED%99%94%EB%A7%88%EC%9D%84" | page.tsx:686 |
| 2. URL 파라미터 | "%EA%B0%90%EC%B2%9C%EB%AC%B8%ED%99%94%EB%A7%88%EC%9D%84" | `decodeURIComponent()` | "감천문화마을" | [location]/page.tsx:45 |
| 3. 정규화 | "감천문화마을" | `normalizeLocationName()` | "감천문화마을" (정규화됨) | [location]/page.tsx:51 |
| 4. DB 조회 | "감천문화마을" (정규화됨) | Supabase Query | 결과 없음? | [location]/page.tsx:82-87 |

## 🎯 즉시 해결해야 할 항목

1. **normalizeLocationName() 함수 확인**: 어떤 정규화를 수행하는지 확인
2. **DB 실제 데이터 확인**: 저장된 locationname 값들과 정규화된 값 비교
3. **사이트맵 URL과 실제 DB 매칭 테스트**: 사이트맵의 각 URL이 실제로 가이드를 찾을 수 있는지 확인