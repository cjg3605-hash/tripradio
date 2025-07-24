#!/bin/bash

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
