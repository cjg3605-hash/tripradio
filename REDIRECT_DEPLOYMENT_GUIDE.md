# 🚀 리다이렉트 배포 및 검증 가이드

## ✅ 완료된 작업

### 1. 301 리다이렉트 구현 완료
- **파일**: `middleware.ts`
- **커밋**: `212ef83b`
- **기능**: navidocent.com → tripradio.shop 영구 리다이렉트

**구현 내용**:
```typescript
// 🔀 도메인 리다이렉트: navidocent.com → tripradio.shop
const hostname = req.headers.get('host') || '';
if (hostname.includes('navidocent.com')) {
  const url = req.nextUrl.clone();
  url.host = 'tripradio.shop';
  url.protocol = 'https';

  return NextResponse.redirect(url, {
    status: 301, // Permanent redirect for SEO
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
```

---

## 📋 다음 단계: 배포 및 검증

### Step 1: Vercel 프로덕션 배포 (5분)

```bash
# 현재 디렉토리 확인
cd /c/GUIDEAI

# Vercel 프로덕션 배포
npx vercel --prod

# 또는 git push로 자동 배포 (main 브랜치)
git push origin master
```

**배포 확인**:
- Vercel 대시보드에서 배포 상태 확인
- 빌드 로그에서 에러 없는지 확인
- 배포 완료까지 약 2-3분 소요

---

### Step 2: 리다이렉트 동작 검증 (10분)

#### 2.1 HTTP 헤더 확인

```bash
# navidocent.com 리다이렉트 테스트
curl -I https://navidocent.com

# 예상 결과:
# HTTP/1.1 301 Moved Permanently
# Location: https://tripradio.shop/
# Cache-Control: public, max-age=31536000, immutable
```

#### 2.2 경로 보존 테스트

```bash
# 특정 경로 리다이렉트 테스트
curl -I https://navidocent.com/guide/ko/eiffel-tower

# 예상 결과:
# HTTP/1.1 301 Moved Permanently
# Location: https://tripradio.shop/guide/ko/eiffel-tower
```

#### 2.3 쿼리 파라미터 보존 테스트

```bash
# 쿼리 파라미터 포함 테스트
curl -I "https://navidocent.com/podcast?location=colosseum&language=ko"

# 예상 결과:
# Location: https://tripradio.shop/podcast?location=colosseum&language=ko
```

#### 2.4 브라우저 테스트

1. **브라우저에서 직접 테스트**:
   - https://navidocent.com 방문
   - 자동으로 https://tripradio.shop 으로 리다이렉트되는지 확인
   - 주소창에 tripradio.shop이 표시되는지 확인

2. **개발자 도구로 확인**:
   - F12 → Network 탭 열기
   - https://navidocent.com 방문
   - 첫 번째 요청의 Status Code가 `301` 인지 확인
   - Headers → Location이 `https://tripradio.shop/` 인지 확인

---

### Step 3: 다양한 페이지에서 검증 (10분)

**테스트 케이스**:

| navidocent.com | 리다이렉트 예상 결과 |
|----------------|----------------------|
| https://navidocent.com/ | https://tripradio.shop/ |
| https://navidocent.com/guide | https://tripradio.shop/guide |
| https://navidocent.com/podcast | https://tripradio.shop/podcast |
| https://navidocent.com/guide/ko/경복궁 | https://tripradio.shop/guide/ko/경복궁 |
| https://navidocent.com/privacy | https://tripradio.shop/privacy |
| https://navidocent.com/terms | https://tripradio.shop/terms |

**검증 스크립트**:

```bash
#!/bin/bash
# redirect-test.sh

echo "🔍 리다이렉트 테스트 시작..."

test_redirect() {
  local url=$1
  echo ""
  echo "테스트: $url"

  # HTTP 상태 코드 확인
  status=$(curl -s -o /dev/null -w "%{http_code}" -L "$url")

  # Location 헤더 확인
  location=$(curl -s -I "$url" | grep -i "location:" | cut -d' ' -f2 | tr -d '\r')

  if [ "$status" = "301" ]; then
    echo "✅ 상태 코드: 301 (정상)"
  else
    echo "❌ 상태 코드: $status (오류)"
  fi

  if [[ "$location" == https://tripradio.shop/* ]]; then
    echo "✅ 리다이렉트: $location (정상)"
  else
    echo "❌ 리다이렉트: $location (오류)"
  fi
}

# 테스트 실행
test_redirect "https://navidocent.com/"
test_redirect "https://navidocent.com/guide"
test_redirect "https://navidocent.com/podcast"
test_redirect "https://navidocent.com/guide/ko/eiffel-tower"

echo ""
echo "🎉 테스트 완료!"
```

