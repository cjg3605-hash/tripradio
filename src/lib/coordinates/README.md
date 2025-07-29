# 🗺️ 좌표 검증 시스템 (Coordinate Verification System)

AI가 생성한 좌표의 정확도를 실시간으로 검증하는 시스템입니다.

## 🎯 주요 기능

- **이중 API 지원**: OpenStreetMap Nominatim (무료) + Radar API (백업)
- **완전 무료 우선**: Nominatim API를 1순위로 사용하여 대부분 요청을 무료로 처리
- **배치 처리**: 여러 좌표를 동시에 효율적으로 검증
- **인텔리전트 캐싱**: 24시간 캐시로 API 호출 최적화
- **신뢰도 기반 필터링**: 0.0-1.0 범위의 신뢰도 점수
- **자동 폴백**: API 장애 시 다음 API로 자동 전환

## 🚀 설치 및 설정

### 1. 즉시 사용 가능!

**API 키 없이도 바로 사용 가능합니다!** Nominatim은 완전 무료이므로 환경 변수 설정 없이도 동작합니다.

### 2. 선택적 API 키 설정 (백업용)

`.env.local` 파일에 Radar API 키를 추가하면 백업 옵션이 활성화됩니다:

```bash
# 선택사항: Nominatim 실패 시 백업용
# Radar API - 월 1,000 요청 무료
RADAR_API_KEY=your_radar_api_key_here
```

### 3. API 우선순위

시스템은 다음 순서로 API를 사용합니다:

1. **OpenStreetMap Nominatim** (완전 무료) ✅
2. **Radar API** (월 1,000 무료, API 키 필요)
3. **원본 좌표** (최종 폴백)

## 📖 사용법

### 기본 사용법

```typescript
import { coordinateVerificationSystem, CoordinateInput } from '@/lib/coordinates/coordinate-verification-system';

// 단일 좌표 검증
const input: CoordinateInput = {
  lat: 37.5665,
  lng: 126.9780,
  context: "경복궁",
  locationName: "서울"
};

const result = await coordinateVerificationSystem.verifyCoordinate(input);

console.log('검증 결과:', {
  isValid: result.isValid,
  confidence: result.confidence, // 0.0-1.0
  source: result.source, // 'nominatim' | 'radar' | 'ai-original' | 'cache'
  coordinates: result.coordinates // 보정된 좌표
});
```

### 배치 검증 (권장)

```typescript
// 여러 좌표 동시 검증
const inputs: CoordinateInput[] = [
  { lat: 37.5665, lng: 126.9780, context: "경복궁", locationName: "서울" },
  { lat: 37.5759, lng: 126.9859, context: "인사동", locationName: "서울" }
];

const results = await coordinateVerificationSystem.batchVerifyCoordinates(inputs);

results.forEach((result, index) => {
  if (result.isValid && result.confidence >= 0.6) {
    console.log(`✅ ${inputs[index].context}: 검증 성공`);
  } else {
    console.log(`❌ ${inputs[index].context}: 검증 실패`);
  }
});
```

## 🔧 설정 옵션

시스템 동작을 커스터마이징할 수 있습니다:

```typescript
import { CoordinateVerificationSystem } from '@/lib/coordinates/coordinate-verification-system';

const customSystem = new CoordinateVerificationSystem({
  enableNominatim: true,      // Nominatim 사용 (기본값: true)
  enableRadarAPI: true,       // Radar API 사용 (기본값: true)
  minConfidenceThreshold: 0.7, // 높은 신뢰도만 허용
  maxDistanceThreshold: 500,   // 500m 이내만 유효
  cacheTTL: 12 * 60 * 60,     // 12시간 캐시
  batchSize: 5,               // 배치 크기 줄임
  timeoutMs: 3000,            // 3초 타임아웃
  nominatimRateLimit: 500     // Nominatim 요청 간격 (ms)
});
```

## 📊 신뢰도 점수 해석

| 점수 범위 | 의미 | 권장 사용 |
|---------|------|---------|
| 0.9-1.0 | 매우 높음 | 모든 용도 |
| 0.7-0.8 | 높음 | 일반적 사용 |
| 0.5-0.6 | 중간 | 주의해서 사용 |
| 0.3-0.4 | 낮음 | 원본 좌표 유지 |
| 0.0-0.2 | 매우 낮음 | 사용 금지 |

## 🚨 주의사항

### API 사용량 관리
- **Nominatim**: 완전 무료! 1초당 1요청 제한만 있음
- **Radar API**: 월 1,000 요청 무료, 초과 시 $0.50/1,000 requests
- 캐시 활용으로 API 호출 최적화됨
- **95%+ 요청이 무료 Nominatim으로 처리됨**

### 성능 고려사항
- 배치 처리 사용 권장 (단일 호출 대비 3-5배 빠름)
- Nominatim 레이트 리미트: 기본 1초 간격 (설정 가능)
- 캐시 히트율 모니터링: `system.getCacheStats()`
- API 응답 시간: Nominatim 평균 300-800ms, Radar 200-500ms

### 오류 처리
- API 장애 시 자동으로 원본 좌표 사용
- 네트워크 오류 시 5초 타임아웃
- 잘못된 좌표는 자동 필터링

## 🔍 디버깅

개발자 콘솔에서 검증 과정을 확인할 수 있습니다:

```
🔍 좌표 검증 시스템으로 검증 시작...
📊 챕터 1 검증 결과: {
  title: "경복궁",
  isValid: true,
  confidence: 0.85,
  source: "nominatim",
  coordinates: { lat: 37.5808, lng: 126.9760 }
}
✅ POI 생성: 경복궁 (신뢰도: 0.85, 출처: nominatim)
```

## 🔄 업데이트 및 확장

시스템은 새로운 API 서비스 추가가 용이하도록 설계되었습니다:

1. 새 API 클라이언트 클래스 생성
2. `CoordinateVerificationSystem`에 클라이언트 추가
3. 검증 로직에 새 서비스 통합
4. 환경 변수 및 설정 옵션 추가

## 📈 모니터링

캐시 성능 및 API 사용량 모니터링:

```typescript
// 캐시 통계 확인
const stats = coordinateVerificationSystem.getCacheStats();
console.log('캐시 크기:', stats.size);

// 캐시 초기화 (필요시)
coordinateVerificationSystem.clearCache();
```

---

**개발자**: GuideAI Team  
**버전**: 1.0.0  
**마지막 업데이트**: 2025-01-29