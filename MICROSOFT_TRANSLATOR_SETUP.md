# Microsoft Translator API 설정 가이드

## 개요
이 프로젝트는 무료 번역을 위해 Microsoft Translator API를 사용합니다.

## 지원 언어
- 🇰🇷 한국어 (ko)
- 🇺🇸 영어 (en)  
- 🇯🇵 일본어 (ja)
- 🇨🇳 중국어 (zh)
- 🇪🇸 스페인어 (es)

## Microsoft Translator API 설정

### 1. Azure 계정 생성 및 리소스 만들기

1. **Azure Portal 접속**: https://portal.azure.com
2. **새 리소스 만들기** → **AI + Machine Learning** → **Translator**
3. **기본 설정**:
   - 구독: 본인의 Azure 구독
   - 리소스 그룹: 새로 만들기 또는 기존 선택
   - 지역: **Korea Central** (한국 중부) 권장
   - 이름: `guideai-translator` (원하는 이름)
   - 가격 책정 계층: **F0 (Free)** - 월 200만 자 무료

4. **검토 + 만들기** → **만들기**

### 2. API 키 및 엔드포인트 확인

1. 생성된 Translator 리소스로 이동
2. **키 및 엔드포인트** 메뉴 클릭
3. 다음 정보 복사:
   - **키 1** (API 키)
   - **지역** (예: koreacentral)
   - **엔드포인트** (기본값 사용)

### 3. 환경변수 설정

`.env.local` 파일에 다음 추가:

```env
# Microsoft Translator API 설정
MICROSOFT_TRANSLATOR_KEY=your_api_key_here
MICROSOFT_TRANSLATOR_REGION=koreacentral
```

**예시:**
```env
MICROSOFT_TRANSLATOR_KEY=abc123def456ghi789jkl012mno345pqr
MICROSOFT_TRANSLATOR_REGION=koreacentral
```

### 4. 프로덕션 환경 설정

**Vercel 배포 시 환경변수 설정:**

1. Vercel Dashboard → 프로젝트 선택
2. **Settings** → **Environment Variables**
3. 다음 변수들 추가:

| Name | Value | Environment |
|------|-------|-------------|
| `MICROSOFT_TRANSLATOR_KEY` | 복사한 API 키 | Production, Preview, Development |
| `MICROSOFT_TRANSLATOR_REGION` | koreacentral | Production, Preview, Development |

## 무료 사용량 및 제한

### 📊 **무료 플랜 (F0)**
- **월 사용량**: 200만 자 무료
- **초과 시**: 사용 불가 (업그레이드 필요)
- **요청 제한**: 분당 1,000 요청
- **지원 언어**: 100개 이상

### 💰 **유료 플랜 비교**
- **S1 플랜**: $10/100만자 (Google의 절반 가격)
- **무료 vs Google**: 200만 자 vs 50만 자 (4배 무료 제공)

## 번역 테스트

### API 직접 테스트
```bash
curl -X POST "https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=ko&to=en" \
  -H "Ocp-Apim-Subscription-Key: YOUR_API_KEY" \
  -H "Ocp-Apim-Subscription-Region: koreacentral" \
  -H "Content-Type: application/json" \
  -d '[{"text": "경복궁"}]'
```

**예상 응답:**
```json
[
  {
    "translations": [
      {
        "text": "Gyeongbok Palace",
        "to": "en"
      }
    ]
  }
]
```

### Next.js 앱에서 테스트
```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 테스트
# 1. /guide/경복궁/live 접속
# 2. 언어를 영어로 변경
# 3. URL이 /guide/Gyeongbok%20Palace/live로 변경되는지 확인
```

## 문제 해결

### API 키 오류
```
❌ Microsoft Translator API 키가 설정되지 않음
```
**해결**: `.env.local` 파일에 `MICROSOFT_TRANSLATOR_KEY` 확인

### 지역 오류
```
❌ Microsoft Translator API 오류: 401
```
**해결**: `MICROSOFT_TRANSLATOR_REGION`이 Azure 리소스의 지역과 일치하는지 확인

### 사용량 초과
```
❌ Microsoft Translator API 오류: 429
```
**해결**: 
- 무료 플랜: 다음 달까지 대기 또는 유료 플랜으로 업그레이드
- 유료 플랜: 요청 제한 확인

### 네트워크 오류
```
❌ 번역 API 호출 실패
```
**해결**: 
1. 인터넷 연결 확인  
2. Azure 서비스 상태 확인: https://status.azure.com
3. API 엔드포인트 URL 확인

## 사용량 모니터링

### Azure Portal에서 확인
1. **Azure Portal** → **Translator 리소스**
2. **모니터링** → **메트릭**
3. **번역된 문자 수** 및 **API 호출 수** 확인

### 알림 설정
1. **모니터링** → **경고**
2. **새 경고 규칙** 생성
3. **조건**: 번역된 문자 수 > 150만 자 (75% 사용 시 알림)
4. **작업**: 이메일 알림 설정

## 비용 최적화 팁

### 📉 **번역 최적화**
- 짧은 텍스트 우선 번역
- 중복 번역 방지 (캐싱 활용)
- 불필요한 번역 요청 최소화

### 💾 **캐싱 활용**
현재 시스템에 번역 결과 캐싱이 없으므로, 필요시 추가 구현:
```typescript
// 간단한 세션 캐싱 예시
const translationCache = new Map<string, string>();
const cacheKey = `${text}_${sourceLanguage}_${targetLanguage}`;
```

### 📊 **사용량 추적**
- 월말에 사용량 확인
- 사용 패턴 분석으로 최적화 지점 파악
- 필요시 유료 플랜으로 업그레이드 계획

## 장점 요약

✅ **Google 대비 4배 무료 제공** (200만자 vs 50만자)  
✅ **유료 시 50% 저렴** ($10 vs $20 per 100만자)  
✅ **높은 번역 품질** (특히 아시아 언어)  
✅ **Azure 생태계 통합** (모니터링, 보안, 확장성)  
✅ **전 세계 CDN** (빠른 응답 속도)  

이제 월 200만 자 무료로 고품질 번역 서비스를 이용할 수 있습니다!