**실행 방법**:

```bash
# 스크립트 저장
cat > redirect-test.sh << 'EOF'
[위 스크립트 내용]
EOF

# 실행 권한 부여
chmod +x redirect-test.sh

# 실행
./redirect-test.sh
```

---

## 🎯 배포 후 체크리스트

### 즉시 확인 (배포 후 5분 내)

- [ ] Vercel 배포 완료 확인
- [ ] 빌드 에러 없음 확인
- [ ] https://navidocent.com → https://tripradio.shop 리다이렉트 작동
- [ ] 301 상태 코드 반환 확인
- [ ] 경로 보존 확인 (예: /guide, /podcast)
- [ ] 쿼리 파라미터 보존 확인

### 1시간 내 확인

- [ ] 다양한 브라우저에서 테스트 (Chrome, Safari, Firefox)
- [ ] 모바일에서 테스트 (iOS, Android)
- [ ] 캐시 헤더 적용 확인
- [ ] 로그에 리다이렉트 메시지 출력 확인

### 24시간 내 확인

- [ ] Google Search Console에서 301 리다이렉트 인식 확인
- [ ] AdSense 광고가 tripradio.shop에서 정상 표시
- [ ] navidocent.com 트래픽이 tripradio.shop으로 이동 확인
- [ ] Analytics 데이터 확인

---

## 🚨 문제 해결

### 문제 1: 리다이렉트가 작동하지 않음

**증상**:
- navidocent.com이 여전히 콘텐츠 표시
- 301 상태 코드가 아닌 200 반환

**해결책**:
```bash
# 1. Vercel 캐시 제거
npx vercel --prod --force

# 2. 배포 로그 확인
npx vercel logs [deployment-url]

# 3. 미들웨어 설정 확인
cat middleware.ts | grep navidocent
```

---

### 문제 2: 리다이렉트 루프 발생

**증상**:
- "Too many redirects" 에러
- 페이지가 무한 로딩

**원인**:
- tripradio.shop도 navidocent.com으로 리다이렉트하는 설정 존재

**해결책**:
```typescript
// middleware.ts에서 정확한 도메인 체크 확인
if (hostname.includes('navidocent.com')) {
  // navidocent.com만 리다이렉트
}
```

---

### 문제 3: 경로가 보존되지 않음

**증상**:
- /guide/ko/eiffel-tower → / 로 리다이렉트

**해결책**:
```typescript
// middleware.ts 확인
const url = req.nextUrl.clone(); // URL 전체 복사
url.host = 'tripradio.shop';     // 호스트만 변경
url.protocol = 'https';           // 프로토콜 강제
// pathname, search는 자동 보존됨
```

---

## 📊 모니터링 지표

### 핵심 지표

1. **리다이렉트 성공률**: 100% (모든 요청이 301 반환)
2. **응답 시간**: < 100ms (Edge에서 즉시 처리)
3. **SEO 이전**: 2-4주 내 완료 예상
4. **AdSense 수익**: 영향 없음 (도메인 변경 신청 후)

### Google Search Console 모니터링

**1주차**:
- navidocent.com 트래픽 감소 시작
- tripradio.shop 트래픽 증가 시작
- 301 리다이렉트 인식

**2-4주차**:
- 검색 결과에서 tripradio.shop으로 교체
- 링크 파워 90-99% 이전
- 순위 유지 또는 상승

**2-3개월차**:
- 완전 이전 완료
- navidocent.com 참조 최소화

---

## 📝 다음 단계: AdSense 도메인 변경

배포 및 검증이 완료되면 다음 문서를 참조하세요:

1. **BRAND_MIGRATION_NAVIDOCENT_TO_TRIPRADIO.md** - Step 3: AdSense 도메인 변경
2. **BRAND_MIGRATION_NAVIDOCENT_TO_TRIPRADIO.md** - Step 4: Google Search Console 업데이트

---

## 🎉 완료 기준

### ✅ 리다이렉트 배포 완료 조건

- [x] middleware.ts에 리다이렉트 코드 추가
- [x] Git 커밋 완료
- [ ] Vercel 프로덕션 배포 완료
- [ ] HTTP 301 상태 코드 확인
- [ ] 경로 보존 테스트 통과
- [ ] 브라우저 테스트 통과
- [ ] 모바일 테스트 통과

**모든 항목 완료 시 → AdSense 도메인 변경 신청 가능** 🚀

---

**작성 일시**: 2025-11-04
**현재 단계**: 배포 대기 중
**예상 소요 시간**: 총 30분 (배포 5분 + 검증 10분 + 테스트 15분)

