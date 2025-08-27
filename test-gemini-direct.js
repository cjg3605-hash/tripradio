/**
 * 🤖 Gemini API 직접 테스트 
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function testGeminiDirect() {
  console.log('🤖 Gemini API 직접 테스트');
  console.log('='.repeat(30));
  
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not found');
    }
    
    console.log('✅ API 키 확인됨');
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-lite',
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 300,
        responseMimeType: "application/json"
      }
    });
    
    console.log('✅ Gemini 모델 생성됨');
    
    // 간단한 프롬프트로 테스트
    const prompt = `장소명 "경복궁"의 지역정보를 다음 JSON 형식으로 반환해주세요:

{
  "placeName": "경복궁",
  "region": "소재 지역명 (영어)",
  "country": "국가명 (한국어)", 
  "countryCode": "ISO 3166-1 alpha-3 코드 (3자리)",
  "confidence": 0.95
}`;

    console.log('🚀 Gemini API 호출 중... (5초 타임아웃)');
    
    // 5초 타임아웃
    const resultPromise = model.generateContent(prompt);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('5초 타임아웃')), 5000)
    );
    
    const result = await Promise.race([resultPromise, timeoutPromise]);
    const response = await result.response.text();
    
    console.log('✅ Gemini 응답 받음:');
    console.log(response);
    
    try {
      const parsed = JSON.parse(response);
      console.log('\n📋 파싱된 결과:');
      console.log(`   placeName: ${parsed.placeName}`);
      console.log(`   region: ${parsed.region}`);
      console.log(`   country: ${parsed.country}`);
      console.log(`   countryCode: ${parsed.countryCode} (길이: ${parsed.countryCode?.length})`);
      
      if (parsed.countryCode?.length === 3) {
        console.log('✅ 3자리 국가코드 정상!');
      } else {
        console.log('⚠️ 국가코드가 3자리가 아님');
      }
      
    } catch (parseError) {
      console.log('❌ JSON 파싱 실패:', parseError);
    }
    
  } catch (error) {
    console.error('❌ Gemini 테스트 실패:', error.message);
  }
}

if (require.main === module) {
  testGeminiDirect();
}