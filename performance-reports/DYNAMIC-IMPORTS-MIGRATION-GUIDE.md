# 🚀 동적 임포트 마이그레이션 가이드

**생성 날짜:** 2025-10-26
**목표:** 번들 크기 ~170KB 감소, 초기 로드 150-200ms 개선
**난이도:** 낮음
**소요 시간:** 2-3시간

---

## 📋 개요

동적 임포트(Dynamic Imports)는 번들에 포함된 코드를 여러 개의 작은 청크로 분할하여 필요할 때만 로드합니다.

```
Before: 500KB 초기 번들
After:  330KB 초기 번들 + 170KB lazy chunks
결과:   초기 로드 200ms 단축
```

---

## 🎯 대상 컴포넌트

### Tier 1 - 필수 (높은 영향도)

```typescript
// 1. NotebookLMPodcastPlayer (995 lines, 40KB)
//    위치: src/components/audio/NotebookLMPodcastPlayer.tsx
//    사용: 가이드 페이지 하단
❌ import { NotebookLMPodcastPlayer } from '@/components/audio/NotebookLMPodcastPlayer'
✅ import { NotebookLMPodcastPlayer } from '@/lib/dynamic-components'

// 2. MapWithRoute (403 lines, 35KB + Leaflet)
//    위치: src/components/guide/MapWithRoute.tsx
//    사용: 가이드 페이지 지도 섹션
❌ import { MapWithRoute } from '@/components/guide/MapWithRoute'
✅ import { MapWithRoute } from '@/lib/dynamic-components'

// 3. NextLevelSearchBox (971 lines, 30KB)
//    위치: src/components/home/NextLevelSearchBox.tsx
//    사용: 홈페이지
❌ import { NextLevelSearchBox } from '@/components/home/NextLevelSearchBox'
✅ import { NextLevelSearchBox } from '@/lib/dynamic-components'

// 4. LiveLocationTracker (463 lines, 25KB)
//    위치: src/components/location/LiveLocationTracker.tsx
❌ import { LiveLocationTracker } from '@/components/location/LiveLocationTracker'
✅ import { LiveLocationTracker } from '@/lib/dynamic-components'
```

### Tier 2 - 권장 (중간 영향도)

```typescript
// 5. ChapterBasedPodcastGenerator (893 lines)
// 6. LiveAudioPlayer (731 lines)
// 7. AdvancedAudioPlayer (466 lines)
// 8. RegionTouristMap (308 lines)
```

### Tier 3 - 선택사항 (낮은 영향도)

```typescript
// 9. ErrorModal, LocationAmbiguityDialog (modals)
// 10. QualityFeedback
// 11. HistorySidebar
```

---

## 🔧 마이그레이션 프로세스

### Step 1: 확인사항

```bash
# 동적 컴포넌트 파일 확인
cat src/lib/dynamic-components.ts

# 현재 임포트 위치 확인
grep -r "from '@/components/audio/NotebookLMPodcastPlayer'" app/ src/
```

### Step 2: 임포트 변경

**변경 전:**
```tsx
// app/guide/[language]/[location]/page.tsx
import { NotebookLMPodcastPlayer } from '@/components/audio/NotebookLMPodcastPlayer'

export default function GuidePage() {
  return (
    <div>
      <h1>가이드</h1>
      <NotebookLMPodcastPlayer episodeId={...} />
    </div>
  )
}
```

**변경 후:**
```tsx
// app/guide/[language]/[location]/page.tsx
import { NotebookLMPodcastPlayer } from '@/lib/dynamic-components'
// 나머지는 동일하게 사용 가능!

export default function GuidePage() {
  return (
    <div>
      <h1>가이드</h1>
      <NotebookLMPodcastPlayer episodeId={...} />  // ← 변경 없음
    </div>
  )
}
```

### Step 3: Props 타입 유지

동적 임포트를 사용해도 TypeScript 타입은 정상 작동합니다:

```tsx
import { NotebookLMPodcastPlayer } from '@/lib/dynamic-components'

// Props 타입 자동 추론 됨 ✅
<NotebookLMPodcastPlayer
  episodeId="abc123"  // ← intellisense 작동
  onPlay={() => {}}   // ← 타입 체크 됨
/>
```

### Step 4: SSR 고려사항

