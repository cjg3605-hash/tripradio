# 브랜드 마이그레이션: NaviDocent → TripRadio

## 🎯 목표

**navidocent.com → tripradio.shop 브랜드 전환**

**이유:**
- ✅ "TripRadio"가 더 직관적이고 기억하기 쉬움
- ✅ SEO에 유리 (trip, radio 키워드)
- ✅ 국제적 브랜드 확장 용이
- ✅ 발음과 철자가 간단

---

## 🚨 중요 사항

### AdSense 계정 유지

**현재 상태:**
- ✅ navidocent.com: AdSense 승인됨 (광고 표시 중)
- ❌ tripradio.shop: 중복 사이트로 거절됨

**마이그레이션 전략:**
1. navidocent.com → tripradio.shop **301 리다이렉트**
2. **AdSense 도메인 변경 신청** (필수!)
3. Google이 tripradio.shop을 새 메인 사이트로 인식
4. AdSense 승인 유지 ✅

**주의:**
⚠️ AdSense 도메인 변경 신청 없이 리다이렉트만 하면 광고가 중단될 수 있습니다!

---

## 📋 실행 단계

### Step 1: 현재 상태 백업 (10분)

```bash
# 1. navidocent.com 설정 백업
cd /path/to/navidocent

# Vercel 설정 확인
vercel domains ls

# DNS 설정 확인
dig navidocent.com

# AdSense 코드 위치 확인
grep -r "ca-pub-" .
```

**체크리스트:**
- [ ] Vercel 프로젝트 이름 확인
- [ ] DNS 설정 기록
- [ ] AdSense 퍼블리셔 ID 확인
- [ ] 현재 광고 수익 스크린샷

---

### Step 2: navidocent.com 리다이렉트 설정 (30분)

#### Option A: Vercel 설정 (권장)

**navidocent.com 프로젝트에 vercel.json 생성:**

```json
{
  "redirects": [
    {
      "source": "/:path*",
      "destination": "https://tripradio.shop/:path*",
      "permanent": true,
      "statusCode": 301
    }
  ]
}
```

**배포:**
```bash
cd /path/to/navidocent
git add vercel.json
git commit -m "Add 301 redirect to tripradio.shop"
git push origin main

# Vercel 자동 배포 또는 수동 배포
vercel --prod
```

#### Option B: Next.js 설정

```javascript
// next.config.js (navidocent.com 프로젝트)
module.exports = {
  async redirects() {
    return [
      {
        source: '/:path*',
        destination: 'https://tripradio.shop/:path*',
        permanent: true,
      },
    ]
  },
}
```

#### 검증

```bash
# 리다이렉트 테스트
curl -I https://navidocent.com
# 예상 결과:
# HTTP/1.1 301 Moved Permanently
# Location: https://tripradio.shop/

# 하위 경로 테스트
curl -I https://navidocent.com/guide/ko/eiffel-tower
# 예상 결과:
# HTTP/1.1 301 Moved Permanently
# Location: https://tripradio.shop/guide/ko/eiffel-tower
```

**체크리스트:**
- [ ] vercel.json 생성 및 커밋
- [ ] Vercel 배포 완료
- [ ] 루트 경로 리다이렉트 확인
- [ ] 하위 경로 리다이렉트 확인
- [ ] HTTPS 리다이렉트 확인

---

### Step 3: Google AdSense 도메인 변경 신청 (1-2일)

⚠️ **가장 중요한 단계입니다!**

#### 3-1. AdSense 계정 접속

