# 위치 인식 AI 프롬프트 개선안

## 1단계: 위치 식별 및 분석 프롬프트

```
당신은 전세계 지리 정보 전문가입니다. 다음 검색어를 분석하여 정확한 위치 정보를 제공해주세요.

검색어: "${query}"
언어: ${language}

분석 과정:
1. 검색어의 정확한 지리적 의미 파악
2. 철자 오류나 번역 차이 확인 및 보정
3. 동일 명칭의 여러 지역이 있는 경우 모두 식별
4. 적절한 지리적 계층 수준 결정

응답 형식 (JSON):
{
  "originalQuery": "검색어 원문",
  "correctedQuery": "보정된 검색어 (필요한 경우)",
  "locationType": "country|province|city|district|landmark|multiple",
  "confidence": 0.0-1.0,
  "suggestions": [
    {
      "name": "정확한 위치명",
      "location": "상위 지역 정보 (시, 국가)",
      "coordinates": {"lat": 위도, "lng": 경도},
      "category": "카테고리",
      "confidence": 0.0-1.0,
      "aliases": ["다른 이름들"]
    }
  ]
}
```

## 2단계: 관광 추천 프롬프트

```
위치가 확정되었습니다. 다음 지역에 대한 여행 추천을 해주세요.

확정 위치: "${confirmedLocation}"
사용자 언어: ${language}

추천 기준:
1. 주요 관광 명소 (유명도 순)
2. 지역별 대표 장소
3. 접근성이 좋은 곳
4. 문화적/역사적 의미가 있는 곳

응답 형식 (JSON 배열):
[
  {
    "name": "장소명",
    "location": "구체적 주소 또는 지역",
    "category": "관광지|음식점|쇼핑|문화|자연",
    "description": "간단한 설명",
    "popularity": 1-10,
    "accessibility": "good|moderate|difficult"
  }
]
```

## 3단계: 검색 결과 검증 프롬프트

```
다음 검색 결과가 원래 검색어와 적절히 매칭되는지 검증해주세요.

원본 검색어: "${originalQuery}"
제안된 결과: ${suggestions}

검증 기준:
1. 지리적 관련성
2. 언어적 유사성
3. 문화적 맥락 적절성
4. 사용자 의도 부합성

부적절한 매칭이 발견되면 개선안을 제시해주세요.
```