동적 컴포넌트는 SSR 여부가 미리 설정되어 있습니다:

```typescript
// SSR 가능한 컴포넌트 (ssr: true)
- NextLevelSearchBox
- RegionalSearchBox
- LocationAmbiguityDialog
- ErrorModal
- HistorySidebar

// SSR 불가능한 컴포넌트 (ssr: false) - 클라이언트에서만 로드
- NotebookLMPodcastPlayer
- MapWithRoute
- LiveLocationTracker
- ChapterBasedPodcastGenerator
- LiveAudioPlayer
- 기타 오디오 플레이어
```

---

## 📊 파일별 마이그레이션 체크리스트

### 1️⃣ 가이드 페이지 (app/guide/[language]/[location]/page.tsx)

```tsx
// ❌ 현재 임포트
import { NotebookLMPodcastPlayer } from '@/components/audio/NotebookLMPodcastPlayer'
import { MapWithRoute } from '@/components/guide/MapWithRoute'

// ✅ 변경 후
import { NotebookLMPodcastPlayer, MapWithRoute } from '@/lib/dynamic-components'

// 체크리스트
- [ ] NotebookLMPodcastPlayer 변경
- [ ] MapWithRoute 변경
- [ ] 다른 오디오 플레이어 변경
- [ ] 테스트: npm run dev
```

### 2️⃣ 팟캐스트 페이지 (app/podcast/[language]/[location]/page.tsx)

```tsx
// ✅ 변경 대상
- NotebookLMPodcastPlayer
- ChapterBasedPodcastGenerator
- ChapterAudioPlayer
```

### 3️⃣ 홈페이지 (app/page.tsx)

```tsx
// ✅ 변경 대상
- NextLevelSearchBox
```

### 4️⃣ 컴포넌트 파일들

```
- GuideClient.tsx
- MultiLangGuideClient.tsx
- Header.tsx (검토 후 필요시)
- 기타 레이아웃 컴포넌트
```

---

## ✅ 검증 방법

### 1. 번들 분석

```bash
# 번들 크기 확인
npm run build

# 크기 비교
Before: app/.next/static/chunks/main-*.js (~500KB)
After:  app/.next/static/chunks/main-*.js (~330KB)
        app/.next/static/chunks/_*.js (새로운 청크들)
```

### 2. 성능 측정

```bash
# 개발 환경에서 성능 확인
npm run dev

# Lighthouse 점수 확인
npm run test:performance

# 예상 개선
LCP: -50ms
TTI: -100ms
Overall Score: +5-10 points
```

### 3. 기능 테스트

```bash
# 로컬 개발 서버 시작
npm run dev

# 각 페이지 방문
1. 홈페이지 로드 확인
2. 가이드 페이지 로드 확인
3. 팟캐스트 페이지 로드 확인
4. 맵 표시 확인
5. 오디오 플레이어 작동 확인
6. 모바일 반응형 확인
```

---

## 🐛 문제 해결

### 문제 1: 컴포넌트가 렌더링되지 않음

```tsx
// ❌ 잘못된 사용
if (showComponent) {
  return <NotebookLMPodcastPlayer />  // 동적 import는 조건부 렌더링 불가
}

// ✅ 올바른 사용
return showComponent ? <NotebookLMPodcastPlayer /> : null
// 또는
return <NotebookLMPodcastPlayer />  // 항상 표시
```

### 문제 2: TypeScript 에러

```tsx
// ❌ 불완전한 import
import * as DynamicComponents from '@/lib/dynamic-components'
<DynamicComponents.MapWithRoute />  // 타입 추론 안됨

// ✅ 올바른 import
import { MapWithRoute } from '@/lib/dynamic-components'
<MapWithRoute />  // 타입 추론 됨
```

### 문제 3: 로딩 상태가 너무 오래 표시됨

```tsx
// src/lib/dynamic-components.ts 수정
export const MapWithRoute = dynamic(
  () => import('@/components/guide/MapWithRoute'),
  {
    loading: () => <MapLoadingPlaceholder />,
    ssr: false,
  }
)

// 더 빠른 로딩을 원하면:
export const MapWithRoute = dynamic(
  () => import('@/components/guide/MapWithRoute').then(mod => mod),
  {
    loading: () => null,  // 로딩 UI 제거
    ssr: false,
  }
)
```