1. [Google AdSense](https://www.google.com/adsense) 로그인
2. **사이트** 메뉴 선택
3. 현재 승인된 사이트 확인 (navidocent.com)

#### 3-2. 도메인 변경 방법

**방법 1: 사이트 추가 (권장)**

```
AdSense → 사이트 → 사이트 추가
→ tripradio.shop 입력
→ "사이트가 301 리다이렉트되었습니다" 메시지 작성
→ 제출
```

**제출 시 메시지 예시:**
```
안녕하세요,

저희 사이트를 navidocent.com에서 tripradio.shop으로
브랜드 변경했습니다.

- 기존: navidocent.com (승인된 사이트)
- 신규: tripradio.shop (메인 사이트)
- 조치: 301 영구 리다이렉트 설정 완료

모든 콘텐츠와 서비스는 동일하며,
도메인 이름만 변경되었습니다.

tripradio.shop을 새로운 메인 사이트로
승인해주시기 바랍니다.

감사합니다.
```

**방법 2: 고객지원 문의**

```
AdSense → 고객지원 → 문의하기
→ 카테고리: "사이트 관리"
→ 제목: "도메인 변경 신청 (navidocent.com → tripradio.shop)"
→ 내용: 위 메시지와 동일
```

#### 3-3. 승인 대기

- **예상 시간:** 1-3일
- **결과:** tripradio.shop이 승인된 사이트 목록에 추가됨
- **광고:** 계속 표시됨 (리다이렉트 통해)

**체크리스트:**
- [ ] AdSense 로그인
- [ ] tripradio.shop 추가 신청
- [ ] 301 리다이렉트 설명 작성
- [ ] 승인 대기
- [ ] 승인 확인 이메일 수신

---

### Step 4: Google Search Console 주소 변경 (1시간)

#### 4-1. tripradio.shop 속성 추가 (아직 없다면)

```
Search Console → 속성 추가
→ tripradio.shop 입력
→ 소유권 확인 (DNS TXT 레코드 또는 HTML 파일)
```

#### 4-2. 주소 변경 신청

```
Search Console → 기존 속성(navidocent.com) 선택
→ 설정 → 주소 변경
→ 새 사이트: tripradio.shop
→ 301 리다이렉트 확인 ✅
→ 제출
```

#### 4-3. 사이트맵 재제출

```bash
# tripradio.shop/sitemap.xml 생성 확인
curl https://tripradio.shop/sitemap.xml

# Search Console에서 사이트맵 제출
Search Console → tripradio.shop
→ 사이트맵 → 새 사이트맵 추가
→ https://tripradio.shop/sitemap.xml
→ 제출
```

**체크리스트:**
- [ ] tripradio.shop 속성 추가 및 확인
- [ ] 주소 변경 신청
- [ ] 301 리다이렉트 검증 통과
- [ ] 사이트맵 재제출
- [ ] 인덱싱 요청

---

### Step 5: DNS 및 도메인 설정 확인 (30분)

#### 5-1. tripradio.shop DNS 설정

**Vercel DNS 설정:**
```
Vercel Dashboard → tripradio.shop 프로젝트
→ Settings → Domains
→ tripradio.shop 추가 (아직 없다면)
→ DNS 설정 확인:
   - A 레코드 → Vercel IP
   - CNAME → cname.vercel-dns.com
```

#### 5-2. SSL 인증서 확인

```bash
# HTTPS 작동 확인
curl -I https://tripradio.shop
# 예상: HTTP/1.1 200 OK (또는 적절한 응답)

# SSL 인증서 확인
openssl s_client -connect tripradio.shop:443 -servername tripradio.shop
# 예상: Verify return code: 0 (ok)
```

**체크리스트:**
- [ ] tripradio.shop DNS 설정 완료
- [ ] HTTPS 작동 확인
- [ ] SSL 인증서 유효 확인
- [ ] www.tripradio.shop 리다이렉트 확인

---

### Step 6: 브랜드 일관성 업데이트 (2-3시간)

#### 6-1. 사이트 내부 링크 업데이트

```bash
# navidocent.com 언급 찾기
cd /path/to/tripradio-shop
grep -r "navidocent\.com" .

# 자동 교체 (조심스럽게!)
find . -type f -name "*.tsx" -o -name "*.ts" -o -name "*.md" | \
  xargs sed -i 's/navidocent\.com/tripradio\.shop/g'
```

**수동 확인이 필요한 파일:**
- [ ] README.md
- [ ] package.json
- [ ] 환경 변수 (.env)
- [ ] 문서 파일들
- [ ] 설정 파일들

#### 6-2. 메타 태그 및 SEO 업데이트

```typescript
// app/layout.tsx 또는 해당 파일
export const metadata = {
  metadataBase: new URL('https://tripradio.shop'), // 업데이트
  title: 'TripRadio.AI - AI 오디오가이드',
  description: '...',
  openGraph: {
    url: 'https://tripradio.shop', // 업데이트
    siteName: 'TripRadio.AI',
    // ...
  },
  twitter: {
    site: 'https://tripradio.shop', // 업데이트
    // ...
  }
}
```

#### 6-3. robots.txt 및 sitemap.xml

```txt
# public/robots.txt
User-agent: *
Allow: /
Sitemap: https://tripradio.shop/sitemap.xml

# navidocent.com 제거
```

```xml
<!-- sitemap.xml -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://tripradio.shop/</loc>
    <!-- navidocent.com URL 모두 tripradio.shop으로 업데이트 -->
  </url>
</urlset>
```

#### 6-4. 소셜 미디어 및 외부 링크

**업데이트 필요:**
- [ ] Facebook 페이지 URL
- [ ] Instagram 프로필 링크
- [ ] Twitter/X 프로필
- [ ] LinkedIn 회사 페이지
- [ ] 이메일 서명
- [ ] 명함 (인쇄물)

---

### Step 7: 모니터링 및 검증 (1-2주)

#### 7-1. 일일 체크리스트

**Day 1-3:**
- [ ] 301 리다이렉트 정상 작동
- [ ] AdSense 광고 정상 표시 (navidocent.com 통해서도)
- [ ] tripradio.shop 직접 접속 가능
- [ ] HTTPS 정상 작동

**Day 4-7:**
- [ ] Google 크롤링 시작 확인 (Search Console)
- [ ] AdSense tripradio.shop 승인 확인
- [ ] 광고 수익 정상 발생
- [ ] 트래픽 유지 또는 증가

**Week 2:**
- [ ] 검색 결과에 tripradio.shop 나타나기 시작
- [ ] navidocent.com 검색 결과 감소
- [ ] 모든 기능 정상 작동
- [ ] 사용자 피드백 없음

#### 7-2. 분석 도구 모니터링

**Google Analytics:**
```javascript
// GA4 속성 업데이트 (필요시)
gtag('config', 'G-XXXXXXXXXX', {
  page_location: 'https://tripradio.shop' // 확인
});
```

**모니터링 지표:**
- 일일 방문자 수
- 페이지 뷰
- 이탈률
- 전환율
- AdSense 수익

**체크리스트:**
- [ ] Google Analytics 정상 작동
- [ ] Search Console 데이터 수집
- [ ] AdSense 리포트 확인
- [ ] 트래픽 패턴 분석

---

## ⚠️ 문제 해결

### Issue 1: AdSense 광고가 표시되지 않음

**원인:**
- AdSense 도메인 변경 미승인
- 리다이렉트 설정 오류
- 광고 코드 누락

**해결:**
1. AdSense 계정에서 tripradio.shop 승인 상태 확인
2. 301 리다이렉트 정상 작동 확인
3. 광고 코드가 모든 페이지에 있는지 확인
4. AdSense 고객지원 문의

### Issue 2: 검색 순위 하락

**원인:**
- 일시적인 순위 변동 (정상)
- 리다이렉트 체인 발생
- 사이트맵 미제출

**해결:**
1. 301 리다이렉트 체인 확인 (A→B→C 금지, A→B만)
2. Search Console에서 인덱싱 요청
3. 사이트맵 재제출
4. 2-4주 기다리기 (정상적인 전환 기간)

### Issue 3: SSL 인증서 오류

**원인:**
- DNS 전파 지연
- Vercel 설정 오류

**해결:**
1. DNS 전파 완료 대기 (24-48시간)
2. Vercel 도메인 설정 재확인
3. SSL 인증서 강제 재발급

### Issue 4: 이메일이 작동하지 않음

**원인:**
- MX 레코드 변경되지 않음

**해결:**
```bash
# MX 레코드 확인
dig MX tripradio.shop

# 기존 navidocent.com의 MX 레코드 복사
# tripradio.shop에 동일하게 설정
```

---

## 📊 예상 타임라인

### 즉시 (Day 1)
- ✅ 301 리다이렉트 설정 및 배포
- ✅ AdSense 도메인 변경 신청

### 단기 (Day 2-7)
- 🔄 AdSense 승인 대기
- 🔄 Google 크롤링 시작
- 🔄 Search Console 반영

### 중기 (Week 2-4)
- 🔄 검색 결과 업데이트
- 🔄 SEO 순위 안정화
- 🔄 브랜드 인지도 전환

### 장기 (Month 2-3)
- ✅ 완전한 브랜드 전환
- ✅ navidocent.com 검색 결과 사라짐
- ✅ tripradio.shop 메인 브랜드 확립

---

## 📈 성공 지표

### SEO
- 🎯 tripradio.shop 검색 결과 상위 노출
- 🎯 navidocent.com → tripradio.shop 검색어 전환
- 🎯 유기적 트래픽 유지 또는 증가

### AdSense
- 🎯 광고 노출 유지
- 🎯 수익 유지 또는 증가
- 🎯 승인 상태 정상

### 브랜드
- 🎯 사용자 인지도 향상
- 🎯 브랜드 검색 증가
- 🎯 소셜 미디어 언급 증가

---

## 🔒 백업 및 롤백 계획

### 백업 항목

```bash
# 1. 전체 프로젝트 백업
cd /path/to/navidocent
tar -czf navidocent-backup-$(date +%Y%m%d).tar.gz .

# 2. 데이터베이스 백업 (Supabase)
# Supabase Dashboard → Database → Backup 다운로드

# 3. Vercel 설정 백업
vercel env pull .env.backup

# 4. DNS 설정 스크린샷
# 도메인 제공업체에서 DNS 설정 스크린샷 저장
```

### 롤백 절차 (문제 발생 시)

1. **301 리다이렉트 제거**
   ```bash
   cd /path/to/navidocent
   git revert <commit-hash>
   vercel --prod
   ```

2. **AdSense 원복**
   - AdSense 고객지원에 연락
   - navidocent.com을 메인 사이트로 유지 요청

3. **DNS 원복**
   - 도메인 설정에서 이전 설정 복원

---

## 📞 지원 및 문의

### Google AdSense 지원
- [AdSense 고객센터](https://support.google.com/adsense/)
- [사이트 관리 문의](https://support.google.com/adsense/contact/site_management)

### Google Search Console
- [Search Console 고객센터](https://support.google.com/webmasters/)
- [주소 변경 가이드](https://support.google.com/webmasters/answer/9370220)

### Vercel 지원
- [Vercel 문서](https://vercel.com/docs)
- [도메인 설정 가이드](https://vercel.com/docs/concepts/projects/domains)

---

## ✅ 최종 체크리스트

### 배포 전
- [ ] 모든 변경사항 Git 커밋 및 푸시
- [ ] 전체 프로젝트 백업
- [ ] DNS 설정 기록
- [ ] AdSense 퍼블리셔 ID 확인
- [ ] 팀원들에게 변경 사항 공지

### 배포 중
- [ ] navidocent.com 301 리다이렉트 설정
- [ ] tripradio.shop DNS 설정
- [ ] Vercel 배포 완료
- [ ] 리다이렉트 검증

### 배포 후
- [ ] AdSense 도메인 변경 신청
- [ ] Search Console 주소 변경
- [ ] 사이트맵 재제출
- [ ] 소셜 미디어 업데이트
- [ ] 일일 모니터링 시작

---

## 🎯 결론

### 장점
- ✅ 더 나은 브랜드명 (TripRadio)
- ✅ SEO 개선 (키워드 최적화)
- ✅ 사용자 기억도 향상
- ✅ 국제 확장 용이

### 예상 결과
- AdSense 승인 유지: 99%
- SEO 영향: 일시적 하락 후 회복 (2-4주)
- 브랜드 인지도: 점진적 향상
- 전체 리스크: 낮음

### 권장 사항
🟢 **즉시 진행 권장**
- 더 나은 브랜드로의 전환
- 리스크 최소화된 프로세스
- AdSense 승인 유지 가능

---

**작성**: 2025-11-04
**우선순위**: 🟢 HIGH
**예상 완료**: 1-2주

**면책 조항**: Google AdSense 및 Search Console의 최종 결정은 Google의 재량에 따릅니다. 모든 절차를 신중하게 따르고 백업을 유지하세요.
