const { getDefaultGeminiModel } = require('./src/lib/ai/gemini-client');

// generateChapterScript 함수 간단 버전 (테스트용)
async function testScriptGeneration() {
  console.log('🧪 스크립트 생성 테스트 시작...');
  
  try {
    console.log('🤖 Gemini 모델 초기화...');
    const model = getDefaultGeminiModel();
    console.log('✅ 모델 로드 완료');
    
    const testPrompt = `
경복궁에 대한 간단한 팟캐스트 스크립트를 생성해주세요.

요구사항:
- 2-3개의 짧은 대화 세그먼트
- male/female 화자 교대
- 각 세그먼트는 30-60초 분량

JSON 형식으로 반환:
{
  "segments": [
    {"speaker": "male", "text": "안녕하세요...", "estimatedSeconds": 30},
    {"speaker": "female", "text": "네, 안녕하세요...", "estimatedSeconds": 45}
  ]
}`;

    console.log('📝 AI 스크립트 생성 중...');
    const startTime = Date.now();
    
    const result = await model.generateContent(testPrompt);
    const response = result.response;
    const text = response.text();
    
    const endTime = Date.now();
    console.log(`⏱️ 생성 시간: ${endTime - startTime}ms`);
    
    console.log('📄 AI 응답:');
    console.log(text);
    
    // JSON 파싱 테스트
    try {
      const cleanedResponse = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanedResponse);
      console.log('✅ JSON 파싱 성공:');
      console.log('세그먼트 개수:', parsed.segments?.length || 0);
      if (parsed.segments && parsed.segments.length > 0) {
        console.log('첫 번째 세그먼트:', parsed.segments[0]);
      }
    } catch (parseError) {
      console.error('❌ JSON 파싱 실패:', parseError.message);
      console.log('응답 원문 (처음 200자):', text.substring(0, 200));
    }
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    if (error.message.includes('API key')) {
      console.error('💡 해결책: GEMINI_API_KEY 환경변수를 확인하세요');
    } else if (error.message.includes('quota')) {
      console.error('💡 해결책: API 할당량을 확인하세요');
    }
  }
}

// 실행
testScriptGeneration();