---

## 📈 성능 개선 예상값

### 번들 크기 감소

| 항목 | 크기 | 영향 |
|------|------|------|
| NotebookLMPodcastPlayer | -40KB | 매우 높음 |
| MapWithRoute | -35KB | 매우 높음 |
| NextLevelSearchBox | -30KB | 높음 |
| LiveLocationTracker | -25KB | 높음 |
| 기타 컴포넌트 | -40KB | 중간 |
| **총합** | **-170KB** | **초기 로드 200ms 개선** |

### Lighthouse 점수 개선

```
Performance:
Before: 75점 (7.5초 로드)
After:  80점 (7.3초 로드)
개선:   +5점, -200ms

LCP (Largest Contentful Paint):
Before: 2.8초
After:  2.6초 (-200ms)

TTI (Time to Interactive):
Before: 5.2초
After:  4.9초 (-300ms)
```

---

## 🔄 마이그레이션 순서

### Phase 1: 우선순위 HIGH (지금)
1. NotebookLMPodcastPlayer → 1시간
2. MapWithRoute → 1시간
3. NextLevelSearchBox → 30분

### Phase 2: 우선순위 MEDIUM (다음)
1. ChapterBasedPodcastGenerator → 1시간
2. LiveLocationTracker → 1시간
3. 기타 오디오 플레이어들 → 1시간

### Phase 3: 우선순위 LOW (선택)
1. 모달 컴포넌트 → 30분
2. 사이드바 → 30분

**예상 총 시간:** 2-3시간 (Phase 1)

---

## 💻 자동화 (선택사항)

### 전체 파일에서 임포트 변경

```bash
# NotebookLMPodcastPlayer 변경
find app/ src/ -name "*.tsx" -exec sed -i "s|from '@/components/audio/NotebookLMPodcastPlayer'|from '@/lib/dynamic-components'|g" {} \;

# MapWithRoute 변경
find app/ src/ -name "*.tsx" -exec sed -i "s|from '@/components/guide/MapWithRoute'|from '@/lib/dynamic-components'|g" {} \;

# 확인
git diff
```

### 검증 스크립트

```bash
#!/bin/bash
# scripts/verify-dynamic-imports.sh

echo "검증: 구식 임포트 제거됨..."
OLD_IMPORTS=(
  "@/components/audio/NotebookLMPodcastPlayer"
  "@/components/guide/MapWithRoute"
  "@/components/home/NextLevelSearchBox"
)

for import in "${OLD_IMPORTS[@]}"; do
  if grep -r "from '$import'" app/ src/ > /dev/null; then
    echo "❌ 발견: $import"
  else
    echo "✅ OK: $import"
  fi
done
```

---

## 📝 PR 체크리스트

배포 전 확인사항:

- [ ] 모든 대상 파일의 임포트 변경 완료
- [ ] TypeScript 타입 에러 없음 (`npm run type-check`)
- [ ] 로컬 개발 환경에서 모든 기능 정상 작동
- [ ] 번들 크기 감소 확인 (`npm run build`)
- [ ] Lighthouse 점수 개선 확인
- [ ] 모바일 반응형 확인
- [ ] 네트워크 느린 환경에서 로딩 UI 확인
- [ ] Cross-browser 테스트 (Chrome, Firefox, Safari)

---

## 🎓 참고자료

- **Next.js 동적 임포트**: https://nextjs.org/docs/advanced-features/dynamic-import
- **웹팩 코드 분할**: https://webpack.js.org/guides/code-splitting/
- **Performance Best Practices**: https://nextjs.org/learn/foundations/performance
- **번들 분석기**: https://github.com/vercel/next.js/tree/canary/packages/next-bundle-analyzer

---

## 📞 도움말

문제 발생 시:

1. **번들 분석** → `ANALYZE=true npm run build`
2. **컴포넌트 테스트** → `npm run dev` → 개발자 도구
3. **성능 측정** → Chrome DevTools → Lighthouse
4. **디버깅** → `console.log()` → 네트워크 탭 확인

---

**상태:** Week 2 - Task 2-1-2 진행 중
**다음 단계:** 이미지 최적화 (Task 2-2)
**예상 완료:** 2025-10-30
