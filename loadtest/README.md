# 가이드AI API 로드테스트

## 🎯 개요
가이드AI API의 성능과 안정성을 검증하기 위한 로드테스트 스위트입니다.

## 📋 준비사항
1. Artillery 설치: `npm install -g artillery`
2. 로컬 서버 실행: `npm run dev` (http://localhost:3000)
3. 성능 모니터링 활성화: http://localhost:3000/monitoring

## 🚀 테스트 실행

### 자동 실행
```bash
chmod +x loadtest/run-tests.sh
./loadtest/run-tests.sh
```

### 수동 실행
```bash
# 기본 로드테스트
artillery run loadtest/basic-load-test.yml

# 스트레스 테스트
artillery run loadtest/stress-test.yml

# 결과 파일로 저장
artillery run loadtest/basic-load-test.yml --output results.json
artillery report results.json
```

## 📊 테스트 시나리오

### 1. 기본 로드테스트 (basic-load-test.yml)
- **목적**: 일반적인 사용 패턴 시뮬레이션
- **부하**: 최대 동시 사용자 5명
- **지속시간**: 총 20분
- **시나리오**:
  - AI 가이드 생성 (70%)
  - 장소 검색 (20%)
  - TTS 생성 (10%)

### 2. 스트레스 테스트 (stress-test.yml)
- **목적**: 시스템 한계 테스트
- **부하**: 최대 동시 사용자 20명
- **지속시간**: 총 8분
- **시나리오**:
  - 다양한 장소/설정으로 AI 가이드 생성

## 📈 성능 지표

### 목표 성능
- **응답시간**: 평균 < 25초, 95% < 35초
- **성공률**: > 95%
- **처리량**: 분당 최소 60회 요청 처리
- **오류율**: < 5%

### 모니터링
- 실시간 모니터링: http://localhost:3000/monitoring
- Artillery 리포트: `artillery report results.json`
- 서버 로그: 콘솔 출력 확인

## 🛠️ 트러블슈팅

### 일반적인 문제
1. **서버 연결 실패**: localhost:3000에서 서버가 실행 중인지 확인
2. **높은 오류율**: 서버 리소스나 DB 연결 확인
3. **느린 응답**: 네트워크 상태나 API 키 설정 확인

### 성능 튜닝 팁
- 모니터링 대시보드에서 병목지점 확인
- 서킷 브레이커 상태 점검
- 캐시 히트율 확인
- 데이터베이스 인덱스 활용 상태 점검

## 📋 체크리스트

### 테스트 전
- [ ] 로컬 서버 실행 중
- [ ] API 키 설정 완료
- [ ] 데이터베이스 연결 정상
- [ ] 모니터링 대시보드 접근 가능

### 테스트 후
- [ ] 전체 성공률 > 95%
- [ ] 평균 응답시간 < 25초
- [ ] 메모리 사용량 안정적
- [ ] 에러 로그 확인
- [ ] 성능 개선 사항 문서화
