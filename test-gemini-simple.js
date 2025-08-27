/**
 * 🤖 Gemini 간단한 3자리 코드 테스트
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function testGeminiSimple3Code() {
  console.log('🤖 Gemini 간단한 3자리 코드 테스트');
  console.log('='.repeat(40));
  
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not found');
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-lite',
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 150,  // 아주 적게
        topK: 5,
        topP: 0.9,
        responseMimeType: "application/json"
      }
    });
    
    // 아주 간단한 프롬프트
    const simplePrompt = `장소명: "경복궁"
    
다음 JSON만 반환:
{
  "region": "지역명(영어)",
  "country": "국가명(한국어)", 
  "countryCode": "ISO 3자리 코드"
}`;

    console.log('🚀 초간단 프롬프트로 Gemini 호출... (3초 타임아웃)');
    
    // 3초 타임아웃
    const resultPromise = model.generateContent(simplePrompt);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('3초 타임아웃')), 3000)
    );
    
    const startTime = Date.now();
    const result = await Promise.race([resultPromise, timeoutPromise]);
    const endTime = Date.now();
    
    const response = await result.response.text();
    
    console.log(`✅ Gemini 응답 받음 (${endTime - startTime}ms):`);
    console.log(response);
    
    try {
      const parsed = JSON.parse(response);
      console.log('\n📋 파싱된 결과:');
      console.log(`   region: ${parsed.region}`);
      console.log(`   country: ${parsed.country}`);
      console.log(`   countryCode: ${parsed.countryCode} (길이: ${parsed.countryCode?.length})`);
      
      if (parsed.countryCode?.length === 3) {
        console.log(`🎉 성공! 3자리 코드 "${parsed.countryCode}" 반환!`);
        return true;
      } else {
        console.log('⚠️ 국가코드가 3자리가 아님');
        return false;
      }
      
    } catch (parseError) {
      console.log('❌ JSON 파싱 실패:', parseError);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Gemini 테스트 실패:', error.message);
    return false;
  }
}

if (require.main === module) {
  testGeminiSimple3Code().then(success => {
    if (success) {
      console.log('\n✅ 결론: Gemini는 3자리 코드를 정상 반환할 수 있습니다!');
      console.log('💡 복잡한 프롬프트가 타임아웃 원인일 수 있습니다.');
    } else {
      console.log('\n❌ 결론: Gemini 응답에 문제가 있습니다.');
    }
  });
}