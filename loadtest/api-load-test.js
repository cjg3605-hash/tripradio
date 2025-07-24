/**
 * API 로드 테스트 스크립트
 * 
 * 사용법:
 * npm install -g artillery
 * node loadtest/api-load-test.js
 * 
 * 또는 Artillery 직접 실행:
 * artillery run loadtest/artillery-config.yml
 */

const fs = require('fs');
const path = require('path');

// 테스트 시나리오 설정
const testScenarios = {
  // 시나리오 1: AI 가이드 생성 테스트
  aiGuideGeneration: {
    target: 'http://localhost:3000',
    phases: [
      { duration: 60, arrivalRate: 1, name: '워밍업' },
      { duration: 300, arrivalRate: 2, name: '부하 증가' },
      { duration: 600, arrivalRate: 5, name: '피크 부하' },
      { duration: 300, arrivalRate: 2, name: '부하 감소' }
    ],
    scenarios: [
      {
        name: 'AI 가이드 생성',
        weight: 70,
        flow: [
          {
            post: {
              url: '/api/ai/generate-guide-with-gemini',
              headers: {
                'Content-Type': 'application/json'
              },
              json: {
                location: '경복궁',
                userProfile: {
                  interests: ['역사', '문화'],
                  ageGroup: '30대',
                  knowledgeLevel: '중급',
                  companions: 'solo',
                  tourDuration: 90,
                  preferredStyle: '친근함',
                  language: 'ko'
                }
              }
            }
          }
        ]
      },
      {
        name: '장소 검색',
        weight: 20,
        flow: [
          {
            get: {
              url: '/api/locations/search?q={{ $randomString() }}&lang=ko'
            }
          }
        ]
      },
      {
        name: 'TTS 생성',
        weight: 10,
        flow: [
          {
            post: {
              url: '/api/ai/generate-tts',
              headers: {
                'Content-Type': 'application/json'
              },
              json: {
                text: '안녕하세요. 경복궁에 오신 것을 환영합니다.',
                guide_id: 'test-guide-123',
                locationName: '경복궁',
                language: 'ko',
                voiceSettings: {
                  speakingRate: 1.2
                }
              }
            }
          }
        ]
      }
    ]
  },

  // 시나리오 2: 스트레스 테스트
  stressTest: {
    target: 'http://localhost:3000',
    phases: [
      { duration: 120, arrivalRate: 10, name: '급격한 부하 증가' },
      { duration: 300, arrivalRate: 20, name: '고부하 지속' },
      { duration: 60, arrivalRate: 1, name: '부하 해제' }
    ],
    scenarios: [
      {
        name: '스트레스 테스트',
        weight: 100,
        flow: [
          {
            post: {
              url: '/api/ai/generate-guide-with-gemini',
              headers: {
                'Content-Type': 'application/json'
              },
              json: {
                location: '{{ locations[$randomInt(0, locations.length-1)] }}',
                userProfile: {
                  interests: ['{{ interests[$randomInt(0, interests.length-1)] }}'],
                  ageGroup: '{{ ageGroups[$randomInt(0, ageGroups.length-1)] }}',
                  knowledgeLevel: '중급',
                  companions: 'solo',
                  tourDuration: 90,
                  preferredStyle: '친근함',
                  language: 'ko'
                }
              }
            }
          }
        ]
      }
    ],
    variables: {
      locations: ['경복궁', '창덕궁', '덕수궁', '경희궁', '종묘', '사직단', '남산타워', '한강공원'],
      interests: ['역사', '문화', '자연', '건축', '예술', '음식'],
      ageGroups: ['20대', '30대', '40대', '50대']
    }
  }
};

// Artillery 설정 파일 생성
function generateArtilleryConfig(scenario, filename) {
  const config = {
    config: {
      target: scenario.target,
      phases: scenario.phases,
      http: {
        timeout: 45000, // 45초 타임아웃
        pool: 10
      },
      plugins: {
        'expect': {},
        'metrics-by-endpoint': {}
      },
      variables: scenario.variables || {}
    },
    scenarios: scenario.scenarios.map(s => ({
      name: s.name,
      weight: s.weight,
      flow: s.flow.map(step => ({
        ...step,
        expect: [
          { statusCode: [200, 201, 429] }, // 429는 rate limit 정상 응답
          { hasProperty: 'success' }
        ],
        think: Math.random() * 2000 + 1000 // 1-3초 대기
      }))
    }))
  };

  const yamlContent = `# Artillery 로드테스트 설정
# 생성일: ${new Date().toISOString()}

config:
  target: '${config.config.target}'
  phases:
${config.config.phases.map(phase => 
    `    - duration: ${phase.duration}\n      arrivalRate: ${phase.arrivalRate}\n      name: '${phase.name}'`
  ).join('\n')}
  http:
    timeout: ${config.config.http.timeout}
    pool: ${config.config.http.pool}
  plugins:
    expect: {}
    metrics-by-endpoint: {}
${config.config.variables ? `  variables:\n${Object.entries(config.config.variables).map(([key, values]) => 
    `    ${key}:\n${values.map(v => `      - '${v}'`).join('\n')}`
  ).join('\n')}` : ''}

scenarios:
${config.scenarios.map(scenario => `  - name: '${scenario.name}'
    weight: ${scenario.weight}
    flow:
${scenario.flow.map(step => {
  const method = Object.keys(step)[0];
  const details = step[method];
  let stepConfig = `      - ${method}:\n          url: '${details.url}'`;
  
  if (details.headers) {
    stepConfig += `\n          headers:\n${Object.entries(details.headers).map(([k, v]) => 
      `            '${k}': '${v}'`
    ).join('\n')}`;
  }
  
  if (details.json) {
    stepConfig += `\n          json:\n${JSON.stringify(details.json, null, 12).split('\n').map(line => 
      `            ${line}`
    ).join('\n')}`;
  }
  
  stepConfig += `\n        expect:\n          - statusCode: [200, 201, 429]\n          - hasProperty: 'success'`;
  stepConfig += `\n        think: 2000`;
  
  return stepConfig;
}).join('\n')}`)
.join('\n')}`;

  fs.writeFileSync(filename, yamlContent);
  console.log(`✅ Artillery 설정 파일 생성: ${filename}`);
}

