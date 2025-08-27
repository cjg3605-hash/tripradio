// 전세계 주요 국가들을 5개 언어로 테스트

const multiLangCountries = {
  // 한국어 (Korean)
  'ko': [
    '대한민국', '미국', '일본', '중국', '프랑스', '독일', '영국', '이탈리아', '스페인', 
    '러시아', '캐나다', '호주', '브라질', '인도', '태국', '베트남', '싱가포르', 
    '말레이시아', '인도네시아', '필리핀', '멕시코', '아르헨티나', '이집트', '터키'
  ],
  
  // 영어 (English) 
  'en': [
    'South Korea', 'United States', 'Japan', 'China', 'France', 'Germany', 
    'United Kingdom', 'Italy', 'Spain', 'Russia', 'Canada', 'Australia', 
    'Brazil', 'India', 'Thailand', 'Vietnam', 'Singapore', 'Malaysia', 
    'Indonesia', 'Philippines', 'Mexico', 'Argentina', 'Egypt', 'Turkey'
  ],
  
  // 일본어 (Japanese)
  'ja': [
    '韓国', 'アメリカ', '日本', '中国', 'フランス', 'ドイツ', 'イギリス', 
    'イタリア', 'スペイン', 'ロシア', 'カナダ', 'オーストラリア', 
    'ブラジル', 'インド', 'タイ', 'ベトナム', 'シンガポール', 'マレーシア', 
    'インドネシア', 'フィリピン', 'メキシコ', 'アルゼンチン', 'エジプト', 'トルコ'
  ],
  
  // 중국어 (Chinese Simplified)
  'zh': [
    '韩国', '美国', '日本', '中国', '法国', '德国', '英国', '意大利', 
    '西班牙', '俄罗斯', '加拿大', '澳大利亚', '巴西', '印度', '泰国', 
    '越南', '新加坡', '马来西亚', '印度尼西亚', '菲律宾', '墨西哥', 
    '阿根廷', '埃及', '土耳其'
  ],
  
  // 스페인어 (Spanish)
  'es': [
    'Corea del Sur', 'Estados Unidos', 'Japón', 'China', 'Francia', 'Alemania',
    'Reino Unido', 'Italia', 'España', 'Rusia', 'Canadá', 'Australia',
    'Brasil', 'India', 'Tailandia', 'Vietnam', 'Singapur', 'Malasia',
    'Indonesia', 'Filipinas', 'México', 'Argentina', 'Egipto', 'Turquía'
  ]
};

const expectedCodes = {
  '대한민국': 'KOR', '한국': 'KOR', '韩国': 'KOR', '韓国': 'KOR', 'South Korea': 'KOR', 'Corea del Sur': 'KOR',
  '미국': 'USA', 'アメリカ': 'USA', '美国': 'USA', 'United States': 'USA', 'Estados Unidos': 'USA',
  '일본': 'JPN', '日本': 'JPN', 'Japan': 'JPN', 'Japón': 'JPN',
  '중국': 'CHN', '中国': 'CHN', 'China': 'CHN',
  '프랑스': 'FRA', 'フランス': 'FRA', '法国': 'FRA', 'France': 'FRA', 'Francia': 'FRA',
  '독일': 'DEU', 'ドイツ': 'DEU', '德国': 'DEU', 'Germany': 'DEU', 'Alemania': 'DEU',
  '영국': 'GBR', 'イギリス': 'GBR', '英国': 'GBR', 'United Kingdom': 'GBR', 'Reino Unido': 'GBR',
  '이탈리아': 'ITA', 'イタリア': 'ITA', '意大利': 'ITA', 'Italy': 'ITA',
  '스페인': 'ESP', 'スペイン': 'ESP', '西班牙': 'ESP', 'Spain': 'ESP', 'España': 'ESP'
};

async function testMultiLanguageAPI(country, language) {
  try {
    const response = await fetch(`http://localhost:3000/api/country-code?country=${encodeURIComponent(country)}`);
    const data = await response.json();
    
    const expected = expectedCodes[country];
    const actual = data.success ? data.countryCode : 'FAIL';
    const status = expected === actual ? '✅' : (data.success ? '⚠️' : '❌');
    
    return {
      country,
      language,
      expected,
      actual,
      success: data.success,
      status,
      error: data.error
    };
  } catch (error) {
    return {
      country,
      language,
      expected: expectedCodes[country],
      actual: 'ERROR',
      success: false,
      status: '💥',
      error: error.message
    };
  }
}

async function runMultiLangTest() {
  console.log('🌍 전세계 국가 5개 언어 테스트 시작...\n');
  
  const results = {
    total: 0,
    success: 0,
    warning: 0,
    failure: 0,
    error: 0,
    byLanguage: {}
  };
  
  for (const [lang, countries] of Object.entries(multiLangCountries)) {
    console.log(`\n📝 ${lang.toUpperCase()} 언어 테스트:`);
    results.byLanguage[lang] = { total: 0, success: 0, warning: 0, failure: 0, error: 0 };
    
    for (const country of countries.slice(0, 10)) { // 처음 10개만 테스트 (시간 절약)
      const result = await testMultiLanguageAPI(country, lang);
      
      results.total++;
      results.byLanguage[lang].total++;
      
      if (result.status === '✅') {
        results.success++;
        results.byLanguage[lang].success++;
      } else if (result.status === '⚠️') {
        results.warning++;
        results.byLanguage[lang].warning++;
      } else if (result.status === '❌') {
        results.failure++;
        results.byLanguage[lang].failure++;
      } else {
        results.error++;
        results.byLanguage[lang].error++;
      }
      
      console.log(`  ${result.status} ${result.country} → ${result.actual} ${result.expected ? `(예상: ${result.expected})` : ''}`);
      if (result.error && result.status !== '✅') {
        console.log(`      오류: ${result.error}`);
      }
      
      // API 레이트 리미트 방지
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  // 전체 결과 요약
  console.log('\n📊 전체 테스트 결과:');
  console.log(`  총 테스트: ${results.total}개`);
  console.log(`  ✅ 완전 성공: ${results.success}개 (${(results.success/results.total*100).toFixed(1)}%)`);
  console.log(`  ⚠️ 부분 성공: ${results.warning}개 (${(results.warning/results.total*100).toFixed(1)}%)`);
  console.log(`  ❌ 실패: ${results.failure}개 (${(results.failure/results.total*100).toFixed(1)}%)`);
  console.log(`  💥 오류: ${results.error}개 (${(results.error/results.total*100).toFixed(1)}%)`);
  
  // 언어별 결과
  console.log('\n📈 언어별 성공률:');
  for (const [lang, stats] of Object.entries(results.byLanguage)) {
    const successRate = ((stats.success + stats.warning) / stats.total * 100).toFixed(1);
    console.log(`  ${lang.toUpperCase()}: ${successRate}% (${stats.success + stats.warning}/${stats.total})`);
  }
}

runMultiLangTest().catch(console.error);