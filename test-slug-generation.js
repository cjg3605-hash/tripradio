const { getDefaultGeminiModel } = require('./src/lib/ai/gemini-client');

(async () => {
  console.log('🧪 AI 슬러그 생성 테스트...');
  
  try {
    const model = getDefaultGeminiModel();
    console.log('✅ Gemini 모델 로드 성공');
    
    const prompt = `
다음 장소명을 영어 폴더명으로 변환하세요:

입력: "경복궁"

변환 규칙:
1. 정확한 영어 장소명으로 번역
2. 소문자만 사용
3. 공백을 하이픈(-)으로 변경
4. 특수문자 제거 (알파벳, 숫자, 하이픈만 허용)
5. 50자 이내로 제한

예시:
- 대영박물관 → british-museum
- 에펠탑 → eiffel-tower
- 국립중앙박물관 → national-museum-korea

결과만 출력하세요 (설명 없이):`;

    console.log('🤖 AI 번역 시작...');
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    console.log('📄 AI 응답:', text);
    
    // 응답에서 슬러그 추출
    const cleanSlug = text.trim()
      .toLowerCase()
      .replace(/[^a-z0-9\-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    console.log('✅ 정리된 슬러그:', cleanSlug);
    
    if (cleanSlug && cleanSlug.length > 0) {
      console.log('🎉 AI 번역 성공!');
    } else {
      console.log('❌ AI 번역 실패 - 빈 결과');
    }
    
  } catch (error) {
    console.error('❌ AI 번역 오류:', error.message);
    console.error('상세:', error);
  }
})();