// 테스트 실행 스크립트 생성
function generateTestScript() {
  const scriptContent = `#!/bin/bash

echo "🚀 가이드AI API 로드테스트 시작"
echo "================================"

# 테스트 환경 확인
echo "📋 테스트 환경 설정 확인 중..."
if ! command -v artillery &> /dev/null; then
    echo "❌ Artillery가 설치되지 않았습니다."
    echo "다음 명령어로 설치하세요: npm install -g artillery"
    exit 1
fi

echo "✅ Artillery 설치 확인됨"

# 서버 상태 확인
echo "🔍 API 서버 상태 확인 중..."
if ! curl -s http://localhost:3000/api/health > /dev/null; then
    echo "❌ API 서버가 실행되지 않았거나 응답하지 않습니다."
    echo "http://localhost:3000에서 서버를 시작해주세요."
    exit 1
fi

echo "✅ API 서버 정상 응답 확인"

# 기본 로드테스트 실행
echo ""
echo "🎯 기본 로드테스트 실행..."
echo "================================"
artillery run loadtest/basic-load-test.yml --output loadtest/results/basic-$(date +%Y%m%d-%H%M%S).json

echo ""
echo "⚡ 스트레스 테스트 실행..."
echo "================================"
artillery run loadtest/stress-test.yml --output loadtest/results/stress-$(date +%Y%m%d-%H%M%S).json

echo ""
echo "📊 테스트 결과는 loadtest/results/ 디렉토리에 저장되었습니다."
echo "모니터링 대시보드: http://localhost:3000/monitoring"
`;

  fs.writeFileSync('loadtest/run-tests.sh', scriptContent);
  console.log('✅ 테스트 실행 스크립트 생성: loadtest/run-tests.sh');
}

// 메인 실행
function main() {
  // 디렉토리 생성
  const dirs = ['loadtest', 'loadtest/results'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 디렉토리 생성: ${dir}`);
    }
  });

  // Artillery 설정 파일 생성
  generateArtilleryConfig(testScenarios.aiGuideGeneration, 'loadtest/basic-load-test.yml');
  generateArtilleryConfig(testScenarios.stressTest, 'loadtest/stress-test.yml');

  // 테스트 실행 스크립트 생성
  generateTestScript();

  // README 파일 생성
  const readmeContent = `# 가이드AI API 로드테스트

## 🎯 개요
가이드AI API의 성능과 안정성을 검증하기 위한 로드테스트 스위트입니다.

## 📋 준비사항
1. Artillery 설치: \`npm install -g artillery\`
2. 로컬 서버 실행: \`npm run dev\` (http://localhost:3000)
3. 성능 모니터링 활성화: http://localhost:3000/monitoring

## 🚀 테스트 실행

### 자동 실행
\`\`\`bash
chmod +x loadtest/run-tests.sh
./loadtest/run-tests.sh
\`\`\`

### 수동 실행
\`\`\`bash
# 기본 로드테스트
artillery run loadtest/basic-load-test.yml

# 스트레스 테스트
artillery run loadtest/stress-test.yml

# 결과 파일로 저장
artillery run loadtest/basic-load-test.yml --output results.json
artillery report results.json
\`\`\`

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
- Artillery 리포트: \`artillery report results.json\`
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
`;

  fs.writeFileSync('loadtest/README.md', readmeContent);
  console.log('✅ 로드테스트 가이드 생성: loadtest/README.md');

  console.log('\n🎉 로드테스트 스크립트 생성 완료!');
  console.log('\n📋 다음 단계:');
  console.log('1. npm install -g artillery');
  console.log('2. 로컬 서버 실행 (npm run dev)');
  console.log('3. chmod +x loadtest/run-tests.sh');
  console.log('4. ./loadtest/run-tests.sh');
  console.log('5. 결과 확인: http://localhost:3000/monitoring');
}

// 스크립트가 직접 실행된 경우
if (require.main === module) {
  main();
}

module.exports = { testScenarios, generateArtilleryConfig };