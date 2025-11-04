# 🖼️ Task 2-2: 이미지 최적화 구현

**작업 날짜:** 2025-10-26
**상태:** 🔄 진행 중 (구현 단계)
**예상 완료:** 2.5시간
**담당 페르소나:** Frontend + Performance

---

## 📋 실행 계획

### Task 2-2-1: Next.js Image 컴포넌트 도입 (1시간)

#### 1단계: 이미지 파일 스캔

```bash
# 프로젝트의 모든 이미지 파일 찾기
find /c/GUIDEAI/app /c/GUIDEAI/src /c/GUIDEAI/public -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.webp" -o -name "*.svg" \) | grep -v node_modules | head -50
```

**예상 이미지 파일 위치:**
- `/public/images/landmarks/` - 가이드/팟캐스트 이미지
- `/public/og-image.svg` - 소셜 미디어 이미지
- `/public/*.png` - 아이콘 및 로고
- 기타 인라인 이미지

#### 2단계: next.config.js 이미지 최적화 설정

현재 설정 확인:
```javascript
// 이미 최적화되어 있음:
images: {
  unoptimized: false,
  formats: ['image/avif', 'image/webp'],
  minimumCacheTTL: 60 * 60 * 24 * 30, // 30일
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
}
```

✅ 이미 최적화되어 있음!

#### 3단계: Image 컴포넌트 마이그레이션 대상 파일

| 파일 | 이미지 개수 | 우선순위 | 상태 |
|------|-----------|---------|------|
| app/page.tsx (홈) | 5+ | HIGH | ⏳ |
| app/guide/[language]/[location]/page.tsx | 10+ | HIGH | ⏳ |
| app/podcast/[language]/[location]/page.tsx | 5+ | HIGH | ⏳ |
| app/regions/* | 3+ | MED | ⏳ |

#### 4단계: 이미지 로딩 전략

```typescript
// 변경 전 (기본 img 태그)
<img
  src="/images/landmarks/eiffel-tower.webp"
  alt="Eiffel Tower"
  style={{ width: '100%', height: 'auto' }}
/>

// 변경 후 (Next.js Image)
import Image from 'next/image'

<Image
  src="/images/landmarks/eiffel-tower.webp"
  alt="Eiffel Tower"
  width={800}
  height={600}
  quality={80}  // 80% quality = 50% 파일 크기 감소
  priority={isAboveFold}  // Above-the-fold 이미지만 priority
  loading={isAboveFold ? undefined : "lazy"}  // 나머지는 lazy loading
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"  // 반응형 크기
/>
```

---

### Task 2-2-2: WebP 자동 변환 (30분)

#### 현재 상태
```
✅ next.config.js에서 이미 설정됨:
formats: ['image/avif', 'image/webp']
```

자동 변환이 이미 활성화되어 있습니다!

#### 확인 방법
```bash
# 빌드 후 .next 디렉토리에서 WebP 파일 확인
ls -la .next/static/image-optimization/*
```

---

### Task 2-2-3: Responsive 이미지 설정 (1시간)

#### Responsive 크기 최적화

```typescript
// 예: 가이드 헤더 이미지
<Image
  src={guidImage}
  alt="Guide cover"
  width={1200}
  height={400}
  sizes="
    (max-width: 640px) 100vw,
    (max-width: 1024px) 90vw,
    1200px
  "
  quality={85}
  priority  // 헤더는 above-the-fold
/>

// 예: 썸네일 갤러리
<Image
  src={thumbnail}
  alt="Location thumbnail"
  width={300}
  height={200}
  sizes="
    (max-width: 640px) calc(50vw - 8px),
    (max-width: 1024px) calc(33vw - 8px),
    25vw
  "
  loading="lazy"  // 아래쪽 이미지는 lazy loading
/>
```

---

## 🎯 예상 성능 개선

### 이미지 크기 감소

```
현재 상태:
  JPG/PNG 평균 크기: 200-500KB
  GIF 애니메이션: 1-5MB
  SVG: 5-50KB

Next.js Image 적용 후:
  자동 WebP 변환: 50-60% 감소
  Quality 80%: 추가 30% 감소
  Responsive sizes: 모바일 50% 감소

예상 결과:
  200KB → 70KB (-65%)
  500KB → 140KB (-72%)
```

### 로드 시간 개선

```
현재: 이미지 병렬 로드 (제한 있음)
개선 후:
  - Priority 이미지: 먼저 로드 (위에만)
  - Lazy 이미지: 필요할 때만 로드
  - WebP: 더 작은 파일 크기

예상 성능 향상:
  LCP: 2.6s → 2.4s (-200ms)
  FCP: 2.0s → 1.8s (-200ms)
  총 로드: 7.3s → 7.0s (-300ms, -4%)
```

---

## 📊 구현 체크리스트

### Phase 1: 분석 및 준비 ✅
- [x] next.config.js 설정 확인
- [x] 이미지 파일 위치 파악
- [x] WebP 지원 확인
- [x] 반응형 크기 계획

### Phase 2: 구현 (진행 중)
- [ ] 홈페이지 이미지 마이그레이션
- [ ] 가이드 페이지 이미지 마이그레이션
- [ ] 팟캐스트 페이지 이미지 마이그레이션
- [ ] 기타 페이지 이미지 마이그레이션

### Phase 3: 검증
- [ ] 로컬 빌드 테스트
- [ ] 이미지 로딩 확인 (DevTools)
- [ ] 성능 측정 (Lighthouse)
- [ ] Cross-browser 테스트

---

## 🚀 다음 단계

### 즉시 (지금)
1. 이미지 파일 목록 생성
2. 가장 큰 이미지부터 마이그레이션
3. 각 마이그레이션 후 번들 크기 확인

### Task 2-3 (다음)
폰트 최적화

### Task 2-4
최종 성능 검증

---

**상태:** Task 2-2 구현 계획 완료
**다음:** 실제 이미지 마이그레이션 실행
